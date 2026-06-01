const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const protect = require("../middleware/authMiddleware");

// @desc    Get leaderboard stats
// @route   GET /api/leaderboard
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({}).select(
      "username currentLevel codeforcesHandle leetcodeHandle createdAt"
    );
    const progressList = await UserProgress.find({});
    const performances = await TopicPerformance.find({});

    const leaderboardData = users.map((user) => {
      const progress = progressList.find(
        (p) => p.userId.toString() === user._id.toString()
      );
      const userPerfs = performances.filter(
        (p) => p.userId.toString() === user._id.toString()
      );

      const solvedCount = progress ? progress.solvedProblems.length : 0;

      // Find max rating or platform rating if synced
      // If we don't have direct rating, we can calculate a mock points score: solvedCount * 10
      let maxRating = 0;
      
      // Let's compute rating as CF rating + LC rating, or max of them
      // We will look up CF and LC performance records to aggregate if available,
      // or we can calculate a score based on solved count & mastery
      let totalMastery = 0;
      if (progress && progress.mastery) {
        for (const [subtopic, score] of progress.mastery.entries()) {
          totalMastery += score;
        }
      }

      // Calculate streak: if they solved a problem within the last 2 days, count it as a streak.
      // We can use a simple active streak formula
      let streak = 0;
      if (progress && progress.lastActivityDate) {
        const diffTime = Math.abs(Date.now() - new Date(progress.lastActivityDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          // Mock streak based on activity date and problem count to keep it fun and gamified
          streak = Math.max(1, (solvedCount % 7) + 1); 
        }
      }

      return {
        _id: user._id,
        username: user.username,
        currentLevel: user.currentLevel,
        codeforcesHandle: user.codeforcesHandle,
        leetcodeHandle: user.leetcodeHandle,
        solvedCount,
        score: Math.round(solvedCount * 100 + totalMastery),
        streak,
        createdAt: user.createdAt
      };
    });

    // Default sort by score descending
    leaderboardData.sort((a, b) => b.score - a.score);

    res.json(leaderboardData);
  } catch (error) {
    console.error("Leaderboard error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
