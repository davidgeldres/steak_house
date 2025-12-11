const express = require("express");
const router = express.Router();
const bloqueoCtrl = require("../controllers/bloqueos.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// Rutas protegidas (Solo Admin)
router.get("/", verifyToken, verifyAdmin, bloqueoCtrl.listarBloqueos);
router.post("/", verifyToken, verifyAdmin, bloqueoCtrl.crearBloqueo);
router.delete("/:id", verifyToken, verifyAdmin, bloqueoCtrl.eliminarBloqueo);

module.exports = router;
