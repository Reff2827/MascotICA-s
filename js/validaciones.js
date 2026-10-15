/* Validaciones de formularios compartidas (login, mascotas, productos,
   evaluación de adopción, pago, mascotas perdidas).

   Se cargan sin depender de Supabase ni de ui.js, para poder usarse
   también en login.html. */
const Validar = {

    /* ---------- Expresiones ---------- */

    LETRAS: 'A-Za-zÁÉÍÓÚÜáéíóúüÑñ',

    _completa(etiqueta) {
        return `Completa ${etiqueta.charAt(0).toLowerCase()}${etiqueta.slice(1)}.`;
    },

    /* ---------- Reglas (devuelven un mensaje o null si es válido) ---------- */

    correo(valor) {

        const v = (valor || '').trim();

        if (v === '') {
            return 'Ingresa tu correo electrónico.';
        }

        if (!v.includes('@')) {
            return "El correo debe incluir el símbolo '@'.";
        }

        // algo@dominio.ext (sin espacios, un solo @, dominio con punto)
        if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v) || v.length > 254) {
            return 'Por favor ingresa un correo electrónico válido.';
        }

        return null;
    },

    /* Nombres de personas, mascotas o razas: solo letras, espacios,
       apóstrofe y guion. */
    textoLetras(valor, etiqueta, min = 2, max = 60) {

        const v = (valor || '').trim().replace(/\s+/g, ' ');

        if (v === '') {
            return Validar._completa(etiqueta);
        }

        const patron = new RegExp(
            `^[${Validar.LETRAS}]+(?:[ '\\-][${Validar.LETRAS}]+)*$`
        );

        if (!patron.test(v)) {
            return `${etiqueta} solo puede contener letras (sin números ni símbolos).`;
        }

        if (v.length < min) {
            return `${etiqueta} debe tener al menos ${min} letras.`;
        }

        if (v.length > max) {
            return `${etiqueta} no puede superar los ${max} caracteres.`;
        }

        return null;
    },

    /* Entero dentro de un rango; el texto debe ser solo dígitos */
    entero(valor, etiqueta, min, max) {

        const v = String(valor ?? '').trim();

        if (v === '') {
            return Validar._completa(etiqueta);
        }

        if (!/^\d+$/.test(v)) {
            return `${etiqueta} debe ser un número entero.`;
        }

        const n = Number(v);

        if (n < min || n > max) {
            return `${etiqueta} debe estar entre ${min} y ${max}.`;
        }

        return null;
    },

    /* ---------- Mensaje debajo del campo ---------- */

    error(input, mensaje) {

        const el = typeof input === 'string'
            ? document.getElementById(input)
            : input;

        if (!el) return;

        // Si está dentro de un input-group, el aviso va después del grupo
        const ancla = el.closest('.input-group') || el;

        let aviso = ancla.parentElement.querySelector(
            `:scope > .invalid-feedback[data-para="${el.id}"]`
        );

        if (!mensaje) {
            el.classList.remove('is-invalid');
            el.removeAttribute('aria-invalid');
            if (aviso) aviso.style.display = 'none';
            return;
        }

        if (!aviso) {
            aviso = document.createElement('div');
            aviso.className = 'invalid-feedback';
            aviso.dataset.para = el.id;
            aviso.setAttribute('role', 'alert');
            ancla.insertAdjacentElement('afterend', aviso);
        }

        aviso.textContent = mensaje;
        aviso.style.display = 'block';
        el.classList.add('is-invalid');
        el.setAttribute('aria-invalid', 'true');
    },

    /* Quita el aviso en cuanto el usuario vuelve a escribir */
    limpiarAlEscribir(input) {

        const el = typeof input === 'string'
            ? document.getElementById(input)
            : input;

        if (!el) return;

        el.addEventListener('input', () => Validar.error(el, null));
        el.addEventListener('change', () => Validar.error(el, null));
    },

    /* ---------- Restricción de caracteres (teclado, pegar, arrastrar) ---------- */

    _restringir(input, permitido, limpiar) {

        const el = typeof input === 'string'
            ? document.getElementById(input)
            : input;

        if (!el) return;

        // Teclado: bloquea el carácter antes de que aparezca
        el.addEventListener('keydown', e => {

            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length !== 1) return;          // Backspace, flechas, Tab...

            if (!permitido.test(e.key)) {
                e.preventDefault();
            }
        });

        // Pegar: se limpia el texto ANTES de insertarlo (sin parpadeo)
        el.addEventListener('paste', e => {

            e.preventDefault();

            const texto = limpiar(
                (e.clipboardData || window.clipboardData).getData('text')
            );

            if (!texto) return;

            const max = el.maxLength > 0 ? el.maxLength : Infinity;

            let ini = el.selectionStart;
            let fin = el.selectionEnd;

            if (ini == null) {          // input type="number"
                ini = fin = el.value.length;
            }

            const nuevo = (
                el.value.slice(0, ini) + texto + el.value.slice(fin)
            ).slice(0, max);

            el.value = nuevo;

            try {
                const pos = Math.min(ini + texto.length, nuevo.length);
                el.setSelectionRange(pos, pos);
            } catch (err) { /* type="number" no admite selección */ }

            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Red de seguridad: arrastrar texto, autocompletado, teclados móviles
        el.addEventListener('input', () => {

            const limpio = limpiar(el.value);

            if (limpio !== el.value) {
                el.value = limpio;
            }
        });
    },

    soloDigitos(input) {
        Validar._restringir(
            input,
            /^\d$/,
            t => t.replace(/\D/g, '')
        );
    },

    soloLetras(input) {
        const fuera = new RegExp(`[^${Validar.LETRAS} '\\-]`, 'g');
        Validar._restringir(
            input,
            new RegExp(`^[${Validar.LETRAS} '\\-]$`),
            t => t.replace(fuera, '')
        );
    }
};
