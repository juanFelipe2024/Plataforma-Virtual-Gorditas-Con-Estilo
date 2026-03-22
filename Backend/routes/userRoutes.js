//const { verifyToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;

/*router.get("/perfil", verifyToken, (req, res) => {
    res.json({
        message: "Ruta protegida funcionando",
        usuario: req.usuario
    });
});
*/