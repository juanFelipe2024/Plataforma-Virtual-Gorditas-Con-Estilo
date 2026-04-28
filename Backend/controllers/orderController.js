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
            .populate("productos.productoId", "imagen")
            .sort({ fecha: -1 });

        // Enriquecer datos: agregar imagen a cada producto
        const pedidosEnriquecidos = pedidos.map(pedido => {
            const pedidoObj = pedido.toObject();
            pedidoObj.productos = pedidoObj.productos.map(p => ({
                ...p,
                imagen: p.productoId?.imagen || null
            }));
            return pedidoObj;
        });

        res.status(200).json(pedidosEnriquecidos);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los pedidos"
        });
    }
};

exports.actualizarEstadoPedido = async (req, res) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ["pendiente", "confirmado", "cancelado"];

        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                error: "Estado no válido"
            });
        }

        const pedido = await Order.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        ).populate("usuario", "nombre email");

        if (!pedido) {
            return res.status(404).json({
                error: "Pedido no encontrado"
            });
        }

        res.status(200).json({
            message: "Estado actualizado correctamente",
            pedido
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al actualizar el estado del pedido"
        });
    }
};