const usuario = Auth.usuarioActual();

/* El nombre de contacto solo admite letras (también al pegar) */
Validar.soloLetras('cNombre');

if (!usuario) {
    location.replace('../login.html');
} else {
    iniciar();
}


function iniciar() {

    UI.navbarPerdidas(usuario);
    UI.limpiarAlEscribir('#form');


    const CENTRO = [-14.0678, -75.7286];

    const EMO = {
        perro: '🐶',
        gato: '🐱'
    };

    const COL = {
        perro: 'var(--mint)',
        gato: 'var(--sun)'
    };


    let reportes = [];
    let filtro = 'todos';

    let nuevoId = null;

    let pick = null;
    let pickMarker = null;
    let mapaPick = null;


    const marcadores = new Map();


    /* ============================================================
       MAPA PRINCIPAL
       ============================================================ */

    const mapa = L.map('mapa').setView(CENTRO, 13);

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }
    ).addTo(mapa);


    /* ============================================================
       UTILIDADES
       ============================================================ */

    const hace = iso => {

        const minutos = Math.max(
            1,
            Math.round(
                (Date.now() - new Date(iso)) / 60000
            )
        );

        if (minutos < 60) {
            return `hace ${minutos} min`;
        }

        const horas = Math.round(minutos / 60);

        if (horas < 24) {
            return `hace ${horas} h`;
        }

        const dias = Math.round(horas / 24);

        return dias === 1
            ? 'ayer'
            : `hace ${dias} días`;
    };


    const fotosReporte = r => {

        return [
            r.photo_url_1,
            r.photo_url_2,
            r.photo_url_3
        ].filter(Boolean);
    };


    const primeraFoto = r => {

        const fotos = fotosReporte(r);

        return fotos.length
            ? fotos[0]
            : null;
    };


    const icono = r => {

        return L.divIcon({

            className: 'pata-pin',

            iconSize: [34, 34],

            iconAnchor: [17, 34],

            html: `
                <div
                    class="pata-pin-inner"
                    style="background:${COL[r.species] || 'var(--brand)'}">

                    ${EMO[r.species] || '🐾'}

                </div>
            `
        });
    };


    const visibles = () => {

        if (filtro === 'todos') {
            return reportes;
        }

        return reportes.filter(
            r => r.status === filtro
        );
    };


    /* ============================================================
       POPUP
       ============================================================ */

    const popup = r => {

        const telefono =
            String(r.contact_phone || '')
                .replace(/\D/g, '');

        const codigoPais =
            String(r.contact_phone_country || '')
                .replace(/\D/g, '');

        const telefonoCompleto =
            codigoPais && telefono
                ? `${codigoPais}${telefono}`
                : '';

        const telWhatsApp =
            telefonoCompleto
                ? telefonoCompleto
                : '';

        const foto = primeraFoto(r);

        const estado =
            r.status === 'abandonada'
                ? 'Abandonada'
                : 'Atendida';


        return `
            <div style="min-width:190px">

                ${
                    foto
                        ? `
                            <img
                                src="${UI.esc(foto)}"
                                alt=""
                                style="
                                    width:100%;
                                    height:120px;
                                    object-fit:cover;
                                    border-radius:10px;
                                    margin-bottom:8px;
                                ">
                          `
                        : ''
                }

                <strong>
                    ${UI.esc(r.pet_name)}
                </strong>

                · ${estado}

                <br>

                <span>
                    ${r.species === 'perro' ? '🐶 Perro' : '🐱 Gato'}
                </span>

                <br>

                <span>
                    ${UI.esc(r.zone)}
                </span>

                <br>

                <small>
                    ${UI.esc(r.description)}
                </small>

                <br>

                ${
                    telWhatsApp
                        ? `
                            <a
                                class="btn btn-sm btn-primary-ps mt-2 w-100"
                                target="_blank"
                                rel="noopener"
                                href="https://wa.me/${telWhatsApp}">

                                <i class="bi bi-whatsapp"></i>
                                ${UI.esc(
                                    r.contact_name || 'Contactar'
                                )}

                            </a>
                          `
                        : ''
                }

            </div>
        `;
    };


    /* ============================================================
       PINTAR
       ============================================================ */

    function pintar() {

        const visiblesReportes = visibles();

        document.getElementById('total').textContent =
            reportes.filter(
                r => r.status === 'abandonada'
            ).length;


        document.getElementById('chips').innerHTML = [

            ['todos', 'Todos'],

            ['abandonada', 'Abandonadas'],

            ['atendida', 'Atendidas']

        ]
        .map(([key, texto]) => `

            <button
                class="pp-chip ${filtro === key ? 'on' : ''}"
                data-f="${key}"
                type="button">

                ${texto}

            </button>

        `)
        .join('');


        marcadores.forEach(
            marcador => marcador.remove()
        );

        marcadores.clear();


        visiblesReportes.forEach(r => {

            const marcador = L.marker(
                [r.lat, r.lng],
                {
                    icon: icono(r)
                }
            )
            .addTo(mapa)
            .bindPopup(popup(r));


            marcadores.set(
                r.id,
                marcador
            );

        });


        document.getElementById('lista').innerHTML =
            visiblesReportes.length

                ? visiblesReportes.map(r => {

                    const foto = primeraFoto(r);

                    const estadoClase =
                        r.status === 'abandonada'
                            ? 'abandonada'
                            : 'atendida';

                    const estadoTexto =
                        r.status === 'abandonada'
                            ? 'Abandonada'
                            : 'Atendida';


                    return `

                        <div
                            class="pp-item ${r.id === nuevoId ? 'is-new' : ''}"
                            data-id="${r.id}">

                            ${
                                foto
                                    ? `
                                        <img
                                            src="${UI.esc(foto)}"
                                            loading="lazy"
                                            alt="">
                                      `
                                    : `
                                        <div class="ph">
                                            ${EMO[r.species] || '🐾'}
                                        </div>
                                      `
                            }


                            <div class="min-w-0">

                                <div class="d-flex align-items-center gap-2">

                                    <strong class="fs-5">
                                        ${UI.esc(r.pet_name)}
                                    </strong>

                                    <span class="pp-tag ${estadoClase}">
                                        ${estadoTexto}
                                    </span>

                                </div>


                                <div class="small">

                                    ${
                                        r.species === 'perro'
                                            ? '🐶 Perro'
                                            : '🐱 Gato'
                                    }

                                    ·

                                    ${hace(r.created_at)}

                                    ·

                                    ${UI.esc(r.zone)}

                                </div>


                                <div class="small text-truncate text-muted">

                                    ${UI.esc(r.description)}

                                </div>

                            </div>

                        </div>

                    `;

                }).join('')

                : `

                    <div class="text-center py-4">

                        <i
                            class="bi bi-geo-alt"
                            style="font-size:2rem">
                        </i>

                        <p class="mb-0 mt-2">
                            Todavía no hay reportes.
                        </p>

                    </div>

                `;
    }


    /* ============================================================
       AGREGAR REPORTE
       ============================================================ */

    function agregar(r) {

        const existe = reportes.some(
            x => x.id === r.id
        );

        if (existe) {
            return;
        }

        reportes.unshift(r);

        nuevoId = r.id;

        pintar();


        setTimeout(() => {

            nuevoId = null;

        }, 1800);
    }


    /* ============================================================
       FILTROS
       ============================================================ */

    document
        .getElementById('chips')
        .addEventListener('click', e => {

            const boton =
                e.target.closest('[data-f]');

            if (!boton) {
                return;
            }

            filtro = boton.dataset.f;

            pintar();

        });


    /* ============================================================
       CLICK EN LISTA
       ============================================================ */

    document
        .getElementById('lista')
        .addEventListener('click', e => {

            const item =
                e.target.closest('[data-id]');

            if (!item) {
                return;
            }

            const reporte =
                reportes.find(
                    x => x.id === item.dataset.id
                );

            if (!reporte) {
                return;
            }


            mapa.flyTo(
                [reporte.lat, reporte.lng],
                16
            );


            marcadores
                .get(reporte.id)
                ?.openPopup();


            document
                .getElementById('mapa')
                .scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

        });


    /* ============================================================
       CARGAR REPORTES
       ============================================================ */

    (async () => {

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

            document.getElementById('lista').innerHTML = `
                <div class="alert alert-danger">
                    No pudimos cargar los reportes.
                </div>
            `;

            return;
        }


        reportes = data || [];

        pintar();

    })();


    /* ============================================================
       TIEMPO REAL
       ============================================================ */

    db.channel('pet_reports_live')

        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'pet_reports'
            },
            payload => {

                agregar(payload.new);

            }
        )

        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'pet_reports'
            },
            payload => {

                reportes =
                    reportes.map(r =>
                        r.id === payload.new.id
                            ? payload.new
                            : r
                    );

                pintar();

            }
        )

        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'pet_reports'
            },
            payload => {

                reportes =
                    reportes.filter(
                        r => r.id !== payload.old.id
                    );

                pintar();

            }
        )

        .subscribe();


    /* ============================================================
       MODAL
       ============================================================ */

    const modal =
        new bootstrap.Modal(
            document.getElementById('modalReporte')
        );


    const err = mensaje => {

        document.getElementById('err').textContent =
            mensaje || '';

    };


    /* ============================================================
       FOTOS
       ============================================================ */

    const inputFotos =
        document.getElementById('fotos');

    const previewFotos =
        document.getElementById('previewFotos');

    const TIPOS_FOTO_PERMITIDOS =
        ['image/jpeg', 'image/jpg', 'image/png'];

    const TAMANO_MAX_FOTO =
        5 * 1024 * 1024;

    const fotoEsValida = archivo =>
        TIPOS_FOTO_PERMITIDOS.includes(archivo.type) &&
        archivo.size <= TAMANO_MAX_FOTO;


    inputFotos.addEventListener(
        'change',
        () => {

            previewFotos.innerHTML = '';

            const archivos =
                Array.from(inputFotos.files);


            if (archivos.length > 3) {

                err(
                    'Puedes seleccionar máximo 3 fotos.'
                );

                inputFotos.value = '';

                return;
            }


            const fotoInvalidaPreview =
                archivos.find(a => !fotoEsValida(a));

            if (fotoInvalidaPreview) {

                err(
                    'Cada foto debe ser JPG, JPEG o PNG y pesar como máximo 5 MB.'
                );

                inputFotos.value = '';

                return;
            }


            err('');


            archivos.forEach(archivo => {

                const reader =
                    new FileReader();


                reader.onload = e => {

                    const imagen =
                        document.createElement('img');

                    imagen.src =
                        e.target.result;

                    imagen.alt =
                        'Vista previa';


                    previewFotos.appendChild(
                        imagen
                    );

                };


                reader.readAsDataURL(archivo);

            });

        }
    );


    /* ============================================================
       MAPA DE SELECCIÓN
       ============================================================ */

    const marcar = (lat, lng) => {

        pick = {
            lat,
            lng
        };


        if (pickMarker) {

            pickMarker.setLatLng(
                [lat, lng]
            );

        } else {

            pickMarker =
                L.marker(
                    [lat, lng]
                ).addTo(mapaPick);

        }


        mapaPick.setView(
            [lat, lng],
            Math.max(
                mapaPick.getZoom(),
                16
            )
        );

    };


    document
        .getElementById('btnNuevo')
        .addEventListener(
            'click',
            () => {

                document
                    .getElementById('form')
                    .reset();

                document
                    .querySelectorAll('#form .is-invalid')
                    .forEach(el => el.classList.remove('is-invalid'));

                previewFotos.innerHTML = '';

                pick = null;

                if (pickMarker && mapaPick) {

                    mapaPick.removeLayer(
                        pickMarker
                    );

                }

                pickMarker = null;

                err('');

                modal.show();

            }
        );


    document
        .getElementById('modalReporte')
        .addEventListener(
            'shown.bs.modal',
            () => {

                if (!mapaPick) {

                    mapaPick =
                        L.map(
                            'mapaPick'
                        ).setView(
                            CENTRO,
                            13
                        );


                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            maxZoom: 19,
                            attribution:
                                '© OpenStreetMap'
                        }
                    ).addTo(
                        mapaPick
                    );


                    mapaPick.on(
                        'click',
                        e => {

                            marcar(
                                e.latlng.lat,
                                e.latlng.lng
                            );

                        }
                    );

                }


                mapaPick.invalidateSize();

            }
        );


    /* ============================================================
       GPS
       ============================================================ */

    document
        .getElementById('btnGps')
        .addEventListener(
            'click',
            () => {

                if (!navigator.geolocation) {

                    err(
                        'Tu navegador no permite obtener la ubicación.'
                    );

                    return;
                }


                err(
                    'Obteniendo tu ubicación...'
                );


                navigator.geolocation.getCurrentPosition(

                    position => {

                        marcar(
                            position.coords.latitude,
                            position.coords.longitude
                        );

                        err('');

                    },

                    () => {

                        err(
                            'No pudimos obtener tu ubicación. Toca el mapa.'
                        );

                    },

                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }

                );

            }
        );


    /* ============================================================
       TELEFONO
       ============================================================ */

    const campoTelefono =
        document.getElementById('cTel');

    const selectorPais =
        document.getElementById('cPaisCodigo');

    const maximosTelefono = {
        PE: 9,
        BO: 8,
        CL: 9,
        CO: 10,
        EC: 9,
        AR: 10,
        PY: 9,
        BR: 11,
        MX: 10,
        ES: 9,
        US: 10
    };

    const configurarTelefono = () => {

        const pais =
            selectorPais.value;

        const maximo =
            maximosTelefono[pais] || 14;

        campoTelefono.maxLength =
            maximo;

        campoTelefono.value =
            campoTelefono.value
                .replace(/\D/g, '')
                .slice(0, maximo);

    };

    configurarTelefono();

    selectorPais.addEventListener(
        'change',
        configurarTelefono
    );

    campoTelefono.addEventListener(
        'input',
        () => {

            const pais =
                selectorPais.value;

            const maximo =
                maximosTelefono[pais] || 14;

            campoTelefono.value =
                campoTelefono.value
                    .replace(/\D/g, '')
                    .slice(0, maximo);

        }
    );


    /* ============================================================
       PUBLICAR
       ============================================================ */

    document
        .getElementById('btnPublicar')
        .addEventListener(
            'click',
            async () => {

                err('');


                const mensajeCampos = UI.validarCampos([
                    { id: 'nombre', etiqueta: 'Nombre o referencia' },
                    { id: 'zona', etiqueta: 'Zona o barrio' },
                    { id: 'desc', etiqueta: 'Descripción' },
                    { id: 'cNombre', etiqueta: 'Tu nombre' }
                ]);

                if (mensajeCampos) {
                    err(mensajeCampos);
                    return;
                }


                const nombre =
                    document.getElementById('nombre').value.trim();

                const zona =
                    document.getElementById('zona').value.trim();

                const descripcion =
                    document.getElementById('desc').value.trim();

                const contacto =
                    document.getElementById('cNombre').value.trim();

                const errContacto =
                    Validar.textoLetras(contacto, 'Tu nombre', 2, 100);

                if (errContacto) {
                    UI.marcarInvalido('cNombre', true);
                    err(errContacto);
                    return;
                }

                const telefono =
                    document.getElementById('cTel').value.trim();

                const isoPais =
                    document.getElementById('cPaisCodigo').value;

                const especie =
                    document
                        .getElementById('especie')
                        .value;


                const archivos =
                    Array.from(
                        inputFotos.files
                    );


                /* VALIDACIONES DE FORMATO */

                if (!telefono) {

                    UI.marcarInvalido('cTel', true);
                    err('Deja un teléfono para que puedan contactarte.');
                    return;
                }


                let numeroTelefono = null;

                try {
                    numeroTelefono =
                        libphonenumber.parsePhoneNumberFromString(
                            telefono,
                            isoPais
                        );
                } catch (e) {
                    numeroTelefono = null;
                }

                if (!numeroTelefono || !numeroTelefono.isValid()) {

                    UI.marcarInvalido('cTel', true);
                    err('Ingresa un número de teléfono válido para el país seleccionado.');
                    return;
                }

                UI.marcarInvalido('cTel', false);

                const telefonoNacional =
                    numeroTelefono.nationalNumber;

                const codigoPaisTelefono =
                    numeroTelefono.countryCallingCode;


                if (!pick) {

                    err(
                        'Toca el mapa para marcar la ubicación.'
                    );

                    return;
                }


                if (
                    archivos.length < 1 ||
                    archivos.length > 3
                ) {

                    err(
                        'Debes subir entre 1 y 3 fotos.'
                    );

                    return;
                }


                const fotoInvalidaEnvio =
                    archivos.find(a => !fotoEsValida(a));

                if (fotoInvalidaEnvio) {

                    err(
                        'Cada foto debe ser JPG, JPEG o PNG y pesar como máximo 5 MB.'
                    );

                    return;
                }


                const boton =
                    document.getElementById(
                        'btnPublicar'
                    );


                boton.disabled = true;

                boton.innerHTML =
                    '<span class="spinner-border spinner-border-sm"></span> Publicando...';


                try {

                    const urls = [
                        null,
                        null,
                        null
                    ];


                    /* SUBIR FOTOS */

                    for (
                        let i = 0;
                        i < archivos.length;
                        i++
                    ) {

                        const archivo =
                            archivos[i];


                        if (!fotoEsValida(archivo)) {

                            throw new Error(
                                'Cada foto debe ser JPG, JPEG o PNG y pesar como máximo 5 MB.'
                            );

                        }


                        const extension =
                            (
                                archivo.name
                                    .split('.')
                                    .pop() || 'jpg'
                            )
                            .toLowerCase();


                        const path =
                            `reportes/${crypto.randomUUID()}-${i + 1}.${extension}`;


                        const upload =
                            await db
                                .storage
                                .from('pet-photos')
                                .upload(
                                    path,
                                    archivo,
                                    {
                                        contentType:
                                            archivo.type ||
                                            'image/jpeg'
                                    }
                                );


                        if (upload.error) {
                            throw upload.error;
                        }


                        urls[i] =
                            db
                                .storage
                                .from('pet-photos')
                                .getPublicUrl(path)
                                .data
                                .publicUrl;

                    }


                    /* INSERTAR REPORTE */

                    const {
                        data,
                        error
                    } = await db
                        .from('pet_reports')
                        .insert({

                            pet_name:
                                nombre,

                            species:
                                especie,

                            status:
                                'abandonada',

                            description:
                                descripcion,

                            zone:
                                zona,

                            lat:
                                pick.lat,

                            lng:
                                pick.lng,

                            photo_url_1:
                                urls[0],

                            photo_url_2:
                                urls[1],

                            photo_url_3:
                                urls[2],

                            contact_name:
                                contacto,

                            contact_phone:
                                telefonoNacional,

                            contact_phone_country:
                                codigoPaisTelefono

                        })
                        .select()
                        .single();


                    if (error) {
                        throw error;
                    }


                    agregar(data);

                    modal.hide();


                    mapa.flyTo(
                        [
                            data.lat,
                            data.lng
                        ],
                        16
                    );


                    setTimeout(
                        () => {

                            marcadores
                                .get(data.id)
                                ?.openPopup();

                        },
                        900
                    );


                } catch (e) {

                    console.error(e);

                    err(
                        'No pudimos guardar el reporte. ' +
                        (
                            e.message ||
                            'Inténtalo nuevamente.'
                        )
                    );

                }


                boton.disabled = false;

                boton.innerHTML =
                    '<i class="bi bi-send-fill"></i> Publicar reporte';

            }
        );

}
