const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserProfile, connectPlatform } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

router.get("/profile", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);
router.post("/connect-platform", protect, connectPlatform);

module.exports = router;
