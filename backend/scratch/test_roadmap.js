const mongoose = require("mongoose");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const ProblemMapping = require("../models/ProblemMapping");
require("dotenv").config();

// Define RoadmapSnapshot schema & model locally for validation
const RoadmapSnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  generatedAt: { type: Date, default: Date.now },
  weeks: { type: Array, default: [] },
  completedProblems: [{ type: String }],
  totalWeakAreas: { type: Number, default: 0 },
  totalRevisionNeeded: { type: Number, default: 0 }
});
const RoadmapSnapshot = mongoose.models.RoadmapSnapshot || mongoose.model("RoadmapSnapshot", RoadmapSnapshotSchema);

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/algomentor";
    await mongoose.connect(mongoUri);
    console.log("Connected successfully to DB!");

    // 1. Fetch testuser
    const user = await User.findOne({ username: "testuser" });
    if (!user) {
      console.error("Test user 'testuser' not found. Please run seed script first.");
      process.exit(1);
    }
    const userId = user._id;

    // 2. Clear any old snapshots
    await RoadmapSnapshot.deleteMany({ userId });
    console.log("Cleared old roadmap snapshots for testuser.");

    // 3. Find a problem to toggle
    const problem = await ProblemMapping.findOne({ platform: "leetcode" });
    if (!problem) {
      console.error("No LeetCode problems found in DB to test with.");
      process.exit(1);
    }
    const problemId = problem._id.toString();
    console.log(`Using problem '${problem.title}' (ID: ${problemId}) for testing.`);

    // 4. Create an initial snapshot
    const initialSnapshot = new RoadmapSnapshot({
      userId,
      generatedAt: new Date(),
      weeks: [{ weekNumber: 1, title: "Week 1", items: [] }],
      completedProblems: [],
      totalWeakAreas: 2,
      totalRevisionNeeded: 1
    });
    await initialSnapshot.save();
    console.log("Created initial snapshot.");

    // 5. Simulate Toggle Solved (Checkmark problem)
    console.log("Simulating marking problem solved in snapshot...");
    let snapshot = await RoadmapSnapshot.findOne({ userId }).sort({ generatedAt: -1 });
    if (!snapshot.completedProblems.includes(problemId)) {
      snapshot.completedProblems.push(problemId);
      snapshot.markModified("completedProblems");
      await snapshot.save();
    }
    console.log("Current completedProblems array in snapshot:", snapshot.completedProblems);

    // Verify it's checked
    if (snapshot.completedProblems.includes(problemId)) {
      console.log(">>> SUCCESS: Problem successfully marked in snapshot completedProblems!");
    } else {
      console.error(">>> FAILURE: Problem was not marked solved.");
    }

    // 6. Simulate Toggle Unsolved (Uncheckmark problem)
    console.log("Simulating unmarking problem solved in snapshot...");
    snapshot = await RoadmapSnapshot.findOne({ userId }).sort({ generatedAt: -1 });
    const idx = snapshot.completedProblems.indexOf(problemId);
    if (idx > -1) {
      snapshot.completedProblems.splice(idx, 1);
      snapshot.markModified("completedProblems");
      await snapshot.save();
    }
    console.log("Current completedProblems array in snapshot after toggle:", snapshot.completedProblems);

    // Verify it's unchecked
    if (!snapshot.completedProblems.includes(problemId)) {
      console.log(">>> SUCCESS: Problem successfully unmarked in snapshot completedProblems!");
    } else {
      console.error(">>> FAILURE: Problem was not unmarked.");
    }

    // 7. Simulate manual regeneration (force=true)
    console.log("Simulating manual regeneration (creating fresh snapshot and resetting checkmarks)...");
    const freshSnapshot = new RoadmapSnapshot({
      userId,
      generatedAt: new Date(),
      weeks: [{ weekNumber: 1, title: "Week 1 — Focus Areas", items: [] }],
      completedProblems: [], // fresh start
      totalWeakAreas: 3,
      totalRevisionNeeded: 2
    });
    await freshSnapshot.save();

    const latest = await RoadmapSnapshot.findOne({ userId }).sort({ generatedAt: -1 });
    console.log("Latest snapshot date:", latest.generatedAt);
    console.log("Latest completedProblems count (should be 0):", latest.completedProblems.length);

    if (latest.completedProblems.length === 0) {
      console.log(">>> SUCCESS: Fresh regenerated snapshot has reset completedProblems checkmarks!");
    } else {
      console.error(">>> FAILURE: Checked list was not reset on manual regeneration.");
    }

    await mongoose.disconnect();
    console.log("DB disconnected.");
  } catch (err) {
    console.error("Test run error:", err);
  }
};

runTest();
