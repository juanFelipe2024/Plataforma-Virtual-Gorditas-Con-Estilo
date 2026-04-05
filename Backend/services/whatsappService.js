const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

exports.enviarConfirmacion = async (telefono, pedido, metodoPago) => {
    try {
        const productos = pedido.productos
            .map(p => `• ${p.nombre} x${p.cantidad} — $${(p.precio * p.cantidad).toLocaleString()}`)
            .join("\n");

        const metodoTexto = metodoPago === "tarjeta"
            ? "Tarjeta de crédito/débito"
            : metodoPago === "transferencia"
            ? "Transferencia bancaria"
            : "No especificado";

        const mensaje =
`¡Hola! Tu pedido en *Gorditas con Estilo* ha sido confirmado ✅

*Productos:*
${productos}

*Total pagado:* $${pedido.total.toLocaleString()}
*Método de pago:* ${metodoTexto}

Gracias por tu compra, pronto recibirás tu pedido 🛍️`;

        const result = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:+57${telefono}`,
            body: mensaje
        });

        console.log("✅ WhatsApp enviado, SID:", result.sid);

    } catch (error) {
        console.error("❌ Error Twilio:", error.message);
    }
};