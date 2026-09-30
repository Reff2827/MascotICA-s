const Mascotas = {

    async listar() {

        const { data, error } =
            await db.from('mascotas')
                .select(`
                    idMascota:id_mascota,
                    nombre,
                    especie,
                    raza,
                    edad,
                    sexo,
                    estado,
                    imagenUrl:imagen_url
                `)
                .order('id_mascota');

        if (error) {
            console.error(error);
            return [];
        }

        return data;

    },


    async listarPorEstado(estado) {

        const { data, error } =
            await db.from('mascotas')
                .select(`
                    idMascota:id_mascota,
                    nombre,
                    especie,
                    raza,
                    edad,
                    sexo,
                    estado,
                    imagenUrl:imagen_url
                `)
                .eq('estado', estado)
                .order('id_mascota');

        if (error) {
            console.error(error);
            return [];
        }

        return data;

    },


    async buscarPorId(id) {

        const { data, error } =
            await db.from('mascotas')
                .select(`
                    idMascota:id_mascota,
                    nombre,
                    especie,
                    raza,
                    edad,
                    sexo,
                    estado,
                    imagenUrl:imagen_url
                `)
                .eq('id_mascota', Number(id))
                .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        return data;

    },


    async guardar(mascota) {

        const fila = {

            nombre:
                mascota.nombre,

            especie:
                mascota.especie,

            raza:
                mascota.raza ||
                null,

            edad:
                mascota.edad,

            sexo:
                mascota.sexo ||
                null,

            estado:
                mascota.estado ||
                'DISPONIBLE',

            imagen_url:
                mascota.imagenUrl ||
                null

        };


        const columnas = `
            idMascota:id_mascota,
            nombre,
            especie,
            raza,
            edad,
            sexo,
            estado,
            imagenUrl:imagen_url
        `;


        if (mascota.idMascota) {

            const { data, error } =
                await db.from('mascotas')
                    .update(fila)
                    .eq(
                        'id_mascota',
                        Number(mascota.idMascota)
                    )
                    .select(columnas)
                    .single();


            if (error) {

                console.error(error);

                return null;

            }


            return data;

        }


        const { data, error } =
            await db.from('mascotas')
                .insert(fila)
                .select(columnas)
                .single();


        if (error) {

            console.error(error);

            return null;

        }


        return data;

    },


    async cambiarEstado(
        id,
        nuevoEstado
    ) {

        const { error } =
            await db.from('mascotas')
                .update({
                    estado: nuevoEstado
                })
                .eq(
                    'id_mascota',
                    Number(id)
                );


        if (error) {
            console.error(error);
        }

    },


    async eliminar(id) {

        const { error } =
            await db.from('mascotas')
                .delete()
                .eq(
                    'id_mascota',
                    Number(id)
                );


        if (error) {
            console.error(error);
        }

    }

};



const Productos = {

    async listar() {

        const { data, error } =
            await db.from('productos')
                .select(
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url'
                )
                .order('id_producto');


        if (error) {
            console.error(error);
            return [];
        }


        return data;

    },


    async listarPorCategoria(
        categoria
    ) {

        const { data, error } =
            await db.from('productos')
                .select(
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url'
                )
                .eq(
                    'categoria',
                    categoria
                )
                .order('id_producto');


        if (error) {
            console.error(error);
            return [];
        }


        return data;

    },


    async listarConStock() {

        const { data, error } =
            await db.from('productos')
                .select(
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url'
                )
                .gt(
                    'stock',
                    0
                )
                .order('id_producto');


        if (error) {
            console.error(error);
            return [];
        }


        return data;

    },


    async listarStockBajo(
        umbral = 5
    ) {

        const { data, error } =
            await db.from('productos')
                .select(
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url'
                )
                .lte(
                    'stock',
                    umbral
                )
                .order('stock');


        if (error) {
            console.error(error);
            return [];
        }


        return data;

    },


    async buscarPorId(id) {

        const { data, error } =
            await db.from('productos')
                .select(
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url'
                )
                .eq(
                    'id_producto',
                    Number(id)
                )
                .maybeSingle();


        if (error) {
            console.error(error);
            return null;
        }


        return data;

    },


    async guardar(producto) {

        const fila = {

            nombre:
                producto.nombre,

            categoria:
                producto.categoria,

            precio:
                Number(producto.precio),

            stock:
                Number(producto.stock),

            imagen_url:
                producto.imagenUrl ||
                null

        };


        const columnas =
            'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url';


        if (producto.idProducto) {

            const { data, error } =
                await db.from('productos')
                    .update(fila)
                    .eq(
                        'id_producto',
                        Number(producto.idProducto)
                    )
                    .select(columnas)
                    .single();


            if (error) {

                console.error(error);

                return null;

            }


            return data;

        }


        const { data, error } =
            await db.from('productos')
                .insert(fila)
                .select(columnas)
                .single();


        if (error) {

            console.error(error);

            return null;

        }


        return data;

    },


    async actualizarStock(
        id,
        nuevoStock
    ) {

        const { error } =
            await db.from('productos')
                .update({
                    stock: nuevoStock
                })
                .eq(
                    'id_producto',
                    Number(id)
                );


        if (error) {
            console.error(error);
        }

    },


    async eliminar(id) {

        const { error } =
            await db.from('productos')
                .delete()
                .eq(
                    'id_producto',
                    Number(id)
                );


        if (error) {
            console.error(error);
        }

    }

};



