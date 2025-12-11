require('dotenv').config();
const db = require('./db');

async function checkData() {
    try {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM reservas");
        console.log("Total Reservas:", rows[0].count);

        const [rows2] = await db.query("SELECT * FROM reservas LIMIT 5");
        console.log("Muestra Reservas:", rows2);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkData();
