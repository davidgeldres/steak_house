const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user.controller");
const { verifyAdmin } = require("../middleware/auth.middleware");

router.get("/", verifyAdmin, userCtrl.listarUsuarios);
router.get("/:id", verifyAdmin, userCtrl.obtenerUsuario);

module.exports = router;