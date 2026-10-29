import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

// Consulta de DNI / RUC para el checkout (la usa js/cliente/index.js).
//
// Contrato con el navegador:
//   Entrada : { tipoDocumento: "DNI" | "RUC", numeroDocumento: string }
//   Salida  : DNI -> { primerNombre, apellidoPaterno }
//             RUC -> { razonSocial }
//   Errores : 400 documento inválido · 404 sin datos · 429 límite · 502/500 proveedor
//
// Variables de entorno (supabase secrets set ...):
//   INTIFACT_API_URL    URL base del proveedor, p. ej. https://api.proveedor.pe
//   INTIFACT_API_TOKEN  token del proveedor
//   INTIFACT_PATH_DNI   (opcional) ruta de consulta DNI, por defecto /dni
//   INTIFACT_PATH_RUC   (opcional) ruta de consulta RUC, por defecto /ruc
//
// IMPORTANTE: el contrato con el proveedor (rutas y nombres de campos) puede variar.
// Ajusta `normalizar()` si el proveedor devuelve otros nombres de campo.
// Por privacidad (Ley 29733) esta función no registra en logs ningún dato personal.

const LIMITE_POR_MINUTO = 10;
const ventanas = new Map<string, { inicio: number; usos: number }>();

function limitarUso(clave: string): boolean {
    const ahora = Date.now();
    const ventana = ventanas.get(clave);
    if (!ventana || ahora - ventana.inicio > 60_000) {
        ventanas.set(clave, { inicio: ahora, usos: 1 });
        return true;
    }
    ventana.usos += 1;
    return ventana.usos <= LIMITE_POR_MINUTO;
}

function error(mensaje: string, status: number) {
    return Response.json({ error: mensaje }, { status });
}

function texto(valor: unknown): string {
    return typeof valor === "string" ? valor.trim() : "";
}

function normalizar(tipo: string, datos: any) {
    const base = datos?.data ?? datos?.result ?? datos ?? {};
    if (tipo === "DNI") {
        const nombres = texto(base.nombres ?? base.first_name ?? base.primerNombre ?? base.nombre);
        return {
            primerNombre: nombres.split(/\s+/)[0] ?? "",
            apellidoPaterno: texto(
                base.apellido_paterno ?? base.apellidoPaterno ?? base.first_last_name ?? base.paterno,
            ),
        };
    }
    return {
        razonSocial: texto(
            base.razon_social ?? base.razonSocial ?? base.nombre_o_razon_social ?? base.nombre,
        ),
    };
}

export default {
    fetch: withSupabase(
        { auth: "user" },
        async (req, _ctx) => {
            try {
                const body = await req.json().catch(() => ({}));
                const tipo = String(body?.tipoDocumento ?? "").toUpperCase();
                const numero = String(body?.numeroDocumento ?? "").trim();

                const valido =
                    (tipo === "DNI" && /^\d{8}$/.test(numero)) ||
                    (tipo === "RUC" && /^\d{11}$/.test(numero));
                if (!valido) {
                    return error("El número o tipo de documento no es válido.", 400);
                }

                // Límite por usuario (el token del JWT identifica al solicitante).
                const claveUso = (req.headers.get("Authorization") ?? "anon").slice(-40);
                if (!limitarUso(claveUso)) {
                    return error("Se alcanzó el límite de consultas.", 429);
                }

                const baseUrl = Deno.env.get("INTIFACT_API_URL")?.replace(/\/+$/, "");
                const token = Deno.env.get("INTIFACT_API_TOKEN");
                if (!baseUrl || !token) {
                    console.error("Falta configurar INTIFACT_API_URL o INTIFACT_API_TOKEN.");
                    return error("El servicio de consulta no está configurado.", 500);
                }

                const ruta = tipo === "DNI"
                    ? (Deno.env.get("INTIFACT_PATH_DNI") ?? "/dni")
                    : (Deno.env.get("INTIFACT_PATH_RUC") ?? "/ruc");

                const respuesta = await fetch(`${baseUrl}${ruta}/${numero}`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    signal: AbortSignal.timeout(8000),
                });

                if (respuesta.status === 404) return error("Sin datos para ese documento.", 404);
                if (respuesta.status === 429) return error("Se alcanzó el límite de consultas.", 429);
                if (!respuesta.ok) {
                    console.error(`El proveedor de documentos respondió HTTP ${respuesta.status}.`);
                    return error("No se pudo consultar el documento.", 502);
                }

                const datos = normalizar(tipo, await respuesta.json());
                const completo = tipo === "DNI"
                    ? datos.primerNombre && datos.apellidoPaterno
                    : (datos as { razonSocial: string }).razonSocial;
                if (!completo) return error("Sin datos para ese documento.", 404);

                return Response.json(datos, { status: 200 });
            } catch (e) {
                console.error("Error en consulta de documento:", e instanceof Error ? e.name : "desconocido");
                return error("No se pudo consultar el documento.", 500);
            }
        },
    ),
};
