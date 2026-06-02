const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const TopicPerformance = require("../models/TopicPerformance");
const { getDecayAlert } = require("../controllers/dashboardController");

async function run() {
  await connectDB();

  const user = await User.findOne({ username: "dhruvmahajan174" });
  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }
  console.log("Found user:", user.username, "ID:", user._id);

  // Mock request with req.user._id populated as if set by protect middleware
  const req = {
    user: {
      _id: user._id
    }
  };

  const res = {
    json: (data) => {
      console.log("=== API Response (JWT simulated) ===");
      console.log(JSON.stringify(data, null, 2));
    },
    status: (code) => ({
      json: (data) => {
        console.error(`Status ${code}:`, data);
      }
    })
  };

  await getDecayAlert(req, res);

  process.exit(0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
