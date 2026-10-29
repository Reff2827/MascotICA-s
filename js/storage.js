const PERSONALIDADES_MASCOTA = [
    'Tranquila',
    'Juguetona',
    'Cariñosa',
    'Sociable',
    'Independiente',
    'Curiosa',
    'Protectora',
    'Tímida',
    'Enérgica',
    'Inteligente',
    'Comunicativa',
    'Poco activa'
];


function normalizarPersonalidadEntrada(personalidad) {

    if (!personalidad) {
        return [];
    }

    let caracteristicas = personalidad;

    if (typeof personalidad === 'string') {

        try {

            const resultado = JSON.parse(personalidad);

            if (Array.isArray(resultado)) {
                caracteristicas = resultado;
            } else {
                caracteristicas = [personalidad];
            }

        } catch {

            caracteristicas = [personalidad];

        }

    }

    if (!Array.isArray(caracteristicas)) {
        return [];
    }

    return [
        ...new Set(
            caracteristicas.filter(
                caracteristica =>
                    typeof caracteristica === 'string' &&
                    PERSONALIDADES_MASCOTA.includes(
                        caracteristica
                    )
            )
        )
    ];

}


function normalizarPersonalidadSalida(personalidad) {

    if (!personalidad) {
        return [];
    }

    if (Array.isArray(personalidad)) {
        return normalizarPersonalidadEntrada(personalidad);
    }

    if (typeof personalidad !== 'string') {
        return [];
    }

    try {

        const resultado = JSON.parse(personalidad);

        if (Array.isArray(resultado)) {
            return normalizarPersonalidadEntrada(resultado);
        }

    } catch {

        // Permite manejar registros antiguos que guardaban texto libre.

    }

    return [personalidad];

}


