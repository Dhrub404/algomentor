const SystemSettings = require("../models/SystemSettings");

/**
 * Unlock Engine
 * Determines if subtopics are unlocked.
 * 
 * Rules:
 * - A subtopic unlocks when ALL prerequisites have:
 *   (solvedInPrereq / totalProblemsInPrereq) >= threshold OR masteryScore[prereq] >= threshold
 * - Admin can force unlock or force lock subtopics.
 */
const evaluateUnlocks = async (
  topicPerformances,
  topics,
  userOverrideThreshold = null,
  forcedUnlocked = [],
  forcedLocked = []
) => {
  // Map performance by subtopic name for easy access
  const perfMap = {};
  topicPerformances.forEach((p) => {
    perfMap[p.subtopic] = p;
  });

  // Determine threshold to use
  let threshold = 35;
  if (userOverrideThreshold !== null && userOverrideThreshold !== undefined) {
    threshold = userOverrideThreshold;
  } else {
    try {
      const settings = await SystemSettings.findOne({});
      if (settings) {
        threshold = settings.defaultUnlockThreshold;
      }
    } catch (err) {
      console.warn("Could not load system settings for unlock threshold:", err.message);
    }
  }

  const fractionThreshold = threshold / 100;
  const unlocked = [];

  topics.forEach((topic) => {
    topic.subtopics.forEach((subtopic) => {
      // Unlocked by default if no prerequisites
      if (!subtopic.prerequisites || subtopic.prerequisites.length === 0) {
        unlocked.push(subtopic.name);
        return;
      }

      // Check if ALL prerequisites are satisfied
      const allSatisfied = subtopic.prerequisites.every((prereqName) => {
        // Find total problem count of prerequisite
        let totalProblemsInPrereq = 0;
        for (const t of topics) {
          const found = t.subtopics.find((s) => s.name === prereqName);
          if (found) {
            totalProblemsInPrereq = found.problemCount || (found.problems && found.problems.length) || 0;
            break;
          }
        }

        const perf = perfMap[prereqName];
        if (!perf) {
          return false; // If no performance history, prereq is not met
        }

        const solvedInPrereq = perf.totalSolved || 0;
        const solveRate = totalProblemsInPrereq > 0 ? (solvedInPrereq / totalProblemsInPrereq) : 0;
        const masteryScore = perf.masteryScore || 0;

        return solveRate >= fractionThreshold || masteryScore >= threshold;
      });

      if (allSatisfied) {
        unlocked.push(subtopic.name);
      }
    });
  });

  // Apply admin overrides
  let finalUnlocked = [...unlocked];

  // 1. Force unlocks
  if (forcedUnlocked && forcedUnlocked.length > 0) {
    forcedUnlocked.forEach((sub) => {
      if (!finalUnlocked.includes(sub)) {
        finalUnlocked.push(sub);
      }
    });
  }

  // 2. Force locks
  if (forcedLocked && forcedLocked.length > 0) {
    finalUnlocked = finalUnlocked.filter((sub) => !forcedLocked.includes(sub));
  }

  return finalUnlocked;
};

module.exports = { evaluateUnlocks };
