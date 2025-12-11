require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS API 
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/mesas", require("./routes/mesas.routes"));
app.use("/api/reservas", require("./routes/reservas.routes"));
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/reportes", require("./routes/reportRoutes"));
app.use("/api/bloqueos", require("./routes/bloqueos.routes")); // NUEVO

// BASE DE DATOS 
const pool = require("./db");
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS result");
    res.json({ ok: true, result: rows[0].result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// SERVIR FRONTEND
// Seguridad: Bloquear acceso a backend y archivos sensibles
app.use((req, res, next) => {
  if (req.path.startsWith("/backend") || req.path.startsWith("/.env") || req.path.includes("node_modules")) {
    return res.status(403).send("Acceso denegado");
  }
  next();
});

app.use(express.static(path.join(__dirname, "../")));
// esto sirve:
// /cliente.html
// /admin.html
// /login.html
// /css/...css
// /js/...js

// INICIAR SERVIDOR 
const PORT = process.env.PORT || 4001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(`   SERVIDOR INICIADO EN http://0.0.0.0:${PORT}`);
  console.log(`   VERSIÓN CON FIX DE HOST (0.0.0.0) APLICADO`);
  console.log(`==================================================\n`);
});
