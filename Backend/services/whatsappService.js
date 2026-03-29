const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

exports.enviarConfirmacion = async (telefono, pedido) => {
    try {
        const productos = pedido.productos
            .map(p => `- ${p.nombre} x${p.cantidad}: $${(p.precio * p.cantidad).toLocaleString()}`)
            .join("\n");

        const mensaje = `¡Hola! Tu pedido en *Gorditas con Estilo* ha sido confirmado ✅\n\n${productos}\n\n*Total: $${pedido.total.toLocaleString()}*\n\nGracias por tu compra 🛍️`;

        await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:+57${telefono}`,
            body: mensaje
        });

        console.log(`WhatsApp enviado a ${telefono}`);

    } catch (error) {
        console.error("Error al enviar WhatsApp:", error.message);
    }
};