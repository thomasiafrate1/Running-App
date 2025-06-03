const db = require("../config/db");

exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM notifications ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erreur notifications :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
