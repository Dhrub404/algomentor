const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");
const mongoose = require("mongoose");

// Predefined hardcoded fallbacks per subtopic
const fallbackMap = {
  "sliding window variable": { title: "Longest Substring Without Repeating Characters", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters" },
  "two pointers": { title: "Container With Most Water", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/container-with-most-water" },
  "subset generation": { title: "Subsets", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/subsets" },
  "anagram": { title: "Valid Anagram", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/valid-anagram" },
  "search rotated array": { title: "Search in Rotated Sorted Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/search-in-rotated-sorted-array" },
  "ll reversal": { title: "Reverse Linked List", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/reverse-linked-list" }
};

const getFallbackProblem = (subtopic, reason) => {
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
    topic: "DSA",
    reason: reason
  };
};

/**
 * Generate exactly 5-6 problems for the daily practice sheet
 */
const generateDailyPractice = async (user, userProgress) => {
  const userId = user._id;
  const { unlockedSubtopics = [], solvedProblems = [] } = userProgress;
  const solvedSet = new Set(solvedProblems.map((id) => id.toString()));

  // Fetch all performances for this user
  const performances = await TopicPerformance.find({ userId });
  const perfMap = {};
  performances.forEach((p) => {
    perfMap[p.subtopic] = p;
  });

  const dailyProblems = [];
  const selectedProblemIds = new Set();

  const addProblem = (prob, reason) => {
    if (!prob || selectedProblemIds.has(prob._id.toString())) return false;
    selectedProblemIds.add(prob._id.toString());
    dailyProblems.push({
      _id: prob._id,
      title: prob.title,
      difficulty: prob.difficulty,
      platform: prob.platform,
      url: prob.url,
      subtopic: prob.subtopic,
      topic: prob.topic,
      reason: reason
    });
    return true;
  };

  // --- SLOT 1-2: Weakness Problems (2 problems) ---
  // Top 2 weakest subtopics (weaknessScore > 50)
  const weakSubtopics = performances
    .filter((p) => p.weaknessScore > 50 && unlockedSubtopics.includes(p.subtopic))
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 2);

  for (const p of weakSubtopics) {
    const targetDiff = p.masteryScore < 40 ? "easy" : "medium";
    // Find unsolved problem
    let prob = await ProblemMapping.findOne({
      subtopic: p.subtopic,
      difficulty: targetDiff,
      _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
    });

    if (!prob) {
      // Try any difficulty
      prob = await ProblemMapping.findOne({
        subtopic: p.subtopic,
        _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    if (prob) {
      addProblem(prob, "weakness");
    } else {
      // Fallback problem
      const fallback = getFallbackProblem(p.subtopic, "weakness");
      addProblem(fallback, "weakness");
    }
  }

  // --- SLOT 3: Current Study Topic (1 problem) ---
  // Subtopic user most recently practiced (most recent lastPracticed)
  const recentPerformance = performances
    .filter((p) => p.lastPracticed && unlockedSubtopics.includes(p.subtopic))
    .sort((a, b) => new Date(b.lastPracticed) - new Date(a.lastPracticed))[0];

  if (recentPerformance) {
    let prob = await ProblemMapping.findOne({
      subtopic: recentPerformance.subtopic,
      difficulty: "medium",
      _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
    });

    if (!prob) {
      prob = await ProblemMapping.findOne({
        subtopic: recentPerformance.subtopic,
        _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    if (prob) {
      addProblem(prob, "current");
    } else {
      const fallback = getFallbackProblem(recentPerformance.subtopic, "current");
      addProblem(fallback, "current");
    }
  }

  // --- SLOT 4-5: Revision Problems (1-2 problems) ---
  // revisionNeeded = true AND lastPracticed > 14 days ago
  // Sorted by staleness (oldest lastPracticed first)
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const revisionSubtopics = performances
    .filter(
      (p) =>
        p.revisionNeeded === true &&
        p.lastPracticed &&
        new Date(p.lastPracticed).getTime() < fourteenDaysAgo &&
        unlockedSubtopics.includes(p.subtopic)
    )
    .sort((a, b) => new Date(a.lastPracticed) - new Date(b.lastPracticed))
    .slice(0, 2);

  for (const p of revisionSubtopics) {
    let prob = await ProblemMapping.findOne({
      subtopic: p.subtopic,
      _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
    });

    if (prob) {
      addProblem(prob, "revision");
    } else {
      const fallback = getFallbackProblem(p.subtopic, "revision");
      addProblem(fallback, "revision");
    }
  }

  // --- SLOT 6: Bonus Problem (1 problem) ---
  // Pick a random unlocked subtopic with mastery 40-70
  const bonusPerformances = performances.filter(
    (p) =>
      p.masteryScore >= 40 &&
      p.masteryScore <= 70 &&
      unlockedSubtopics.includes(p.subtopic)
  );

  if (bonusPerformances.length > 0) {
    const randomPerf = bonusPerformances[Math.floor(Math.random() * bonusPerformances.length)];
    let prob = await ProblemMapping.findOne({
      subtopic: randomPerf.subtopic,
      difficulty: "medium",
      _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
    });

    if (!prob) {
      prob = await ProblemMapping.findOne({
        subtopic: randomPerf.subtopic,
        _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
      });
    }

    if (prob) {
      addProblem(prob, "bonus");
    } else {
      const fallback = getFallbackProblem(randomPerf.subtopic, "bonus");
      addProblem(fallback, "bonus");
    }
  }

  // Ensure we have exactly 5-6 problems. If we are under 5, add general fallbacks for any user studied subtopic
  const studied = user.studiedTopics || [];
  let fallbackIndex = 0;

  while (dailyProblems.length < 5 && fallbackIndex < unlockedSubtopics.length) {
    const sub = unlockedSubtopics[fallbackIndex++];
    // Check if subtopic belongs to studied topics
    let prob = await ProblemMapping.findOne({
      subtopic: sub,
      _id: { $nin: Array.from(selectedProblemIds).concat(Array.from(solvedSet)).map(id => new mongoose.Types.ObjectId(id)) }
    });

    if (prob) {
      addProblem(prob, "bonus");
    } else {
      const fallback = getFallbackProblem(sub, "bonus");
      addProblem(fallback, "bonus");
    }
  }

  return dailyProblems.slice(0, 6);
};

module.exports = { generateDailyPractice };
