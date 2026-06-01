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
      "username name currentLevel codeforcesHandle leetcodeHandle codechefHandle gfgHandle hackerrankHandle codingNinjasHandle hackerEarthHandle branch batch college usn createdAt"
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

      let totalMastery = 0;
      if (progress && progress.mastery) {
        for (const [subtopic, score] of progress.mastery.entries()) {
          totalMastery += score;
        }
      }

      let streak = 0;
      if (progress && progress.lastActivityDate) {
        const diffTime = Math.abs(Date.now() - new Date(progress.lastActivityDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          streak = Math.max(1, (solvedCount % 7) + 1); 
        }
      }

      return {
        _id: user._id,
        username: user.username,
        name: user.name || "",
        currentLevel: user.currentLevel,
        codeforcesHandle: user.codeforcesHandle || "",
        leetcodeHandle: user.leetcodeHandle || "",
        codechefHandle: user.codechefHandle || "",
        gfgHandle: user.gfgHandle || "",
        hackerrankHandle: user.hackerrankHandle || "",
        codingNinjasHandle: user.codingNinjasHandle || "",
        hackerEarthHandle: user.hackerEarthHandle || "",
        branch: user.branch || "",
        batch: user.batch || "",
        college: user.college || "",
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
