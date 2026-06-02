const TopicPerformance = require("../models/TopicPerformance");
const SystemSettings = require("../models/SystemSettings");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const Topic = require("../models/Topic");
const ProblemMapping = require("../models/ProblemMapping");
const mongoose = require("mongoose");

/**
 * Revision Engine - alert check logic used by dashboard decay alert
 */
const runRevisionCheck = async (userId, studiedTopics) => {
  if (!userId || !studiedTopics || studiedTopics.length === 0) {
    return [];
  }

  let alertDays = 14;
  let alertsEnabled = true;

  try {
    const settings = await SystemSettings.findOne({});
    if (settings) {
      alertDays = settings.revisionAlertDays;
      alertsEnabled = settings.revisionAlertsEnabled;
    }
  } catch (err) {
    console.warn("Could not load system settings for revision alerts:", err.message);
  }

  if (!alertsEnabled) {
    await TopicPerformance.updateMany(
      { userId, subtopic: { $in: studiedTopics } },
      { $set: { revisionNeeded: false } }
    );
    return [];
  }

  const performances = await TopicPerformance.find({
    userId,
    subtopic: { $in: studiedTopics }
  });

  const thresholdDate = new Date(Date.now() - alertDays * 24 * 60 * 60 * 1000);
  const alerts = [];

  for (const perf of performances) {
    let revisionNeeded = false;

    if (perf.lastPracticed) {
      const lastPracticedDate = new Date(perf.lastPracticed);
      if (lastPracticedDate < thresholdDate) {
        revisionNeeded = true;
      }
    } else {
      revisionNeeded = true;
    }

    if (perf.revisionNeeded !== revisionNeeded) {
      perf.revisionNeeded = revisionNeeded;
      await perf.save();
    }

    if (revisionNeeded) {
      alerts.push({
        subtopic: perf.subtopic,
        topic: perf.topic,
        lastPracticed: perf.lastPracticed,
        weaknessScore: perf.weaknessScore
      });
    }
  }

  return alerts;
};

