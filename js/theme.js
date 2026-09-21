/* Tema claro / oscuro.
   Se carga en el <head> para aplicar la preferencia antes del primer pintado
   y evitar el destello de color equivocado. */
const Tema = (function () {
    const CLAVE = 'mascotica_tema';
    const raiz = document.documentElement;

    function guardado() {
        try {
            return localStorage.getItem(CLAVE);
        } catch (e) {
            return null;
        }
    }

    function aplicar(valor) {
        if (valor === 'dark' || valor === 'light') {
            raiz.setAttribute('data-theme', valor);
        } else {
            raiz.removeAttribute('data-theme');
        }
    }

    /* Lo que se ve ahora mismo, tenga o no preferencia guardada */
    function efectivo() {
        const elegido = guardado();
        if (elegido) return elegido;
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    function alternar() {
        const siguiente = efectivo() === 'dark' ? 'light' : 'dark';
        try {
            localStorage.setItem(CLAVE, siguiente);
        } catch (e) { /* modo privado: el cambio dura la sesión */ }
        aplicar(siguiente);
        return siguiente;
    }

    aplicar(guardado());

    return { efectivo, alternar };
})();
