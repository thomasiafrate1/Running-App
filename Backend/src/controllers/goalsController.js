const db = require("../config/db");

exports.getOrCreateDailyGoal = (req, res) => {
  const user_id = req.user.id;
  const today = new Date().toISOString().split("T")[0];

  // Vérifie s'il y a un objectif pour aujourd'hui
  db.query(
    "SELECT * FROM daily_goals WHERE user_id = ? AND date = ?",
    [user_id, today],
    (err, goalResults) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });

      if (goalResults.length > 0) {
        const goal = goalResults[0];

        // Si déjà marqué comme accompli, on retourne tel quel
        if (goal.completed) return res.json(goal);

        // Sinon, on vérifie la progression du jour
        checkGoalCompletion(user_id, goal, res);
      } else {
        // Pas encore d'objectif : tirer aléatoirement
        db.query(
          "SELECT * FROM goal_templates WHERE active = 1 ORDER BY RAND() LIMIT 1",
          (err, templateResults) => {
            if (err || templateResults.length === 0) {
              return res.status(500).json({ message: "Aucun objectif disponible", err });
            }

            const template = templateResults[0];
            const label = `${template.type} ${template.value} ${template.unit}`;

            db.query(
              "INSERT INTO daily_goals (user_id, date, label, completed) VALUES (?, ?, ?, false)",
              [user_id, today, label],
              (err) => {
                if (err) return res.status(500).json({ message: "Erreur insertion", err });

                // Crée un faux objectif pour vérifier si accompli
                const goal = { label, completed: false };
                checkGoalCompletion(user_id, goal, res);
              }
            );
          }
        );
      }
    }
  );
};

// Fonction qui check si la distance du jour valide le goal
function checkGoalCompletion(user_id, goal, res) {
  const today = new Date().toISOString().split("T")[0];

  db.query(
    "SELECT SUM(distance) AS total_distance FROM courses WHERE user_id = ? AND DATE(start_time) = ?",
    [user_id, today],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });

      const totalDistance = result[0].total_distance || 0;

      // On check la valeur attendue depuis le label
      const regex = /(\d+(?:\.\d+)?)/; // extrait un chiffre du label
      const match = goal.label.match(regex);
      const expected = match ? parseFloat(match[1]) : 9999;

      const isComplete = totalDistance >= expected;

      // Met à jour la BDD si besoin
      if (isComplete && !goal.completed) {
        db.query(
          "UPDATE daily_goals SET completed = true WHERE user_id = ? AND date = ?",
          [user_id, today],
          () => {
            return res.json({ ...goal, completed: true });
          }
        );
      } else {
        return res.json({ ...goal, completed: isComplete });
      }
    }
  );
}


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
      if (err) {
        console.error("❌ Erreur SQL dans getGoalHistory:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.json(results);
    }
  );
};


