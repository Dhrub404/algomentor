const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/algomentor");
    console.log("Connected successfully!");

    const user = await User.findOne({ username: "dhruvmahajan174" });
    if (user) {
      const match = await bcrypt.compare("Test@123", user.password);
      console.log("Does password 'Test@123' match?", match);
    } else {
      console.log("User dhruvmahajan174 not found.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
};

run();
