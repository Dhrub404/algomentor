const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/algomentor");
    console.log("Connected successfully!");

    const user = await User.findOne({ username: "dhruvmahajan174" });
    if (user) {
      const progress = await UserProgress.findOne({ userId: user._id });
      console.log("UserProgress exists?", !!progress);
      if (progress) {
        console.log("UserProgress unlocked subtopics:", progress.unlockedSubtopics?.length);
        console.log("UserProgress platformStats keys:", progress.platformStats ? Array.from(progress.platformStats.keys()) : "no stats");
      }
      
      const performances = await TopicPerformance.find({ userId: user._id });
      console.log("TopicPerformance records:", performances.length);
    } else {
      console.log("User not found.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
};

run();
