const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { enviarConfirmacion } = require("../services/whatsappService");

// Agregar un producto al carrito
exports.agregarAlCarrito = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;
        const usuarioId = req.usuario.id;

        let carrito = await Cart.findOne({ usuario: usuarioId });

        if (!carrito) {
            carrito = new Cart({
                usuario: usuarioId,
                productos: [{ productoId, cantidad }]
            });
        } else {
            const productoExistente = carrito.productos.find(
                p => p.productoId.toString() === productoId
            );

            if (productoExistente) {
                productoExistente.cantidad += cantidad;
            } else {
                carrito.productos.push({ productoId, cantidad });
            }
        }

        await carrito.save();

        res.status(200).json({
            message: "Producto agregado al carrito",
            carrito
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al agregar al carrito"
        });
    }
};

// Obtener el carrito del usuario
exports.obtenerCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const carrito = await Cart.findOne({ usuario: usuarioId })
            .populate("productos.productoId", "nombre precio imagen");

        if (!carrito) {
            return res.status(200).json({
                message: "El carrito está vacío",
                productos: []
            });
        }

        res.status(200).json(carrito);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener el carrito"
        });
    }
};

// Eliminar un producto del carrito
exports.eliminarDelCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { productoId } = req.params;

        const carrito = await Cart.findOne({ usuario: usuarioId });

        if (!carrito) {
            return res.status(404).json({
                error: "Carrito no encontrado"
            });
        }

        carrito.productos = carrito.productos.filter(
            p => p.productoId.toString() !== productoId
        );

        await carrito.save();

        res.status(200).json({
            message: "Producto eliminado del carrito",
            carrito
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al eliminar del carrito"
        });
    }
};

// Confirmar la compra y se convierte en pedido
exports.confirmarCompra = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const carrito = await Cart.findOne({ usuario: usuarioId })
            .populate("productos.productoId");

        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({
                error: "El carrito está vacío"
            });
        }

        let total = 0;
        const productosParaPedido = [];

        for (const item of carrito.productos) {
            const producto = item.productoId;

            if (producto.stock < item.cantidad) {
                return res.status(400).json({
                    error: `Stock insuficiente para ${producto.nombre}`
                });
            }

            total += producto.precio * item.cantidad;

            productosParaPedido.push({
                productoId: producto._id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: item.cantidad
            });

            await Product.findByIdAndUpdate(producto._id, {
                $inc: { stock: -item.cantidad }
            });
        }

        const pedido = new Order({
            usuario: usuarioId,
            productos: productosParaPedido,
            total
        });

        await pedido.save();

        carrito.productos = [];
        await carrito.save();

        const usuario = await require("../models/User").findById(usuarioId);
        if (usuario && usuario.telefono) {
            await enviarConfirmacion(usuario.telefono, pedido);
}

        res.status(201).json({
            message: "Compra confirmada correctamente",
            pedido
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al confirmar la compra"
        });
    }
};