// Pruebas de js/archivos.js y de las reglas de contraseña. Ejecutar: npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

function cargar(ruta, nombre) {
    const ctx = vm.createContext({ console });
    vm.runInContext(fs.readFileSync(ruta, 'utf8') + `\nthis.__x = ${nombre};`, ctx);
    return ctx.__x;
}

const Archivos = cargar('js/archivos.js', 'Archivos');

const archivo = (bytes, type, size) => ({
    type,
    size: size ?? bytes.length,
    slice: () => ({ arrayBuffer: async () => Uint8Array.from(bytes).buffer })
});

test('acepta JPG, PNG y WebP reales', async () => {
    assert.ok((await Archivos.validarImagen(archivo([0xFF, 0xD8, 0xFF, 0xE0], 'image/jpeg'))).ok);
    assert.ok((await Archivos.validarImagen(archivo([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A], 'image/png'))).ok);
    assert.ok((await Archivos.validarImagen(archivo([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50], 'image/webp'))).ok);
});

test('rechaza SVG y tipos no permitidos', async () => {
    assert.equal((await Archivos.validarImagen(archivo([0x3C,0x73,0x76,0x67], 'image/svg+xml'))).ok, false);
    assert.equal((await Archivos.validarImagen(archivo([0x3C,0x68,0x74,0x6D], 'text/html'))).ok, false);
});

test('rechaza archivo renombrado (tipo declarado distinto del contenido)', async () => {
    assert.equal((await Archivos.validarImagen(archivo([0x3C,0x73,0x76,0x67,0x20], 'image/jpeg'))).ok, false);
});

test('rechaza archivos vacíos o mayores de 5 MB', async () => {
    assert.equal((await Archivos.validarImagen(archivo([], 'image/png'))).ok, false);
    assert.equal((await Archivos.validarImagen(archivo([0xFF,0xD8,0xFF], 'image/jpeg', 6 * 1024 * 1024))).ok, false);
});

test('extensión derivada del contenido', async () => {
    const r = await Archivos.validarImagen(archivo([0xFF, 0xD8, 0xFF], 'image/jpeg'));
    assert.equal(r.extension, 'jpg');
});
