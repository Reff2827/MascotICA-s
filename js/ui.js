const UI = {
    navbarAdmin(usuario) {
        const raiz = Auth.raiz();
        document.getElementById('navbar').innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark app-navbar mb-4">
          <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="dashboard.html">
              <i class="bi bi-shop"></i> MascotICA's <span class="text-warning">Admin</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navAdmin">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navAdmin">
              <ul class="navbar-nav me-auto">
                <li class="nav-item"><a class="nav-link" href="dashboard.html"><i class="bi bi-speedometer2"></i> Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="mascotas.html"><i class="bi bi-heart"></i> Mascotas</a></li>
                <li class="nav-item"><a class="nav-link" href="productos.html"><i class="bi bi-box-seam"></i> Productos</a></li>
                <li class="nav-item"><a class="nav-link" href="solicitudes.html"><i class="bi bi-inbox"></i> Solicitudes</a></li>
              </ul>
              <ul class="navbar-nav">
                <li class="nav-item"><span class="navbar-text text-light me-3"><i class="bi bi-person-circle"></i> ${usuario.nombre}</span></li>
                <li class="nav-item"><button id="btnLogout" class="btn btn-outline-light btn-sm"><i class="bi bi-box-arrow-right"></i> Salir</button></li>
              </ul>
            </div>
          </div>
        </nav>`;
        document.getElementById('btnLogout').addEventListener('click', () => UI.logout());
    },

    navbarCliente(usuario) {
        document.getElementById('navbar').innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark app-navbar mb-4">
          <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="index.html"><i class="bi bi-shop"></i> MascotICA's</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCliente">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navCliente">
              <ul class="navbar-nav me-auto">
                <li class="nav-item"><a class="nav-link" href="index.html"><i class="bi bi-grid"></i> Catalogo</a></li>
                <li class="nav-item"><a class="nav-link" href="mis-solicitudes.html"><i class="bi bi-list-check"></i> Mis solicitudes</a></li>
              </ul>
              <ul class="navbar-nav">
                <li class="nav-item"><span class="navbar-text text-light me-3"><i class="bi bi-person-circle"></i> ${usuario.nombre}</span></li>
                <li class="nav-item"><button id="btnLogout" class="btn btn-outline-light btn-sm"><i class="bi bi-box-arrow-right"></i> Salir</button></li>
              </ul>
            </div>
          </div>
        </nav>`;
        document.getElementById('btnLogout').addEventListener('click', () => UI.logout());
    },

    async logout() {
        await Auth.logout();
        window.location.href = Auth.raiz() + 'login.html';
    },

    setFlash(tipo, mensaje) {
        sessionStorage.setItem('ps_flash', JSON.stringify({ tipo, mensaje }));
    },

    mostrarFlash() {
        const raw = sessionStorage.getItem('ps_flash');
        const cont = document.getElementById('alertas');
        if (!cont) return;
        if (!raw) { cont.innerHTML = ''; return; }
        sessionStorage.removeItem('ps_flash');
        const { tipo, mensaje } = JSON.parse(raw);
        const clase = tipo === 'error' ? 'alert-danger' : 'alert-success';
        const icono = tipo === 'error' ? 'bi-exclamation-triangle' : 'bi-check-circle';
        cont.innerHTML = `
        <div class="container-fluid px-4">
          <div class="alert ${clase} alert-dismissible fade show" role="alert">
            <i class="bi ${icono}"></i> ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          </div>
        </div>`;
    },

    esc(texto) {
        const div = document.createElement('div');
        div.textContent = texto ?? '';
        return div.innerHTML;
    },

    formatoFecha(isoString) {
        const d = new Date(isoString);
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },

    imagenOPlaceholder(url, texto) {
        return (url && url.trim() !== '') ? url : `https://placehold.co/300x200?text=${encodeURIComponent(texto)}`;
    }
};