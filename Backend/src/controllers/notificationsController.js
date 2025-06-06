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
exports.createNotification = (req, res) => {
  const { title, message } = req.body;

  db.query(
    "INSERT INTO notifications (title, message, date) VALUES (?, ?, NOW())",
    [title, message],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.status(201).json({ message: "Notification créée" });
    }
  );
};

exports.deleteNotification = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM notifications WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json({ message: "Notification supprimée" });
  });
};

exports.updateNotification = (req, res) => {
  const { id } = req.params;
  const { title, message } = req.body;

  db.query(
    "UPDATE notifications SET title = ?, message = ? WHERE id = ?",
    [title, message, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.json({ message: "Notification mise à jour" });
    }
  );
};
