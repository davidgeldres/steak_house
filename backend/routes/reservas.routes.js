const express = require("express");
const router = express.Router();
const resCtrl = require("../controllers/reservas.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

router.get("/", verifyAdmin, resCtrl.listarReservas);
router.get("/usuario/:usuario_id", verifyToken, resCtrl.listarReservasPorUsuario);
router.post("/", verifyToken, resCtrl.crearReserva);
router.patch("/:id/estado", verifyAdmin, resCtrl.actualizarEstado);

module.exports = router;