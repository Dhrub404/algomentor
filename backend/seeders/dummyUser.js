const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");

const seedDummyUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/algomentor";
    console.log("Connecting to database:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

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

    // Fetch 46 random problem mapping entries to set streak to 5
    const problems = await ProblemMapping.find({}).limit(46);
    const solvedProblemIds = problems.map((p) => p._id);

    // Create UserProgress
    const progress = new UserProgress({
      userId: user._id,
      unlockedSubtopics: [
        "Array Basics", "Prefix Sum", "Sliding Window Fixed",
        "Sliding Window Variable", "Two Pointers", "Kadane Algorithm",
        "String Basics", "String Manipulation", "Anagrams",
        "HashMap Basics", "Frequency Count", "Two Sum Variants",
        "Classic Binary Search", "Search Rotated Array",
        "Recursion Basics", "Subset Generation",
        "LL Basics", "LL Reversal"
      ],
      completedSubtopics: ["Array Basics", "String Basics", "HashMap Basics"],
      mastery: {
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
        "LL Reversal": 41
      },
      solvedProblems: solvedProblemIds,
      lastActivityDate: new Date()
    });

    await progress.save();
    console.log("UserProgress created successfully!");

    // Create TopicPerformance records
    const subtopicData = [
      { subtopic: "Array Basics", topic: "Arrays", masteryScore: 91, weaknessScore: 9, accuracy: 92, totalSolved: 18, totalAttempted: 20, daysAgo: 2, revisionNeeded: false },
      { subtopic: "Prefix Sum", topic: "Arrays", masteryScore: 82, weaknessScore: 18, accuracy: 85, totalSolved: 14, totalAttempted: 17, daysAgo: 5, revisionNeeded: false },
      { subtopic: "Sliding Window Fixed", topic: "Arrays", masteryScore: 45, weaknessScore: 55, accuracy: 48, totalSolved: 6, totalAttempted: 13, daysAgo: 8, revisionNeeded: false },
      { subtopic: "Sliding Window Variable", topic: "Arrays", masteryScore: 28, weaknessScore: 72, accuracy: 30, totalSolved: 3, totalAttempted: 10, daysAgo: 20, revisionNeeded: true },
      { subtopic: "Two Pointers", topic: "Arrays", masteryScore: 31, weaknessScore: 69, accuracy: 33, totalSolved: 4, totalAttempted: 12, daysAgo: 15, revisionNeeded: true },
      { subtopic: "Kadane Algorithm", topic: "Arrays", masteryScore: 67, weaknessScore: 33, accuracy: 70, totalSolved: 8, totalAttempted: 12, daysAgo: 3, revisionNeeded: false },
      { subtopic: "String Basics", topic: "Strings", masteryScore: 88, weaknessScore: 12, accuracy: 90, totalSolved: 16, totalAttempted: 18, daysAgo: 1, revisionNeeded: false },
      { subtopic: "String Manipulation", topic: "Strings", masteryScore: 52, weaknessScore: 48, accuracy: 54, totalSolved: 7, totalAttempted: 13, daysAgo: 10, revisionNeeded: false },
      { subtopic: "Anagrams", topic: "Strings", masteryScore: 35, weaknessScore: 65, accuracy: 36, totalSolved: 4, totalAttempted: 11, daysAgo: 18, revisionNeeded: true },
      { subtopic: "HashMap Basics", topic: "Hashing", masteryScore: 79, weaknessScore: 21, accuracy: 80, totalSolved: 12, totalAttempted: 15, daysAgo: 4, revisionNeeded: false },
      { subtopic: "Frequency Count", topic: "Hashing", masteryScore: 61, weaknessScore: 39, accuracy: 62, totalSolved: 9, totalAttempted: 15, daysAgo: 7, revisionNeeded: false },
      { subtopic: "Two Sum Variants", topic: "Hashing", masteryScore: 44, weaknessScore: 56, accuracy: 45, totalSolved: 5, totalAttempted: 11, daysAgo: 12, revisionNeeded: false },
      { subtopic: "Classic Binary Search", topic: "Binary Search", masteryScore: 73, weaknessScore: 27, accuracy: 75, totalSolved: 11, totalAttempted: 15, daysAgo: 6, revisionNeeded: false },
      { subtopic: "Search Rotated Array", topic: "Binary Search", masteryScore: 38, weaknessScore: 62, accuracy: 40, totalSolved: 4, totalAttempted: 10, daysAgo: 22, revisionNeeded: true },
      { subtopic: "Recursion Basics", topic: "Recursion & Backtracking", masteryScore: 55, weaknessScore: 45, accuracy: 56, totalSolved: 8, totalAttempted: 14, daysAgo: 9, revisionNeeded: false },
      { subtopic: "Subset Generation", topic: "Recursion & Backtracking", masteryScore: 22, weaknessScore: 78, accuracy: 24, totalSolved: 2, totalAttempted: 9, daysAgo: 25, revisionNeeded: true },
      { subtopic: "LL Basics", topic: "Linked List", masteryScore: 69, weaknessScore: 31, accuracy: 70, totalSolved: 10, totalAttempted: 14, daysAgo: 5, revisionNeeded: false },
      { subtopic: "LL Reversal", topic: "Linked List", masteryScore: 41, weaknessScore: 59, accuracy: 42, totalSolved: 4, totalAttempted: 10, daysAgo: 16, revisionNeeded: true }
    ];

    const performanceRecords = subtopicData.map((data) => {
      return new TopicPerformance({
        userId: user._id,
        subtopic: data.subtopic,
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

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDummyUser();
