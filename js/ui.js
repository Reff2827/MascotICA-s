const UI = {
    ENLACES_ADMIN: [
        { href: 'index.html', texto: 'Inicio', icono: 'bi-speedometer2' },
        { href: 'mascotas.html', texto: 'Mascotas', icono: 'bi-heart' },
        { href: 'productos.html', texto: 'Productos', icono: 'bi-box-seam' },
        { href: 'solicitudes.html', texto: 'Solicitudes', icono: 'bi-clipboard-check' },
        { href: 'reportes.html', texto: 'Reportes', icono: 'bi-exclamation-triangle' }
    ],

    ENLACES_CLIENTE: [
        { href: 'index.html', texto: 'Catálogo', icono: 'bi-shop' },
        { href: 'mis-solicitudes.html', texto: 'Mis solicitudes', icono: 'bi-clipboard-check' },
        { href: 'perdidas.html', texto: 'Mascotas perdidas', icono: 'bi-geo-alt' }
    ],

    navbarAdmin(usuario) {
        this._montarNavbar(usuario, this.ENLACES_ADMIN, true);
    },

    navbarCliente(usuario) {
        this._montarNavbar(usuario, this.ENLACES_CLIENTE, false);
    },

    navbarPerdidas(usuario) {
        const enlaces = this.ENLACES_CLIENTE.map(item => ({ ...item }));

        if (usuario?.rol === 'ADMIN') {
            this._montarNavbar(usuario, this.ENLACES_ADMIN, true);
            return;
        }

        this._montarNavbar(usuario, enlaces, false);
    },

    _paginaActual() {
        return window.location.pathname.split('/').pop() || 'index.html';
    },

    _iniciales(nombre) {
        const texto = String(nombre || 'Usuario').trim();

        if (!texto) return 'U';

        const partes = texto.split(/\s+/).filter(Boolean);

        if (partes.length === 1) {
            return partes[0].slice(0, 2).toUpperCase();
        }

        return (partes[0][0] + partes[1][0]).toUpperCase();
    },

    _montarNavbar(usuario, enlaces, esAdmin) {
        const navbar = document.getElementById('navbar');

        if (!navbar) return;

        const raiz =
            typeof Auth !== 'undefined' && typeof Auth.raiz === 'function'
                ? Auth.raiz()
                : './';

        const logoSrc = raiz + 'img/logo.png';
        const paginaActual = this._paginaActual();

        const enlacesHtml = enlaces.map(enlace => {
            const activo = paginaActual === enlace.href ? 'active' : '';

            return `
                <li class="nav-item">
                    <a class="nav-link ${activo}" href="${enlace.href}">
                        <i class="bi ${enlace.icono}"></i>
                        <span>${this.esc(enlace.texto)}</span>
                    </a>
                </li>
            `;
        }).join('');

        const nombre = usuario?.nombre || 'Usuario';
        const rol = esAdmin ? 'Administrador' : 'Cliente';

        navbar.innerHTML = `
            <nav class="navbar navbar-expand-lg app-navbar">
                <div class="container-fluid px-3 px-lg-4">

                    <a class="navbar-brand app-brand d-flex align-items-center" href="${enlaces[0]?.href || 'index.html'}">
                        <img
                            src="${logoSrc}"
                            alt="MascotICA's"
                            class="app-brand__logo"
                        >
                        <span class="app-brand__name">MascotICA's</span>
                    </a>

                    <button
                        class="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#menuPrincipal"
                        aria-controls="menuPrincipal"
                        aria-expanded="false"
                        aria-label="Abrir menú">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="menuPrincipal">

                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            ${enlacesHtml}
                        </ul>

                        <div class="d-flex align-items-center gap-2 mt-3 mt-lg-0">

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-secondary"
                                id="btnCambiarTema"
                                aria-label="Cambiar tema">
                                <i class="bi bi-moon-stars"></i>
                            </button>

                            <div class="dropdown">

                                <button
                                    type="button"
                                    class="btn btn-user dropdown-toggle d-flex align-items-center gap-2"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false">

                                    <span class="avatar-usuario">
                                        ${this.esc(this._iniciales(nombre))}
                                    </span>

                                    <span class="d-none d-md-flex flex-column text-start">
                                        <strong>${this.esc(nombre)}</strong>
                                        <small>${this.esc(rol)}</small>
                                    </span>

                                </button>

                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button
                                            type="button"
                                            class="dropdown-item"
                                            id="btnCerrarSesion">
                                            <i class="bi bi-box-arrow-right"></i>
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </ul>

                            </div>

                        </div>

                    </div>

                </div>
            </nav>
        `;

        this._activarPildora();
        this._activarMenu();
        this._activarScroll();
        this._activarTema();

        const btnLogout = document.getElementById('btnCerrarSesion');

        if (btnLogout) {
            btnLogout.addEventListener('click', () => this.logout());
        }
    },

    _activarPildora() {
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelectorAll('.navbar-nav .nav-link')
                    .forEach(item => item.classList.remove('active'));

                link.classList.add('active');
            });
        });
    },

    _activarMenu() {
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const menu = document.getElementById('menuPrincipal');

                if (
                    menu &&
                    menu.classList.contains('show') &&
                    typeof bootstrap !== 'undefined'
                ) {
                    const instancia = bootstrap.Collapse.getInstance(menu);

                    if (instancia) {
                        instancia.hide();
                    }
                }
            });
        });
    },

    _activarScroll() {
        const navbar = document.querySelector('.app-navbar');

        if (!navbar) return;

        const revisar = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        };

        revisar();
        window.addEventListener('scroll', revisar, { passive: true });
    },

    _activarTema() {
        const boton = document.getElementById('btnCambiarTema');

        if (!boton) return;

        const actualizar = () => {
            const oscuro = document.documentElement.dataset.theme === 'dark';

            boton.innerHTML = oscuro
                ? '<i class="bi bi-sun"></i>'
                : '<i class="bi bi-moon-stars"></i>';
        };

        actualizar();

        boton.addEventListener('click', () => {
            if (typeof Theme !== 'undefined' && typeof Theme.toggle === 'function') {
                Theme.toggle();
            } else {
                const actual = document.documentElement.dataset.theme === 'dark';
                document.documentElement.dataset.theme = actual ? 'light' : 'dark';
                localStorage.setItem('tema', actual ? 'light' : 'dark');
            }

            actualizar();
        });
    },

    logout() {
        if (typeof Auth !== 'undefined' && typeof Auth.logout === 'function') {
            Auth.logout();
        }
    },

    setFlash(tipo, mensaje) {
        sessionStorage.setItem(
            'flash',
            JSON.stringify({
                tipo,
                mensaje
            })
        );
    },

    mostrarFlash() {
        const cont = document.getElementById('alertas');

        if (!cont) return;

        const raw = sessionStorage.getItem('flash');

        if (!raw) return;

        sessionStorage.removeItem('flash');

        let flash;

        try {
            flash = JSON.parse(raw);
        } catch {
            return;
        }

        const tipo = flash.tipo === 'exito' ? 'success' : 'danger';

        cont.innerHTML = `
            <div class="container-fluid px-4 pt-3">
                <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                    ${this.esc(flash.mensaje)}
                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Cerrar">
                    </button>
                </div>
            </div>
        `;
    },

    esc(valor) {
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    formatoFecha(fecha) {
        if (!fecha) return '';

        const valor = new Date(fecha);

        if (Number.isNaN(valor.getTime())) return '';

        return valor.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    imagenOPlaceholder(url, nombre = 'Mascota') {
        if (url) return this.esc(url);

        const texto = encodeURIComponent(nombre || 'Mascota');

        return `https://placehold.co/600x400?text=${texto}`;
    },

    validarCampos(definiciones) {
        let primerInvalido = null;
        let cantidadInvalidos = 0;
        let primeraEtiqueta = '';

        definiciones.forEach(def => {
            const campo = document.getElementById(def.id);

            if (!campo) return;

            const valor = String(campo.value ?? '').trim();
            const invalido = !valor;

            this.marcarInvalido(def.id, invalido);

            if (invalido) {
                cantidadInvalidos++;

                if (!primerInvalido) {
                    primerInvalido = campo;
                    primeraEtiqueta = def.etiqueta;
                }
            }
        });

        if (primerInvalido) {
            primerInvalido.focus();

            return cantidadInvalidos === 1
                ? `Completa el campo ${primeraEtiqueta}.`
                : 'Completa todos los campos obligatorios.';
        }

        return '';
    },

    marcarInvalido(id, invalido = true) {
        const campo = typeof id === 'string'
            ? document.getElementById(id)
            : id;

        if (!campo) return;

        campo.classList.toggle('is-invalid', invalido);
        campo.classList.toggle('is-valid', !invalido);
    },

    limpiarInvalido(id) {
        const campo = typeof id === 'string'
            ? document.getElementById(id)
            : id;

        if (!campo) return;

        campo.classList.remove('is-invalid');
    },

    limpiarAlEscribir(selector) {
        const formulario = document.querySelector(selector);

        if (!formulario) return;

        formulario.querySelectorAll('input, select, textarea').forEach(campo => {
            const limpiar = () => {
                if (String(campo.value ?? '').trim()) {
                    campo.classList.remove('is-invalid');
                }
            };

            campo.addEventListener('input', limpiar);
            campo.addEventListener('change', limpiar);
        });
    },

    edadCumplida(fechaNacimiento, referencia = new Date()) {
        const nacimiento = fechaNacimiento instanceof Date
            ? fechaNacimiento
            : new Date(fechaNacimiento);

        const fechaReferencia = referencia instanceof Date
            ? referencia
            : new Date(referencia);

        if (Number.isNaN(nacimiento.getTime())) return 0;

        let edad =
            fechaReferencia.getFullYear() -
            nacimiento.getFullYear();

        const mes =
            fechaReferencia.getMonth() -
            nacimiento.getMonth();

        if (
            mes < 0 ||
            (
                mes === 0 &&
                fechaReferencia.getDate() < nacimiento.getDate()
            )
        ) {
            edad--;
        }

        return edad;
    }
};

const Mascotas = {
    async listar() {
        const { data, error } = await db
            .from('mascotas')
            .select(`
                id_mascota,
                nombre,
                especie,
                raza,
                edad,
                sexo,
                estado,
                imagen_url
            `)
            .order('nombre');

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(m => ({
            idMascota: m.id_mascota,
            nombre: m.nombre,
            especie: m.especie,
            raza: m.raza,
            edad: m.edad,
            sexo: m.sexo,
            estado: m.estado,
            imagenUrl: m.imagen_url
        }));
    },

    async listarPorEstado(estado) {
        const { data, error } = await db
            .from('mascotas')
            .select(`
                id_mascota,
                nombre,
                especie,
                raza,
                edad,
                sexo,
                estado,
                imagen_url
            `)
            .eq('estado', estado)
            .order('nombre');

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(m => ({
            idMascota: m.id_mascota,
            nombre: m.nombre,
            especie: m.especie,
            raza: m.raza,
            edad: m.edad,
            sexo: m.sexo,
            estado: m.estado,
            imagenUrl: m.imagen_url
        }));
    },

    async buscarPorId(id) {
        const { data, error } = await db
            .from('mascotas')
            .select(`
                id_mascota,
                nombre,
                especie,
                raza,
                edad,
                sexo,
                estado,
                imagen_url
            `)
            .eq('id_mascota', id)
            .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        if (!data) return null;

        return {
            idMascota: data.id_mascota,
            nombre: data.nombre,
            especie: data.especie,
            raza: data.raza,
            edad: data.edad,
            sexo: data.sexo,
            estado: data.estado,
            imagenUrl: data.imagen_url
        };
    },

    async guardar(mascota) {
        const payload = {
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza,
            edad: mascota.edad,
            sexo: mascota.sexo,
            estado: mascota.estado,
            imagen_url: mascota.imagenUrl
        };

        if (mascota.idMascota) {
            const { data, error } = await db
                .from('mascotas')
                .update(payload)
                .eq('id_mascota', mascota.idMascota)
                .select()
                .single();

            return {
                data,
                error: error?.message || null
            };
        }

        const { data, error } = await db
            .from('mascotas')
            .insert(payload)
            .select()
            .single();

        return {
            data,
            error: error?.message || null
        };
    },

    async cambiarEstado(id, estado) {
        const { error } = await db
            .from('mascotas')
            .update({ estado })
            .eq('id_mascota', id);

        return error?.message || null;
    },

    async eliminar(id) {
        const { error } = await db
            .from('mascotas')
            .delete()
            .eq('id_mascota', id);

        return error?.message || null;
    }
};

const Productos = {
    async listar() {
        const { data, error } = await db
            .from('productos')
            .select(`
                id_producto,
                nombre,
                categoria,
                precio,
                stock,
                imagen_url
            `)
            .order('nombre');

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(p => ({
            idProducto: p.id_producto,
            nombre: p.nombre,
            categoria: p.categoria,
            precio: Number(p.precio),
            stock: Number(p.stock),
            imagenUrl: p.imagen_url
        }));
    },

    async listarPorCategoria(categoria) {
        const { data, error } = await db
            .from('productos')
            .select(`
                id_producto,
                nombre,
                categoria,
                precio,
                stock,
                imagen_url
            `)
            .eq('categoria', categoria)
            .order('nombre');

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(p => ({
            idProducto: p.id_producto,
            nombre: p.nombre,
            categoria: p.categoria,
            precio: Number(p.precio),
            stock: Number(p.stock),
            imagenUrl: p.imagen_url
        }));
    },

    async listarConStock() {
        const productos = await this.listar();

        return productos.filter(p => p.stock > 0);
    },

    async listarStockBajo(limite = 5) {
        const productos = await this.listar();

        return productos.filter(p => p.stock <= limite);
    },

    async buscarPorId(id) {
        const { data, error } = await db
            .from('productos')
            .select(`
                id_producto,
                nombre,
                categoria,
                precio,
                stock,
                imagen_url
            `)
            .eq('id_producto', id)
            .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        if (!data) return null;

        return {
            idProducto: data.id_producto,
            nombre: data.nombre,
            categoria: data.categoria,
            precio: Number(data.precio),
            stock: Number(data.stock),
            imagenUrl: data.imagen_url
        };
    },

    async guardar(producto) {
        const payload = {
            nombre: producto.nombre,
            categoria: producto.categoria,
            precio: producto.precio,
            stock: producto.stock,
            imagen_url: producto.imagenUrl
        };

        if (producto.idProducto) {
            const { data, error } = await db
                .from('productos')
                .update(payload)
                .eq('id_producto', producto.idProducto)
                .select()
                .single();

            return {
                data,
                error: error?.message || null
            };
        }

        const { data, error } = await db
            .from('productos')
            .insert(payload)
            .select()
            .single();

        return {
            data,
            error: error?.message || null
        };
    },

    async actualizarStock(id, cantidad) {
        const producto = await this.buscarPorId(id);

        if (!producto) {
            return 'Producto no encontrado.';
        }

        const nuevoStock = Number(cantidad);

        if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
            return 'El stock no es válido.';
        }

        const { error } = await db
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id_producto', id);

        return error?.message || null;
    },

    async eliminar(id) {
        const { error } = await db
            .from('productos')
            .delete()
            .eq('id_producto', id);

        return error?.message || null;
    }
};

