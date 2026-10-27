'use strict';

// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
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

// ==========================================
// ELEMENTOS
// ==========================================

const formLogin = document.getElementById('formLogin');
const formPin = document.getElementById('formPin');

const panelCredenciales = document.getElementById('panelCredenciales');
const panelPin = document.getElementById('panelPin');

const inputCorreo = document.getElementById('correo');
const inputPassword = document.getElementById('password');
const inputPin = document.getElementById('codigoPin');

const btnIngresar = document.getElementById('btnIngresar');
const btnVerificar = document.getElementById('btnVerificar');
const btnVolver = document.getElementById('btnVolver');
const btnTema = document.getElementById('btnTema');

// Opcional: se integra cuando el login.html incluya este botón.
const btnMostrarPassword = document.getElementById('btnMostrarPassword');

const mensajeLogin = document.getElementById('mensajeLogin');
const mensajePin = document.getElementById('mensajePin');

let correoPendiente = '';
let usuarioAutenticado = null;

// Evita que el formulario solicite el PIN varias veces simultáneamente.
let solicitudPinEnCurso = false;

// ==========================================
// TEMA CLARO / OSCURO
// ==========================================

function aplicarTema(tema) {
    const temaSeguro = tema === 'dark' ? 'dark' : 'light';

    document.documentElement.dataset.theme = temaSeguro;

    btnTema.textContent = temaSeguro === 'dark' ? '☀' : '☾';

    btnTema.setAttribute(
        'aria-label',
        temaSeguro === 'dark'
            ? 'Cambiar a modo claro'
            : 'Cambiar a modo oscuro'
    );

    try {
        localStorage.setItem('mascoticas-admin-theme', temaSeguro);
    } catch {
        // La aplicación continúa aunque el almacenamiento no esté disponible.
    }
}

function inicializarTema() {
    let temaGuardado = null;

    try {
        temaGuardado = localStorage.getItem('mascoticas-admin-theme');
    } catch {
        // Se utilizará el tema claro por defecto.
    }

    aplicarTema(temaGuardado || 'light');
}

