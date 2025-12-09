const Mesa = require("../models/mesa.model");

async function listarMesas(req, res) {
  try {
    const data = await Mesa.getAllMesas();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al listar mesas" });
  }
}

async function crearMesa(req, res) {
  try {
    const { numero, capacidad } = req.body;
    if (!numero || !capacidad) {
      return res.status(400).json({ message: "Número y capacidad son obligatorios" });
    }
    const id = await Mesa.createMesa({ numero, capacidad });
    res.status(201).json({ id, numero, capacidad });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al crear mesa" });
  }
}

async function actualizarMesa(req, res) {
  try {
    const { id } = req.params;
    const { numero, capacidad } = req.body;
    await Mesa.updateMesa(id, { numero, capacidad });
    res.json({ message: "Mesa actualizada" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al actualizar mesa" });
  }
}

async function eliminarMesa(req, res) {
  try {
    await Mesa.deleteMesa(req.params.id);
    res.json({ message: "Mesa eliminada" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al eliminar mesa" });
  }
}

module.exports = {
  listarMesas,
  crearMesa,
  actualizarMesa,
  eliminarMesa
};