function mapSolicitud(row) {
    return {
        idSolicitud: row.id_solicitud,
        idUsuario: row.id_usuario,
        nombreUsuario: row.perfiles?.nombre || row.nombre_usuario || '',
        tipo: row.tipo,
        refId: row.ref_id,
        cantidad: row.cantidad,
        fecha: row.fecha,
        estado: row.estado,
        dni: row.dni,
        tipoDocumento: row.tipo_documento,
        numeroDocumento: row.numero_documento,
        fechaNacimiento: row.fecha_nacimiento,
        evaluacion: row.evaluacion
    };
}

const Solicitudes = {
    async listar() {
        const { data, error } = await db
            .from('solicitudes')
            .select(`
                *,
                perfiles (
                    nombre
                )
            `)
            .order('fecha', { ascending: false });

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(mapSolicitud);
    },

    async listarPorEstado(estado) {
        const { data, error } = await db
            .from('solicitudes')
            .select(`
                *,
                perfiles (
                    nombre
                )
            `)
            .eq('estado', estado)
            .order('fecha', { ascending: false });

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(mapSolicitud);
    },

    async listarPorUsuario(idUsuario) {
        const { data, error } = await db
            .from('solicitudes')
            .select(`
                *,
                perfiles (
                    nombre
                )
            `)
            .eq('id_usuario', idUsuario)
            .order('fecha', { ascending: false });

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(mapSolicitud);
    },

    async buscarPorId(id) {
        const { data, error } = await db
            .from('solicitudes')
            .select(`
                *,
                perfiles (
                    nombre
                )
            `)
            .eq('id_solicitud', id)
            .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        return data ? mapSolicitud(data) : null;
    },

    descripcion(solicitud) {
        if (!solicitud) return '';

        if (solicitud.tipo === 'ADOPCION') {
            return `Solicitud de adopción #${solicitud.idSolicitud}`;
        }

        if (solicitud.tipo === 'COMPRA') {
            return `Solicitud de compra #${solicitud.idSolicitud}`;
        }

        return `Solicitud #${solicitud.idSolicitud}`;
    },

    async crearSolicitudAdopcion(
        usuario,
        idMascota,
        evaluacion,
        tipoDocumento,
        numeroDocumento,
        fechaNacimiento
    ) {
        const { error } = await db.rpc('solicitar_adopcion', {
            p_id_mascota: Number(idMascota),
            p_evaluacion: evaluacion,
            p_tipo_documento: tipoDocumento,
            p_numero_documento: numeroDocumento,
            p_fecha_nacimiento: fechaNacimiento
        });

        return error?.message || null;
    },

    async crearSolicitudCompra(usuario, idProducto, cantidad) {
        const producto = await Productos.buscarPorId(idProducto);

        if (!producto) {
            return 'El producto no existe.';
        }

        if (cantidad < 1) {
            return 'La cantidad no es válida.';
        }

        if (producto.stock < cantidad) {
            return `Solo quedan ${producto.stock} unidad(es) disponibles.`;
        }

        const { error } = await db
            .from('solicitudes')
            .insert({
                id_usuario: usuario.id,
                tipo: 'COMPRA',
                ref_id: idProducto,
                cantidad,
                fecha: new Date().toISOString(),
                estado: 'PENDIENTE'
            });

        return error?.message || null;
    },

    async aprobar(solicitud) {
        if (solicitud.tipo === 'ADOPCION') {
            const { data, error } = await db.rpc(
                'aprobar_adopcion',
                {
                    p_id_solicitud: solicitud.idSolicitud
                }
            );

            return {
                data,
                error: error?.message || null
            };
        }

        if (solicitud.tipo === 'COMPRA') {
            const producto = await Productos.buscarPorId(solicitud.refId);

            if (!producto) {
                return {
                    data: null,
                    error: 'El producto ya no existe.'
                };
            }

            if (producto.stock < solicitud.cantidad) {
                return {
                    data: null,
                    error: 'No hay suficiente stock para aprobar la compra.'
                };
            }

            const errorStock = await Productos.actualizarStock(
                producto.idProducto,
                producto.stock - solicitud.cantidad
            );

            if (errorStock) {
                return {
                    data: null,
                    error: errorStock
                };
            }

            const { error } = await db
                .from('solicitudes')
                .update({
                    estado: 'APROBADA'
                })
                .eq('id_solicitud', solicitud.idSolicitud);

            return {
                data: null,
                error: error?.message || null
            };
        }

        return {
            data: null,
            error: 'Tipo de solicitud no válido.'
        };
    },

    async rechazar(solicitud) {
        if (solicitud.tipo === 'ADOPCION') {
            await db
                .from('mascotas')
                .update({
                    estado: 'DISPONIBLE'
                })
                .eq('id_mascota', solicitud.refId)
                .eq('estado', 'EN_PROCESO');
        }

        const { error } = await db
            .from('solicitudes')
            .update({
                estado: 'RECHAZADA'
            })
            .eq('id_solicitud', solicitud.idSolicitud);

        return error?.message || null;
    }
};

