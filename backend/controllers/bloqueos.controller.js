const db = require('../db');

// Listar bloqueos (activos/futuros por defecto, o todos)
async function listarBloqueos(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT b.*, m.nombre as mesa_nombre 
            FROM bloqueos b
            LEFT JOIN mesas m ON b.mesa_id = m.id
            ORDER BY b.fecha ASC, b.hora_inicio ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al listar bloqueos" });
    }
}

// Crear bloqueo
async function crearBloqueo(req, res) {
    try {
        const { mesa_id, fecha, hora_inicio, hora_fin, motivo } = req.body;

        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: "Faltan datos obligatorios (fecha, hora inicio, hora fin)" });
        }

        const mesaIdFinal = mesa_id ? mesa_id : null; // Si es null => Bloqueo Global

        await db.query(`
            INSERT INTO bloqueos (mesa_id, fecha, hora_inicio, hora_fin, motivo)
            VALUES (?, ?, ?, ?, ?)
        `, [mesaIdFinal, fecha, hora_inicio, hora_fin, motivo]);

        res.status(201).json({ message: "Bloqueo creado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear bloqueo" });
    }
}

// Eliminar bloqueo
async function eliminarBloqueo(req, res) {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM bloqueos WHERE id = ?", [id]);
        res.json({ message: "Bloqueo eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar bloqueo" });
    }
}

module.exports = {
    listarBloqueos,
    crearBloqueo,
    eliminarBloqueo
};
