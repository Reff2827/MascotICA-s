const usuario =
    typeof Auth !== 'undefined'
        ? Auth.usuarioActual()
        : null;


if (usuario) {
    UI.navbarCliente(usuario);
}


cargarFichaPublica();


async function cargarFichaPublica() {

    const codigo =
        new URLSearchParams(window.location.search)
            .get('id');

    if (!codigo) {
        mostrarSinFicha();
        return;
    }

    const { data, error } = await db.rpc(
        'obtener_ficha_publica',
        {
            p_codigo: codigo
        }
    );

    if (
        error ||
        !data ||
        data.length === 0
    ) {
        mostrarSinFicha();
        return;
    }

    const ficha = data[0];

    document.getElementById('nombreMascota').textContent =
        ficha.nombre_mascota;

    document.getElementById('especieMascota').textContent =
        ficha.especie;

    document.getElementById('razaMascota').textContent =
        ficha.raza || 'No especificado';

    document.getElementById('edadMascota').textContent =
        ficha.edad;

    document.getElementById('sexoMascota').textContent =
        ficha.sexo || 'No registrado';

    document.getElementById('codigoFicha').textContent =
        ficha.codigo;

    document.getElementById('fechaAdopcion').textContent =
        new Date(
            ficha.fecha_adopcion
        ).toLocaleDateString('es-PE');

    document.getElementById('fotoMascota').src =
        UI.imagenOPlaceholder(
            ficha.imagen_url,
            ficha.nombre_mascota
        );

    document.getElementById('cargando')
        .classList.add('d-none');

    document.getElementById('ficha')
        .classList.remove('d-none');
}


function mostrarSinFicha() {

    document.getElementById('cargando')
        .classList.add('d-none');

    document.getElementById('sinFicha')
        .classList.remove('d-none');

}
