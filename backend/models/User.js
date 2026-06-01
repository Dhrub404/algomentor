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
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", UserSchema);
