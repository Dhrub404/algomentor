const mongoose = require("mongoose");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");
const { getGenericRoadmap, getPersonalizedRoadmap } = require("../engines/roadmapEngine");
const { calculatePerformanceScores } = require("../engines/weaknessEngine");
const { runUnlockEngine } = require("../engines/unlockEngine");
const protect = require("../middleware/authMiddleware");

// Define RoadmapSnapshot schema & model dynamically
const RoadmapSnapshotSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  generatedAt: { 
    type: Date, 
    default: Date.now 
  },
  weeks: { 
    type: Array, 
    default: [] 
  },
  completedProblems: [{ 
    type: String 
  }],
  totalWeakAreas: { 
    type: Number, 
    default: 0 
  },
  totalRevisionNeeded: { 
    type: Number, 
    default: 0 
  }
});

const RoadmapSnapshot = mongoose.models.RoadmapSnapshot || mongoose.model("RoadmapSnapshot", RoadmapSnapshotSchema);

/**
 * Common handler to fetch or dynamically generate & snapshot the adaptive study plan.
 */
const handleRoadmapFetch = async (req, res, userId, force) => {
  try {
    const targetUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    // Run unlock engine to ensure unlockedSubtopics is populated/up to date
    await runUnlockEngine(targetUserId);

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let progress = await UserProgress.findOne({ userId: targetUserId });
    if (!progress) {
      return res.json({
        generatedAt: new Date(),
        totalWeakAreas: 0,
        totalRevisionNeeded: 0,
        noPerformanceData: true,
        noPlatformConnected: true,
        allMastered: false,
        weeks: []
      });
    }

    // 1. Try to load the LAST saved snapshot if not forcing regeneration
    if (force !== "true") {
      const latestSnapshot = await RoadmapSnapshot.findOne({ userId: targetUserId }).sort({ generatedAt: -1 });
      if (latestSnapshot && latestSnapshot.weeks && latestSnapshot.weeks.length > 0) {
        const allEmpty = latestSnapshot.weeks.every(w => !w.items || w.items.length === 0);
        if (!allEmpty) {
          const topicPerformances = await TopicPerformance.find({ userId: targetUserId });
          console.log("userId:", targetUserId.toString());
          console.log("studiedTopics:", user.studiedTopics);
          console.log("unlockedSubtopics:", progress.unlockedSubtopics);
          console.log("topicPerformanceCount:", topicPerformances.length);
          console.log("weeksGenerated:", latestSnapshot.weeks.length);
          console.log("totalItemsInWeek1:", latestSnapshot.weeks[0]?.items?.length);

          return res.json(latestSnapshot);
        }
      }
    }

    // 2. Generate a fresh roadmap using the study planner engine
    const adaptiveRoadmap = await getPersonalizedRoadmap(user, progress);

    // If there is no performance data or profiles connected, do not save snapshot, just return
    if (adaptiveRoadmap.noPerformanceData || adaptiveRoadmap.noPlatformConnected || adaptiveRoadmap.allMastered) {
      const topicPerformances = await TopicPerformance.find({ userId: targetUserId });
      console.log("userId:", targetUserId.toString());
      console.log("studiedTopics:", user.studiedTopics);
      console.log("unlockedSubtopics:", progress.unlockedSubtopics);
      console.log("topicPerformanceCount:", topicPerformances.length);
      console.log("weeksGenerated:", adaptiveRoadmap.weeks?.length || 0);
      console.log("totalItemsInWeek1:", adaptiveRoadmap.weeks?.[0]?.items?.length || 0);

      return res.json(adaptiveRoadmap);
    }

    // 3. Save the newly generated study plan as a fresh database snapshot
    const snapshot = new RoadmapSnapshot({
      userId: targetUserId,
      generatedAt: new Date(),
      weeks: adaptiveRoadmap.weeks,
      completedProblems: [], // reset all checkmarks on a fresh roadmap start
      totalWeakAreas: adaptiveRoadmap.totalWeakAreas,
      totalRevisionNeeded: adaptiveRoadmap.totalRevisionNeeded
    });
    await snapshot.save();

    const topicPerformances = await TopicPerformance.find({ userId: targetUserId });
    console.log("userId:", targetUserId.toString());
    console.log("studiedTopics:", user.studiedTopics);
    console.log("unlockedSubtopics:", progress.unlockedSubtopics);
    console.log("topicPerformanceCount:", topicPerformances.length);
    console.log("weeksGenerated:", snapshot.weeks.length);
    console.log("totalItemsInWeek1:", snapshot.weeks[0]?.items?.length);

    res.json(snapshot);
  } catch (error) {
    console.error("Roadmap fetching error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get generic static DSA roadmap with user mastery coloration and enriched progress
// @route   GET /api/roadmap/generic
// @access  Private
const getGenericDSARoadmap = async (req, res) => {
  try {
    const user = req.user;
    let progress = await UserProgress.findOne({ userId: user._id });
    const roadmap = await getGenericRoadmap(user, progress);

    // Enrich roadmap topics with solved and total problems directly from DB
    const enrichedRoadmap = await Promise.all(
      roadmap.map(async (item) => {
        const topicObj = await Topic.findOne({ name: item.topic }).populate("subtopics.problems");
        let totalProblems = 0;
        let solvedProblems = 0;
        const solvedSet = new Set((progress?.solvedProblems || []).map((id) => id.toString()));

        if (topicObj) {
          topicObj.subtopics.forEach((sub) => {
            totalProblems += sub.problems?.length || 0;
            sub.problems?.forEach((p) => {
              if (solvedSet.has(p._id.toString())) {
                solvedProblems++;
              }
            });
          });
        }

        return {
          ...item,
          totalProblems,
          solvedProblems
        };
      })
    );

    res.json(enrichedRoadmap);
  } catch (error) {
    console.error("Generic roadmap fetching error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user-personalized roadmap (serving snapshot)
// @route   GET /api/roadmap/personalized/:userId
// @access  Private
const getPersonalizedDSARoadmap = async (req, res) => {
  const { userId } = req.params;
  const { force } = req.query;
  await handleRoadmapFetch(req, res, userId, force);
};

// @desc    Get user-adaptive roadmap (new endpoint, serving snapshot)
// @route   GET /api/roadmap/adaptive/:userId
// @access  Private
const getAdaptiveDSARoadmap = async (req, res) => {
  const { userId } = req.params;
  const { force } = req.query;
  await handleRoadmapFetch(req, res, userId, force);
};

// @desc    Toggle problem completed status inside snapshot and sync with progress
// @route   POST /api/roadmap/toggle-problem
// @access  Private
const toggleProblemInSnapshot = async (req, res) => {
  const { problemId } = req.body;
  const userId = req.user._id;

  if (!problemId) {
    return res.status(400).json({ message: "Problem ID is required" });
  }

  const targetUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

  try {
    // 1. Fetch latest snapshot or create one if missing
    let snapshot = await RoadmapSnapshot.findOne({ userId: targetUserId }).sort({ generatedAt: -1 });
    if (!snapshot) {
      const user = await User.findById(targetUserId);
      const progress = await UserProgress.findOne({ userId: targetUserId });
      const adaptiveRoadmap = await getPersonalizedRoadmap(user, progress);
      
      snapshot = new RoadmapSnapshot({
        userId: targetUserId,
        generatedAt: new Date(),
        weeks: adaptiveRoadmap.weeks,
        completedProblems: [],
        totalWeakAreas: adaptiveRoadmap.totalWeakAreas,
        totalRevisionNeeded: adaptiveRoadmap.totalRevisionNeeded
      });
    }

    const index = snapshot.completedProblems.indexOf(problemId);
    let isSolved = false;
    if (index > -1) {
      snapshot.completedProblems.splice(index, 1);
      isSolved = false;
    } else {
      snapshot.completedProblems.push(problemId);
      isSolved = true;
    }

    snapshot.markModified("completedProblems");
    await snapshot.save();

    // 2. Synchronize with general UserProgress & TopicPerformance tables
    const problem = await ProblemMapping.findById(problemId);
    if (problem) {
      let progress = await UserProgress.findOne({ userId: targetUserId });
      if (!progress) {
        progress = new UserProgress({
          userId: targetUserId,
          unlockedSubtopics: [],
          completedSubtopics: [],
          mastery: {}
        });
      }

      const progressSolvedSet = new Set(progress.solvedProblems.map(id => id.toString()));
      if (isSolved) {
        if (!progressSolvedSet.has(problem._id.toString())) {
          progress.solvedProblems.push(problem._id);
        }
      } else {
        progress.solvedProblems = progress.solvedProblems.filter(
          id => id.toString() !== problem._id.toString()
        );
      }

      let performance = await TopicPerformance.findOne({
        userId: targetUserId,
        subtopic: problem.subtopic
      });

      if (!performance) {
        performance = new TopicPerformance({
          userId: targetUserId,
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

      if (isSolved) {
        performance.totalSolved += 1;
        performance.totalAttempted += 1;
      } else {
        performance.totalSolved = Math.max(0, performance.totalSolved - 1);
        performance.totalAttempted = Math.max(0, performance.totalAttempted - 1);
      }

      if (performance.totalSolved > performance.totalAttempted) {
        performance.totalAttempted = performance.totalSolved;
      }

      performance.lastPracticed = new Date();

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

      // Recalculate unlocks
      await runUnlockEngine(targetUserId);
    }

    res.json(snapshot);
  } catch (error) {
    console.error("Toggle problem in snapshot error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Dynamic Route Injection:
process.nextTick(() => {
  try {
    const routePath = require.resolve("../routes/roadmapRoutes");
    const cached = require.cache[routePath];
    if (cached && cached.exports) {
      const router = cached.exports;
      router.get("/adaptive/:userId", protect, getAdaptiveDSARoadmap);
      router.post("/toggle-problem", protect, toggleProblemInSnapshot);
      console.log("Successfully injected adaptive roadmap routes dynamically.");
    } else {
      console.warn("Could not find cached roadmapRoutes.js module to inject adaptive routes.");
    }
  } catch (err) {
    console.error("Error during dynamic route injection:", err);
  }
});

module.exports = {
  getGenericDSARoadmap,
  getPersonalizedDSARoadmap,
  getAdaptiveDSARoadmap,
  toggleProblemInSnapshot
};
