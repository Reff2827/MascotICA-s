/* Casillas animadas para el código de verificación.
   - Reposo: las casillas giran en órbita alrededor de un punto central.
   - Al enfocar o escribir: giran y se acomodan en una fila (colapso).
   - Cada dígito hace un "pop"; error = sacudida; éxito = destello verde.
   Funciona con teclado, pegado (Ctrl+V) y autocompletado del correo/SMS. */
const OtpAnim = (function () {

    let caja, pista, slots = [], largo = 8;
    let estado = 'orbita';            // 'orbita' | 'fila' | 'moviendo'
    let angulo = 0;                   // giro actual del anillo (rad)
    let raf = 0, ultimo = 0;
    let tam = 40, paso = 44, radio = 58;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');

    const ease = t => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function medir() {
        const w = caja.clientWidth || 280;
        paso = Math.min(46, (w - 4) / largo);
        tam = Math.max(26, Math.min(40, paso - 5));
        radio = Math.min(60, Math.max(40, tam * 1.5 + 6));
        caja.style.setProperty('--otp-size', tam + 'px');
    }

    function posFila(i) {
        return { x: (i - (largo - 1) / 2) * paso, y: 0 };
    }

    function posOrbita(i, a) {
        const t = a + (i / largo) * Math.PI * 2 - Math.PI / 2;
        return { x: Math.cos(t) * radio, y: Math.sin(t) * radio };
    }

    function poner(i, x, y, tilt) {
        slots[i].style.transform =
            `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${(tilt || 0).toFixed(2)}deg)`;
    }

    function dibujarOrbita() {
        for (let i = 0; i < largo; i++) {
            const p = posOrbita(i, angulo);
            // Cada casilla se inclina como si rodara sobre el anillo
            poner(i, p.x, p.y, (angulo * 180 / Math.PI) + (i / largo) * 360);
        }
    }

    function dibujarFila() {
        for (let i = 0; i < largo; i++) {
            const p = posFila(i);
            poner(i, p.x, p.y, 0);
        }
    }

    function girar(ts) {
        if (estado !== 'orbita') return;
        const dt = ultimo ? Math.min(50, ts - ultimo) : 16;
        ultimo = ts;
        angulo += dt * 0.00035;
        dibujarOrbita();
        raf = requestAnimationFrame(girar);
    }

    function iniciarOrbita() {
        cancelAnimationFrame(raf);
        if (reducir.matches) { colocarFila(); return; }
        estado = 'orbita';
        caja.dataset.estado = 'orbita';
        ultimo = 0;
        raf = requestAnimationFrame(girar);
    }

    function colocarFila() {
        cancelAnimationFrame(raf);
        estado = 'fila';
        caja.dataset.estado = 'fila';
        dibujarFila();
    }

    /* Transición órbita -> fila (o al revés) con un giro de remolino */
    function mover(haciaFila) {
        if (estado === 'moviendo') return;
        if (reducir.matches) { haciaFila ? colocarFila() : iniciarOrbita(); return; }

        cancelAnimationFrame(raf);
        const desde = estado;
        estado = 'moviendo';
        caja.dataset.estado = 'moviendo';

        const dur = 800;
        const t0 = performance.now();
        const a0 = angulo;

        function paso_(ts) {
            const k = Math.min(1, (ts - t0) / dur);
            const e = ease(k);
            const q = haciaFila ? e : 1 - e;      // 0 = órbita, 1 = fila
            const remolino = (1 - q) * Math.PI;   // giro extra alrededor del centro
            const c = Math.cos(remolino), s = Math.sin(remolino);

            for (let i = 0; i < largo; i++) {
                const o = posOrbita(i, a0);
                const f = posFila(i);
                const x = o.x + (f.x - o.x) * q;
                const y = o.y + (f.y - o.y) * q;
                const tilt0 = (a0 * 180 / Math.PI) + (i / largo) * 360;
                poner(i, x * c - y * s, x * s + y * c, tilt0 * (1 - q));
            }

            if (k < 1) {
                raf = requestAnimationFrame(paso_);
            } else if (haciaFila) {
                colocarFila();
            } else {
                iniciarOrbita();
            }
        }
        raf = requestAnimationFrame(paso_);
    }

    function colapsar() {
        if (estado === 'orbita') mover(true);
    }

    function vacio() {
        return slots.every(s => !s.value);
    }

    /* ---------- Entrada de datos ---------- */

    function pop(el) {
        el.classList.remove('otp-pop');
        void el.offsetWidth;
        el.classList.add('otp-pop');
    }

    function marcar(i) {
        slots[i].classList.toggle('otp-lleno', !!slots[i].value);
    }

    function repartir(desdeIdx, texto) {
        const d = (texto || '').replace(/\D/g, '');
        if (!d) return;
        let j = desdeIdx;
        for (const ch of d) {
            if (j >= largo) break;
            slots[j].value = ch;
            marcar(j);
            pop(slots[j]);
            j++;
        }
        slots[Math.min(j, largo - 1)].focus();
    }

    function enlazar(el, i) {

        el.addEventListener('focus', () => {
            colapsar();
            el.select();
        });

        el.addEventListener('input', () => {
            const v = el.value.replace(/\D/g, '');
            // Autocompletado / pegado de todo el código en una casilla
            if (v.length > 1) {
                el.value = '';
                repartir(i, v);
                return;
            }
            el.value = v;
            marcar(i);
            if (v) {
                pop(el);
                if (i < largo - 1) slots[i + 1].focus();
            }
        });

        el.addEventListener('keydown', e => {
            if (e.key === 'Backspace' && !el.value && i > 0) {
                e.preventDefault();
                slots[i - 1].value = '';
                marcar(i - 1);
                slots[i - 1].focus();
            } else if (e.key === 'ArrowLeft' && i > 0) {
                e.preventDefault();
                slots[i - 1].focus();
            } else if (e.key === 'ArrowRight' && i < largo - 1) {
                e.preventDefault();
                slots[i + 1].focus();
            }
        });

        el.addEventListener('paste', e => {
            e.preventDefault();
            const t = (e.clipboardData || window.clipboardData).getData('text');
            repartir(i, t);
        });

        el.addEventListener('blur', () => {
            // Si se sale sin escribir nada, vuelve a orbitar
            setTimeout(() => {
                if (!caja.contains(document.activeElement) && vacio() && estado === 'fila') {
                    mover(false);
                }
            }, 120);
        });
    }

    /* ---------- API pública ---------- */

    function iniciar() {
        caja = document.getElementById('otpCaja');
        if (!caja) return;
        pista = caja.querySelector('.otp-pista');
        slots = Array.from(caja.querySelectorAll('.otp-slot'));
        largo = slots.length;

        slots.forEach((el, i) => {
            el.setAttribute('aria-label', `Dígito ${i + 1} de ${largo}`);
            enlazar(el, i);
        });

        medir();
        window.addEventListener('resize', () => {
            medir();
            if (estado === 'fila') dibujarFila();
            else if (estado === 'orbita') dibujarOrbita();
        });

        // Clic en el espacio vacío: enfoca la primera casilla libre
        caja.addEventListener('click', e => {
            if (e.target.classList.contains('otp-slot')) return;
            const libre = slots.find(s => !s.value) || slots[largo - 1];
            libre.focus();
        });

        dibujarOrbita();
    }

    /* Llamar cuando el panel pasa a ser visible (hace falta el ancho real) */
    function mostrar() {
        if (!caja) return;
        reiniciar();
        medir();
        iniciarOrbita();
        setTimeout(() => {
            // Con el teclado del móvil, enfocar colapsa de inmediato
            slots[0].focus({ preventScroll: true });
        }, 650);
    }

    function reiniciar() {
        if (!caja) return;
        slots.forEach((s, i) => {
            s.value = '';
            marcar(i);
            s.classList.remove('otp-pop');
        });
        caja.classList.remove('otp-error', 'otp-ok');
        cancelAnimationFrame(raf);
        estado = 'orbita';
        caja.dataset.estado = 'orbita';
    }

    function valor() {
        return slots.map(s => s.value).join('');
    }

    function error() {
        if (!caja) return;
        caja.classList.remove('otp-error');
        void caja.offsetWidth;
        caja.classList.add('otp-error');
        setTimeout(() => {
            slots.forEach((s, i) => { s.value = ''; marcar(i); });
            caja.classList.remove('otp-error');
            slots[0].focus();
        }, 520);
    }

    function ok() {
        if (!caja) return;
        caja.classList.add('otp-ok');
    }

    function bloquear(v) {
        slots.forEach(s => { s.disabled = v; });
    }

    document.addEventListener('DOMContentLoaded', iniciar);

    return { mostrar, reiniciar, valor, error, ok, bloquear };
})();
