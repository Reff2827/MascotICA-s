const usuarioRecomendaciones = Auth.requireCliente();
const CARRITO_RECOMENDACIONES_KEY = 'ps_carrito';
const dineroRecomendaciones = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
let mascotaRecomendaciones = null;
let productosRecomendaciones = [];

if (usuarioRecomendaciones) {
    UI.navbarCliente(usuarioRecomendaciones);
    UI.mostrarFlash();
    iniciarRecomendaciones();
}

function escaparRecomendacion(valor) {
    return UI.esc(String(valor ?? ''));
}

function normalizarRecomendacion(valor) {
    return String(valor ?? '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase().trim();
}

function listaValores(valor) {
    if (Array.isArray(valor)) return valor.map(normalizarRecomendacion);
    if (!valor) return [];
    return [normalizarRecomendacion(valor)];
}

function edadMascotaGrupo(edad) {
    const texto = normalizarRecomendacion(edad);
    const numero = Number((texto.match(/[0-9]+(?:[.,][0-9]+)?/) || [])[0]?.replace(',', '.'));
    if (!Number.isFinite(numero)) return null;
    const meses = texto.includes('MES') ? numero : numero * 12;
    if (meses < 12) return 'CACHORRO';
    if (meses < 24) return 'JOVEN';
    if (meses >= 96) return 'SENIOR';
    return 'ADULTO';
}

function actividadMascotaGrupo(actividad) {
    const valor = normalizarRecomendacion(actividad);
    if (!valor) return null;
    if (valor.includes('TRANQU') || valor.includes('POCO') || valor.includes('BAJA')) return 'BAJA';
    if (valor.includes('MODER')) return 'MODERADA';
    if (valor.includes('ACTIV') || valor.includes('ENERG')) return 'ALTA';
    return null;
}

function especieMascotaGrupo(especie) {
    const valor = normalizarRecomendacion(especie);
    if (valor.includes('PERRO') || valor.includes('CAN')) return 'PERRO';
    if (valor.includes('GATO') || valor.includes('FEL')) return 'GATO';
    return valor ? 'OTRO' : null;
}

function inferirEspeciesProducto(producto) {
    const configuradas = listaValores(producto.especiesRecomendadas);
    if (configuradas.length) return configuradas;

    // Los productos existentes no tenían compatibilidad configurada. Aprovechamos
    // el nombre del catálogo para inferir las especies sin obligar a editar cada fila.
    const nombre = normalizarRecomendacion(producto.nombre);
    const esPerro = /\bPERROS?\b|\bPERRITOS?\b|\bCANIN[OA]S?\b/.test(nombre);
    const esGato = /\bGATOS?\b|\bGATITOS?\b|\bFELIN[OA]S?\b/.test(nombre);
    const esOtraEspecie = /\bCABALLOS?\b|\bEQUINOS?\b|\bAVES?\b|\bCONEJOS?\b|\bROEDORES?\b|\bPECES?\b/.test(nombre);

    if (esPerro && esGato) return ['PERRO', 'GATO'];
    if (esPerro) return ['PERRO'];
    if (esGato) return ['GATO'];
    if (esOtraEspecie) return ['OTRO'];

    // Los artículos que dicen explícitamente "para mascotas/animales" se tratan
    // como genéricos para perros y gatos. Otros productos de higiene sin especie
    // identificable (por ejemplo, un antipulgas) quedan fuera hasta que el admin
    // marque la especie, porque la fórmula puede no ser segura para todas.
    if (normalizarRecomendacion(producto.categoria) === 'HIGIENE' &&
        /\bPARA MASCOTAS?\b|\bPARA ANIMALES?\b/.test(nombre)) {
        return ['PERRO', 'GATO'];
    }

    return [];
}

function inferirEdadesProducto(producto) {
    const configuradas = listaValores(producto.edadesRecomendadas);
    if (configuradas.length) return configuradas;

    const nombre = normalizarRecomendacion(producto.nombre);
    if (/\bSENIOR\b|\bGERIATRIC[OA]S?\b|\bMAYORES?\b/.test(nombre)) return ['SENIOR'];
    if (/\bCACHORR[OA]S?\b|\bPUPPY\b|\bGATITOS?\b|\bKITTENS?\b/.test(nombre)) return ['CACHORRO'];
    if (/\bJOVEN(?:ES)?\b/.test(nombre)) return ['JOVEN'];
    if (/\bADULT[OA]S?\b/.test(nombre)) return ['ADULTO'];
    return [];
}

function inferirTamanosProducto(producto) {
    const configurados = listaValores(producto.tamanosRecomendados);
    if (configurados.length) return configurados;

    const nombre = normalizarRecomendacion(producto.nombre);
    if (/\b(?:RAZAS?|PERROS?|GATOS?|TAMANO)\s+PEQUEN[OA]S?\b/.test(nombre)) return ['PEQUENO'];
    if (/\b(?:RAZAS?|PERROS?|GATOS?|TAMANO)\s+MEDIAN[OA]S?\b/.test(nombre)) return ['MEDIANO'];
    if (/\b(?:RAZAS?|PERROS?|GATOS?|TAMANO)\s+GRANDES?\b/.test(nombre)) return ['GRANDE'];
    return [];
}

function inferirActividadesProducto(producto) {
    const configuradas = listaValores(producto.actividadesRecomendadas);
    if (configuradas.length) return configuradas;

    const nombre = normalizarRecomendacion(producto.nombre);
    if (/\bBAJA ACTIVIDAD\b|\bPOCO ACTIV[OA]S?\b|\bTRANQUIL[OA]S?\b/.test(nombre)) return ['BAJA'];
    if (/\bACTIVIDAD MODERADA\b|\bMODERAD[OA]S? ACTIV[OA]S?\b/.test(nombre)) return ['MODERADA'];
    if (/\bALTA ACTIVIDAD\b|\bMUY ACTIV[OA]S?\b|\bALTA ENERGIA\b/.test(nombre)) return ['ALTA'];
    return [];
}

function opcionesCompatibilidadProducto(producto, propiedad) {
    if (propiedad === 'especiesRecomendadas') return inferirEspeciesProducto(producto);
    if (propiedad === 'edadesRecomendadas') return inferirEdadesProducto(producto);
    if (propiedad === 'tamanosRecomendados') return inferirTamanosProducto(producto);
    if (propiedad === 'actividadesRecomendadas') return inferirActividadesProducto(producto);
    return listaValores(producto[propiedad]);
}

function compatibleCampo(producto, propiedad, valorMascota) {
    const opciones = opcionesCompatibilidadProducto(producto, propiedad);
    return !opciones.length || !valorMascota || opciones.includes(normalizarRecomendacion(valorMascota));
}

function compatibleConMascota(producto, mascota) {
    const especie = especieMascotaGrupo(mascota.especie);
    const especiesProducto = inferirEspeciesProducto(producto);

    // La especie debe coincidir. Si no puede inferirse ni está configurada,
    // el producto no se recomienda; así evitamos sugerencias alimentarias inseguras.
    if (!especie || !especiesProducto.length || !especiesProducto.includes(especie)) {
        return false;
    }

    const edad = edadMascotaGrupo(mascota.edad);
    const tamano = normalizarRecomendacion(mascota.tamano) || null;
    const actividad = actividadMascotaGrupo(mascota.nivelActividad);

    return compatibleCampo(producto, 'edadesRecomendadas', edad) &&
        compatibleCampo(producto, 'tamanosRecomendados', tamano) &&
        compatibleCampo(producto, 'actividadesRecomendadas', actividad);
}

async function iniciarRecomendaciones() {
    const estado = document.getElementById('estadoCarga');
    const idSolicitud = new URLSearchParams(window.location.search).get('id');
    if (!idSolicitud || !usuarioRecomendaciones?.idUsuario) {
        mostrarErrorRecomendaciones('No encontramos una solicitud válida. Entra desde Mis solicitudes.');
        return;
    }

    try {
        // Verifica la solicitud contra el usuario autenticado y no confía solo en el parámetro de URL.
        const solicitudes = await Solicitudes.listarPorUsuario(usuarioRecomendaciones.idUsuario);
        const solicitud = solicitudes.find(s => String(s.idSolicitud) === String(idSolicitud) && s.tipo === 'ADOPCION');
        if (!solicitud || solicitud.estado !== 'APROBADA' || !solicitud.refId) {
            mostrarErrorRecomendaciones('Las recomendaciones solo están disponibles para una adopción aprobada. Si ya fue aprobada, vuelve a Mis solicitudes e inténtalo otra vez.');
            return;
        }

        // La ficha debe pertenecer al usuario y estar enlazada a la misma mascota de la solicitud.
        const ficha = await FichasAdopcion.buscarPorSolicitud(solicitud.idSolicitud);
        if (!ficha || String(ficha.id_usuario) !== String(usuarioRecomendaciones.idUsuario) || String(ficha.id_mascota) !== String(solicitud.refId)) {
            mostrarErrorRecomendaciones('No pudimos verificar que la mascota adoptada esté vinculada correctamente a tu cuenta. Contacta con el administrador para revisar la ficha de adopción.');
            return;
        }

        mascotaRecomendaciones = await Mascotas.buscarPorId(solicitud.refId);
        if (!mascotaRecomendaciones) {
            mostrarErrorRecomendaciones('No pudimos cargar los datos de la mascota vinculada a la adopción.');
            return;
        }

        const productos = await Productos.listar();
        productosRecomendaciones = (productos || []).filter(p =>
            p.activo !== false && Number(p.stock) > 0 &&
            ['ALIMENTO', 'HIGIENE'].includes(normalizarRecomendacion(p.categoria)) &&
            compatibleConMascota(p, mascotaRecomendaciones)
        );

        document.getElementById('nombreMascota').textContent = mascotaRecomendaciones.nombre || ficha.nombre_mascota || 'Tu mascota';
        const chips = [
            mascotaRecomendaciones.especie,
            mascotaRecomendaciones.edad,
            mascotaRecomendaciones.tamano ? `Tamaño ${mascotaRecomendaciones.tamano.toLowerCase()}` : null,
            mascotaRecomendaciones.nivelActividad ? `Actividad ${mascotaRecomendaciones.nivelActividad.toLowerCase()}` : null
        ].filter(Boolean);
        document.getElementById('datosMascota').innerHTML = chips.map(c => `<span class="recomendacion-chip"><i class="bi bi-check2"></i>${escaparRecomendacion(c)}</span>`).join('');
        const botonFicha = document.getElementById('btnFicha');
        botonFicha.href = `ficha-adopcion.html?id=${encodeURIComponent(solicitud.idSolicitud)}`;
        botonFicha.classList.remove('d-none');

        pintarProductosRecomendados();
        estado.classList.add('d-none');
        document.getElementById('contenidoRecomendaciones').classList.remove('d-none');
    } catch (error) {
        console.error('Error al preparar recomendaciones:', error);
        mostrarErrorRecomendaciones('Ocurrió un problema al consultar la adopción o el catálogo. Inténtalo nuevamente más tarde.');
    }
}

function pintarProductosRecomendados() {
    const lista = document.getElementById('listaRecomendaciones');
    const aviso = document.getElementById('avisoProductos');
    document.getElementById('contadorProductos').innerHTML = `<i class="bi bi-check-circle"></i>${productosRecomendaciones.length} producto${productosRecomendaciones.length === 1 ? '' : 's'} disponible${productosRecomendaciones.length === 1 ? '' : 's'}`;

    if (!productosRecomendaciones.length) {
        lista.innerHTML = '';
        aviso.classList.remove('d-none');
        aviso.innerHTML = '<i class="bi bi-info-circle me-2"></i>Todavía no hay productos activos con stock que coincidan con las características registradas de esta mascota. Puedes revisar la tienda y volver a consultar más adelante.';
        return;
    }

    aviso.classList.add('d-none');
    lista.innerHTML = productosRecomendaciones.map(producto => {
        const imagen = producto.imagenUrl || '../img/logo.png';
        const categoria = normalizarRecomendacion(producto.categoria) === 'ALIMENTO' ? 'Alimentación' : 'Higiene';
        return `<div class="col-12 col-sm-6 col-xl-4">
            <article class="card recomendacion-card shadow-sm">
                <img class="recomendacion-img" src="${escaparRecomendacion(imagen)}" alt="${escaparRecomendacion(producto.nombre)}" loading="lazy" onerror="this.onerror=null;this.src='../img/logo.png'">
                <div class="card-body d-flex flex-column p-3 p-md-4">
                    <div class="d-flex justify-content-between align-items-center gap-2 mb-2"><span class="recomendacion-chip"><i class="bi ${categoria === 'Alimentación' ? 'bi-egg-fried' : 'bi-droplet'}"></i>${categoria}</span><span class="small text-success fw-semibold"><i class="bi bi-box-seam me-1"></i>Stock: ${Number(producto.stock)}</span></div>
                    <h3 class="h5 fw-bold">${escaparRecomendacion(producto.nombre)}</h3>
                    <div class="mt-auto pt-2"><div class="fs-4 fw-bold mb-3">${dineroRecomendaciones.format(Number(producto.precio) || 0)}</div>
                    <div class="d-flex align-items-center gap-2"><label class="visually-hidden" for="cantidad-${producto.idProducto}">Cantidad</label><input id="cantidad-${producto.idProducto}" class="form-control" style="max-width:86px" type="number" min="1" max="${Number(producto.stock)}" value="1" step="1"><button class="btn btn-success flex-grow-1" type="button" data-agregar-recomendado="${producto.idProducto}"><i class="bi bi-cart-plus me-1"></i>Agregar</button></div>
                    </div>
                </div>
            </article>
        </div>`;
    }).join('');

    lista.querySelectorAll('[data-agregar-recomendado]').forEach(boton => {
        boton.addEventListener('click', () => agregarProductoRecomendado(boton.dataset.agregarRecomendado, boton));
    });
}

function agregarProductoRecomendado(id, boton) {
    const producto = productosRecomendaciones.find(p => String(p.idProducto) === String(id));
    if (!producto || producto.activo === false || Number(producto.stock) < 1) {
        UI.setFlash('error', 'Este producto ya no está disponible. Actualiza la página para consultar el stock.');
        UI.mostrarFlash();
        return;
    }

    const campo = document.getElementById(`cantidad-${producto.idProducto}`);
    const cantidad = Number(campo?.value);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        campo?.classList.add('is-invalid');
        return;
    }

    let carrito;
    try {
        carrito = JSON.parse(localStorage.getItem(CARRITO_RECOMENDACIONES_KEY) || '{}');
        if (!carrito || typeof carrito !== 'object' || Array.isArray(carrito)) carrito = {};
    } catch {
        carrito = {};
    }
    const actual = Number(carrito[producto.idProducto]) || 0;
    if (actual + cantidad > Number(producto.stock)) {
        UI.setFlash('error', `Solo hay ${Math.max(0, Number(producto.stock) - actual)} unidad(es) disponibles para ${producto.nombre}, contando las que ya tienes en el carrito.`);
        UI.mostrarFlash();
        return;
    }

    carrito[producto.idProducto] = actual + cantidad;
    localStorage.setItem(CARRITO_RECOMENDACIONES_KEY, JSON.stringify(carrito));
    boton.innerHTML = '<i class="bi bi-check2 me-1"></i>Agregado';
    boton.classList.replace('btn-success', 'btn-outline-success');
    UI.setFlash('exito', `${producto.nombre} se añadió a tu carrito habitual.`);
    UI.mostrarFlash();
    window.setTimeout(() => {
        if (document.body.contains(boton)) {
            boton.innerHTML = '<i class="bi bi-cart-plus me-1"></i>Agregar';
            boton.classList.replace('btn-outline-success', 'btn-success');
        }
    }, 1800);
}

function mostrarErrorRecomendaciones(mensaje) {
    document.getElementById('estadoCarga').classList.add('d-none');
    const alertas = document.getElementById('alertas');
    alertas.innerHTML = `<div class="container mt-3"><div class="alert alert-warning rounded-3"><i class="bi bi-shield-lock me-2"></i>${escaparRecomendacion(mensaje)}<div class="mt-3"><a class="btn btn-outline-secondary btn-sm" href="mis-solicitudes.html">Volver a Mis solicitudes</a></div></div></div>`;
}
