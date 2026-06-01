const mongoose = require("mongoose");

const SubtopicSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ["easy", "medium", "hard"], 
    required: true 
  },
  prerequisites: [{ 
    type: String 
  }],
  unlockThreshold: { 
    type: Number, 
    default: 35 
  },
  problemCount: { 
    type: Number, 
    default: 0 
  },
  problems: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ProblemMapping" 
  }]
});

const TopicSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  order: { 
    type: Number, 
    required: true 
  },
  subtopics: [SubtopicSchema]
});

module.exports = mongoose.model("Topic", TopicSchema);
