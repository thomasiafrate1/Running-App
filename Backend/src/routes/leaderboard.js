const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route protégée par token
router.get("/", authMiddleware, getLeaderboard);

module.exports = router;
