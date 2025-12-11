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
  nombre VARCHAR(50) NOT NULL,
  capacidad INT DEFAULT 4
);

-- Insertar mesas (Compatible con esquema usuario + columna capacidad)
INSERT INTO mesas (nombre, capacidad) VALUES
('Mesa 1', 4),('Mesa 2', 4),('Mesa 3', 4),('Mesa 4', 4),
('Mesa 5', 6),('Mesa 6', 6),('Mesa 7', 2),('Mesa 8', 2),
('Mesa 9', 4),('Mesa 10', 4),('Mesa 11', 8),('Mesa 12', 8);

CREATE TABLE reservas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  mesa_id INT NOT NULL,
  cliente_nombre VARCHAR(100),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  hora_fin TIME,  -- Compatible con esquema usuario
  personas INT DEFAULT 1,
  notas TEXT,
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'aceptada', 'rechazada') DEFAULT 'pendiente',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (mesa_id) REFERENCES mesas(id)
);

-- Usuario ADMIN solicitado
INSERT INTO usuarios (nombre, email, password, rol)
VALUES (
  'Administrador',
  'davidadmin@gmail.com',
  '$2a$10$J1Xz3G0RubcA6SNSuqj5WeJtXHyHt5mqLY31WbMl7nHrX7wt3Ff0O', -- admin123
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