// Fallback problems for subtopics
const fallbackMap = {
  "sliding window variable": { title: "Longest Substring Without Repeating Characters", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters" },
  "two pointers": { title: "Container With Most Water", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/container-with-most-water" },
  "subset generation": { title: "Subsets", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/subsets" },
  "anagram": { title: "Valid Anagram", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/valid-anagram" },
  "search rotated array": { title: "Search in Rotated Sorted Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/search-in-rotated-sorted-array" },
  "ll reversal": { title: "Reverse Linked List", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/reverse-linked-list" }
};

const getFallbackProblem = (subtopic) => {
  const s = (subtopic || "").toLowerCase();
  let base = {
    title: "Two Sum",
    difficulty: "easy",
    platform: "leetcode",
    url: "https://leetcode.com/problems/two-sum"
  };

  for (const [key, val] of Object.entries(fallbackMap)) {
    if (s.includes(key)) {
      base = val;
      break;
    }
  }

  return {
    _id: new mongoose.Types.ObjectId(),
    title: base.title,
    difficulty: base.difficulty,
    platform: base.platform,
    url: base.url,
    subtopic: subtopic,
    topic: "DSA"
  };
};

/**
 * Generate daily revision problem set
 */
const generateRevisionSet = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const progress = await UserProgress.findOne({ userId });
  if (!progress) {
    return {
      urgentSubtopics: [],
      recommendedSubtopics: [],
      totalProblems: 0,
      generatedAt: new Date()
    };
  }

  const unlockedSubtopics = progress.unlockedSubtopics || [];
  const solvedProblems = progress.solvedProblems || [];
  const solvedSet = new Set(solvedProblems.map(id => id.toString()));

  const studied = user.studiedTopics || [];
  const treatAllAsStudied = studied.length === 0;

  // Fetch all topics to map subtopic to its parent topic and determine if studied
  const topics = await Topic.find({});
  const studiedSubtopics = new Set();
  const subtopicToTopic = {};

  topics.forEach((t) => {
    const isStudied = treatAllAsStudied || studied.some(st => 
      t.name.toLowerCase().includes(st.toLowerCase()) || 
      st.toLowerCase().includes(t.name.toLowerCase())
    );
    t.subtopics.forEach((s) => {
      subtopicToTopic[s.name] = t.name;
      if (isStudied) {
        studiedSubtopics.add(s.name);
      }
    });
  });

  // Fetch existing performances
  const performances = await TopicPerformance.find({ userId });
  const perfMap = {};
  performances.forEach((p) => {
    perfMap[p.subtopic] = p;
  });

  // Create default records for missing studied subtopics
  for (const subName of studiedSubtopics) {
    if (!perfMap[subName]) {
      const newPerf = new TopicPerformance({
        userId,
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

  const now = new Date();
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Filter subtopics where: unlocked AND studied AND (lastPracticed < today - 10 days OR revisionNeeded flag = true)
  const eligiblePerformances = Object.values(perfMap).filter((perf) => {
    const isUnlocked = unlockedSubtopics.includes(perf.subtopic);
    const isStudied = studiedSubtopics.has(perf.subtopic);
    if (!isUnlocked || !isStudied) return false;

    const hasNeglectedPractice = !perf.lastPracticed || new Date(perf.lastPracticed) < tenDaysAgo;
    const isRevisionFlagged = perf.revisionNeeded === true;

    return hasNeglectedPractice || isRevisionFlagged;
  });

  // Sort by lastPracticed (oldest first, null treated as oldest)
  eligiblePerformances.sort((a, b) => {
    const dateA = a.lastPracticed ? new Date(a.lastPracticed) : new Date(0);
    const dateB = b.lastPracticed ? new Date(b.lastPracticed) : new Date(0);
    return dateA - dateB;
  });

  // Categorize
  const urgentList = [];
  const recommendedList = [];

  for (const perf of eligiblePerformances) {
    let daysSincePractice;
    if (perf.lastPracticed) {
      const diffTime = now - new Date(perf.lastPracticed);
      daysSincePractice = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      daysSincePractice = 999;
    }

    const item = {
      subtopic: perf.subtopic,
      topic: perf.topic,
      lastPracticed: perf.lastPracticed || null,
      daysSincePractice,
      accuracy: perf.accuracy || 0,
      problems: []
    };

    const isUrgent = !perf.lastPracticed || new Date(perf.lastPracticed) < fourteenDaysAgo;
    if (isUrgent) {
      if (urgentList.length < 5) {
        urgentList.push(item);
      }
    } else {
      if (recommendedList.length < 5) {
        recommendedList.push(item);
      }
    }
  }

  // Determine how many problems to fetch for each subtopic to target 8-10 problems total
  const totalSubtopics = urgentList.length + recommendedList.length;
  let targetProblemsPerSubtopic = {};

  if (totalSubtopics >= 8) {
    for (const sub of [...urgentList, ...recommendedList]) {
      targetProblemsPerSubtopic[sub.subtopic] = 1;
    }
  } else if (totalSubtopics > 0) {
    const twoProblemCount = Math.min(totalSubtopics, 8 - totalSubtopics);
    const combined = [...urgentList, ...recommendedList];
    combined.forEach((sub, index) => {
      targetProblemsPerSubtopic[sub.subtopic] = index < twoProblemCount ? 2 : 1;
    });
  }

  const selectedProblemIds = new Set();

  const populateProblems = async (subObj) => {
    const subtopicName = subObj.subtopic;
    const limit = targetProblemsPerSubtopic[subtopicName] || 1;
    const accuracy = subObj.accuracy;

    let preferredDiffs = [];
    if (accuracy < 40) {
      preferredDiffs = ["easy"];
    } else if (accuracy >= 40 && accuracy <= 70) {
      preferredDiffs = ["medium"];
    } else {
      preferredDiffs = ["medium", "hard"];
    }

    // 1. Unsolved in preferred difficulty
    let problems = await ProblemMapping.find({
      subtopic: subtopicName,
      difficulty: { $in: preferredDiffs },
      _id: { $nin: Array.from(solvedSet).concat(Array.from(selectedProblemIds)).map(id => new mongoose.Types.ObjectId(id)) }
    }).limit(limit);

    // 2. Unsolved in any difficulty
    if (problems.length < limit) {
      const extra = await ProblemMapping.find({
        subtopic: subtopicName,
        _id: { $nin: Array.from(solvedSet).concat(Array.from(selectedProblemIds)).concat(problems.map(p => p._id.toString())).map(id => new mongoose.Types.ObjectId(id)) }
      }).limit(limit - problems.length);
      problems = problems.concat(extra);
    }

    // 3. Solved in preferred difficulty
    if (problems.length < limit) {
      const solvedPref = await ProblemMapping.find({
        subtopic: subtopicName,
        difficulty: { $in: preferredDiffs },
        _id: { $nin: Array.from(selectedProblemIds).concat(problems.map(p => p._id.toString())).map(id => new mongoose.Types.ObjectId(id)) }
      }).limit(limit - problems.length);
      problems = problems.concat(solvedPref);
    }

    // 4. Solved in any difficulty
    if (problems.length < limit) {
      const solvedAny = await ProblemMapping.find({
        subtopic: subtopicName,
        _id: { $nin: Array.from(selectedProblemIds).concat(problems.map(p => p._id.toString())).map(id => new mongoose.Types.ObjectId(id)) }
      }).limit(limit - problems.length);
      problems = problems.concat(solvedAny);
    }

    // 5. Fallback
    if (problems.length === 0) {
      problems.push(getFallbackProblem(subtopicName));
    }

    problems.forEach(p => selectedProblemIds.add(p._id.toString()));

    subObj.problems = problems.map(p => ({
      _id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      platform: p.platform,
      url: p.url,
      subtopic: p.subtopic,
      topic: p.topic
    }));
  };

  for (const sub of urgentList) {
    await populateProblems(sub);
  }

  for (const sub of recommendedList) {
    await populateProblems(sub);
  }

  const urgentSubtopics = urgentList.map(({ accuracy, ...rest }) => rest);
  const recommendedSubtopics = recommendedList.map(({ accuracy, ...rest }) => rest);

  const totalProblems = urgentSubtopics.reduce((acc, sub) => acc + sub.problems.length, 0) +
                        recommendedSubtopics.reduce((acc, sub) => acc + sub.problems.length, 0);

  return {
    urgentSubtopics,
    recommendedSubtopics,
    totalProblems,
    generatedAt: new Date()
  };
};

module.exports = {
  runRevisionCheck,
  generateRevisionSet
};