function mapMascota(row) {

    if (!row) {
        return row;
    }

    return {
        ...row,
        personalidad: normalizarPersonalidadSalida(
            row.personalidad
        )
    };

}



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
                    imagenUrl:imagen_url,
                    tamano,
                    nivelActividad:nivel_actividad,
                    personalidad,
                    conviveNinos:convive_ninos,
                    conviveMascotas:convive_mascotas
                `)
                .order('id_mascota');

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(mapMascota);

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
                    imagenUrl:imagen_url,
                    tamano,
                    nivelActividad:nivel_actividad,
                    personalidad,
                    conviveNinos:convive_ninos,
                    conviveMascotas:convive_mascotas
                `)
                .eq('estado', estado)
                .order('id_mascota');

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(mapMascota);

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
                    imagenUrl:imagen_url,
                    tamano,
                    nivelActividad:nivel_actividad,
                    personalidad,
                    conviveNinos:convive_ninos,
                    conviveMascotas:convive_mascotas
                `)
                .eq('id_mascota', Number(id))
                .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        return data ? mapMascota(data) : null;

    },


    async guardar(mascota) {

        const personalidades =
            normalizarPersonalidadEntrada(
                mascota.personalidad
            );

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
                null,

            tamano:
                mascota.tamano ||
                null,

            nivel_actividad:
                mascota.nivelActividad ||
                null,

            personalidad:
                JSON.stringify(personalidades),

            convive_ninos:
                mascota.conviveNinos ||
                'DESCONOCIDO',

            convive_mascotas:
                mascota.conviveMascotas ||
                'DESCONOCIDO'

        };


        const columnas = `
            idMascota:id_mascota,
            nombre,
            especie,
            raza,
            edad,
            sexo,
            estado,
            imagenUrl:imagen_url,
            tamano,
            nivelActividad:nivel_actividad,
            personalidad,
            conviveNinos:convive_ninos,
            conviveMascotas:convive_mascotas
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


            return mapMascota(data);

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


        return mapMascota(data);

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
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url, activo, especiesRecomendadas:especies_recomendadas, edadesRecomendadas:edades_recomendadas, tamanosRecomendados:tamanos_recomendados, actividadesRecomendadas:actividades_recomendadas'
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
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url, activo, especiesRecomendadas:especies_recomendadas, edadesRecomendadas:edades_recomendadas, tamanosRecomendados:tamanos_recomendados, actividadesRecomendadas:actividades_recomendadas'
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
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url, activo, especiesRecomendadas:especies_recomendadas, edadesRecomendadas:edades_recomendadas, tamanosRecomendados:tamanos_recomendados, actividadesRecomendadas:actividades_recomendadas'
                )
                .gt(
                    'stock',
                    0
                )
                .eq('activo', true)
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
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url, activo, especiesRecomendadas:especies_recomendadas, edadesRecomendadas:edades_recomendadas, tamanosRecomendados:tamanos_recomendados, actividadesRecomendadas:actividades_recomendadas'
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
                    'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url, activo, especiesRecomendadas:especies_recomendadas, edadesRecomendadas:edades_recomendadas, tamanosRecomendados:tamanos_recomendados, actividadesRecomendadas:actividades_recomendadas'
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
                null,

            activo: producto.activo !== false,
            especies_recomendadas: Array.isArray(producto.especiesRecomendadas) ? producto.especiesRecomendadas : [],
            edades_recomendadas: Array.isArray(producto.edadesRecomendadas) ? producto.edadesRecomendadas : [],
            tamanos_recomendados: Array.isArray(producto.tamanosRecomendados) ? producto.tamanosRecomendados : [],
            actividades_recomendadas: Array.isArray(producto.actividadesRecomendadas) ? producto.actividadesRecomendadas : []

        };


        const columnas =
            'idProducto:id_producto, nombre, categoria, precio, stock, imagenUrl:imagen_url, activo, especiesRecomendadas:especies_recomendadas, edadesRecomendadas:edades_recomendadas, tamanosRecomendados:tamanos_recomendados, actividadesRecomendadas:actividades_recomendadas';


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
            row.evaluacion || null,

        tipoDocumento: 
            row.tipoDocumento || null,

        numeroDocumento:
            row.numeroDocumento || null,

        fechaNacimiento:
            row.fechaNacimiento || null

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
                    tipoDocumento:tipo_documento,
                    numeroDocumento:numero_documento,
                    fechaNacimiento:fecha_nacimiento,
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
                    tipoDocumento:tipo_documento,
                    numeroDocumento:numero_documento,
                    fechaNacimiento:fecha_nacimiento,
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
                    tipoDocumento:tipo_documento,
                    numeroDocumento:numero_documento,
                    fechaNacimiento:fecha_nacimiento,
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
        tipoDocumento,
        numeroDocumento,
        fechaNacimiento
    ) {

        const { error } =
            await db.rpc(
                'solicitar_adopcion',
                {
                    p_id_mascota:
                        Number(idMascota),

                    p_evaluacion:
                        evaluacion || null,

                    p_tipo_documento:
                        tipoDocumento,

                    p_numero_documento:
                        numeroDocumento,

                    p_fecha_nacimiento:
                        fechaNacimiento
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


    async aprobar(idSolicitud) {

        const solicitud =
            await Solicitudes.buscarPorId(
                idSolicitud
            );


        if (!solicitud) {
            return 'La solicitud no existe.';
        }


        if (
            solicitud.tipo !==
            'ADOPCION'
        ) {

            return 'Solo se pueden aprobar solicitudes de adopción. Las compras se gestionan desde pedidos.';

        }


        if (
            solicitud.estado !==
            'PENDIENTE'
        ) {

            return 'Esta solicitud ya fue procesada.';

        }


        const { error } =
            await db.rpc(
                'aprobar_adopcion',
                {
                    p_id_solicitud:
                        Number(idSolicitud)
                }
            );


        if (error) {

            console.error(
                'Error al aprobar adopción:',
                error
            );

            return error.message;

        }


        return null;

    },


    async rechazar(
        idSolicitud
    ) {

        // Auditoría H-06: el rechazo se ejecuta en una sola transacción en la base
        // de datos (función rechazar_adopcion), que actualiza la solicitud y libera
        // la mascota juntas. Si algo falla, no queda ninguna de las dos a medias.
        const id = Number(idSolicitud);

        if (!Number.isInteger(id) || id <= 0) {
            return 'La solicitud no existe.';
        }

        const { error } =
            await db.rpc(
                'rechazar_adopcion',
                {
                    p_id_solicitud: id
                }
            );

        if (error) {

            console.error(
                'Error al rechazar la solicitud:',
                error.message
            );

            if (/ya fue procesada/i.test(error.message || '')) {
                return 'Esta solicitud ya fue procesada.';
            }

            if (/no existe/i.test(error.message || '')) {
                return 'La solicitud no existe.';
            }

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




        const { data, error } =
            await db.from('fichas_adopcion')
                .select(`
                    id_ficha,
                    codigo,
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



const Pedidos = {

    async crear(items, datosComprador = {}) {

        const nombre =
            datosComprador.nombre?.trim() || null;

        const tipoDocumento =
            datosComprador.tipoDocumento || null;

        const numeroDocumento =
            datosComprador.numeroDocumento?.trim() || null;


        const { data, error } =
            await db.rpc('crear_pedido', {

                p_items: items,

                p_nombre_comprador: nombre,

                p_tipo_documento: tipoDocumento,

                p_numero_documento: numeroDocumento

            });


        if (error) {

            console.error(
                'Error al crear pedido:',
                error
            );

            return {
                error: error.message
            };

        }


        return {
            idPedido: data
        };

    },


    async listarPropios() {

        const { data: { user }, error: errorUsuario } =
            await db.auth.getUser();


        if (errorUsuario || !user) {

            console.error(
                'No se pudo identificar al usuario:',
                errorUsuario
            );

            return [];

        }


        const { data, error } =
            await db.from('pedidos')
                .select(`
                    idPedido:id_pedido,
                    fecha,
                    total,
                    estado,
                    venceEn:vence_en,
                    numeroBoleta:numero_boleta,
                    boletaCodigo:boleta_codigo,
                    nombreComprador:nombre_comprador,
                    tipoDocumento:tipo_documento,
                    numeroDocumento:numero_documento
                `)
                .eq(
                    'id_usuario',
                    user.id
                )
                .order(
                    'fecha',
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                'Error al listar pedidos propios:',
                error
            );

            return [];

        }


        return data || [];

    },


    async buscarPorId(idPedido) {

        const { data, error } =
            await db.from('pedidos')
                .select(`
                    idPedido:id_pedido,
                    fecha,
                    total,
                    estado,
                    venceEn:vence_en,
                    numeroBoleta:numero_boleta,
                    boletaCodigo:boleta_codigo,
                    nombreComprador:nombre_comprador,
                    tipoDocumento:tipo_documento,
                    numeroDocumento:numero_documento
                `)
                .eq(
                    'id_pedido',
                    Number(idPedido)
                )
                .maybeSingle();


        if (error) {

            console.error(
                'Error al buscar pedido:',
                error
            );

            return null;

        }


        return data;

    },


    async listarItems(idPedido) {

        const { data, error } =
            await db.from('pedido_items')
                .select(`
                    idItem:id_item,
                    idPedido:id_pedido,
                    idProducto:id_producto,
                    nombreProducto:nombre_producto,
                    precioUnitario:precio_unitario,
                    cantidad,
                    subtotal
                `)
                .eq(
                    'id_pedido',
                    Number(idPedido)
                )
                .order('id_item');


        if (error) {

            console.error(
                'Error al listar productos del pedido:',
                error
            );

            return [];

        }


        return data;

    }

};