const express = require("express");
const router = express.Router();
const mesasCtrl = require("../controllers/mesas.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

router.get("/", verifyToken, mesasCtrl.listarMesas);
router.post("/", verifyAdmin, mesasCtrl.crearMesa);
router.put("/:id", verifyAdmin, mesasCtrl.actualizarMesa);
router.delete("/:id", verifyAdmin, mesasCtrl.eliminarMesa);

module.exports = router;