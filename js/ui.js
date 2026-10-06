const UI = {

    /* ----------------------------------------------------------------------
       Navegación
       ---------------------------------------------------------------------- */

    ENLACES_ADMIN: [
        {
            href: 'dashboard.html',
            icono: 'bi-speedometer2',
            texto: 'Panel'
        },
        {
            href: 'mascotas.html',
            icono: 'bi-heart',
            texto: 'Mascotas'
        },
        {
            href: 'productos.html',
            icono: 'bi-box-seam',
            texto: 'Productos'
        },
        {
            href: 'solicitudes.html',
            icono: 'bi-inbox',
            texto: 'Solicitudes'
        },
        {
            href: 'reportes.html',
            icono: 'bi-geo-alt-fill',
            texto: 'Reportes'
        }
    ],


    ENLACES_CLIENTE: [
        {
            href: 'index.html',
            icono: 'bi-grid',
            texto: 'Catálogo'
        },
        {
            href: 'mis-solicitudes.html',
            icono: 'bi-list-check',
            texto: 'Mis solicitudes'
        },
        {
            href: 'perdidas.html',
            icono: 'bi-geo-alt-fill',
            texto: 'Reportar mascota'
        }
    ],


    navbarAdmin(usuario) {

        UI._montarNavbar(
            usuario,
            UI.ENLACES_ADMIN,
            'dashboard.html',
            'Admin'
        );

    },


    navbarCliente(usuario) {

        UI._montarNavbar(
            usuario,
            UI.ENLACES_CLIENTE,
            'index.html',
            ''
        );

    },


    navbarPerdidas(usuario) {

        const admin =
            usuario.rol === 'ADMIN';


        if (admin) {

            const enlaces =
                UI.ENLACES_ADMIN.map(e => {

                    if (e.href === 'reportes.html') {

                        return {
                            ...e,
                            href: '../admin/reportes.html'
                        };

                    }

                    return {
                        ...e,
                        href: '../admin/' + e.href
                    };

                });


            enlaces.push({
                href: 'perdidas.html',
                icono: 'bi-geo-alt-fill',
                texto: 'Reportar mascota'
            });


            UI._montarNavbar(
                usuario,
                enlaces,
                '../admin/dashboard.html',
                'Admin'
            );

            return;
        }


        UI._montarNavbar(
            usuario,
            UI.ENLACES_CLIENTE,
            'index.html',
            ''
        );

    },


    _paginaActual() {

        const partes =
            window.location.pathname.split('/');


        const archivo =
            partes[partes.length - 1];


        return archivo === ''
            ? 'index.html'
            : archivo;

    },


    _iniciales(nombre) {

        const palabras =
            String(nombre || '?')
                .trim()
                .split(/\s+/);


        const primera =
            palabras[0]
                ? palabras[0][0]
                : '?';


        const segunda =
            palabras.length > 1
                ? palabras[palabras.length - 1][0]
                : '';


        return (
            primera + segunda
        ).toUpperCase();

    },


    _montarNavbar(
        usuario,
        enlaces,
        inicio,
        rol
    ) {

        const actual =
            UI._paginaActual();


        const items =
            enlaces
                .map(e => {

                    const activo =
                        e.href === actual
                            ? ' is-active'
                            : '';


                    return `
                        <li>

                            <a
                                class="app-nav__link${activo}"
                                href="${e.href}"
                                ${
                                    activo
                                        ? 'aria-current="page"'
                                        : ''
                                }>

                                <i class="bi ${e.icono}"></i>

                                <span>
                                    ${e.texto}
                                </span>

                            </a>

                        </li>
                    `;

                })
                .join('');


        const insignia =
            rol

                ? `
                    <span class="app-brand__role">
                        ${rol}
                    </span>
                  `

                : '';

        const logoSrc =
        (typeof Auth !== 'undefined' &&
            typeof Auth.raiz === 'function')
            ? Auth.raiz() + 'img/logo.png'
            : './img/logo.png';

        document.getElementById(
            'navbar'
        ).innerHTML = `
        <header
        class="app-header"
        id="appHeader">

        <nav
            class="app-navbar"
            aria-label="Navegación principal">

            <a
                class="app-brand"
                href="${inicio}">

                <span class="app-brand__mark">
                    <img
                        src="${logoSrc}"
                        alt="MascotICA's"
                        class="app-brand__logo">
                </span>

                <span>
                    MascotICA's
                    ${insignia}
                </span>

            </a>

            <button
                class="icon-button app-burger"
                id="btnMenu"
                type="button"
                aria-expanded="false"
                aria-controls="appNav"
                aria-label="Abrir menú">

                <i class="bi bi-list"></i>

            </button>

                    <ul
                        class="app-nav"
                        id="appNav">

                        <span
                            class="app-nav__pill"
                            id="appNavPill"
                            aria-hidden="true">
                        </span>

                        ${items}

                    </ul>


                    <div
                        class="app-navbar__tail">


                        <button
                            class="icon-button"
                            id="btnTema"
                            type="button"
                            aria-label="Cambiar tema">

                            <i class="bi"></i>

                        </button>


                        <span
                            class="app-user"
                            title="${UI.esc(usuario.nombre)}">

                            <span
                                class="app-user__avatar"
                                aria-hidden="true">

                                ${UI.esc(
                                    UI._iniciales(
                                        usuario.nombre
                                    )
                                )}

                            </span>


                            <span
                                class="app-user__name">

                                ${UI.esc(
                                    usuario.nombre
                                )}

                            </span>

                        </span>


                        <button
                            class="icon-button icon-button--danger"
                            id="btnLogout"
                            type="button"
                            aria-label="Cerrar sesión">

                            <i class="bi bi-box-arrow-right"></i>

                        </button>

                    </div>

                </nav>

            </header>

        `;


        document
            .getElementById('btnLogout')
            .addEventListener(
                'click',
                () => UI.logout()
            );


        UI._activarTema();

        UI._activarMenu();

        UI._activarPildora();

        UI._activarScroll();

    },


    /* ----------------------------------------------------------------------
       Píldora del enlace activo
       ---------------------------------------------------------------------- */

    _activarPildora() {

        const nav =
            document.getElementById(
                'appNav'
            );


        const pastilla =
            document.getElementById(
                'appNavPill'
            );


        if (!nav || !pastilla) {
            return;
        }


        const colocar = () => {

            const activo =
                nav.querySelector(
                    '.app-nav__link.is-active'
                );


            if (
                !activo ||
                window.innerWidth < 992
            ) {

                pastilla.classList.remove(
                    'is-ready'
                );

                return;

            }


            pastilla.style.width =
                activo.offsetWidth + 'px';


            pastilla.style.transform =
                `translateX(${activo.offsetLeft}px)`;


            pastilla.classList.add(
                'is-ready'
            );

        };


        colocar();


        if (
            document.fonts &&
            document.fonts.ready
        ) {

            document.fonts.ready.then(
                colocar
            );

        }


        window.addEventListener(
            'resize',
            colocar
        );

    },


    /* ----------------------------------------------------------------------
       Menú móvil
       ---------------------------------------------------------------------- */

    _activarMenu() {

        const boton =
            document.getElementById(
                'btnMenu'
            );


        const nav =
            document.getElementById(
                'appNav'
            );


        if (!boton || !nav) {
            return;
        }


        boton.addEventListener(
            'click',
            () => {

                const abierto =
                    nav.classList.toggle(
                        'is-open'
                    );


                boton.setAttribute(
                    'aria-expanded',
                    String(abierto)
                );


                boton.querySelector(
                    'i'
                ).className = abierto

                    ? 'bi bi-x-lg'

                    : 'bi bi-list';


                boton.setAttribute(
                    'aria-label',

                    abierto
                        ? 'Cerrar menú'
                        : 'Abrir menú'
                );

            }
        );

    },


    /* ----------------------------------------------------------------------
       Scroll
       ---------------------------------------------------------------------- */

    _activarScroll() {

        const cabecera =
            document.getElementById(
                'appHeader'
            );


        if (!cabecera) {
            return;
        }


        let pendiente = false;


        const revisar = () => {

            cabecera.classList.toggle(
                'is-scrolled',
                window.scrollY > 8
            );


            pendiente = false;

        };


        revisar();


        window.addEventListener(
            'scroll',
            () => {

                if (pendiente) {
                    return;
                }


                pendiente = true;


                window.requestAnimationFrame(
                    revisar
                );

            },
            {
                passive: true
            }
        );

    },


    /* ----------------------------------------------------------------------
       Tema
       ---------------------------------------------------------------------- */

    _activarTema() {

        const boton =
            document.getElementById(
                'btnTema'
            );


        if (
            !boton ||
            typeof Tema === 'undefined'
        ) {

            if (boton) {
                boton.remove();
            }

            return;
        }


        const pintar = () => {

            const oscuro =
                Tema.efectivo() === 'dark';


            boton.querySelector(
                'i'
            ).className = oscuro

                ? 'bi bi-sun'

                : 'bi bi-moon-stars';


            boton.setAttribute(
                'aria-label',

                oscuro
                    ? 'Cambiar a tema claro'
                    : 'Cambiar a tema oscuro'
            );

        };


        pintar();


        boton.addEventListener(
            'click',
            () => {

                Tema.alternar();

                pintar();

            }
        );

    },


    /* ----------------------------------------------------------------------
       Logout
       ---------------------------------------------------------------------- */

    async logout() {

        await Auth.logout();

        window.location.href =
            Auth.raiz() + 'login.html';

    },


    /* ----------------------------------------------------------------------
       Avisos
       ---------------------------------------------------------------------- */

    setFlash(
        tipo,
        mensaje
    ) {

        sessionStorage.setItem(
            'ps_flash',

            JSON.stringify({
                tipo,
                mensaje
            })
        );

        const cont =
            document.getElementById(
                'alertas'
            );

        if (cont) {
            UI.mostrarFlash();
        }

    },


    mostrarFlash() {

        const raw =
            sessionStorage.getItem(
                'ps_flash'
            );


        const cont =
            document.getElementById(
                'alertas'
            );


        if (!cont) {
            return;
        }


        if (!raw) {

            cont.innerHTML = '';

            return;

        }


        sessionStorage.removeItem(
            'ps_flash'
        );


        const {
            tipo,
            mensaje
        } = JSON.parse(raw);


        const clase =
            tipo === 'error'
                ? 'alert-danger'
                : 'alert-success';


        const icono =
            tipo === 'error'
                ? 'bi-exclamation-triangle-fill'
                : 'bi-check-circle-fill';


        cont.innerHTML = `

            <div
                class="alert ${clase} alert-dismissible"
                role="status">

                <i class="bi ${icono}"></i>

                <span>
                    ${mensaje}
                </span>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Cerrar">
                </button>

            </div>

        `;


        const aviso =
            cont.querySelector(
                '.alert'
            );


        setTimeout(
            () => {

                if (!aviso.isConnected) {
                    return;
                }


                aviso.style.transition =
                    'opacity .32s, transform .32s';


                aviso.style.opacity =
                    '0';


                aviso.style.transform =
                    'translateY(-.5rem)';


                setTimeout(
                    () => aviso.remove(),
                    340
                );

            },
            6000
        );

    },


    /* ----------------------------------------------------------------------
       Utilidades
       ---------------------------------------------------------------------- */

    esc(texto) {

        const div =
            document.createElement(
                'div'
            );


        div.textContent =
            texto ?? '';


        return div.innerHTML;

    },


    formatoFecha(isoString) {

        const d =
            new Date(
                isoString
            );


        const pad =
            n => String(n).padStart(
                2,
                '0'
            );


        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    },


    imagenOPlaceholder(
        url,
        texto
    ) {

        return (
            url &&
            url.trim() !== ''
        )

            ? url

            : `https://placehold.co/300x200?text=${encodeURIComponent(texto)}`;

    },


    /* ----------------------------------------------------------------------
       Validacion de formularios
       Sistema visual unico: campo obligatorio vacio ->
       borde rojo + foco en el primero + mensaje unico
       (singular o "completa todos").
       Las validaciones de formato (DNI, edad, telefono, fotos...)
       se siguen mostrando aparte, con su propio mensaje especifico.
       ---------------------------------------------------------------------- */

    validarCampos(definiciones) {

        let primerInvalido = null;

        const faltantes = [];


        definiciones.forEach(
            ({ id, etiqueta }) => {

                const el =
                    document.getElementById(
                        id
                    );


                if (!el) {
                    return;
                }


                const valor =
                    (el.value || '').trim();


                const ok =
                    valor !== '';


                el.classList.toggle(
                    'is-invalid',
                    !ok
                );


                if (!ok) {

                    faltantes.push(
                        etiqueta
                    );


                    if (!primerInvalido) {
                        primerInvalido = el;
                    }

                }

            }
        );


        if (primerInvalido) {
            primerInvalido.focus();
        }


        if (faltantes.length === 1) {

            return `Completa el campo ${faltantes[0]}.`;

        }


        if (faltantes.length > 1) {

            return 'Completa todos los campos obligatorios.';

        }


        return null;

    },


    marcarInvalido(
        id,
        esInvalido
    ) {

        const el =
            document.getElementById(
                id
            );


        if (!el) {
            return;
        }


        el.classList.toggle(
            'is-invalid',
            !!esInvalido
        );


        if (esInvalido) {
            el.focus();
        }

    },


    limpiarInvalido(id) {

        const el =
            document.getElementById(
                id
            );


        if (el) {
            el.classList.remove(
                'is-invalid'
            );
        }

    },


    /* Quita el borde rojo de cualquier campo en cuanto el usuario lo toca */

    limpiarAlEscribir(formulario) {

        const form =
            typeof formulario === 'string'

                ? document.querySelector(
                    formulario
                )

                : formulario;


        if (!form) {
            return;
        }


        const limpiar = e => {

            if (
                e.target &&
                e.target.classList
            ) {

                e.target.classList.remove(
                    'is-invalid'
                );

            }

        };


        form.addEventListener(
            'input',
            limpiar
        );


        form.addEventListener(
            'change',
            limpiar
        );

    },


    /* Edad en anos cumplidos a partir de una fecha de nacimiento */

    edadCumplida(
        fechaNacimiento,
        referencia = new Date()
    ) {

        let edad =
            referencia.getFullYear()
            - fechaNacimiento.getFullYear();


        const mes =
            referencia.getMonth()
            - fechaNacimiento.getMonth();


        if (
            mes < 0 ||
            (
                mes === 0 &&
                referencia.getDate()
                < fechaNacimiento.getDate()
            )
        ) {

            edad--;

        }


        return edad;

    }

};