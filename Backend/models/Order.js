const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productos: [
        {
            productoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            nombre: {
                type: String
            },
            precio: {
                type: Number
            },
            cantidad: {
                type: Number
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ["pendiente", "confirmado", "cancelado"],
        default: "pendiente"
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);