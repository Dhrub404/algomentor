const mongoose = require("mongoose");

const ProblemMappingSchema = new mongoose.Schema({
  platformProblemId: { 
    type: String, 
    required: true 
  },
  platform: { 
    type: String, 
    required: true, 
    enum: ["codeforces", "leetcode"] 
  },
  title: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  topic: { 
    type: String, 
    required: true 
  },
  subtopic: { 
    type: String, 
    required: true 
  },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ["easy", "medium", "hard"] 
  },
  tags: [{ 
    type: String 
  }]
});

ProblemMappingSchema.index({ platformProblemId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("ProblemMapping", ProblemMappingSchema);
