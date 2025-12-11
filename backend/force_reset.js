const db = require('./db');

async function forceReset() {
    try {
        console.log('--- FORCING TABLE RESET ---');

        // 1. Drop tables (Reservas depends on Mesas, so drop Reservas first or disable checks)
        await db.query("SET FOREIGN_KEY_CHECKS = 0");
        await db.query("DROP TABLE IF EXISTS reservas");
        await db.query("DROP TABLE IF EXISTS mesas");

        console.log("Tables dropped.");

        // 2. Create Mesas
        // Explicitly ensuring 'numero' exists
        const createMesasSQL = `
            CREATE TABLE mesas (
                id INT PRIMARY KEY AUTO_INCREMENT,
                numero VARCHAR(50) NOT NULL,
                capacidad INT DEFAULT 4
            )
        `;
        await db.query(createMesasSQL);
        console.log("Table 'mesas' created.");

        // 3. Create Reservas
        const createReservasSQL = `
            CREATE TABLE reservas (
                id INT PRIMARY KEY AUTO_INCREMENT,
                usuario_id INT NOT NULL,
                mesa_id INT NOT NULL,
                cliente_nombre VARCHAR(100),
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                personas INT DEFAULT 1,
                notas TEXT,
                estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
                creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (mesa_id) REFERENCES mesas(id)
            )
        `;
        await db.query(createReservasSQL);
        console.log("Table 'reservas' created.");

        // 4. Seed Mesas (12 tables)
        const mesasData = [];
        for (let i = 1; i <= 12; i++) {
            let cap = 4;
            // Pattern: 4, 4, 4, 4, 6, 6, 2, 2, 4, 4, 8, 8
            if (i === 5 || i === 6) cap = 6;
            if (i === 7 || i === 8) cap = 2;
            if (i === 11 || i === 12) cap = 8;
            mesasData.push([i, i.toString(), cap]);
        }

        // Using explicit ID to match 'numero' exactly 1-12
        await db.query("INSERT INTO mesas (id, numero, capacidad) VALUES ?", [mesasData]);
        console.log("Mesas seeded (12 tables).");

        // 5. Restore checks
        await db.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("--- RESET COMPLETE ---");

    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        await db.end();
    }
}

forceReset();
