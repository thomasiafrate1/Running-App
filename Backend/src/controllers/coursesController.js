const db = require("../config/db");

// POST /courses
exports.addCourse = (req, res) => {
  const { distance, duration, start_time, path, avg_speed } = req.body;
  const user_id = req.user.id;

  console.log("📦 Données reçues pour nouvelle course :", {
    distance,
    duration,
    start_time,
    path,
    
  });

  if (!distance || !duration || !start_time)
    return res.status(400).json({ message: "Champs requis" });

  db.query(
    "INSERT INTO courses (user_id, distance, duration, start_time, path, avg_speed) VALUES (?, ?, ?, ?, ?, ?)",
    [user_id, distance, duration, start_time, JSON.stringify(path), avg_speed],
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
    `SELECT 
  c.*, 
  (SELECT COUNT(*) FROM likes l WHERE l.course_id = c.id) AS likeCount,
  (SELECT COUNT(*) FROM comments cm WHERE cm.course_id = c.id) AS commentCount
FROM courses c
WHERE c.user_id = ?
ORDER BY c.start_time DESC`,

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

// GET /courses/all
exports.getAllCourses = (req, res) => {
  db.query(
    "SELECT * FROM courses ORDER BY start_time DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.json(results);
    }
  );
};


// GET /courses/user/:id
exports.getCoursesByUserId = (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT * FROM courses WHERE user_id = ? ORDER BY start_time DESC",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });

      if (results.length === 0) {
        return res.status(404).json({ message: "Aucune course trouvée pour cet utilisateur" });
      }

      res.json(results);
    }
  );
};

// GET /courses/recent
exports.getRecentCourses = (req, res) => {
  db.query(
    `SELECT 
  c.*, 
  u.email, 
  u.profile_picture,
  (SELECT COUNT(*) FROM likes l WHERE l.course_id = c.id) AS likeCount,
  (SELECT COUNT(*) FROM comments cm WHERE cm.course_id = c.id) AS commentCount
FROM courses c 
JOIN users u ON c.user_id = u.id 
ORDER BY c.start_time DESC 
LIMIT 15
`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.json(results);
    }
  );
};

// GET /courses/public/:id
exports.getPublicCourseById = (req, res) => {
  const courseId = req.params.id;

  db.query(
    `SELECT c.*, u.email, u.profile_picture 
     FROM courses c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`,
    [courseId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });

      if (results.length === 0) {
        return res.status(404).json({ message: "Course non trouvée" });
      }

      res.json(results[0]);
    }
  );
};

// GET /courses/stats
exports.getUserStats = (req, res) => {
  const user_id = req.user.id;

  db.query(
    `SELECT 
      COUNT(*) AS totalCourses, 
      SUM(distance) AS totalDistance, 
      SUM(duration) AS totalDuration,
      AVG(avg_speed) AS avgSpeed
     FROM courses 
     WHERE user_id = ?`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.json(results[0]);
    }
  );
};

exports.getWeeklyStats = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT 
      DATE(start_time) AS date, 
      SUM(distance) AS total_distance 
    FROM courses 
    WHERE user_id = ? 
      AND start_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(start_time)
    ORDER BY date ASC
    `,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Erreur weekly stats :", err);
        return res.status(500).json({ message: "Erreur serveur", err });
      }

      res.json(results);
    }
  );
};


