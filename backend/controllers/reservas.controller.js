const Reserva = require("../models/reserva.model");
const { appendToJson } = require("../utils/jsonFile");
const path = require("path");

async function crearReserva(req, res) {
  try {
    let {
      usuario_id,
      cliente_nombre,
      fecha,
      hora,
      personas,
      mesa_id,
      notas
    } = req.body;

    // CORRECCIÓN DE FECHA (DD/MM/YYYY -> YYYY-MM-DD)
    if (fecha && fecha.includes('/')) {
      const [dia, mes, anio] = fecha.split('/');
      fecha = `${anio}-${mes}-${dia}`;
    }

    if (!usuario_id || !fecha || !hora || !mesa_id) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Control de disponibilidad REAL
    const conflicto = await Reserva.existeConflicto({ fecha, hora, mesa_id });
    if (conflicto) {
      return res.status(409).json({
        message: "Mesa ocupada en ese horario (rango de 2 horas)"
      });
    }

    const id = await Reserva.crearReserva({
      usuario_id,
      cliente_nombre,
      fecha,
      hora,
      personas,
      mesa_id,
      notas
    });

    // PERSISTENCIA JSON
    const newResverva = {
      id,
      usuario_id,
      cliente_nombre,
      fecha,
      hora,
      personas,
      mesa_id,
      notas,
      estado: "pendiente",
      created_at: new Date().toISOString()
    };
    await appendToJson("../Mis_reservas/mis_reservas.json", newResverva);

    res.status(201).json({ id, estado: "pendiente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al crear reserva" });
  }
}

async function listarReservas(req, res) {
  try {
    const data = await Reserva.obtenerReservas();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
}

async function listarReservasPorUsuario(req, res) {
  try {
    const { usuario_id } = req.params;
    const data = await Reserva.obtenerReservasPorUsuario(usuario_id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
}

async function actualizarEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["confirmada", "cancelada"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    await Reserva.cambiarEstado(id, estado);
    res.json({ message: "Estado actualizado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
}

module.exports = {
  crearReserva,
  listarReservas,
  listarReservasPorUsuario,
  actualizarEstado
};