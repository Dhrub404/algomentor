const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const connectDB = require("../config/db");

// Models
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");
const SystemSettings = require("../models/SystemSettings");

// Controller methods to test
const {
  loginAdmin,
  updateSystemSettings,
  markProblemStatus,
  resetProgress
} = require("../controllers/adminController");

// Helper to create mocked Express response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runTests = async () => {
  try {
    console.log("=== STARTING ADMIN PANEL BACKEND VERIFICATION SUITE ===");
    
    // Connect to database
    await connectDB();
    
    // ----------------------------------------------------
    // TEST 1: Admin Login Authorization
    // ----------------------------------------------------
    console.log("\n[Test 1] Testing Admin login credentials and token generation...");
    const reqLogin = {
      body: {
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "admin123"
      }
    };
    const resLogin = mockResponse();
    await loginAdmin(reqLogin, resLogin);
    
    if (resLogin.body && resLogin.body.token && resLogin.body.role === "admin") {
      console.log("✓ Admin Login Passed: Valid JWT token and administrator permissions returned.");
    } else {
      throw new Error(`Admin Login Failed: ${JSON.stringify(resLogin.body)}`);
    }

    // ----------------------------------------------------
    // TEST 2: Update and Fetch System Settings
    // ----------------------------------------------------
    console.log("\n[Test 2] Testing System Settings global configuration mutation...");
    const origSettings = await SystemSettings.findOne({});
    
    const reqSettings = {
      body: {
        defaultUnlockThreshold: 42,
        revisionAlertDays: 20,
        dailyPracticeSize: 8,
        revisionAlertsEnabled: false,
        leaderboardVisible: false
      }
    };
    const resSettings = mockResponse();
    await updateSystemSettings(reqSettings, resSettings);
    
    if (resSettings.body && resSettings.body.settings) {
      const updated = resSettings.body.settings;
      if (
        updated.defaultUnlockThreshold === 42 &&
        updated.revisionAlertDays === 20 &&
        updated.dailyPracticeSize === 8 &&
        updated.revisionAlertsEnabled === false &&
        updated.leaderboardVisible === false
      ) {
        console.log("✓ System Settings Updated: Global variables stored correctly.");
      } else {
        throw new Error(`Settings mismatch: ${JSON.stringify(updated)}`);
      }
    } else {
      throw new Error(`Settings Save Failed: ${JSON.stringify(resSettings.body)}`);
    }
    
    // Restore original settings
    if (origSettings) {
      await SystemSettings.findOneAndUpdate({}, origSettings);
    } else {
      await SystemSettings.deleteOne({});
    }
    console.log("✓ Original global settings restored.");

    // ----------------------------------------------------
    // SETUP FOR USER DATA TESTS
    // ----------------------------------------------------
    console.log("\nSetting up mock user, topics, and problem mapping...");
    let mockUser = await User.findOne({ email: "testadminuser@algomentor.com" });
    if (!mockUser) {
      mockUser = await User.create({
        username: "testadminuser",
        email: "testadminuser@algomentor.com",
        password: "password123",
        currentLevel: "beginner"
      });
    }
    
    // Ensure we have at least one topic and one problem mapping in db
    let mockTopic = await Topic.findOne({ name: "Testing Trees" });
    if (!mockTopic) {
      mockTopic = await Topic.create({
        name: "Testing Trees",
        order: 99,
        subtopics: [
          {
            name: "Tree Traversals",
            order: 1,
            difficulty: "easy",
            prerequisites: [],
            unlockThreshold: 35
          },
          {
            name: "Binary Search Tree Operations",
            order: 2,
            difficulty: "medium",
            prerequisites: ["Tree Traversals"],
            unlockThreshold: 35
          }
        ]
      });
    }

    let mockProblem = await ProblemMapping.findOne({ platformProblemId: "tree-inorder-traversal-mock" });
    if (!mockProblem) {
      mockProblem = await ProblemMapping.create({
        platformProblemId: "tree-inorder-traversal-mock",
        platform: "leetcode",
        title: "Tree Inorder Traversal Mock",
        url: "https://leetcode.com/problems/mock-traversal",
        topic: "Testing Trees",
        subtopic: "Tree Traversals",
        difficulty: "easy"
      });
    }

    // Initialize/reset user progress
    await UserProgress.deleteMany({ userId: mockUser._id });
    await TopicPerformance.deleteMany({ userId: mockUser._id });
    
    const initProgress = await UserProgress.create({
      userId: mockUser._id,
      unlockedSubtopics: ["Tree Traversals"],
      completedSubtopics: [],
      mastery: new Map(),
      solvedProblems: []
    });

    // ----------------------------------------------------
    // TEST 3: Mark Problem solved & trigger calculations
    // ----------------------------------------------------
    console.log("\n[Test 3] Simulating user solving problem and verifying engine progression...");
    const reqSolve = {
      params: { userId: mockUser._id.toString() },
      body: {
        problemId: mockProblem._id.toString(),
        status: "solved"
      }
    };
    const resSolve = mockResponse();
    await markProblemStatus(reqSolve, resSolve);

    if (resSolve.statusCode && resSolve.statusCode >= 400) {
      throw new Error(`Solve Simulation Failed: ${JSON.stringify(resSolve.body)}`);
    }

    // Verify UserProgress
    const updatedProgress = await UserProgress.findOne({ userId: mockUser._id });
    const solvedSet = new Set(updatedProgress.solvedProblems.map(id => id.toString()));
    
    // Verify TopicPerformance
    const perf = await TopicPerformance.findOne({ userId: mockUser._id, subtopic: "Tree Traversals" });

    if (solvedSet.has(mockProblem._id.toString()) && perf && perf.masteryScore > 0) {
      console.log(`✓ Solve Simulation Passed: Problem added to solved list. Mastery calculated: ${perf.masteryScore}%.`);
      
      // Let's verify if the dependent subtopic BST Operations is unlocked (since threshold is 35 and mock mastery is likely 100 for a single solve)
      if (updatedProgress.unlockedSubtopics.includes("Binary Search Tree Operations")) {
        console.log("✓ Progression Pipeline Passed: 'Binary Search Tree Operations' unlocked dynamically.");
      } else {
        console.log("⚠ Progression Pipeline warning: 'Binary Search Tree Operations' was not unlocked (Mastery Score too low?): ", perf.masteryScore);
      }
    } else {
      throw new Error(`Verification failed. Progress: ${JSON.stringify(updatedProgress)}, Perf: ${JSON.stringify(perf)}`);
    }

    // ----------------------------------------------------
    // TEST 4: Reset Progress
    // ----------------------------------------------------
    console.log("\n[Test 4] Testing progress reset override...");
    const reqReset = {
      params: { userId: mockUser._id.toString() }
    };
    const resReset = mockResponse();
    await resetProgress(reqReset, resReset);

    const resetUserProgress = await UserProgress.findOne({ userId: mockUser._id });
    const resetPerfs = await TopicPerformance.find({ userId: mockUser._id });

    if (
      resetUserProgress &&
      resetUserProgress.solvedProblems.length === 0 &&
      resetUserProgress.mastery.size === 0 &&
      resetPerfs.length === 0
    ) {
      console.log("✓ Progress Reset Passed: Solved problems, masteries, and performances completely wiped.");
    } else {
      throw new Error(`Reset verification failed: Progress: ${JSON.stringify(resetUserProgress)}, Perfs Count: ${resetPerfs.length}`);
    }

    // ----------------------------------------------------
    // CLEAN UP
    // ----------------------------------------------------
    console.log("\nCleaning up simulation test artifacts...");
    await UserProgress.deleteMany({ userId: mockUser._id });
    await TopicPerformance.deleteMany({ userId: mockUser._id });
    await ProblemMapping.deleteOne({ _id: mockProblem._id });
    await Topic.deleteOne({ _id: mockTopic._id });
    await User.deleteOne({ _id: mockUser._id });
    console.log("✓ Mock entities removed from DB.");

    console.log("\n=== ALL ADMIN BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY ===");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ VERIFICATION TEST SUITE FAILED:");
    console.error(error);
    process.exit(1);
  }
};

runTests();
