const express = require("express");
const router = express.Router();
const protectAdmin = require("../middleware/adminAuthMiddleware");
const {
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
} = require("../controllers/adminController");

// Public Admin Route
router.post("/login", loginAdmin);

// Protected Admin Routes
router.get("/stats", protectAdmin, getStats);
router.get("/users", protectAdmin, getUsers);
router.get("/users/:userId", protectAdmin, getUserDetails);
router.put("/users/:userId/mastery", protectAdmin, updateUserMastery);
router.put("/users/:userId/unlock-subtopic", protectAdmin, forceUnlockSubtopic);
router.put("/users/:userId/lock-subtopic", protectAdmin, forceLockSubtopic);
router.put("/users/:userId/override-threshold", protectAdmin, updateOverrideThreshold);
router.put("/users/:userId/mark-problem", protectAdmin, markProblemStatus);
router.post("/users/:userId/reset-progress", protectAdmin, resetProgress);
router.post("/users/:userId/run-engine/:engineName", protectAdmin, runEngineOnDemand);

// Topics & Subtopics
router.get("/topics", protectAdmin, getTopics);
router.post("/topics/:topicId/subtopic", protectAdmin, createSubtopic);
router.put("/topics/:topicId/subtopic/:subtopicId", protectAdmin, updateSubtopic);

// Problem mappings
router.get("/problems", protectAdmin, getProblems);
router.post("/problems", protectAdmin, createProblem);
router.put("/problems/:problemId", protectAdmin, updateProblem);
router.delete("/problems/:problemId", protectAdmin, deleteProblem);

// System Settings
router.get("/settings", protectAdmin, getSystemSettings);
router.put("/settings", protectAdmin, updateSystemSettings);

module.exports = router;
