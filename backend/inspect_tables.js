const db = require('./db');

async function inspectTable() {
    try {
        console.log('--- INSPECTING MESAS TABLE ---');
        const [columns] = await db.query("SHOW COLUMNS FROM mesas");
        console.log(columns);

        console.log('--- INSPECTING RESERVAS TABLE ---');
        const [resCols] = await db.query("SHOW COLUMNS FROM reservas");
        console.log(resCols);

    } catch (error) {
        console.error("Error inspecting table:", error);
    } finally {
        await db.end();
    }
}

inspectTable();
