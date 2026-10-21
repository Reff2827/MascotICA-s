const usuario =
    Auth.requireAdmin();


if (usuario) {

    UI.navbarAdmin(usuario);

    cargarSiEsEdicion();

}


/* La edad se guarda como texto ("2 años", "1 mes") para no cambiar
   la base de datos; en el formulario se captura como número + unidad. */
function cargarEdad(texto) {

    const m =
        String(texto || '')
            .match(
                /(\d+)\s*(a[nñ]os?|mes(?:es)?)?/i
            );

    if (!m) return;

    document.getElementById(
        'edad'
    ).value =
        m[1];

    document.getElementById(
        'edadUnidad'
    ).value =
        /^mes/i.test(m[2] || '')
            ? 'meses'
            : 'años';
}


function textoEdad(numero, unidad) {

    const n = Number(numero);

    if (unidad === 'meses') {
        return n + (n === 1 ? ' mes' : ' meses');
    }

    return n + (n === 1 ? ' año' : ' años');
}


/* NUEVO: cargar las personalidades guardadas al editar */
function cargarPersonalidad(personalidad) {

    const seleccionadas = Array.isArray(personalidad)
        ? personalidad
        : [];

    document
        .querySelectorAll('#personalidad input[type="checkbox"]')
        .forEach(checkbox => {

            checkbox.checked =
                seleccionadas.includes(checkbox.value);

        });

}


/* NUEVO: obtener las personalidades seleccionadas */
function obtenerPersonalidad() {

    return Array.from(
        document.querySelectorAll(
            '#personalidad input[type="checkbox"]:checked'
        )
    ).map(checkbox => checkbox.value);

}


/* Solo letras en nombre y raza; solo dígitos en la edad */
Validar.soloLetras('nombre');
Validar.soloLetras('raza');
Validar.soloDigitos('edad');

async function cargarSiEsEdicion() {

    const id =
        new URLSearchParams(
            window.location.search
        ).get('id');


    if (!id) return;


    const mascota =
        await Mascotas.buscarPorId(id);


    if (!mascota) {

        UI.setFlash(
            'error',
            'La mascota indicada no existe.'
        );

        window.location.href =
            'mascotas.html';

        return;

    }


    document.getElementById(
        'tituloPagina'
    ).textContent =
        "Editar mascota · MascotICA's Admin";


    document.getElementById(
        'tituloForm'
    ).textContent =
        'Editar mascota';


    document.getElementById(
        'idMascota'
    ).value =
        mascota.idMascota;


    document.getElementById(
        'nombre'
    ).value =
        mascota.nombre;


    document.getElementById(
        'especie'
    ).value =
        mascota.especie;


    document.getElementById(
        'raza'
    ).value =
        mascota.raza || '';


    cargarEdad(
        mascota.edad
    );


    document.getElementById(
        'sexo'
    ).value =
        mascota.sexo || '';


    document.getElementById(
        'estado'
    ).value =
        mascota.estado;


    /* NUEVO: cargar los datos utilizados por Match */

    document.getElementById(
        'tamano'
    ).value =
        mascota.tamano || '';


    document.getElementById(
        'nivelActividad'
    ).value =
        mascota.nivelActividad || '';


    cargarPersonalidad(
        mascota.personalidad
    );


    document.getElementById(
        'conviveNinos'
    ).value =
        mascota.conviveNinos || 'DESCONOCIDO';


    document.getElementById(
        'conviveMascotas'
    ).value =
        mascota.conviveMascotas || 'DESCONOCIDO';


    document.getElementById(
        'imagenUrl'
    ).value =
        mascota.imagenUrl || '';


    if (mascota.imagenUrl) {

        mostrarPreview(
            mascota.imagenUrl
        );

    }

}


function mostrarPreview(src) {

    const preview =
        document.getElementById(
            'previewImagen'
        );

    const contenedor =
        document.getElementById(
            'contenedorPreview'
        );


    preview.src =
        src;


    contenedor.classList.remove(
        'd-none'
    );

}


function ocultarPreview() {

    const preview =
        document.getElementById(
            'previewImagen'
        );

    const contenedor =
        document.getElementById(
            'contenedorPreview'
        );


    preview.src =
        '';


    contenedor.classList.add(
        'd-none'
    );

}


document
    .getElementById('btnUrl')
    .addEventListener(
        'click',
        function () {

            document
                .getElementById(
                    'contenedorUrl'
                )
                .classList.remove(
                    'd-none'
                );


            document
                .getElementById(
                    'contenedorArchivo'
                )
                .classList.add(
                    'd-none'
                );


            document
                .getElementById(
                    'imagenArchivo'
                ).value =
                    '';


            const url =
                document
                    .getElementById(
                        'imagenUrl'
                    )
                    .value
                    .trim();


            if (url) {

                mostrarPreview(
                    url
                );

            } else {

                ocultarPreview();

            }

        }
    );


document
    .getElementById('btnArchivo')
    .addEventListener(
        'click',
        function () {

            document
                .getElementById(
                    'contenedorUrl'
                )
                .classList.add(
                    'd-none'
                );


            document
                .getElementById(
                    'contenedorArchivo'
                )
                .classList.remove(
                    'd-none'
                );


            document
                .getElementById(
                    'imagenUrl'
                ).value =
                    '';


            ocultarPreview();

        }
    );


