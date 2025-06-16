const db = require("../config/db");

exports.getLeaderboard = (req, res) => {
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.profile_picture, 
      COUNT(c.id) AS courseCount,
      SUM(c.distance) AS totalDistance
    FROM users u
    JOIN courses c ON u.id = c.user_id
    GROUP BY u.id
    ORDER BY totalDistance DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur SQL leaderboard :", err);
      return res.status(500).json({ message: "Erreur serveur", err });
    }

    res.json(results);
  });
};