btnTema.addEventListener('click', () => {
    const actual = document.documentElement.dataset.theme;
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

inicializarTema();

// ==========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ==========================================

function alternarVisibilidadPassword() {
    if (!inputPassword || !btnMostrarPassword) {
        return;
    }

    const mostrar = inputPassword.type === 'password';

    inputPassword.type = mostrar ? 'text' : 'password';

    btnMostrarPassword.setAttribute(
        'aria-label',
        mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'
    );

    btnMostrarPassword.setAttribute(
        'aria-pressed',
        String(mostrar)
    );

    btnMostrarPassword.setAttribute(
        'title',
        mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'
    );

    // Permite usar tanto texto como iconos dentro del botón.
    const texto = btnMostrarPassword.querySelector(
        '[data-password-toggle-text]'
    );

    if (texto) {
        texto.textContent = mostrar ? 'Ocultar' : 'Mostrar';
    } else if (
        btnMostrarPassword.textContent.trim() === 'Mostrar' ||
        btnMostrarPassword.textContent.trim() === 'Ocultar'
    ) {
        btnMostrarPassword.textContent = mostrar
            ? 'Ocultar'
            : 'Mostrar';
    }
}

if (btnMostrarPassword) {
    btnMostrarPassword.addEventListener(
        'click',
        alternarVisibilidadPassword
    );
}

// ==========================================
// MENSAJES Y BOTONES
// ==========================================

function mostrarMensaje(elemento, texto, tipo = 'error') {
    if (!elemento) {
        return;
    }

    elemento.textContent = texto;
    elemento.className = `login-message show ${tipo}`;
    elemento.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    elemento.setAttribute('aria-live', 'polite');
}

function limpiarMensaje(elemento) {
    if (!elemento) {
        return;
    }

    elemento.textContent = '';
    elemento.className = 'login-message';
    elemento.removeAttribute('role');
    elemento.removeAttribute('aria-live');
}

function establecerCarga(boton, cargando, textoNormal) {
    if (!boton) {
        return;
    }

    boton.disabled = cargando;
    boton.textContent = cargando ? 'Procesando…' : textoNormal;
}

// ==========================================
// INTERPRETAR ERRORES DE SUPABASE
// ==========================================

function obtenerMensajeError(error, operacion = 'general') {
    const mensajeOriginal = String(
        error?.message || error?.msg || error || ''
    );

    const mensaje = mensajeOriginal.toLowerCase();

    console.error(
        `Detalle del error de Supabase (${operacion}):`,
        error
    );

    if (
        error?.status === 429 ||
        mensaje.includes('too many requests') ||
        mensaje.includes('rate limit') ||
        mensaje.includes('security purposes')
    ) {
        if (operacion === 'pin') {
            return 'Supabase ha limitado temporalmente el envío de códigos. Espera antes de solicitar otro PIN.';
        }

        return 'Se han realizado demasiados intentos. Espera un momento antes de volver a intentarlo.';
    }

    if (
        mensaje.includes('invalid login credentials') ||
        mensaje.includes('invalid credentials')
    ) {
        return 'El correo o la contraseña son incorrectos.';
    }

    if (
        mensaje.includes('email not confirmed')
    ) {
        return 'El correo de esta cuenta todavía no está confirmado.';
    }

    if (
        mensaje.includes('expired') ||
        mensaje.includes('otp_expired') ||
        mensaje.includes('token has expired')
    ) {
        return 'El código ha caducado. Vuelve a solicitar un PIN cuando sea posible.';
    }

    if (
        mensaje.includes('invalid otp') ||
        mensaje.includes('token is invalid') ||
        mensaje.includes('invalid token')
    ) {
        return 'El código no es válido. Comprueba los 8 dígitos e inténtalo nuevamente.';
    }

    if (operacion === 'pin') {
        return 'No se pudo enviar el código. Revisa el detalle en la consola y vuelve a intentarlo más tarde.';
    }

    return mensajeOriginal || 'Ocurrió un error inesperado. Inténtalo nuevamente.';
}

function validarElementosLogin() {
    const elementosFaltantes = [];

    const requeridos = [
        ['formLogin', formLogin],
        ['formPin', formPin],
        ['panelCredenciales', panelCredenciales],
        ['panelPin', panelPin],
        ['correo', inputCorreo],
        ['password', inputPassword],
        ['codigoPin', inputPin],
        ['btnIngresar', btnIngresar],
        ['btnVerificar', btnVerificar],
        ['btnVolver', btnVolver],
        ['btnTema', btnTema],
        ['mensajeLogin', mensajeLogin],
        ['mensajePin', mensajePin]
    ];

    for (const [nombre, elemento] of requeridos) {
        if (!elemento) {
            elementosFaltantes.push(nombre);
        }
    }

    if (elementosFaltantes.length > 0) {
        console.error(
            'Faltan elementos requeridos en login.html:',
            elementosFaltantes.join(', ')
        );

        return false;
    }

    return true;
}

// ==========================================
// VALIDACIÓN DE CORREO
// ==========================================

function validarCorreo(correo) {
    // Validación básica de formato; Supabase confirma si la cuenta existe.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// ==========================================
// PASO 1: CORREO Y CONTRASEÑA
// ==========================================

if (validarElementosLogin()) {
    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        if (solicitudPinEnCurso) {
            return;
        }

        limpiarMensaje(mensajeLogin);

        const correo = inputCorreo.value.trim().toLowerCase();
        const password = inputPassword.value;

        if (!correo || !password) {
            mostrarMensaje(
                mensajeLogin,
                'Ingresa tu correo y contraseña.'
            );
            return;
        }

        if (!validarCorreo(correo)) {
            mostrarMensaje(
                mensajeLogin,
                'Ingresa una dirección de correo válida.'
            );
            inputCorreo.focus();
            return;
        }

        solicitudPinEnCurso = true;

        establecerCarga(btnIngresar, true, 'Continuar →');

        try {
            // Comprobar las credenciales con Supabase.
            const { data: datosLogin, error: errorLogin } =
                await supabaseClient.auth.signInWithPassword({
                    email: correo,
                    password
                });

            if (errorLogin) {
                mostrarMensaje(
                    mensajeLogin,
                    obtenerMensajeError(errorLogin, 'login')
                );
                return;
            }

            if (!datosLogin?.user) {
                await supabaseClient.auth.signOut();

                mostrarMensaje(
                    mensajeLogin,
                    'Supabase no devolvió un usuario válido.'
                );
                return;
            }

            // Validar el usuario autenticado.
            const { data: usuarioAuth, error: errorUsuario } =
                await supabaseClient.auth.getUser();

            if (errorUsuario || !usuarioAuth.user) {
                await supabaseClient.auth.signOut();

                mostrarMensaje(
                    mensajeLogin,
                    errorUsuario
                        ? obtenerMensajeError(errorUsuario, 'usuario')
                        : 'No se pudo verificar la identidad de la cuenta.'
                );
                return;
            }

            // Validar el rol consultando el perfil asociado al usuario.
            const { data: perfil, error: errorPerfil } =
                await supabaseClient
                    .from('perfiles')
                    .select('id, nombre, rol')
                    .eq('id', usuarioAuth.user.id)
                    .single();

            if (errorPerfil || !perfil) {
                await supabaseClient.auth.signOut();

                console.error(
                    'Error consultando el perfil:',
                    errorPerfil?.message
                );

                mostrarMensaje(
                    mensajeLogin,
                    'No se pudo consultar el perfil de esta cuenta.'
                );
                return;
            }

            if (perfil.rol !== 'ADMIN') {
                await supabaseClient.auth.signOut();

                mostrarMensaje(
                    mensajeLogin,
                    'Esta aplicación es exclusiva para administradores.'
                );
                return;
            }

            // Guardar temporalmente el correo para solicitar el PIN.
            correoPendiente = correo;

            // Cerrar la sesión de contraseña antes de iniciar el flujo OTP,
            // siguiendo el flujo que utiliza la web actual.
            const { error: errorCerrarSesion } =
                await supabaseClient.auth.signOut();

            if (errorCerrarSesion) {
                console.error(
                    'Error cerrando la sesión previa al PIN:',
                    errorCerrarSesion.message
                );

                mostrarMensaje(
                    mensajeLogin,
                    obtenerMensajeError(errorCerrarSesion, 'sesion')
                );
                return;
            }

            // Solicitar el código de verificación por correo.
            const { error: errorPin } =
                await supabaseClient.auth.signInWithOtp({
                    email: correoPendiente,
                    options: {
                        shouldCreateUser: false
                    }
                });

            if (errorPin) {
                mostrarMensaje(
                    mensajeLogin,
                    obtenerMensajeError(errorPin, 'pin')
                );
                return;
            }

            // Mostrar el panel de verificación.
            panelCredenciales.hidden = true;
            panelPin.hidden = false;

            inputPin.value = '';
            inputPin.focus();

            mostrarMensaje(
                mensajePin,
                'Código enviado. Revisa tu correo electrónico.',
                'success'
            );

        } catch (error) {
            console.error('Error de inicio de sesión:', error);

            mostrarMensaje(
                mensajeLogin,
                obtenerMensajeError(error, 'general')
            );
        } finally {
            solicitudPinEnCurso = false;

            establecerCarga(
                btnIngresar,
                false,
                'Continuar →'
            );
        }
    });

    // ==========================================
    // PASO 2: VERIFICAR PIN Y ROL
    // ==========================================

    formPin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        limpiarMensaje(mensajePin);

        const codigo = inputPin.value.trim();

        if (!correoPendiente) {
            mostrarMensaje(
                mensajePin,
                'Vuelve al inicio e ingresa tus credenciales nuevamente.'
            );
            return;
        }

        if (!/^\d{8}$/.test(codigo)) {
            mostrarMensaje(
                mensajePin,
                'El código debe contener exactamente 8 dígitos.'
            );
            inputPin.focus();
            return;
        }

        establecerCarga(
            btnVerificar,
            true,
            'Verificar y entrar →'
        );

        try {
            // Verificar el código enviado por correo.
            const { data, error } =
                await supabaseClient.auth.verifyOtp({
                    email: correoPendiente,
                    token: codigo,
                    type: 'email'
                });

            if (error || !data.user) {
                mostrarMensaje(
                    mensajePin,
                    error
                        ? obtenerMensajeError(error, 'pin')
                        : 'No se pudo identificar al usuario después de verificar el código.'
                );
                return;
            }

            // Comprobar nuevamente el rol tras verificar el PIN.
            const { data: perfil, error: errorPerfil } =
                await supabaseClient
                    .from('perfiles')
                    .select('id, nombre, rol')
                    .eq('id', data.user.id)
                    .single();

            if (errorPerfil || !perfil) {
                await supabaseClient.auth.signOut();

                console.error(
                    'Error consultando el perfil tras el PIN:',
                    errorPerfil?.message
                );

                mostrarMensaje(
                    mensajePin,
                    'No se pudo verificar el perfil de la cuenta.'
                );
                return;
            }

            if (perfil.rol !== 'ADMIN') {
                await supabaseClient.auth.signOut();

                mostrarMensaje(
                    mensajePin,
                    'Tu cuenta no tiene permisos de administrador.'
                );
                return;
            }

            // Confirmar que Supabase conserva una sesión válida.
            const { data: sesionActual, error: errorSesion } =
                await supabaseClient.auth.getSession();

            if (
                errorSesion ||
                !sesionActual?.session ||
                sesionActual.session.user.id !== data.user.id
            ) {
                await supabaseClient.auth.signOut();

                console.error(
                    'No se encontró una sesión válida después del PIN:',
                    errorSesion?.message
                );

                mostrarMensaje(
                    mensajePin,
                    'No se pudo conservar la sesión de administrador. Vuelve a iniciar sesión.'
                );
                return;
            }

            usuarioAutenticado = {
                idUsuario: perfil.id,
                nombre: perfil.nombre,
                correo: data.user.email,
                rol: perfil.rol
            };

            // La sesión autenticada se mantiene en Supabase.
            // El rol se vuelve a comprobar al entrar al dashboard.
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Error verificando el PIN:', error);

            mostrarMensaje(
                mensajePin,
                obtenerMensajeError(error, 'pin')
            );
        } finally {
            establecerCarga(
                btnVerificar,
                false,
                'Verificar y entrar →'
            );
        }
    });

    // ==========================================
    // VOLVER AL INICIO DE SESIÓN
    // ==========================================

    btnVolver.addEventListener('click', async () => {
        btnVolver.disabled = true;

        try {
            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                console.error(
                    'Error cerrando la sesión temporal:',
                    error.message
                );
            }
        } catch (error) {
            console.error(
                'Error cerrando la sesión temporal:',
                error
            );
        } finally {
            correoPendiente = '';
            usuarioAutenticado = null;

            inputPin.value = '';
            inputPassword.value = '';

            // Si la contraseña estaba visible, volver a ocultarla.
            if (inputPassword.type !== 'password') {
                inputPassword.type = 'password';
            }

            if (btnMostrarPassword) {
                btnMostrarPassword.setAttribute(
                    'aria-label',
                    'Mostrar contraseña'
                );
                btnMostrarPassword.setAttribute(
                    'aria-pressed',
                    'false'
                );
                btnMostrarPassword.setAttribute(
                    'title',
                    'Mostrar contraseña'
                );

                const texto = btnMostrarPassword.querySelector(
                    '[data-password-toggle-text]'
                );

                if (texto) {
                    texto.textContent = 'Mostrar';
                } else if (
                    btnMostrarPassword.textContent.trim() === 'Mostrar' ||
                    btnMostrarPassword.textContent.trim() === 'Ocultar'
                ) {
                    btnMostrarPassword.textContent = 'Mostrar';
                }
            }

            limpiarMensaje(mensajePin);
            limpiarMensaje(mensajeLogin);

            panelPin.hidden = true;
            panelCredenciales.hidden = false;

            btnVolver.disabled = false;
            inputCorreo.focus();
        }
    });
}
