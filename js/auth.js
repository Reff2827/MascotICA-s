const SESSION_KEY = 'ps_session';

const Auth = {
    async registrar(nombre, correo, password) {
        const { error } = await db.auth.signUp({
            email: correo,
            password: password,
            options: { data: { nombre: nombre } }
        });
        if (error) return error.message;
        await db.auth.signOut();
        return null;
    },

    async validarPassword(correo, password) {
        const { error } = await db.auth.signInWithPassword({
            email: correo,
            password: password
        });
        if (error) return false;
        await db.auth.signOut();
        return true;
    },

    async enviarPin(correo) {
        const { error } = await db.auth.signInWithOtp({
            email: correo,
            options: { shouldCreateUser: false }
        });
        return error ? error.message : null;
    },

    async verificarPin(correo, codigo) {
        const { data, error } = await db.auth.verifyOtp({
            email: correo,
            token: codigo,
            type: 'email'
        });
        if (error) return { error: error.message };

        const perfil = await db.from('perfiles')
            .select('id, nombre, rol')
            .eq('id', data.user.id)
            .single();

        if (perfil.error) return { error: 'No se pudo cargar el perfil del usuario.' };

        const usuario = {
            idUsuario: perfil.data.id,
            nombre: perfil.data.nombre,
            rol: perfil.data.rol,
            correo: correo
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
        return { usuario: usuario };
    },

    async logout() {
        await db.auth.signOut();
        sessionStorage.removeItem(SESSION_KEY);
    },

    usuarioActual() {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    estaAutenticado() {
        return Auth.usuarioActual() !== null;
    },

    raiz() {
        const path = window.location.pathname;
        return (path.includes('/admin/') || path.includes('/cliente/')) ? '../' : './';
    },

    requireAdmin() {
        const usuario = Auth.usuarioActual();
        if (!usuario) {
            window.location.href = Auth.raiz() + 'login.html';
            return null;
        }
        if (usuario.rol !== 'ADMIN') {
            window.location.href = Auth.raiz() + 'cliente/index.html';
            return null;
        }
        return usuario;
    },

    requireCliente() {
        const usuario = Auth.usuarioActual();
        if (!usuario) {
            window.location.href = Auth.raiz() + 'login.html';
            return null;
        }
        if (usuario.rol !== 'CLIENTE') {
            window.location.href = Auth.raiz() + 'admin/dashboard.html';
            return null;
        }
        return usuario;
    }
};