function mapSolicitud(row) {

    return {

        idSolicitud:
            row.idSolicitud,

        idUsuario:
            row.idUsuario,

        nombreUsuario:
            row.perfiles
                ? row.perfiles.nombre
                : 'Usuario eliminado',

        tipo:
            row.tipo,

        refId:
            row.refId,

        cantidad:
            row.cantidad,

        fecha:
            row.fecha,

        estado:
            row.estado,

        dni:
            row.dni || null,

        evaluacion:
            row.evaluacion || null

    };

}



const Solicitudes = {

    async listar() {

        const { data, error } =
            await db.from('solicitudes')
                .select(`
                    idSolicitud:id_solicitud,
                    idUsuario:id_usuario,
                    tipo,
                    refId:ref_id,
                    cantidad,
                    fecha,
                    estado,
                    dni,
                    evaluacion,
                    perfiles(nombre)
                `)
                .order(
                    'fecha',
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(error);

            return [];

        }


        return data.map(
            mapSolicitud
        );

    },


    async listarPorEstado(
        estado
    ) {

        const todas =
            await Solicitudes.listar();

        return todas.filter(
            s => s.estado === estado
        );

    },


    async listarPorUsuario(
        idUsuario
    ) {

        const { data, error } =
            await db.from('solicitudes')
                .select(`
                    idSolicitud:id_solicitud,
                    idUsuario:id_usuario,
                    tipo,
                    refId:ref_id,
                    cantidad,
                    fecha,
                    estado,
                    dni,
                    evaluacion,
                    perfiles(nombre)
                `)
                .eq(
                    'id_usuario',
                    idUsuario
                )
                .order(
                    'fecha',
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(error);

            return [];

        }


        return data.map(
            mapSolicitud
        );

    },


    async buscarPorId(id) {

        const { data, error } =
            await db.from('solicitudes')
                .select(`
                    idSolicitud:id_solicitud,
                    idUsuario:id_usuario,
                    tipo,
                    refId:ref_id,
                    cantidad,
                    fecha,
                    estado,
                    dni,
                    evaluacion,
                    perfiles(nombre)
                `)
                .eq(
                    'id_solicitud',
                    Number(id)
                )
                .maybeSingle();


        if (error) {

            console.error(error);

            return null;

        }


        return data
            ? mapSolicitud(data)
            : null;

    },


    async descripcion(
        solicitud
    ) {

        if (
            solicitud.tipo ===
            'ADOPCION'
        ) {

            const m =
                await Mascotas.buscarPorId(
                    solicitud.refId
                );


            return m
                ? m.nombre +
                    ' (' +
                    m.especie +
                    ')'
                : 'Mascota eliminada';

        }


        const p =
            await Productos.buscarPorId(
                solicitud.refId
            );


        return p
            ? p.nombre
            : 'Producto eliminado';

    },


    async crearSolicitudAdopcion(
        usuario,
        idMascota,
        evaluacion,
        dni
    ) {

        const { error } =
            await db.rpc(
                'solicitar_adopcion',
                {
                    p_id_mascota:
                        Number(idMascota),

                    p_evaluacion:
                        evaluacion || null,

                    p_dni:
                        dni
                }
            );


        if (error) {
            return error.message;
        }


        return null;

    },


    async crearSolicitudCompra(
        usuario,
        idProducto,
        cantidad
    ) {

        const producto =
            await Productos.buscarPorId(
                idProducto
            );


        if (!producto) {
            return 'El producto no existe.';
        }


        cantidad =
            Number(cantidad);


        if (
            !cantidad ||
            cantidad < 1
        ) {

            return 'La cantidad debe ser al menos 1.';

        }


        if (
            producto.stock <
            cantidad
        ) {

            return (
                'No hay stock suficiente (disponible: ' +
                producto.stock +
                ').'
            );

        }


        const { error } =
            await db.from('solicitudes')
                .insert({

                    id_usuario:
                        usuario.idUsuario,

                    tipo:
                        'COMPRA',

                    ref_id:
                        Number(idProducto),

                    cantidad:
                        cantidad

                });


        if (error) {

            console.error(error);

            return 'No se pudo registrar la solicitud.';

        }


        return null;

    },


    async aprobar(
        idSolicitud
    ) {

        const solicitud =
            await Solicitudes.buscarPorId(
                idSolicitud
            );


        if (!solicitud) {
            return 'La solicitud no existe.';
        }


        if (
            solicitud.estado !==
            'PENDIENTE'
        ) {

            return 'Esta solicitud ya fue procesada.';

        }


        if (
            solicitud.tipo ===
            'ADOPCION'
        ) {

            const { error } =
                await db.rpc(
                    'aprobar_adopcion',
                    {
                        p_id_solicitud:
                            Number(idSolicitud)
                    }
                );


            if (error) {

                console.error(error);

                return error.message;

            }


            return null;

        }


        const producto =
            await Productos.buscarPorId(
                solicitud.refId
            );


        if (!producto) {
            return 'El producto ya no existe.';
        }


        if (
            producto.stock <
            solicitud.cantidad
        ) {

            return 'No hay stock suficiente para aprobar esta compra.';

        }


        await Productos.actualizarStock(
            solicitud.refId,
            producto.stock -
                solicitud.cantidad
        );


        const { error } =
            await db.from('solicitudes')
                .update({
                    estado: 'APROBADA'
                })
                .eq(
                    'id_solicitud',
                    Number(idSolicitud)
                );


        if (error) {

            console.error(error);

            return 'No se pudo aprobar la solicitud.';

        }


        return null;

    },


    async rechazar(
        idSolicitud
    ) {

        const solicitud =
            await Solicitudes.buscarPorId(
                idSolicitud
            );


        if (!solicitud) {
            return 'La solicitud no existe.';
        }


        if (
            solicitud.estado !==
            'PENDIENTE'
        ) {

            return 'Esta solicitud ya fue procesada.';

        }


        if (
            solicitud.tipo ===
            'ADOPCION'
        ) {

            const mascota =
                await Mascotas.buscarPorId(
                    solicitud.refId
                );


            if (
                mascota &&
                mascota.estado ===
                    'EN_PROCESO'
            ) {

                await Mascotas.cambiarEstado(
                    solicitud.refId,
                    'DISPONIBLE'
                );

            }

        }


        const { error } =
            await db.from('solicitudes')
                .update({
                    estado: 'RECHAZADA'
                })
                .eq(
                    'id_solicitud',
                    Number(idSolicitud)
                );


        if (error) {

            console.error(error);

            return 'No se pudo rechazar la solicitud.';

        }


        return null;

    }

};



