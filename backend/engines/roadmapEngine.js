const mongoose = require("mongoose");
const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");

/**
 * Get generic static DSA roadmap structure with user-specific node states
 * Node colors are:
 * - Completed (avg mastery > 75%): emerald green
 * - In Progress (any subtopic started or unlocked): indigo
 * - Locked/Not started: slate gray
 */
const getGenericRoadmap = async (user, userProgress) => {
  const topics = await Topic.find().sort({ order: 1 });

  if (!user || !userProgress) {
    // Return with default locked status if no user is authenticated or progress is empty
    return topics.map((t) => ({
      topic: t.name,
      order: t.order,
      status: "locked",
      avgMastery: 0,
      subtopics: t.subtopics.map((s) => ({
        name: s.name,
        difficulty: s.difficulty,
        prerequisites: s.prerequisites,
        problemCount: s.problemCount
      }))
    }));
  }

  // Fetch all TopicPerformance records for this user
  const targetUserId = mongoose.Types.ObjectId.isValid(user._id) ? new mongoose.Types.ObjectId(user._id) : user._id;
  const performances = await TopicPerformance.find({ userId: targetUserId });
  const perfMap = {};
  for (const p of performances) {
    perfMap[p.subtopic] = p;
  }

  const unlocked = userProgress.unlockedSubtopics || [];

  return topics.map((t) => {
    let totalMastery = 0;
    let startedCount = 0;
    let unlockedCount = 0;

    for (const s of t.subtopics) {
      const perf = perfMap[s.name];
      if (perf) {
        totalMastery += perf.masteryScore || 0;
        if (perf.totalAttempted > 0 || perf.totalSolved > 0) {
          startedCount++;
        }
      }
      if (unlocked.includes(s.name)) {
        unlockedCount++;
      }
    }

    const avgMastery = t.subtopics.length > 0 ? totalMastery / t.subtopics.length : 0;

    let status = "locked";
    if (avgMastery > 75) {
      status = "completed";
    } else if (startedCount > 0 || unlockedCount > 0) {
      status = "in_progress";
    }

    return {
      topic: t.name,
      order: t.order,
      status, // "completed", "in_progress", "locked"
      avgMastery,
      subtopics: t.subtopics.map((s) => ({
        name: s.name,
        difficulty: s.difficulty,
        prerequisites: s.prerequisites,
        problemCount: s.problemCount
      }))
    };
  });
};

/**
 * Generate a personalized study roadmap for a user
 * Computes priorityScore for each studied & unlocked subtopic:
 * priorityScore = (weaknessScore * 0.40) + (staleness * 0.25) + (importanceWeight * 0.20) + (difficultyBalance * 0.15)
 */
