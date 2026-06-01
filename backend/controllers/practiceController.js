const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const { generateDailyPractice } = require("../engines/practiceEngine");
const { runRevisionCheck } = require("../engines/revisionEngine");

// @desc    Get daily personalized practice sheet
// @route   GET /api/practice/daily/:userId
// @access  Private
const getDailyPracticeSheet = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      return res.json({
        problems: [],
        revisionAlerts: [],
        message: "No progress found. Please onboard first."
      });
    }

    // 1. Generate problems
    const problems = await generateDailyPractice(user, progress);

    // 2. Check for revision alerts
    const revisionAlerts = await runRevisionCheck(user._id, user.studiedTopics);

    res.json({
      problems,
      revisionAlerts
    });
  } catch (error) {
    console.error("Practice sheet generation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDailyPracticeSheet };
