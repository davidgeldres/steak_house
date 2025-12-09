const db = require("../db");

async function getAllMesas() {
  const [rows] = await db.query("SELECT * FROM mesas ORDER BY numero");
  return rows;
}

async function createMesa({ numero, capacidad }) {
  const [res] = await db.query(
    "INSERT INTO mesas (numero, capacidad) VALUES (?, ?)",
    [numero, capacidad]
  );
  return res.insertId;
}

async function updateMesa(id, { numero, capacidad }) {
  await db.query(
    "UPDATE mesas SET numero = ?, capacidad = ? WHERE id = ?",
    [numero, capacidad, id]
  );
}

async function deleteMesa(id) {
  await db.query("DELETE FROM mesas WHERE id = ?", [id]);
}

module.exports = {
  getAllMesas,
  createMesa,
  updateMesa,
  deleteMesa
};
