const db = require('./db');

async function fixSchema() {
    try {
        console.log('--- FIXING DATABASE SCHEMA ---');

        // 1. Check if 'numero' column exists in 'mesas'
        const [columns] = await db.query("SHOW COLUMNS FROM mesas LIKE 'numero'");

        if (columns.length === 0) {
            console.log("'numero' column missing in 'mesas'. Adding it...");

            // Add column
            await db.query("ALTER TABLE mesas ADD COLUMN numero VARCHAR(50) NOT NULL DEFAULT '0'");
            console.log("Column added.");

            // Populate 'numero' with 'id' for existing rows to have unique values
            console.log("Populating 'numero' with 'id' values...");
            await db.query("UPDATE mesas SET numero = CAST(id AS CHAR)");
            console.log("Population complete.");

        } else {
            console.log("'numero' column already exists in 'mesas'.");
        }

        console.log("--- SCHEMA FIX COMPLETED ---");

    } catch (error) {
        console.error("Error fixing schema:", error);
    } finally {
        await db.end();
    }
}

fixSchema();
