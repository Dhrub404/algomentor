const User = require("../models/User");
const UserProgress = require("../models/UserProgress");

const calculateTotalScore = (user, progress, scores) => {
  const leetcodeScore = scores.leetcodeScore || 0;
  const codeforcesScore = scores.codeforcesScore || 0;
  const codechefScore = scores.codechefScore || 0;
  const gfgScore = scores.gfgScore || 0;

  // masteryAverage calculation
  let masterySum = 0;
  let masteryCount = 0;
  if (progress && progress.mastery) {
    const masteryEntries = typeof progress.mastery.values === "function"
      ? Array.from(progress.mastery.values())
      : Object.values(progress.mastery);
    
    masteryEntries.forEach((score) => {
      masterySum += score;
      masteryCount++;
    });
  }
  const masteryAverage = masteryCount > 0 ? (masterySum / masteryCount) : 0;

  // Individual components capped at 100
  const leetcodeComp = Math.min(100, Math.max(0, (leetcodeScore / 3100) * 100));
  const codeforcesComp = Math.min(100, Math.max(0, codeforcesScore / 10));
  const codechefComp = Math.min(100, Math.max(0, codechefScore / 20));
  const gfgComp = Math.min(100, Math.max(0, (gfgScore / 2000) * 100));
  const masteryComp = Math.min(100, Math.max(0, masteryAverage));

  const totalScore = (
    (leetcodeComp * 0.25) +
    (codeforcesComp * 0.25) +
    (codechefComp * 0.20) +
    (gfgComp * 0.15) +
    (masteryComp * 0.15)
  );

  return Math.round(totalScore * 100) / 100;
};

// @desc    Get leaderboard stats
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).select("+platformStats");
    const progressList = await UserProgress.find({});

    const leaderboardData = users.map((user) => {
      const progress = progressList.find(
        (p) => p.userId.toString() === user._id.toString()
      );

      // Read from UserProgress platformStats Map (real-time synced) first, and fallback to User platformStats
      const getPlatformStats = (platformKey) => {
        if (progress && progress.platformStats) {
          const stats = typeof progress.platformStats.get === "function"
            ? progress.platformStats.get(platformKey)
            : progress.platformStats[platformKey];
          if (stats && !stats.error) {
            return stats;
          }
        }
        return user.platformStats?.[platformKey === "geeksforgeeks" ? "gfg" : platformKey];
      };

      const lc = getPlatformStats("leetcode");
      const cf = getPlatformStats("codeforces");
      const cc = getPlatformStats("codechef");
      const gfg = getPlatformStats("geeksforgeeks");

      const leetcodeScore = lc ? (lc.solved ?? lc.stats?.solved ?? null) : null;
      const codeforcesScore = cf ? (cf.rating ?? cf.stats?.rating ?? null) : null;
      const codechefScore = cc ? (cc.rating ?? cc.stats?.rating ?? null) : null;
      const gfgScore = gfg ? (gfg.score ?? gfg.stats?.score ?? gfg.stats?.codingScore ?? null) : null;

      const scores = { leetcodeScore, codeforcesScore, codechefScore, gfgScore };
      const totalScore = calculateTotalScore(user, progress, scores);

      return {
        _id: user._id,
        username: user.username,
        college: user.college,
        branch: user.branch,
        batch: user.batch,
        avatar: user.avatar,
        totalScore,
        score: totalScore, // For backwards compatibility
        finalScore: totalScore, // For backwards compatibility

        // READ ONLY - display raw platform stats exactly as stored
        leetcodeScore,
        codeforcesScore,
        codechefScore,
        gfgScore,

        streak: user.streak || 0
      };
    });

    // Default sort by totalScore descending
    leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

    res.json(leaderboardData);
  } catch (error) {
    console.error("Leaderboard error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getLeaderboard,
  calculateTotalScore
};
