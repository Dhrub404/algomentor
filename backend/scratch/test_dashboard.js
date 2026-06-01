const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const { getWeakSubtopics } = require("../engines/weaknessEngine");
const { generateDailyPractice } = require("../engines/practiceEngine");

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/algomentor";
    console.log("Connecting to database:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    // 1. Find seeded user
    const email = "test@algomentor.com";
    const user = await User.findOne({ email });
    if (!user) {
      console.error("Test user not found! Please run the seeder first.");
      process.exit(1);
    }
    console.log(`Found seeded user: ${user.username} (ID: ${user._id})`);

    const progress = await UserProgress.findOne({ userId: user._id });
    console.log(`UserProgress Solved problems count: ${progress.solvedProblems.length}`);

    // 2. Test getWeakSubtopics
    console.log("\n--- Testing getWeakSubtopics (Weakness Diagnostics) ---");
    const weakList = await getWeakSubtopics(user._id);
    console.log(`Retrieved ${weakList.length} weak subtopics.`);
    if (weakList.length > 0) {
      console.log(`Top weak area: ${weakList[0].subtopic} (Topic: ${weakList[0].topic}, Weakness: ${weakList[0].weaknessScore}%, Mastery: ${weakList[0].masteryScore}%)`);
      // Verify filters: weaknessScore > 50 OR masteryScore < 40
      const invalid = weakList.filter(w => w.weaknessScore <= 50 && w.masteryScore >= 40);
      if (invalid.length > 0) {
        console.error("ERROR: Weakness list contains items not matching threshold rules!", invalid);
      } else {
        console.log("PASS: Weakness diagnostics matches thresholds (weaknessScore > 50 OR mastery: < 40)!");
      }
    }

    // 3. Test generateDailyPractice
    console.log("\n--- Testing generateDailyPractice (Daily Practice slots) ---");
    const dailyProblems = await generateDailyPractice(user, progress);
    console.log(`Generated ${dailyProblems.length} daily practice problems.`);
    
    dailyProblems.forEach((p, idx) => {
      console.log(`Slot ${idx + 1} [Reason: ${p.reason}] [Subtopic: ${p.subtopic}] Title: ${p.title} (${p.platform}, ${p.difficulty})`);
    });

    if (dailyProblems.length >= 5 && dailyProblems.length <= 6) {
      console.log("PASS: Generated exactly 5-6 problems!");
    } else {
      console.error("ERROR: Daily problems size is incorrect!");
    }

    // Check if slot 1-2 are weakness
    const weaknessSlots = dailyProblems.filter(p => p.reason === "weakness");
    console.log(`Weakness problems count: ${weaknessSlots.length}`);
    
    // Check if current slot is present
    const currentSlots = dailyProblems.filter(p => p.reason === "current");
    console.log(`Current study topic problems count: ${currentSlots.length}`);

    // Check if revision slot is present
    const revisionSlots = dailyProblems.filter(p => p.reason === "revision");
    console.log(`Revision problems count: ${revisionSlots.length}`);

    console.log("\nValidation completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTest();
