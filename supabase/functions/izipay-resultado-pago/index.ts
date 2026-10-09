import "@supabase/functions-js/edge-runtime.d.ts";

console.log("Izipay result function started");

async function leerRespuesta(response: Response) {
    const texto = await response.text();

    if (!texto.trim()) {
        return null;
    }

    try {
        return JSON.parse(texto);
    } catch {
        return { respuesta: texto };
    }
}

async function validarHash(
    krAnswer: string,
    krHash: string,
    password: string
) {
    const encoder = new TextEncoder();

    const keyData = encoder.encode(password);
    const messageData = encoder.encode(krAnswer);

    const cryptoKey =
        await crypto.subtle.importKey(
            "raw",
            keyData,
            {
                name: "HMAC",
                hash: "SHA-256"
            },
            false,
            ["sign"]
        );

    const signature =
        await crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            messageData
        );

    const bytes =
        new Uint8Array(signature);

    const calculatedHash =
        Array.from(bytes)
            .map(
                (byte) =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");

    return calculatedHash === krHash;
}

export default {
    async fetch(req: Request) {

        try {

            if (req.method !== "POST") {

                return new Response(
                    "Method Not Allowed",
                    {
                        status: 405
                    }
                );

            }

            const form =
                await req.formData();

            const krAnswer =
                form.get("kr-answer");

            const krHash =
                form.get("kr-hash");

            if (
                typeof krAnswer !== "string" ||
                typeof krHash !== "string"
            ) {

                console.error(
                    "Izipay no envió kr-answer o kr-hash."
                );

                return new Response(
                    "Invalid notification",
                    {
                        status: 400
                    }
                );

            }

            const password =
                Deno.env.get(
                    "IZIPAY_PASSWORD_TEST"
                );

            if (!password) {

                console.error(
                    "Falta IZIPAY_PASSWORD_TEST."
                );

                return new Response(
                    "Server configuration error",
                    {
                        status: 500
                    }
                );

            }

            const hashValido =
                await validarHash(
                    krAnswer,
                    krHash,
                    password
                );

            if (!hashValido) {

                console.error(
                    "Firma de Izipay no válida."
                );

                return new Response(
                    "Invalid signature",
                    {
                        status: 401
                    }
                );

            }

            let answer;

            try {

                answer =
                    JSON.parse(
                        krAnswer
                    );

            } catch (error) {

                console.error(
                    "No se pudo interpretar kr-answer:",
                    error
                );

                return new Response(
                    "Invalid kr-answer",
                    {
                        status: 400
                    }
                );

            }

            const orderStatus =
                answer?.orderStatus;

            const orderId =
                answer?.orderDetails?.orderId;

            const transactionUuid =
                answer?.transactions?.[0]?.uuid || "";

            if (!orderId) {

                console.error(
                    "Izipay no devolvió orderId."
                );

                return new Response(
                    "Missing orderId",
                    {
                        status: 400
                    }
                );

            }
            console.log(
              "Resultado Izipay:",
              JSON.stringify({
                orderId,
                orderStatus,
                transactionUuid,
                errorCode: answer?.transactions?.[0]?.errorCode,
                errorMessage: answer?.transactions?.[0]?.errorMessage,
                detailedErrorMessage:
                answer?.transactions?.[0]?.detailedErrorMessage,
                answerErrorMessage: answer?.answer?.errorMessage
              })
            );

            const supabaseUrl =
                Deno.env.get(
                    "SUPABASE_URL"
                );

            const serviceRoleKey =
                Deno.env.get(
                    "SUPABASE_SERVICE_ROLE_KEY"
                );

            if (
                !supabaseUrl ||
                !serviceRoleKey
            ) {

                console.error(
                    "Faltan variables de Supabase."
                );

                return new Response(
                    "Server configuration error",
                    {
                        status: 500
                    }
                );

            }

            let resultado;

            if (
                orderStatus === "PAID"
            ) {

                const response =
                    await fetch(
                        `${supabaseUrl}/rest/v1/rpc/confirmar_pago_pedido`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    serviceRoleKey,

                                "Authorization":
                                    `Bearer ${serviceRoleKey}`
                            },

                            body:
                                JSON.stringify({
                                    p_id_pedido:
                                        Number(orderId),

                                    p_referencia:
                                        transactionUuid ||
                                        null
                                })
                        }
                    );

                const data = await leerRespuesta(response);

                if (!response.ok) {

                    console.error(
                        "Error al confirmar el pedido:",
                        JSON.stringify(data)
                    );

                    return new Response(
                        "Error confirming payment",
                        {
                            status: 500
                        }
                    );

                }

                resultado = data;

                console.log(
                    `Pedido ${orderId} confirmado como PAGADO.`
                );

            } else {

                const motivo =
                    answer?.transactions?.[0]
                        ?.errorMessage ||
                    answer?.transactions?.[0]
                        ?.detailedErrorMessage ||
                    answer?.answer?.errorMessage ||
                    `Pago no aprobado: ${orderStatus || "UNKNOWN"}`;

                const response =
                    await fetch(
                        `${supabaseUrl}/rest/v1/rpc/rechazar_pago_pedido`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    serviceRoleKey,

                                "Authorization":
                                    `Bearer ${serviceRoleKey}`
                            },

                            body:
                                JSON.stringify({
                                    p_id_pedido:
                                        Number(orderId),

                                    p_motivo:
                                        String(motivo),

                                    p_referencia:
                                        transactionUuid ||
                                        null
                                })
                        }
                    );

                const data = await leerRespuesta(response);

                if (!response.ok) {

                    console.error(
                        "Error al rechazar el pedido:",
                        JSON.stringify(data)
                    );

                    return new Response(
                        "Error rejecting payment",
                        {
                            status: 500
                        }
                    );

                }

                resultado = data;

                console.log(
                    `Pedido ${orderId} marcado como RECHAZADO.`
                );

            }

            return new Response(
                `OK! Order Status: ${orderStatus}`,
                {
                    status: 200
                }
            );

        } catch (error) {

            console.error(
                "Error procesando resultado de Izipay:",
                error
            );

            return new Response(
                "Internal Server Error",
                {
                    status: 500
                }
            );

        }

    }
};