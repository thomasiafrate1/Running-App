// routes/feedback.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const { content, rating } = req.body;

if (!content || !rating || rating < 1 || rating > 5) {
  return res.status(400).json({ message: "Contenu ou note invalide." });
}

db.query(
  "INSERT INTO feedbacks (user_id, content, rating) VALUES (?, ?, ?)",
  [userId, content, rating],
  (err) => {
    if (err) {
      console.error("Erreur ajout feedback :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }

    res.status(201).json({ message: "Avis envoyé avec succès." });
  }
);

});

module.exports = router;
