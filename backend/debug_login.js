require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function testLogin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to DB');

        const email = 'adminpro@roca.com';
        const password = 'Admin123!';

        // 1. Check if user exists
        const [rows] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            console.log('User not found');
            return;
        }

        const user = rows[0];
        console.log('User found:', user.email);
        console.log('Stored Hash:', user.password);

        // 2. Verify password
        const match = await bcrypt.compare(password, user.password);
        console.log('Password match:', match);

        // 3. Generate new hash to compare
        const newHash = await bcrypt.hash(password, 10);
        console.log('New Hash for Admin123!:', newHash);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
