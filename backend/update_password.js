require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function updatePassword() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to DB');

        const password = 'Admin123!';
        const newHash = await bcrypt.hash(password, 10);
        console.log('Generated new hash:', newHash);

        const [result] = await connection.query(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [newHash, 'adminpro@roca.com']
        );

        console.log('Password updated. Rows affected:', result.affectedRows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

updatePassword();
