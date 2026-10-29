import "@supabase/functions-js/edge-runtime.d.ts";
import {
    aCentimos,
    esIdPedidoValido,
    igualesSeguro,
    obtenerPedido,
} from "../_shared/pedidos.ts";

// Webhook (IPN) de Izipay.
// Seguridad (auditoría H-02/H-03): además de la firma HMAC se valida que el monto y la
// moneda notificados coincidan con el pedido guardado, y que la operación sea idempotente.

async function leerRespuesta(response: Response) {
    const texto = await response.text();
    if (!texto.trim()) return null;
    try {
        return JSON.parse(texto);
    } catch {
        return { respuesta: texto };
    }
}

async function calcularHash(krAnswer: string, password: string) {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const firma = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(krAnswer));
    return Array.from(new Uint8Array(firma))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

async function llamarRpc(
    supabaseUrl: string,
    serviceRoleKey: string,
    nombre: string,
    parametros: Record<string, unknown>,
) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${nombre}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(parametros),
    });
    return { ok: response.ok, status: response.status, data: await leerRespuesta(response) };
}

export default {
    async fetch(req: Request) {
        try {
            if (req.method !== "POST") {
                return new Response("Method Not Allowed", { status: 405 });
            }

            const form = await req.formData();
            const krAnswer = form.get("kr-answer");
            const krHash = form.get("kr-hash");

            if (typeof krAnswer !== "string" || typeof krHash !== "string") {
                console.error("Izipay no envió kr-answer o kr-hash.");
                return new Response("Invalid notification", { status: 400 });
            }

            const password = Deno.env.get("IZIPAY_PASSWORD_TEST");
            if (!password) {
                console.error("Falta IZIPAY_PASSWORD_TEST.");
                return new Response("Server configuration error", { status: 500 });
            }

            const hashCalculado = await calcularHash(krAnswer, password);
            if (!igualesSeguro(hashCalculado, krHash.toLowerCase())) {
                console.error("Firma de Izipay no válida.");
                return new Response("Invalid signature", { status: 401 });
            }

            let answer: any;
            try {
                answer = JSON.parse(krAnswer);
            } catch {
                console.error("No se pudo interpretar kr-answer.");
                return new Response("Invalid kr-answer", { status: 400 });
            }

            const orderStatus = answer?.orderStatus;
            const orderId = answer?.orderDetails?.orderId;
            const transactionUuid = answer?.transactions?.[0]?.uuid || "";

            if (!esIdPedidoValido(orderId)) {
                console.error("Izipay no devolvió un orderId válido.");
                return new Response("Missing orderId", { status: 400 });
            }
            const idPedido = Number(orderId);

            const supabaseUrl = Deno.env.get("SUPABASE_URL");
            const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
            if (!supabaseUrl || !serviceRoleKey) {
                console.error("Faltan variables de Supabase.");
                return new Response("Server configuration error", { status: 500 });
            }

            const pedido = await obtenerPedido(idPedido);
            if (!pedido) {
                console.error(`Izipay notificó un pedido inexistente: ${idPedido}.`);
                return new Response("Unknown order", { status: 404 });
            }

            const estadoActual = String(pedido.estado).toUpperCase();

            if (orderStatus === "PAID") {
                // Validación de monto y moneda contra el pedido (H-02/H-03).
                const montoNotificado = Number(answer?.orderDetails?.orderTotalAmount);
                const moneda = String(answer?.orderDetails?.orderCurrency ?? "");
                if (
                    !Number.isFinite(montoNotificado) ||
                    montoNotificado !== aCentimos(pedido.total) ||
                    moneda !== "PEN"
                ) {
                    console.error(
                        `Pedido ${idPedido}: el monto o la moneda notificados no coinciden con el pedido.`,
                    );
                    return new Response("Amount mismatch", { status: 400 });
                }

                // Idempotencia: Izipay puede reenviar la notificación.
                if (estadoActual === "PAGADO" || estadoActual === "ENTREGADO") {
                    return new Response("OK! Order Status: PAID", { status: 200 });
                }

                const rpc = await llamarRpc(supabaseUrl, serviceRoleKey, "confirmar_pago_pedido", {
                    p_id_pedido: idPedido,
                    p_referencia: transactionUuid || null,
                });
                if (!rpc.ok) {
                    console.error(`Error al confirmar el pedido ${idPedido} (HTTP ${rpc.status}).`);
                    return new Response("Error confirming payment", { status: 500 });
                }
                console.log(`Pedido ${idPedido} confirmado como PAGADO.`);
            } else {
                // Un pedido ya pagado no se degrada por una notificación tardía de otro intento.
                if (estadoActual === "PAGADO" || estadoActual === "ENTREGADO") {
                    return new Response(`OK! Order Status: ${orderStatus}`, { status: 200 });
                }

                const motivo =
                    answer?.transactions?.[0]?.errorMessage ||
                    answer?.transactions?.[0]?.detailedErrorMessage ||
                    answer?.answer?.errorMessage ||
                    `Pago no aprobado: ${orderStatus || "UNKNOWN"}`;

                const rpc = await llamarRpc(supabaseUrl, serviceRoleKey, "rechazar_pago_pedido", {
                    p_id_pedido: idPedido,
                    p_motivo: String(motivo).slice(0, 300),
                    p_referencia: transactionUuid || null,
                });
                if (!rpc.ok) {
                    console.error(`Error al rechazar el pedido ${idPedido} (HTTP ${rpc.status}).`);
                    return new Response("Error rejecting payment", { status: 500 });
                }
                console.log(`Pedido ${idPedido} marcado como RECHAZADO.`);
            }

            return new Response(`OK! Order Status: ${orderStatus}`, { status: 200 });
        } catch (error) {
            console.error(
                "Error procesando resultado de Izipay:",
                error instanceof Error ? error.message : "desconocido",
            );
            return new Response("Internal Server Error", { status: 500 });
        }
    },
};
