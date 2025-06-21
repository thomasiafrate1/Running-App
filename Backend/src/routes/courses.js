const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  addCourse,
  getUserCourses,
  getCourseById,
  deleteCourse,
  getAllCourses,
  getCoursesByUserId,
  getRecentCourses,
  getPublicCourseById,
  getUserStats,
  getWeeklyStats
} = require("../controllers/coursesController");

router.post("/", authMiddleware, addCourse);
router.get("/", authMiddleware, getUserCourses);
router.get("/all", getAllCourses);
router.get("/stats", authMiddleware, getUserStats);

router.get("/user/:id", getCoursesByUserId);
router.get("/recent", getRecentCourses);
router.get("/public/:id", getPublicCourseById);
router.get("/:id", authMiddleware, getCourseById);
router.delete("/:id", authMiddleware, deleteCourse);
router.get("/weekly-stats", authMiddleware, getWeeklyStats);





module.exports = router;
