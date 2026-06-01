const mongoose = require("mongoose");

const TopicPerformanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  subtopic: { 
    type: String, 
    required: true 
  },
  topic: { 
    type: String, 
    required: true 
  },
  totalAttempted: { 
    type: Number, 
    default: 0 
  },
  totalSolved: { 
    type: Number, 
    default: 0 
  },
  wrongAttempts: { 
    type: Number, 
    default: 0 
  },
  accuracy: { 
    type: Number, 
    default: 0 
  },
  consistencyScore: { 
    type: Number, 
    default: 0 
  },
  difficultyWeight: { 
    type: Number, 
    default: 0 
  },
  masteryScore: { 
    type: Number, 
    default: 0 
  },
  weaknessScore: { 
    type: Number, 
    default: 0 
  },
  lastPracticed: { 
    type: Date 
  },
  revisionNeeded: { 
    type: Boolean, 
    default: false 
  },
  platform: { 
    type: String, 
    enum: ["leetcode", "codeforces", "codechef", "geeksforgeeks", "hackerrank", "codingninjas", "hackerearth", "combined"], 
    default: "combined" 
  }
});

TopicPerformanceSchema.index({ userId: 1, subtopic: 1 }, { unique: true });

module.exports = mongoose.model("TopicPerformance", TopicPerformanceSchema);
