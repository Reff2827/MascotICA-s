const DB_KEYS = {
    usuarios: 'ps_usuarios',
    mascotas: 'ps_mascotas',
    productos: 'ps_productos',
    solicitudes: 'ps_solicitudes',
    seeded: 'ps_seeded'
};

function datosDePrueba() {
return {
usuarios: [
{ idUsuario: 1, nombre: 'Administrador', correo: 'admin@albergue.com', password: 'admin123', rol: 'ADMIN' },
{ idUsuario: 2, nombre: 'Usuario Demo', correo: 'cliente@correo.com', password: '123456', rol: 'CLIENTE' }
],
mascotas: [
{ idMascota: 1, nombre: 'Rocky', especie: 'Perro', raza: 'Pastor Aleman', edad: '1 año', estado: 'DISPONIBLE', imagenUrl: '/img/mascotas/rocky.jpeg' },
{ idMascota: 2, nombre: 'Max', especie: 'Perro', raza: 'Labrador', edad: '3 años', estado: 'DISPONIBLE', imagenUrl: '/img/mascotas/max.jpeg' },
{ idMascota: 3, nombre: 'Toby', especie: 'Perro', raza: 'Siberiano', edad: '2 años', estado: 'EN_PROCESO', imagenUrl: '/img/mascotas/toby.jpg' },
{ idMascota: 4, nombre: 'Luna', especie: 'Gato', raza: 'Persa', edad: '6 meses', estado: 'DISPONIBLE', imagenUrl: '/img/mascotas/luna.jpg' },
{ idMascota: 5, nombre: 'Nala', especie: 'Gato', raza: 'Siamés', edad: '1 año', estado: 'DISPONIBLE', imagenUrl: '/img/mascotas/nala.jpg' }
],
productos: [
{ idProducto: 1, nombre: 'Comida Perro Adulto 3kg', categoria: 'ALIMENTO', precio: 45.00, stock: 20, imagenUrl: '/img/productos/comida-perro.jpg' },
{ idProducto: 2, nombre: 'Comida Gato Adulto 1.5kg', categoria: 'ALIMENTO', precio: 38.50, stock: 12, imagenUrl: '/img/productos/comida-gato.jpg' },
{ idProducto: 3, nombre: 'Snacks de Pollo para Perro', categoria: 'ALIMENTO', precio: 18.90, stock: 25, imagenUrl: '/img/productos/snacks.jpg' },
{ idProducto: 4, nombre: 'Arena Sanitaria para Gato 10kg', categoria: 'HIGIENE', precio: 32.00, stock: 10, imagenUrl: '/img/productos/arena.jpg' },
{ idProducto: 5, nombre: 'Shampoo Antipulgas 500ml', categoria: 'HIGIENE', precio: 25.50, stock: 15, imagenUrl: '/img/productos/shampoo.jpeg' }
],
solicitudes: []
};
}

function initDB() {
    if (localStorage.getItem(DB_KEYS.seeded)) return;
    const seed = datosDePrueba();
    localStorage.setItem(DB_KEYS.usuarios, JSON.stringify(seed.usuarios));
    localStorage.setItem(DB_KEYS.mascotas, JSON.stringify(seed.mascotas));
    localStorage.setItem(DB_KEYS.productos, JSON.stringify(seed.productos));
    localStorage.setItem(DB_KEYS.solicitudes, JSON.stringify(seed.solicitudes));
    localStorage.setItem(DB_KEYS.seeded, '1');
}

