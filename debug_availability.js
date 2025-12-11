const db = require('./backend/db');

async function debug() {
    try {
        console.log("Querying for 2025-12-13...");
        const [rows] = await db.query("SELECT * FROM reservas WHERE fecha LIKE '2025-12-13%'");
        console.log("Reservations found:", rows);

        // Simulate availability check for 12:00
        const horaCheck = "12:00";
        const [occupied] = await db.query(
            `SELECT mesa_id FROM reservas 
       WHERE fecha LIKE '2025-12-13%' 
         AND estado IN ('pendiente', 'confirmada', 'aceptada')
         AND ABS(TIMESTAMPDIFF(MINUTE, hora, ?)) < 120`,
            [horaCheck]
        );
        console.log(`Occupied IDs at ${horaCheck}:`, occupied);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debug();
