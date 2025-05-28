const db = require("../config/db");

// POST /courses
exports.addCourse = (req, res) => {
  const { distance, duration, start_time } = req.body;
  const user_id = req.user.id;

  if (!distance || !duration || !start_time)
    return res.status(400).json({ message: "Champs requis" });

  db.query(
    "INSERT INTO courses (user_id, distance, duration, start_time) VALUES (?, ?, ?, ?)",
    [user_id, distance, duration, start_time],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.status(201).json({ message: "Course ajoutée", courseId: result.insertId });
    }
  );
};

// GET /courses
exports.getUserCourses = (req, res) => {
  const user_id = req.user.id;

  db.query(
    "SELECT * FROM courses WHERE user_id = ? ORDER BY start_time DESC",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.json(results);
    }
  );
};

// GET /courses/:id
exports.getCourseById = (req, res) => {
  const courseId = req.params.id;
  const user_id = req.user.id;

  db.query(
    "SELECT * FROM courses WHERE id = ? AND user_id = ?",
    [courseId, user_id],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "Course non trouvée" });
      res.json(results[0]);
    }
  );
};

// DELETE /courses/:id
exports.deleteCourse = (req, res) => {
  const courseId = req.params.id;
  const user_id = req.user.id;

  db.query(
    "DELETE FROM courses WHERE id = ? AND user_id = ?",
    [courseId, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.json({ message: "Course supprimée" });
    }
  );
};
