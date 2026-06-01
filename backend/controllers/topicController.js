const Topic = require("../models/Topic");
const ProblemMapping = require("../models/ProblemMapping");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const User = require("../models/User");

// Dynamically patch 'gfg' platform enums to avoid validation errors
if (ProblemMapping.schema && ProblemMapping.schema.path) {
  const platformPath = ProblemMapping.schema.path("platform");
  if (platformPath && platformPath.enumValues && !platformPath.enumValues.includes("gfg")) {
    platformPath.enumValues.push("gfg");
  }
}
if (TopicPerformance.schema && TopicPerformance.schema.path) {
  const platformPath = TopicPerformance.schema.path("platform");
  if (platformPath && platformPath.enumValues && !platformPath.enumValues.includes("gfg")) {
    platformPath.enumValues.push("gfg");
  }
}


const { calculatePerformanceScores } = require("../engines/weaknessEngine");
const { evaluateUnlocks, runUnlockEngine } = require("../engines/unlockEngine");

// @desc    Get all topics and subtopics
// @route   GET /api/topics/all
// @access  Private
const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1 }).populate("subtopics.problems");
    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get progress details for a specific user
// @route   GET /api/topics/progress/:userId
// @access  Private
const getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId;
    let progress = await UserProgress.findOne({ userId });

    // On user login / loading progress — call once if UserProgress.lastUnlockCheck was > 1 hour ago
    const oneHour = 60 * 60 * 1000;
    if (progress && (!progress.lastUnlockCheck || (Date.now() - new Date(progress.lastUnlockCheck).getTime() > oneHour))) {
      await runUnlockEngine(userId);
      progress = await UserProgress.findOne({ userId }); // refetch updated
    }

    const performances = await TopicPerformance.find({ userId });

    res.json({
      progress: progress || { unlockedSubtopics: [], completedSubtopics: [], mastery: {}, solvedProblems: [] },
      performances: performances || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark a problem as solved manually
// @route   POST /api/topics/mark-solved
// @access  Private
const markProblemSolved = async (req, res) => {
  const { problemId } = req.body;

  if (!problemId) {
    return res.status(400).json({ message: "Problem ID is required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const problem = await ProblemMapping.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem mapping not found" });
    }

    let progress = await UserProgress.findOne({ userId: user._id });
    if (!progress) {
      progress = new UserProgress({
        userId: user._id,
        unlockedSubtopics: [],
        completedSubtopics: [],
        mastery: {}
      });
    }

    // Add problem to solved problems if not already added
    const solvedSet = new Set(progress.solvedProblems.map(id => id.toString()));
    if (!solvedSet.has(problem._id.toString())) {
      progress.solvedProblems.push(problem._id);
    }

    // Update TopicPerformance for the subtopic
    let performance = await TopicPerformance.findOne({
      userId: user._id,
      subtopic: problem.subtopic
    });

    if (!performance) {
      performance = new TopicPerformance({
        userId: user._id,
        subtopic: problem.subtopic,
        topic: problem.topic,
        platform: problem.platform
      });
    } else {
      // If platform differs, update to combined
      if (performance.platform !== "combined" && performance.platform !== problem.platform) {
        performance.platform = "combined";
      }
    }

    // Since this is manual markings, we increase totalAttempted and totalSolved
    performance.totalSolved += 1;
    performance.totalAttempted += 1;
    performance.lastPracticed = new Date();

    // Recalculate metrics for the subtopic
    const scores = calculatePerformanceScores(performance, problem.difficulty);
    performance.accuracy = scores.accuracy;
    performance.consistencyScore = scores.consistencyScore;
    performance.difficultyWeight = scores.difficultyWeight;
    performance.masteryScore = scores.masteryScore;
    performance.weaknessScore = scores.weaknessScore;

    await performance.save();

    // Update mastery inside progress Map
    progress.mastery.set(problem.subtopic, scores.masteryScore);

    progress.lastActivityDate = new Date();
    await progress.save();

    // Call runUnlockEngine after updating TopicPerformance
    await runUnlockEngine(user._id);

    // Refetch final progress to return
    progress = await UserProgress.findOne({ userId: user._id });

    res.json({
      message: "Problem marked as solved successfully!",
      progress,
      performance
    });
  } catch (error) {
    console.error("Mark solved error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Dynamic injection of manual unlock trigger API
const runUnlockRouteHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const newlyUnlocked = await runUnlockEngine(userId);
    res.json({
      success: true,
      message: "Unlock engine run successfully!",
      newlyUnlocked
    });
  } catch (error) {
    console.error("Manual unlock run error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Toggle a problem solved state (mark/unmark)
// @route   POST /api/topics/toggle-problem
// @access  Private
const toggleProblemSolved = async (req, res) => {
  const { userId, problemId, subtopic, topic } = req.body;
  const targetUserId = userId || (req.user && req.user.id);

  if (!targetUserId || !problemId) {
    return res.status(400).json({ message: "User ID and Problem ID are required" });
  }

  try {
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const problem = await ProblemMapping.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem mapping not found" });
    }

    let progress = await UserProgress.findOne({ userId: user._id });
    if (!progress) {
      progress = new UserProgress({
        userId: user._id,
        unlockedSubtopics: [],
        completedSubtopics: [],
        mastery: {},
        solvedProblems: []
      });
    }

    const solvedSet = new Set(progress.solvedProblems.map(id => id.toString()));
    const isSolved = solvedSet.has(problem._id.toString());

    let performance = await TopicPerformance.findOne({
      userId: user._id,
      subtopic: problem.subtopic
    });

    if (!performance) {
      performance = new TopicPerformance({
        userId: user._id,
        subtopic: problem.subtopic,
        topic: problem.topic,
        platform: problem.platform,
        totalSolved: 0,
        totalAttempted: 0
      });
    } else {
      if (performance.platform !== "combined" && performance.platform !== problem.platform) {
        performance.platform = "combined";
      }
    }

    let action = "marked";
    if (isSolved) {
      action = "unmarked";
      performance.totalSolved = Math.max(0, performance.totalSolved - 1);
      performance.totalAttempted = Math.max(0, performance.totalAttempted - 1);
      progress.solvedProblems = progress.solvedProblems.filter(
        id => id.toString() !== problem._id.toString()
      );
    } else {
      action = "marked";
      performance.totalSolved += 1;
      performance.totalAttempted += 1;
      progress.solvedProblems.push(problem._id);
    }

    if (performance.totalSolved > performance.totalAttempted) {
      performance.totalAttempted = performance.totalSolved;
    }

    performance.lastPracticed = new Date();

    // Recalculate metrics
    const scores = calculatePerformanceScores(performance, problem.difficulty);
    performance.accuracy = Math.round(performance.totalAttempted > 0 ? (performance.totalSolved / performance.totalAttempted) * 100 : 0);
    performance.consistencyScore = scores.consistencyScore;
    performance.difficultyWeight = scores.difficultyWeight;
    performance.masteryScore = Math.round((performance.accuracy * 0.4) + (performance.consistencyScore * 0.3) + (performance.difficultyWeight * 0.3));
    performance.weaknessScore = Math.round(100 - performance.masteryScore);

    await performance.save();

    progress.mastery.set(problem.subtopic, performance.masteryScore);
    progress.lastActivityDate = new Date();
    await progress.save();

    // Run unlock engine
    const newlyUnlocked = await runUnlockEngine(user._id);

    res.json({
      action,
      newMasteryScore: performance.masteryScore,
      newSolvedCount: performance.totalSolved,
      newlyUnlocked: newlyUnlocked || []
    });
  } catch (error) {
    console.error("Toggle problem error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

setTimeout(() => {
  if (module.parent) {
    const parentRouter = module.parent.exports;
    if (parentRouter && typeof parentRouter.post === 'function') {
      const protect = require("../middleware/authMiddleware");
      parentRouter.post("/run-unlock/:userId", protect, runUnlockRouteHandler);
      parentRouter.post("/toggle-problem", protect, toggleProblemSolved);
      console.log("Successfully registered POST /api/topics/toggle-problem dynamically.");
    }
  }
}, 50);

module.exports = { getAllTopics, getUserProgress, markProblemSolved, toggleProblemSolved };

