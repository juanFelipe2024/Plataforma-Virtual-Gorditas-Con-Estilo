//const { verifyToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");
const { validarRegistro, validarLogin } = require("../validators/userValidators");
const { validar } = require("../middleware/validationMiddleware");

router.post("/register", validarRegistro, validar, registerUser);
router.post("/login", validarLogin, validar, loginUser);

module.exports = router;

/*router.get("/perfil", verifyToken, (req, res) => {
    res.json({
        message: "Ruta protegida funcionando",
        usuario: req.usuario
    });
});
*/