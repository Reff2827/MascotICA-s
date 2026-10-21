/* Validación de formularios: restricciones al escribir/pegar
   y avisos claros debajo de cada campo. */
Validar.soloLetras('regNombre');

['correo', 'password', 'regNombre', 'regCorreo'].forEach(
    id => Validar.limpiarAlEscribir(id)
);

/* =========================
   TEMA
========================== */

const btnTema =
    document.getElementById('btnTema');


function actualizarBotonTema() {

    const oscuro =
        Tema.efectivo() === 'dark';

    btnTema.innerHTML = oscuro
        ? '<i class="bi bi-sun-fill"></i>'
        : '<i class="bi bi-moon-stars-fill"></i>';

    btnTema.setAttribute(
        'aria-label',
        oscuro
            ? 'Cambiar a modo claro'
            : 'Cambiar a modo oscuro'
    );

    btnTema.setAttribute(
        'title',
        oscuro
            ? 'Cambiar a modo claro'
            : 'Cambiar a modo oscuro'
    );
}


btnTema.addEventListener(
    'click',
    () => {

        Tema.alternar();

        actualizarBotonTema();
    }
);


actualizarBotonTema();


/* =========================
   PANELES
========================== */

const panelLogin =
    document.getElementById('panelLogin');

const panelPin =
    document.getElementById('panelPin');

const panelRegistro =
    document.getElementById('panelRegistro');

const panelCambioPassword =
    document.getElementById('panelCambioPassword');

const mensajeLogin =
    document.getElementById('mensajeLogin');

let correoPendiente = '';


/* =========================
   MENSAJES
========================== */

function mostrarMensaje(
    texto,
    tipo = 'danger'
) {

    mensajeLogin.innerHTML = `
        <div
            class="alert alert-${tipo}"
            role="alert"
        >
            ${texto}
        </div>
    `;
}


function limpiarMensaje() {

    mensajeLogin.innerHTML = '';
}


/* =========================
   PANELES
========================== */

function mostrarPanel(panel) {

    panelLogin.classList.add('d-none');
    panelPin.classList.add('d-none');
    panelRegistro.classList.add('d-none');
    panelCambioPassword.classList.add('d-none');

    panel.classList.remove('d-none');

    limpiarMensaje();
}


/* =========================
   PASSWORD VISIBILIDAD
========================== */

function configurarMostrarPassword(
    inputId,
    buttonId
) {

    const input =
        document.getElementById(inputId);

    const button =
        document.getElementById(buttonId);

    if (!input || !button) return;

    button.addEventListener(
        'click',
        () => {

            const mostrar =
                input.type === 'password';

            input.type =
                mostrar ? 'text' : 'password';

            button.innerHTML =
                mostrar
                    ? '<i class="bi bi-eye-slash"></i>'
                    : '<i class="bi bi-eye"></i>';

            button.setAttribute(
                'aria-label',
                mostrar
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
            );
        }
    );
}


configurarMostrarPassword(
    'password',
    'btnMostrarPassword'
);

configurarMostrarPassword(
    'regPassword',
    'btnMostrarRegPassword'
);

configurarMostrarPassword(
    'cambioPassword',
    'btnMostrarCambioPassword'
);


/* =========================
   PASSWORD REQUIREMENTS
========================== */

function actualizarRequisitosPassword(
    password,
    prefijo = ''
) {

    const resultado =
        Auth.validarFortalezaPassword(password);

    const requisitos = [
        {
            elemento:
                document.getElementById(
                    prefijo + 'ReqLongitud'
                ),
            cumple: resultado.longitud
        },
        {
            elemento:
                document.getElementById(
                    prefijo + 'ReqMayuscula'
                ),
            cumple: resultado.mayuscula
        },
        {
            elemento:
                document.getElementById(
                    prefijo + 'ReqMinuscula'
                ),
            cumple: resultado.minuscula
        },
        {
            elemento:
                document.getElementById(
                    prefijo + 'ReqNumero'
                ),
            cumple: resultado.numero
        }
    ];

    requisitos.forEach(item => {

        if (!item.elemento) return;

        const icono =
            item.elemento.querySelector('i');

        if (item.cumple) {

            item.elemento.classList.add(
                'text-success'
            );

            item.elemento.classList.remove(
                'text-muted'
            );

            if (icono) {
                icono.className =
                    'bi bi-check-circle-fill';
            }

        } else {

            item.elemento.classList.remove(
                'text-success'
            );

            item.elemento.classList.add(
                'text-muted'
            );

            if (icono) {
                icono.className =
                    'bi bi-circle';
            }
        }
    });

    return resultado.valida;
}


