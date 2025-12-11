const db = require("../db");

// Comprueba conflicto en un rango de 2 horas
async function existeConflicto({ fecha, hora, mesa_id }) {
  // 1. Revisar Bloqueos (Tabla 'bloqueos')
  //    - Bloqueo global: mesa_id IS NULL
  //    - Bloqueo mesa: mesa_id = ?
  //    - Coincidencia fecha y hora.
  const [bloqueos] = await db.query(
    `SELECT id FROM bloqueos 
     WHERE fecha = ? 
       AND (mesa_id IS NULL OR mesa_id = ?)
       AND ? >= hora_inicio 
       AND ? < hora_fin`,
    [fecha, mesa_id, hora, hora]
  );

  if (bloqueos.length > 0) return true;

  // 2. Revisar Reservas existentes (Rango 2 horas)
  const [rows] = await db.query(
    `SELECT id FROM reservas 
     WHERE mesa_id = ? 
       AND fecha = ? 
       AND estado IN ('pendiente','confirmada','aceptada')
       AND ABS(TIMESTAMPDIFF(MINUTE, hora, ?)) < 120`,
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
    `SELECT r.*, m.nombre AS mesa_numero 
       FROM reservas r
       LEFT JOIN mesas m ON m.id = r.mesa_id
     ORDER BY r.fecha DESC, r.hora DESC`
  );
  return rows;
}

async function obtenerReservasPorUsuario(usuario_id) {
  const [rows] = await db.query(
    `SELECT r.*, m.nombre AS mesa_numero 
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