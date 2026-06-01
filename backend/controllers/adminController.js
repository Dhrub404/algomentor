const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");
const SystemSettings = require("../models/SystemSettings");

const { calculatePerformanceScores } = require("../engines/weaknessEngine");
const { evaluateUnlocks } = require("../engines/unlockEngine");
const { generateDailyPractice } = require("../engines/practiceEngine");
const { runRevisionCheck } = require("../engines/revisionEngine");

// Helper to sign Admin JWT
const generateAdminToken = (username) => {
  return jwt.sign(
    { username, role: "admin" },
    process.env.ADMIN_JWT_SECRET || "adminsecretkey",
    { expiresIn: "7d" }
  );
};

// Helper to get or initialize system settings
const getOrInitSettings = async () => {
  let settings = await SystemSettings.findOne({});
  if (!settings) {
    settings = await SystemSettings.create({
      defaultUnlockThreshold: 35,
      revisionAlertDays: 14,
      dailyPracticeSize: 6,
      revisionAlertsEnabled: true,
      leaderboardVisible: true
    });
  }
  return settings;
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === adminUser && password === adminPass) {
    const token = generateAdminToken(username);
    res.json({ token, role: "admin", username });
  } else {
    res.status(401).json({ message: "Invalid administrator credentials" });
  }
};

