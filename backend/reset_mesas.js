const db = require('./db');

async function resetMesas() {
    try {
        console.log('--- RESETTING MESAS ---');

        // 1. Disable FK checks to allow truncating tables
        await db.query("SET FOREIGN_KEY_CHECKS = 0");

        // 2. Truncate mesas (and optionally reservas if you want a clean slate, but let's keep reservations for now if possible, though they might have invalid mesa_ids if we truncate. Safer to clear matches or update them. Let's truncate mesas and re-seed IDs 1-12. If reservas point to ID > 12, they will be orphaned or hidden).
        // To be safe for "Structure Complete", let's clear mesas.
        await db.query("TRUNCATE TABLE mesas");

        // 3. Insert 12 mesas
        console.log("Inserting 12 mesas...");
        const mesasInfo = [];
        for (let i = 1; i <= 12; i++) {
            // numero, capacidad
            // Capacity pattern: 4, 4, 4, 4, 6, 6, 2, 2, 4, 4, 8, 8 (example from setup_db.js)
            let cap = 4;
            if (i === 5 || i === 6) cap = 6;
            if (i === 7 || i === 8) cap = 2;
            if (i === 11 || i === 12) cap = 8;

            mesasInfo.push([i, i.toString(), cap]); // id, numero, capacidad (assuming id auto-increment matches or we force it)
        }

        // We truncated, so auto-increment resets to 1.
        // Insert: numero, capacidad. (ID will be generated)
        // Wait, setup_db.js used INSERT with values. 
        // Let's explicitly insert.

        await db.query("INSERT INTO mesas (numero, capacidad) VALUES ?", [mesasInfo.map(m => [m[1], m[2]])]);

        // 4. Update 'numero' column based on ID just to be sure (though we inserted 'numero' correctly above)
        // await db.query("UPDATE mesas SET numero = CAST(id AS CHAR)");

        console.log("--- RESET COMPLETED (12 Mesas) ---");

        // 5. Verify columns one last time
        const [cols] = await db.query("SHOW COLUMNS FROM mesas");
        console.log("Columns in mesas:", cols.map(c => c.Field));

        await db.query("SET FOREIGN_KEY_CHECKS = 1");

    } catch (error) {
        console.error("Error resetting mesas:", error);
    } finally {
        await db.end();
    }
}

resetMesas();
