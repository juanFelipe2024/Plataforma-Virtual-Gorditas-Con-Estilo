const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            nombre,
            email,
            password: hashedPassword,
            telefono
        });

        await user.save();

        res.status(201).json({
            message: "Usuario registrado correctamente"
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al registrar usuario"
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: "Email o contraseña incorrectos"
            });
        }

        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(401).json({
                error: "Email o contraseña incorrectos"
            });
        }

        const token = jwt.sign(
            { id: user._id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.status(200).json({
            message: "Login exitoso",
            token,
            usuario: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al iniciar sesión"
        });
    }
};