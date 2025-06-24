const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUser, verifyEmail, getMe, changeEmail, changePassword, deleteAccount, verifyNewEmail } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", authMiddleware, changePassword);
router.put("/change-email", authMiddleware, changeEmail);
router.delete("/delete-account", authMiddleware, deleteAccount);



router.put("/:id", authMiddleware, updateUser);
router.get("/me", authMiddleware, getMe);

router.get("/verify-email", verifyEmail);
router.get("/verify-new-email", verifyNewEmail); // ✅




module.exports = router;
