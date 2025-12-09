const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "Token faltante" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token inválido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token expirado o inválido" });
    req.user = user;
    next();
  });
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.rol !== "admin") return res.status(403).json({ message: "No autorizado" });
    next();
  });
}

module.exports = { verifyToken, verifyAdmin };