document
    .getElementById('imagenUrl')
    .addEventListener(
        'input',
        function () {

            const url =
                this.value.trim();


            if (url) {

                mostrarPreview(
                    url
                );

            } else {

                ocultarPreview();

            }

        }
    );


document
    .getElementById('imagenArchivo')
    .addEventListener(
        'change',
        function () {

            const archivo =
                this.files[0];


            if (!archivo) {

                ocultarPreview();

                return;

            }


            if (
                !archivo.type.startsWith(
                    'image/'
                )
            ) {

                alert(
                    'Selecciona un archivo de imagen válido.'
                );

                this.value =
                    '';

                ocultarPreview();

                return;

            }


            const lector =
                new FileReader();


            lector.onload =
                function (e) {

                    mostrarPreview(
                        e.target.result
                    );

                };


            lector.readAsDataURL(
                archivo
            );

        }
    );


document
    .getElementById('formMascota')
    .addEventListener(
        'submit',
        async function (e) {

            e.preventDefault();


            const nombre =
                document
                    .getElementById('nombre')
                    .value
                    .trim();


            const especie =
                document
                    .getElementById('especie')
                    .value;


            const raza =
                document
                    .getElementById('raza')
                    .value
                    .trim();


            const edadNumero =
                document
                    .getElementById('edad')
                    .value
                    .trim();

            const edadUnidad =
                document
                    .getElementById('edadUnidad')
                    .value;


            const sexo =
                document
                    .getElementById('sexo')
                    .value;


            let valido =
                true;


            const validarCampo =
                (
                    idError,
                    condicionError
                ) => {

                    const elemento =
                        document.getElementById(
                            idError
                        );


                    elemento.classList.toggle(
                        'd-none',
                        !condicionError
                    );


                    if (condicionError) {

                        valido =
                            false;

                    }

                };


            const validarTexto =
                (
                    idError,
                    mensaje
                ) => {
                    const elemento =
                        document.getElementById(
                            idError
                        );
                    if (mensaje) {
                        elemento.textContent =
                            mensaje;
                    }
                    validarCampo(
                        idError,
                        !!mensaje
                    );
                };

            validarTexto(
                'errNombre',
                Validar.textoLetras(
                    nombre,
                    'El nombre',
                    2,
                    40
                )
            );


            validarCampo(
                'errEspecie',
                especie === ''
            );


            validarTexto(
                'errRaza',
                Validar.textoLetras(
                    raza,
                    'La raza o tipo',
                    2,
                    40
                )
            );


            validarTexto(
                'errEdad',
                Validar.entero(
                    edadNumero,
                    'La edad',
                    1,
                    edadUnidad === 'meses' ? 11 : 30
                )
            );


            validarCampo(
                'errSexo',
                sexo === ''
            );


            if (!valido) return;

            const edad =
                textoEdad(
                    edadNumero,
                    edadUnidad
                );

            const boton =
                document.getElementById(
                    'btnGuardar'
                );


            const estado =
                document.getElementById(
                    'estadoSubida'
                );


            let imagenUrl =
                document
                    .getElementById(
                        'imagenUrl'
                    )
                    .value
                    .trim();


            const archivo =
                document
                    .getElementById(
                        'imagenArchivo'
                    )
                    .files[0];


            if (archivo) {

                boton.disabled =
                    true;

                estado.textContent =
                    'Subiendo imagen...';


                const nombreArchivo =
                    Date.now() +
                    '-' +
                    archivo.name;


                const {
                    error: errorSubida
                } =
                    await db.storage
                        .from('mascotas')
                        .upload(
                            nombreArchivo,
                            archivo
                        );


                if (errorSubida) {

                    estado.textContent =
                        '';

                    boton.disabled =
                        false;

                    alert(
                        'No se pudo subir la imagen: ' +
                        errorSubida.message
                    );

                    return;

                }


                const {
                    data: publica
                } =
                    db.storage
                        .from('mascotas')
                        .getPublicUrl(
                            nombreArchivo
                        );


                imagenUrl =
                    publica.publicUrl;


                estado.textContent =
                    '';

            }


            const mascota = {

                idMascota:
                    document
                        .getElementById(
                            'idMascota'
                        )
                        .value ||
                    null,

                nombre,

                especie,

                raza,

                edad,

                sexo,

                /* NUEVO: datos de MascotICA's Match */

                tamano:
                    document
                        .getElementById(
                            'tamano'
                        )
                        .value || null,

                nivelActividad:
                    document
                        .getElementById(
                            'nivelActividad'
                        )
                        .value || null,

                personalidad:
                    obtenerPersonalidad(),

                conviveNinos:
                    document
                        .getElementById(
                            'conviveNinos'
                        )
                        .value || 'DESCONOCIDO',

                conviveMascotas:
                    document
                        .getElementById(
                            'conviveMascotas'
                        )
                        .value || 'DESCONOCIDO',


                estado:
                    document
                        .getElementById(
                            'estado'
                        )
                        .value,

                imagenUrl

            };


            await Mascotas.guardar(
                mascota
            );


            UI.setFlash(
                'exito',
                'Mascota guardada correctamente.'
            );


            window.location.href =
                'mascotas.html';

        }
    );
