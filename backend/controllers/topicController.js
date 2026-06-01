const Topic = require("../models/Topic");
const ProblemMapping = require("../models/ProblemMapping");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const User = require("../models/User");

const { calculatePerformanceScores } = require("../engines/weaknessEngine");
const { evaluateUnlocks } = require("../engines/unlockEngine");

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
    const progress = await UserProgress.findOne({ userId });
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

    // Retrieve all topics to evaluate unlocks
    const topicsList = await Topic.find({});

    // Evaluate unlocks
    const allPerformances = await TopicPerformance.find({ userId: user._id });
    const newlyUnlockedSubtopics = await evaluateUnlocks(
      allPerformances,
      topicsList,
      progress.overrideUnlockThreshold,
      progress.forcedUnlockedSubtopics,
      progress.forcedLockedSubtopics
    );
    progress.unlockedSubtopics = newlyUnlockedSubtopics;

    progress.lastActivityDate = new Date();
    await progress.save();

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

module.exports = { getAllTopics, getUserProgress, markProblemSolved };
