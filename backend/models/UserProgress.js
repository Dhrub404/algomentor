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
  lastActivityDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("UserProgress", UserProgressSchema);
