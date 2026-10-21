const usuario = Auth.requireAdmin();

const ESTADOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

let solicitudesActuales = [];

const modalVerEvaluacion = new bootstrap.Modal(
    document.getElementById('modalVerEvaluacion')
);

const ETIQUETAS_EVAL = {
    vivienda: 'Tipo de vivienda',
    espacioAdecuado: 'Espacio adecuado',
    horasDisponibles: 'Horas disponibles al día',
    experienciaPrevia: 'Experiencia previa con mascotas',
    acuerdoHogar: 'Acuerdo de todo el hogar',
    motivo: 'Motivo de la adopción'
};

if (usuario) {
    UI.navbarAdmin(usuario);
    UI.mostrarFlash();
    pintarFiltro();
    pintarTabla();
}

function filtroActivo() {
    return new URLSearchParams(window.location.search).get('estado');
}

function pintarFiltro() {
    const activo = filtroActivo();

    const botones = [
        `<a href="solicitudes.html"
            class="btn btn-sm ${!activo ? 'btn-dark' : 'btn-outline-dark'}">
            Todas
        </a>`
    ].concat(
        ESTADOS.map(estado => `
            <a href="solicitudes.html?estado=${estado}"
               class="btn btn-sm ${activo === estado ? 'btn-dark' : 'btn-outline-dark'}">
                ${estado}
            </a>
        `)
    );

    document.getElementById('filtroEstado').innerHTML = botones.join('');
}

