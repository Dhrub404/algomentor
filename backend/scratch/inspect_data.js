const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");

async function run() {
  await connectDB();

  const user = await User.findOne({ username: "dhruvmahajan174" });
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  console.log("=== User studiedTopics ===");
  console.log(user.studiedTopics);

  const progress = await UserProgress.findOne({ userId: user._id });
  console.log("=== UserProgress unlockedSubtopics ===");
  console.log(progress ? progress.unlockedSubtopics : "None");

  console.log("=== TopicPerformance records ===");
  const perfs = await TopicPerformance.find({ userId: user._id });
  perfs.forEach(p => {
    console.log(`Subtopic: ${p.subtopic}, lastPracticed: ${p.lastPracticed}, revisionNeeded: ${p.revisionNeeded}`);
  });

  process.exit(0);
}

run();
