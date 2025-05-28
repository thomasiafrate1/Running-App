const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Champs requis" });

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", err });
      res.status(201).json({ message: "Utilisateur inscrit" });
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

    res.json({ message: "Connexion réussie", token });
  });
};
