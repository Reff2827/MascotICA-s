
'use strict';

const SUPABASE_URL = 'https://lyyhxfxvxvwlvjxvuogy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dELp4zrVBIrgqAmBYoUjOA_EXXhXRTf';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    }
);

supabaseClient.auth.onAuthStateChange((evento) => {
    if (evento === 'SIGNED_OUT' && /dashboard\.html$/i.test(window.location.pathname)) {
        window.location.replace('login.html');
    }
});

const $ = (selector) => document.querySelector(selector);

const LIMITE_REGISTROS = 100;

const secciones = {
    inicio: {
        titulo: 'Panel general',
        nombre: 'Inicio',
        descripcion: "Resumen general de MascotICA's.",
        icono: 'bi-grid-1x2-fill'
    },
    mascotas: {
        titulo: 'Gestión de mascotas',
        nombre: 'Mascotas',
        descripcion: 'Consulta las mascotas registradas, sus características y su estado.',
        icono: 'bi-heart-fill'
    },
    productos: {
        titulo: 'Gestión de productos',
        nombre: 'Productos',
        descripcion: 'Consulta el catálogo, las categorías, los precios y las existencias.',
        icono: 'bi-box-seam-fill'
    },
    compras: {
        titulo: 'Gestión de compras',
        nombre: 'Compras',
        descripcion: 'Consulta pedidos, compradores, documentos, pagos y boletas.',
        icono: 'bi-receipt'
    },
    adopciones: {
        titulo: 'Gestión de adopciones',
        nombre: 'Adopciones',
        descripcion: 'Consulta solicitudes, documentos, evaluaciones y fichas de adopción.',
        icono: 'bi-house-heart-fill'
    },
    inventario: {
        titulo: 'Control de inventario',
        nombre: 'Inventario',
        descripcion: 'Consulta las existencias y los precios de los productos registrados.',
        icono: 'bi-clipboard2-data-fill'
    },
    reportes: {
        titulo: 'Reportes',
        nombre: 'Reportes',
        descripcion: 'Consulta reportes de mascotas, ubicaciones, fotografías y contactos.',
        icono: 'bi-bar-chart-fill'
    }
};

const configuracionDatos = {
    mascotas: {
        tabla: 'mascotas',
        columnas: [
            { clave: 'id_mascota', titulo: 'ID' },
            { clave: 'nombre', titulo: 'Nombre' },
            { clave: 'especie', titulo: 'Especie' },
            { clave: 'raza', titulo: 'Raza' },
            { clave: 'edad', titulo: 'Edad' },
            { clave: 'sexo', titulo: 'Sexo' },
            { clave: 'estado', titulo: 'Estado' },
            { clave: 'tamano', titulo: 'Tamaño' },
            { clave: 'nivel_actividad', titulo: 'Actividad' },
            { clave: 'personalidad', titulo: 'Personalidad' },
            { clave: 'convive_ninos', titulo: 'Convive con niños' },
            { clave: 'convive_mascotas', titulo: 'Convive con mascotas' },
            { clave: 'imagen_url', titulo: 'Imagen URL' }
        ],
        orden: 'id_mascota',
        ascendente: false
    },

    productos: {
        tabla: 'productos',
        columnas: [
            { clave: 'id_producto', titulo: 'ID' },
            { clave: 'nombre', titulo: 'Producto' },
            { clave: 'categoria', titulo: 'Categoría' },
            { clave: 'precio', titulo: 'Precio', formato: 'moneda' },
            { clave: 'stock', titulo: 'Stock' },
            { clave: 'imagen_url', titulo: 'Imagen URL' }
        ],
        orden: 'id_producto',
        ascendente: false
    },

    compras: {
        tabla: 'pedidos',
        columnas: [
            { clave: 'id_pedido', titulo: 'ID pedido' },
            { clave: 'id_usuario', titulo: 'ID usuario' },
            { clave: 'nombre_comprador', titulo: 'Comprador' },
            { clave: 'tipo_documento', titulo: 'Tipo documento' },
            { clave: 'numero_documento', titulo: 'N.º documento' },
            { clave: 'fecha', titulo: 'Fecha', formato: 'fecha' },
            { clave: 'total', titulo: 'Total', formato: 'moneda' },
            { clave: 'estado', titulo: 'Estado' },
            { clave: 'numero_boleta', titulo: 'N.º boleta' },
            { clave: 'boleta_codigo', titulo: 'Código boleta' },
            { clave: 'pago_referencia', titulo: 'Referencia de pago' },
            { clave: 'pagado_en', titulo: 'Fecha de pago', formato: 'fecha' },
            { clave: 'entregado_en', titulo: 'Fecha de entrega', formato: 'fecha' },
            { clave: 'vence_en', titulo: 'Vence', formato: 'fecha' },
            { clave: 'motivo_rechazo', titulo: 'Motivo de rechazo' }
        ],
        columnasResumen: [
            { clave: 'id_pedido', titulo: 'Pedido' },
            { clave: 'nombre_comprador', titulo: 'Comprador' },
            { clave: 'fecha', titulo: 'Fecha', formato: 'fecha' },
            { clave: 'total', titulo: 'Total', formato: 'moneda' },
            { clave: 'estado', titulo: 'Estado' },
            { clave: 'numero_boleta', titulo: 'N.º boleta' }
        ],
        orden: 'fecha',
        ascendente: false
    },

    adopciones: {
        tabla: 'solicitudes',
        columnas: [
            { clave: 'id_solicitud', titulo: 'ID solicitud' },
            { clave: 'nombre_solicitante', titulo: 'Solicitante', noSQL: true },
            { clave: 'id_usuario', titulo: 'ID usuario' },
            { clave: 'tipo', titulo: 'Tipo' },
            { clave: 'ref_id', titulo: 'ID de mascota relacionada' },
            { clave: 'cantidad', titulo: 'Cantidad' },
            { clave: 'fecha', titulo: 'Fecha', formato: 'fecha' },
            { clave: 'estado', titulo: 'Estado' },
            { clave: 'dni', titulo: 'DNI' },
            { clave: 'tipo_documento', titulo: 'Tipo documento' },
            { clave: 'numero_documento', titulo: 'N.º documento' },
            { clave: 'fecha_nacimiento', titulo: 'Fecha de nacimiento', formato: 'fecha' },
            { clave: 'evaluacion', titulo: 'Evaluación' }
        ],
        columnasResumen: [
            { clave: 'id_solicitud', titulo: 'Solicitud' },
            { clave: 'nombre_solicitante', titulo: 'Solicitante' },
            { clave: 'ref_id', titulo: 'ID mascota' },
            { clave: 'fecha', titulo: 'Fecha', formato: 'fecha' },
            { clave: 'estado', titulo: 'Estado' }
        ],
        orden: 'fecha',
        ascendente: false
    },

    inventario: {
        tabla: 'productos',
        columnas: [
            { clave: 'id_producto', titulo: 'ID producto' },
            { clave: 'nombre', titulo: 'Producto' },
            { clave: 'categoria', titulo: 'Categoría' },
            { clave: 'stock', titulo: 'Existencias' },
            { clave: 'precio', titulo: 'Precio unitario', formato: 'moneda' },
            { clave: 'imagen_url', titulo: 'Imagen del producto' }
        ],
        columnasResumen: [
            { clave: 'id_producto', titulo: 'ID producto' },
            { clave: 'nombre', titulo: 'Producto' },
            { clave: 'categoria', titulo: 'Categoría' },
            { clave: 'stock', titulo: 'Existencias' },
            { clave: 'precio', titulo: 'Precio unitario', formato: 'moneda' }
        ],
        orden: 'stock',
        ascendente: true
    },

    reportes: {
        tabla: 'pet_reports',
        columnas: [
            { clave: 'id', titulo: 'ID reporte' },
            { clave: 'user_id', titulo: 'ID usuario' },
            { clave: 'pet_name', titulo: 'Nombre de mascota' },
            { clave: 'species', titulo: 'Especie' },
            { clave: 'status', titulo: 'Estado' },
            { clave: 'description', titulo: 'Descripción' },
            { clave: 'zone', titulo: 'Zona' },
            { clave: 'lat', titulo: 'Latitud' },
            { clave: 'lng', titulo: 'Longitud' },
            { clave: 'photo_url_1', titulo: 'Foto 1' },
            { clave: 'photo_url_2', titulo: 'Foto 2' },
            { clave: 'photo_url_3', titulo: 'Foto 3' },
            { clave: 'contact_name', titulo: 'Contacto' },
            { clave: 'contact_phone_country', titulo: 'Código país' },
            { clave: 'contact_phone', titulo: 'Teléfono de contacto' },
            { clave: 'created_at', titulo: 'Fecha de reporte', formato: 'fecha' }
        ],
        columnasResumen: [
            { clave: 'pet_name', titulo: 'Mascota' },
            { clave: 'species', titulo: 'Especie' },
            { clave: 'status', titulo: 'Estado' },
            { clave: 'zone', titulo: 'Zona' },
            { clave: 'created_at', titulo: 'Fecha', formato: 'fecha' }
        ],
        orden: 'created_at',
        ascendente: false
    }
};

/* =========================================================
   ESTADO INTERNO DEL PANEL
========================================================= */

let moduloActual = 'inicio';
let registrosActuales = [];
let offsetRegistros = 0;
let hayMasRegistros = false;
let cargandoMasRegistros = false;
let formularioGuardando = false;

/* =========================================================
   TEMA
========================================================= */

function aplicarTema(tema) {
    const temaValido = tema === 'dark' ? 'dark' : 'light';

    document.documentElement.dataset.theme = temaValido;

    try {
        localStorage.setItem('mascoticas-admin-theme', temaValido);
    } catch (error) {
        console.warn('No se pudo guardar la preferencia de tema:', error);
    }

    const icono = $('#btnTema i');

    if (icono) {
        icono.className = temaValido === 'dark'
            ? 'bi bi-sun-fill'
            : 'bi bi-moon-stars-fill';
    }
}

function configurarTema() {
    let temaGuardado = 'light';

    try {
        temaGuardado =
            localStorage.getItem('mascoticas-admin-theme') || 'light';
    } catch (error) {
        console.warn('No se pudo recuperar el tema guardado:', error);
    }

    aplicarTema(temaGuardado);

    $('#btnTema')?.addEventListener('click', () => {
        const temaActual = document.documentElement.dataset.theme;
        aplicarTema(temaActual === 'dark' ? 'light' : 'dark');
    });
}

/* =========================================================
   MENSAJES Y FECHA
========================================================= */

function mostrarMensaje(texto, tipo = 'info') {
    const elemento = $('#mensajeSistema');

    if (!elemento) return;

    elemento.textContent = texto;
    elemento.className = `system-message system-message-${tipo}`;
    elemento.hidden = false;
}

