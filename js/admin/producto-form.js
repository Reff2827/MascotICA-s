const usuario = Auth.requireAdmin();

/* Stock: solo dígitos (también al pegar) */
Validar.soloDigitos('stock');

if (usuario) {
    UI.navbarAdmin(usuario);
    cargarSiEsEdicion();
}

async function cargarSiEsEdicion() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const producto = await Productos.buscarPorId(id);

    if (!producto) {
        UI.setFlash('error', 'El producto indicado no existe.');
        window.location.href = 'productos.html';
        return;
    }

    document.getElementById('tituloPagina').textContent = "Editar producto · MascotICA's Admin";
    document.getElementById('tituloForm').textContent = 'Editar producto';
    document.getElementById('idProducto').value = producto.idProducto;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('categoria').value = producto.categoria;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('imagenUrl').value = producto.imagenUrl || '';

    if (producto.imagenUrl) {
        mostrarPreview(producto.imagenUrl);
    }
}

function mostrarPreview(src) {
    const preview = document.getElementById('previewImagen');
    const contenedor = document.getElementById('contenedorPreview');

    preview.src = src;
    contenedor.classList.remove('d-none');
}

function ocultarPreview() {
    const preview = document.getElementById('previewImagen');
    const contenedor = document.getElementById('contenedorPreview');

    preview.src = '';
    contenedor.classList.add('d-none');
}

document.getElementById('btnUrl').addEventListener('click', function () {
    document.getElementById('contenedorUrl').classList.remove('d-none');
    document.getElementById('contenedorArchivo').classList.add('d-none');

    document.getElementById('imagenArchivo').value = '';

    const url = document.getElementById('imagenUrl').value.trim();

    if (url) {
        mostrarPreview(url);
    } else {
        ocultarPreview();
    }
});

document.getElementById('btnArchivo').addEventListener('click', function () {
    document.getElementById('contenedorUrl').classList.add('d-none');
    document.getElementById('contenedorArchivo').classList.remove('d-none');

    document.getElementById('imagenUrl').value = '';
    ocultarPreview();
});

document.getElementById('imagenUrl').addEventListener('input', function () {
    const url = this.value.trim();

    if (url) {
        mostrarPreview(url);
    } else {
        ocultarPreview();
    }
});

document.getElementById('imagenArchivo').addEventListener('change', function () {
    const archivo = this.files[0];

    if (!archivo) {
        ocultarPreview();
        return;
    }

    if (!archivo.type.startsWith('image/')) {
        alert('Selecciona un archivo de imagen válido.');
        this.value = '';
        ocultarPreview();
        return;
    }

    const lector = new FileReader();

    lector.onload = function (e) {
        mostrarPreview(e.target.result);
    };

    lector.readAsDataURL(archivo);
});

document.getElementById('formProducto').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const categoria = document.getElementById('categoria').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;

    let valido = true;

    const marcar = (id, condicionError) => {
        document.getElementById(id).classList.toggle('d-none', !condicionError);

        if (condicionError) {
            valido = false;
        }
    };

    marcar('errNombre', nombre === '');
    marcar('errCategoria', categoria === '');
    marcar('errPrecio', precio === '' || !isFinite(Number(precio)) || Number(precio) < 0);
    marcar('errStock', !/^\d+$/.test(stock));

    if (!valido) return;

    const boton = document.getElementById('btnGuardar');
    const estado = document.getElementById('estadoSubida');
    let imagenUrl = document.getElementById('imagenUrl').value.trim();

    const archivo = document.getElementById('imagenArchivo').files[0];

    if (archivo) {
        boton.disabled = true;
        estado.textContent = 'Subiendo imagen...';

        const nombreArchivo = Date.now() + '-' + archivo.name;

        const { error: errorSubida } = await db.storage
            .from('productos')
            .upload(nombreArchivo, archivo);

        if (errorSubida) {
            estado.textContent = '';
            boton.disabled = false;
            alert('No se pudo subir la imagen: ' + errorSubida.message);
            return;
        }

        const { data: publica } = db.storage
            .from('productos')
            .getPublicUrl(nombreArchivo);

        imagenUrl = publica.publicUrl;
        estado.textContent = '';
    }

    const producto = {
        idProducto: document.getElementById('idProducto').value || null,
        nombre,
        categoria,
        precio: Number(precio),
        stock: Number(stock),
        imagenUrl
    };

    await Productos.guardar(producto);

    UI.setFlash('exito', 'Producto guardado correctamente.');
    window.location.href = 'productos.html';
});
