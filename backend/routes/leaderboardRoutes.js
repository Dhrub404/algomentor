const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");
const protect = require("../middleware/authMiddleware");

// @desc    Get leaderboard stats
// @route   GET /api/leaderboard
// @access  Private
router.get("/", protect, getLeaderboard);

module.exports = router;
