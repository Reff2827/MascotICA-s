async function cargarBoleta() {

    const estado = document.getElementById('estadoBoleta');
    const contenido = document.getElementById('contenidoBoleta');
    const error = document.getElementById('errorBoleta');
    const mensajeError = document.getElementById('mensajeErrorBoleta');
    const parametros = new URLSearchParams(window.location.search);

    const codigo = parametros.get('codigo');
    const idPedido = parametros.get('pedido');

    try {

        if (typeof db === 'undefined') {
            throw new Error('No se pudo conectar con el sistema.');
        }

        let boleta;
        let esPublica = false;

        if (codigo) {

            esPublica = true;

            const respuesta = await db.rpc(
                'obtener_boleta_publica',
                { p_codigo: codigo }
            );

            if (respuesta.error) {
                console.error('Error consultando la boleta pública:', respuesta.error);
                throw new Error('No se pudo consultar la boleta electrónica.');
            }

            if (!respuesta.data) {
                throw new Error('La boleta no existe o ya no está disponible.');
            }

            boleta = respuesta.data;

        } else if (idPedido) {

            const sesion = await db.auth.getUser();

            if (sesion.error || !sesion.data.user) {
                throw new Error('Inicia sesión para consultar la boleta de compra.');
            }

            const respuestaPedido = await db
                .from('pedidos')
                .select(`
                    id_pedido,
                    id_usuario,
                    fecha,
                    pagado_en,
                    total,
                    estado,
                    numero_boleta,
                    boleta_codigo,
                    nombre_comprador,
                    tipo_documento,
                    numero_documento
                `)
                .eq('id_pedido', Number(idPedido))
                .maybeSingle();

            if (respuestaPedido.error) {
                console.error('Error consultando el pedido:', respuestaPedido.error);
                throw new Error('No se pudo consultar el pedido.');
            }

            const pedido = respuestaPedido.data;

            if (!pedido) {
                throw new Error('No se encontró la compra seleccionada.');
            }

            if (
                pedido.id_usuario !== sesion.data.user.id &&
                !(await esAdministrador())
            ) {
                throw new Error('No tienes permiso para consultar esta compra.');
            }

            if (!['PAGADO', 'ENTREGADO'].includes(String(pedido.estado).toUpperCase())) {
                throw new Error('La boleta estará disponible cuando el pago esté confirmado.');
            }

            const respuestaItems = await db
                .from('pedido_items')
                .select(`
                    id_item,
                    nombre_producto,
                    cantidad,
                    precio_unitario,
                    subtotal
                `)
                .eq('id_pedido', Number(idPedido))
                .order('id_item', { ascending: true });

            if (respuestaItems.error) {
                console.error('Error consultando los productos:', respuestaItems.error);
                throw new Error('No se pudo consultar el detalle de la compra.');
            }

            boleta = {
                numero_boleta: pedido.numero_boleta,
                fecha: pedido.pagado_en || pedido.fecha,
                total: pedido.total,
                estado: pedido.estado,
                id_pedido: pedido.id_pedido,
                nombre_comprador: pedido.nombre_comprador,
                tipo_documento: pedido.tipo_documento,
                numero_documento: pedido.numero_documento,
                boleta_codigo: pedido.boleta_codigo,
                items: (respuestaItems.data || []).map(item => ({
                    nombre: item.nombre_producto,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    subtotal: item.subtotal
                }))
            };

        } else {

            throw new Error('No se recibió el código o número de pedido necesario para consultar esta boleta.');

        }

        mostrarBoleta(boleta, esPublica);

    } catch (errorConsulta) {

        console.error('Error cargando boleta:', errorConsulta);

        estado.classList.add('d-none');
        contenido.classList.add('d-none');
        document.getElementById('accionesBoleta').classList.add('d-none');
        error.classList.remove('d-none');

        mensajeError.textContent =
            errorConsulta.message ||
            'No se pudo cargar la información de la boleta.';

    }

}

async function esAdministrador() {

    try {

        const respuesta = await db.rpc('es_admin');

        if (!respuesta.error) {
            return respuesta.data === true;
        }

    } catch (error) {
        console.error('No se pudo verificar el rol de administrador:', error);
    }

    return false;

}

