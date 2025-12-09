const db = require("../db");

// Comprueba conflicto en un rango de 2 horas
async function existeConflicto({ fecha, hora, mesa_id }) {
  const [rows] = await db.query(
    `SELECT id FROM reservas 
     WHERE mesa_id = ? 
       AND fecha = ? 
       AND estado IN ('pendiente','confirmada')
       AND ABS(TIMESTAMPDIFF(MINUTE, hora, ?)) < 120`, // <--- LÓGICA DE 2 HORAS
    [mesa_id, fecha, hora]
  );
  return rows.length > 0;
}

async function crearReserva({ usuario_id, cliente_nombre, fecha, hora, personas, mesa_id, notas }) {
  const [res] = await db.query(
    `INSERT INTO reservas 
      (usuario_id, cliente_nombre, fecha, hora, personas, mesa_id, notas, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [usuario_id, cliente_nombre, fecha, hora, personas, mesa_id, notas]
  );
  return res.insertId;
}

async function obtenerReservas() {
  const [rows] = await db.query(
    `SELECT r.*, m.numero AS mesa_numero 
       FROM reservas r
       LEFT JOIN mesas m ON m.id = r.mesa_id
     ORDER BY r.fecha DESC, r.hora DESC`
  );
  return rows;
}

async function obtenerReservasPorUsuario(usuario_id) {
  const [rows] = await db.query(
    `SELECT r.*, m.numero AS mesa_numero 
       FROM reservas r
       LEFT JOIN mesas m ON m.id = r.mesa_id
     WHERE r.usuario_id = ?
     ORDER BY r.fecha DESC, r.hora DESC`,
    [usuario_id]
  );
  return rows;
}

async function cambiarEstado(id, estado) {
  await db.query("UPDATE reservas SET estado = ? WHERE id = ?", [estado, id]);
}

module.exports = {
  existeConflicto,
  crearReserva,
  obtenerReservas,
  obtenerReservasPorUsuario,
  cambiarEstado
};