function mostrarFecha() {
    const ahora = new Date();

    const fecha = new Intl.DateTimeFormat('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(ahora);

    const fechaElemento = $('#fechaActual');
    const anioElemento = $('#anioActual');

    if (fechaElemento) {
        fechaElemento.textContent =
            fecha.charAt(0).toUpperCase() + fecha.slice(1);
    }

    if (anioElemento) {
        anioElemento.textContent = ahora.getFullYear();
    }
}

/* =========================================================
   INDICADORES
========================================================= */

async function contarRegistros(tabla, filtro = null) {
    let consulta = supabaseClient
        .from(tabla)
        .select('*', {
            count: 'exact',
            head: true
        });

    if (filtro?.columna) consulta = consulta.eq(filtro.columna, filtro.valor);

    const { count, error } = await consulta;

    if (error) {
        throw new Error(`Tabla ${tabla}: ${error.message}`);
    }

    return count ?? 0;
}

async function actualizarIndicadores() {
    const indicadores = [
        { tabla: 'mascotas', selector: '#totalMascotas' },
        { tabla: 'productos', selector: '#totalProductos' },
        { tabla: 'pedidos', selector: '#totalCompras' },
        { tabla: 'solicitudes', filtro: { columna: 'tipo', valor: 'ADOPCION' }, selector: '#totalAdopciones' }
    ];

    let errores = 0;

    await Promise.all(
        indicadores.map(async ({ tabla, selector, filtro }) => {
            const elemento = $(selector);

            if (!elemento) return;

            elemento.textContent = '…';

            try {
                const total = await contarRegistros(tabla, filtro);

                elemento.textContent =
                    new Intl.NumberFormat('es-PE').format(total);

                elemento.title = `${total} registros`;
            } catch (error) {
                errores++;
                elemento.textContent = '—';
                elemento.title = 'No se pudo cargar este indicador';

                console.error(
                    `Error al cargar el indicador de ${tabla}:`,
                    error
                );
            }
        })
    );

    if (errores > 0) {
        mostrarMensaje(
            `No se pudieron cargar ${errores} de los ${indicadores.length} indicadores. ` +
            'Revisa la conexión y los permisos de lectura de las tablas en Supabase.',
            'error'
        );
    }
}

/* =========================================================
   RESÚMENES DEL PANEL PRINCIPAL
========================================================= */

function crearAccesoResumen(titulo, subtitulo, detalle, accion, clase = '') {
    const boton = crearElemento('button', `overview-row ${clase}`.trim());
    boton.type = 'button';
    const texto = crearElemento('span', 'overview-row-copy');
    texto.append(
        crearElemento('strong', '', titulo),
        crearElemento('small', '', subtitulo)
    );
    const lado = crearElemento('span', 'overview-row-end');
    lado.append(
        crearElemento('strong', 'overview-row-detail', detalle),
        crearElemento('i', 'bi bi-chevron-right')
    );
    boton.append(texto, lado);
    boton.addEventListener('click', accion);
    return boton;
}

function mostrarEstadoVacioResumen(id, mensaje) {
    const contenedor = $(`#${id}`);
    if (!contenedor) return;
    contenedor.replaceChildren(crearElemento('p', 'overview-empty', mensaje));
}

async function cargarResumenesInicio() {
    const contenedorCompras = $('#listaComprasRecientes');
    const contenedorSolicitudes = $('#listaSolicitudesPendientes');
    const contenedorStock = $('#listaStockBajo');
    const contenedorGrafico = $('#graficoEstadosPedidos');

    if (contenedorCompras) contenedorCompras.replaceChildren(crearElemento('p', 'overview-empty', 'Cargando compras recientes…'));
    if (contenedorSolicitudes) contenedorSolicitudes.replaceChildren(crearElemento('p', 'overview-empty', 'Cargando solicitudes…'));
    if (contenedorStock) contenedorStock.replaceChildren(crearElemento('p', 'overview-empty', 'Revisando existencias…'));
    if (contenedorGrafico) contenedorGrafico.replaceChildren(crearElemento('p', 'overview-empty', 'Preparando resumen…'));

    const peticiones = await Promise.allSettled([
        supabaseClient.from('pedidos')
            .select('id_pedido, fecha, total, estado, nombre_comprador, numero_boleta')
            .order('fecha', { ascending: false })
            .limit(100),
        supabaseClient.from('solicitudes')
            .select('id_solicitud, id_usuario, ref_id, fecha, estado, perfiles(nombre)')
            .eq('tipo', 'ADOPCION')
            .eq('estado', 'PENDIENTE')
            .order('fecha', { ascending: false })
            .limit(5),
        supabaseClient.from('productos')
            .select('id_producto, nombre, stock, categoria')
            .lte('stock', 5)
            .order('stock', { ascending: true })
            .limit(5)
    ]);

    const respuestaPedidos = peticiones[0].status === 'fulfilled' ? peticiones[0].value : null;
    const respuestaSolicitudes = peticiones[1].status === 'fulfilled' ? peticiones[1].value : null;
    const respuestaStock = peticiones[2].status === 'fulfilled' ? peticiones[2].value : null;

    let pedidos = [];
    if (respuestaPedidos?.error) {
        console.error('No se pudieron cargar compras recientes:', respuestaPedidos.error);
        mostrarEstadoVacioResumen('listaComprasRecientes', 'No se pudo consultar el historial de compras.');
        mostrarEstadoVacioResumen('graficoEstadosPedidos', 'No hay datos suficientes para mostrar el resumen de compras.');
    } else if (respuestaPedidos) {
        pedidos = respuestaPedidos.data || [];
        if (contenedorCompras) {
            contenedorCompras.replaceChildren();
            const recientes = pedidos.slice(0, 5);
            if (!recientes.length) {
                mostrarEstadoVacioResumen('listaComprasRecientes', 'Todavía no hay compras registradas.');
            } else {
                recientes.forEach((pedido) => {
                    const fecha = pedido.fecha ? formatearValor(pedido.fecha, 'fecha') : 'Fecha no registrada';
                    contenedorCompras.appendChild(crearAccesoResumen(
                        `Pedido #${pedido.id_pedido}`,
                        `${pedido.nombre_comprador || 'Comprador no registrado'} · ${fecha}`,
                        formatearValor(pedido.total, 'moneda'),
                        () => mostrarModulo('compras')
                    ));
                });
            }
        }

        if (contenedorGrafico) {
            const conteos = new Map();
            pedidos.forEach((pedido) => {
                const estado = String(pedido.estado || 'SIN ESTADO').toUpperCase();
                conteos.set(estado, (conteos.get(estado) || 0) + 1);
            });
            const estadosOrdenados = [...conteos.entries()].sort((a, b) => b[1] - a[1]);
            contenedorGrafico.replaceChildren();
            if (!estadosOrdenados.length) {
                mostrarEstadoVacioResumen('graficoEstadosPedidos', 'Todavía no hay compras registradas.');
            } else {
                const maximo = Math.max(...estadosOrdenados.map((par) => par[1]), 1);
                estadosOrdenados.slice(0, 5).forEach(([estado, cantidad]) => {
                    const fila = crearElemento('div', 'status-chart-row');
                    const cabecera = crearElemento('div', 'status-chart-heading');
                    cabecera.append(
                        crearElemento('span', '', traducirEstado(estado)),
                        crearElemento('strong', '', String(cantidad))
                    );
                    const pista = crearElemento('div', 'status-chart-track');
                    const barra = crearElemento('span', 'status-chart-bar');
                    barra.style.width = `${Math.max(4, (cantidad / maximo) * 100)}%`;
                    pista.appendChild(barra);
                    fila.append(cabecera, pista);
                    contenedorGrafico.appendChild(fila);
                });
                contenedorGrafico.appendChild(crearElemento('small', 'overview-chart-note', `Basado en ${pedidos.length} compra(s) más recientes, máximo ${LIMITE_REGISTROS} por consulta.`));
            }
        }
    }

    if (respuestaSolicitudes?.error || !respuestaSolicitudes) {
        console.error('No se pudieron cargar las solicitudes pendientes:', respuestaSolicitudes?.error || peticiones[1].reason);
        mostrarEstadoVacioResumen('listaSolicitudesPendientes', 'No se pudieron cargar las solicitudes pendientes.');
    } else {
        const solicitudes = respuestaSolicitudes.data || [];
        const idsMascotas = [...new Set(solicitudes.map((solicitud) => Number(solicitud.ref_id)).filter((id) => Number.isInteger(id) && id > 0))];
        let mascotasPorId = new Map();
        if (idsMascotas.length) {
            const { data: mascotas, error } = await supabaseClient.from('mascotas')
                .select('id_mascota,nombre').in('id_mascota', idsMascotas);
            if (error) console.warn('No se pudieron resolver los nombres de las mascotas pendientes:', error);
            else mascotasPorId = new Map((mascotas || []).map((mascota) => [Number(mascota.id_mascota), mascota.nombre]));
        }
        if (contenedorSolicitudes) {
            contenedorSolicitudes.replaceChildren();
            if (!solicitudes.length) {
                mostrarEstadoVacioResumen('listaSolicitudesPendientes', 'No hay solicitudes de adopción pendientes.');
            } else {
                solicitudes.forEach((solicitud) => {
                    const perfil = Array.isArray(solicitud.perfiles) ? solicitud.perfiles[0] : solicitud.perfiles;
                    const nombreMascota = mascotasPorId.get(Number(solicitud.ref_id)) || `Mascota #${solicitud.ref_id}`;
                    const fecha = solicitud.fecha ? formatearValor(solicitud.fecha, 'fecha') : 'Sin fecha';
                    contenedorSolicitudes.appendChild(crearAccesoResumen(
                        nombreMascota,
                        `${perfil?.nombre || 'Solicitante no disponible'} · ${fecha}`,
                        `#${solicitud.id_solicitud}`,
                        () => mostrarModulo('adopciones'),
                        'overview-row-pending'
                    ));
                });
            }
        }
    }

    if (respuestaStock?.error || !respuestaStock) {
        console.error('No se pudo consultar stock bajo:', respuestaStock?.error || peticiones[2].reason);
        mostrarEstadoVacioResumen('listaStockBajo', 'No se pudieron consultar las existencias.');
    } else {
        const productos = respuestaStock.data || [];
        if (contenedorStock) {
            contenedorStock.replaceChildren();
            if (!productos.length) {
                mostrarEstadoVacioResumen('listaStockBajo', 'No hay productos con cinco unidades o menos.');
            } else {
                productos.forEach((producto) => {
                    contenedorStock.appendChild(crearAccesoResumen(
                        producto.nombre || `Producto #${producto.id_producto}`,
                        producto.categoria || 'Categoría no indicada',
                        `${producto.stock} uds.`,
                        () => mostrarModulo('inventario'),
                        'overview-row-stock'
                    ));
                });
            }
        }
    }
}

/* =========================================================
   VERIFICACIÓN DE ADMINISTRADOR
========================================================= */

async function verificarAdministrador() {
    const {
        data: { user },
        error: errorUsuario
    } = await supabaseClient.auth.getUser();

    if (errorUsuario || !user) {
        window.location.replace('login.html');
        return false;
    }

    const { data: perfil, error: errorPerfil } = await supabaseClient
        .from('perfiles')
        .select('id, nombre, rol')
        .eq('id', user.id)
        .maybeSingle();

    if (errorPerfil) {
        console.error('No se pudo consultar el perfil:', errorPerfil);

        mostrarMensaje(
            'No se pudo verificar el perfil administrativo. Por seguridad, vuelve a iniciar sesión cuando la conexión esté disponible.',
            'error'
        );
        await supabaseClient.auth.signOut();
        window.location.replace('login.html');
        return false;
    }

    if (!perfil || perfil.rol !== 'ADMIN') {
        await supabaseClient.auth.signOut();
        window.location.replace('login.html');
        return false;
    }

    const nombreElemento = $('#nombreAdministrador');
    const correoElemento = $('#correoAdministrador');
    const estadoElemento = $('#estadoSesion');
    const etiquetaElemento = $('#etiquetaSesion');

    if (nombreElemento) {
        nombreElemento.textContent = perfil.nombre || 'Administrador';
    }

    if (correoElemento) {
        correoElemento.textContent = user.email || '';
    }

    if (estadoElemento) {
        estadoElemento.textContent = 'Usuario verificado';
    }

    if (etiquetaElemento) {
        etiquetaElemento.textContent = 'Verificada';
        etiquetaElemento.className = 'status status-success';
    }

    return true;
}

/* =========================================================
   FORMATO Y ELEMENTOS HTML
========================================================= */

function formatearValor(valor, formato) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }

    if (formato === 'moneda') {
        const numero = Number(valor);

        if (!Number.isFinite(numero)) return String(valor);

        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(numero);
    }

    if (formato === 'fecha') {
        const fecha = new Date(valor);

        if (Number.isNaN(fecha.getTime())) return String(valor);

        if (/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) {
            return new Intl.DateTimeFormat('es-PE', {
                dateStyle: 'short',
                timeZone: 'UTC'
            }).format(fecha);
        }

        return new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(fecha);
    }

    if (typeof valor === 'object') {
        try {
            return JSON.stringify(valor, null, 2);
        } catch {
            return '[Dato no disponible]';
        }
    }

    return String(valor);
}

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);

    if (clase) elemento.className = clase;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

function crearCelda(texto, esEncabezado = false) {
    const celda = document.createElement(esEncabezado ? 'th' : 'td');

    if (esEncabezado) {
        celda.scope = 'col';
    }

    celda.textContent = texto;
    return celda;
}

function limpiarTablaModulo() {
    const encabezado = $('#encabezadoTablaModulo');
    const cuerpo = $('#cuerpoTablaModulo');

    if (encabezado) encabezado.replaceChildren();
    if (cuerpo) cuerpo.replaceChildren();
}

function mostrarEstadoModulo(texto, tipo = 'info') {
    const estado = $('#estadoModulo');

    if (!estado) return;

    estado.textContent = texto;
    estado.className = `module-state module-state-${tipo}`;
}

/* =========================================================
   SEGURIDAD DE URL E IMÁGENES
========================================================= */

function decodificarSegmentoRutaStorage(segmento) {
    try {
        return decodeURIComponent(segmento);
    } catch {
        return segmento;
    }
}

function codificarRutaStorage(ruta) {
    return String(ruta || '').split('/').map((segmento) => {
        return encodeURIComponent(decodificarSegmentoRutaStorage(segmento));
    }).join('/');
}

function crearUrlPublicaStorage(bucket, ruta) {
    if (!bucket || !ruta) return null;
    return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${codificarRutaStorage(ruta)}`;
}

function analizarReferenciaStorageImagen(valor, bucketPredeterminado = '') {
    if (typeof valor !== 'string' || !valor.trim()) {
        return { urls: [], referencias: [] };
    }

    const bruto = valor.trim().replace(/^['"]|['"]$/g, '');
    const urls = [];
    const referencias = [];
    const agregarUrl = (url) => {
        if (url && !urls.includes(url)) urls.push(url);
    };
    const agregarReferencia = (bucket, ruta) => {
        if (!bucket || !ruta) return;
        const referencia = { bucket, ruta: String(ruta).replace(/^\/+/, '') };
        if (!referencias.some((actual) => actual.bucket === referencia.bucket && actual.ruta === referencia.ruta)) {
            referencias.push(referencia);
        }
        agregarUrl(crearUrlPublicaStorage(referencia.bucket, referencia.ruta));
    };

    let urlCompleta = null;
    try {
        urlCompleta = new URL(bruto);
    } catch {
        urlCompleta = null;
    }

    if (urlCompleta) {
        if (!['http:', 'https:'].includes(urlCompleta.protocol)) {
            return { urls: [], referencias: [] };
        }

        agregarUrl(urlCompleta.href);
        const coincidencia = urlCompleta.pathname.match(
            /\/storage\/v1\/object\/(?:public|authenticated|sign|upload)\/([^/]+)\/(.+)$/i
        );
        if (coincidencia) {
            const bucket = decodificarSegmentoRutaStorage(coincidencia[1]);
            const ruta = coincidencia[2].split('/').map(decodificarSegmentoRutaStorage).join('/');
            agregarReferencia(bucket, ruta);
        }

        return { urls, referencias };
    }

    let rutaBruta = bruto.replace(/\\/g, '/').replace(/^\/+/, '');
    const rutaStorageUrl = rutaBruta.match(
        /^(?:storage\/v1\/)?object\/(?:public|authenticated|sign|upload)\/([^/]+)\/(.+)$/i
    ) || rutaBruta.match(
        /^storage\/v1\/object\/(?:public|authenticated|sign|upload)\/([^/]+)\/(.+)$/i
    );

    if (rutaStorageUrl) {
        agregarReferencia(
            decodificarSegmentoRutaStorage(rutaStorageUrl[1]),
            rutaStorageUrl[2].split('/').map(decodificarSegmentoRutaStorage).join('/')
        );
        return { urls, referencias };
    }

    const rutaConBucket = rutaBruta.match(/^(productos|mascotas|pet-photos)\/(.+)$/i);
    if (rutaConBucket) {
        agregarReferencia(rutaConBucket[1].toLowerCase(), rutaConBucket[2]);
        return { urls, referencias };
    }

    if (bucketPredeterminado) {
        agregarReferencia(bucketPredeterminado, rutaBruta);
    }

    return { urls, referencias };
}

function obtenerUrlImagen(valor, bucketPredeterminado = '') {
    const analisis = analizarReferenciaStorageImagen(valor, bucketPredeterminado);
    const referencia = analisis.referencias[0];
    return referencia
        ? crearUrlPublicaStorage(referencia.bucket, referencia.ruta)
        : (analisis.urls[0] || null);
}

function probarCargaImagen(imagen, url) {
    return new Promise((resolver) => {
        let finalizada = false;
        const terminar = (correcta) => {
            if (finalizada) return;
            finalizada = true;
            imagen.removeEventListener('load', alCargar);
            imagen.removeEventListener('error', alFallar);
            resolver(correcta);
        };
        const alCargar = () => terminar(imagen.naturalWidth > 0);
        const alFallar = () => terminar(false);

        imagen.addEventListener('load', alCargar, { once: true });
        imagen.addEventListener('error', alFallar, { once: true });
        imagen.src = url;

        if (imagen.complete) {
            Promise.resolve().then(() => terminar(imagen.naturalWidth > 0));
        }
    });
}

async function cargarImagenConAlternativas(imagen, valor, bucketPredeterminado = '') {
    const version = Number(imagen.dataset.resolverImagenVersion || 0) + 1;
    imagen.dataset.resolverImagenVersion = String(version);
    const analisis = analizarReferenciaStorageImagen(valor, bucketPredeterminado);

    for (const url of analisis.urls) {
        if (imagen.dataset.resolverImagenVersion !== String(version)) return false;
        if (await probarCargaImagen(imagen, url)) {
            if (imagen.dataset.resolverImagenVersion !== String(version)) return false;
            return true;
        }
    }

    // Si el bucket no es público, la sesión administrativa puede permitir una URL firmada.
    for (const referencia of analisis.referencias) {
        if (imagen.dataset.resolverImagenVersion !== String(version)) return false;
        try {
            const { data, error } = await supabaseClient.storage
                .from(referencia.bucket)
                .createSignedUrl(referencia.ruta, 60 * 60);
            if (!error && data?.signedUrl) {
                if (await probarCargaImagen(imagen, data.signedUrl)) {
                    if (imagen.dataset.resolverImagenVersion !== String(version)) return false;
                    return true;
                }
            } else if (error) {
                console.warn(`No se pudo generar una URL firmada para el bucket ${referencia.bucket}:`, error.message);
            }
        } catch (error) {
            console.warn('No se pudo recuperar una imagen de Supabase Storage:', error);
        }
    }

    return false;
}

/* =========================================================
   DETALLE COMPLETO DE REGISTROS
========================================================= */

function obtenerPanelDetalles() {
    const envoltura = $('.module-table-wrapper');

    if (!envoltura || !envoltura.parentNode) {
        throw new Error(
            'No se encontró un lugar para mostrar los detalles del registro.'
        );
    }

    let panel = $('#panelDetalleRegistro');

    if (!panel) {
        panel = crearElemento('section', 'record-detail-panel');
        panel.id = 'panelDetalleRegistro';
        panel.hidden = true;
        panel.setAttribute('aria-live', 'polite');

        envoltura.parentNode.insertBefore(
            panel,
            envoltura.nextSibling
        );
    }

    return panel;
}

function cerrarDetalleRegistro() {
    const panel = $('#panelDetalleRegistro');

    if (panel) {
        panel.hidden = true;
        panel.replaceChildren();
    }
}

function mostrarDetalleRegistro(configuracion, registro) {
    const panel = obtenerPanelDetalles();

    panel.replaceChildren();
    panel.hidden = false;

    const encabezado = crearElemento('div', 'record-detail-header');
    const tituloGrupo = crearElemento('div', 'record-detail-heading');

    const titulo = crearElemento(
        'h3',
        'record-detail-title',
        'Detalle del registro'
    );

    const identificador = configuracion.columnas.find((columna) =>
        [
            'id_pedido',
            'id_solicitud',
            'id',
            'id_mascota',
            'id_producto'
        ].includes(columna.clave)
    );

    const subtitulo = identificador
        ? `${identificador.titulo}: ${formatearValor(registro[identificador.clave])}`
        : 'Información completa';

    const descripcion = crearElemento(
        'p',
        'record-detail-subtitle',
        subtitulo
    );

    tituloGrupo.append(titulo, descripcion);

    const botonCerrar = crearElemento(
        'button',
        'record-detail-close btn btn-outline-secondary btn-sm'
    );

    botonCerrar.type = 'button';
    botonCerrar.setAttribute('aria-label', 'Cerrar detalle');

    botonCerrar.append(
        crearElemento('i', 'bi bi-x-lg'),
        document.createTextNode(' Cerrar')
    );

    botonCerrar.addEventListener('click', cerrarDetalleRegistro);

    encabezado.append(tituloGrupo, botonCerrar);

    const lista = crearElemento('dl', 'record-detail-grid');

    configuracion.columnas.forEach((columna) => {
        const grupo = crearElemento('div', 'record-detail-item');

        const etiqueta = crearElemento(
            'dt',
            'record-detail-label',
            columna.titulo
        );

        const valor = formatearValor(
            registro[columna.clave],
            columna.formato
        );

        const dato = crearElemento('dd', 'record-detail-value', valor);

        if (
            columna.clave.startsWith('photo_url_') ||
            columna.clave === 'imagen_url'
        ) {
            const bucketImagen = columna.clave === 'imagen_url'
                ? (configuracion.tabla === 'mascotas' ? 'mascotas' : 'productos')
                : 'pet-photos';
            const urlSegura = obtenerUrlImagen(registro[columna.clave], bucketImagen);

            if (urlSegura) {
                const enlace = crearElemento(
                    'a',
                    'record-detail-link',
                    'Abrir imagen en tamaño completo'
                );

                enlace.href = urlSegura;
                enlace.target = '_blank';
                enlace.rel = 'noopener noreferrer';

                const miniatura = document.createElement('img');
                miniatura.className = 'record-detail-image-preview';
                miniatura.src = urlSegura;
                miniatura.alt = `Vista previa: ${columna.titulo}`;
                miniatura.loading = 'lazy';
                miniatura.addEventListener('error', () => {
                    cargarImagenConAlternativas(miniatura, registro[columna.clave], bucketImagen)
                        .then((correcta) => {
                            if (!correcta) miniatura.remove();
                        });
                }, { once: true });

                grupo.append(etiqueta, dato, miniatura, enlace);
                lista.appendChild(grupo);
                return;
            }
        }

        grupo.append(etiqueta, dato);
        lista.appendChild(grupo);
    });

    const acciones = crearElemento('div', 'record-detail-actions');

    const botonImprimir = crearElemento(
        'button',
        'btn btn-outline-primary btn-sm'
    );

    botonImprimir.type = 'button';
    botonImprimir.append(
        crearElemento('i', 'bi bi-printer me-1'),
        document.createTextNode('Imprimir detalle')
    );

    botonImprimir.addEventListener('click', () => {
        imprimirRegistro(configuracion, registro, 'Detalle del registro');
    });

    acciones.appendChild(botonImprimir);

    if (configuracion.tabla === 'pet_reports' &&
        Number.isFinite(Number(registro.lat)) &&
        Number.isFinite(Number(registro.lng))) {
        const botonMapa = crearBotonAccion(
            'Abrir ubicación en mapa', 'bi-geo-alt', 'btn btn-outline-primary btn-sm',
            () => {
                const urlMapa = `https://www.google.com/maps?q=${encodeURIComponent(`${registro.lat},${registro.lng}`)}`;
                window.open(urlMapa, '_blank');
            }
        );
        acciones.appendChild(botonMapa);
    }

    panel.append(encabezado, lista, acciones);

    panel.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

