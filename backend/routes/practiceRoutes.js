const express = require("express");
const router = express.Router();
const { getDailyPracticeSheet } = require("../controllers/practiceController");
const protect = require("../middleware/authMiddleware");

router.get("/daily/:userId", protect, getDailyPracticeSheet);

module.exports = router;
