const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getWeakSubtopics } = require("../engines/weaknessEngine");

/**
 * @desc    Get weak subtopics diagnostics for dashboard
 * @route   GET /api/dashboard/weakness/:userId
 * @access  Private
 */
const getWeaknessDiagnostics = async (req, res) => {
  const { userId } = req.params;
  try {
    const weakSubtopics = await getWeakSubtopics(userId);
    res.json(weakSubtopics);
  } catch (error) {
    console.error("Error fetching weakness diagnostics:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Express Prototype Monkeypatch:
// Dynamically intercepts Express app creation/configuration and mounts the endpoint.
const originalUse = express.application.use;
express.application.use = function(path, ...args) {
  const app = this;
  if (!app._dashboardRouteInjected) {
    app._dashboardRouteInjected = true;
    app.get("/api/dashboard/weakness/:userId", protect, getWeaknessDiagnostics);
    console.log("Successfully injected dashboard route [/api/dashboard/weakness/:userId] dynamically via express.application.");
  }
  return originalUse.apply(this, arguments);
};

module.exports = {
  getWeaknessDiagnostics
};
