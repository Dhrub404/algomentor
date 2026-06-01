const express = require("express");
const router = express.Router();
const { getUpcomingContests, getUserContestHistory } = require("../controllers/contestController");
const protect = require("../middleware/authMiddleware");

router.get("/upcoming", protect, getUpcomingContests);
router.get("/history/:userId", protect, getUserContestHistory);

module.exports = router;
