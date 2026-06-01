const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");
const { runUnlockEngine } = require("../engines/unlockEngine");

// Dynamically patch 'gfg' platform enums to avoid validation errors
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


const seedDummyUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/algomentor";
    console.log("Connecting to database:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    // Fetch topics from database to normalize names
    const topics = await Topic.find({});
    const allSubtopicNames = [];
    topics.forEach((t) => {
      t.subtopics.forEach((s) => {
        allSubtopicNames.push(s.name);
      });
    });

    const normMap = {};
    allSubtopicNames.forEach(name => {
      normMap[name.toLowerCase()] = name;
      const cleanName = name.toLowerCase()
        .replace(/^stage\s+\d+\s*[-—:\s]*/i, '')
        .replace(/[^a-z0-9]/g, '');
      normMap[cleanName] = name;
    });

    const manual = {
      "array basics": "Stage 1 — Array Basics & Traversal",
      "prefix sum": "Stage 2 — Prefix Sum",
      "difference array": "Stage 3 — Difference Array",
      "kadane algorithm": "Stage 4 — Kadane's Algorithm",
      "kadanes algorithm": "Stage 4 — Kadane's Algorithm",
      "sliding window fixed": "Stage 5 — Sliding Window Fixed Size",
      "sliding window variable": "Stage 6 — Sliding Window Variable Size",
      "two pointers": "Stage 7 — Two Pointers",
      "fast & slow pointers": "Stage 8 — Fast & Slow Pointers",
      "three pointers & k-sum": "Stage 9 — Three Pointers & K-Sum",
      "frequency count": "Stage 10 — Frequency Count & Hashing",
      "sorting techniques": "Stage 11 — Sorting Techniques",
      "binary search on arrays": "Stage 12 — Binary Search on Arrays",
      "string basics": "Stage 1 — String Basics",
      "string manipulation": "Stage 2 — String Manipulation",
      "pattern matching": "Stage 3 — Pattern Matching (KMP/Z)",
      "anagrams": "Stage 4 — Anagrams & Frequency Maps",
      "palindrome": "Stage 5 — Palindrome Problems",
      "sliding window on strings": "Stage 6 — Sliding Window on Strings",
      "hashmap basics": "Stage 1 — HashMap Basics",
      "two sum variants": "Stage 3 — Two Sum Variants",
      "subarray sum": "Stage 4 — Subarray with Given Sum",
      "longest subarray": "Stage 5 — Longest Subarray Problems",
      "classic bs": "Stage 1 — Classic Binary Search",
      "classic binary search": "Stage 1 — Classic Binary Search",
      "bs on answer": "Stage 2 — Binary Search on Answer",
      "search rotated": "Stage 3 — Search in Rotated Array",
      "search rotated array": "Stage 3 — Search in Rotated Array",
      "bs on 2d matrix": "Stage 4 — BS on 2D Matrix",
      "aggressive problems": "Stage 5 — Aggressive Problems (Minimize Max)",
      "recursion basics": "Stage 1 — Recursion Basics",
      "subsets": "Stage 2 — Subset & Subsequence Generation",
      "subset generation": "Stage 2 — Subset & Subsequence Generation",
      "permutations": "Stage 3 — Permutations",
      "backtracking basics": "Stage 4 — Backtracking Basics",
      "n-queens": "Stage 5 — N-Queens & Sudoku Solver",
      "word search": "Stage 6 — Word Search & Maze Problems",
      "ll basics": "Stage 1 — LL Basics & Traversal",
      "ll reversal": "Stage 2 — Reversal Problems",
      "fast slow on ll": "Stage 3 — Fast & Slow Pointer on LL",
      "merge sort ll": "Stage 4 — Merge & Sort LL",
      "cycle detection": "Stage 5 — Cycle Detection"
    };

    const getDbName = (name) => {
      if (!name) return "";
      const lower = name.toLowerCase().trim();
      if (normMap[lower]) return normMap[lower];

      const clean = lower.replace(/[^a-z0-9]/g, '');
      if (normMap[clean]) return normMap[clean];

      if (manual[lower]) return manual[lower];

      const cleanManual = lower.replace(/^stage\s+\d+\s*[-—:\s]*/i, '').replace(/[^a-z0-9]/g, '');
      if (manual[cleanManual]) return manual[cleanManual];

      const found = allSubtopicNames.find(n => n.toLowerCase().includes(lower) || lower.includes(n.toLowerCase()));
      if (found) return found;

      return name;
    };

    // Delete existing dummy user if any
    const email = "test@algomentor.com";
    console.log(`Clearing existing dummy data for ${email}...`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await UserProgress.deleteOne({ userId: existingUser._id });
      await TopicPerformance.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create User
    const hashedPassword = await bcrypt.hash("Test@123", 10);
    const user = new User({
      username: "testuser",
      email: email,
      password: hashedPassword,
      currentLevel: "intermediate",
      studiedTopics: [
        "Arrays", "Strings", "Hashing", 
        "Binary Search", "Recursion", "Linked List"
      ],
      leetcodeHandle: "testuser_lc",
      codeforcesHandle: "testuser_cf",
      codechefHandle: "testuser_cc",
      gfgHandle: "testuser_gfg",
      hackerrankHandle: "testuser_hr",
      name: "Test User",
      college: "AlgoMentor Academy",
      branch: "Computer Science",
      batch: "2026"
    });

    // Attach platform stats
    user.set("platformStats", {
      leetcode: { solved: 148, easy: 87, medium: 56, hard: 5, contestRating: 1420 },
      codeforces: { rating: 1100, maxRating: 1180, rank: "pupil", solved: 45, contests: 8 },
      codechef: { rating: 1083, highest: 1083, stars: 1, solved: 32 },
      gfg: { score: 145, solved: 68, instituteRank: 12 },
      hackerrank: { score: 10, level: 5, badges: 1 }
    });

    await user.save();
    console.log("User testuser created successfully!");

    // Fetch real problems to associate to testuser
    const arraysStage1Probs = await ProblemMapping.find({
      topic: "Arrays",
      subtopic: "Stage 1 — Array Basics & Traversal"
    });
    const stringsStage1Probs = await ProblemMapping.find({
      topic: "Strings",
      subtopic: "Stage 1 — String Basics"
    });
    const hashingStage1Probs = await ProblemMapping.find({
      topic: "Hashing",
      subtopic: "Stage 1 — HashMap Basics"
    });
    const treesStage1Probs = await ProblemMapping.find({
      topic: "Trees",
      subtopic: "Stage 1 — Tree Traversals (BFS/DFS)"
    }).limit(2);
    const graphsStage1Probs = await ProblemMapping.find({
      topic: "Graphs",
      subtopic: "Stage 1 — Graph Representation"
    }).limit(2);

    const solvedProblemsList = [
      ...arraysStage1Probs,
      ...stringsStage1Probs,
      ...hashingStage1Probs,
      ...treesStage1Probs,
      ...graphsStage1Probs
    ];
    const solvedProblemIds = solvedProblemsList.map((p) => p._id);

    // Initial unlocks and completed
    const rawUnlocked = [
      "Array Basics", "Prefix Sum", "Sliding Window Fixed",
      "Sliding Window Variable", "Two Pointers", "Kadane Algorithm",
      "String Basics", "String Manipulation", "Anagrams",
      "HashMap Basics", "Frequency Count", "Two Sum Variants",
      "Classic Binary Search", "Search Rotated Array",
      "Recursion Basics", "Subset Generation",
      "LL Basics", "LL Reversal",
      "Stage 1 — Tree Traversals (BFS/DFS)",
      "Stage 1 — Graph Representation"
    ];
    const rawCompleted = ["Array Basics", "String Basics", "HashMap Basics"];

    const normalizedUnlocked = Array.from(new Set(rawUnlocked.map(getDbName)));
    const normalizedCompleted = Array.from(new Set(rawCompleted.map(getDbName)));

    const rawMastery = {
      "Array Basics": 91,
      "Prefix Sum": 82,
      "Sliding Window Fixed": 45,
      "Sliding Window Variable": 28,
      "Two Pointers": 31,
      "Kadane Algorithm": 67,
      "String Basics": 88,
      "String Manipulation": 52,
      "Anagrams": 35,
      "HashMap Basics": 79,
      "Frequency Count": 61,
      "Two Sum Variants": 44,
      "Classic Binary Search": 73,
      "Search Rotated Array": 38,
      "Recursion Basics": 55,
      "Subset Generation": 22,
      "LL Basics": 69,
      "LL Reversal": 41,
      "Stage 1 — Tree Traversals (BFS/DFS)": 40,
      "Stage 1 — Graph Representation": 50
    };

    const progressMastery = new Map();
    Object.keys(rawMastery).forEach(key => {
      progressMastery.set(getDbName(key), rawMastery[key]);
    });

    // Create UserProgress
    const progress = new UserProgress({
      userId: user._id,
      unlockedSubtopics: normalizedUnlocked,
      completedSubtopics: normalizedCompleted,
      mastery: progressMastery,
      solvedProblems: solvedProblemIds,
      lastActivityDate: new Date()
    });

    await progress.save();
    console.log("UserProgress created successfully!");

    // Create TopicPerformance records
    const subtopicData = [
      { subtopic: "Array Basics", topic: "Arrays", masteryScore: 91, weaknessScore: 9, accuracy: 100, totalSolved: 5, totalAttempted: 5, daysAgo: 2, revisionNeeded: false },
      { subtopic: "Prefix Sum", topic: "Arrays", masteryScore: 82, weaknessScore: 18, accuracy: 85, totalSolved: 14, totalAttempted: 17, daysAgo: 5, revisionNeeded: false },
      { subtopic: "Sliding Window Fixed", topic: "Arrays", masteryScore: 45, weaknessScore: 55, accuracy: 48, totalSolved: 6, totalAttempted: 13, daysAgo: 8, revisionNeeded: false },
      { subtopic: "Sliding Window Variable", topic: "Arrays", masteryScore: 28, weaknessScore: 72, accuracy: 30, totalSolved: 3, totalAttempted: 10, daysAgo: 20, revisionNeeded: true },
      { subtopic: "Two Pointers", topic: "Arrays", masteryScore: 31, weaknessScore: 69, accuracy: 33, totalSolved: 4, totalAttempted: 12, daysAgo: 15, revisionNeeded: true },
      { subtopic: "Kadane Algorithm", topic: "Arrays", masteryScore: 67, weaknessScore: 33, accuracy: 70, totalSolved: 8, totalAttempted: 12, daysAgo: 3, revisionNeeded: false },
      { subtopic: "String Basics", topic: "Strings", masteryScore: 88, weaknessScore: 12, accuracy: 100, totalSolved: 5, totalAttempted: 5, daysAgo: 1, revisionNeeded: false },
      { subtopic: "String Manipulation", topic: "Strings", masteryScore: 52, weaknessScore: 48, accuracy: 54, totalSolved: 7, totalAttempted: 13, daysAgo: 10, revisionNeeded: false },
      { subtopic: "Anagrams", topic: "Strings", masteryScore: 35, weaknessScore: 65, accuracy: 36, totalSolved: 4, totalAttempted: 11, daysAgo: 18, revisionNeeded: true },
      { subtopic: "HashMap Basics", topic: "Hashing", masteryScore: 79, weaknessScore: 21, accuracy: 100, totalSolved: 5, totalAttempted: 5, daysAgo: 4, revisionNeeded: false },
      { subtopic: "Frequency Count", topic: "Hashing", masteryScore: 61, weaknessScore: 39, accuracy: 62, totalSolved: 9, totalAttempted: 15, daysAgo: 7, revisionNeeded: false },
      { subtopic: "Two Sum Variants", topic: "Hashing", masteryScore: 44, weaknessScore: 56, accuracy: 45, totalSolved: 5, totalAttempted: 11, daysAgo: 12, revisionNeeded: false },
      { subtopic: "Classic Binary Search", topic: "Binary Search", masteryScore: 73, weaknessScore: 27, accuracy: 75, totalSolved: 11, totalAttempted: 15, daysAgo: 6, revisionNeeded: false },
      { subtopic: "Search Rotated Array", topic: "Binary Search", masteryScore: 38, weaknessScore: 62, accuracy: 40, totalSolved: 4, totalAttempted: 10, daysAgo: 22, revisionNeeded: true },
      { subtopic: "Recursion Basics", topic: "Recursion & Backtracking", masteryScore: 55, weaknessScore: 45, accuracy: 56, totalSolved: 8, totalAttempted: 14, daysAgo: 9, revisionNeeded: false },
      { subtopic: "Subset Generation", topic: "Recursion & Backtracking", masteryScore: 22, weaknessScore: 78, accuracy: 24, totalSolved: 2, totalAttempted: 9, daysAgo: 25, revisionNeeded: true },
      { subtopic: "LL Basics", topic: "Linked List", masteryScore: 69, weaknessScore: 31, accuracy: 70, totalSolved: 10, totalAttempted: 14, daysAgo: 5, revisionNeeded: false },
      { subtopic: "LL Reversal", topic: "Linked List", masteryScore: 41, weaknessScore: 59, accuracy: 42, totalSolved: 4, totalAttempted: 10, daysAgo: 16, revisionNeeded: true },
      { subtopic: "Stage 1 — Tree Traversals (BFS/DFS)", topic: "Trees", masteryScore: 40, weaknessScore: 60, accuracy: 40, totalSolved: 2, totalAttempted: 5, daysAgo: 1, revisionNeeded: false },
      { subtopic: "Stage 1 — Graph Representation", topic: "Graphs", masteryScore: 50, weaknessScore: 50, accuracy: 50, totalSolved: 2, totalAttempted: 4, daysAgo: 1, revisionNeeded: false }
    ];

    const performanceRecords = subtopicData.map((data) => {
      return new TopicPerformance({
        userId: user._id,
        subtopic: getDbName(data.subtopic),
        topic: data.topic,
        masteryScore: data.masteryScore,
        weaknessScore: data.weaknessScore,
        accuracy: data.accuracy,
        totalSolved: data.totalSolved,
        totalAttempted: data.totalAttempted,
        lastPracticed: new Date(Date.now() - data.daysAgo * 24 * 60 * 60 * 1000),
        revisionNeeded: data.revisionNeeded,
        platform: "combined"
      });
    });

    await TopicPerformance.insertMany(performanceRecords);
    console.log("TopicPerformance records created successfully!");

    // Run the unlock engine for testuser so their unlocks are 100% correct from the start
    console.log("Running runUnlockEngine for testuser...");
    const newlyUnlocked = await runUnlockEngine(user._id);
    console.log("Newly unlocked subtopics by engine run:", newlyUnlocked);

    console.log("Seeding completed successfully!");
    mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDummyUser();
