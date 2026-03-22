const Order = require("../models/Order");

exports.obtenerPedidos = async (req, res) => {
    try {
        const pedidos = await Order.find()
            .populate("usuario", "nombre email telefono")
            .sort({ fecha: -1 });

        res.status(200).json(pedidos);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los pedidos"
        });
    }
};

exports.obtenerPedidosCliente = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const pedidos = await Order.find({ usuario: usuarioId })
            .sort({ fecha: -1 });

        res.status(200).json(pedidos);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los pedidos"
        });
    }
};