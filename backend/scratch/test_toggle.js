const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const ProblemMapping = require("../models/ProblemMapping");
const TopicPerformance = require("../models/TopicPerformance");

// Load model patches to allow 'gfg'
if (ProblemMapping.schema && ProblemMapping.schema.path) {
  const platformPath = ProblemMapping.schema.path("platform");
  if (platformPath && platformPath.enumValues && !platformPath.enumValues.includes("gfg")) {
    platformPath.enumValues.push("gfg");
  }
}
if (TopicPerformance.schema && TopicPerformance.schema.path) {
  const platformPath = TopicPerformance.schema.path("platform");
  if (platformPath && platformPath.enumValues && !platformPath.enumValues.includes("gfg")) {
    platformPath.enumValues.push("gfg");
  }
}

const testToggle = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for testing.");

    const user = await User.findOne({ email: "test@algomentor.com" });
    if (!user) {
      console.error("User not found!");
      process.exit(1);
    }
    console.log("Found user:", user.username);

    // Let's find an Arrays Stage 1 problem
    const problem = await ProblemMapping.findOne({
      topic: "Arrays",
      subtopic: "Stage 1 — Array Basics & Traversal",
      title: "Two Sum"
    });

    if (!problem) {
      console.error("Problem 'Two Sum' not found!");
      process.exit(1);
    }
    console.log("Found problem:", problem.title, "ID:", problem._id);

    // Let's check initial status
    let progress = await UserProgress.findOne({ userId: user._id });
    let solvedSet = new Set(progress.solvedProblems.map(id => id.toString()));
    console.log("Is 'Two Sum' initially solved?", solvedSet.has(problem._id.toString()));

    // Find performance before toggle
    let performance = await TopicPerformance.findOne({
      userId: user._id,
      subtopic: problem.subtopic
    });
    console.log("Before toggle: solvedCount =", performance.totalSolved, "attempted =", performance.totalAttempted, "accuracy =", performance.accuracy, "mastery =", performance.masteryScore);

    // Simulate calling the toggle-problem API logic
    const { calculatePerformanceScores } = require("../engines/weaknessEngine");
    const { runUnlockEngine } = require("../engines/unlockEngine");

    // Toggle 1: Unmark it (since dummy seeder marked all Arrays Stage 1 solved)
    console.log("\n--- Simulating Toggling Unmark ---");
    let isSolved = solvedSet.has(problem._id.toString());
    if (isSolved) {
      performance.totalSolved = Math.max(0, performance.totalSolved - 1);
      performance.totalAttempted = Math.max(0, performance.totalAttempted - 1);
      progress.solvedProblems = progress.solvedProblems.filter(
        id => id.toString() !== problem._id.toString()
      );
    } else {
      performance.totalSolved += 1;
      performance.totalAttempted += 1;
      progress.solvedProblems.push(problem._id);
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
    await progress.save();

    console.log("After unmark toggle: solvedCount =", performance.totalSolved, "attempted =", performance.totalAttempted, "accuracy =", performance.accuracy, "mastery =", performance.masteryScore);

    // Toggle 2: Mark it again
    console.log("\n--- Simulating Toggling Mark ---");
    progress = await UserProgress.findOne({ userId: user._id });
    solvedSet = new Set(progress.solvedProblems.map(id => id.toString()));
    isSolved = solvedSet.has(problem._id.toString());

    if (isSolved) {
      performance.totalSolved = Math.max(0, performance.totalSolved - 1);
      performance.totalAttempted = Math.max(0, performance.totalAttempted - 1);
      progress.solvedProblems = progress.solvedProblems.filter(
        id => id.toString() !== problem._id.toString()
      );
    } else {
      performance.totalSolved += 1;
      performance.totalAttempted += 1;
      progress.solvedProblems.push(problem._id);
    }

    if (performance.totalSolved > performance.totalAttempted) {
      performance.totalAttempted = performance.totalSolved;
    }

    performance.lastPracticed = new Date();
    const scores2 = calculatePerformanceScores(performance, problem.difficulty);
    performance.accuracy = Math.round(performance.totalAttempted > 0 ? (performance.totalSolved / performance.totalAttempted) * 100 : 0);
    performance.consistencyScore = scores2.consistencyScore;
    performance.difficultyWeight = scores2.difficultyWeight;
    performance.masteryScore = Math.round((performance.accuracy * 0.4) + (performance.consistencyScore * 0.3) + (performance.difficultyWeight * 0.3));
    performance.weaknessScore = Math.round(100 - performance.masteryScore);

    await performance.save();
    progress.mastery.set(problem.subtopic, performance.masteryScore);
    await progress.save();

    console.log("After mark toggle: solvedCount =", performance.totalSolved, "attempted =", performance.totalAttempted, "accuracy =", performance.accuracy, "mastery =", performance.masteryScore);

    mongoose.disconnect();
    console.log("\nTest completed successfully!");
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
};

testToggle();
