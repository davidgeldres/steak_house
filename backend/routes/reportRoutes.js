const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken } = require("../middleware/auth.middleware");

// GET /api/reportes/excel - Generar Excel de reservas (solo admin)
// Se puede requerir autenticación si se desea, por ahora sugerido protegerlo
router.get("/excel", verifyToken, reportController.exportarReservas);

router.get("/dashboard", verifyToken, reportController.getDashboardStats);

module.exports = router;
