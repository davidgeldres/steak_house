require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function fixPassword() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        const email = 'adminpro@roca.com';
        const newPassword = 'Admin123!';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log('Updating password for:', email);
        console.log('New Hash:', hashedPassword);

        const [result] = await connection.query(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        console.log('Rows affected:', result.affectedRows);

        // Verify immediately
        const [rows] = await connection.query('SELECT password FROM usuarios WHERE email = ?', [email]);
        if (rows.length > 0) {
            const isMatch = await bcrypt.compare(newPassword, rows[0].password);
            console.log('Verification check:', isMatch ? 'SUCCESS' : 'FAILED');
        }

        await connection.end();
    } catch (error) {
        console.error('Error updating password:', error);
    }
}

fixPassword();