const regPassword =
    document.getElementById(
        'regPassword'
    );

const btnRegistrar =
    document.getElementById(
        'btnRegistrar'
    );


regPassword.addEventListener(
    'input',
    () => {

        const valida =
            actualizarRequisitosPassword(
                regPassword.value
            );

        btnRegistrar.disabled =
            !valida;
    }
);


const cambioPassword =
    document.getElementById(
        'cambioPassword'
    );

const cambioPasswordConfirmar =
    document.getElementById(
        'cambioPasswordConfirmar'
    );

const btnCambiarPassword =
    document.getElementById(
        'btnCambiarPassword'
    );


function validarCambioPassword() {

    const valida =
        actualizarRequisitosPassword(
            cambioPassword.value,
            'cambio'
        );

    const coinciden =
        cambioPassword.value ===
        cambioPasswordConfirmar.value &&
        cambioPasswordConfirmar.value.length > 0;

    btnCambiarPassword.disabled =
        !(valida && coinciden);
}


cambioPassword.addEventListener(
    'input',
    validarCambioPassword
);

cambioPasswordConfirmar.addEventListener(
    'input',
    validarCambioPassword
);


/* =========================
   IR A REGISTRO
========================== */

document
    .getElementById('btnIrRegistro')
    .addEventListener(
        'click',
        () => {

            mostrarPanel(panelRegistro);
        }
    );


document
    .getElementById('btnVolverLogin')
    .addEventListener(
        'click',
        () => {

            OtpAnim.reiniciar();

            mostrarPanel(panelLogin);
        }
    );


document
    .getElementById('btnVolverLoginRegistro')
    .addEventListener(
        'click',
        () => {

            mostrarPanel(panelLogin);
        }
    );


/* =========================
   LOGIN
========================== */

document
    .getElementById('formLogin')
    .addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            limpiarMensaje();

            const correo =
                document
                    .getElementById('correo')
                    .value
                    .trim();

            const password =
                document
                    .getElementById('password')
                    .value;

            const errCorreo = Validar.correo(correo);
            const errPassword =
                password === ''
                    ? 'Ingresa tu contraseña.'
                    : null;

            Validar.error('correo', errCorreo);
            Validar.error('password', errPassword);

            if (errCorreo || errPassword) {

                document
                    .getElementById(
                        errCorreo ? 'correo' : 'password'
                    )
                    .focus();

                return;
            }

            const btn =
                document
                    .getElementById('btnIngresar');

            btn.disabled = true;

            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Verificando...
            `;


            const passwordValida =
                await Auth.validarPassword(
                    correo,
                    password
                );


            if (!passwordValida) {

                mostrarMensaje(
                    'Correo o contraseña incorrectos.'
                );

                btn.disabled = false;

                btn.innerHTML = `
                    <i class="bi bi-box-arrow-in-right"></i>
                    Ingresar
                `;

                return;
            }


            correoPendiente = correo;


            const errorPin =
                await Auth.enviarPin(
                    correo
                );


            if (errorPin) {

                mostrarMensaje(errorPin);

                btn.disabled = false;

                btn.innerHTML = `
                    <i class="bi bi-box-arrow-in-right"></i>
                    Ingresar
                `;

                return;
            }


            mostrarPanel(panelPin);

            OtpAnim.mostrar();


            btn.disabled = false;

            btn.innerHTML = `
                <i class="bi bi-box-arrow-in-right"></i>
                Ingresar
            `;
        }
    );


/* =========================
   VERIFICAR PIN
========================== */

document
    .getElementById('formPin')
    .addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            limpiarMensaje();

            const codigo = OtpAnim.valor();

            if (codigo.length < 8) {

                mostrarMensaje(
                    'Ingresa los 8 dígitos del código.'
                );

                OtpAnim.error();

                return;
            }

            const btn =
                document
                    .getElementById('btnVerificar');

            btn.disabled = true;

            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Verificando...
            `;


            const resultado =
                await Auth.verificarPin(
                    correoPendiente,
                    codigo
                );


            if (resultado.error) {

                OtpAnim.error();

                mostrarMensaje(
                    resultado.error
                );

                btn.disabled = false;

                btn.innerHTML = `
                    <i class="bi bi-check-circle"></i>
                    Verificar código
                `;

                return;
            }


            OtpAnim.ok();

            if (
                resultado.requiereCambioPassword
            ) {

                mostrarPanel(
                    panelCambioPassword
                );

                return;
            }


            Auth.redirigirSegunRol(
                resultado.usuario.rol
            );
        }
    );