const FichasAdopcion = {
    async buscarPorSolicitud(idSolicitud) {
        const { data, error } = await db
            .from('fichas_adopcion')
            .select(`
                id_ficha,
                id_solicitud,
                id_mascota,
                id_usuario,
                dni,
                tipo_documento,
                numero_documento,
                fecha_nacimiento,
                fecha_adopcion,
                nombre_mascota,
                especie,
                raza,
                edad,
                sexo,
                imagen_url
            `)
            .eq('id_solicitud', idSolicitud)
            .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        return data ? {
            idFicha: data.id_ficha,
            idSolicitud: data.id_solicitud,
            idMascota: data.id_mascota,
            idUsuario: data.id_usuario,
            dni: data.dni,
            tipoDocumento: data.tipo_documento,
            numeroDocumento: data.numero_documento,
            fechaNacimiento: data.fecha_nacimiento,
            fechaAdopcion: data.fecha_adopcion,
            nombreMascota: data.nombre_mascota,
            especie: data.especie,
            raza: data.raza,
            edad: data.edad,
            sexo: data.sexo,
            imagenUrl: data.imagen_url
        } : null;
    },

    async buscarPorCodigo(codigo) {
        const { data, error } = await db.rpc(
            'obtener_ficha_publica',
            {
                p_codigo: codigo
            }
        );

        if (error) {
            console.error(error);
            return null;
        }

        if (Array.isArray(data)) {
            return data[0] || null;
        }

        return data || null;
    },

    async buscarPerfil(idUsuario) {
        const { data, error } = await db
            .from('perfiles')
            .select('*')
            .eq('id', idUsuario)
            .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        return data;
    }
};