/* =========================================================
   IMPRESIÓN DE DETALLES
========================================================= */

function escaparHTML(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function imprimirRegistro(configuracion, registro, tituloDocumento) {
    const filas = configuracion.columnas.map((columna) => {
        const valor = formatearValor(
            registro[columna.clave],
            columna.formato
        );

        return `
            <tr>
                <th>${escaparHTML(columna.titulo)}</th>
                <td>${escaparHTML(valor)}</td>
            </tr>
        `;
    }).join('');

    const ventana = window.open('', '_blank');

    if (!ventana) {
        mostrarMensaje(
            'El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este panel e inténtalo nuevamente.',
            'error'
        );
        return;
    }

    ventana.document.open();
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escaparHTML(tituloDocumento)}</title>
            <style>
                body {
                    margin: 0;
                    padding: 32px;
                    color: #17243a;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                }
                header {
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #155e75;
                }
                h1 { margin: 0 0 8px; font-size: 22px; }
                p { color: #5b687a; }
                table { width: 100%; border-collapse: collapse; }
                th, td {
                    padding: 10px;
                    border: 1px solid #dfe5ec;
                    text-align: left;
                    vertical-align: top;
                    overflow-wrap: anywhere;
                }
                th {
                    width: 32%;
                    background: #f3f7f9;
                }
                footer {
                    margin-top: 25px;
                    color: #6b7280;
                    font-size: 10px;
                }
                @media print {
                    body { padding: 0; }
                    tr { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <header>
                <h1>MascotICA's</h1>
                <p>${escaparHTML(tituloDocumento)}</p>
                <p>Documento generado el ${escaparHTML(
                    new Intl.DateTimeFormat('es-PE', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                    }).format(new Date())
                )}</p>
            </header>
            <table>
                <tbody>${filas}</tbody>
            </table>
            <footer>
                Documento de consulta generado desde el panel administrativo.
                No reemplaza un comprobante tributario ni un documento oficial.
            </footer>
            <script>
                window.addEventListener('load', () => {
                    window.print();
                });
            <\/script>
        </body>
        </html>
    `);
    ventana.document.close();
}

/* =========================================================
   TARJETAS VISUALES
========================================================= */

function crearImagenTarjeta(url, textoAlternativo, tipo) {
    const contenedor = crearElemento(
        'div',
        `record-card-image record-card-image-${tipo}`
    );

    const icono = tipo === 'mascota' ? 'bi-heart' : 'bi-box-seam';

    const respaldo = crearElemento('div', 'record-card-image-fallback');
    respaldo.setAttribute('aria-hidden', 'true');
    respaldo.appendChild(crearElemento('i', `bi ${icono}`));
    contenedor.appendChild(respaldo);

    if (typeof url !== 'string' || !url.trim()) {
        respaldo.title = 'Este registro todavía no tiene una imagen guardada.';
        return contenedor;
    }

    const bucketImagen = tipo === 'producto' ? 'productos' : 'mascotas';
    const imagen = document.createElement('img');
    imagen.alt = textoAlternativo || 'Imagen del registro';
    imagen.loading = 'lazy';
    imagen.decoding = 'async';
    imagen.title = 'Fotografía del registro';
    contenedor.appendChild(imagen);

    cargarImagenConAlternativas(imagen, url, bucketImagen).then((correcta) => {
        if (correcta) {
            respaldo.hidden = true;
            imagen.classList.add('is-loaded');
        } else {
            imagen.remove();
            respaldo.title = 'La imagen no se pudo cargar. Revisa la URL guardada y el objeto en Supabase Storage.';
            respaldo.setAttribute('aria-label', 'Imagen no disponible');
        }
    });

    return contenedor;
}

function crearDatoTarjeta(etiqueta, valor) {
    const grupo = crearElemento('div', 'record-card-detail');
    const nombre = crearElemento('span', 'record-card-detail-label', etiqueta);
    const dato = crearElemento('span', 'record-card-detail-value', valor);

    grupo.append(nombre, dato);

    return grupo;
}

function traducirEstado(valor) {
    const normalizado = String(valor ?? '').trim().toUpperCase();
    const etiquetas = {
        DISPONIBLE: 'Disponible',
        EN_PROCESO: 'En proceso',
        ADOPTADO: 'Adoptado',
        PENDIENTE: 'Pendiente',
        APROBADA: 'Aprobada',
        RECHAZADA: 'Rechazada',
        PENDIENTE_PAGO: 'Pendiente de pago',
        PAGADO: 'Pagado',
        ENTREGADO: 'Entregado',
        VENCIDO: 'Vencido',
        CANCELADO: 'Cancelado',
        RECHAZADO: 'Rechazado',
        ABANDONADA: 'Abandonada',
        PERDIDA: 'Perdida',
        ENCONTRADA: 'Encontrada',
        LOCALIZADA: 'Localizada'
    };
    return etiquetas[normalizado] || (valor ? String(valor).replace(/_/g, ' ') : '—');
}

function crearEstadoTarjeta(valor) {
    const texto = traducirEstado(valor);
    const normalizado = String(valor ?? '').trim().toUpperCase();

    let clase = 'record-status-neutral';

    if (
        ['DISPONIBLE', 'ACTIVO', 'APROBADA', 'PAGADO', 'ENTREGADO']
            .includes(normalizado)
    ) {
        clase = 'record-status-positive';
    } else if (
        ['ADOPTADO', 'RECHAZADA', 'CANCELADO', 'VENCIDO', 'INACTIVO']
            .includes(normalizado)
    ) {
        clase = 'record-status-muted';
    } else if (
        ['PENDIENTE', 'PENDIENTE_PAGO', 'EN PROCESO', 'EN_PROCESO', 'RESERVADO']
            .includes(normalizado)
    ) {
        clase = 'record-status-pending';
    }

    return crearElemento('span', `record-status ${clase}`, texto);
}

function crearBotonAccion(texto, icono, clase, accion) {
    const boton = crearElemento('button', clase);

    boton.type = 'button';
    boton.append(
        crearElemento('i', `bi ${icono} me-1`),
        document.createTextNode(texto)
    );

    boton.addEventListener('click', accion);

    return boton;
}

function crearTarjetaMascota(registro) {
    const tarjeta = crearElemento('article', 'record-card pet-record-card');

    const imagen = crearImagenTarjeta(
        registro.imagen_url,
        registro.nombre
            ? `Fotografía de ${registro.nombre}`
            : 'Fotografía de la mascota',
        'mascota'
    );

    const contenido = crearElemento('div', 'record-card-content');
    const encabezado = crearElemento('div', 'record-card-heading');

    const nombre = crearElemento(
        'h3',
        'record-card-title',
        formatearValor(registro.nombre)
    );

    const identificador = crearElemento(
        'span',
        'record-card-id',
        `ID ${formatearValor(registro.id_mascota)}`
    );

    encabezado.append(nombre, identificador);

    const subtitulo = [
        registro.especie,
        registro.raza
    ].filter((valor) => valor !== null && valor !== undefined && valor !== '')
        .join(' · ');

    const descripcion = crearElemento(
        'p',
        'record-card-subtitle',
        subtitulo || 'Especie o raza no especificada'
    );

    const estadoFila = crearElemento('div', 'record-card-status-row');
    estadoFila.appendChild(crearEstadoTarjeta(registro.estado));

    const detalles = crearElemento('div', 'record-card-details');

    detalles.append(
        crearDatoTarjeta('Edad', formatearValor(registro.edad)),
        crearDatoTarjeta('Sexo', formatearValor(registro.sexo)),
        crearDatoTarjeta('Tamaño', formatearValor(registro.tamano)),
        crearDatoTarjeta('Actividad', formatearValor(registro.nivel_actividad))
    );

    const acciones = crearElemento('div', 'record-card-actions');

    acciones.append(
        crearBotonAccion(
            'Ver detalles',
            'bi-eye',
            'btn btn-outline-primary btn-sm',
            () => mostrarDetalleRegistro(configuracionDatos.mascotas, registro)
        ),
        crearBotonAccion(
            'Editar',
            'bi-pencil',
            'btn btn-primary btn-sm',
            () => abrirFormularioRegistro('mascotas', registro)
        ),
        crearBotonAccion(
            'Eliminar',
            'bi-trash',
            'btn btn-outline-danger btn-sm',
            () => eliminarRegistro('mascotas', registro)
        )
    );

    contenido.append(encabezado, descripcion, estadoFila, detalles, acciones);
    tarjeta.append(imagen, contenido);

    return tarjeta;
}

function crearTarjetaProducto(registro) {
    const tarjeta = crearElemento('article', 'record-card product-record-card');

    const imagen = crearImagenTarjeta(
        registro.imagen_url,
        registro.nombre
            ? `Imagen de ${registro.nombre}`
            : 'Imagen del producto',
        'producto'
    );

    const contenido = crearElemento('div', 'record-card-content');
    const encabezado = crearElemento('div', 'record-card-heading');

    const nombre = crearElemento(
        'h3',
        'record-card-title',
        formatearValor(registro.nombre)
    );

    const identificador = crearElemento(
        'span',
        'record-card-id',
        `ID ${formatearValor(registro.id_producto)}`
    );

    encabezado.append(nombre, identificador);

    const categoria = crearElemento(
        'p',
        'record-card-subtitle',
        `Categoría: ${formatearValor(registro.categoria)}`
    );

    const precio = crearElemento(
        'div',
        'product-card-price',
        formatearValor(registro.precio, 'moneda')
    );

    const stockNumero = Number(registro.stock);
    const stockValido =
        registro.stock !== null &&
        registro.stock !== undefined &&
        registro.stock !== '' &&
        Number.isFinite(stockNumero);

    const stockBajo = stockValido && stockNumero <= 5;

    const stockFila = crearElemento(
        'div',
        `product-card-stock${stockBajo ? ' product-card-stock-low' : ''}`
    );

    stockFila.append(
        crearElemento(
            'i',
            `bi ${stockBajo ? 'bi-exclamation-triangle' : 'bi-box-seam'}`
        ),
        crearElemento(
            'span',
            '',
            stockValido
                ? `${new Intl.NumberFormat('es-PE').format(stockNumero)} unidades en stock`
                : 'Stock no disponible'
        )
    );

    const acciones = crearElemento('div', 'record-card-actions');

    acciones.append(
        crearBotonAccion(
            'Ver detalles',
            'bi-eye',
            'btn btn-outline-primary btn-sm',
            () => mostrarDetalleRegistro(configuracionDatos.productos, registro)
        ),
        crearBotonAccion(
            'Editar',
            'bi-pencil',
            'btn btn-primary btn-sm',
            () => abrirFormularioRegistro('productos', registro)
        ),
        crearBotonAccion(
            'Eliminar',
            'bi-trash',
            'btn btn-outline-danger btn-sm',
            () => eliminarRegistro('productos', registro)
        )
    );

    contenido.append(encabezado, categoria, precio, stockFila, acciones);
    tarjeta.append(imagen, contenido);

    return tarjeta;
}

function obtenerContenedorTarjetas() {
    const envoltura = $('.module-table-wrapper');

    if (!envoltura) {
        throw new Error(
            'No se encontró .module-table-wrapper en dashboard.html.'
        );
    }

    let contenedor = $('#contenedorTarjetasModulo');

    if (!contenedor) {
        contenedor = crearElemento('div', 'record-cards-grid');
        contenedor.id = 'contenedorTarjetasModulo';
        envoltura.parentNode.insertBefore(contenedor, envoltura);
    }

    return contenedor;
}

function mostrarTarjetasModulo(nombreSeccion, filas) {
    const envoltura = $('.module-table-wrapper');
    const contenedor = obtenerContenedorTarjetas();

    if (!envoltura) {
        throw new Error('No se encontró el contenedor de la tabla.');
    }

    cerrarDetalleRegistro();
    limpiarTablaModulo();
    contenedor.replaceChildren();

    envoltura.hidden = true;
    contenedor.hidden = false;

    if (!filas.length) {
        const hayRegistros = registrosActuales.length > 0;
        contenedor.appendChild(
            crearElemento(
                'p',
                'record-cards-empty',
                hayRegistros
                    ? 'Ninguna mascota o producto coincide con los filtros actuales.'
                    : 'Todavía no hay registros disponibles. Puedes crear el primero con el botón de arriba.'
            )
        );

        mostrarEstadoModulo(
            hayRegistros
                ? 'No se encontraron coincidencias. Prueba cambiando la búsqueda o los filtros.'
                : 'Consulta completada: no hay registros disponibles para esta sesión.'
        );

        return;
    }

    filas.forEach((registro) => {
        const tarjeta = nombreSeccion === 'mascotas'
            ? crearTarjetaMascota(registro)
            : crearTarjetaProducto(registro);

        contenedor.appendChild(tarjeta);
    });

    mostrarEstadoModulo(
        `Se muestran ${filas.length} de ${registrosActuales.length} registros cargados.` +
        (hayMasRegistros ? ' Hay más resultados disponibles; pulsa «Cargar más registros» para continuar.' : ' Se han cargado todos los resultados disponibles.')
    );
}

/* =========================================================
   FORMULARIOS DINÁMICOS PARA MASCOTAS Y PRODUCTOS
========================================================= */

function obtenerContenedorFormulario() {
    const modulo = $('#seccionModulo');

    if (!modulo) {
        throw new Error('No se encontró la sección de módulos.');
    }

    let contenedor = $('#contenedorFormularioRegistro');

    if (!contenedor) {
        contenedor = crearElemento('section', 'record-form-panel');
        contenedor.id = 'contenedorFormularioRegistro';
        contenedor.hidden = true;

        const estado = $('#estadoModulo');
        const tabla = $('.module-table-wrapper');

        if (estado && estado.parentNode === modulo.querySelector('.module-data-card')) {
            estado.insertAdjacentElement('afterend', contenedor);
        } else if (tabla && tabla.parentNode) {
            tabla.parentNode.insertBefore(contenedor, tabla);
        } else {
            modulo.appendChild(contenedor);
        }
    }

    return contenedor;
}

function cerrarFormularioRegistro() {
    const contenedor = $('#contenedorFormularioRegistro');

    if (contenedor) {
        contenedor.hidden = true;
        contenedor.replaceChildren();
    }

    formularioGuardando = false;
}

function definirCamposFormulario(nombreSeccion) {
    if (nombreSeccion === 'mascotas') {
        return [
            { clave: 'nombre', titulo: 'Nombre', tipo: 'text', requerido: true, placeholder: 'Ej. Luna' },
            {
                clave: 'especie', titulo: 'Especie', tipo: 'select', requerido: true,
                opciones: [
                    { valor: 'Perro', texto: 'Perro' },
                    { valor: 'Gato', texto: 'Gato' }
                ]
            },
            { clave: 'raza', titulo: 'Raza o tipo', tipo: 'text', requerido: true, placeholder: 'Ej. Mestizo, Labrador, Siamés', maxLength: 40 },
            { clave: 'edad', titulo: 'Edad', tipo: 'edad', requerido: true },
            {
                clave: 'sexo', titulo: 'Sexo', tipo: 'select', requerido: true,
                opciones: [
                    { valor: 'MACHO', texto: 'Macho' },
                    { valor: 'HEMBRA', texto: 'Hembra' }
                ]
            },
            {
                clave: 'estado', titulo: 'Estado', tipo: 'select', requerido: true, default: 'DISPONIBLE',
                opciones: [
                    { valor: 'DISPONIBLE', texto: 'Disponible' },
                    { valor: 'EN_PROCESO', texto: 'En proceso de adopción' },
                    { valor: 'ADOPTADO', texto: 'Adoptado' }
                ]
            },
            {
                clave: 'tamano', titulo: 'Tamaño', tipo: 'select',
                opciones: [
                    { valor: 'PEQUENO', texto: 'Pequeño' },
                    { valor: 'MEDIANO', texto: 'Mediano' },
                    { valor: 'GRANDE', texto: 'Grande' }
                ]
            },
            {
                clave: 'nivel_actividad', titulo: 'Nivel de actividad', tipo: 'select',
                opciones: [
                    { valor: 'TRANQUILO', texto: 'Tranquilo' },
                    { valor: 'MODERADO', texto: 'Moderado' },
                    { valor: 'ACTIVO', texto: 'Muy activo' }
                ]
            },
            {
                clave: 'personalidad', titulo: 'Personalidad', tipo: 'checklist', anchoCompleto: true,
                opciones: [
                    'Tranquila', 'Juguetona', 'Cariñosa', 'Sociable',
                    'Independiente', 'Curiosa', 'Protectora', 'Tímida',
                    'Enérgica', 'Inteligente', 'Comunicativa', 'Poco activa'
                ]
            },
            {
                clave: 'convive_ninos', titulo: '¿Convive con niños?', tipo: 'select', requerido: true, default: 'DESCONOCIDO',
                opciones: [
                    { valor: 'DESCONOCIDO', texto: 'Todavía no se sabe' },
                    { valor: 'SI', texto: 'Sí' },
                    { valor: 'NO', texto: 'No' }
                ]
            },
            {
                clave: 'convive_mascotas', titulo: '¿Convive con otras mascotas?', tipo: 'select', requerido: true, default: 'DESCONOCIDO',
                opciones: [
                    { valor: 'DESCONOCIDO', texto: 'Todavía no se sabe' },
                    { valor: 'SI', texto: 'Sí' },
                    { valor: 'NO', texto: 'No' }
                ]
            },
            { clave: 'imagen_url', titulo: 'Fotografía de la mascota', tipo: 'url', bucket: 'mascotas', anchoCompleto: true, placeholder: 'https://… o ruta del archivo en Storage' }
        ];
    }

    if (nombreSeccion === 'productos') {
        return [
            { clave: 'nombre', titulo: 'Nombre del producto', tipo: 'text', requerido: true, placeholder: 'Ej. Alimento para perro adulto' },
            {
                clave: 'categoria', titulo: 'Categoría', tipo: 'select', requerido: true,
                opciones: [
                    { valor: 'ALIMENTO', texto: 'Alimento' },
                    { valor: 'HIGIENE', texto: 'Higiene' }
                ]
            },
            { clave: 'precio', titulo: 'Precio (S/)', tipo: 'number', requerido: true, min: 0, step: '0.01', placeholder: '0.00' },
            { clave: 'stock', titulo: 'Unidades en stock', tipo: 'number', requerido: true, min: 0, step: '1', placeholder: '0' },
            { clave: 'imagen_url', titulo: 'Fotografía del producto', tipo: 'url', bucket: 'productos', anchoCompleto: true, placeholder: 'https://… o ruta del archivo en Storage' }
        ];
    }

    return [];
}

function obtenerValoresPersonalidad(valor) {
    if (Array.isArray(valor)) return valor.map((item) => String(item).trim()).filter(Boolean);
    if (typeof valor !== 'string' || !valor.trim()) return [];

    try {
        const decodificado = JSON.parse(valor);
        if (Array.isArray(decodificado)) {
            return decodificado.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // Las versiones anteriores guardaban la personalidad como texto separado por comas.
    }

    return valor.split(',').map((item) => item.trim()).filter(Boolean);
}

function crearCampoFormulario(campo, registro = {}) {
    const grupo = crearElemento('div', `record-form-field${campo.anchoCompleto ? ' record-form-field-wide' : ''}`);
    grupo.dataset.campo = campo.clave;
    const etiqueta = crearElemento('label', 'form-label', campo.titulo);
    const idCampo = `campoRegistro_${campo.clave}`;
    etiqueta.htmlFor = idCampo;
    const valorOriginal = registro[campo.clave];
    let entrada;

    if (campo.tipo === 'edad') {
        entrada = document.createElement('input');
        entrada.type = 'hidden';
        entrada.id = idCampo;
        entrada.name = campo.clave;

        const controles = crearElemento('div', 'record-age-controls');
        const numero = document.createElement('input');
        numero.type = 'number';
        numero.id = `${idCampo}_numero`;
        numero.className = 'form-control record-age-number';
        numero.min = '1';
        numero.max = '120';
        numero.step = '1';
        numero.inputMode = 'numeric';
        numero.placeholder = 'Cantidad';
        numero.setAttribute('aria-label', 'Cantidad de edad');

        const unidad = document.createElement('select');
        unidad.id = `${idCampo}_unidad`;
        unidad.className = 'form-select record-age-unit';
        unidad.setAttribute('aria-label', 'Unidad de edad');
        [
            { valor: 'años', texto: 'Años' },
            { valor: 'meses', texto: 'Meses' },
            { valor: 'días', texto: 'Días' }
        ].forEach((opcion) => {
            const elemento = document.createElement('option');
            elemento.value = opcion.valor;
            elemento.textContent = opcion.texto;
            unidad.appendChild(elemento);
        });

        const edadTexto = document.createElement('input');
        edadTexto.type = 'text';
        edadTexto.id = `${idCampo}_texto`;
        edadTexto.className = 'form-control record-age-custom';
        edadTexto.placeholder = 'Ej. Cachorro, adulto joven';
        edadTexto.maxLength = 60;
        edadTexto.hidden = true;
        edadTexto.setAttribute('aria-label', 'Edad escrita manualmente');

        const botonModo = crearElemento('button', 'record-age-mode', 'Escribir edad manualmente');
        botonModo.type = 'button';
        const ayuda = crearElemento('small', 'record-form-help', 'Indica una cantidad y su unidad, o utiliza texto libre si no conoces la edad exacta.');
        controles.append(numero, unidad);
        grupo.append(etiqueta, entrada, controles, edadTexto, botonModo, ayuda);

        const expresionEdad = /^\s*(\d+)\s*(años?|a[nñ]os?|mes(?:es)?|d[ií]as?|d[ií]a)?\s*$/i;
        const edadInicial = valorOriginal === null || valorOriginal === undefined ? '' : String(valorOriginal).trim();
        const coincidencia = edadInicial.match(expresionEdad);
        let modoTexto = Boolean(edadInicial) && !coincidencia;

        if (coincidencia) {
            numero.value = coincidencia[1];
            const unidadGuardada = String(coincidencia[2] || 'años').toLocaleLowerCase('es');
            unidad.value = /^mes/.test(unidadGuardada) ? 'meses' : (/^d[ií]a/.test(unidadGuardada) ? 'días' : 'años');
        } else if (modoTexto) {
            edadTexto.value = edadInicial;
        }

        const valorEdadNormalizado = () => {
            const cantidad = Number(numero.value);
            if (!numero.value || !Number.isInteger(cantidad) || cantidad < 1) return '';
            const unidadActual = unidad.value;
            if (unidadActual === 'años') return `${cantidad} ${cantidad === 1 ? 'año' : 'años'}`;
            if (unidadActual === 'meses') return `${cantidad} ${cantidad === 1 ? 'mes' : 'meses'}`;
            return `${cantidad} ${cantidad === 1 ? 'día' : 'días'}`;
        };
        const sincronizarEdad = () => {
            entrada.value = modoTexto ? edadTexto.value.trim() : valorEdadNormalizado();
        };
        const aplicarModoEdad = () => {
            controles.hidden = modoTexto;
            edadTexto.hidden = !modoTexto;
            etiqueta.htmlFor = modoTexto ? edadTexto.id : numero.id;
            numero.required = Boolean(campo.requerido && !modoTexto);
            edadTexto.required = Boolean(campo.requerido && modoTexto);
            botonModo.textContent = modoTexto ? 'Usar cantidad + unidad' : 'Escribir edad manualmente';
            sincronizarEdad();
        };
        numero.addEventListener('input', sincronizarEdad);
        unidad.addEventListener('change', sincronizarEdad);
        edadTexto.addEventListener('input', sincronizarEdad);
        botonModo.addEventListener('click', () => {
            if (!modoTexto) {
                edadTexto.value = entrada.value;
                modoTexto = true;
            } else {
                const textoActual = edadTexto.value.trim().match(expresionEdad);
                if (textoActual) {
                    numero.value = textoActual[1];
                    const unidadGuardada = String(textoActual[2] || 'años').toLocaleLowerCase('es');
                    unidad.value = /^mes/.test(unidadGuardada) ? 'meses' : (/^d[ií]a/.test(unidadGuardada) ? 'días' : 'años');
                }
                modoTexto = false;
            }
            aplicarModoEdad();
        });
        aplicarModoEdad();
        return grupo;
    }

    if (campo.tipo === 'checklist') {
        entrada = document.createElement('input');
        entrada.type = 'hidden';
        entrada.id = idCampo;
        entrada.name = campo.clave;

        const opciones = campo.opciones || [];
        const guardadas = obtenerValoresPersonalidad(valorOriginal);
        const opcionPorValor = new Map(opciones.map((opcion) => [String(opcion).toLocaleLowerCase('es'), String(opcion)]));
        const seleccionadas = guardadas.filter((valor) => opcionPorValor.has(valor.toLocaleLowerCase('es')))
            .map((valor) => opcionPorValor.get(valor.toLocaleLowerCase('es')));
        const otras = guardadas.filter((valor) => !opcionPorValor.has(valor.toLocaleLowerCase('es')));
        const cuadricula = crearElemento('div', 'record-checklist-grid');

        opciones.forEach((opcion, indice) => {
            const idOpcion = `${idCampo}_opcion_${indice}`;
            const etiquetaOpcion = crearElemento('label', 'record-check-option');
            const casilla = document.createElement('input');
            casilla.type = 'checkbox';
            casilla.className = 'form-check-input';
            casilla.id = idOpcion;
            casilla.value = opcion;
            casilla.checked = seleccionadas.includes(opcion);
            etiquetaOpcion.htmlFor = idOpcion;
            etiquetaOpcion.append(casilla, crearElemento('span', '', opcion));
            cuadricula.appendChild(etiquetaOpcion);
            casilla.addEventListener('change', actualizarChecklist);
        });

        const otrasGrupo = crearElemento('div', 'record-checklist-other');
        const otrasEtiqueta = crearElemento('label', 'form-label', 'Otras características (opcional)');
        otrasEtiqueta.htmlFor = `${idCampo}_otras`;
        const otrasEntrada = document.createElement('input');
        otrasEntrada.type = 'text';
        otrasEntrada.id = `${idCampo}_otras`;
        otrasEntrada.className = 'form-control';
        otrasEntrada.placeholder = 'Ej. Protectora, paciente…';
        otrasEntrada.value = otras.join(', ');
        otrasEntrada.maxLength = 180;
        otrasGrupo.append(otrasEtiqueta, otrasEntrada);
        const ayuda = crearElemento('small', 'record-form-help', 'Puedes marcar varias opciones. Las características personalizadas también se conservarán.');

        function actualizarChecklist() {
            const valores = [...cuadricula.querySelectorAll('input[type="checkbox"]:checked')].map((casilla) => casilla.value);
            const personalizadas = otrasEntrada.value.split(',').map((valor) => valor.trim()).filter(Boolean);
            entrada.value = JSON.stringify([...new Set([...valores, ...personalizadas])]);
        }
        otrasEntrada.addEventListener('input', actualizarChecklist);
        etiqueta.removeAttribute('for');
        cuadricula.setAttribute('role', 'group');
        cuadricula.setAttribute('aria-label', campo.titulo);
        grupo.append(etiqueta, entrada, cuadricula, otrasGrupo, ayuda);
        actualizarChecklist();
        return grupo;
    }

    if (campo.tipo === 'textarea') {
        entrada = document.createElement('textarea');
        entrada.rows = 3;
        if (campo.placeholder) entrada.placeholder = campo.placeholder;
    } else if (campo.tipo === 'select' || campo.tipo === 'select-boolean') {
        entrada = document.createElement('select');
        entrada.className = 'form-select';

        const opcionesBase = campo.tipo === 'select-boolean'
            ? [
                { valor: '', texto: 'Seleccionar…' },
                { valor: 'true', texto: 'Sí' },
                { valor: 'false', texto: 'No' }
            ]
            : [
                { valor: '', texto: 'Seleccionar…' },
                ...(campo.opciones || []).map((opcion) => typeof opcion === 'string'
                    ? { valor: opcion, texto: opcion }
                    : { valor: String(opcion.valor), texto: opcion.texto || String(opcion.valor) })
            ];

        const valorActual = valorOriginal === null || valorOriginal === undefined
            ? String(campo.default ?? '')
            : String(valorOriginal);
        const contieneValorActual = opcionesBase.some((opcion) => opcion.valor === valorActual);
        if (valorActual && !contieneValorActual) {
            opcionesBase.push({ valor: valorActual, texto: `${valorActual} (valor guardado)` });
        }

        opcionesBase.forEach((opcion) => {
            const elemento = document.createElement('option');
            elemento.value = opcion.valor;
            elemento.textContent = opcion.texto;
            entrada.appendChild(elemento);
        });
    } else {
        entrada = document.createElement('input');
        entrada.type = campo.tipo === 'url' ? 'text' : (campo.tipo || 'text');
        if (campo.tipo === 'url') {
            entrada.inputMode = 'url';
            entrada.autocomplete = 'url';
        }
        entrada.className = 'form-control';
        if (campo.placeholder) entrada.placeholder = campo.placeholder;
        if (campo.min !== undefined) entrada.min = campo.min;
        if (campo.step !== undefined) entrada.step = campo.step;
        if (campo.maxLength !== undefined) entrada.maxLength = campo.maxLength;
    }

    entrada.id = idCampo;
    entrada.name = campo.clave;
    if (campo.tipo === 'select' || campo.tipo === 'select-boolean') {
        entrada.classList.add('form-select');
    } else {
        entrada.classList.add('form-control');
    }
    if (campo.requerido) entrada.required = true;

    if (campo.tipo === 'select-boolean') {
        entrada.value = valorOriginal === true ? 'true' : valorOriginal === false ? 'false' : String(campo.default ?? '');
    } else if (valorOriginal !== null && valorOriginal !== undefined) {
        entrada.value = String(valorOriginal);
    } else if (campo.default !== undefined) {
        entrada.value = String(campo.default);
    }

    grupo.append(etiqueta, entrada);

    if (campo.clave === 'imagen_url') {
        const bucket = campo.bucket || '';
        const archivo = document.createElement('input');
        archivo.type = 'file';
        archivo.accept = 'image/*';
        archivo.className = 'form-control record-image-file';
        archivo.name = 'image_file';
        archivo.dataset.bucket = bucket;
        archivo.setAttribute('aria-label', 'Seleccionar una imagen desde el equipo');

        const vista = crearElemento('div', 'record-form-image-preview');
        vista.hidden = true;
        const foto = document.createElement('img');
        foto.alt = 'Vista previa de la imagen';
        foto.loading = 'lazy';
        vista.appendChild(foto);
        const aviso = crearElemento('small', 'record-form-help record-form-image-error', 'No se pudo cargar la imagen guardada. Comprueba que el archivo exista y que el bucket de Supabase permita leerlo.');
        aviso.hidden = true;

        if (entrada.value.trim()) {
            vista.hidden = false;
            cargarImagenConAlternativas(foto, entrada.value, bucket).then((correcta) => {
                vista.hidden = !correcta;
                aviso.hidden = correcta;
            });
        }

        entrada.addEventListener('input', () => {
            archivo.value = '';
            const valor = entrada.value.trim();
            if (!valor) {
                vista.hidden = true;
                aviso.hidden = true;
                foto.removeAttribute('src');
                return;
            }
            vista.hidden = false;
            cargarImagenConAlternativas(foto, valor, bucket).then((correcta) => {
                vista.hidden = !correcta;
                aviso.hidden = correcta;
            });
        });

        archivo.addEventListener('change', () => {
            const fichero = archivo.files?.[0];
            if (!fichero) return;
            if (!fichero.type.startsWith('image/')) {
                mostrarMensaje('Selecciona un archivo de imagen válido.', 'error');
                archivo.value = '';
                return;
            }
            if (fichero.size > 5 * 1024 * 1024) {
                mostrarMensaje('La imagen no puede superar los 5 MB.', 'error');
                archivo.value = '';
                return;
            }
            entrada.value = '';
            aviso.hidden = true;
            vista.hidden = false;
            foto.src = '';
            const lector = new FileReader();
            lector.onload = () => {
                foto.src = String(lector.result || '');
                vista.hidden = !lector.result;
            };
            lector.onerror = () => mostrarMensaje('No se pudo previsualizar la imagen seleccionada.', 'error');
            lector.readAsDataURL(fichero);
        });

        grupo.append(
            crearElemento('small', 'record-form-help', 'Pega una URL HTTPS o selecciona una imagen del equipo. Se guardará en el bucket de Supabase correspondiente.'),
            archivo,
            vista,
            aviso
        );
    }

    return grupo;
}

function abrirFormularioRegistro(nombreSeccion, registro = null) {
    if (!['mascotas', 'productos'].includes(nombreSeccion)) {
        mostrarMensaje(
            'La edición está disponible únicamente para mascotas y productos.',
            'error'
        );
        return;
    }

    cerrarDetalleRegistro();

    const contenedor = obtenerContenedorFormulario();
    const campos = definirCamposFormulario(nombreSeccion);
    const esEdicion = Boolean(registro);

    contenedor.replaceChildren();
    contenedor.hidden = false;

    const encabezado = crearElemento('div', 'record-form-header');

    encabezado.append(
        crearElemento(
            'h3',
            'record-form-title',
            esEdicion
                ? `Editar ${nombreSeccion === 'mascotas' ? 'mascota' : 'producto'}`
                : `Registrar ${nombreSeccion === 'mascotas' ? 'mascota' : 'producto'}`
        ),
        crearElemento(
            'p',
            'record-form-description',
            'Completa los campos y guarda los cambios. Los campos con asterisco son obligatorios.'
        )
    );

    const formulario = document.createElement('form');
    formulario.id = 'formularioRegistro';
    formulario.className = 'record-form';
    formulario.noValidate = false;

    const cuadrilla = crearElemento('div', 'record-form-grid');

    campos.forEach((campo) => {
        cuadrilla.appendChild(crearCampoFormulario(campo, registro || {}));
    });

    const acciones = crearElemento('div', 'record-form-actions');

    const botonGuardar = crearElemento(
        'button',
        'btn btn-primary',
        esEdicion ? 'Guardar cambios' : 'Crear registro'
    );

    botonGuardar.type = 'submit';

    const botonCancelar = crearElemento(
        'button',
        'btn btn-secondary',
        'Cancelar'
    );

    botonCancelar.type = 'button';
    botonCancelar.addEventListener('click', cerrarFormularioRegistro);

    acciones.append(botonGuardar, botonCancelar);
    formulario.append(cuadrilla, acciones);
    contenedor.append(encabezado, formulario);

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        if (formularioGuardando) return;

        if (!formulario.reportValidity()) return;

        const datos = {};

        for (const campo of campos) {
            const entrada = formulario.elements.namedItem(campo.clave);

            if (!entrada) continue;

            let valor = entrada.value.trim();

            if (campo.tipo === 'checklist') {
                let seleccionadas = [];
                try {
                    const parseadas = JSON.parse(valor || '[]');
                    if (Array.isArray(parseadas)) {
                        seleccionadas = parseadas.map((item) => String(item).trim()).filter(Boolean);
                    }
                } catch {
                    seleccionadas = valor.split(',').map((item) => item.trim()).filter(Boolean);
                }
                datos[campo.clave] = seleccionadas.length ? JSON.stringify([...new Set(seleccionadas)]) : null;
                continue;
            }

            if (campo.tipo === 'select-boolean') {
                valor = valor === ''
                    ? null
                    : valor === 'true';
            } else if (campo.tipo === 'number' && valor !== '') {
                valor = Number(valor);

                if (!Number.isFinite(valor)) {
                    entrada.focus();
                    mostrarMensaje(
                        `El campo "${campo.titulo}" debe contener un número válido.`,
                        'error'
                    );
                    return;
                }
            } else if (valor === '') {
                valor = null;
            }

            if (campo.clave === 'imagen_url' && valor !== null) {
                const url = obtenerUrlImagen(valor, campo.bucket || (nombreSeccion === 'productos' ? 'productos' : 'mascotas'));

                if (!url) {
                    entrada.focus();
                    mostrarMensaje(
                        'La URL de la imagen debe ser una dirección HTTP o HTTPS válida.',
                        'error'
                    );
                    return;
                }

                valor = url;
            }

            datos[campo.clave] = valor;
        }

        if (
            nombreSeccion === 'productos' &&
            (!Number.isFinite(datos.precio) || datos.precio < 0)
        ) {
            mostrarMensaje('El precio debe ser un número igual o mayor que cero.', 'error');
            return;
        }

        if (
            nombreSeccion === 'productos' &&
            (!Number.isInteger(datos.stock) || datos.stock < 0)
        ) {
            mostrarMensaje('El stock debe ser un número entero igual o mayor que cero.', 'error');
            return;
        }

        const campoImagen = formulario.querySelector('input[name="image_file"]');
        const archivoImagen = campoImagen?.files?.[0] || null;
        const bucketImagen = campoImagen?.dataset.bucket || '';

        if (archivoImagen && (!archivoImagen.type.startsWith('image/') || archivoImagen.size > 5 * 1024 * 1024)) {
            mostrarMensaje('La imagen debe ser un archivo válido y no superar los 5 MB.', 'error');
            return;
        }

        formularioGuardando = true;
        botonGuardar.disabled = true;
        botonCancelar.disabled = true;
        botonGuardar.textContent = 'Guardando…';

        try {
            const configuracion = configuracionDatos[nombreSeccion];

            if (archivoImagen) {
                const extension = (archivoImagen.name.split('.').pop() || 'jpg')
                    .toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
                const nombreArchivo = `${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}.${extension}`;
                const { error: errorSubida } = await supabaseClient.storage
                    .from(bucketImagen)
                    .upload(nombreArchivo, archivoImagen, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: archivoImagen.type
                    });
                if (errorSubida) throw new Error(`No se pudo subir la imagen: ${errorSubida.message}`);
                const { data: urlPublica } = supabaseClient.storage
                    .from(bucketImagen)
                    .getPublicUrl(nombreArchivo);
                if (!urlPublica?.publicUrl) throw new Error('Supabase no devolvió la URL pública de la imagen.');
                datos.imagen_url = urlPublica.publicUrl;
            }

            const claveId = nombreSeccion === 'mascotas'
                ? 'id_mascota'
                : 'id_producto';

            let resultado;

            if (esEdicion) {
                resultado = await supabaseClient
                    .from(configuracion.tabla)
                    .update(datos)
                    .eq(claveId, registro[claveId])
                    .select(configuracion.columnas.map((c) => c.clave).join(', '));

                if (resultado.error) throw resultado.error;

                if (!resultado.data || resultado.data.length === 0) {
                    throw new Error(
                        'No se confirmó la actualización. Comprueba que el registro exista y que las políticas RLS permitan actualizarlo.'
                    );
                }
            } else {
                resultado = await supabaseClient
                    .from(configuracion.tabla)
                    .insert(datos)
                    .select(configuracion.columnas.map((c) => c.clave).join(', '));

                if (resultado.error) throw resultado.error;

                if (!resultado.data || resultado.data.length === 0) {
                    throw new Error(
                        'No se confirmó la creación del registro. Comprueba los permisos de inserción y las políticas RLS.'
                    );
                }
            }

            cerrarFormularioRegistro();

            mostrarMensaje(
                esEdicion
                    ? 'Los cambios se guardaron correctamente.'
                    : 'El registro se creó correctamente.',
                'info'
            );

            await cargarDatosModulo(nombreSeccion);
            await actualizarIndicadores();
        } catch (error) {
            console.error('Error al guardar el registro:', error);

            mostrarMensaje(
                `No se pudo guardar el registro. ${error.message || 'Error desconocido'}. Los datos introducidos permanecen en el formulario para que puedas corregirlos e intentarlo de nuevo.`,
                'error'
            );

            botonGuardar.disabled = false;
            botonCancelar.disabled = false;
            botonGuardar.textContent = esEdicion
                ? 'Guardar cambios'
                : 'Crear registro';
        } finally {
            formularioGuardando = false;
        }
    });

    contenedor.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/* =========================================================
   CREAR Y ELIMINAR REGISTROS
========================================================= */

async function eliminarRegistro(nombreSeccion, registro) {
    if (!['mascotas', 'productos'].includes(nombreSeccion)) {
        mostrarMensaje(
            'La eliminación está disponible únicamente para mascotas y productos.',
            'error'
        );
        return;
    }

    const esMascota = nombreSeccion === 'mascotas';
    const claveId = esMascota ? 'id_mascota' : 'id_producto';
    const identificador = registro[claveId];
    const nombreRegistro = registro.nombre || `ID ${identificador}`;

    const confirmado = window.confirm(
        `¿Seguro que deseas eliminar ${esMascota ? 'la mascota' : 'el producto'} "${nombreRegistro}"?\n\nEsta acción no se puede deshacer. Si existen registros relacionados o restricciones de la base de datos, Supabase puede rechazar la operación.`
    );

    if (!confirmado) return;

    try {
        if (esMascota) {
            const [respuestaFichas, respuestaSolicitudes] = await Promise.all([
                supabaseClient.from('fichas_adopcion')
                    .select('id_ficha', { count: 'exact', head: true })
                    .eq('id_mascota', identificador),
                supabaseClient.from('solicitudes')
                    .select('id_solicitud', { count: 'exact', head: true })
                    .eq('tipo', 'ADOPCION')
                    .eq('ref_id', identificador)
            ]);
            if (respuestaFichas.error) throw respuestaFichas.error;
            if (respuestaSolicitudes.error) throw respuestaSolicitudes.error;
            const totalFichas = respuestaFichas.count || 0;
            const totalSolicitudes = respuestaSolicitudes.count || 0;
            if (totalFichas || totalSolicitudes) {
                throw new Error(`No se puede eliminar porque tiene ${totalFichas} ficha(s) de adopción y ${totalSolicitudes} solicitud(es) relacionadas. Para conservar el historial, cambia su estado en lugar de eliminarla.`);
            }
        } else {
            const { count, error: errorRelacionados } = await supabaseClient
                .from('pedido_items')
                .select('id_item', { count: 'exact', head: true })
                .eq('id_producto', identificador);
            if (errorRelacionados) throw errorRelacionados;
            if (count) {
                throw new Error(`No se puede eliminar porque aparece en ${count} línea(s) del historial de pedidos. Puedes editar el stock o conservar el producto para no perder trazabilidad.`);
            }
        }

        const { data, error } = await supabaseClient
            .from(configuracionDatos[nombreSeccion].tabla)
            .delete()
            .eq(claveId, identificador)
            .select(claveId);

        if (error) throw error;

        if (!data || data.length === 0) {
            throw new Error(
                'No se confirmó la eliminación. El registro puede no existir o las políticas RLS pueden impedir eliminarlo.'
            );
        }

        mostrarMensaje('El registro se eliminó correctamente.', 'info');

        cerrarFormularioRegistro();
        cerrarDetalleRegistro();

        await cargarDatosModulo(nombreSeccion);
        await actualizarIndicadores();
    } catch (error) {
        console.error('Error al eliminar el registro:', error);

        mostrarMensaje(
            `No se pudo eliminar el registro. ${error.message || 'Error desconocido'}. No se realizaron cambios confirmados en el panel.`,
            'error'
        );
    }
}

/* =========================================================
   BÚSQUEDA, FILTROS Y ORDENAMIENTO
========================================================= */

function crearCampoFiltro(etiquetaTexto, control) {
    const grupo = crearElemento('label', 'module-filter-field');
    grupo.append(
        crearElemento('span', '', etiquetaTexto),
        control
    );
    return grupo;
}

function crearSelectFiltro(id, opciones, valorInicial = '') {
    const select = document.createElement('select');
    select.id = id;
    select.className = 'form-select module-filter-control';

    opciones.forEach((opcion) => {
        const elemento = document.createElement('option');
        elemento.value = opcion.valor;
        elemento.textContent = opcion.texto;
        select.appendChild(elemento);
    });

    select.value = valorInicial;
    return select;
}

function opcionesOrdenModulo(nombreSeccion) {
    const opciones = {
        mascotas: [
            { valor: 'id_mascota:desc', texto: 'Más recientes' },
            { valor: 'nombre:asc', texto: 'Nombre A–Z' },
            { valor: 'nombre:desc', texto: 'Nombre Z–A' }
        ],
        productos: [
            { valor: 'id_producto:desc', texto: 'Más recientes' },
            { valor: 'nombre:asc', texto: 'Nombre A–Z' },
            { valor: 'precio:asc', texto: 'Precio: menor a mayor' },
            { valor: 'precio:desc', texto: 'Precio: mayor a menor' },
            { valor: 'stock:asc', texto: 'Menor stock primero' }
        ],
        inventario: [
            { valor: 'stock:asc', texto: 'Menor stock primero' },
            { valor: 'stock:desc', texto: 'Mayor stock primero' },
            { valor: 'nombre:asc', texto: 'Nombre A–Z' },
            { valor: 'precio:asc', texto: 'Precio: menor a mayor' }
        ],
        compras: [
            { valor: 'fecha:desc', texto: 'Más recientes' },
            { valor: 'fecha:asc', texto: 'Más antiguas' },
            { valor: 'total:desc', texto: 'Mayor importe' },
            { valor: 'total:asc', texto: 'Menor importe' }
        ],
        adopciones: [
            { valor: 'fecha:desc', texto: 'Más recientes' },
            { valor: 'fecha:asc', texto: 'Más antiguas' },
            { valor: 'estado:asc', texto: 'Estado A–Z' }
        ],
        reportes: [
            { valor: 'created_at:desc', texto: 'Más recientes' },
            { valor: 'created_at:asc', texto: 'Más antiguos' },
            { valor: 'pet_name:asc', texto: 'Nombre A–Z' }
        ]
    };
    return opciones[nombreSeccion] || [];
}

function configurarFiltrosModulo(nombreSeccion) {
    const contenedor = $('#filtrosModulo');
    if (!contenedor) return;

    contenedor.replaceChildren();
    contenedor.hidden = false;

    const busqueda = document.createElement('input');
    busqueda.type = 'search';
    busqueda.id = 'filtroBusqueda';
    busqueda.className = 'form-control module-filter-control module-search-control';
    busqueda.placeholder = 'Buscar por nombre, ID, estado…';
    busqueda.setAttribute('aria-label', 'Buscar en los registros');
    const campoBusqueda = crearCampoFiltro('Buscar', busqueda);
    campoBusqueda.classList.add('module-filter-search-field');
    contenedor.appendChild(campoBusqueda);

    if (['mascotas', 'compras', 'adopciones'].includes(nombreSeccion)) {
        const valoresEstado = nombreSeccion === 'mascotas'
            ? ['DISPONIBLE', 'EN_PROCESO', 'ADOPTADO']
            : nombreSeccion === 'compras'
                ? ['PENDIENTE_PAGO', 'PAGADO', 'ENTREGADO', 'RECHAZADO', 'VENCIDO']
                : ['PENDIENTE', 'APROBADA', 'RECHAZADA'];
        const select = crearSelectFiltro('filtroEstado', [
            { valor: '', texto: 'Todos los estados' },
            ...valoresEstado.map((valor) => ({ valor, texto: traducirEstado(valor) }))
        ]);
        contenedor.appendChild(crearCampoFiltro('Estado', select));
    } else if (nombreSeccion === 'reportes') {
        const select = crearSelectFiltro('filtroEstado', [{ valor: '', texto: 'Todos los estados' }]);
        contenedor.appendChild(crearCampoFiltro('Estado', select));
    }

    if (nombreSeccion === 'mascotas') {
        const especies = crearSelectFiltro('filtroEspecie', [
            { valor: '', texto: 'Todas las especies' }
        ]);
        contenedor.appendChild(crearCampoFiltro('Especie', especies));
    }

    if (['compras', 'adopciones', 'reportes'].includes(nombreSeccion)) {
        const desde = document.createElement('input');
        desde.type = 'date';
        desde.id = 'filtroDesde';
        desde.className = 'form-control module-filter-control';
        desde.setAttribute('aria-label', 'Filtrar desde la fecha');
        contenedor.appendChild(crearCampoFiltro('Desde', desde));

        const hasta = document.createElement('input');
        hasta.type = 'date';
        hasta.id = 'filtroHasta';
        hasta.className = 'form-control module-filter-control';
        hasta.setAttribute('aria-label', 'Filtrar hasta la fecha');
        contenedor.appendChild(crearCampoFiltro('Hasta', hasta));
    }

    if (['productos', 'inventario'].includes(nombreSeccion)) {
        const select = crearSelectFiltro('filtroCategoria', [
            { valor: '', texto: 'Todas las categorías' },
            { valor: 'ALIMENTO', texto: 'ALIMENTO' },
            { valor: 'HIGIENE', texto: 'HIGIENE' }
        ]);
        contenedor.appendChild(crearCampoFiltro('Categoría', select));

        const bajoStock = document.createElement('input');
        bajoStock.type = 'checkbox';
        bajoStock.id = 'filtroStockBajo';
        bajoStock.className = 'form-check-input';
        const etiquetaStock = crearElemento('label', 'module-filter-check', 'Solo stock bajo (≤ 5)');
        etiquetaStock.htmlFor = 'filtroStockBajo';
        etiquetaStock.prepend(bajoStock);
        contenedor.appendChild(etiquetaStock);
    }

    const orden = crearSelectFiltro('filtroOrden', opcionesOrdenModulo(nombreSeccion));
    if (orden.options.length) {
        const valorDefecto = nombreSeccion === 'inventario'
            ? 'stock:asc'
            : (nombreSeccion === 'productos' ? 'id_producto:desc' : '');
        if (valorDefecto && [...orden.options].some((option) => option.value === valorDefecto)) {
            orden.value = valorDefecto;
        }
        contenedor.appendChild(crearCampoFiltro('Ordenar por', orden));
    }

    contenedor.querySelectorAll('input, select').forEach((control) => {
        control.addEventListener('input', renderizarModuloFiltrado);
        control.addEventListener('change', renderizarModuloFiltrado);
    });

    const limpiar = crearBotonAccion(
        'Limpiar filtros',
        'bi-arrow-counterclockwise',
        'btn btn-outline-secondary btn-sm module-filter-reset',
        () => {
            contenedor.querySelectorAll('input, select').forEach((control) => {
                if (control.type === 'checkbox') control.checked = false;
                else control.value = '';
            });
            const ordenControl = $('#filtroOrden');
            if (ordenControl && nombreSeccion === 'inventario') ordenControl.value = 'stock:asc';
            if (ordenControl && nombreSeccion === 'productos') ordenControl.value = 'id_producto:desc';
            renderizarModuloFiltrado();
        }
    );
    contenedor.appendChild(limpiar);
}

function actualizarEstadosDinamicosFiltro() {
    if (moduloActual === 'reportes') {
        const selectEstado = $('#filtroEstado');
        if (selectEstado) {
            const seleccionado = selectEstado.value;
            const estados = [...new Set(registrosActuales
                .map((registro) => String(registro.status || '').trim())
                .filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

            selectEstado.replaceChildren();
            const todos = document.createElement('option');
            todos.value = '';
            todos.textContent = 'Todos los estados';
            selectEstado.appendChild(todos);
            estados.forEach((estado) => {
                const opcion = document.createElement('option');
                opcion.value = estado;
                opcion.textContent = traducirEstado(estado);
                selectEstado.appendChild(opcion);
            });
            if (estados.includes(seleccionado)) selectEstado.value = seleccionado;
        }
    }

    if (moduloActual === 'mascotas') {
        const selectEspecie = $('#filtroEspecie');
        if (selectEspecie) {
            const seleccionado = selectEspecie.value;
            const especies = [...new Set(registrosActuales
                .map((registro) => String(registro.especie || '').trim())
                .filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

            selectEspecie.replaceChildren();
            const todas = document.createElement('option');
            todas.value = '';
            todas.textContent = 'Todas las especies';
            selectEspecie.appendChild(todas);
            especies.forEach((especie) => {
                const opcion = document.createElement('option');
                opcion.value = especie;
                opcion.textContent = especie;
                selectEspecie.appendChild(opcion);
            });
            if (especies.includes(seleccionado)) selectEspecie.value = seleccionado;
        }
    }
}

function obtenerRegistrosFiltrados() {
    const busqueda = ($('#filtroBusqueda')?.value || '').trim().toLocaleLowerCase('es');
    const estado = $('#filtroEstado')?.value || '';
    const categoria = $('#filtroCategoria')?.value || '';
    const especie = $('#filtroEspecie')?.value || '';
    const desde = $('#filtroDesde')?.value || '';
    const hasta = $('#filtroHasta')?.value || '';
    const soloStockBajo = Boolean($('#filtroStockBajo')?.checked);
    const ordenSeleccionado = $('#filtroOrden')?.value || '';

    let filas = registrosActuales.filter((registro) => {
        if (busqueda) {
            const texto = Object.values(registro).map((valor) => {
                if (valor && typeof valor === 'object') {
                    try { return JSON.stringify(valor); } catch { return ''; }
                }
                return String(valor ?? '');
            }).join(' ').toLocaleLowerCase('es');
            if (!texto.includes(busqueda)) return false;
        }

        if (estado) {
            const valorEstado = moduloActual === 'reportes'
                ? registro.status
                : registro.estado;
            if (String(valorEstado ?? '') !== estado) return false;
        }

        if (categoria && String(registro.categoria ?? '') !== categoria) return false;
        if (especie && String(registro.especie ?? '') !== especie) return false;

        if (desde || hasta) {
            const fechaRegistro = moduloActual === 'reportes'
                ? registro.created_at
                : registro.fecha;
            const fechaDia = fechaRegistro ? String(fechaRegistro).slice(0, 10) : '';
            if (!fechaDia) return false;
            if (desde && fechaDia < desde) return false;
            if (hasta && fechaDia > hasta) return false;
        }

        if (soloStockBajo && !(Number.isFinite(Number(registro.stock)) && Number(registro.stock) <= 5)) {
            return false;
        }

        return true;
    });

    if (ordenSeleccionado) {
        const [clave, sentido] = ordenSeleccionado.split(':');
        const multiplicador = sentido === 'desc' ? -1 : 1;
        filas = [...filas].sort((a, b) => {
            const av = a[clave];
            const bv = b[clave];
            if (av === null || av === undefined) return 1;
            if (bv === null || bv === undefined) return -1;
            if (clave === 'fecha' || clave === 'created_at') {
                return (new Date(av).getTime() - new Date(bv).getTime()) * multiplicador;
            }
            if (typeof av === 'number' || typeof bv === 'number' || ['precio', 'stock', 'total', 'id_mascota', 'id_producto', 'id_pedido', 'id_solicitud'].includes(clave)) {
                return (Number(av) - Number(bv)) * multiplicador;
            }
            return String(av).localeCompare(String(bv), 'es', { numeric: true, sensitivity: 'base' }) * multiplicador;
        });
    }

    return filas;
}

function renderizarModuloFiltrado() {
    const configuracion = configuracionDatos[moduloActual];
    if (!configuracion || !Array.isArray(registrosActuales)) return;

    const filas = obtenerRegistrosFiltrados();
    if (['mascotas', 'productos'].includes(moduloActual)) {
        mostrarTarjetasModulo(moduloActual, filas);
    } else {
        mostrarFilasModulo(configuracion, filas, moduloActual);
    }

    if (moduloActual === 'inventario') {
        const bajoStock = filas.filter((producto) => Number.isFinite(Number(producto.stock)) && Number(producto.stock) <= 5).length;
        const mensaje = filas.length === 0 && registrosActuales.length > 0
            ? 'Ningún producto coincide con los filtros actuales.'
            : bajoStock > 0
                ? `Se muestran ${filas.length} productos; ${bajoStock} tienen cinco unidades o menos.`
                : `Se muestran ${filas.length} de ${registrosActuales.length} productos. No hay stock bajo entre los resultados filtrados.`;
        const mensajeCompleto = hayMasRegistros
            ? `${mensaje} Hay más productos para cargar.`
            : mensaje;
        mostrarEstadoModulo(mensajeCompleto, bajoStock > 0 ? 'warning' : 'info');
    }
}

/* =========================================================
   BOTONES DE ACCIÓN DE LOS MÓDULOS
========================================================= */

function configurarAccionesModulo(nombreSeccion) {
    const contenedor = $('#accionesModulo');

    if (!contenedor) return;

    contenedor.replaceChildren();

    configurarFiltrosModulo(nombreSeccion);

    const esMascota = nombreSeccion === 'mascotas';

    if (!['mascotas', 'productos'].includes(nombreSeccion)) {
        const botonActualizar = crearElemento('button', 'btn btn-secondary module-refresh-button');
        botonActualizar.type = 'button';
        botonActualizar.append(
            crearElemento('i', 'bi bi-arrow-clockwise me-2'),
            document.createTextNode('Actualizar')
        );
        botonActualizar.addEventListener('click', () => void cargarDatosModulo(nombreSeccion));
        contenedor.appendChild(botonActualizar);
        return;
    }

    const botonCrear = crearElemento(
        'button',
        'btn btn-primary module-create-button'
    );

    botonCrear.type = 'button';
    botonCrear.append(
        crearElemento(
            'i',
            `bi ${esMascota ? 'bi-plus-circle' : 'bi-plus-square'} me-2`
        ),
        document.createTextNode(
            esMascota ? 'Registrar mascota' : 'Registrar producto'
        )
    );

    botonCrear.addEventListener('click', () => {
        abrirFormularioRegistro(nombreSeccion);
    });

    const botonActualizar = crearElemento(
        'button',
        'btn btn-secondary module-refresh-button'
    );

    botonActualizar.type = 'button';
    botonActualizar.append(
        crearElemento('i', 'bi bi-arrow-clockwise me-2'),
        document.createTextNode('Actualizar')
    );

    botonActualizar.addEventListener('click', () => {
        void cargarDatosModulo(nombreSeccion);
    });

    contenedor.append(botonCrear, botonActualizar);
}

/* =========================================================
   EXPEDIENTES DE COMPRAS Y ADOPCIONES
========================================================= */

function abrirBoletaPedido(idPedido, codigoPublico = false) {
    const ruta = new URL('../cliente/boleta.html', window.location.href);
    ruta.search = '';
    if (codigoPublico) {
        ruta.searchParams.set('codigo', codigoPublico);
    } else {
        ruta.searchParams.set('pedido', String(idPedido));
    }

    const ventana = window.open(ruta.href, '_blank');
    if (!ventana) {
        mostrarMensaje('No se pudo abrir la boleta. Comprueba la configuración de ventanas de la aplicación.', 'error');
    }
}

function crearDatoDetalle(etiqueta, valor) {
    const elemento = crearElemento('div', 'record-detail-item');
    elemento.append(
        crearElemento('dt', 'record-detail-label', etiqueta),
        crearElemento('dd', 'record-detail-value', formatearValor(valor))
    );
    return elemento;
}

function mostrarDetalleItemsPedido(contenedor, items) {
    const bloque = crearElemento('section', 'purchase-items-panel');
    bloque.appendChild(crearElemento('h4', 'record-detail-section-title', 'Productos de la compra'));

    if (!items.length) {
        bloque.appendChild(crearElemento('p', 'overview-empty', 'Este pedido no tiene productos visibles en pedido_items.'));
        contenedor.appendChild(bloque);
        return;
    }

    const tablaContenedor = crearElemento('div', 'module-table-wrapper purchase-items-table-wrapper');
    const tabla = crearElemento('table', 'table module-table purchase-items-table');
    const thead = document.createElement('thead');
    const filaCabecera = document.createElement('tr');
    ['Producto', 'Cantidad', 'Precio unitario', 'Subtotal'].forEach((titulo) => {
        filaCabecera.appendChild(crearCelda(titulo, true));
    });
    thead.appendChild(filaCabecera);

    const tbody = document.createElement('tbody');
    items.forEach((item) => {
        const fila = document.createElement('tr');
        fila.append(
            crearCelda(formatearValor(item.nombre_producto)),
            crearCelda(formatearValor(item.cantidad)),
            crearCelda(formatearValor(item.precio_unitario, 'moneda')),
            crearCelda(formatearValor(item.subtotal, 'moneda'))
        );
        tbody.appendChild(fila);
    });

    tabla.append(thead, tbody);
    tablaContenedor.appendChild(tabla);
    bloque.appendChild(tablaContenedor);
    contenedor.appendChild(bloque);
}

async function mostrarDetalleCompra(registro) {
    const panel = obtenerPanelDetalles();
    panel.replaceChildren();
    panel.hidden = false;

    const encabezado = crearElemento('div', 'record-detail-header');
    const grupoTitulo = crearElemento('div', 'record-detail-heading');
    grupoTitulo.append(
        crearElemento('h3', 'record-detail-title', `Compra #${registro.id_pedido}`),
        crearElemento('p', 'record-detail-subtitle', 'Detalle privado del pedido y acceso a sus boletas')
    );
    const cerrar = crearElemento('button', 'record-detail-close btn btn-outline-secondary btn-sm', 'Cerrar');
    cerrar.type = 'button';
    cerrar.addEventListener('click', cerrarDetalleRegistro);
    encabezado.append(grupoTitulo, cerrar);

    const estado = crearEstadoTarjeta(registro.estado);
    const listaResumen = crearElemento('dl', 'record-detail-grid purchase-detail-summary');
    listaResumen.append(
        crearDatoDetalle('Estado', registro.estado),
        crearDatoDetalle('Comprador', registro.nombre_comprador),
        crearDatoDetalle('Documento', [registro.tipo_documento, registro.numero_documento].filter(Boolean).join(': ') || 'No registrado'),
        crearDatoDetalle('Fecha del pedido', formatearValor(registro.fecha, 'fecha')),
        crearDatoDetalle('Total', formatearValor(registro.total, 'moneda')),
        crearDatoDetalle('Número de boleta', registro.numero_boleta),
        crearDatoDetalle('Código público de boleta', registro.boleta_codigo),
        crearDatoDetalle('Referencia de pago', registro.pago_referencia),
        crearDatoDetalle('Pago confirmado', formatearValor(registro.pagado_en, 'fecha')),
        crearDatoDetalle('Entrega', formatearValor(registro.entregado_en, 'fecha')),
        crearDatoDetalle('Vencimiento', formatearValor(registro.vence_en, 'fecha')),
        crearDatoDetalle('Motivo de rechazo', registro.motivo_rechazo)
    );

    const estadoFila = crearElemento('div', 'purchase-detail-state');
    estadoFila.append(crearElemento('span', 'record-detail-label', 'Estado actual'), estado);

    const cargando = crearElemento('p', 'overview-empty', 'Cargando artículos y perfil del comprador…');
    panel.append(encabezado, estadoFila, listaResumen, cargando);
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
        const [respuestaItems, respuestaPerfil] = await Promise.all([
            supabaseClient.from('pedido_items')
                .select('id_item, id_pedido, id_producto, nombre_producto, precio_unitario, cantidad, subtotal')
                .eq('id_pedido', Number(registro.id_pedido))
                .order('id_item', { ascending: true }),
            supabaseClient.from('perfiles')
                .select('nombre')
                .eq('id', registro.id_usuario)
                .maybeSingle()
        ]);

        if (respuestaItems.error) throw respuestaItems.error;
        if (respuestaPerfil.error) throw respuestaPerfil.error;

        const perfilNombre = respuestaPerfil.data?.nombre || '';
        const comprador = registro.nombre_comprador || perfilNombre || 'No registrado';
        listaResumen.querySelectorAll('.record-detail-item').forEach((elemento) => {
            if (elemento.querySelector('dt')?.textContent === 'Comprador') {
                elemento.querySelector('dd').textContent = comprador;
            }
        });
        cargando.remove();

        const items = respuestaItems.data || [];
        mostrarDetalleItemsPedido(panel, items);

        const acciones = crearElemento('div', 'record-detail-actions purchase-detail-actions');
        const esPagado = ['PAGADO', 'ENTREGADO'].includes(String(registro.estado || '').toUpperCase());
        const botonPrivado = crearBotonAccion(
            'Boleta privada', 'bi-person-vcard', 'btn btn-primary btn-sm',
            () => abrirBoletaPedido(registro.id_pedido)
        );
        botonPrivado.disabled = !esPagado;
        botonPrivado.title = esPagado ? 'Abrir la boleta privada con los datos del comprador' : 'Disponible cuando el pago se encuentre confirmado';

        const botonPublico = crearBotonAccion(
            'Boleta pública', 'bi-qr-code', 'btn btn-outline-primary btn-sm',
            () => abrirBoletaPedido(registro.id_pedido, registro.boleta_codigo)
        );
        botonPublico.disabled = !esPagado || !registro.boleta_codigo;
        botonPublico.title = botonPublico.disabled
            ? 'La consulta pública requiere pago confirmado y código de boleta'
            : 'Abrir la boleta pública sin datos personales';

        const botonCopiar = crearBotonAccion(
            'Copiar código', 'bi-clipboard', 'btn btn-outline-secondary btn-sm',
            async () => {
                if (!registro.boleta_codigo) {
                    mostrarMensaje('Esta compra todavía no tiene código público de boleta.', 'error');
                    return;
                }
                try {
                    await navigator.clipboard.writeText(String(registro.boleta_codigo));
                    mostrarMensaje('Código público copiado.', 'info');
                } catch {
                    window.prompt('Copia el código público de la boleta:', String(registro.boleta_codigo));
                }
            }
        );
        botonCopiar.disabled = !registro.boleta_codigo;
        acciones.append(botonPrivado, botonPublico, botonCopiar);
        panel.appendChild(acciones);
    } catch (error) {
        console.error('Error al cargar el detalle de la compra:', error);
        cargando.className = 'module-state module-state-error';
        cargando.textContent = `No se pudo cargar el detalle de la compra. ${error.message || 'Comprueba los permisos de pedido_items y perfiles.'}`;
    }
}

async function mostrarDetalleSolicitud(registro) {
    mostrarDetalleRegistro(configuracionDatos.adopciones, registro);
    const panel = $('#panelDetalleRegistro');
    if (!panel) return;

    const bloque = crearElemento('section', 'adoption-detail-related');
    bloque.appendChild(crearElemento('h4', 'record-detail-section-title', 'Mascota y seguimiento'));
    bloque.appendChild(crearElemento('p', 'overview-empty', 'Consultando los datos relacionados…'));
    const acciones = panel.querySelector('.record-detail-actions');
    if (acciones) panel.insertBefore(bloque, acciones);
    else panel.appendChild(bloque);

    try {
        const [respuestaMascota, respuestaFicha] = await Promise.all([
            supabaseClient.from('mascotas')
                .select('id_mascota,nombre,especie,raza,edad,sexo,estado,imagen_url')
                .eq('id_mascota', Number(registro.ref_id))
                .maybeSingle(),
            supabaseClient.from('fichas_adopcion')
                .select('id_ficha,codigo,id_solicitud,id_mascota,id_usuario,dni,fecha_adopcion,nombre_mascota,especie,raza,edad,sexo,imagen_url,tipo_documento,numero_documento,fecha_nacimiento')
                .eq('id_solicitud', Number(registro.id_solicitud))
                .maybeSingle()
        ]);
        if (respuestaMascota.error) throw respuestaMascota.error;
        if (respuestaFicha.error) throw respuestaFicha.error;
        const mascota = respuestaMascota.data;
        const ficha = respuestaFicha.data;
        bloque.replaceChildren(crearElemento('h4', 'record-detail-section-title', 'Mascota y seguimiento'));

        if (mascota) {
            const tarjetaMascota = crearElemento('div', 'adoption-pet-mini-card');
            const imagen = crearImagenTarjeta(mascota.imagen_url, `Fotografía de ${mascota.nombre}`, 'mascota');
            const detalles = crearElemento('div', 'adoption-pet-mini-info');
            detalles.append(
                crearElemento('strong', '', mascota.nombre || 'Mascota sin nombre'),
                crearElemento('span', '', [mascota.especie, mascota.raza].filter(Boolean).join(' · ') || 'Especie no indicada'),
                crearElemento('span', '', `Edad: ${mascota.edad || 'No registrada'} · Sexo: ${mascota.sexo || 'No registrado'}`),
                crearElemento('span', '', `Estado: ${mascota.estado || 'No registrado'}`)
            );
            tarjetaMascota.append(imagen, detalles);
            bloque.appendChild(tarjetaMascota);
        } else {
            bloque.appendChild(crearElemento('p', 'overview-empty', 'No se encontró la mascota relacionada.'));
        }

        const evaluacion = registro.evaluacion;
        const evaluacionTexto = evaluacion && typeof evaluacion === 'object'
            ? Object.entries(evaluacion).map(([clave, valor]) => `${clave}: ${Array.isArray(valor) ? valor.join(', ') : String(valor ?? 'No registrado')}`).join('\n')
            : (evaluacion || 'No se ha registrado una evaluación.');
        const evaluacionBloque = crearElemento('div', 'adoption-evaluation-block');
        evaluacionBloque.append(
            crearElemento('strong', '', 'Evaluación registrada'),
            crearElemento('p', '', evaluacionTexto)
        );
        bloque.appendChild(evaluacionBloque);

        const botones = crearElemento('div', 'record-detail-actions');
        if (registro.estado === 'PENDIENTE') {
            botones.append(
                crearBotonAccion('Aprobar solicitud', 'bi-check-circle', 'btn btn-primary btn-sm', () => void procesarSolicitudAdopcion(registro, 'aprobar')),
                crearBotonAccion('Rechazar solicitud', 'bi-x-circle', 'btn btn-outline-danger btn-sm', () => void procesarSolicitudAdopcion(registro, 'rechazar'))
            );
        }
        if (ficha && ficha.codigo) {
            botones.append(
                crearBotonAccion('Ficha privada', 'bi-file-lock', 'btn btn-outline-primary btn-sm', () => {
                    const ruta = new URL('../cliente/ficha-adopcion.html', window.location.href);
                    ruta.search = '';
                    ruta.searchParams.set('id', String(registro.id_solicitud));
                    window.open(ruta.href, '_blank');
                }),
                crearBotonAccion('Ficha pública', 'bi-qr-code', 'btn btn-outline-secondary btn-sm', () => {
                    const ruta = new URL('../cliente/ficha-publica.html', window.location.href);
                    ruta.search = '';
                    ruta.searchParams.set('id', String(ficha.codigo));
                    window.open(ruta.href, '_blank');
                })
            );
        }
        if (botones.childElementCount) bloque.appendChild(botones);
    } catch (error) {
        console.error('Error al cargar el expediente de adopción:', error);
        bloque.replaceChildren(
            crearElemento('h4', 'record-detail-section-title', 'Mascota y seguimiento'),
            crearElemento('p', 'module-state module-state-error', `No se pudo cargar la información relacionada. ${error.message || ''}`)
        );
    }
}

async function procesarSolicitudAdopcion(registro, accion) {
    if (registro.estado !== 'PENDIENTE') {
        mostrarMensaje('Esta solicitud ya fue procesada.', 'error');
        return;
    }

    const aprobar = accion === 'aprobar';
    const confirmado = window.confirm(aprobar
        ? `¿Aprobar la solicitud #${registro.id_solicitud}? Supabase ejecutará el flujo de aprobación y generación de la ficha.`
        : `¿Rechazar la solicitud #${registro.id_solicitud}? La mascota volverá a estar disponible si actualmente está EN_PROCESO.`);
    if (!confirmado) return;

    try {
        if (aprobar) {
            const { error } = await supabaseClient.rpc('aprobar_adopcion', {
                p_id_solicitud: Number(registro.id_solicitud)
            });
            if (error) throw error;
        } else {
            const { data: mascota, error: errorMascota } = await supabaseClient
                .from('mascotas').select('id_mascota,estado')
                .eq('id_mascota', Number(registro.ref_id)).maybeSingle();
            if (errorMascota) throw errorMascota;

            if (mascota?.estado === 'EN_PROCESO') {
                const { error: errorEstadoMascota } = await supabaseClient
                    .from('mascotas').update({ estado: 'DISPONIBLE' })
                    .eq('id_mascota', Number(registro.ref_id))
                    .eq('estado', 'EN_PROCESO');
                if (errorEstadoMascota) throw errorEstadoMascota;
            }

            const { data, error } = await supabaseClient.from('solicitudes')
                .update({ estado: 'RECHAZADA' })
                .eq('id_solicitud', Number(registro.id_solicitud))
                .eq('estado', 'PENDIENTE')
                .select('id_solicitud');
            if (error) throw error;
            if (!data?.length) throw new Error('La solicitud cambió de estado o las políticas RLS impidieron actualizarla.');
        }

        mostrarMensaje(aprobar ? 'Solicitud aprobada. La ficha se gestiona mediante la función de Supabase.' : 'Solicitud rechazada.', 'info');
        await cargarDatosModulo('adopciones');
        await actualizarIndicadores();
        await cargarResumenesInicio();
    } catch (error) {
        console.error(`No se pudo ${accion} la solicitud:`, error);
        mostrarMensaje(`No se pudo ${aprobar ? 'aprobar' : 'rechazar'} la solicitud. ${error.message || 'Comprueba permisos RLS y la función de Supabase.'}`, 'error');
    }
}

/* =========================================================
   TABLAS PARA COMPRAS, ADOPCIONES, INVENTARIO Y REPORTES
========================================================= */

function mostrarFilasModulo(configuracion, filas, nombreSeccion = moduloActual) {
    const encabezado = $('#encabezadoTablaModulo');
    const cuerpo = $('#cuerpoTablaModulo');
    const envoltura = $('.module-table-wrapper');
    const contenedorTarjetas = $('#contenedorTarjetasModulo');

    if (!encabezado || !cuerpo || !envoltura) {
        throw new Error('Faltan elementos de tabla en dashboard.html.');
    }

    cerrarDetalleRegistro();

    if (contenedorTarjetas) {
        contenedorTarjetas.hidden = true;
        contenedorTarjetas.replaceChildren();
    }

    envoltura.hidden = false;
    limpiarTablaModulo();

    const columnasVisibles = configuracion.columnasResumen ||
        configuracion.columnas;

    const filaEncabezado = document.createElement('tr');

    columnasVisibles.forEach((columna) => {
        filaEncabezado.appendChild(crearCelda(columna.titulo, true));
    });

    const incluyeDetalles = Boolean(configuracion.columnasResumen);

    if (incluyeDetalles) {
        filaEncabezado.appendChild(crearCelda('Acciones', true));
    }

    encabezado.appendChild(filaEncabezado);

    if (!filas.length) {
        const filaVacia = document.createElement('tr');
        const celdaVacia = crearCelda(registrosActuales.length
            ? 'Ningún registro coincide con los filtros actuales.'
            : 'No hay registros disponibles para mostrar.');

        celdaVacia.colSpan =
            columnasVisibles.length + (incluyeDetalles ? 1 : 0);

        filaVacia.appendChild(celdaVacia);
        cuerpo.appendChild(filaVacia);

        mostrarEstadoModulo(
            registrosActuales.length
                ? 'No se encontraron coincidencias. Prueba cambiando la búsqueda o los filtros.'
                : 'Consulta completada: no hay registros visibles para esta sesión.'
        );

        return;
    }

    filas.forEach((registro) => {
        const fila = document.createElement('tr');

        columnasVisibles.forEach((columna) => {
            const valor = registro[columna.clave];
            let celda;
            if (['estado', 'status'].includes(columna.clave)) {
                celda = document.createElement('td');
                celda.appendChild(crearEstadoTarjeta(valor));
            } else if (['precio', 'total', 'stock'].includes(columna.clave) &&
                Number.isFinite(Number(valor)) && valor !== null && valor !== undefined) {
                celda = crearCelda(formatearValor(valor, columna.formato));
                if (columna.clave === 'stock' && Number(valor) <= 5) {
                    celda.classList.add('stock-cell-low');
                    celda.title = 'Existencias bajas';
                }
            } else {
                celda = crearCelda(formatearValor(valor, columna.formato));
            }
            fila.appendChild(celda);
        });

        if (incluyeDetalles) {
            const celdaAcciones = document.createElement('td');
            const botones = crearElemento('div', 'table-row-actions');

            const botonDetalles = crearBotonAccion(
                nombreSeccion === 'compras' ? 'Ver compra' :
                    nombreSeccion === 'adopciones' ? 'Expediente' : 'Ver detalle',
                'bi-eye', 'btn btn-outline-primary btn-sm record-detail-button',
                () => {
                    if (nombreSeccion === 'compras') {
                        void mostrarDetalleCompra(registro);
                    } else if (nombreSeccion === 'adopciones') {
                        void mostrarDetalleSolicitud(registro);
                    } else {
                        mostrarDetalleRegistro(configuracion, registro);
                    }
                }
            );
            botones.appendChild(botonDetalles);

            if (nombreSeccion === 'adopciones' && registro.estado === 'PENDIENTE') {
                botones.append(
                    crearBotonAccion('Aprobar', 'bi-check-lg', 'btn btn-primary btn-sm', () => void procesarSolicitudAdopcion(registro, 'aprobar')),
                    crearBotonAccion('Rechazar', 'bi-x-lg', 'btn btn-outline-danger btn-sm', () => void procesarSolicitudAdopcion(registro, 'rechazar'))
                );
            }

            if (nombreSeccion === 'inventario') {
                botones.appendChild(crearBotonAccion(
                    'Editar stock', 'bi-pencil-square', 'btn btn-primary btn-sm',
                    () => {
                        mostrarModulo('productos');
                        abrirFormularioRegistro('productos', registro);
                    }
                ));
            }

            celdaAcciones.appendChild(botones);
            fila.appendChild(celdaAcciones);
        }

        cuerpo.appendChild(fila);
    });

    mostrarEstadoModulo(
        `Se muestran ${filas.length} de ${registrosActuales.length} registros cargados.` +
        (hayMasRegistros ? ' Hay más resultados disponibles; pulsa «Cargar más registros» para continuar.' : ' Se han cargado todos los resultados disponibles.')
    );
}

/* =========================================================
   CARGA DE MÓDULOS
========================================================= */

function crearConsultaPaginaModulo(nombreSeccion, desdeRegistro) {
    const configuracion = configuracionDatos[nombreSeccion];
    const columnasSQL = configuracion.columnas
        .filter((columna) => !columna.noSQL)
        .map((columna) => columna.clave)
        .join(', ');

    let consulta = supabaseClient
        .from(configuracion.tabla)
        .select(nombreSeccion === 'adopciones'
            ? `${columnasSQL}, perfiles(nombre)`
            : columnasSQL);

    if (nombreSeccion === 'adopciones') {
        consulta = consulta.eq('tipo', 'ADOPCION');
    }

    if (configuracion.orden) {
        consulta = consulta.order(configuracion.orden, {
            ascending: Boolean(configuracion.ascendente),
            nullsFirst: false
        });
    }

    return consulta.range(desdeRegistro, desdeRegistro + LIMITE_REGISTROS - 1);
}

function normalizarFilasModulo(nombreSeccion, data) {
    const filas = data || [];
    if (nombreSeccion !== 'adopciones') return filas;

    return filas.map((registro) => {
        const perfil = Array.isArray(registro.perfiles)
            ? registro.perfiles[0]
            : registro.perfiles;
        return {
            ...registro,
            nombre_solicitante: perfil?.nombre || 'Usuario no disponible'
        };
    });
}

function clavePrimariaModulo(nombreSeccion) {
    return {
        mascotas: 'id_mascota',
        productos: 'id_producto',
        inventario: 'id_producto',
        compras: 'id_pedido',
        adopciones: 'id_solicitud',
        reportes: 'id'
    }[nombreSeccion] || 'id';
}

function actualizarBotonCargarMas() {
    const boton = $('#btnCargarMasRegistros');
    if (!boton) return;

    boton.hidden = !hayMasRegistros;
    boton.disabled = cargandoMasRegistros;
    boton.innerHTML = cargandoMasRegistros
        ? '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando…'
        : '<i class="bi bi-arrow-down-circle me-2"></i>Cargar más registros';
}

async function cargarDatosModulo(nombreSeccion) {
    const configuracion = configuracionDatos[nombreSeccion];
    if (!configuracion) return;

    moduloActual = nombreSeccion;
    offsetRegistros = 0;
    hayMasRegistros = false;
    cargandoMasRegistros = false;
    registrosActuales = [];
    actualizarBotonCargarMas();

    cerrarDetalleRegistro();
    cerrarFormularioRegistro();
    limpiarTablaModulo();
    mostrarEstadoModulo('Cargando datos desde Supabase…');

    const contenedorExistente = $('#contenedorTarjetasModulo');
    if (contenedorExistente) {
        contenedorExistente.replaceChildren();
        contenedorExistente.hidden = true;
    }

    const envoltura = $('.module-table-wrapper');
    if (envoltura) envoltura.hidden = false;

    try {
        const { data, error } = await crearConsultaPaginaModulo(nombreSeccion, 0);
        if (moduloActual !== nombreSeccion) return;
        if (error) throw error;

        const filas = normalizarFilasModulo(nombreSeccion, data);
        registrosActuales = filas;
        offsetRegistros = (data || []).length;
        hayMasRegistros = (data || []).length === LIMITE_REGISTROS;
        actualizarEstadosDinamicosFiltro();
        renderizarModuloFiltrado();
        actualizarBotonCargarMas();
    } catch (error) {
        if (moduloActual !== nombreSeccion) return;
        console.error(`Error al cargar el módulo ${nombreSeccion}:`, error);
        registrosActuales = [];
        offsetRegistros = 0;
        hayMasRegistros = false;
        limpiarTablaModulo();
        cerrarDetalleRegistro();
        actualizarBotonCargarMas();

        const tarjetas = $('#contenedorTarjetasModulo');
        if (tarjetas) {
            tarjetas.replaceChildren();
            tarjetas.hidden = true;
        }

        if (envoltura) envoltura.hidden = false;
        mostrarEstadoModulo(
            `No se pudieron cargar los datos de ${configuracion.tabla}. ` +
            `${error.message || 'Error desconocido'}. Verifica la sesión, los nombres de las columnas y las políticas RLS de esta tabla.`,
            'error'
        );
    }
}

async function cargarMasRegistros() {
    if (!hayMasRegistros || cargandoMasRegistros || !configuracionDatos[moduloActual]) return;

    const seccionSolicitada = moduloActual;
    const offsetSolicitado = offsetRegistros;
    cargandoMasRegistros = true;
    actualizarBotonCargarMas();

    try {
        const { data, error } = await crearConsultaPaginaModulo(seccionSolicitada, offsetSolicitado);
        if (seccionSolicitada !== moduloActual) return;
        if (error) throw error;

        const dataPagina = data || [];
        const nuevasFilas = normalizarFilasModulo(seccionSolicitada, data);
        const clave = clavePrimariaModulo(seccionSolicitada);
        const idsExistentes = new Set(registrosActuales.map((registro) => String(registro[clave])));
        registrosActuales = registrosActuales.concat(
            nuevasFilas.filter((registro) => !idsExistentes.has(String(registro[clave])))
        );
        offsetRegistros += dataPagina.length;
        hayMasRegistros = dataPagina.length === LIMITE_REGISTROS;
        actualizarEstadosDinamicosFiltro();
        renderizarModuloFiltrado();
    } catch (error) {
        console.error('No se pudieron cargar más registros:', error);
        if (seccionSolicitada === moduloActual) {
            mostrarMensaje(`No se pudieron cargar más registros. ${error.message || 'Comprueba la conexión y los permisos de Supabase.'}`, 'error');
        }
    } finally {
        if (seccionSolicitada === moduloActual) {
            cargandoMasRegistros = false;
            actualizarBotonCargarMas();
        }
    }
}

/* =========================================================
   NAVEGACIÓN
========================================================= */

function mostrarModulo(nombreSeccion) {
    const modulo = secciones[nombreSeccion];

    if (!modulo) return;

    moduloActual = nombreSeccion;

    cerrarDetalleRegistro();
    cerrarFormularioRegistro();

    document.querySelectorAll('.sidebar-nav .nav-link').forEach((enlace) => {
        enlace.classList.toggle(
            'active',
            enlace.dataset.section === nombreSeccion
        );
    });

    const tituloPagina = $('#tituloPagina');
    const seccionInicio = $('#seccionInicio');
    const seccionModulo = $('#seccionModulo');
    const mensajeSistema = $('#mensajeSistema');

    if (tituloPagina) tituloPagina.textContent = modulo.titulo;

    const esInicio = nombreSeccion === 'inicio';

    if (seccionInicio) seccionInicio.hidden = !esInicio;
    if (seccionModulo) seccionModulo.hidden = esInicio;
    if (mensajeSistema) mensajeSistema.hidden = true;
    const filtros = $('#filtrosModulo');
    if (filtros) filtros.hidden = esInicio;

    if (!esInicio) {
        const tituloModulo = $('#tituloModulo');
        const descripcionModulo = $('#descripcionModulo');
        const iconoModulo = $('#iconoModulo');

        if (tituloModulo) tituloModulo.textContent = modulo.nombre;

        if (descripcionModulo) {
            descripcionModulo.textContent = modulo.descripcion;
        }

        if (iconoModulo) {
            iconoModulo.className = `bi ${modulo.icono}`;
        }

        configurarAccionesModulo(nombreSeccion);
        void cargarDatosModulo(nombreSeccion);
    }
}

function configurarNavegacion() {
    document.querySelectorAll('[data-open-module]').forEach((elemento) => {
        elemento.addEventListener('click', () => mostrarModulo(elemento.dataset.openModule));
    });

    document.querySelectorAll('[data-section]').forEach((elemento) => {
        elemento.addEventListener('click', (evento) => {
            evento.preventDefault();
            mostrarModulo(elemento.dataset.section);
        });
    });

    $('#btnVolverInicio')?.addEventListener('click', () => {
        mostrarModulo('inicio');
    });

    $('#btnCargarMasRegistros')?.addEventListener('click', () => {
        void cargarMasRegistros();
    });
}

/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesion() {
    const boton = $('#btnCerrarSesion');

    if (boton) boton.disabled = true;

    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) throw error;

        window.location.replace('login.html');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);

        if (boton) boton.disabled = false;

        mostrarMensaje(
            'No se pudo cerrar la sesión. Inténtalo nuevamente.',
            'error'
        );
    }
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */

async function iniciarPanel() {
    configurarTema();
    mostrarFecha();
    configurarNavegacion();

    $('#btnCerrarSesion')?.addEventListener('click', cerrarSesion);

    try {
        const autorizado = await verificarAdministrador();

        if (!autorizado) return;

        mostrarModulo('inicio');
        await Promise.all([actualizarIndicadores(), cargarResumenesInicio()]);
    } catch (error) {
        console.error('Error al iniciar el panel:', error);

        mostrarMensaje(
            'Ocurrió un error al iniciar el panel. Revisa la conexión e inténtalo nuevamente.',
            'error'
        );
    }
}

document.addEventListener('DOMContentLoaded', iniciarPanel);
