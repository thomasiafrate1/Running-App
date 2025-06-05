// backend/routes/adminGoals.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

// GET all goal templates
router.get("/templates", authMiddleware, (req, res) => {
  db.query("SELECT * FROM goal_templates ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur DB" });
    res.json(results);
  });
});

// POST new goal template
router.post("/templates", authMiddleware, (req, res) => {
  const { type, value, unit } = req.body;
  if (!type || !value) return res.status(400).json({ message: "Champs requis" });

  db.query(
    "INSERT INTO goal_templates (type, value, unit) VALUES (?, ?, ?)",
    [type, value, unit || "km"],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.status(201).json({ message: "Modèle ajouté", id: result.insertId });
    }
  );
});

module.exports = router;
