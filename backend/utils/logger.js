const pool = require('../db');

/**
 * Registra una acción en la tabla de auditoría.
 * @param {number} usuarioId - ID del usuario que realiza la acción (puede ser null).
 * @param {string} accion - Nombre corto de la acción (ej. 'RESERVA_CANCELADA').
 * @param {object|string} detalles - Detalles adicionales (se guardará como string).
 */
async function logAction(usuarioId, accion, detalles) {
    try {
        const detallesStr = typeof detalles === 'object' ? JSON.stringify(detalles) : detalles;
        const query = 'INSERT INTO auditoria (usuario_id, accion, detalles) VALUES (?, ?, ?)';
        await pool.query(query, [usuarioId, accion, detallesStr]);
    } catch (error) {
        console.error('Error registrando auditoría:', error);
        // No lanzamos error para no interrumpir el flujo principal
    }
}

module.exports = { logAction };
