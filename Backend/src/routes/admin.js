const express = require("express");
const router = express.Router();
const { loginAdmin , getAllCourses, getLoginHistory ,getOneUser,updateUser, getStats,getAdminStats, getTopUsers, getAllUsers, getUserCourses, updateUserRole, deleteUser } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const {getNotifications,
  createNotification,
  deleteNotification,
  updateNotification} = require("../controllers/notificationsController")
  const { getLeaderboard } = require("../controllers/leaderboardController");

router.post("/login", loginAdmin);
router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/users/:id/courses", getUserCourses);
router.put("/users/:id/role", updateUserRole);
router.get("/stats", authMiddleware, getAdminStats)
router.get("/courses", authMiddleware, getAllCourses);;
router.get("/top-users", authMiddleware, getTopUsers);
router.put("/users/:id", authMiddleware, updateUser);
router.get("/users/:id", authMiddleware, getOneUser);
router.get("/logins", authMiddleware, getLoginHistory);
router.get("/notifications", authMiddleware, getNotifications);
router.post("/notifications", authMiddleware, createNotification);
router.delete("/notifications/:id", authMiddleware, deleteNotification);
router.put("/notifications/:id", authMiddleware, updateNotification);
router.get("/leaderboard", authMiddleware, getLeaderboard);




module.exports = router;
