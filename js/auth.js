const SESSION_KEY = 'ps_session';

const Auth = {
    login(correo, password) {
        const usuario = Usuarios.buscarPorCorreo(correo);
        if (!usuario || usuario.password !== password) {
            return null;
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
        return usuario;
    },

    logout() {
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
