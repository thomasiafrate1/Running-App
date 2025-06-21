const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { sendVerificationEmail } = require("../services/mailServices");

exports.registerUser = async (req, res) => {
  const { email, password, username, profile_picture } = req.body;

  if (!email || !password || !username)
    return res.status(400).json({ message: "Champs requis" });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  db.query(
    "INSERT INTO users (email, password, username, profile_picture, email_verification_token) VALUES (?, ?, ?, ?, ?)",
    [email, hashedPassword, username, profile_picture || null, token],
    async (err, result) => {
      if (err) {
        console.error("Erreur lors de l'inscription :", err);
        return res.status(500).json({ message: "Erreur serveur", err });
      }

      const verifyUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

      try {
        await sendVerificationEmail(email, username, qrCodeDataUrl, verifyUrl);

      } catch (e) {
        console.error("Erreur envoi mail :", e);
      }

      res.status(201).json({ message: "Utilisateur inscrit. Vérifiez votre email." });
    }
  );
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: "Email invalide" });

    const user = results[0];
    const valid = bcrypt.compareSync(password, user.password);

    if (!valid) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    if (!user.verified) {
  return res.status(403).json({ message: "Veuillez vérifier votre email avant de vous connecter." });
}


    res.json({
  message: "Connexion réussie",
  token,
  user: {
    id: user.id,
    email: user.email,
    username: user.username,
    profile_picture: user.profile_picture,
    role: user.role
  }
});

  });
};

exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: "Email invalide" });

    const user = results[0];

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé : pas admin" });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // ✅ ICI : l'IP est disponible car on est dans la fonction
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    db.query(
      "INSERT INTO logins (user_id, ip_address) VALUES (?, ?)",
      [user.id, ip],
      (err) => {
        if (err) console.error("Erreur insertion login:", err);
      }
    );

    res.json({
  message: "Connexion réussie",
  token,
  user: {
    id: user.id,
    email: user.email,
    username: user.username,
    profile_picture: user.profile_picture,
    role: user.role
  }
});

  });
};


exports.getStats = (req, res) => {
  const queries = {
    totalUsers: "SELECT COUNT(*) AS total FROM users",
    totalCourses: "SELECT COUNT(*) AS total FROM courses",
    avgDistance: "SELECT AVG(distance) AS average FROM courses",
    avgDuration: "SELECT AVG(duration) AS average FROM courses"
  };

  let results = {};

  db.query(queries.totalUsers, (err, rows) => {
    if (err) return res.status(500).json({ message: "Erreur totalUsers" });

    results.totalUsers = rows[0].total;

    db.query(queries.totalCourses, (err, rows) => {
      if (err) return res.status(500).json({ message: "Erreur totalCourses" });

      results.totalCourses = rows[0].total;

      db.query(queries.avgDistance, (err, rows) => {
        if (err) return res.status(500).json({ message: "Erreur avgDistance" });

        results.avgDistance = rows[0].average || 0;

        db.query(queries.avgDuration, (err, rows) => {
          if (err) return res.status(500).json({ message: "Erreur avgDuration" });

          results.avgDuration = rows[0].average || 0;

          res.json(results);
        });
      });
    });
  });
};


exports.getAllUsers = (req, res) => {
  db.query("SELECT id, email, role FROM users", (err, rows) => {
    if (err) return res.status(500).json({ message: "Erreur récupération utilisateurs" });
    res.json(rows);
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur suppression" });
    res.json({ message: "Utilisateur supprimé" });
  });
};

exports.getUserCourses = (req, res) => {
  const userId = req.params.id;
  db.query(
    "SELECT id, distance, duration, start_time, avg_speed FROM courses WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Erreur récupération courses" });
      res.json(rows);
    }
  );
};

exports.updateUserRole = (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur update rôle" });
    res.json({ message: "Rôle mis à jour" });
  });
};

exports.getAdminStats = (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, users) => {
    if (err) return res.status(500).json({ message: "Erreur utilisateurs" });
    stats.totalUsers = users[0].totalUsers;

    db.query("SELECT COUNT(*) AS totalCourses, AVG(distance) AS avgDistance, AVG(duration) AS avgDuration FROM courses", (err, courses) => {
      if (err) return res.status(500).json({ message: "Erreur courses" });
      stats.totalCourses = courses[0].totalCourses;
      stats.avgDistance = courses[0].avgDistance || 0;
      stats.avgDuration = courses[0].avgDuration || 0;

      db.query("SELECT COUNT(*) AS totalGoals FROM daily_goals", (err, goals) => {
        if (err) return res.status(500).json({ message: "Erreur goals" });
        stats.totalGoals = goals[0].totalGoals;

        db.query("SELECT COUNT(*) AS completedGoals FROM daily_goals WHERE completed = 1", (err, completed) => {
          if (err) return res.status(500).json({ message: "Erreur completed goals" });
          stats.completedGoals = completed[0].completedGoals;
          stats.successRate = stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0;

          res.json(stats);
        });
      });
    });
  });
};

exports.getTopUsers = (req, res) => {
  db.query(
    `SELECT users.email, COUNT(courses.id) AS courseCount
     FROM users
     LEFT JOIN courses ON users.id = courses.user_id
     GROUP BY users.id
     ORDER BY courseCount DESC
     LIMIT 5`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur top users" });
      res.json(results);
    }
  );
};


exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { email, role, username, profile_picture } = req.body;


  const fields = [];
  const values = [];

  if (email) {
    fields.push("email = ?");
    values.push(email);
  }

  if (role) {
    fields.push("role = ?");
    values.push(role);
  }

  if (username) {
  fields.push("username = ?");
  values.push(username);
}

if (profile_picture) {
  fields.push("profile_picture = ?");
  values.push(profile_picture);
}


  if (fields.length === 0) {
    return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
  }

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json({ message: "Utilisateur mis à jour" });
  });
};


exports.getOneUser = (req, res) => {
  const { id } = req.params;

  db.query("SELECT id, email, role, username, profile_picture FROM users WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(results[0]);
  });
};


exports.getAllCourses = (req, res) => {
  const query = `
    SELECT courses.*, users.email
    FROM courses
    LEFT JOIN users ON courses.user_id = users.id
    ORDER BY courses.start_time DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur DB", err });
    res.json(results);
  });
};




exports.getLoginHistory = (req, res) => {
  const query = `
    SELECT l.id, u.email, l.ip_address, l.created_at
    FROM logins l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 100
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(results);
  });
};


exports.verifyEmail = (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Lien invalide.");
  }

  db.query(
    "SELECT * FROM users WHERE email_verification_token = ?",
    [token],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).send("Token invalide ou expiré.");
      }

      const user = results[0];

      db.query(
        "UPDATE users SET verified = true, email_verification_token = NULL WHERE id = ?",
        [user.id],
        (err) => {
          if (err) return res.status(500).send("Erreur serveur.");
          res.send("✅ Email vérifié ! Vous pouvez maintenant vous connecter.");
        }
      );
    }
  );
};



exports.getMe = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, email, username, profile_picture FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.json({ user: results[0] });
    }
  );
};
