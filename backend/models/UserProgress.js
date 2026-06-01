const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  unlockedSubtopics: [{ 
    type: String 
  }],
  completedSubtopics: [{ 
    type: String 
  }],
  mastery: {
    type: Map,
    of: Number,
    default: {}
  },
  solvedProblems: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ProblemMapping" 
  }],
  overrideUnlockThreshold: {
    type: Number,
    default: null
  },
  forcedUnlockedSubtopics: [{
    type: String
  }],
  forcedLockedSubtopics: [{
    type: String
  }],
  platformStats: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  submissions: [{
    platform: { type: String, required: true },
    problemId: { type: String, required: true },
    title: { type: String },
    result: { type: String, enum: ["AC", "WA"], required: true },
    timestamp: { type: Date, required: true }
  }],
  lastSynced: {
    type: Date,
    default: null
  },
  lastActivityDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("UserProgress", UserProgressSchema);
