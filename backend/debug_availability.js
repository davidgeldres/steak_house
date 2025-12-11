const db = require('./db');

async function debug() {
    try {
        console.log("--- DEBUG START ---");

        // 2. Check query logic for 12:00
        const horaCheck = "12:00";
        console.log(`Checking availability for ${horaCheck}...`);

        // Debug with TIME_TO_SEC
        const [diffCheck] = await db.query(
            `SELECT id, hora, 
         TIME_TO_SEC(hora) as sec_db, 
         TIME_TO_SEC(?) as sec_check,
         ABS(TIME_TO_SEC(hora) - TIME_TO_SEC(?)) as sec_diff 
         FROM reservas 
         WHERE fecha LIKE '2025-12-13%'`,
            [horaCheck, horaCheck]
        );
        console.log("Time comparisons:", diffCheck);

        const [occupied] = await db.query(
            `SELECT mesa_id FROM reservas 
         WHERE fecha LIKE '2025-12-13%' 
           AND estado IN ('pendiente', 'confirmada', 'aceptada')
           AND ABS(TIME_TO_SEC(hora) - TIME_TO_SEC(?)) < 7200`,
            [horaCheck]
        );

        console.log("Occupied Mesa IDs:", occupied.map(o => o.mesa_id));
        console.log("--- DEBUG END ---");

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debug();
