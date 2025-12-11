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
CREATE TABLE IF NOT EXISTS auditoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(50) NOT NULL,
    detalles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
`;

async function setupAudit() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a MySQL.');

        await connection.query(sql);
        console.log('Tabla auditoria creada o verificada correctamente.');

        await connection.end();
    } catch (error) {
        console.error('Error creando tabla auditoria:', error);
    }
}

setupAudit();