function leer(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function escribir(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function siguienteId(lista, campoId) {
    return lista.reduce((max, item) => Math.max(max, item[campoId] || 0), 0) + 1;
}

const Usuarios = {
    listar: () => leer(DB_KEYS.usuarios),
    buscarPorCorreo: (correo) => Usuarios.listar().find(u => u.correo.toLowerCase() === (correo || '').toLowerCase())
};

const Mascotas = {
    listar: () => leer(DB_KEYS.mascotas),
    listarPorEstado: (estado) => Mascotas.listar().filter(m => m.estado === estado),
    buscarPorId: (id) => Mascotas.listar().find(m => m.idMascota === Number(id)),
    guardar: (mascota) => {
        const lista = Mascotas.listar();
        if (mascota.idMascota) {
            const idx = lista.findIndex(m => m.idMascota === Number(mascota.idMascota));
            if (idx >= 0) lista[idx] = { ...lista[idx], ...mascota, idMascota: Number(mascota.idMascota) };
        } else {
            mascota.idMascota = siguienteId(lista, 'idMascota');
            if (!mascota.estado) mascota.estado = 'DISPONIBLE';
            lista.push(mascota);
        }
        escribir(DB_KEYS.mascotas, lista);
        return mascota;
    },
    cambiarEstado: (id, nuevoEstado) => {
        const lista = Mascotas.listar();
        const m = lista.find(x => x.idMascota === Number(id));
        if (m) { m.estado = nuevoEstado; escribir(DB_KEYS.mascotas, lista); }
    },
    eliminar: (id) => {
        escribir(DB_KEYS.mascotas, Mascotas.listar().filter(m => m.idMascota !== Number(id)));
    }
};

const Productos = {
    listar: () => leer(DB_KEYS.productos),
    listarPorCategoria: (categoria) => Productos.listar().filter(p => p.categoria === categoria),
    listarConStock: () => Productos.listar().filter(p => p.stock > 0),
    buscarPorId: (id) => Productos.listar().find(p => p.idProducto === Number(id)),
    guardar: (producto) => {
        const lista = Productos.listar();
        producto.precio = Number(producto.precio);
        producto.stock = Number(producto.stock);
        if (producto.idProducto) {
            const idx = lista.findIndex(p => p.idProducto === Number(producto.idProducto));
            if (idx >= 0) lista[idx] = { ...lista[idx], ...producto, idProducto: Number(producto.idProducto) };
        } else {
            producto.idProducto = siguienteId(lista, 'idProducto');
            lista.push(producto);
        }
        escribir(DB_KEYS.productos, lista);
        return producto;
    },
    actualizarStock: (id, nuevoStock) => {
        const lista = Productos.listar();
        const p = lista.find(x => x.idProducto === Number(id));
        if (p) { p.stock = nuevoStock; escribir(DB_KEYS.productos, lista); }
    },
    eliminar: (id) => {
        escribir(DB_KEYS.productos, Productos.listar().filter(p => p.idProducto !== Number(id)));
    }
};

const Solicitudes = {
    listar: () => leer(DB_KEYS.solicitudes).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    listarPorEstado: (estado) => Solicitudes.listar().filter(s => s.estado === estado),
    listarPorUsuario: (idUsuario) => Solicitudes.listar().filter(s => s.idUsuario === Number(idUsuario)),
    buscarPorId: (id) => leer(DB_KEYS.solicitudes).find(s => s.idSolicitud === Number(id)),

    crear: (solicitud) => {
        const lista = leer(DB_KEYS.solicitudes);
        solicitud.idSolicitud = siguienteId(lista, 'idSolicitud');
        solicitud.fecha = new Date().toISOString();
        solicitud.estado = 'PENDIENTE';
        lista.push(solicitud);
        escribir(DB_KEYS.solicitudes, lista);
        return solicitud;
    },

    descripcion: (solicitud) => {
        if (solicitud.tipo === 'ADOPCION') {
            const m = Mascotas.buscarPorId(solicitud.refId);
            return m ? `${m.nombre} (${m.especie})` : 'Mascota eliminada';
        }
        const p = Productos.buscarPorId(solicitud.refId);
        return p ? p.nombre : 'Producto eliminado';
    },

    crearSolicitudAdopcion: (usuario, idMascota) => {
        const mascota = Mascotas.buscarPorId(idMascota);
        if (!mascota) return 'La mascota no existe.';
        if (mascota.estado !== 'DISPONIBLE') return 'Esa mascota ya no esta disponible.';

        Solicitudes.crear({
            idUsuario: usuario.idUsuario,
            nombreUsuario: usuario.nombre,
            tipo: 'ADOPCION',
            refId: Number(idMascota),
            cantidad: 1
        });
        Mascotas.cambiarEstado(idMascota, 'EN_PROCESO');
        return null;
    },

    crearSolicitudCompra: (usuario, idProducto, cantidad) => {
        const producto = Productos.buscarPorId(idProducto);
        if (!producto) return 'El producto no existe.';
        cantidad = Number(cantidad);
        if (!cantidad || cantidad < 1) return 'La cantidad debe ser al menos 1.';
        if (producto.stock < cantidad) return `No hay stock suficiente (disponible: ${producto.stock}).`;

        Solicitudes.crear({
            idUsuario: usuario.idUsuario,
            nombreUsuario: usuario.nombre,
            tipo: 'COMPRA',
            refId: Number(idProducto),
            cantidad
        });
        return null;
    },

    aprobar: (idSolicitud) => {
        const lista = leer(DB_KEYS.solicitudes);
        const solicitud = lista.find(s => s.idSolicitud === Number(idSolicitud));
        if (!solicitud) return 'La solicitud no existe.';
        if (solicitud.estado !== 'PENDIENTE') return 'Esta solicitud ya fue procesada.';

        if (solicitud.tipo === 'ADOPCION') {
            const mascota = Mascotas.buscarPorId(solicitud.refId);
            if (!mascota) return 'La mascota ya no existe.';
            Mascotas.cambiarEstado(solicitud.refId, 'ADOPTADO');
        } else {
            const producto = Productos.buscarPorId(solicitud.refId);
            if (!producto) return 'El producto ya no existe.';
            if (producto.stock < solicitud.cantidad) return 'No hay stock suficiente para aprobar esta compra.';
            Productos.actualizarStock(solicitud.refId, producto.stock - solicitud.cantidad);
        }
        solicitud.estado = 'APROBADA';
        escribir(DB_KEYS.solicitudes, lista);
        return null;
    },

    rechazar: (idSolicitud) => {
        const lista = leer(DB_KEYS.solicitudes);
        const solicitud = lista.find(s => s.idSolicitud === Number(idSolicitud));
        if (!solicitud) return 'La solicitud no existe.';
        if (solicitud.estado !== 'PENDIENTE') return 'Esta solicitud ya fue procesada.';

        if (solicitud.tipo === 'ADOPCION') {
            const mascota = Mascotas.buscarPorId(solicitud.refId);
            if (mascota && mascota.estado === 'EN_PROCESO') {
                Mascotas.cambiarEstado(solicitud.refId, 'DISPONIBLE');
            }
        }
        solicitud.estado = 'RECHAZADA';
        escribir(DB_KEYS.solicitudes, lista);
        return null;
    }
};

initDB();
