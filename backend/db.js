require("dotenv").config();
const mysql = require("mysql2/promise");

const config = require("./config");

const pool = mysql.createPool(config.db);

// Probar conexión — ESTE CONSOLE.LOG DEBE APARECER
pool.getConnection()
  .then(() => console.log("MySQL conectado correctamente"))
  .catch(err => console.error("Error MySQL:", err));

module.exports = pool;  
