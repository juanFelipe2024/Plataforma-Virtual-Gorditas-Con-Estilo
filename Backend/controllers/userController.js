const User = require("../models/User");
const bcrypt = require("bcrypt");

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