const express = require("express");
const router = express.Router();

const {
    agregarAlCarrito,
    obtenerCarrito,
    eliminarDelCarrito,
    confirmarCompra
} = require("../controllers/cartController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, agregarAlCarrito);
router.get("/", verifyToken, obtenerCarrito);
router.delete("/:productoId", verifyToken, eliminarDelCarrito);
router.post("/confirmar", verifyToken, confirmarCompra);

module.exports = router;