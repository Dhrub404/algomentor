const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const RevisionSnapshot = require("../models/RevisionSnapshot");
const { generateRevisionSet } = require("../engines/revisionEngine");

async function run() {
  await connectDB();

  const user = await User.findOne({ username: "dhruvmahajan174" });
  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }
  console.log("Found user:", user.username, "ID:", user._id);

  // Clear existing snapshots for today to test generation
  const today = new Date().toISOString().split("T")[0];
  await RevisionSnapshot.deleteMany({ userId: user._id, date: today });
  console.log("Cleared old snapshots for today");

  // Generate revision set
  console.log("Generating revision set...");
  const revisionSet = await generateRevisionSet(user._id);
  console.log("Generated revision set summary:");
  console.log("Total Problems:", revisionSet.totalProblems);
  console.log("Urgent Subtopics count:", revisionSet.urgentSubtopics.length);
  console.log("Recommended Subtopics count:", revisionSet.recommendedSubtopics.length);

  if (revisionSet.urgentSubtopics.length > 0) {
    console.log("First urgent subtopic problems:", revisionSet.urgentSubtopics[0].problems);
  }

  // Create Snapshot
  const snapshot = new RevisionSnapshot({
    userId: user._id,
    date: today,
    urgentSubtopics: revisionSet.urgentSubtopics,
    recommendedSubtopics: revisionSet.recommendedSubtopics,
    completedProblems: []
  });
  await snapshot.save();
  console.log("Successfully saved revision snapshot!");

  // Verify caching
  const foundSnapshot = await RevisionSnapshot.findOne({ userId: user._id, date: today });
  console.log("Verified Cache - Found snapshot in DB:", !!foundSnapshot);

  process.exit(0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
