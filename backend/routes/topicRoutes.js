const express = require("express");
const router = express.Router();
const { getAllTopics, getUserProgress, markProblemSolved } = require("../controllers/topicController");
const protect = require("../middleware/authMiddleware");

router.get("/all", protect, getAllTopics);
router.get("/progress/:userId", protect, getUserProgress);
router.post("/mark-solved", protect, markProblemSolved);

module.exports = router;
