const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUser, verifyEmail, getMe } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/:id", authMiddleware, updateUser);
router.get("/me", authMiddleware, getMe);

router.get("/verify-email", verifyEmail);




module.exports = router;
