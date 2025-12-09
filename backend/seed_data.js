require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true // Enable multiple statements
};

const sql = `
UPDATE usuarios SET password = '$2a$10$qmX8Tjc9veDK/Z18T08zEgyYdD/euFBNEPgDWw6GT' WHERE email = 'adminpro@roca.com';

INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES
('Juan Perez', 'juan@test.com', '$2a$10$F3xdIakpizr6xKzpVkpuKwbZnf4eeP7G', 'cliente'),
('Maria Lopez', 'maria@test.com', '$2a$10$F3xdIakpizr6xKzpVkpuKwbZnf4eeP7G', 'cliente'),
('Carlos Ruiz', 'carlos@test.com', '$2a$10$F3xdIakpizr6xKzpVkpuKwbZnf4eeP7G', 'cliente');

INSERT IGNORE INTO reservas (usuario_id, mesa_id, cliente_nombre, fecha, hora, personas, notas, estado) VALUES
(2, 1, 'Juan Perez', CURDATE(), '19:00:00', 4, 'Cumpleaños', 'confirmada'),
(3, 5, 'Maria Lopez', CURDATE(), '20:30:00', 2, 'Aniversario', 'pendiente'),
(4, 2, 'Carlos Ruiz', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '21:00:00', 4, '', 'pendiente');
`;

async function seed() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        await connection.query(sql);
        console.log('Seed data inserted successfully.');

        await connection.end();
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seed();
