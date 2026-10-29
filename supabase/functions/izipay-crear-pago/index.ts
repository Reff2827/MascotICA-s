import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";
import {
    aCentimos,
    esIdPedidoValido,
    obtenerItems,
    obtenerPedido,
} from "../_shared/pedidos.ts";

// Seguridad (auditoría H-02/H-03):
//  - El monto NUNCA se toma del navegador: se lee del pedido guardado en la base de datos.
//  - Se verifica que el pedido pertenezca al usuario autenticado.
//  - Se verifica que esté pendiente de pago y que no haya vencido.
//  - Se verifica que el total coincida con la suma de los ítems del pedido.
//  - El correo y los datos del comprador salen de la cuenta y del pedido, no del cliente.

const ESTADOS_PAGABLES = ["PENDIENTE_PAGO", "PENDIENTE"];

function respuestaError(mensaje: string, status: number, details?: string) {
    return Response.json(details ? { error: mensaje, details } : { error: mensaje }, { status });
}

async function usuarioDelToken(req: Request) {
    const url = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const autorizacion = req.headers.get("Authorization");
    if (!url || !autorizacion) return null;

    const respuesta = await fetch(`${url}/auth/v1/user`, {
        headers: {
            Authorization: autorizacion,
            apikey: anon ?? autorizacion.replace(/^Bearer\s+/i, ""),
        },
    });
    if (!respuesta.ok) return null;
    const usuario = await respuesta.json();
    return usuario?.id ? usuario as { id: string; email?: string } : null;
}

export default {
    fetch: withSupabase(
        { auth: "user" },
        async (req, _ctx) => {
            try {
                const body = await req.json().catch(() => ({}));

                if (!esIdPedidoValido(body?.orderId)) {
                    return respuestaError("El número de pedido no es válido.", 400);
                }
                const idPedido = Number(body.orderId);

                const usuario = await usuarioDelToken(req);
                if (!usuario) {
                    return respuestaError("Sesión no válida.", 401);
                }
                if (!usuario.email) {
                    return respuestaError("Tu cuenta no tiene un correo electrónico asociado.", 400);
                }

                const pedido = await obtenerPedido(idPedido);
                // Misma respuesta para "no existe" y "no es tuyo": no se revela qué pedidos existen.
                if (!pedido || pedido.id_usuario !== usuario.id) {
                    return respuestaError("Pedido no encontrado.", 404);
                }
                if (!ESTADOS_PAGABLES.includes(String(pedido.estado).toUpperCase())) {
                    return respuestaError("Este pedido ya no admite pago.", 409);
                }
                if (pedido.vence_en && new Date(pedido.vence_en).getTime() <= Date.now()) {
                    return respuestaError("El pedido venció. Genera uno nuevo.", 409);
                }

                const totalCentimos = aCentimos(pedido.total);
                if (!Number.isFinite(totalCentimos) || totalCentimos <= 0) {
                    return respuestaError("El monto del pedido no es válido.", 409);
                }

                const items = await obtenerItems(idPedido);
                const sumaItems = items.reduce((acc, item) => acc + aCentimos(item.subtotal), 0);
                if (items.length === 0 || sumaItems !== totalCentimos) {
                    console.error(`Pedido ${idPedido}: el total no coincide con sus ítems.`);
                    return respuestaError("El pedido es inconsistente. Genera uno nuevo.", 409);
                }

                const username = Deno.env.get("IZIPAY_USERNAME");
                const password = Deno.env.get("IZIPAY_PASSWORD_TEST");
                const publicKey = Deno.env.get("IZIPAY_PUBLIC_KEY_TEST");
                const apiUrl = Deno.env.get("IZIPAY_API_URL");

                if (!username || !password || !publicKey || !apiUrl) {
                    console.error("Faltan credenciales de Izipay.");
                    return respuestaError("La configuración de Izipay no está completa.", 500);
                }

                let url = apiUrl.trim();
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    url = "https://" + url;
                }
                url = url.replace(/\/+$/, "");
                if (!url.endsWith("/api-payment/V4/Charge/CreatePayment")) {
                    url += "/api-payment/V4/Charge/CreatePayment";
                }

                const documento = String(pedido.tipo_documento ?? "");
                const paymentData = {
                    amount: totalCentimos,
                    currency: "PEN",
                    orderId: String(idPedido),
                    customer: {
                        email: usuario.email,
                        billingDetails: {
                            firstName: String(pedido.nombre_comprador ?? "").slice(0, 60),
                            identityType: documento,
                            identityCode: String(pedido.numero_documento ?? ""),
                            country: "PE",
                        },
                    },
                };

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
                    },
                    body: JSON.stringify(paymentData),
                });

                const texto = await response.text();
                let result: any = null;
                try {
                    result = texto ? JSON.parse(texto) : null;
                } catch {
                    console.error(`Izipay devolvió una respuesta que no es JSON (HTTP ${response.status}).`);
                }

                if (!response.ok || result?.status !== "SUCCESS" || !result?.answer?.formToken) {
                    // Solo se registra el código de error, nunca datos del cliente.
                    console.error(
                        `Izipay rechazó la creación del pago del pedido ${idPedido}: ${result?.answer?.errorCode ?? response.status}`,
                    );
                    return respuestaError(
                        "No se pudo crear el pago en Izipay.",
                        502,
                        result?.answer?.errorMessage || "Izipay no devolvió un formToken válido.",
                    );
                }

                return Response.json(
                    {
                        formToken: result.answer.formToken,
                        publicKey,
                        orderId: String(idPedido),
                        amount: pedido.total,
                    },
                    { status: 200 },
                );
            } catch (error) {
                console.error("Error al crear el pago:", error instanceof Error ? error.message : "desconocido");
                return respuestaError("Ocurrió un error al crear el pago.", 500);
            }
        },
    ),
};
