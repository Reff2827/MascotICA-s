const usuarioSesion = Auth.usuarioActual();

iniciarFicha();


async function iniciarFicha() {

    const idSolicitud =
        new URLSearchParams(
            window.location.search
        ).get('id');

    if (!idSolicitud) {
        mostrarSinFicha();
        return;
    }

    try {

        // Verificar la sesión real de Supabase.
        const {
            data: { user },
            error: errorUsuario
        } = await db.auth.getUser();

        if (errorUsuario || !user) {

            mostrarSinFicha(
                'Debes iniciar sesión para consultar la ficha privada.'
            );

            return;
        }

        // Comprobar si el usuario tiene permisos de administrador.
        const {
            data: resultadoAdmin,
            error: errorAdmin
        } = await db.rpc('es_admin');

        const esAdmin =
            !errorAdmin &&
            resultadoAdmin === true;

        // Mantener la navegación correspondiente al rol.
        if (esAdmin) {

            if (
                usuarioSesion &&
                usuarioSesion.rol === 'ADMIN'
            ) {
                UI.navbarAdmin(usuarioSesion);
            }

        } else if (
            usuarioSesion &&
            usuarioSesion.rol === 'CLIENTE'
        ) {

            UI.navbarCliente(usuarioSesion);

        }

        // Buscar la ficha. Supabase RLS debe permitir
        // únicamente al administrador o al propietario.
        const ficha =
            await FichasAdopcion.buscarPorSolicitud(
                idSolicitud
            );

        if (!ficha) {

            mostrarSinFicha(
                'No se encontró una ficha de adopción para esta solicitud o no tienes permiso para consultarla.'
            );

            return;
        }

        // Verificación adicional del propietario.
        const esPropietario =
            ficha.id_usuario === user.id;

        if (!esAdmin && !esPropietario) {

            mostrarSinFicha(
                'No tienes permiso para consultar esta ficha de adopción.'
            );

            return;
        }

        // Obtener el perfil del adoptante.
        const perfil =
            await FichasAdopcion.buscarPerfil(
                ficha.id_usuario
            );

        // Datos de la mascota.
        document.getElementById(
            'nombreMascota'
        ).textContent =
            ficha.nombre_mascota || 'Sin nombre';

        document.getElementById(
            'especieMascota'
        ).textContent =
            ficha.especie || 'No especificada';

        document.getElementById(
            'razaMascota'
        ).textContent =
            ficha.raza || 'No especificado';

        document.getElementById(
            'edadMascota'
        ).textContent =
            ficha.edad || 'No registrada';

        document.getElementById(
            'sexoMascota'
        ).textContent =
            ficha.sexo || 'No registrado';

        document.getElementById(
            'codigoFicha'
        ).textContent =
            ficha.codigo || '—';

        // Fecha y hora de adopción.
        const fecha = new Date(
            ficha.fecha_adopcion
        );

        document.getElementById(
            'fechaAdopcion'
        ).textContent =
            Number.isNaN(fecha.getTime())
                ? 'No registrada'
                : fecha.toLocaleDateString('es-PE');

        document.getElementById(
            'horaAdopcion'
        ).textContent =
            Number.isNaN(fecha.getTime())
                ? 'No registrada'
                : fecha.toLocaleTimeString(
                    'es-PE',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );

        // Datos del adoptante.
        document.getElementById(
            'nombreAdoptante'
        ).textContent =
            perfil?.nombre ||
            usuarioSesion?.nombre ||
            'No registrado';

        const tipoDocumento =
            ficha.tipo_documento || 'DNI';

        const numeroDocumento =
            ficha.numero_documento ||
            ficha.dni ||
            'No registrado';

        document.getElementById(
            'dniAdoptante'
        ).textContent =
            `${tipoDocumento}: ${numeroDocumento}`;

        // Fotografía de la mascota.
        document.getElementById(
            'fotoMascota'
        ).src =
            UI.imagenOPlaceholder(
                ficha.imagen_url,
                ficha.nombre_mascota
            );

        // Generar el QR hacia la ficha pública.
        const urlPublica = new URL(
            'ficha-publica.html',
            window.location.href
        );

        urlPublica.searchParams.set(
            'id',
            ficha.codigo
        );

        const contenedorQR =
            document.getElementById('codigoQR');

        contenedorQR.replaceChildren();

        new QRCode(
            contenedorQR,
            {
                text: urlPublica.href,
                width: 180,
                height: 180
            }
        );

        document.getElementById(
            'textoCodigo'
        ).textContent =
            ficha.codigo || '';

        // Mostrar la ficha completa.
        document.getElementById(
            'cargando'
        ).classList.add('d-none');

        document.getElementById(
            'ficha'
        ).classList.remove('d-none');

    } catch (error) {

        console.error(
            'Error al cargar la ficha de adopción:',
            error
        );

        mostrarSinFicha(
            'No se pudo cargar la ficha. Comprueba tu sesión e inténtalo nuevamente.'
        );

    }

}

function mostrarSinFicha(
    mensaje = 'No se encontró una ficha de adopción para esta solicitud.'
) {

    document.getElementById(
        'cargando'
    ).classList.add('d-none');

    document.getElementById(
        'ficha'
    ).classList.add('d-none');

    document.getElementById(
        'mensajeSinFicha'
    ).textContent = mensaje;

    document.getElementById(
        'sinFicha'
    ).classList.remove('d-none');

}
