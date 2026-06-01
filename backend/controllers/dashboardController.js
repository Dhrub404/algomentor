const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");
const TopicPerformance = require("../models/TopicPerformance");
const User = require("../models/User");
const Topic = require("../models/Topic");

/**
 * @desc    Get weakness diagnostics for dashboard
 * @route   GET /api/dashboard/weakness
 * @access  Private
 */
const getWeaknessDiagnostics = async (req, res) => {
  let userId = req.user?._id;
  if (!userId && req.params.userId) {
    userId = req.params.userId;
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const targetUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    // Fetch user to get studiedTopics array
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const studied = user.studiedTopics || [];

    // Fetch all topics and build a map of studied subtopics
    const topics = await Topic.find({});
    const studiedSubtopics = [];
    const subtopicToTopic = {};
    const subtopicToTotalProblems = {};

    topics.forEach((t) => {
      // Check if this topic is in studiedTopics (fuzzy match to handle "Recursion" vs "Recursion & Backtracking")
      const isStudied = studied.some(st => 
        t.name.toLowerCase().includes(st.toLowerCase()) || 
        st.toLowerCase().includes(t.name.toLowerCase())
      );
      t.subtopics.forEach((s) => {
        subtopicToTopic[s.name] = t.name;
        subtopicToTotalProblems[s.name] = s.problemCount || (s.problems && s.problems.length) || 5;
        if (isStudied) {
          studiedSubtopics.push(s.name);
        }
      });
    });

    // Fetch existing performances
    const performances = await TopicPerformance.find({ userId: targetUserId });
    const perfMap = {};
    performances.forEach((p) => {
      perfMap[p.subtopic] = p;
    });

    // Create default records for missing subtopics in DB
    for (const subName of studiedSubtopics) {
      if (!perfMap[subName]) {
        const newPerf = new TopicPerformance({
          userId: targetUserId,
          subtopic: subName,
          topic: subtopicToTopic[subName] || "DSA",
          masteryScore: 0,
          weaknessScore: 100,
          totalSolved: 0,
          totalAttempted: 0,
          lastPracticed: null,
          revisionNeeded: true,
          platform: "combined"
        });
        await newPerf.save();
        perfMap[subName] = newPerf;
      }
    }

    // Filter results to ONLY include subtopics that are in studiedTopics
    const subtopicsList = studiedSubtopics.map((subName) => {
      const p = perfMap[subName];
      return {
        subtopic: p.subtopic,
        topic: p.topic,
        masteryScore: p.masteryScore || 0,
        weaknessScore: p.weaknessScore || 0,
        lastPracticed: p.lastPracticed ? p.lastPracticed.toISOString().split("T")[0] : null,
        totalSolved: p.totalSolved || 0,
        totalProblems: subtopicToTotalProblems[subName] || 5,
        revisionNeeded: p.revisionNeeded || false
      };
    });

    // Sort by masteryScore ASCENDING (weakest first)
    subtopicsList.sort((a, b) => a.masteryScore - b.masteryScore);

    // Calculate summary counts
    let weak = 0;
    let improving = 0;
    let strong = 0;

    subtopicsList.forEach((s) => {
      const score = s.masteryScore;
      if (score < 40) {
        weak++;
      } else if (score < 70) {
        improving++;
      } else {
        strong++;
      }
    });

    res.json({
      success: true,
      data: {
        subtopics: subtopicsList,
        summary: {
          total: subtopicsList.length,
          weak,
          improving,
          strong
        }
      }
    });
  } catch (error) {
    console.error("Error fetching weakness diagnostics:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Express Prototype Monkeypatch:
// Dynamically intercepts Express app creation/configuration and mounts the endpoint.
const originalUse = express.application.use;
express.application.use = function(path, ...args) {
  const app = this;
  if (!app._dashboardRouteInjected) {
    app._dashboardRouteInjected = true;
    app.get("/api/dashboard/weakness", protect, getWeaknessDiagnostics);
    app.get("/api/dashboard/weakness/:userId", protect, getWeaknessDiagnostics);
    console.log("Successfully injected dashboard routes [/api/dashboard/weakness] dynamically via express.application.");
  }
  return originalUse.apply(this, arguments);
};

module.exports = {
  getWeaknessDiagnostics
};
