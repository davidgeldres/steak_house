// backend/controllers/user.controller.js
const db = require("../db");

async function listarUsuarios(req, res) {
  try {
    const [rows] = await db.query("SELECT id, nombre, email, rol FROM usuarios");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al listar usuarios" });
  }
}

async function obtenerUsuario(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario
};
Ñ