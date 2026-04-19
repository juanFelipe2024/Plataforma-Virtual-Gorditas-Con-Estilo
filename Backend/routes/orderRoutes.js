const express = require("express");
const router = express.Router();
const { obtenerPedidos, obtenerPedidosCliente, actualizarEstadoPedido } = require("../controllers/orderController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const { validarActualizarEstado } = require("../validators/orderValidators");
const { validar } = require("../middleware/validationMiddleware");

router.get("/", verifyToken, verifyAdmin, obtenerPedidos);
router.get("/mispedidos", verifyToken, obtenerPedidosCliente);
router.patch("/:id/estado", verifyToken, verifyAdmin, validarActualizarEstado, validar, actualizarEstadoPedido);

module.exports = router;