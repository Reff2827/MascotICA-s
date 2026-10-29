const SESSION_KEY = 'ps_session';

const PASSWORD_POLICY_VERSION = 2;
const PRIVACY_POLICY_VERSION = '1.0';

const Auth = {

    /* =========================
       VALIDACIÓN DE PASSWORD
    ========================= */

    validarFortalezaPassword(password) {

        const valor = password || '';

        const resultado = {
            longitud: valor.length >= 8,
            mayuscula: /[A-Z]/.test(valor),
            minuscula: /[a-z]/.test(valor),
            numero: /[0-9]/.test(valor)
        };

        resultado.valida =
            resultado.longitud &&
            resultado.mayuscula &&
            resultado.minuscula &&
            resultado.numero;

        return resultado;
    },


    /* =========================
       REGISTRO
    ========================= */

    async registrar(nombre, correo, password) {

        const validacion =
            Auth.validarFortalezaPassword(password);

        if (!validacion.valida) {
            return 'La contraseña no cumple los requisitos de seguridad.';
        }


        const { error } = await db.auth.signUp({

            email: correo,

            password: password,

            options: {
                data: {
                    nombre: nombre,
                    password_policy_version:
                        PASSWORD_POLICY_VERSION,
                    privacy_policy_version: PRIVACY_POLICY_VERSION,
                    privacy_consent_at: new Date().toISOString()
                }
            }
        });


        if (error) {
            return error.message;
        }


        await db.auth.signOut();

        return null;
    },


    /* =========================
       VALIDAR PASSWORD
    ========================= */

    async validarPassword(correo, password) {

        const { error } =
            await db.auth.signInWithPassword({

                email: correo,

                password: password
            });


        if (error) {
            return false;
        }


        await db.auth.signOut();

        return true;
    },


    /* =========================
       ENVIAR PIN
    ========================= */

    async enviarPin(correo) {

        const { error } =
            await db.auth.signInWithOtp({

                email: correo,

                options: {
                    shouldCreateUser: false
                }
            });


        return error
            ? error.message
            : null;
    },


    /* =========================
       VERIFICAR PIN
    ========================= */

    async verificarPin(correo, codigo) {

        const { data, error } =
            await db.auth.verifyOtp({

                email: correo,

                token: codigo,

                type: 'email'
            });


        if (error) {
            return {
                error: error.message
            };
        }


        if (!data.user) {

            return {
                error: 'No se pudo identificar al usuario.'
            };
        }


        const perfil =
            await db
                .from('perfiles')
                .select('id, nombre, rol')
                .eq('id', data.user.id)
                .single();


        if (perfil.error) {

            return {
                error:
                    'No se pudo cargar el perfil del usuario.'
            };
        }


        const usuario = {

            idUsuario: perfil.data.id,

            nombre: perfil.data.nombre,

            rol: perfil.data.rol,

            correo: correo
        };


        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify(usuario)
        );


        const versionPassword =
            Number(
                data.user.user_metadata
                    ?.password_policy_version || 1
            );


        const requiereCambioPassword =
            versionPassword < PASSWORD_POLICY_VERSION;


        return {

            usuario: usuario,

            requiereCambioPassword:
                requiereCambioPassword
        };
    },


    /* =========================
       ACTUALIZAR PASSWORD
    ========================= */

    async actualizarPassword(password) {

        const validacion =
            Auth.validarFortalezaPassword(password);

        if (!validacion.valida) {

            return (
                'La contraseña no cumple los requisitos de seguridad.'
            );
        }


        const { data: usuarioActual, error: errorUsuario } =
            await db.auth.getUser();


        if (errorUsuario || !usuarioActual.user) {

            return (
                'No se pudo identificar la sesión actual.'
            );
        }


        const metadata =
            usuarioActual.user.user_metadata || {};


        const { error } =
            await db.auth.updateUser({

                password: password,

                data: {
                    ...metadata,
                    password_policy_version:
                        PASSWORD_POLICY_VERSION
                }
            });


        if (error) {
            return error.message;
        }


        return null;
    },


    /* =========================
       LOGOUT
    ========================= */

    async logout() {

        await db.auth.signOut();

        sessionStorage.removeItem(
            SESSION_KEY
        );
    },


    /* =========================
       USUARIO ACTUAL
    ========================= */

    usuarioActual() {

        const raw =
            sessionStorage.getItem(
                SESSION_KEY
            );

        return raw
            ? JSON.parse(raw)
            : null;
    },


    estaAutenticado() {

        return Auth.usuarioActual() !== null;
    },


    /* =========================
       REDIRECCIÓN
    ========================= */

    redirigirSegunRol(rol) {

        if (rol === 'ADMIN') {

            window.location.href =
                Auth.raiz() +
                'admin/dashboard.html';

            return;
        }


        window.location.href =
            Auth.raiz() +
            'cliente/index.html';
    },


    /* =========================
       RAÍZ DEL PROYECTO
    ========================= */

    raiz() {

        const path =
            window.location.pathname;

        return (
            path.includes('/admin/') ||
            path.includes('/cliente/')
        )
            ? '../'
            : './';
    },


    /* =========================
       VERIFICACIÓN DEL ROL EN EL SERVIDOR (auditoría H-10)

       El rol guardado en sessionStorage es solo una ayuda para la
       interfaz y puede ser alterado por el usuario desde las
       herramientas del navegador. Por eso, al entrar a una página
       protegida se vuelve a consultar el rol real en Supabase.
       Si no coincide, se corrige la sesión local y se redirige.
       La autorización real de los datos la aplican las políticas
       RLS del servidor, no esta comprobación.
    ========================= */

    async verificarRolEnServidor(rolEsperado) {

        const ocultar =
            rolEsperado === 'ADMIN';

        if (ocultar) {
            document.documentElement.style.visibility = 'hidden';
        }

        const mostrar = () => {
            document.documentElement.style.visibility = '';
        };

        try {

            const {
                data: { user },
                error: errorUsuario
            } = await db.auth.getUser();

            if (errorUsuario || !user) {

                sessionStorage.removeItem(SESSION_KEY);

                window.location.replace(
                    Auth.raiz() + 'login.html'
                );

                return;
            }

            const { data: perfil, error: errorPerfil } =
                await db
                    .from('perfiles')
                    .select('rol')
                    .eq('id', user.id)
                    .maybeSingle();

            if (errorPerfil || !perfil) {

                // No se pudo confirmar: no se concede nada extra,
                // los datos siguen protegidos por RLS.
                mostrar();

                return;
            }

            const local = Auth.usuarioActual();

            if (
                !local ||
                local.idUsuario !== user.id ||
                local.rol !== perfil.rol
            ) {

                sessionStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify({
                        ...(local || {}),
                        idUsuario: user.id,
                        rol: perfil.rol
                    })
                );
            }

            if (perfil.rol !== rolEsperado) {

                Auth.redirigirSegunRol(perfil.rol);

                return;
            }

            mostrar();

        } catch {

            mostrar();
        }
    },


    /* =========================
       PROTEGER ADMIN
    ========================= */

    requireAdmin() {

        const usuario =
            Auth.usuarioActual();


        if (!usuario) {

            window.location.href =
                Auth.raiz() +
                'login.html';

            return null;
        }


        if (usuario.rol !== 'ADMIN') {

            window.location.href =
                Auth.raiz() +
                'cliente/index.html';

            return null;
        }


        Auth.verificarRolEnServidor('ADMIN');

        return usuario;
    },


    /* =========================
       PROTEGER CLIENTE
    ========================= */

    requireCliente() {

        const usuario =
            Auth.usuarioActual();


        if (!usuario) {

            window.location.href =
                Auth.raiz() +
                'login.html';

            return null;
        }


        if (usuario.rol !== 'CLIENTE') {

            window.location.href =
                Auth.raiz() +
                'admin/dashboard.html';

            return null;
        }


        Auth.verificarRolEnServidor('CLIENTE');

        return usuario;
    }
};