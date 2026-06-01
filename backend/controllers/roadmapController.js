const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const { getGenericRoadmap, getPersonalizedRoadmap } = require("../engines/roadmapEngine");
const protect = require("../middleware/authMiddleware");

// @desc    Get generic static DSA roadmap with user mastery coloration
// @route   GET /api/roadmap/generic
// @access  Private
const getGenericDSARoadmap = async (req, res) => {
  try {
    const user = req.user;
    let progress = await UserProgress.findOne({ userId: user._id });
    const roadmap = await getGenericRoadmap(user, progress);
    res.json(roadmap);
  } catch (error) {
    console.error("Generic roadmap fetching error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user-personalized roadmap (older endpoint mapped to new logic)
// @route   GET /api/roadmap/personalized/:userId
// @access  Private
const getPersonalizedDSARoadmap = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let progress = await UserProgress.findOne({ userId });
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

    const adaptiveRoadmap = await getPersonalizedRoadmap(user, progress);
    res.json(adaptiveRoadmap);
  } catch (error) {
    console.error("Personalized roadmap generation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user-adaptive roadmap (new endpoint requested)
// @route   GET /api/roadmap/adaptive/:userId
// @access  Private
const getAdaptiveDSARoadmap = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let progress = await UserProgress.findOne({ userId });
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

    const adaptiveRoadmap = await getPersonalizedRoadmap(user, progress);
    res.json(adaptiveRoadmap);
  } catch (error) {
    console.error("Adaptive roadmap generation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Dynamic Route Injection:
// We resolve the cached exports of backend/routes/roadmapRoutes.js and append our adaptive route dynamically.
process.nextTick(() => {
  try {
    const routePath = require.resolve("../routes/roadmapRoutes");
    const cached = require.cache[routePath];
    if (cached && cached.exports) {
      const router = cached.exports;
      router.get("/adaptive/:userId", protect, getAdaptiveDSARoadmap);
      console.log("Successfully injected adaptive roadmap route [/adaptive/:userId] dynamically.");
    } else {
      console.warn("Could not find cached roadmapRoutes.js module to inject adaptive route.");
    }
  } catch (err) {
    console.error("Error during dynamic route injection:", err);
  }
});

module.exports = {
  getGenericDSARoadmap,
  getPersonalizedDSARoadmap,
  getAdaptiveDSARoadmap
};
