const mongoose = require("mongoose");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const ProblemMapping = require("../models/ProblemMapping");
const TopicPerformance = require("../models/TopicPerformance");
const { generateDailyPractice } = require("../engines/practiceEngine");
const { runRevisionCheck } = require("../engines/revisionEngine");
const protect = require("../middleware/authMiddleware");

// Load dashboardController dynamically to ensure its prototype monkeypatch runs
require("./dashboardController");

// Define DailyPractice schema and model dynamically
const DailyPracticeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  problems: [{
    _id: { type: mongoose.Schema.Types.ObjectId },
    title: String,
    difficulty: String,
    platform: String,
    url: String,
    subtopic: String,
    topic: String,
    reason: String
  }],
  completedProblems: [{ type: mongoose.Schema.Types.ObjectId }]
});

const DailyPractice = mongoose.models.DailyPractice || mongoose.model("DailyPractice", DailyPracticeSchema);

// Helper to get local date string YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

    const today = getTodayDateString();

    // Check if daily practice already generated in cache today
    let dailyPractice = await DailyPractice.findOne({ userId, date: today });
    if (!dailyPractice) {
      const generatedProblems = await generateDailyPractice(user, progress);
      dailyPractice = new DailyPractice({
        userId,
        date: today,
        problems: generatedProblems,
        completedProblems: []
      });
      await dailyPractice.save();
    }

    // Run revision checks
    const revisionAlerts = await runRevisionCheck(user._id, user.studiedTopics);

    res.json({
      problems: dailyPractice.problems,
      completedProblems: dailyPractice.completedProblems,
      revisionAlerts
    });
  } catch (error) {
    console.error("Practice sheet generation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark a daily practice problem as completed
// @route   POST /api/practice/complete
// @access  Private
const completeDailyProblem = async (req, res) => {
  const { problemId } = req.body;
  const userId = req.user.id;

  if (!problemId) {
    return res.status(400).json({ message: "Problem ID is required" });
  }

  try {
    const today = getTodayDateString();
    let dailyPractice = await DailyPractice.findOne({ userId, date: today });
    if (dailyPractice) {
      const pId = new mongoose.Types.ObjectId(problemId);
      const isAlreadyCompleted = dailyPractice.completedProblems.some(id => id.toString() === problemId.toString());
      if (!isAlreadyCompleted) {
        dailyPractice.completedProblems.push(pId);
        await dailyPractice.save();
      }
    }

    // Find the problem details
    let problem = await ProblemMapping.findById(problemId);
    if (!problem && dailyPractice) {
      problem = dailyPractice.problems.find(p => p._id.toString() === problemId.toString());
    }

    if (!problem) {
      return res.status(404).json({ message: "Problem mapping not found" });
    }

    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({
        userId,
        unlockedSubtopics: [],
        completedSubtopics: [],
        mastery: {}
      });
    }

    // Add to solved problems list
    const solvedSet = new Set(progress.solvedProblems.map(id => id.toString()));
    if (!solvedSet.has(problem._id.toString())) {
      progress.solvedProblems.push(problem._id);
    }

    // Update TopicPerformance for the subtopic
    let performance = await TopicPerformance.findOne({
      userId,
      subtopic: problem.subtopic
    });

    if (!performance) {
      performance = new TopicPerformance({
        userId,
        subtopic: problem.subtopic,
        topic: problem.topic || "DSA",
        platform: problem.platform
      });
    }

    performance.totalSolved += 1;
    performance.totalAttempted += 1;
    performance.lastPracticed = new Date();

    const { calculatePerformanceScores } = require("../engines/weaknessEngine");
    const scores = calculatePerformanceScores(performance, problem.difficulty);
    performance.accuracy = scores.accuracy;
    performance.consistencyScore = scores.consistencyScore;
    performance.difficultyWeight = scores.difficultyWeight;
    performance.masteryScore = scores.masteryScore;
    performance.weaknessScore = scores.weaknessScore;

    await performance.save();

    // Update progress mastery Map
    progress.mastery.set(problem.subtopic, scores.masteryScore);
    progress.lastActivityDate = new Date();
    await progress.save();

    res.json({
      message: "Daily practice problem marked completed successfully!",
      progress,
      performance
    });
  } catch (error) {
    console.error("Complete daily problem error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Dynamic Router Injection:
// Register the POST /complete route under the practiceRoutes router.
process.nextTick(() => {
  try {
    const routePath = require.resolve("../routes/practiceRoutes");
    const cached = require.cache[routePath];
    if (cached && cached.exports) {
      const router = cached.exports;
      router.post("/complete", protect, completeDailyProblem);
      console.log("Successfully injected practice route [/complete] dynamically.");
    } else {
      console.warn("Could not find cached practiceRoutes.js module to inject complete route.");
    }
  } catch (err) {
    console.error("Error during dynamic route injection in practiceController:", err);
  }
});

module.exports = {
  getDailyPracticeSheet,
  completeDailyProblem
};
