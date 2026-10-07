import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

console.log("Izipay payment function started");

export default {

    fetch: withSupabase(

        { auth: "user" },

        async (req, ctx) => {

            try {

                const body =

                    await req.json();

                const {

                    amount,

                    currency = "PEN",

                    orderId,

                    email,

                    firstName = "",

                    lastName = "",

                    phoneNumber = "",

                    identityType = "",

                    identityCode = "",

                    address = "",

                    country = "PE",

                    city = "",

                    state = "",

                    zipCode = ""

                } = body;

                if (

                    amount === undefined ||

                    amount === null ||

                    !Number.isFinite(Number(amount)) ||

                    Number(amount) <= 0

                ) {

                    return Response.json(

                        {

                            error: "El monto del pedido no es válido."

                        },

                        {

                            status: 400

                        }

                    );

                }

                if (!orderId) {

                    return Response.json(

                        {

                            error: "El número de pedido es obligatorio."

                        },

                        {

                            status: 400

                        }

                    );

                }

                if (!email) {

                    return Response.json(

                        {

                            error: "El correo electrónico es obligatorio."

                        },

                        {

                            status: 400

                        }

                    );

                }

                const username =

                    Deno.env.get("IZIPAY_USERNAME");

                const password =

                    Deno.env.get("IZIPAY_PASSWORD_TEST");

                const publicKey =

                    Deno.env.get("IZIPAY_PUBLIC_KEY_TEST");

                const apiUrl =

                    Deno.env.get("IZIPAY_API_URL");

                if (

                    !username ||

                    !password ||

                    !publicKey ||

                    !apiUrl

                ) {

                    console.error(

                        "Faltan credenciales de Izipay."

                    );

                    return Response.json(

                        {

                            error:

                                "La configuración de Izipay no está completa."

                        },

                        {

                            status: 500

                        }

                    );

                }

                let url =

                    apiUrl.trim();

                if (

                    !url.startsWith("http://") &&

                    !url.startsWith("https://")

                ) {

                    url =

                        "https://" + url;

                }

                url =

                    url.replace(/\/+$/, "");

                if (

                    !url.endsWith(

                        "/api-payment/V4/Charge/CreatePayment"

                    )

                ) {

                    url +=

                        "/api-payment/V4/Charge/CreatePayment";

                }

                const auth =

                    btoa(

                        `${username}:${password}`

                    );

                const amountInCents =

                    Math.round(

                        Number(amount) * 100

                    );

                const paymentData = {

                    amount:

                        amountInCents,

                    currency:

                        currency,

                    orderId:

                        String(orderId),

                    customer: {

                        email:

                            email,

                        billingDetails: {

                            firstName:

                                firstName,

                            lastName:

                                lastName,

                            phoneNumber:

                                phoneNumber,

                            identityType:

                                identityType,

                            identityCode:

                                identityCode,

                            address:

                                address,

                            country:

                                country,

                            city:

                                city,

                            state:

                                state,

                            zipCode:

                                zipCode

                        }

                    }

                };

                const response =

                    await fetch(

                        url,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":

                                    "application/json",

                                "Authorization":

                                    `Basic ${auth}`

                            },

                            body:

                                JSON.stringify(

                                    paymentData

                                )

                        }

                    );

                const result =

                    await response.json();

                if (

                    !response.ok ||

                    result?.status !== "SUCCESS" ||

                    !result?.answer?.formToken

                ) {

                    console.error(

                        "Respuesta completa de Izipay:",

                        JSON.stringify(result)

                    );

                    return Response.json(

                        {

                            error:

                                "No se pudo crear el pago en Izipay.",

                            details:

                                result?.answer?.errorMessage ||

                                "Izipay no devolvió un formToken válido."

                        },

                        {

                            status: 502

                        }

                    );

                }

                return Response.json(

                    {

                        formToken:

                            result.answer.formToken,

                        publicKey:

                            publicKey,

                        orderId:

                            String(orderId)

                    },

                    {

                        status: 200

                    }

                );

            } catch (error) {

                console.error(

                    "Error al crear el pago:",

                    error

                );

                return Response.json(

                    {

                        error:

                            "Ocurrió un error al crear el pago."

                    },

                    {

                        status: 500

                    }

                );

            }

        }

    ),

};