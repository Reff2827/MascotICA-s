const usuario = Auth.requireAdmin();
const CATEGORIAS = ['ALIMENTO', 'HIGIENE'];

if (usuario) {
    UI.navbarAdmin(usuario);
    UI.mostrarFlash();
    pintarFiltro();
    pintarTabla();
}

function filtroActivo() {
    return new URLSearchParams(window.location.search).get('categoria');
}

function pintarFiltro() {
    const activo = filtroActivo();
    const botones = [`<a href="productos.html" class="btn btn-sm ${!activo ? 'btn-dark' : 'btn-outline-dark'}">Todas</a>`]
        .concat(CATEGORIAS.map(c => `<a href="productos.html?categoria=${c}" class="btn btn-sm ${activo === c ? 'btn-dark' : 'btn-outline-dark'}">${c}</a>`));
    document.getElementById('filtroCategoria').innerHTML = botones.join('');
}

async function pintarTabla() {
    const activo = filtroActivo();
    const productos = activo ? await Productos.listarPorCategoria(activo) : await Productos.listar();
    const tbody = document.getElementById('filasProductos');
    document.getElementById('sinProductos').classList.toggle('d-none', productos.length > 0);

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="card border-0 shadow-sm overflow-hidden me-3" style="width:90px;">
                        <img src="${p.imagenUrl}"
                             alt="${UI.esc(p.nombre)}"
                             style="width:90px;height:75px;object-fit:cover;">
                    </div>
                    <div>
                        <div class="fw-bold">${UI.esc(p.nombre)}</div>
                        <small class="text-muted">
                            <i class="bi bi-box-seam"></i> Producto
                        </small>
                    </div>
                </div>
            </td>

            <td>
                <span class="badge ${p.categoria === 'ALIMENTO' ? 'bg-success' : 'bg-info'}">
                    ${p.categoria}
                </span>
            </td>

            <td>
                <span class="fw-bold">S/ ${Number(p.precio).toFixed(2)}</span>
            </td>

            <td>
                ${p.stock === 0
                    ? `<span class="badge bg-danger">Sin stock</span>`
                    : `<span class="badge bg-success">${p.stock} disponibles</span>`
                }
            </td>

            <td class="text-end">
                <a href="producto-form.html?id=${p.idProducto}"
                   class="btn btn-sm btn-outline-primary"
                   title="Editar producto">
                    <i class="bi bi-pencil"></i>
                </a>

                <button class="btn btn-sm btn-outline-danger"
                        data-id="${p.idProducto}"
                        data-action="eliminar"
                        title="Eliminar producto">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`).join('');

    tbody.querySelectorAll('[data-action="eliminar"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('¿Eliminar este producto?')) {
                await Productos.eliminar(btn.dataset.id);
                UI.setFlash('exito', 'Producto eliminado.');
                window.location.reload();
            }
        });
    });
}
