const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/algomentor");
    console.log("Connected successfully!");

    const user = await User.findOne({ username: "dhruvmahajan174" });
    if (user) {
      console.log("Full user details:", JSON.stringify(user, null, 2));
    } else {
      console.log("User not found.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
};

run();
