const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, notificationsController.getNotifications);

module.exports = router;
