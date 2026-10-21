(() => {
    'use strict';

    const usuario = Auth.requireCliente();

    if (!usuario) return;

    UI.navbarCliente(usuario);
    UI.mostrarFlash();

    const form = document.getElementById('formMatch');
    const progressBar = document.getElementById('matchProgressBar');
    const progressText = document.getElementById('matchProgressText');
    const progressContainer = document.getElementById('matchProgressContainer');
    const formError = document.getElementById('matchFormError');
    const resultsSection = document.getElementById('matchResults');
    const resultsContent = document.getElementById('matchResultsContent');

    const TOTAL_PREGUNTAS = 8;

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    function normalizar(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function obtenerRespuestas() {
        const respuestas = {};

        for (const pregunta of form.querySelectorAll('[data-question]')) {
            const nombre = pregunta.dataset.question;
            const seleccion = form.querySelector(
                `input[name="${nombre}"]:checked`
            );

            respuestas[nombre] = seleccion ? seleccion.value : '';
        }

        return respuestas;
    }

    function actualizarProgreso() {
        const respondidas = Object.values(obtenerRespuestas())
            .filter(Boolean).length;

        const porcentaje = (respondidas / TOTAL_PREGUNTAS) * 100;

        progressBar.style.width = `${porcentaje}%`;
        progressText.textContent =
            `${respondidas} de ${TOTAL_PREGUNTAS} respondidas`;

        progressContainer.setAttribute('aria-valuenow', respondidas);
    }

    form.addEventListener('change', () => {
        actualizarProgreso();
        formError.style.display = 'none';

        form.querySelectorAll('.match-question').forEach(section => {
            section.querySelector('.match-error')?.remove();
        });
    });

    function obtenerTamano(mascota) {
        const tamano = normalizar(mascota.tamano);

        if (!tamano || tamano.includes('desconocido')) return null;
        if (tamano.includes('pequ')) return 'pequeno';
        if (tamano.includes('med')) return 'mediano';

        if (tamano.includes('grand') || tamano.includes('gigante')) {
            return 'grande';
        }

        return null;
    }

    function obtenerActividad(mascota) {
        const actividad = normalizar(mascota.nivelActividad);

        if (!actividad || actividad.includes('desconocido')) return null;

        if (
            actividad.includes('bajo') ||
            actividad.includes('tranquil') ||
            actividad.includes('poco activo') ||
            actividad.includes('poco_activo')
        ) {
            return 'tranquila';
        }

        if (
            actividad.includes('moder') ||
            actividad.includes('medio')
        ) {
            return 'equilibrada';
        }

        if (
            actividad.includes('alto') ||
            actividad.includes('activ') ||
            actividad.includes('energet')
        ) {
            return 'activa';
        }

        return null;
    }

    function interpretarSiNo(valor) {
        const texto = normalizar(valor);

        if (['si', 'true', '1', 'yes'].includes(texto)) return true;
        if (['no', 'false', '0'].includes(texto)) return false;

        return null;
    }

    function obtenerPersonalidades(mascota) {
        let valores = mascota.personalidad;

        if (typeof valores === 'string') {
            try {
                valores = JSON.parse(valores);
            } catch {
                valores = valores.split(',');
            }
        }

        if (!Array.isArray(valores)) return [];

        return valores.map(normalizar).filter(Boolean);
    }

    function calcularEspacio(vivienda, tamano) {
        if (!tamano) return null;

        const tabla = {
            pequeno: {
                pequeno: 100,
                mediano: 75,
                grande: 55
            },
            casa: {
                pequeno: 80,
                mediano: 100,
                grande: 80
            },
            patio: {
                pequeno: 80,
                mediano: 95,
                grande: 100
            }
        };

        return tabla[vivienda]?.[tamano] ?? null;
    }

    function calcularActividad(rutina, actividadMascota) {
        if (!actividadMascota) return null;

        const tabla = {
            tranquila: {
                tranquila: 100,
                equilibrada: 65,
                activa: 30
            },
            equilibrada: {
                tranquila: 75,
                equilibrada: 100,
                activa: 75
            },
            activa: {
                tranquila: 40,
                equilibrada: 75,
                activa: 100
            }
        };

        return tabla[rutina]?.[actividadMascota] ?? null;
    }

    function calcularPersonalidad(preferencia, personalidades) {
        if (!personalidades.length) return null;

        const afinidades = {
            tranquila: [
                'tranquila',
                'carinosa',
                'independiente',
                'poco activa'
            ],
            juegos: [
                'juguetona',
                'energica',
                'curiosa',
                'inteligente'
            ],
            aventuras: [
                'energica',
                'sociable',
                'curiosa',
                'juguetona'
            ],
            familia: [
                'carinosa',
                'sociable',
                'tranquila'
            ]
        };

        const buscadas = afinidades[preferencia] || [];

        if (!buscadas.length) return null;

        const coincidencias = buscadas.filter(caracteristica =>
            personalidades.some(personalidad =>
                personalidad.includes(caracteristica)
            )
        ).length;

        return Math.round((coincidencias / buscadas.length) * 100);
    }

    function calcularCompatibilidad(mascota, respuestas) {
        const componentes = [];

        function agregar(nombre, peso, puntaje) {
            if (puntaje === null || !Number.isFinite(puntaje)) return;

            componentes.push({
                nombre,
                peso,
                puntaje: Math.max(0, Math.min(100, puntaje))
            });
        }

        // El tamaño solo es una orientación general, no una regla
        // que determine si una mascota puede vivir en una vivienda.
        agregar(
            'espacio',
            15,
            calcularEspacio(respuestas.vivienda, obtenerTamano(mascota))
        );

        // Solo se compara la rutina si existe un nivel de actividad
        // reconocido en los datos de la mascota.
        agregar(
            'actividad',
            25,
            calcularActividad(
                respuestas.rutina,
                obtenerActividad(mascota)
            )
        );

        const hayNinos = ['ninos', 'familia'].includes(respuestas.hogar);

        if (hayNinos) {
            const conviveNinos = interpretarSiNo(mascota.conviveNinos);

            if (conviveNinos === true) {
                agregar('convivencia con niños', 25, 100);
            } else if (conviveNinos === false) {
                agregar('convivencia con niños', 25, 0);
            }
            // Si se desconoce, no asumimos que sea compatible.
            // Tampoco lo penalizamos como si se supiera que no convive.
        }

        const hayOtrosAnimales = respuestas.otrosAnimales !== 'ninguno';

        if (hayOtrosAnimales) {
            const conviveMascotas =
                interpretarSiNo(mascota.conviveMascotas);

            if (conviveMascotas === true) {
                agregar('convivencia con otros animales', 25, 100);
            } else if (conviveMascotas === false) {
                agregar('convivencia con otros animales', 25, 0);
            }
            // El dato disponible es general: no confirma
            // compatibilidad específica con perros, gatos u otras especies.
        }

        agregar(
            'personalidad',
            25,
            calcularPersonalidad(
                respuestas.preferencia,
                obtenerPersonalidades(mascota)
            )
        );

        const pesoTotal = componentes.reduce(
            (total, componente) => total + componente.peso,
            0
        );

        if (!pesoTotal) {
            return {
                puntuacion: null,
                componentes: [],
                razones: [
                    'Aún no hay suficientes características registradas para calcular una coincidencia fiable.'
                ]
            };
        }

        const puntuacion = Math.round(
            componentes.reduce(
                (total, componente) =>
                    total + componente.puntaje * componente.peso,
                0
            ) / pesoTotal
        );

        const razones = [];

        const espacio = componentes.find(c => c.nombre === 'espacio');

        if (espacio && espacio.puntaje >= 80) {
            razones.push(
                'El tamaño registrado parece encajar con el espacio que describes.'
            );
        }

        const actividad = componentes.find(c => c.nombre === 'actividad');

        if (actividad && actividad.puntaje >= 75) {
            razones.push(
                'Su nivel de actividad registrado se acerca a tu rutina.'
            );
        }

        const personalidad = componentes.find(c => c.nombre === 'personalidad');

        if (personalidad && personalidad.puntaje >= 50) {
            razones.push(
                'Su personalidad registrada comparte rasgos con lo que buscas.'
            );
        }

        const convivenciaNinos =
            componentes.find(c => c.nombre === 'convivencia con niños');

        if (convivenciaNinos?.puntaje === 100) {
            razones.push(
                'La ficha indica que puede convivir con niños.'
            );
        }

        const convivenciaAnimales =
            componentes.find(c =>
                c.nombre === 'convivencia con otros animales'
            );

        if (convivenciaAnimales?.puntaje === 100) {
            razones.push(
                'La ficha indica que puede convivir con otras mascotas; la presentación debe evaluarse individualmente.'
            );
        }

        if (!razones.length) {
            razones.push(
                'Esta mascota puede ser una opción para conocer mejor. Revisa sus características y necesidades antes de decidir.'
            );
        }

        return { puntuacion, componentes, razones };
    }

    function crearDescripcion(mascota) {
        const detalles = [
            mascota.especie,
            mascota.raza,
            mascota.edad ? `${mascota.edad}` : null,
            mascota.sexo
        ].filter(Boolean);

        return detalles.length
            ? detalles.join(' · ')
            : 'Conoce su ficha para descubrir más sobre ella.';
    }

    function crearTarjeta(mascota, indice, resultado) {
        const id = Number(mascota.idMascota);

        if (!Number.isFinite(id) || id <= 0) return '';

        const nombre = escapeHTML(mascota.nombre || 'Mascota');
        const descripcion = escapeHTML(crearDescripcion(mascota));
        const puntuacion = resultado.puntuacion;

        /*
         * storage.js normalmente devuelve imagenUrl.
         * También aceptamos otros nombres por compatibilidad.
         */
        const posiblesImagenes = [
            mascota.imagenUrl,
            mascota.imagen_url,
            mascota.imageUrl,
            mascota.image_url
        ];

        const imagen = posiblesImagenes.find(
            valor =>
                typeof valor === 'string' &&
                valor.trim() !== ''
        ) || '';

        let imagenSegura = '';

        try {
            const url = new URL(imagen.trim());

            if (
                ['https:', 'http:'].includes(url.protocol) &&
                url.hostname
            ) {
                imagenSegura = escapeHTML(url.href);
            }
        } catch {
            imagenSegura = '';
        }

        const foto = imagenSegura
            ? `<img
                    class="match-pet-image"
                    src="${imagenSegura}"
                    alt="Foto de ${nombre}"
                    loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.hidden=false;">
               <div class="match-pet-placeholder" hidden>
                   <i class="bi bi-heart-fill" aria-hidden="true"></i>
               </div>`
            : `<div class="match-pet-placeholder">
                   <i class="bi bi-heart-fill" aria-hidden="true"></i>
               </div>`;

        const razones = resultado.razones
            .map(razon => `<li>${escapeHTML(razon)}</li>`)
            .join('');

        return `
            <div class="col-12 col-md-6">
                <article class="match-pet-card">
                    <div class="match-pet-image-wrap">
                        ${foto}

                        <span class="match-pet-rank">
                            ${indice === 0
                                ? 'Tu primera coincidencia'
                                : 'Otra gran opción'}
                        </span>
                    </div>

                    <div class="match-pet-body">
                        <h3 class="match-pet-name">${nombre}</h3>
                        <p class="match-pet-description">${descripcion}</p>

                        <div class="match-score-row">
                            <span class="match-score-label">
                                Coincidencia orientativa
                            </span>

                            <span class="match-score">
                                ${puntuacion === null
                                    ? '—'
                                    : `${puntuacion}%`}
                            </span>
                        </div>

                        <div
                            class="match-score-track"
                            role="progressbar"
                            aria-label="Porcentaje orientativo de coincidencia"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow="${puntuacion ?? 0}">

                            <div
                                class="match-score-fill"
                                style="width:${puntuacion ?? 0}%">
                            </div>
                        </div>

                        <h4 class="match-reasons-title">
                            ¿Por qué aparece aquí?
                        </h4>

                        <ul class="match-reasons">${razones}</ul>

                        <button
                            type="button"
                            class="btn btn-match-primary w-100"
                            data-adoptar-id="${id}">
                            <i class="bi bi-heart-fill me-2" aria-hidden="true"></i>
                            Solicitar adopción
                        </button>
                    </div>
                </article>
            </div>`;
    }

    function mostrarResultados(mascotas, respuestas) {
        const evaluadas = mascotas
            .filter(mascota =>
                normalizar(mascota.estado) === 'disponible'
            )
            .map(mascota => ({
                mascota,
                ...calcularCompatibilidad(mascota, respuestas)
            }));

        // Ordenamos por puntuación conocida. Si faltan datos para
        // una mascota, no inventamos un porcentaje para ella.
        evaluadas.sort((a, b) => {
            if (
                a.puntuacion === null &&
                b.puntuacion !== null
            ) {
                return 1;
            }

            if (
                b.puntuacion === null &&
                a.puntuacion !== null
            ) {
                return -1;
            }

            return (b.puntuacion ?? -1) - (a.puntuacion ?? -1);
        });

        const mejores = evaluadas
            .filter(resultado => resultado.puntuacion !== null)
            .slice(0, 2);

        const preparacion = respuestas.preparacion;
        let notaResponsable = '';

        if (preparacion === 'informandome') {
            notaResponsable = `
                <div class="match-note mt-3 mb-0">
                    <i class="bi bi-book-half mt-1" aria-hidden="true"></i>
                    <div>
                        <strong>Un buen siguiente paso:</strong>
                        infórmate sobre alimentación, atención veterinaria,
                        tiempo, gastos y adaptación antes de decidir.
                    </div>
                </div>`;
        } else if (preparacion === 'organizado') {
            notaResponsable = `
                <div class="match-note mt-3 mb-0">
                    <i class="bi bi-list-check mt-1" aria-hidden="true"></i>
                    <div>
                        <strong>Vas por buen camino.</strong>
                        Conversa con quienes compartirán el hogar y prepara
                        un plan de cuidados y gastos.
                    </div>
                </div>`;
        } else {
            notaResponsable = `
                <div class="match-note mt-3 mb-0">
                    <i class="bi bi-heart-fill mt-1" aria-hidden="true"></i>
                    <div>
                        <strong>La preparación también importa.</strong>
                        Confirma que tienes tiempo, apoyo y presupuesto
                        para acompañar a tu mascota a largo plazo.
                    </div>
                </div>`;
        }

        let contenido = `
            <div class="match-results-header">
                <div class="match-intro-icon" aria-hidden="true">
                    <i class="bi bi-stars"></i>
                </div>

                <h2 class="match-section-title">
                    ¡Aquí están tus coincidencias!
                </h2>

                <p class="match-section-subtitle">
                    Estas recomendaciones se basan en las características
                    disponibles en las fichas de nuestras mascotas.
                </p>
            </div>`;

        if (mejores.length) {
            contenido += `
                <div class="row g-3">
                    ${mejores.map((resultado, indice) =>
                        crearTarjeta(
                            resultado.mascota,
                            indice,
                            resultado
                        )
                    ).join('')}
                </div>`;
        } else {
            contenido += `
                <div class="match-empty">
                    <div class="match-empty-icon" aria-hidden="true">
                        <i class="bi bi-search-heart"></i>
                    </div>

                    <h3 class="h5 fw-bold">
                        Todavía no encontramos una coincidencia calculable
                    </h3>

                    <p class="text-secondary">
                        Puede que falten características en las fichas
                        de las mascotas disponibles. Puedes revisar el
                        catálogo completo y conocerlas por tu cuenta.
                    </p>
                </div>`;
        }

        contenido += `
            ${notaResponsable}

            <div class="match-note mt-3">
                <i class="bi bi-info-circle-fill mt-1" aria-hidden="true"></i>
                <div>
                    <strong>Recuerda:</strong>
                    el porcentaje es orientativo, no una garantía de
                    compatibilidad ni una aprobación de adopción.
                    El equipo deberá evaluar cada caso.
                </div>
            </div>

            <div class="match-results-bottom">
                <a href="index.html" class="btn btn-match-primary">
                    <i class="bi bi-search me-2" aria-hidden="true"></i>
                    Prefiero buscar por mi cuenta
                </a>

                <button
                    type="button"
                    id="matchVolverPreguntas"
                    class="btn-match-secondary">
                    <i class="bi bi-arrow-repeat me-1" aria-hidden="true"></i>
                    Cambiar mis respuestas
                </button>
            </div>`;

        resultsContent.innerHTML = contenido;
        resultsSection.hidden = false;

        document.getElementById('matchVolverPreguntas')
            ?.addEventListener('click', () => {
                resultsSection.hidden = true;

                form.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });

        // Conecta con el flujo de adopción que existe
        // en cliente/index.html.
        resultsContent.querySelectorAll('[data-adoptar-id]')
            .forEach(boton => {
                boton.addEventListener('click', () => {
                    const id = boton.dataset.adoptarId;

                    window.location.href =
                        `index.html?adoptar=${encodeURIComponent(id)}`;
                });
            });

        resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const respuestas = obtenerRespuestas();
        const preguntasFaltantes = [];

        form.querySelectorAll('[data-question]').forEach(section => {
            const nombre = section.dataset.question;

            if (!respuestas[nombre]) {
                preguntasFaltantes.push(section);
            }
        });

        if (preguntasFaltantes.length) {
            formError.style.display = 'block';

            preguntasFaltantes[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            preguntasFaltantes[0].querySelector('input')?.focus({
                preventScroll: true
            });

            return;
        }

        const botonEnviar = form.querySelector('button[type="submit"]');
        const textoOriginal = botonEnviar.innerHTML;

        botonEnviar.disabled = true;
        botonEnviar.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Buscando coincidencias...';

        formError.style.display = 'none';
        resultsSection.hidden = true;

        try {
            const mascotas = await Mascotas.listarPorEstado('DISPONIBLE');

            if (!Array.isArray(mascotas)) {
                throw new Error(
                    'No se pudo obtener la lista de mascotas.'
                );
            }

            mostrarResultados(mascotas, respuestas);
        } catch (error) {
            console.error(
                'Error al calcular MascotICA\'s Match:',
                error
            );

            resultsSection.hidden = false;

            resultsContent.innerHTML = `
                <div class="match-empty">
                    <div class="match-empty-icon" aria-hidden="true">
                        <i class="bi bi-exclamation-circle"></i>
                    </div>

                    <h2 class="h5 fw-bold">
                        No pudimos cargar las mascotas
                    </h2>

                    <p class="text-secondary">
                        Inténtalo de nuevo en unos momentos o consulta
                        el catálogo completo.
                    </p>

                    <div class="match-results-bottom">
                        <button
                            type="button"
                            id="matchReintentar"
                            class="btn btn-match-primary">
                            <i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
                            Intentar de nuevo
                        </button>

                        <a href="index.html" class="btn-match-secondary">
                            Ver catálogo
                        </a>
                    </div>
                </div>`;

            document.getElementById('matchReintentar')
                ?.addEventListener('click', () => {
                    form.requestSubmit();
                });

            resultsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } finally {
            botonEnviar.disabled = false;
            botonEnviar.innerHTML = textoOriginal;
        }
    });

    actualizarProgreso();
})();
