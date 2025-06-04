const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUser } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/:id", authMiddleware, updateUser);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "Bienvenue 👋", user: req.user });
  
});



module.exports = router;
