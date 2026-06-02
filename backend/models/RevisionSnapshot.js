const mongoose = require("mongoose");

const RevisionSnapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String,
    required: true
  },
  urgentSubtopics: [{
    subtopic: { type: String, required: true },
    topic: { type: String, required: true },
    lastPracticed: { type: Date },
    daysSincePractice: { type: Number },
    problems: [{
      _id: { type: mongoose.Schema.Types.ObjectId },
      title: { type: String, required: true },
      difficulty: { type: String, required: true },
      platform: { type: String, required: true },
      url: { type: String, required: true },
      subtopic: { type: String, required: true },
      topic: { type: String, required: true }
    }]
  }],
  recommendedSubtopics: [{
    subtopic: { type: String, required: true },
    topic: { type: String, required: true },
    lastPracticed: { type: Date },
    daysSincePractice: { type: Number },
    problems: [{
      _id: { type: mongoose.Schema.Types.ObjectId },
      title: { type: String, required: true },
      difficulty: { type: String, required: true },
      platform: { type: String, required: true },
      url: { type: String, required: true },
      subtopic: { type: String, required: true },
      topic: { type: String, required: true }
    }]
  }],
  completedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProblemMapping"
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

RevisionSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("RevisionSnapshot", RevisionSnapshotSchema);
