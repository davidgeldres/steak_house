const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config");
const { appendToJson } = require("../utils/jsonFile");
const path = require("path");

/* ============================================================
   REGISTRO
============================================================ */
async function register(req, res) {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // ¿Ya existe ese correo?
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con ese correo" });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario: por defecto cliente
    const rolFinal = rol || "cliente";
    const newId = await User.createUser({
      nombre,
      email,
      passwordHash,
      rol: rolFinal,
    });

    const newUser = {
      id: newId,
      nombre,
      email,
      rol: rolFinal,
      fecha_registro: new Date().toISOString()
    };

    // PERSISTENCIA JSON
    await appendToJson("../Mis_reservas/usuarios_creados.json", newUser);

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: newId,
        nombre,
        email,
        rol: rolFinal,
      },
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

/* ============================================================
   LOGIN
   - Acepta: email O dato (email o nombre)
   - Devuelve: { token, user }
============================================================ */
async function login(req, res) {
  try {
    const { email, dato, password } = req.body;
    const identificador = email || dato;

    if (!identificador || !password) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Buscar por email o nombre
    const user = await User.findByEmailOrName(identificador);
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol,
        nombre: user.nombre,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // AUDITORÍA
    const { logAction } = require("../utils/logger");
    await logAction(user.id, "LOGIN", "Inicio de sesión exitoso");

    return res.json({
      message: "Bienvenido",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

module.exports = { register, login };