function mostrarBoleta(boleta, esPublica) {

    const estado = document.getElementById('estadoBoleta');
    const contenido = document.getElementById('contenidoBoleta');
    const lista = document.getElementById('listaProductosBoleta');
    const items = Array.isArray(boleta.items) ? boleta.items : [];

    const numeroTexto = boleta.numero_boleta || 'Boleta electrónica';

    document.getElementById('numeroBoleta').textContent = numeroTexto;
    document.getElementById('idPedidoBoleta').textContent =
        boleta.id_pedido ? '#' + boleta.id_pedido : 'Consulta pública';

    document.getElementById('estadoPagoBoleta').textContent =
        boleta.estado || 'Pago confirmado';

    if (boleta.fecha) {

        const fechaObjeto = new Date(boleta.fecha);

        document.getElementById('fechaBoleta').textContent =
            !Number.isNaN(fechaObjeto.getTime())
                ? fechaObjeto.toLocaleString('es-PE', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                })
                : 'Fecha no disponible';

    } else {

        document.getElementById('fechaBoleta').textContent = 'Fecha no disponible';

    }

    const datosCliente = document.getElementById('datosClienteBoleta');

    if (!esPublica) {

        datosCliente.classList.remove('d-none');

        const tipoDocumento = String(
            boleta.tipo_documento || ''
        ).trim().toUpperCase();

        document.getElementById('etiquetaNombreCompradorBoleta').textContent =
        tipoDocumento === 'RUC'
        ? 'Razón social'
        : 'Nombre del comprador';

        document.getElementById('nombreCompradorBoleta').textContent =
        boleta.nombre_comprador || 'No registrado';

        const numeroDocumento = boleta.numero_documento || '';

        document.getElementById('documentoCompradorBoleta').textContent =
            [tipoDocumento, numeroDocumento].filter(Boolean).join(': ') || 'No registrado';

    } else {

        datosCliente.classList.add('d-none');

    }

    if (items.length === 0) {

        lista.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    No hay productos registrados en esta boleta.
                </td>
            </tr>`;

    } else {

        lista.innerHTML = items.map(item => {

            const cantidad = Number(item.cantidad || 0);
            const subtotal = Number(item.subtotal || 0);

            const precioUnitario =
                item.precio_unitario !== undefined &&
                item.precio_unitario !== null
                    ? Number(item.precio_unitario)
                    : (cantidad > 0 ? subtotal / cantidad : 0);

            return `
                <tr>
                    <td class="boleta-producto">
                        ${escaparHtml(item.nombre || item.nombre_producto || 'Producto')}
                    </td>

                    <td class="text-center boleta-numero">
                        ${cantidad}
                    </td>

                    <td class="text-end boleta-numero">
                        ${formatearImporte(precioUnitario)}
                    </td>

                    <td class="text-end boleta-numero">
                        ${formatearImporte(subtotal)}
                    </td>
                </tr>`;

        }).join('');

    }

    document.getElementById('totalBoleta').textContent =
    formatearImporte(boleta.total);
    estado.classList.add('d-none');
    contenido.classList.remove('d-none');
    document.getElementById('accionesBoleta').classList.remove('d-none');
    const seccionQr = document.getElementById('seccionQrBoleta');
    if (esPublica) {
        seccionQr.classList.add('d-none');
    } else {
        seccionQr.classList.remove('d-none');
        generarQr(boleta.boleta_codigo);
    }

}

function generarQr(codigo) {

    const contenedor = document.getElementById('qrBoleta');
    const mensaje = document.getElementById('mensajeQr');

    contenedor.innerHTML = '';

    if (!codigo) {

        mensaje.textContent =
            'El código QR todavía no está disponible. Verifica que el pago haya generado la boleta electrónica.';

        return;

    }

    if (typeof QRCode === 'undefined') {

        mensaje.textContent =
            'No se pudo cargar el generador de QR. Comprueba tu conexión a internet.';

        return;

    }

    const urlPublica =
        new URL('boleta.html', window.location.href);

    urlPublica.search = '';
    urlPublica.searchParams.set('codigo', codigo);

    new QRCode(contenedor, {
        text: urlPublica.href,
        width: 180,
        height: 180,
        colorDark: '#111111',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    mensaje.textContent =
        'Escanea el QR para consultar la versión pública de la boleta, sin datos personales del comprador.';

}

function formatearImporte(valor) {

    const importe = Number(valor ?? 0);
    const importeValido = Number.isFinite(importe) ? importe : 0;

    return 'S/ ' + importeValido.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}

function escaparHtml(valor) {

    const elemento = document.createElement('div');
    elemento.textContent = String(valor);

    return elemento.innerHTML;

}

cargarBoleta();
