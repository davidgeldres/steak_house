const db = require('./db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        console.log('Connecting via db module...');

        // Datos del admin
        const nombre = 'David Admin';
        const email = 'davidadmin@gmail.com';
        const passwordPlain = 'admin123';
        const rol = 'admin'; // Intento con 'admin'. Si falla, probar 'administrador'

        // Hashear password
        const passwordHash = await bcrypt.hash(passwordPlain, 10);

        // Verificar columnas en usuarios (debug)
        // const [cols] = await db.query("SHOW COLUMNS FROM usuarios");
        // console.log("Columns:", cols.map(c => c.Field));

        // Verificar si existe
        const [existing] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('El usuario ya existe. Actualizando password de ID:', existing[0].id);
            await db.query('UPDATE usuarios SET password = ?, rol = ? WHERE email = ?', [passwordHash, rol, email]);
            console.log('Usuario actualizado correctametne.');
        } else {
            console.log('Creando usuario...');
            const [res] = await db.query(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [nombre, email, passwordHash, rol]
            );
            console.log('Usuario creado exitosamente. Insert ID:', res.insertId);

            // VERIFICAR INMEDIATAMENTE
            const [check] = await db.query('SELECT * FROM usuarios WHERE id = ?', [res.insertId]);
            console.log('Verificación inmediata:', check.length > 0 ? 'ENCONTRADO' : 'NO ENCONTRADO');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Cerrar pool para terminar script
        await db.end();
    }
}

createAdmin();
