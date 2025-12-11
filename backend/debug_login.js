const db = require('./db');
const bcrypt = require('bcryptjs');

const config = require('./config');

async function debugLogin() {
    console.log('DB Config:', {
        host: config.db.host,
        user: config.db.user,
        database: config.db.database
    });

    try {
        const email = 'davidadmin@gmail.com';
        const pass = 'admin123';

        console.log(`Checking user: ${email}...`);
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log('User NOT FOUND in DB');
            return;
        }

        const user = rows[0];
        console.log('User found:', {
            id: user.id,
            email: user.email,
            rol: user.rol,
            hashStart: user.password.substring(0, 10) + '...'
        });

        const match = await bcrypt.compare(pass, user.password);
        console.log(`Password '${pass}' matches? ${match}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

debugLogin();
