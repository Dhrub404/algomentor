const mongoose = require("mongoose");
require("dotenv").config();

const { calculatePerformanceScores } = require("../engines/weaknessEngine");
const { evaluateUnlocks } = require("../engines/unlockEngine");
const { runRevisionCheck } = require("../engines/revisionEngine");

// Mock schemas and engines runner to verify algorithms
const runDiagnosticTests = async () => {
  console.log("=== STARTING DIAGNOSTIC ENGINE TESTS ===");

  // 1. Test Weakness Engine
  console.log("\n1. Testing Weakness & Mastery Score Formulas...");
  
  // Test case A: Low accuracy, many wrong attempts, recent activity
  const perfA = {
    totalAttempted: 10,
    totalSolved: 3,
    wrongAttempts: 7,
    lastPracticed: new Date()
  };
  const difficultyA = "medium";
  const scoresA = calculatePerformanceScores(perfA, difficultyA);
  console.log("Test Case A (30% Accuracy, 7 Wrong, Medium Difficulty):", scoresA);
  
  // Expected ranges check:
  // accuracy should be 30
  // weaknessScore should be high due to low accuracy (1 - 0.3) * 40 = 28 and wrong attempts points min(7*5, 30) = 30
  if (scoresA.accuracy !== 30) {
    console.error("FAIL: Accuracy calculation error");
  } else {
    console.log("PASS: Accuracy calculation matches expected 30%");
  }
  
  // Test case B: High accuracy, few wrong attempts, old activity
  const perfB = {
    totalAttempted: 5,
    totalSolved: 5,
    wrongAttempts: 0,
    lastPracticed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  };
  const difficultyB = "easy";
  const scoresB = calculatePerformanceScores(perfB, difficultyB);
  console.log("Test Case B (100% Accuracy, 0 Wrong, 15 Days Idle, Easy Difficulty):", scoresB);
  
  if (scoresB.accuracy !== 100) {
    console.error("FAIL: Accuracy calculation error for 100%");
  } else {
    console.log("PASS: Accuracy calculation matches expected 100%");
  }

  // 2. Test Unlock Engine
  console.log("\n2. Testing Unlock Evaluation Conditions...");
  
  // Subtopic definitions
  const mockTopics = [
    {
      name: "Arrays",
      subtopics: [
        { name: "Basics", prerequisites: [] },
        { name: "Two Pointers", prerequisites: ["Basics"] }
      ]
    }
  ];

  // Test case A: Prerequisite not met
  const mockPerformancesFail = [
    {
      subtopic: "Basics",
      totalSolved: 1, // 1 / 5 solved (20%)
      masteryScore: 20
    }
  ];
  // Basics has 5 problems in total in our real seed, so solveRate is 20%
  const unlocksFail = evaluateUnlocks(mockPerformancesFail, mockTopics);
  console.log("Unlocked Subtopics (Failed Prereq Basics):", unlocksFail);
  if (unlocksFail.includes("Two Pointers")) {
    console.error("FAIL: Two Pointers unlocked unexpectedly!");
  } else {
    console.log("PASS: Two Pointers remained locked due to low prerequisite solve rate");
  }

  // Test case B: Prerequisite met
  const mockPerformancesPass = [
    {
      subtopic: "Basics",
      totalSolved: 3, // 3 / 5 solved (60%)
      masteryScore: 45
    }
  ];
  const unlocksPass = evaluateUnlocks(mockPerformancesPass, mockTopics);
  console.log("Unlocked Subtopics (Passed Prereq Basics):", unlocksPass);
  if (unlocksPass.includes("Two Pointers")) {
    console.log("PASS: Two Pointers successfully unlocked!");
  } else {
    console.error("FAIL: Two Pointers failed to unlock despite prerequisite match");
  }

  console.log("\n=== ALL TESTS FINISHED ===");
  process.exit(0);
};

runDiagnosticTests();