// @desc    Get dashboard metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProblems = await ProblemMapping.countDocuments({});
    const totalTopics = await Topic.countDocuments({});
    
    // Sum attempts across all performances
    const performances = await TopicPerformance.find({});
    const totalSubmissions = performances.reduce((acc, curr) => acc + curr.totalAttempted, 0);

    // Active users in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await UserProgress.countDocuments({
      lastActivityDate: { $gte: sevenDaysAgo }
    });

    res.json({
      totalUsers,
      totalProblems,
      totalTopics,
      totalSubmissions,
      activeUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    const progressList = await UserProgress.find({});
    const performances = await TopicPerformance.find({});

    const formattedUsers = users.map((u) => {
      const progress = progressList.find((p) => p.userId.toString() === u._id.toString());
      const userPerfs = performances.filter((p) => p.userId.toString() === u._id.toString());

      const studiedCount = u.studiedTopics ? u.studiedTopics.length : 0;
      
      // Calculate average mastery
      let totalMastery = 0;
      userPerfs.forEach((p) => {
        totalMastery += p.masteryScore || 0;
      });
      const avgMastery = userPerfs.length > 0 ? Math.round(totalMastery / userPerfs.length) : 0;

      return {
        _id: u._id,
        username: u.username,
        email: u.email,
        currentLevel: u.currentLevel,
        codeforcesHandle: u.codeforcesHandle,
        leetcodeHandle: u.leetcodeHandle,
        studiedCount,
        avgMastery,
        joinedDate: u.createdAt
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get specific user deep details
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const progress = await UserProgress.findOne({ userId }) || {
      unlockedSubtopics: [],
      completedSubtopics: [],
      mastery: {},
      solvedProblems: [],
      overrideUnlockThreshold: null,
      forcedUnlockedSubtopics: [],
      forcedLockedSubtopics: []
    };

    const performances = await TopicPerformance.find({ userId });

    res.json({
      user,
      progress,
      performances
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Overwrite user subtopic mastery score
// @route   PUT /api/admin/users/:userId/mastery
// @access  Private/Admin
const updateUserMastery = async (req, res) => {
  const { userId } = req.params;
  const { subtopic, masteryScore } = req.body;

  if (masteryScore === undefined || masteryScore < 0 || masteryScore > 100) {
    return res.status(400).json({ message: "Valid masteryScore (0-100) is required" });
  }

  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({ userId });
    }

    // Set inside progress map
    progress.mastery.set(subtopic, masteryScore);

    // Find parent topic difficulty
    const parentTopic = await Topic.findOne({ "subtopics.name": subtopic });
    let difficulty = "easy";
    let topicName = "DSA";
    if (parentTopic) {
      topicName = parentTopic.name;
      const sub = parentTopic.subtopics.find((s) => s.name === subtopic);
      if (sub) difficulty = sub.difficulty;
    }

    // Update performance metrics
    let perf = await TopicPerformance.findOne({ userId, subtopic });
    if (!perf) {
      perf = new TopicPerformance({
        userId,
        subtopic,
        topic: topicName
      });
    }

    perf.masteryScore = masteryScore;
    perf.weaknessScore = 100 - masteryScore; // Inverse approximation
    perf.accuracy = masteryScore; // Set values
    perf.lastPracticed = new Date();
    await perf.save();

    // Trigger unlock engine check
    const topicsList = await Topic.find({});
    const allPerformances = await TopicPerformance.find({ userId });
    
    const newlyUnlockedSubtopics = await evaluateUnlocks(
      allPerformances,
      topicsList,
      progress.overrideUnlockThreshold,
      progress.forcedUnlockedSubtopics,
      progress.forcedLockedSubtopics
    );
    progress.unlockedSubtopics = newlyUnlockedSubtopics;
    
    await progress.save();

    res.json({ message: "Mastery overwritten successfully", progress, performance: perf });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Force unlock a subtopic
// @route   PUT /api/admin/users/:userId/unlock-subtopic
// @access  Private/Admin
const forceUnlockSubtopic = async (req, res) => {
  const { userId } = req.params;
  const { subtopic } = req.body;

  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({ userId });
    }

    // Remove from locked if exists
    progress.forcedLockedSubtopics = progress.forcedLockedSubtopics.filter(s => s !== subtopic);

    // Add to unlocked overrides if not there
    if (!progress.forcedUnlockedSubtopics.includes(subtopic)) {
      progress.forcedUnlockedSubtopics.push(subtopic);
    }

    // Recheck unlock list
    const topicsList = await Topic.find({});
    const allPerformances = await TopicPerformance.find({ userId });

    progress.unlockedSubtopics = await evaluateUnlocks(
      allPerformances,
      topicsList,
      progress.overrideUnlockThreshold,
      progress.forcedUnlockedSubtopics,
      progress.forcedLockedSubtopics
    );

    await progress.save();
    res.json({ message: `Subtopic "${subtopic}" force-unlocked`, progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Force lock a subtopic
// @route   PUT /api/admin/users/:userId/lock-subtopic
// @access  Private/Admin
const forceLockSubtopic = async (req, res) => {
  const { userId } = req.params;
  const { subtopic } = req.body;

  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({ userId });
    }

    // Remove from unlocked if exists
    progress.forcedUnlockedSubtopics = progress.forcedUnlockedSubtopics.filter(s => s !== subtopic);

    // Add to locked overrides if not there
    if (!progress.forcedLockedSubtopics.includes(subtopic)) {
      progress.forcedLockedSubtopics.push(subtopic);
    }

    // Recheck unlock list
    const topicsList = await Topic.find({});
    const allPerformances = await TopicPerformance.find({ userId });

    progress.unlockedSubtopics = await evaluateUnlocks(
      allPerformances,
      topicsList,
      progress.overrideUnlockThreshold,
      progress.forcedUnlockedSubtopics,
      progress.forcedLockedSubtopics
    );

    await progress.save();
    res.json({ message: `Subtopic "${subtopic}" force-locked`, progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Manually configure problem status (simulate solves / attempts)
// @route   PUT /api/admin/users/:userId/mark-problem
// @access  Private/Admin
const markProblemStatus = async (req, res) => {
  const { userId } = req.params;
  const { problemId, status } = req.body; // status: "solved" | "attempted" | "failed" | "not attempted"

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const problem = await ProblemMapping.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    let progress = await UserProgress.findOne({ userId });
    if (!progress) progress = new UserProgress({ userId });

    let perf = await TopicPerformance.findOne({ userId, subtopic: problem.subtopic });
    if (!perf) {
      perf = new TopicPerformance({
        userId,
        subtopic: problem.subtopic,
        topic: problem.topic,
        platform: problem.platform
      });
    }

    const solvedSet = new Set(progress.solvedProblems.map(id => id.toString()));

    if (status === "solved") {
      if (!solvedSet.has(problem._id.toString())) {
        progress.solvedProblems.push(problem._id);
      }
      perf.totalSolved += 1;
      perf.totalAttempted += 1;
    } else if (status === "attempted" || status === "failed") {
      // Remove from solved list
      progress.solvedProblems = progress.solvedProblems.filter(id => id.toString() !== problem._id.toString());
      perf.totalAttempted += 1;
      perf.wrongAttempts += 1;
    } else if (status === "not attempted") {
      progress.solvedProblems = progress.solvedProblems.filter(id => id.toString() !== problem._id.toString());
      if (perf.totalAttempted > 0) perf.totalAttempted -= 1;
    }

    perf.lastPracticed = new Date();
    
    // Recalculate metrics
    const scores = calculatePerformanceScores(perf, problem.difficulty);
    perf.accuracy = scores.accuracy;
    perf.consistencyScore = scores.consistencyScore;
    perf.difficultyWeight = scores.difficultyWeight;
    perf.masteryScore = scores.masteryScore;
    perf.weaknessScore = scores.weaknessScore;

    await perf.save();

    progress.mastery.set(problem.subtopic, scores.masteryScore);

    // Recheck unlocks
    const topicsList = await Topic.find({});
    const allPerformances = await TopicPerformance.find({ userId });
    
    progress.unlockedSubtopics = await evaluateUnlocks(
      allPerformances,
      topicsList,
      progress.overrideUnlockThreshold,
      progress.forcedUnlockedSubtopics,
      progress.forcedLockedSubtopics
    );

    await progress.save();

    res.json({ message: `Problem status set to ${status}`, progress, performance: perf });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset all progress for a user
// @route   POST /api/admin/users/:userId/reset-progress
// @access  Private/Admin
const resetProgress = async (req, res) => {
  const { userId } = req.params;

  try {
    // Delete topic performances
    await TopicPerformance.deleteMany({ userId });

    // Reset UserProgress schema
    const topicsList = await Topic.find({});
    const initialUnlocked = [];
    topicsList.forEach((t) => {
      t.subtopics.forEach((s) => {
        if (!s.prerequisites || s.prerequisites.length === 0) {
          initialUnlocked.push(s.name);
        }
      });
    });

    let progress = await UserProgress.findOne({ userId });
    if (progress) {
      progress.unlockedSubtopics = initialUnlocked;
      progress.completedSubtopics = [];
      progress.mastery = new Map();
      progress.solvedProblems = [];
      progress.overrideUnlockThreshold = null;
      progress.forcedUnlockedSubtopics = [];
      progress.forcedLockedSubtopics = [];
      progress.lastActivityDate = new Date();
      await progress.save();
    }

    res.json({ message: "Progress reset successfully", progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Run engine simulations on demand
// @route   POST /api/admin/users/:userId/run-engine/:engineName
// @access  Private/Admin
const runEngineOnDemand = async (req, res) => {
  const { userId, engineName } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const progress = await UserProgress.findOne({ userId });
    if (!progress) return res.status(400).json({ message: "User progress not initialized" });

    if (engineName === "weakness") {
      // Return weakness scores calculated
      const performances = await TopicPerformance.find({ userId });
      const diagnostic = performances.map(p => ({
        subtopic: p.subtopic,
        masteryScore: p.masteryScore,
        weaknessScore: p.weaknessScore
      }));
      return res.json({ engine: "weakness", output: diagnostic });
    }

    if (engineName === "unlock") {
      const topicsList = await Topic.find({});
      const allPerformances = await TopicPerformance.find({ userId });
      const currentUnlocked = progress.unlockedSubtopics;
      
      const recalculated = await evaluateUnlocks(
        allPerformances,
        topicsList,
        progress.overrideUnlockThreshold,
        progress.forcedUnlockedSubtopics,
        progress.forcedLockedSubtopics
      );
      
      return res.json({
        engine: "unlock",
        output: {
          current: currentUnlocked,
          recalculated,
          changes: recalculated.filter(x => !currentUnlocked.includes(x))
        }
      });
    }

    if (engineName === "practice") {
      const problems = await generateDailyPractice(user, progress);
      return res.json({ engine: "practice", output: problems });
    }

    if (engineName === "revision") {
      const alerts = await runRevisionCheck(user._id, user.studiedTopics);
      return res.json({ engine: "revision", output: alerts });
    }

    res.status(400).json({ message: `Unknown engine "${engineName}"` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all topics
// @route   GET /api/admin/topics
// @access  Private/Admin
const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1 });
    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a subtopic configuration
// @route   PUT /api/admin/topics/:topicId/subtopic/:subtopicId
// @access  Private/Admin
const updateSubtopic = async (req, res) => {
  const { topicId, subtopicId } = req.params;
  const { name, difficulty, prerequisites, unlockThreshold } = req.body;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const subtopic = topic.subtopics.id(subtopicId);
    if (!subtopic) return res.status(404).json({ message: "Subtopic not found" });

    if (name) subtopic.name = name;
    if (difficulty) subtopic.difficulty = difficulty;
    if (prerequisites) subtopic.prerequisites = prerequisites;
    if (unlockThreshold !== undefined) subtopic.unlockThreshold = unlockThreshold;

    await topic.save();
    res.json({ message: "Subtopic updated successfully", topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a subtopic to a topic
// @route   POST /api/admin/topics/:topicId/subtopic
// @access  Private/Admin
const createSubtopic = async (req, res) => {
  const { topicId } = req.params;
  const { name, difficulty, prerequisites, unlockThreshold } = req.body;

  if (!name || !difficulty) {
    return res.status(400).json({ message: "Name and difficulty are required" });
  }

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    // Calculate order
    const nextOrder = topic.subtopics.length + 1;

    topic.subtopics.push({
      name,
      order: nextOrder,
      difficulty,
      prerequisites: prerequisites || [],
      unlockThreshold: unlockThreshold || 35
    });

    await topic.save();
    res.status(201).json({ message: "Subtopic created successfully", topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all problems
// @route   GET /api/admin/problems
// @access  Private/Admin
const getProblems = async (req, res) => {
  try {
    const problems = await ProblemMapping.find({});
    res.json(problems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a problem manually
// @route   POST /api/admin/problems
// @access  Private/Admin
const createProblem = async (req, res) => {
  const { platformProblemId, platform, title, url, topic, subtopic, difficulty, tags } = req.body;

  if (!platformProblemId || !platform || !title || !url || !topic || !subtopic || !difficulty) {
    return res.status(400).json({ message: "Please enter all required fields" });
  }

  try {
    const problem = await ProblemMapping.create({
      platformProblemId,
      platform,
      title,
      url,
      topic,
      subtopic,
      difficulty,
      tags: tags || []
    });

    // Also link this problem to the static Topic subtopic list
    const topicObj = await Topic.findOne({ name: topic });
    if (topicObj) {
      const sub = topicObj.subtopics.find(s => s.name === subtopic);
      if (sub) {
        sub.problems.push(problem._id);
        sub.problemCount += 1;
        await topicObj.save();
      }
    }

    res.status(201).json({ message: "Problem mapped successfully", problem });
  } catch (error) {
    console.error("Create problem error:", error.message);
    res.status(500).json({ message: "Server error or duplicate problem ID" });
  }
};

// @desc    Edit a problem mapping
// @route   PUT /api/admin/problems/:problemId
// @access  Private/Admin
const updateProblem = async (req, res) => {
  const { problemId } = req.params;
  const updates = req.body;

  try {
    const problem = await ProblemMapping.findByIdAndUpdate(problemId, updates, { new: true });
    if (!problem) return res.status(404).json({ message: "Problem mapping not found" });

    res.json({ message: "Problem updated successfully", problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a problem mapping
// @route   DELETE /api/admin/problems/:problemId
// @access  Private/Admin
const deleteProblem = async (req, res) => {
  const { problemId } = req.params;

  try {
    const problem = await ProblemMapping.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem mapping not found" });

    // Remove reference from topic subtopics
    const topicObj = await Topic.findOne({ name: problem.topic });
    if (topicObj) {
      const sub = topicObj.subtopics.find(s => s.name === problem.subtopic);
      if (sub) {
        sub.problems = sub.problems.filter(id => id.toString() !== problem._id.toString());
        if (sub.problemCount > 0) sub.problemCount -= 1;
        await topicObj.save();
      }
    }

    await ProblemMapping.findByIdAndDelete(problemId);
    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
  try {
    const settings = await getOrInitSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
  const { defaultUnlockThreshold, revisionAlertDays, dailyPracticeSize, revisionAlertsEnabled, leaderboardVisible } = req.body;

  try {
    const settings = await getOrInitSettings();

    if (defaultUnlockThreshold !== undefined) settings.defaultUnlockThreshold = defaultUnlockThreshold;
    if (revisionAlertDays !== undefined) settings.revisionAlertDays = revisionAlertDays;
    if (dailyPracticeSize !== undefined) settings.dailyPracticeSize = dailyPracticeSize;
    if (revisionAlertsEnabled !== undefined) settings.revisionAlertsEnabled = revisionAlertsEnabled;
    if (leaderboardVisible !== undefined) settings.leaderboardVisible = leaderboardVisible;

    await settings.save();
    res.json({ message: "System settings updated successfully", settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user override threshold
// @route   PUT /api/admin/users/:userId/override-threshold
// @access  Private/Admin
const updateOverrideThreshold = async (req, res) => {
  const { userId } = req.params;
  const { threshold } = req.body; // threshold: number or null

  try {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) progress = new UserProgress({ userId });

    progress.overrideUnlockThreshold = threshold;

    // Recheck unlocks
    const topicsList = await Topic.find({});
    const allPerformances = await TopicPerformance.find({ userId });

    progress.unlockedSubtopics = await evaluateUnlocks(
      allPerformances,
      topicsList,
      progress.overrideUnlockThreshold,
      progress.forcedUnlockedSubtopics,
      progress.forcedLockedSubtopics
    );

    await progress.save();
    res.json({ message: "Unlock threshold override updated", progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginAdmin,
  getStats,
  getUsers,
  getUserDetails,
  updateUserMastery,
  forceUnlockSubtopic,
  forceLockSubtopic,
  markProblemStatus,
  resetProgress,
  runEngineOnDemand,
  getTopics,
  updateSubtopic,
  createSubtopic,
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  getSystemSettings,
  updateSystemSettings,
  updateOverrideThreshold
};
