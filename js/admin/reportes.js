
const usuario = Auth.requireAdmin();

if (usuario) {
    UI.navbarAdmin(usuario);
    UI.mostrarFlash();
    iniciarReportes();
}

function iniciarReportes() {

    let reportes = [];

    const modal = new bootstrap.Modal(
        document.getElementById('modalDetalle')
    );

    /* ============================================================
       SELECTOR DE MAPAS
       ============================================================ */

    // Se crea dinámicamente para no modificar el HTML existente.
    const modalMapaHTML = `
        <div class="modal fade" id="modalSelectorMapa"
             tabindex="-1" aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-geo-alt-fill"></i>
                            Ver ubicación de la mascota
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar">
                        </button>
                    </div>

                    <div class="modal-body">

                        <p class="text-muted small mb-3"
                           id="selectorMapaDescripcion">
                            Elige cómo quieres consultar la ubicación.
                        </p>

                        <div class="d-grid gap-2">

                            <button type="button"
                                    class="btn btn-outline-primary text-start"
                                    id="btnMapaGoogle">

                                <i class="bi bi-google me-2"></i>
                                Google Maps
                                <i class="bi bi-box-arrow-up-right float-end"></i>
                            </button>

                            <button type="button"
                                    class="btn btn-outline-primary text-start"
                                    id="btnMapaWaze">

                                <i class="bi bi-sign-turn-right me-2"></i>
                                Waze
                                <i class="bi bi-box-arrow-up-right float-end"></i>
                            </button>

                            <button type="button"
                                    class="btn btn-outline-success text-start"
                                    id="btnMapaOSM">

                                <i class="bi bi-map me-2"></i>
                                OpenStreetMap
                                <i class="bi bi-box-arrow-up-right float-end"></i>
                            </button>

                            <button type="button"
                                    class="btn btn-primary-ps text-start"
                                    id="btnMapaInterno">

                                <i class="bi bi-pin-map me-2"></i>
                                Ver dentro de MascotICA's
                            </button>

                        </div>

                        <div id="mapaInternoContenedor"
                             class="mt-3"
                             style="display:none;">

                            <div id="mapaInternoReporte"
                                 style="
                                    width:100%;
                                    height:320px;
                                    border-radius:12px;
                                    z-index:1;
                                 ">
                            </div>

                            <p class="small text-muted mt-2 mb-0">
                                La ubicación señalada corresponde a las
                                coordenadas registradas en el reporte.
                            </p>

                        </div>

                    </div>

                    <div class="modal-footer">

                        <button type="button"
                                class="btn btn-secondary"
                                data-bs-dismiss="modal">
                            Cerrar
                        </button>

                    </div>

                </div>
            </div>

        </div>
    `;

    document.body.insertAdjacentHTML(
        'beforeend',
        modalMapaHTML
    );

    const modalSelectorMapaElemento =
        document.getElementById('modalSelectorMapa');

    const modalSelectorMapa =
        new bootstrap.Modal(modalSelectorMapaElemento);

    let reporteMapaActual = null;
    let mapaInterno = null;
    let marcadorInterno = null;

    /*
     * Comprueba que las coordenadas existan y sean válidas.
     * Evita interpretar valores vacíos como coordenadas 0, 0.
     */
    function coordenadasValidas(r) {

        if (
            !r ||
            r.lat === null ||
            r.lat === undefined ||
            r.lng === null ||
            r.lng === undefined ||
            String(r.lat).trim() === '' ||
            String(r.lng).trim() === ''
        ) {
            return false;
        }

        const lat = Number(r.lat);
        const lng = Number(r.lng);

        return (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
        );
    }

    /*
     * Abre una URL externa en otra pestaña.
     */
    function abrirEnlaceExterno(url) {

        if (!url) {
            return;
        }

        window.open(
            url,
            '_blank',
            'noopener,noreferrer'
        );
    }

    /*
     * Muestra el selector de aplicaciones de mapas.
     * Si se abre desde el modal de detalle, primero cierra ese modal
     * para evitar conflictos entre dos modales de Bootstrap.
     */
    function abrirMapa(id, desdeDetalle = false) {

        const r = reportes.find(
            x => String(x.id) === String(id)
        );

        if (!r) {
            alert('No se encontró el reporte seleccionado.');
            return;
        }

        if (!coordenadasValidas(r)) {

            alert(
                'Este reporte no tiene coordenadas válidas para mostrar el mapa.'
            );

            return;
        }

        reporteMapaActual = r;

        const lat = Number(r.lat);
        const lng = Number(r.lng);

        document.getElementById(
            'selectorMapaDescripcion'
        ).textContent =
            `Ubicación del reporte de ${r.pet_name || 'la mascota'}: ` +
            `${lat.toFixed(6)}, ${lng.toFixed(6)}.`;

        // Cada vez que se abre el selector se oculta el mapa interno.
        document.getElementById(
            'mapaInternoContenedor'
        ).style.display = 'none';

        const detalleElemento =
            document.getElementById('modalDetalle');

        if (
            desdeDetalle &&
            detalleElemento.classList.contains('show')
        ) {

            detalleElemento.addEventListener(
                'hidden.bs.modal',
                function abrirSelectorAlCerrarDetalle() {
                    modalSelectorMapa.show();
                },
                { once: true }
            );

            modal.hide();
            return;
        }

        modalSelectorMapa.show();
    }

    /*
     * Google Maps.
     */
    document.getElementById(
        'btnMapaGoogle'
    ).addEventListener('click', () => {

        if (
            !reporteMapaActual ||
            !coordenadasValidas(reporteMapaActual)
        ) {
            alert('No hay una ubicación válida seleccionada.');
            return;
        }

        const lat = Number(reporteMapaActual.lat);
        const lng = Number(reporteMapaActual.lng);

        const url =
            `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        abrirEnlaceExterno(url);
    });

    /*
     * Waze.
     */
    document.getElementById(
        'btnMapaWaze'
    ).addEventListener('click', () => {

        if (
            !reporteMapaActual ||
            !coordenadasValidas(reporteMapaActual)
        ) {
            alert('No hay una ubicación válida seleccionada.');
            return;
        }

        const lat = Number(reporteMapaActual.lat);
        const lng = Number(reporteMapaActual.lng);

        const url =
            `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;

        abrirEnlaceExterno(url);
    });

    /*
     * OpenStreetMap.
     * Conserva el servicio que ya utilizaba el proyecto.
     */
    document.getElementById(
        'btnMapaOSM'
    ).addEventListener('click', () => {

        if (
            !reporteMapaActual ||
            !coordenadasValidas(reporteMapaActual)
        ) {
            alert('No hay una ubicación válida seleccionada.');
            return;
        }

        const lat = Number(reporteMapaActual.lat);
        const lng = Number(reporteMapaActual.lng);

        const url =
            `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

        abrirEnlaceExterno(url);
    });

    /*
     * Mapa dentro de MascotICA's usando Leaflet.
     */
    document.getElementById(
        'btnMapaInterno'
    ).addEventListener('click', () => {

        if (
            !reporteMapaActual ||
            !coordenadasValidas(reporteMapaActual)
        ) {
            alert('No hay una ubicación válida seleccionada.');
            return;
        }

        // Comprueba que la librería Leaflet esté cargada.
        if (typeof L === 'undefined') {
            alert(
                'No se pudo cargar Leaflet. Comprueba que la librería de mapas esté incluida en admin/reportes.html.'
            );
            return;
        }

        const r = reporteMapaActual;

        const lat = Number(r.lat);
        const lng = Number(r.lng);

        const contenedorMapa = document.getElementById(
            'mapaInternoContenedor'
        );

        contenedorMapa.style.display = 'block';

        if (!mapaInterno) {

            mapaInterno = L.map(
                'mapaInternoReporte'
            ).setView(
                [lat, lng],
                16
            );

            L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 19,
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
                }
            ).addTo(mapaInterno);

            marcadorInterno = L.marker(
                [lat, lng]
            ).addTo(mapaInterno);

        } else {

            mapaInterno.setView(
                [lat, lng],
                16
            );

            marcadorInterno.setLatLng(
                [lat, lng]
            );

        }

        marcadorInterno.bindPopup(
            `<strong>${UI.esc(r.pet_name || 'Mascota reportada')}</strong><br>` +
            `${UI.esc(r.zone || 'Zona no especificada')}`
        ).openPopup();

        /*
         * Leaflet necesita recalcular sus dimensiones cuando el mapa
         * se muestra dentro de un modal.
         */
        setTimeout(() => {

            if (mapaInterno) {
                mapaInterno.invalidateSize();
            }

        }, 150);
    });

    /*
     * Al cerrar el selector se limpia la referencia del reporte.
     * El mapa se conserva para reutilizarlo la próxima vez.
     */
    modalSelectorMapaElemento.addEventListener(
        'hidden.bs.modal',
        () => {

            reporteMapaActual = null;

            document.getElementById(
                'mapaInternoContenedor'
            ).style.display = 'none';

        }
    );

    /* ============================================================
       CARGAR
       ============================================================ */

    async function cargar() {

        const contenedor =
            document.getElementById(
                'contenedorReportes'
            );

        contenedor.innerHTML = `

            <div class="text-center py-5">

                <div
                    class="spinner-border"
                    role="status">
                </div>

                <p class="mt-3 text-muted">
                    Cargando reportes...
                </p>

            </div>

        `;

        const {
            data,
            error
        } = await db
            .from('pet_reports')
            .select('*')
            .order(
                'created_at',
                {
                    ascending: false
                }
            );

        if (error) {

            console.error(error);

            contenedor.innerHTML = `

                <div class="alert alert-danger">

                    <i class="bi bi-exclamation-triangle"></i>

                    No se pudieron cargar los reportes.

                    <br>

                    <small>
                        ${UI.esc(error.message || '')}
                    </small>

                </div>

            `;

            return;
        }

        reportes = data || [];

        actualizarEstadisticas();

        pintar();

    }

    /* ============================================================
       ESTADÍSTICAS
       ============================================================ */

    function actualizarEstadisticas() {

        const abandonadas =
            reportes.filter(
                r => r.status === 'abandonada'
            ).length;

        const atendidas =
            reportes.filter(
                r => r.status === 'atendida'
            ).length;

        document.getElementById(
            'statTotal'
        ).textContent = reportes.length;

        document.getElementById(
            'statAbandonadas'
        ).textContent = abandonadas;

        document.getElementById(
            'statAtendidas'
        ).textContent = atendidas;

    }

    /* ============================================================
       FILTROS
       ============================================================ */

    function filtrados() {

        const buscar =
            document
                .getElementById('buscar')
                .value
                .trim()
                .toLowerCase();

        const estado =
            document
                .getElementById('filtroEstado')
                .value;

        const especie =
            document
                .getElementById('filtroEspecie')
                .value;

        return reportes.filter(r => {

            const texto = [

                r.pet_name,

                r.zone,

                r.contact_name,

                r.contact_phone,

                r.description

            ]
            .join(' ')
            .toLowerCase();

            const coincideBusqueda =
                !buscar ||
                texto.includes(buscar);

            const coincideEstado =
                estado === 'todos' ||
                r.status === estado;

            const coincideEspecie =
                especie === 'todos' ||
                r.species === especie;

            return (
                coincideBusqueda &&
                coincideEstado &&
                coincideEspecie
            );

        });

    }

    /* ============================================================
       PINTAR
       ============================================================ */

    function pintar() {

        const lista = filtrados();

        document.getElementById(
            'cantidadMostrada'
        ).textContent =
            `${lista.length} reporte${lista.length === 1 ? '' : 's'}`;

        const contenedor =
            document.getElementById(
                'contenedorReportes'
            );

        if (!lista.length) {

            contenedor.innerHTML = `

                <div class="card border-0 shadow-sm">

                    <div class="card-body text-center py-5">

                        <i
                            class="bi bi-inbox"
                            style="font-size:3rem">
                        </i>

                        <h5 class="mt-3">
                            No hay reportes para mostrar
                        </h5>

                        <p class="text-muted mb-0">
                            Prueba cambiando los filtros.
                        </p>

                    </div>

                </div>

            `;

            return;

        }

        contenedor.innerHTML = `

            <div class="row g-4">

                ${lista.map(crearTarjeta).join('')}

            </div>

        `;

    }

    /* ============================================================
       TARJETA
       ============================================================ */

    function crearTarjeta(r) {

        const fotos = [

            r.photo_url_1,

            r.photo_url_2,

            r.photo_url_3

        ].filter(Boolean);

        const estadoTexto =
            r.status === 'abandonada'
                ? 'Abandonada'
                : 'Atendida';

        const estadoClase =
            r.status === 'abandonada'
                ? 'bg-danger'
                : 'bg-success';

        const especieTexto =
            r.species === 'perro'
                ? '🐶 Perro'
                : '🐱 Gato';

        const fotoPrincipal =
            fotos[0] || null;

        const telefono =
            String(
                r.contact_phone || ''
            ).replace(/\D/g, '');

        const telefonoWhatsApp =
            /^9\d{8}$/.test(telefono)
                ? `51${telefono}`
                : '';

        return `

            <div class="col-xl-4 col-lg-6">

                <div class="card h-100 border-0 shadow-sm">

                    ${
                        fotoPrincipal

                            ? `

                                <img
                                    src="${UI.esc(fotoPrincipal)}"
                                    alt="${UI.esc(r.pet_name)}"
                                    style="
                                        width:100%;
                                        height:230px;
                                        object-fit:cover;
                                        border-radius:20px 20px 0 0;
                                    ">

                              `

                            : `

                                <div
                                    style="
                                        height:230px;
                                        display:grid;
                                        place-items:center;
                                        background:var(--muted);
                                        border-radius:20px 20px 0 0;
                                        font-size:5rem;
                                    ">

                                    ${r.species === 'perro' ? '🐶' : '🐱'}

                                </div>

                              `
                    }

                    <div class="card-body">

                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">

                            <div>

                                <h5 class="fw-bold mb-1">
                                    ${UI.esc(r.pet_name)}
                                </h5>

                                <div class="small text-muted">
                                    ${especieTexto}
                                </div>

                            </div>

                            <span class="badge ${estadoClase}">
                                ${estadoTexto}
                            </span>

                        </div>

                        <div class="small mb-2">

                            <i class="bi bi-geo-alt"></i>

                            ${UI.esc(r.zone)}

                        </div>

                        <p class="small text-muted mb-3">

                            ${UI.esc(r.description)}

                        </p>

                        <div class="small border-top pt-3 mb-3">

                            <strong>
                                Contacto:
                            </strong>

                            ${UI.esc(r.contact_name)}

                            <br>

                            <strong>
                                Teléfono:
                            </strong>

                            ${UI.esc(r.contact_phone)}

                            <br>

                            <strong>
                                Fecha:
                            </strong>

                            ${UI.formatoFecha(r.created_at)}

                        </div>

                        ${
                            fotos.length > 1

                                ? `

                                    <div class="d-flex gap-2 mb-3">

                                        ${fotos.map(f => `

                                            <img
                                                src="${UI.esc(f)}"
                                                alt=""
                                                style="
                                                    width:60px;
                                                    height:60px;
                                                    object-fit:cover;
                                                    border-radius:10px;
                                                ">

                                        `).join('')}

                                    </div>

                                  `

                                : ''
                        }

                        <div class="d-grid gap-2">

                            ${
                                telefonoWhatsApp
                                    ? `
                                        <a
                                            href="https://wa.me/${telefonoWhatsApp}"
                                            target="_blank"
                                            rel="noopener"
                                            class="btn btn-success">

                                            <i class="bi bi-whatsapp"></i>

                                            Contactar por WhatsApp

                                        </a>
                                      `
                                    : ''
                            }

                            <button
                                type="button"
                                class="btn btn-primary-ps"
                                data-detalle="${r.id}">

                                <i class="bi bi-eye"></i>

                                Ver reporte

                            </button>

                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                data-mapa="${r.id}">

                                <i class="bi bi-map"></i>

                                Ver ubicación

                            </button>

                            ${
                                r.status === 'abandonada'

                                    ? `

                                        <button
                                            type="button"
                                            class="btn btn-success"
                                            data-atender="${r.id}">

                                            <i class="bi bi-check-circle"></i>

                                            Marcar como atendida

                                        </button>

                                      `

                                    : `

                                        <button
                                            type="button"
                                            class="btn btn-outline-danger"
                                            data-reabrir="${r.id}">

                                            <i class="bi bi-arrow-counterclockwise"></i>

                                            Marcar como abandonada

                                        </button>

                                      `
                            }

                        </div>

                    </div>

                </div>

            </div>

        `;

    }

    /* ============================================================
       VER DETALLE
       ============================================================ */

    async function verDetalle(id) {

        const r =
            reportes.find(
                x => String(x.id) === String(id)
            );

        if (!r) {
            return;
        }

        const fotos = [

            r.photo_url_1,

            r.photo_url_2,

            r.photo_url_3

        ].filter(Boolean);

        const estado =
            r.status === 'abandonada'
                ? 'Abandonada'
                : 'Atendida';

        const telefono =
            String(
                r.contact_phone || ''
            ).replace(/\D/g, '');

        const telefonoWhatsApp =
            /^9\d{8}$/.test(telefono)
                ? `51${telefono}`
                : '';

        document.getElementById(
            'detalleTitulo'
        ).textContent =
            `Reporte: ${r.pet_name}`;

        const coordenadasTexto =
            coordenadasValidas(r)
                ? `${Number(r.lat).toFixed(6)}, ${Number(r.lng).toFixed(6)}`
                : 'No disponibles';

        document.getElementById(
            'detalleContenido'
        ).innerHTML = `

            <div class="row g-4">

                <div class="col-lg-7">

                    <div class="row g-2">

                        ${
                            fotos.length

                                ? fotos.map(f => `

                                    <div class="col-md-${fotos.length === 1 ? '12' : '6'}">

                                        <img
                                            src="${UI.esc(f)}"
                                            alt="${UI.esc(r.pet_name)}"
                                            class="w-100"
                                            style="
                                                height:260px;
                                                object-fit:cover;
                                                border-radius:16px;
                                            ">

                                    </div>

                                  `).join('')

                                : `

                                    <div class="col-12">

                                        <div
                                            class="d-flex align-items-center justify-content-center"
                                            style="
                                                height:300px;
                                                background:var(--muted);
                                                border-radius:16px;
                                                font-size:5rem;
                                            ">

                                            ${r.species === 'perro' ? '🐶' : '🐱'}

                                        </div>

                                    </div>

                                  `
                        }

                    </div>

                </div>

                <div class="col-lg-5">

                    <div class="mb-3">

                        <span class="badge ${
                            r.status === 'abandonada'
                                ? 'bg-danger'
                                : 'bg-success'
                        }">

                            ${estado}

                        </span>

                    </div>

                    <h4 class="fw-bold">
                        ${UI.esc(r.pet_name)}
                    </h4>

                    <p>
                        <strong>Especie:</strong>
                        ${
                            r.species === 'perro'
                                ? 'Perro'
                                : 'Gato'
                        }
                    </p>

                    <p>
                        <strong>Zona:</strong>
                        ${UI.esc(r.zone)}
                    </p>

                    <p>
                        <strong>Descripción:</strong><br>
                        ${UI.esc(r.description)}
                    </p>

                    <hr>

                    <p>
                        <strong>Contacto:</strong><br>
                        ${UI.esc(r.contact_name)}
                    </p>

                    <p>
                        <strong>Teléfono:</strong><br>
                        ${UI.esc(r.contact_phone)}
                    </p>

                    ${
                        telefonoWhatsApp
                            ? `
                                <a
                                    href="https://wa.me/${telefonoWhatsApp}"
                                    target="_blank"
                                    rel="noopener"
                                    class="btn btn-success w-100 mb-3">

                                    <i class="bi bi-whatsapp"></i>

                                    Contactar por WhatsApp

                                </a>
                              `
                            : ''
                    }

                    <p>
                        <strong>Fecha del reporte:</strong><br>
                        ${UI.formatoFecha(r.created_at)}
                    </p>

                    <p class="small text-muted">

                        Coordenadas:
                        ${coordenadasTexto}

                    </p>

                    <button
                        type="button"
                        class="btn btn-primary-ps w-100"
                        data-modal-mapa="${r.id}">

                        <i class="bi bi-map"></i>

                        Abrir ubicación

                    </button>

                </div>

            </div>

        `;

        modal.show();

    }

    /* ============================================================
       CAMBIAR ESTADO
       ============================================================ */

    async function cambiarEstado(id, nuevoEstado) {

        const reporte =
            reportes.find(
                r => String(r.id) === String(id)
            );

        if (!reporte) {
            return;
        }

        const texto =
            nuevoEstado === 'atendida'
                ? 'atendida'
                : 'abandonada';

        const confirmar =
            confirm(
                `¿Quieres marcar este reporte como ${texto}?`
            );

        if (!confirmar) {
            return;
        }

        const {
            data,
            error
        } = await db
            .from('pet_reports')
            .update({
                status: nuevoEstado
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {

            console.error(error);

            alert(
                'No se pudo actualizar el reporte: ' +
                error.message
            );

            return;
        }

        reportes =
            reportes.map(r =>
                String(r.id) === String(id)
                    ? data
                    : r
            );

        actualizarEstadisticas();

        pintar();

    }

    /* ============================================================
       EVENTOS
       ============================================================ */

    document
        .getElementById('buscar')
        .addEventListener(
            'input',
            pintar
        );

    document
        .getElementById('filtroEstado')
        .addEventListener(
            'change',
            pintar
        );

    document
        .getElementById('filtroEspecie')
        .addEventListener(
            'change',
            pintar
        );

    document
        .getElementById('btnActualizar')
        .addEventListener(
            'click',
            cargar
        );

    document
        .getElementById('contenedorReportes')
        .addEventListener(
            'click',
            e => {

                const detalle =
                    e.target.closest(
                        '[data-detalle]'
                    );

                if (detalle) {

                    verDetalle(
                        detalle.dataset.detalle
                    );

                    return;
                }

                const mapa =
                    e.target.closest(
                        '[data-mapa]'
                    );

                if (mapa) {

                    abrirMapa(
                        mapa.dataset.mapa
                    );

                    return;
                }

                const atender =
                    e.target.closest(
                        '[data-atender]'
                    );

                if (atender) {

                    cambiarEstado(
                        atender.dataset.atender,
                        'atendida'
                    );

                    return;
                }

                const reabrir =
                    e.target.closest(
                        '[data-reabrir]'
                    );

                if (reabrir) {

                    cambiarEstado(
                        reabrir.dataset.reabrir,
                        'abandonada'
                    );

                }

            }
        );

    document
        .getElementById('detalleContenido')
        .addEventListener(
            'click',
            e => {

                const boton =
                    e.target.closest(
                        '[data-modal-mapa]'
                    );

                if (!boton) {
                    return;
                }

                abrirMapa(
                    boton.dataset.modalMapa,
                    true
                );

            }
        );

    /* ============================================================
       TIEMPO REAL
       ============================================================ */

    db.channel('admin_pet_reports_live')

        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'pet_reports'
            },
            payload => {

                if (payload.eventType === 'INSERT') {

                    reportes.unshift(
                        payload.new
                    );

                }

                if (payload.eventType === 'UPDATE') {

                    reportes =
                        reportes.map(r =>
                            String(r.id) === String(payload.new.id)
                                ? payload.new
                                : r
                        );

                }

                if (payload.eventType === 'DELETE') {

                    reportes =
                        reportes.filter(
                            r => String(r.id) !== String(payload.old.id)
                        );

                }

                actualizarEstadisticas();

                pintar();

            }
        )

        .subscribe();

    /* CARGA INICIAL */

    cargar();

}
