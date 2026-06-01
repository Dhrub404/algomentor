const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const { syncPlatformData } = require("../controllers/userController");

const runValidation = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/algomentor");
    console.log("Connected successfully!");

    // Create a mock user
    const testUsername = `test_sync_user_${Date.now()}`;
    console.log(`Creating test user: ${testUsername}...`);
    const testUser = new User({
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: "password123",
      leetcodeHandle: "lc_test_handle",
      codeforcesHandle: "cf_test_handle",
      codechefHandle: "cc_test_handle",
      gfgHandle: "gfg_test_handle",
      hackerrankHandle: "hr_test_handle",
      codingNinjasHandle: "cn_test_handle",
      hackerEarthHandle: "he_test_handle",
      studiedTopics: ["Stage 1 — Array Basics & Traversal", "Stage 2 — Prefix Sum"]
    });
    await testUser.save();
    console.log("Test user created!");

    // Run platform sync
    console.log("Running platform sync for all 7 handles...");
    const syncResult = await syncPlatformData(testUser);
    console.log("Platform sync finished! Result:", syncResult);

    // Retrieve progress and performances
    const progress = await UserProgress.findOne({ userId: testUser._id });
    const performances = await TopicPerformance.find({ userId: testUser._id });

    console.log("\n--- VALIDATION CHECKLIST ---");
    console.log(`Solved Problems count: ${progress.solvedProblems.length} (Expected > 0)`);
    console.log(`Topic Performances populated: ${performances.length} entries (Expected > 0)`);
    console.log(`Unlocked Subtopics:`, progress.unlockedSubtopics);
    
    const isArraysUnlocked = progress.unlockedSubtopics.includes("Stage 1 — Array Basics & Traversal");
    console.log(`Is Arrays Stage 1 unlocked? ${isArraysUnlocked ? "YES (PASSED)" : "NO (FAILED)"}`);

    const distinctPlatforms = Array.from(new Set(performances.map(p => p.platform)));
    console.log(`Platforms found in TopicPerformance:`, distinctPlatforms);

    // Clean up
    console.log("\nCleaning up test data...");
    await User.deleteOne({ _id: testUser._id });
    await UserProgress.deleteOne({ userId: testUser._id });
    await TopicPerformance.deleteMany({ userId: testUser._id });
    console.log("Cleanup done!");

    await mongoose.disconnect();
    console.log("Validation complete.");
    process.exit(0);
  } catch (err) {
    console.error("Validation error:", err);
    process.exit(1);
  }
};

runValidation();
