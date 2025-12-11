require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true // Enable multiple statements for the script
};

const sql = `
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS mesas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cliente') DEFAULT 'cliente',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mesas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(50) NOT NULL,
  capacidad INT DEFAULT 4
);

INSERT INTO mesas (numero, capacidad) VALUES
('1', 4),('2', 4),('3', 4),('4', 4),('5', 6),('6', 6),
('7', 2),('8', 2),('9', 4),('10', 4),('11', 8),('12', 8);

CREATE TABLE reservas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  mesa_id INT NOT NULL,
  cliente_nombre VARCHAR(100),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  personas INT DEFAULT 1,
  notas TEXT,
  estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (mesa_id) REFERENCES mesas(id)
);

INSERT INTO usuarios (nombre, email, password, rol)
VALUES (
  'AdminPro',
  'adminpro@roca.com',
  '$2a$10$g3wfVbhcYuVymHilipY8KeOk83aqrZgbD9HE.SzwzFnP61xz6IdBO',
  'admin'
);
`;

async function setup() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server.');

    await connection.query(sql);
    console.log('Database roca_steak created and tables initialized successfully.');

    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

setup();
