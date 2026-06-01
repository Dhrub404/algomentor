const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const { getGenericRoadmap, getPersonalizedRoadmap } = require("../engines/roadmapEngine");

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/algomentor";
    console.log("Connecting to database:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected to database successfully!");

    // Find any user
    const user = await User.findOne({});
    if (!user) {
      console.error("No user found in the database. Please register a user first.");
      process.exit(1);
    }
    console.log(`Found user: ${user.username} (ID: ${user._id})`);
    console.log(`Studied topics:`, user.studiedTopics);

    // Get progress
    let progress = await UserProgress.findOne({ userId: user._id });
    if (!progress) {
      console.log("Creating default progress for user...");
      progress = new UserProgress({
        userId: user._id,
        unlockedSubtopics: ["Stage 1 — Array Basics & Traversal", "Stage 2 — Prefix Sum"],
        mastery: new Map([["Stage 1 — Array Basics & Traversal", 85]])
      });
      await progress.save();
    }
    console.log(`User unlocked subtopics:`, progress.unlockedSubtopics);

    console.log("\n--- Testing getGenericRoadmap ---");
    const genericRes = await getGenericRoadmap(user, progress);
    console.log(`Generic roadmap has ${genericRes.length} milestones.`);
    if (genericRes.length > 0) {
      console.log("Milestone 1 Topic:", genericRes[0].topic);
      console.log("Milestone 1 Status:", genericRes[0].status);
      console.log("Milestone 1 Avg Mastery:", genericRes[0].avgMastery);
      console.log("Milestone 1 Subtopics:", genericRes[0].subtopics.map(s => s.name));
    }

    console.log("\n--- Testing getPersonalizedRoadmap ---");
    const personalRes = await getPersonalizedRoadmap(user, progress);
    console.log("Generated At:", personalRes.generatedAt);
    console.log("Total Weak Areas:", personalRes.totalWeakAreas);
    console.log("Total Revision Needed:", personalRes.totalRevisionNeeded);
    console.log("noPerformanceData:", personalRes.noPerformanceData);
    console.log("noPlatformConnected:", personalRes.noPlatformConnected);
    console.log("allMastered:", personalRes.allMastered);
    console.log(`Number of Weeks in Schedule: ${personalRes.weeks.length}`);
    if (personalRes.weeks.length > 0) {
      const w1 = personalRes.weeks[0];
      console.log(`Week 1 Title: ${w1.title}`);
      console.log(`Week 1 Subtitle: ${w1.subtitle}`);
      console.log(`Week 1 Items Count: ${w1.items.length}`);
      if (w1.items.length > 0) {
        const item1 = w1.items[0];
        console.log(`- Subtopic: ${item1.subtopic} (Topic: ${item1.topic})`);
        console.log(`  Priority Score: ${item1.priorityScore}`);
        console.log(`  Reason: ${item1.reason}`);
        console.log(`  Mastery Score: ${item1.masteryScore}`);
        console.log(`  Recommended Problems Count: ${item1.recommendedProblems.length}`);
        if (item1.recommendedProblems.length > 0) {
          console.log(`  First recommended problem: ${item1.recommendedProblems[0].title} (${item1.recommendedProblems[0].platform})`);
        }
      }
    }

    console.log("\nValidation completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTest();
