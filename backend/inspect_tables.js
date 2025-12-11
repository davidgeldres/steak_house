const db = require('./db');

async function checkTables() {
    try {
        console.log('Checking tables in database...');
        const [rows] = await db.query('SHOW TABLES');
        console.log('Tables:', rows);

        if (rows.length > 0) {
            const tableName = Object.values(rows[0])[0];
            console.log(`Checking content of ${tableName}...`);
            const [data] = await db.query(`SELECT * FROM ${tableName} LIMIT 5`);
            console.log('Sample data:', data);
        }

        // Specific check for usuarios
        console.log('Checking usuarios count...');
        const [count] = await db.query('SELECT COUNT(*) as cx FROM usuarios');
        console.log('Usuarios count:', count[0].cx);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

checkTables();
