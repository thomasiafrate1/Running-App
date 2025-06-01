const express = require("express");
const router = express.Router();
const goalsController = require("../controllers/goalsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/daily", authMiddleware, goalsController.getOrCreateDailyGoal);
router.post("/complete", authMiddleware, goalsController.markGoalAsCompleted);
router.get("/history", authMiddleware, goalsController.getGoalHistory);

module.exports = router;