const getPersonalizedRoadmap = async (user, userProgress) => {
  const topics = await Topic.find({});
  const subtopicToTopic = {};
  const subtopicToDiff = {};

  for (const t of topics) {
    for (const s of t.subtopics) {
      subtopicToTopic[s.name] = t.name;
      subtopicToDiff[s.name] = s.difficulty || "easy";
    }
  }

  const performances = await TopicPerformance.find({ userId: new mongoose.Types.ObjectId(user._id) });
  const noPerformanceData = performances.length === 0;

  // Check if user has connected any platform
  const hasConnectedPlatform = !!(
    user.leetcodeHandle ||
    user.codeforcesHandle ||
    user.codechefHandle ||
    user.gfgHandle ||
    user.hackerrankHandle ||
    user.codingNinjasHandle ||
    user.hackerEarthHandle
  );

  const perfMap = {};
  for (const p of performances) {
    perfMap[p.subtopic] = p;
  }

  const studied = user.studiedTopics || [];
  const unlocked = userProgress.unlockedSubtopics || [];

  // Filter out subtopics that are locked or are not in the user's studiedTopics (treat empty studiedTopics as studied all)
  let eligibleSubtopics = unlocked.filter((sub) =>
    studied.length === 0 || studied.includes(subtopicToTopic[sub])
  );

  // If eligibleSubtopics is empty but unlocked is not empty, bypass studiedTopics filter
  if (eligibleSubtopics.length === 0 && unlocked.length > 0) {
    eligibleSubtopics = unlocked;
  }

  // Check if all eligible subtopics have a mastery > 80%
  const allMastered =
    eligibleSubtopics.length > 0 &&
    eligibleSubtopics.every((sub) => {
      const perf = perfMap[sub];
      return perf ? perf.masteryScore > 80 : false;
    });

  // Calculate difficultyBalance
  let totalEasyAttempted = 0;
  let totalEasySolved = 0;
  let totalMediumAttempted = 0;
  let totalMediumSolved = 0;

  for (const p of performances) {
    const diff = subtopicToDiff[p.subtopic];
    if (diff === "easy") {
      totalEasyAttempted += p.totalAttempted || 0;
      totalEasySolved += p.totalSolved || 0;
    } else if (diff === "medium") {
      totalMediumAttempted += p.totalAttempted || 0;
      totalMediumSolved += p.totalSolved || 0;
    }
  }

  const easyAccuracy =
    totalEasyAttempted > 0 ? (totalEasySolved / totalEasyAttempted) * 100 : 0;
  const mediumAccuracy =
    totalMediumAttempted > 0 ? (totalMediumSolved / totalMediumAttempted) * 100 : 0;

  let difficultyBalance = 50;
  if (totalEasyAttempted === 0 && totalMediumAttempted === 0) {
    difficultyBalance = 100;
  } else if (easyAccuracy < 40) {
    difficultyBalance = 100;
  } else if (easyAccuracy > 70 && mediumAccuracy < 50) {
    difficultyBalance = 60;
  } else if (mediumAccuracy > 70) {
    difficultyBalance = 20;
  }

  // Predefined importanceWeight mappings
  const getImportanceWeight = (topic, subtopic) => {
    const t = (topic || "").toLowerCase();
    const s = (subtopic || "").toLowerCase();

    if (
      t.includes("array") ||
      s.includes("two pointer") ||
      s.includes("sliding window") ||
      t.includes("binary search") ||
      s.includes("binary search") ||
      t.includes("dynamic programming") ||
      t.includes("dp")
    ) {
      return 90;
    }
    if (
      t.includes("tree") ||
      t.includes("graph") ||
      t.includes("recursion") ||
      t.includes("backtracking") ||
      s.includes("recursion") ||
      s.includes("backtracking")
    ) {
      return 80;
    }
    if (
      t.includes("hash") ||
      t.includes("string") ||
      s.includes("hash") ||
      s.includes("string")
    ) {
      return 75;
    }
    if (
      t.includes("stack") ||
      t.includes("queue") ||
      t.includes("linked list") ||
      s.includes("stack") ||
      s.includes("queue") ||
      s.includes("linked list")
    ) {
      return 70;
    }
    if (
      t.includes("greedy") ||
      t.includes("bit") ||
      s.includes("greedy") ||
      s.includes("bit")
    ) {
      return 65;
    }
    if (
      t.includes("trie") ||
      t.includes("heap") ||
      s.includes("trie") ||
      s.includes("heap")
    ) {
      return 60;
    }
    if (
      t.includes("math") ||
      t.includes("number theory") ||
      s.includes("math") ||
      s.includes("number")
    ) {
      return 50;
    }
    return 50;
  };

  // Staleness calculation normalized to 0-100
  const getStaleness = (lastPracticed) => {
    if (!lastPracticed) return 80;
    const diffTime = Date.now() - new Date(lastPracticed).getTime();
    const diffDays = Math.max(0, diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 0;
    if (diffDays <= 7) return (diffDays / 7) * 30;
    if (diffDays <= 14) return 30 + ((diffDays - 7) / 7) * 30;
    if (diffDays <= 30) return 60 + ((diffDays - 14) / 16) * 40;
    return 100;
  };

  const solvedSet = new Set(
    (userProgress.solvedProblems || []).map((id) => id.toString())
  );

  const list = [];
  let totalWeakAreas = 0;
  let totalRevisionNeeded = 0;

  for (const sub of eligibleSubtopics) {
    const perf = perfMap[sub];
    const topicName = subtopicToTopic[sub] || "DSA";

    let weaknessScore = 70;
    let masteryScore = 0;
    let lastPracticed = null;
    let accuracy = 0;
    let revisionNeeded = false;

    if (perf) {
      weaknessScore = perf.weaknessScore;
      masteryScore = perf.masteryScore;
      lastPracticed = perf.lastPracticed;
      accuracy = perf.accuracy;
      revisionNeeded = perf.revisionNeeded || false;
    }

    if (weaknessScore > 50) {
      totalWeakAreas++;
    }
    const isStale =
      lastPracticed &&
      Date.now() - new Date(lastPracticed).getTime() > 14 * 24 * 60 * 60 * 1000;
    if (revisionNeeded || isStale) {
      totalRevisionNeeded++;
    }

    const stalenessValue = getStaleness(lastPracticed);
    const impWeight = getImportanceWeight(topicName, sub);

    const priorityScore =
      weaknessScore * 0.4 +
      stalenessValue * 0.25 +
      impWeight * 0.2 +
      difficultyBalance * 0.15;

    // Reason generation matching user spec
    let reason = "Recommended to reinforce your learning path.";
    if (weaknessScore > 50) {
      reason = `Weak area (${masteryScore}% mastery)`;
    } else if (lastPracticed) {
      const diffDays = Math.ceil(
        (Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 7) {
        reason = `Not practiced in ${diffDays} days`;
      }
    } else if (impWeight >= 80 && accuracy < 50) {
      reason = "High interview importance + low accuracy";
    } else {
      const parentTopic = topics.find((t) => t.name === topicName);
      const subtopicObj = parentTopic
        ? parentTopic.subtopics.find((s) => s.name === sub)
        : null;
      const prereq =
        subtopicObj &&
        subtopicObj.prerequisites &&
        subtopicObj.prerequisites.length > 0
          ? subtopicObj.prerequisites[0]
          : null;
      if (prereq) {
        reason = `Next logical step after ${prereq.replace(/Stage \d+ — /, "")}`;
      } else {
        reason = `Important foundation topic for ${topicName}`;
      }
    }

    // Fetch problems from ProblemMapping
    const allSubtopicProblems = await ProblemMapping.find({ subtopic: sub });

    const easyProblems = allSubtopicProblems.filter((p) => p.difficulty === "easy");
    const mediumProblems = allSubtopicProblems.filter((p) => p.difficulty === "medium");
    const hardProblems = allSubtopicProblems.filter((p) => p.difficulty === "hard");

    // Prioritize unsolved problems first
    const sortUnsolvedFirst = (arr) => {
      return [...arr].sort((a, b) => {
        const aSolved = solvedSet.has(a._id.toString());
        const bSolved = solvedSet.has(b._id.toString());
        if (aSolved && !bSolved) return 1;
        if (!aSolved && bSolved) return -1;
        return 0;
      });
    };

    const sortedEasy = sortUnsolvedFirst(easyProblems);
    const sortedMedium = sortUnsolvedFirst(mediumProblems);
    const sortedHard = sortUnsolvedFirst(hardProblems);

    let recommended = [];
    if (masteryScore < 40) {
      recommended = [...sortedEasy, ...sortedMedium, ...sortedHard];
    } else if (masteryScore <= 70) {
      recommended = [...sortedMedium, ...sortedEasy, ...sortedHard];
    } else {
      recommended = [...sortedHard, ...sortedMedium, ...sortedEasy];
    }

    const recommendedProblems = recommended.slice(0, 5).map((p) => ({
      _id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      platform: p.platform,
      url: p.url
    }));

    list.push({
      subtopic: sub,
      topic: topicName,
      masteryScore,
      weaknessScore,
      priorityScore,
      reason,
      recommendedProblems
    });
  }

  // Fallback: If eligibleSubtopics is not empty but list is empty, populate list with all eligible subtopics
  if (list.length === 0 && eligibleSubtopics.length > 0) {
    for (const sub of eligibleSubtopics) {
      const topicName = subtopicToTopic[sub] || "DSA";
      const allSubtopicProblems = await ProblemMapping.find({ subtopic: sub });
      const recommendedProblems = allSubtopicProblems.slice(0, 5).map((p) => ({
        _id: p._id,
        title: p.title,
        difficulty: p.difficulty,
        platform: p.platform,
        url: p.url
      }));

      list.push({
        subtopic: sub,
        topic: topicName,
        masteryScore: 0,
        weaknessScore: 70,
        priorityScore: 50,
        reason: `Important foundation topic for ${topicName}`,
        recommendedProblems
      });
    }
  }

  // Sort by priority score descending
  list.sort((a, b) => b.priorityScore - a.priorityScore);

  // Group into weeks
  const weeks = [];
  let currentWeek = [];
  let weekIndex = 1;

  for (let i = 0; i < list.length; i++) {
    currentWeek.push(list[i]);
    if (currentWeek.length === 6 || i === list.length - 1) {
      let title = `Week ${weekIndex} — Focus Areas`;
      let subtitle = "Based on your weakest unlocked topics";
      if (weekIndex === 2) {
        title = `Week ${weekIndex} — Next Focus Areas`;
        subtitle = "After completing Week 1 focus areas";
      } else if (weekIndex > 2) {
        title = `Week ${weekIndex} — Continued Progress`;
        subtitle = "Revision and consolidation";
      }

      weeks.push({
        weekNumber: weekIndex,
        title,
        subtitle: subtitle || "Based on your weakest unlocked topics",
        items: currentWeek
      });
      currentWeek = [];
      weekIndex++;
    }
  }

  return {
    generatedAt: new Date(),
    totalWeakAreas,
    totalRevisionNeeded,
    noPerformanceData,
    noPlatformConnected: !hasConnectedPlatform,
    allMastered,
    weeks
  };
};

module.exports = { getGenericRoadmap, getPersonalizedRoadmap };
