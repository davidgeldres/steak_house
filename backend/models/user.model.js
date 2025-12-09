/*const db = require("../db");

async function findByEmail(email) {
  const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = ?", [id]);
  return rows[0];
}

async function createUser({ nombre, email, passwordHash, rol = "cliente" }) {
  const [result] = await db.query(
    "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
    [nombre, email, passwordHash, rol]
  );
  return result.insertId;
}

module.exports = {
  findByEmail,
  findById,
  createUser
};
*/
const db = require("../db");

/* ============================================================
   BUSCAR USUARIO POR EMAIL
============================================================ */
async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );
  return rows[0];
}

/* ============================================================
   BUSCAR POR EMAIL O NOMBRE (PARA LOGIN)
============================================================ */
async function findByEmailOrName(dato) {
  const [rows] = await db.query(
    "SELECT * FROM usuarios WHERE email = ? OR nombre = ?",
    [dato, dato]
  );
  return rows.length > 0 ? rows[0] : null;
}

/* ============================================================
   BUSCAR POR ID
============================================================ */
async function findById(id) {
  const [rows] = await db.query(
    "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
    [id]
  );
  return rows[0];
}

/* ============================================================
   CREAR USUARIO
============================================================ */
async function createUser({ nombre, email, passwordHash, rol = "cliente" }) {
  const [result] = await db.query(
    "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
    [nombre, email, passwordHash, rol]
  );
  return result.insertId;
}

module.exports = {
  findByEmail,
  findByEmailOrName,
  findById,
  createUser
};
