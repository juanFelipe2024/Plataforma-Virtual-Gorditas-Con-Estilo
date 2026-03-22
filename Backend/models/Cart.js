const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
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
            cantidad: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ]
});

module.exports = mongoose.model("Cart", cartSchema);