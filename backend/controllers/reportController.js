const pool = require("../db");
const excel = require("exceljs");

const exportarReservas = async (req, res) => {
    try {
        const query = `
      SELECT r.id, 
             COALESCE(u.nombre, 'Cliente Web') as cliente, 
             r.fecha, 
             r.hora, 
             r.personas, 
             r.estado,
             m.nombre as mesa
      FROM reservas r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN mesas m ON r.mesa_id = m.id
      ORDER BY r.fecha DESC, r.hora DESC
    `;

        const [rows] = await pool.query(query);

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet("Reservas");

        // Definir columnas
        worksheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Cliente", key: "cliente", width: 30 },
            { header: "Fecha", key: "fecha", width: 15 },
            { header: "Hora", key: "hora", width: 10 },
            { header: "Personas", key: "personas", width: 10 },
            { header: "Mesa", key: "mesa", width: 10 },
            { header: "Estado", key: "estado", width: 15 },
        ];

        // Estilo del encabezado
        worksheet.getRow(1).font = { bold: true };

        // Agregar filas
        rows.forEach((row) => {
            // Formatear fecha
            const fecha = new Date(row.fecha).toLocaleDateString();
            worksheet.addRow({
                id: row.id,
                cliente: row.cliente,
                fecha: fecha,
                hora: row.hora,
                personas: row.personas,
                mesa: row.mesa || "N/A",
                estado: row.estado,
            });
        });

        // Configurar respuesta HTTP
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte_reservas.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error generando Excel:", error);
        const fs = require('fs');
        fs.writeFileSync('debug_error.log', `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\n`);
        res.status(500).json({ error: "No se pudo generar el reporte" });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const stats = {};

        // 1. Horas pico (Reservas por hora)
        const [peakHours] = await pool.query(`
      SELECT HOUR(hora) as hora, COUNT(*) as cantidad 
      FROM reservas 
      GROUP BY HOUR(hora) 
      ORDER BY hora ASC
    `);
        stats.peakHours = peakHours;

        // 2. Mesas más usadas
        const [topTables] = await pool.query(`
      SELECT m.nombre, COUNT(r.id) as cantidad 
      FROM reservas r
      JOIN mesas m ON r.mesa_id = m.id
      GROUP BY m.id, m.nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `);
        stats.topTables = topTables;

        // 3. Línea de tiempo (Últimos 7 días)
        const [timeline] = await pool.query(`
      SELECT DATE(fecha) as fecha, COUNT(*) as cantidad 
      FROM reservas 
      WHERE fecha >= DATE(NOW()) - INTERVAL 7 DAY
      GROUP BY DATE(fecha) 
      ORDER BY fecha ASC
    `);
        stats.timeline = timeline;

        // 4. Tasa de aceptación (Estado)
        const [statusDist] = await pool.query(`
      SELECT estado, COUNT(*) as cantidad 
      FROM reservas 
      GROUP BY estado
    `);
        stats.statusDist = statusDist;

        res.json(stats);
    } catch (error) {
        console.error("Error obteniendo stats:", error);
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
};

module.exports = {
    exportarReservas,
    getDashboardStats
};
