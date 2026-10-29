/* Validación de archivos de imagen (auditoría H-07).

   Comprueba en el navegador, antes de subir a Supabase Storage:
   - tipo permitido (JPG, PNG o WebP; se rechaza SVG y cualquier otro formato),
   - tamaño máximo (5 MB) y que no esté vacío,
   - que la FIRMA real del archivo (bytes iniciales) coincida con un formato permitido,
     para que un archivo renombrado (p. ej. un .svg o .html llamado foto.jpg) no pase,
   - extensión y Content-Type derivados del contenido, nunca del nombre original.

   Esta validación mejora la experiencia, pero la barrera real debe estar también en el
   bucket de Supabase (file_size_limit y allowed_mime_types); ver supabase/migrations. */
const Archivos = {

    TAMANO_MAX: 5 * 1024 * 1024,

    TIPOS: {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    },

    ACCEPT: 'image/jpeg,image/png,image/webp',

    MENSAJE_FORMATO: 'La imagen debe ser JPG, PNG o WebP y pesar como máximo 5 MB.',

    /* Detecta el formato real leyendo los primeros bytes. */
    async detectarTipo(archivo) {

        const cabecera = new Uint8Array(await archivo.slice(0, 12).arrayBuffer());

        const es = (...bytes) => bytes.every((b, i) => cabecera[i] === b);

        if (es(0xFF, 0xD8, 0xFF)) {
            return 'image/jpeg';
        }

        if (es(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return 'image/png';
        }

        // WebP: "RIFF" .... "WEBP"
        if (
            es(0x52, 0x49, 0x46, 0x46) &&
            cabecera[8] === 0x57 && cabecera[9] === 0x45 &&
            cabecera[10] === 0x42 && cabecera[11] === 0x50
        ) {
            return 'image/webp';
        }

        return null;
    },

    /* Devuelve { ok, error, tipo, extension }. */
    async validarImagen(archivo) {

        if (!archivo) {
            return { ok: false, error: 'Selecciona una imagen.' };
        }

        if (archivo.size === 0) {
            return { ok: false, error: 'El archivo está vacío.' };
        }

        if (archivo.size > this.TAMANO_MAX) {
            return { ok: false, error: 'La imagen no puede superar los 5 MB.' };
        }

        if (!this.TIPOS[archivo.type]) {
            return { ok: false, error: this.MENSAJE_FORMATO };
        }

        let tipoReal = null;

        try {
            tipoReal = await this.detectarTipo(archivo);
        } catch {
            return { ok: false, error: 'No se pudo leer el archivo seleccionado.' };
        }

        if (!tipoReal || !this.TIPOS[tipoReal]) {
            return { ok: false, error: this.MENSAJE_FORMATO };
        }

        return {
            ok: true,
            tipo: tipoReal,
            extension: this.TIPOS[tipoReal]
        };
    }
};
