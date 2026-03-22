const express = require("express");
const router = express.Router();

const {
    obtenerPedidos,
    obtenerPedidosCliente
} = require("../controllers/orderController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, verifyAdmin, obtenerPedidos);
router.get("/mispedidos", verifyToken, obtenerPedidosCliente);

module.exports = router;