require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

const sql = `
CREATE TABLE IF NOT EXISTS bloqueos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mesa_id INT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE CASCADE
);
`;

async function setupBloqueos() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a MySQL.');

        await connection.query(sql);
        console.log('Tabla bloqueos creada o verificada correctamente.');

        await connection.end();
    } catch (error) {
        console.error('Error creando tabla bloqueos:', error);
    }
}

setupBloqueos();
