const express = require("express");
const router = express.Router();
const resCtrl = require("../controllers/reservas.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

router.get("/", verifyAdmin, resCtrl.listarReservas);
router.get("/usuario/:usuario_id", verifyToken, resCtrl.listarReservasPorUsuario);
router.post("/", verifyToken, resCtrl.crearReserva);
router.patch("/:id/estado", verifyAdmin, resCtrl.actualizarEstado);

// Acciones Cliente
router.patch("/:id/cancelar", verifyToken, resCtrl.cancelarReservaCliente);
router.put("/:id", verifyToken, resCtrl.editarReservaCliente);

// Disponibilidad
router.get("/disponibilidad", verifyToken, resCtrl.consultarDisponibilidad);

module.exports = router;