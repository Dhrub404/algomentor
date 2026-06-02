const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  codeforcesHandle: { 
    type: String, 
    default: "" 
  },
  leetcodeHandle: { 
    type: String, 
    default: "" 
  },
  codechefHandle: { 
    type: String, 
    default: "" 
  },
  gfgHandle: { 
    type: String, 
    default: "" 
  },
  hackerrankHandle: { 
    type: String, 
    default: "" 
  },
  codingNinjasHandle: { 
    type: String, 
    default: "" 
  },
  hackerEarthHandle: { 
    type: String, 
    default: "" 
  },
  name: {
    type: String,
    default: ""
  },
  branch: {
    type: String,
    default: ""
  },
  batch: {
    type: String,
    default: ""
  },
  college: {
    type: String,
    default: ""
  },
  usn: {
    type: String,
    default: ""
  },
  currentLevel: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced"], 
    default: "beginner" 
  },
  studiedTopics: [{ 
    type: String 
  }],
  platformStats: {
    type: {
      leetcode: {
        handle: String,
        solved: Number,
        easy: Number,
        medium: Number,
        hard: Number,
        lastSynced: Date
      },
      codeforces: {
        handle: String,
        rating: Number,
        maxRating: Number,
        rank: String,
        solved: Number,
        contests: Number,
        lastSynced: Date
      },
      codechef: {
        handle: String,
        rating: Number,
        highest: Number,
        stars: Number,
        solved: Number,
        lastSynced: Date
      },
      gfg: {
        handle: String,
        score: Number,
        solved: Number,
        instituteRank: Number,
        lastSynced: Date
      },
      hackerrank: {
        handle: String,
        score: Number,
        level: Number,
        badges: Number,
        lastSynced: Date
      }
    },
    select: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", UserSchema);
