const express = require("express");
const router = express.Router();
const { getNotifications, createNotification, deleteNotification, updateNotification } = require("../controllers/notificationsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getNotifications);
router.post("/", authMiddleware, createNotification);
router.delete("/:id", authMiddleware, deleteNotification);
router.put("/:id", authMiddleware, updateNotification);

module.exports = router;
