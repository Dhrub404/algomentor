const express = require("express");
const router = express.Router();
const { 
  getDailyPracticeSheet, 
  getRevisionPracticeSheet, 
  completeRevisionProblem 
} = require("../controllers/practiceController");
const protect = require("../middleware/authMiddleware");

router.get("/daily/:userId", protect, getDailyPracticeSheet);
router.get("/revision/:userId", protect, getRevisionPracticeSheet);
router.post("/revision/complete", protect, completeRevisionProblem);

module.exports = router;
