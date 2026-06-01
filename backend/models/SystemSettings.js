const mongoose = require("mongoose");

const SystemSettingsSchema = new mongoose.Schema({
  defaultUnlockThreshold: { 
    type: Number, 
    default: 35 
  },
  revisionAlertDays: { 
    type: Number, 
    default: 14 
  },
  dailyPracticeSize: { 
    type: Number, 
    default: 6 
  },
  revisionAlertsEnabled: { 
    type: Boolean, 
    default: true 
  },
  leaderboardVisible: { 
    type: Boolean, 
    default: true 
  }
});

module.exports = mongoose.model("SystemSettings", SystemSettingsSchema);
