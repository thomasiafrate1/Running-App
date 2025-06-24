const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../config/db");

dotenv.config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    db.query("SELECT id, email FROM users WHERE id = ?", [userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      req.user = results[0]; 
      next();
    });
  } catch (err) {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
}

module.exports = authMiddleware;
