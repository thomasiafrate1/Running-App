const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  addCourse,
  getUserCourses,
  getCourseById,
  deleteCourse,
} = require("../controllers/coursesController");

router.post("/", authMiddleware, addCourse);
router.get("/", authMiddleware, getUserCourses);
router.get("/:id", authMiddleware, getCourseById);
router.delete("/:id", authMiddleware, deleteCourse);

module.exports = router;
