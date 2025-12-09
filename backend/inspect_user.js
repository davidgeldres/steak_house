require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function inspectUser() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('--- INSPECCIÓN DE USUARIO ---');

        const email = 'adminpro@roca.com';
        const [rows] = await connection.query('SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log(' Usuario NO encontrado en la DB');
        } else {
            const user = rows[0];
            console.log(' Usuario encontrado:');
            console.log('ID:', user.id);
            console.log('Email:', user.email);
            console.log('Hash almacenado:', user.password);

            const passToTest = 'Admin123!';
            const isMatch = await bcrypt.compare(passToTest, user.password);
            console.log(`Probando contraseña '${passToTest}': ${isMatch ? ' COINCIDE' : ' NO COINCIDE'}`);

            // Generar un hash nuevo para comparar visualmente
            const newHash = await bcrypt.hash(passToTest, 10);
            console.log('Ejemplo de hash válido:', newHash);
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectUser();
