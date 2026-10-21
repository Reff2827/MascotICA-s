const usuario = Auth.usuarioActual();
if (!usuario) {
    window.location.replace('login.html');
} else if (usuario.rol === 'ADMIN') {
    window.location.replace('admin/dashboard.html');
} else {
    window.location.replace('cliente/index.html');
}
