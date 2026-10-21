const usuario =
    Auth.requireAdmin();


const UMBRAL_STOCK_BAJO = 5;


if (usuario) {

    UI.navbarAdmin(usuario);

    UI.mostrarFlash();

    cargarDashboard();

}


async function cargarDashboard() {

    const [
        mascotas,
        productos,
        pendientes,
        stockBajo,
        reportesResultado
    ] = await Promise.all([

        Mascotas.listar(),

        Productos.listar(),

        Solicitudes.listarPorEstado(
            'PENDIENTE'
        ),

        Productos.listarStockBajo(
            UMBRAL_STOCK_BAJO
        ),

        db
            .from('pet_reports')
            .select('*')
            .order(
                'created_at',
                {
                    ascending: false
                }
            )

    ]);


    const reportes =
        reportesResultado.data || [];


    const disponibles =
        mascotas.filter(
            m => m.estado === 'DISPONIBLE'
        ).length;


    const adoptadas =
        mascotas.filter(
            m => m.estado === 'ADOPTADO'
        ).length;


    const abandonados =
        reportes.filter(
            r => r.status === 'abandonada'
        );


    const atendidos =
        reportes.filter(
            r => r.status === 'atendida'
        );


    /* ESTADÍSTICAS */

    document.getElementById(
        'statTotalMascotas'
    ).textContent =
        mascotas.length;


    document.getElementById(
        'statDisponiblesAdoptadas'
    ).textContent =
        `${disponibles} / ${adoptadas}`;


    document.getElementById(
        'statTotalProductos'
    ).textContent =
        productos.length;


    document.getElementById(
        'statSolicitudesPendientes'
    ).textContent =
        pendientes.length;


    document.getElementById(
        'statStockBajo'
    ).textContent =
        stockBajo.length;


    document.getElementById(
        'statReportesAbandonados'
    ).textContent =
        abandonados.length;


    /* ============================================================
       SOLICITUDES
       ============================================================ */

    const contSolicitudes =
        document.getElementById(
            'tablaUltimasSolicitudes'
        );


    if (pendientes.length === 0) {

        contSolicitudes.innerHTML = `

            <p class="text-muted p-3 mb-0">

                No hay solicitudes pendientes
                por el momento.

            </p>

        `;

    } else {

        const filas =
            pendientes
                .map(s => `

                    <tr>

                        <td>
                            ${s.idSolicitud}
                        </td>

                        <td>

                            ${
                                s.tipo === 'ADOPCION'

                                    ? `
                                        <i class="bi bi-heart-fill text-danger"></i>
                                        Adopción
                                      `

                                    : `
                                        <i class="bi bi-cart-fill text-primary"></i>
                                        Compra
                                      `
                            }

                        </td>

                        <td>
                            ${UI.formatoFecha(s.fecha)}
                        </td>

                        <td>

                            <span
                                class="badge badge-estado-${s.estado}">

                                ${s.estado}

                            </span>

                        </td>

                        <td class="text-end">

                            <a
                                href="solicitudes.html"
                                class="btn btn-sm btn-outline-primary">

                                Revisar

                            </a>

                        </td>

                    </tr>

                `)
                .join('');


        contSolicitudes.innerHTML = `

            <table class="table table-hover mb-0">

                <thead class="table-light">

                    <tr>

                        <th>#</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th class="text-end">
                            Acción
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${filas}

                </tbody>

            </table>

        `;

    }


    /* ============================================================
       STOCK
       ============================================================ */

    const contStock =
        document.getElementById(
            'tablaStockBajo'
        );


    if (stockBajo.length === 0) {

        contStock.innerHTML = `

            <p class="text-muted p-3 mb-0">

                Todos los productos tienen
                stock suficiente.

            </p>

        `;

    } else {

        const filasStock =
            stockBajo
                .map(p => `

                    <tr>

                        <td>
                            ${UI.esc(p.nombre)}
                        </td>

                        <td>
                            ${UI.esc(p.categoria)}
                        </td>

                        <td class="text-end">

                            <span
                                class="badge ${
                                    p.stock === 0
                                        ? 'bg-danger'
                                        : 'bg-warning text-dark'
                                }">

                                ${
                                    p.stock === 0
                                        ? 'Agotado'
                                        : p.stock + ' unid.'
                                }

                            </span>

                        </td>

                    </tr>

                `)
                .join('');


        contStock.innerHTML = `

            <table class="table table-hover mb-0">

                <thead class="table-light">

                    <tr>

                        <th>
                            Producto
                        </th>

                        <th>
                            Categoría
                        </th>

                        <th class="text-end">
                            Stock
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${filasStock}

                </tbody>

            </table>

        `;

    }


    /* ============================================================
       RESUMEN REPORTES
       ============================================================ */

    const contReportes =
        document.getElementById(
            'resumenReportes'
        );


    if (!reportes.length) {

        contReportes.innerHTML = `

            <div class="text-center py-3">

                <i
                    class="bi bi-check-circle"
                    style="font-size:2rem">
                </i>

                <p class="mb-0 mt-2 text-muted">

                    No hay reportes registrados.

                </p>

            </div>

        `;

    } else {

        const recientes =
            reportes.slice(0, 5);


        contReportes.innerHTML = `

            <div class="row g-3 mb-3">

                <div class="col-md-4">

                    <div class="border rounded-4 p-3">

                        <div class="small text-muted">
                            Total
                        </div>

                        <div class="fs-3 fw-bold">
                            ${reportes.length}
                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="border rounded-4 p-3">

                        <div class="small text-muted">
                            Abandonadas
                        </div>

                        <div class="fs-3 fw-bold text-danger">
                            ${abandonados.length}
                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="border rounded-4 p-3">

                        <div class="small text-muted">
                            Atendidas
                        </div>

                        <div class="fs-3 fw-bold text-success">
                            ${atendidos.length}
                        </div>

                    </div>

                </div>

            </div>


            <div class="table-responsive">

                <table class="table table-hover align-middle mb-0">

                    <thead class="table-light">

                        <tr>

                            <th>
                                Mascota
                            </th>

                            <th>
                                Especie
                            </th>

                            <th>
                                Zona
                            </th>

                            <th>
                                Estado
                            </th>

                            <th>
                                Fecha
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            recientes
                                .map(r => `

                                    <tr>

                                        <td>
                                            <strong>
                                                ${UI.esc(r.pet_name)}
                                            </strong>
                                        </td>

                                        <td>
                                            ${
                                                r.species === 'perro'
                                                    ? '🐶 Perro'
                                                    : '🐱 Gato'
                                            }
                                        </td>

                                        <td>
                                            ${UI.esc(r.zone)}
                                        </td>

                                        <td>

                                            <span
                                                class="badge ${
                                                    r.status === 'abandonada'
                                                        ? 'bg-danger'
                                                        : 'bg-success'
                                                }">

                                                ${
                                                    r.status === 'abandonada'
                                                        ? 'Abandonada'
                                                        : 'Atendida'
                                                }

                                            </span>

                                        </td>

                                        <td>
                                            ${UI.formatoFecha(r.created_at)}
                                        </td>

                                    </tr>

                                `)
                                .join('')
                        }

                    </tbody>

                </table>

            </div>

        `;

    }

}
