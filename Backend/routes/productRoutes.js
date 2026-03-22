const express = require("express");
const router = express.Router();

const {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    editarProducto,
    eliminarProducto
} = require("../controllers/productController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);
router.post("/", verifyToken, verifyAdmin, crearProducto);
router.put("/:id", verifyToken, verifyAdmin, editarProducto);
router.delete("/:id", verifyToken, verifyAdmin, eliminarProducto);

module.exports = router;