function formatearFechaNacimiento(fecha) {
    if (!fecha) {
        return 'No registrado';
    }

    // Evita cambios de día por conversiones de zona horaria.
    const partes = String(fecha).split('T')[0].split('-');

    if (partes.length !== 3) {
        return UI.esc(fecha);
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarDato(etiqueta, valor) {
    return `
        <div class="mb-3">
            <div class="text-muted small">${etiqueta}</div>
            <div>${UI.esc(valor || 'No registrado')}</div>
        </div>
    `;
}

async function pintarTabla() {
    const tbody = document.getElementById('filasSolicitudes');
    const mensajeVacio = document.getElementById('sinSolicitudes');

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Cargando solicitudes...
            </td>
        </tr>
    `;

    try {
        const activo = filtroActivo();

        const todas = await Solicitudes.listar();

        let solicitudes = todas.filter(
            solicitud => solicitud.tipo === 'ADOPCION'
        );

        if (activo && ESTADOS.includes(activo)) {
            solicitudes = solicitudes.filter(
                solicitud => solicitud.estado === activo
            );
        }

        solicitudesActuales = solicitudes;

        const descripciones = await Promise.all(
            solicitudes.map(solicitud =>
                Solicitudes.descripcion(solicitud)
            )
        );

        mensajeVacio.classList.toggle(
            'd-none',
            solicitudes.length > 0
        );

        if (solicitudes.length === 0) {
            tbody.innerHTML = '';
            return;
        }

        tbody.innerHTML = solicitudes.map((solicitud, i) => `
            <tr>
                <td>${UI.esc(solicitud.idSolicitud)}</td>

                <td>${UI.esc(descripciones[i])}</td>

                <td>${UI.esc(solicitud.nombreUsuario)}</td>

                <td>${UI.formatoFecha(solicitud.fecha)}</td>

                <td>
                    <span class="badge badge-estado-${solicitud.estado}">
                        ${solicitud.estado}
                    </span>
                </td>

                <td class="text-end">
                    <div class="d-flex gap-1 justify-content-end flex-wrap">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            data-id="${UI.esc(solicitud.idSolicitud)}"
                            data-action="ver-evaluacion">
                            <i class="bi bi-clipboard-heart"></i>
                            Evaluación
                        </button>

                        ${solicitud.estado === 'APROBADA' ? `
                            <a
                                class="btn btn-sm btn-outline-primary"
                                href="../cliente/ficha-adopcion.html?id=${encodeURIComponent(solicitud.idSolicitud)}">
                                <i class="bi bi-file-earmark-text"></i>
                                Ver ficha
                            </a>
                        ` : ''}

                        ${solicitud.estado === 'PENDIENTE' ? `
                            <button
                                type="button"
                                class="btn btn-sm btn-success"
                                data-id="${UI.esc(solicitud.idSolicitud)}"
                                data-action="aprobar">
                                <i class="bi bi-check-lg"></i>
                                Aprobar
                            </button>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                data-id="${UI.esc(solicitud.idSolicitud)}"
                                data-action="rechazar">
                                <i class="bi bi-x-lg"></i>
                                Rechazar
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        configurarBotones();

    } catch (error) {
        console.error('Error al cargar solicitudes:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    No se pudieron cargar las solicitudes.
                    Recarga la página e inténtalo nuevamente.
                </td>
            </tr>
        `;

        mensajeVacio.classList.add('d-none');
    }
}

function configurarBotones() {
    const tbody = document.getElementById('filasSolicitudes');

    // Mostrar evaluación y datos del documento.
    tbody.querySelectorAll('[data-action="ver-evaluacion"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const solicitud = solicitudesActuales.find(
                item => String(item.idSolicitud) === btn.dataset.id
            );

            const contenido = document.getElementById('contenidoEvaluacion');

            if (!solicitud) {
                contenido.innerHTML = `
                    <p class="text-danger mb-0">
                        No se encontró la solicitud seleccionada.
                    </p>
                `;

                modalVerEvaluacion.show();
                return;
            }

            let html = `
                <h6 class="fw-bold mb-3">
                    <i class="bi bi-person-vcard"></i>
                    Datos del solicitante
                </h6>

                ${mostrarDato(
                    'Nombre',
                    solicitud.nombreUsuario
                )}

                ${mostrarDato(
                    'Tipo de documento',
                    solicitud.tipoDocumento
                )}

                ${mostrarDato(
                    'Número de documento',
                    solicitud.numeroDocumento
                )}

                ${mostrarDato(
                    'Fecha de nacimiento',
                    formatearFechaNacimiento(solicitud.fechaNacimiento)
                )}

                <hr>

                <h6 class="fw-bold mb-3">
                    <i class="bi bi-clipboard-heart"></i>
                    Evaluación de adopción
                </h6>
            `;

            if (!solicitud.evaluacion) {
                html += `
                    <p class="text-muted mb-0">
                        Esta solicitud no tiene una evaluación registrada.
                    </p>
                `;
            } else {
                html += Object.keys(ETIQUETAS_EVAL).map(clave => `
                    <div class="mb-3">
                        <div class="text-muted small">
                            ${ETIQUETAS_EVAL[clave]}
                        </div>
                        <div>
                            ${UI.esc(
                                solicitud.evaluacion[clave] || 'No especificado'
                            )}
                        </div>
                    </div>
                `).join('');
            }

            contenido.innerHTML = html;
            modalVerEvaluacion.show();
        });
    });

    // Aprobar solicitud.
    tbody.querySelectorAll('[data-action="aprobar"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('¿Deseas aprobar esta solicitud de adopción?')) {
                return;
            }

            btn.disabled = true;

            try {
                const error = await Solicitudes.aprobar(btn.dataset.id);

                UI.setFlash(
                    error ? 'error' : 'exito',
                    error || 'Solicitud de adopción aprobada. La ficha se ha generado.'
                );

                if (!error) {
                    window.location.reload();
                } else {
                    btn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                UI.setFlash('error', 'No se pudo aprobar la solicitud.');
                btn.disabled = false;
            }
        });
    });

    // Rechazar solicitud.
    tbody.querySelectorAll('[data-action="rechazar"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('¿Deseas rechazar esta solicitud de adopción?')) {
                return;
            }

            btn.disabled = true;

            try {
                const error = await Solicitudes.rechazar(btn.dataset.id);

                UI.setFlash(
                    error ? 'error' : 'exito',
                    error || 'Solicitud de adopción rechazada.'
                );

                if (!error) {
                    window.location.reload();
                } else {
                    btn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                UI.setFlash('error', 'No se pudo rechazar la solicitud.');
                btn.disabled = false;
            }
        });
    });
}
