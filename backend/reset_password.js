require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function resetPassword() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to DB');

        const email = 'adminpro@roca.com';
        const newPassword = 'Admin123!';
        const newHash = await bcrypt.hash(newPassword, 10);

        const [result] = await connection.query(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [newHash, email]
        );

        console.log(`Updated password for ${email}. Changed rows: ${result.changedRows}`);

        // Verify
        const [rows] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = rows[0];
        const match = await bcrypt.compare(newPassword, user.password);
        console.log('Verification match:', match);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

resetPassword();
