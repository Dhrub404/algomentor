const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const { getGenericRoadmap, getPersonalizedRoadmap } = require("../engines/roadmapEngine");

// @desc    Get generic static DSA roadmap
// @route   GET /api/roadmap/generic
// @access  Private
const getGenericDSARoadmap = async (req, res) => {
  try {
    const roadmap = await getGenericRoadmap();
    res.json(roadmap);
  } catch (error) {
    console.error("Generic roadmap fetching error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user-personalized roadmap
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
      return res.json([]);
    }

    const personalizedRoadmap = await getPersonalizedRoadmap(user, progress);
    res.json(personalizedRoadmap);
  } catch (error) {
    console.error("Personalized roadmap generation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getGenericDSARoadmap, getPersonalizedDSARoadmap };