const FichasAdopcion = {

    async buscarPorSolicitud(idSolicitud) {

        const id =
            Number(idSolicitud);


        if (!Number.isInteger(id) || id <= 0) {

            console.error(
                'ID de solicitud invalido:',
                idSolicitud
            );

            return null;

        }


        console.log(
            'Buscando ficha para solicitud:',
            id
        );


        const { data, error } =
            await db.from('fichas_adopcion')
                .select(`
                    id_ficha,
                    codigo,
                    id_solicitud,
                    id_mascota,
                    id_usuario,
                    dni,
                    fecha_adopcion,
                    nombre_mascota,
                    especie,
                    raza,
                    edad,
                    sexo,
                    imagen_url
                `)
                .eq(
                    'id_solicitud',
                    id
                )
                .maybeSingle();


        if (error) {

            console.error(
                'Error al buscar ficha:',
                error
            );

            return null;

        }


        console.log(
            'Ficha encontrada:',
            data
        );


        return data;

    },


    async buscarPorCodigo(codigo) {

        if (!codigo) {

            console.error(
                'Codigo de ficha vacio.'
            );

            return null;

        }


        const { data, error } =
            await db.from('fichas_adopcion')
                .select(`
                    id_ficha,
                    codigo,
                    id_solicitud,
                    id_mascota,
                    id_usuario,
                    dni,
                    fecha_adopcion,
                    nombre_mascota,
                    especie,
                    raza,
                    edad,
                    sexo,
                    imagen_url
                `)
                .eq(
                    'codigo',
                    codigo
                )
                .maybeSingle();


        if (error) {

            console.error(
                'Error al buscar ficha por codigo:',
                error
            );

            return null;

        }


        return data;

    },


    async buscarPerfil(idUsuario) {

        const { data, error } =
            await db.from('perfiles')
                .select('nombre')
                .eq(
                    'id',
                    idUsuario
                )
                .maybeSingle();


        if (error) {

            console.error(error);

            return null;

        }


        return data;

    }

};
