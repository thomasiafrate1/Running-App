const db = require("../config/db");

exports.getOrCreateDailyGoal = (req, res) => {
  const user_id = req.user.id;
  const today = new Date().toISOString().split("T")[0];

  db.query(
    "SELECT * FROM daily_goals WHERE user_id = ? AND date = ?",
    [user_id, today],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });

      if (results.length > 0) {
        return res.json(results[0]);
      }

      // Objectif par défaut
      const label = "Courir au moins 2 km";
      db.query(
        "INSERT INTO daily_goals (user_id, date, label, completed) VALUES (?, ?, ?, false)",
        [user_id, today, label],
        (err) => {
          if (err) return res.status(500).json({ message: "Erreur insertion" });
          res.json({ user_id, date: today, label, completed: false });
        }
      );
    }
  );
};

exports.markGoalAsCompleted = (req, res) => {
  const user_id = req.user.id;
  const today = new Date().toISOString().split("T")[0];

  db.query(
    "UPDATE daily_goals SET completed = true WHERE user_id = ? AND date = ?",
    [user_id, today],
    (err) => {
      if (err) return res.status(500).json({ message: "Erreur update" });
      res.json({ success: true });
    }
  );
};

exports.getGoalHistory = (req, res) => {
  const user_id = req.user.id;

  db.query(
    "SELECT * FROM daily_goals WHERE user_id = ? ORDER BY date DESC",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json(results);
    }
  );
};