/* =========================
   CAMBIO DE PASSWORD
========================== */

document
    .getElementById('formCambioPassword')
    .addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            limpiarMensaje();

            const nuevaPassword =
                cambioPassword.value;

            const confirmar =
                cambioPasswordConfirmar.value;


            if (
                nuevaPassword !==
                confirmar
            ) {

                mostrarMensaje(
                    'Las contraseñas no coinciden.'
                );

                return;
            }


            const btn =
                document.getElementById(
                    'btnCambiarPassword'
                );


            btn.disabled = true;

            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Actualizando...
            `;


            const error =
                await Auth.actualizarPassword(
                    nuevaPassword
                );


            if (error) {

                mostrarMensaje(error);

                btn.disabled = false;

                btn.innerHTML = `
                    <i class="bi bi-key"></i>
                    Cambiar contraseña
                `;

                return;
            }


            mostrarMensaje(
                'Contraseña actualizada correctamente.',
                'success'
            );


            setTimeout(
                () => {

                    const usuario =
                        Auth.usuarioActual();

                    if (usuario) {

                        Auth.redirigirSegunRol(
                            usuario.rol
                        );
                    }

                },
                700
            );
        }
    );


/* =========================
   CONTINUAR SIN CAMBIAR
========================== */

document
    .getElementById(
        'btnContinuarSinCambiar'
    )
    .addEventListener(
        'click',
        () => {

            const usuario =
                Auth.usuarioActual();

            if (usuario) {

                Auth.redirigirSegunRol(
                    usuario.rol
                );
            }
        }
    );


/* =========================
   REGISTRO
========================== */

document
    .getElementById('formRegistro')
    .addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            limpiarMensaje();

            const nombre =
                document
                    .getElementById('regNombre')
                    .value
                    .trim();

            const correo =
                document
                    .getElementById('regCorreo')
                    .value
                    .trim();

            const errNombre =
                Validar.textoLetras(nombre, 'El nombre');
            const errCorreoReg =
                Validar.correo(correo);

            Validar.error('regNombre', errNombre);
            Validar.error('regCorreo', errCorreoReg);

            if (errNombre || errCorreoReg) {

                document
                    .getElementById(
                        errNombre ? 'regNombre' : 'regCorreo'
                    )
                    .focus();

                return;
            }

            const password =
                document
                    .getElementById('regPassword')
                    .value;


            const validacion =
                Auth.validarFortalezaPassword(
                    password
                );


            if (!validacion.valida) {

                mostrarMensaje(
                    'La contraseña no cumple todos los requisitos.'
                );

                return;
            }


            const btn =
                document.getElementById(
                    'btnRegistrar'
                );

            btn.disabled = true;

            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Creando cuenta...
            `;


            const error =
                await Auth.registrar(
                    nombre,
                    correo,
                    password
                );


            if (error) {

                mostrarMensaje(error);

                btn.disabled = false;

                btn.innerHTML = `
                    <i class="bi bi-person-plus"></i>
                    Crear cuenta
                `;

                return;
            }


            mostrarMensaje(
                'Cuenta creada correctamente. Ya puedes iniciar sesión.',
                'success'
            );


            document
                .getElementById('correo')
                .value = correo;

            document
                .getElementById('password')
                .value = '';


            mostrarPanel(panelLogin);


            btn.disabled = false;

            btn.innerHTML = `
                <i class="bi bi-person-plus"></i>
                Crear cuenta
            `;
        }
    );


/* =========================
   SESIÓN YA EXISTENTE
========================== */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const usuario =
            Auth.usuarioActual();

        if (usuario) {

            Auth.redirigirSegunRol(
                usuario.rol
            );
        }
    }
);
