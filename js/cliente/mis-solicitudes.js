const usuario = Auth.requireCliente();

const formatoDinero = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
});

if (usuario) {
    UI.navbarCliente(usuario);
    UI.mostrarFlash();
    cargarPagina();
}

function escapar(valor) {
    return UI.esc(String(valor ?? ''));
}

function fechaHora(valor) {
    if (!valor) return '—';

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) return '—';

    return fecha.toLocaleString('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
}

function dinero(valor) {
    return formatoDinero.format(Number(valor) || 0);
}

function estadoPedido(estado) {
    const etiquetas = {
        PENDIENTE_PAGO: 'Pendiente de pago',
        PAGADO: 'Pagado',
        ENTREGADO: 'Entregado',
        VENCIDO: 'Vencido',
        CANCELADO: 'Cancelado',
        RECHAZADO: 'Rechazado'
    };

    return etiquetas[estado] || estado || 'Sin estado';
}

async function cargarPagina() {
    await Promise.all([
        cargarAdopciones(),
        cargarCompras()
    ]);
}

async function cargarAdopciones() {
    const tbody = document.getElementById('filasSolicitudes');
    const mensajeVacio = document.getElementById('sinSolicitudes');

    try {
        const todas = await Solicitudes.listarPorUsuario(usuario.idUsuario);

        const solicitudes = todas.filter(
            solicitud => solicitud.tipo === 'ADOPCION'
        );

        const descripciones = await Promise.all(
            solicitudes.map(solicitud => Solicitudes.descripcion(solicitud))
        );

        mensajeVacio.classList.toggle(
            'd-none',
            solicitudes.length > 0
        );

        tbody.innerHTML = solicitudes.map((solicitud, i) => `
            <tr>
                <td>
                    <i class="bi bi-heart text-danger me-1"></i>
                    ${escapar(descripciones[i])}
                </td>

                <td>${escapar(fechaHora(solicitud.fecha))}</td>

                <td>
                    <span class="badge badge-estado-${escapar(solicitud.estado)}">
                        ${escapar(solicitud.estado)}
                    </span>
                </td>

                <td>
                    ${solicitud.estado === 'APROBADA' ? `
                        <a
                            href="ficha-adopcion.html?id=${encodeURIComponent(solicitud.idSolicitud)}"
                            class="btn btn-primary-ps btn-sm">
                            <i class="bi bi-file-earmark-text"></i>
                            Ver ficha
                        </a>
                    ` : `
                        <span class="text-muted">Aún no disponible</span>
                    `}
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error al cargar adopciones:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-danger p-3">
                    No se pudieron cargar tus solicitudes de adopción.
                </td>
            </tr>
        `;

        mensajeVacio.classList.add('d-none');
    }
}

async function cargarCompras() {
    const tbody = document.getElementById('filasCompras');
    const mensajeVacio = document.getElementById('sinCompras');

    try {
        const pedidos = await Pedidos.listarPropios();

        mensajeVacio.classList.toggle(
            'd-none',
            pedidos.length > 0
        );

        tbody.innerHTML = pedidos.map(pedido => {
            const tieneBoleta =
                ['PAGADO', 'ENTREGADO'].includes(pedido.estado) &&
                Boolean(pedido.boletaCodigo);

            return `
                <tr>
                    <td>
                        <strong>#${escapar(pedido.idPedido)}</strong>
                    </td>

                    <td>${escapar(fechaHora(pedido.fecha))}</td>

                    <td>${dinero(pedido.total)}</td>

                    <td>
                        <span class="badge ${
                            pedido.estado === 'PAGADO' ||
                            pedido.estado === 'ENTREGADO'
                                ? 'text-bg-success'
                                : 'text-bg-secondary'
                        }">
                            ${escapar(estadoPedido(pedido.estado))}
                        </span>
                    </td>

                    <td>
                        ${tieneBoleta ? `
                            <a
                            href="boleta.html?pedido=${encodeURIComponent(pedido.idPedido)}"
                            class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-receipt"></i>
                            Ver boleta
                            </a>
                        ` : `
                            <span class="text-muted small">
                                No disponible
                            </span>
                        `}
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error al cargar compras:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-danger p-3">
                    No se pudieron cargar tus compras.
                </td>
            </tr>
        `;

        mensajeVacio.classList.add('d-none');
    }
}