const Pedidos = {
    async crear(items) {
        const { data, error } = await db.rpc('crear_pedido', {
            p_items: items
        });

        if (error) {
            return {
                idPedido: null,
                error: error.message
            };
        }

        let idPedido = data;

        if (Array.isArray(data)) {
            idPedido = data[0];
        }

        if (typeof data === 'object' && data !== null) {
            idPedido =
                data.id_pedido ??
                data.idPedido ??
                data.id ??
                data;
        }

        return {
            idPedido,
            error: null
        };
    },

    async listarPropios() {
        const { data, error } = await db
            .from('pedidos')
            .select(`
                id_pedido,
                fecha,
                total,
                estado,
                vence_en,
                numero_boleta
            `)
            .order('fecha', { ascending: false });

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(p => ({
            idPedido: p.id_pedido,
            fecha: p.fecha,
            total: Number(p.total),
            estado: p.estado,
            venceEn: p.vence_en,
            numeroBoleta: p.numero_boleta
        }));
    },

    async buscarPorId(idPedido) {
        const { data, error } = await db
            .from('pedidos')
            .select(`
                id_pedido,
                fecha,
                total,
                estado,
                vence_en,
                numero_boleta
            `)
            .eq('id_pedido', idPedido)
            .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        if (!data) return null;

        return {
            idPedido: data.id_pedido,
            fecha: data.fecha,
            total: Number(data.total),
            estado: data.estado,
            venceEn: data.vence_en,
            numeroBoleta: data.numero_boleta
        };
    }
};