const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const db = require("../config/db");

// Get likes count & if user liked
router.get("/:id/likes", auth, (req, res) => {
  const user_id = req.user.id;
  const course_id = req.params.id;

  db.query("SELECT COUNT(*) AS count FROM likes WHERE course_id = ?", [course_id], (err, rows) => {
    if (err) return res.status(500).json({ err });
    const count = rows[0].count;

    db.query("SELECT * FROM likes WHERE user_id = ? AND course_id = ?", [user_id, course_id], (err, rows2) => {
      if (err) return res.status(500).json({ err });
      res.json({ count, liked: rows2.length > 0 });
    });
  });
});

// Like/unlike a course
router.post("/:id/like", auth, (req, res) => {
  const user_id = req.user.id;
  const course_id = req.params.id;

  db.query("SELECT * FROM likes WHERE user_id = ? AND course_id = ?", [user_id, course_id], (err, rows) => {
    if (err) return res.status(500).json({ err });

    if (rows.length > 0) {
      db.query("DELETE FROM likes WHERE user_id = ? AND course_id = ?", [user_id, course_id], () => {
        res.json({ message: "Unliked" });
      });
    } else {
      db.query("INSERT INTO likes (user_id, course_id) VALUES (?, ?)", [user_id, course_id], () => {
        res.json({ message: "Liked" });
      });
    }
  });
});

// Get comments
router.get("/:id/comments", (req, res) => {
  const course_id = req.params.id;
  db.query(
    `SELECT c.*, u.username FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.course_id = ? ORDER BY c.created_at DESC`,
    [course_id],
    (err, rows) => {
      if (err) return res.status(500).json({ err });
      res.json(rows);
    }
  );
});

// Post comment
router.post("/:id/comments", auth, (req, res) => {
  const course_id = req.params.id;
  const user_id = req.user.id;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Commentaire vide" });
  }

  db.query("INSERT INTO comments (user_id, course_id, content) VALUES (?, ?, ?)", [user_id, course_id, content], (err) => {
    if (err) return res.status(500).json({ err });
    res.status(201).json({ message: "Commentaire ajouté" });
  });
});

// Get all comments
router.get("/comments", auth, (req, res) => {
  db.query(
    `SELECT c.*, u.username 
     FROM comments c 
     JOIN users u ON c.user_id = u.id 
     ORDER BY c.created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ err });
      res.json(rows);
    }
  );
});

// Delete comment
router.delete("/comments/:id", auth, (req, res) => {
  db.query("DELETE FROM comments WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ err });
    res.json({ message: "Supprimé" });
  });
});

// Update comment
router.put("/comments/:id", auth, (req, res) => {
  const { content } = req.body;
  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Contenu vide" });
  }

  db.query("UPDATE comments SET content = ? WHERE id = ?", [content, req.params.id], (err) => {
    if (err) return res.status(500).json({ err });
    res.json({ message: "Mis à jour" });
  });
});


module.exports = router;