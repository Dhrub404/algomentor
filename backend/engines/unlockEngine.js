const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const Topic = require("../models/Topic");
const SystemSettings = require("../models/SystemSettings");

// Dynamically register lastUnlockCheck if not present in Schema
if (UserProgress && UserProgress.schema && !UserProgress.schema.paths.lastUnlockCheck) {
  UserProgress.schema.add({
    lastUnlockCheck: {
      type: Date,
      default: null
    }
  });
}

// Helper to normalize subtopic names based on the Topics list in database
function getNormalizationHelpers(topics) {
  const allSubtopicNames = [];
  topics.forEach((t) => {
    t.subtopics.forEach((s) => {
      allSubtopicNames.push(s.name);
    });
  });

  const normMap = {};
  allSubtopicNames.forEach(name => {
    normMap[name.toLowerCase()] = name;
    const cleanName = name.toLowerCase()
      .replace(/^stage\s+\d+\s*[-—:\s]*/i, '')
      .replace(/[^a-z0-9]/g, '');
    normMap[cleanName] = name;
  });

  const manual = {
    "array basics": "Stage 1 — Array Basics & Traversal",
    "prefix sum": "Stage 2 — Prefix Sum",
    "difference array": "Stage 3 — Difference Array",
    "kadane algorithm": "Stage 4 — Kadane's Algorithm",
    "kadanes algorithm": "Stage 4 — Kadane's Algorithm",
    "sliding window fixed": "Stage 5 — Sliding Window Fixed Size",
    "sliding window variable": "Stage 6 — Sliding Window Variable Size",
    "two pointers": "Stage 7 — Two Pointers",
    "fast & slow pointers": "Stage 8 — Fast & Slow Pointers",
    "three pointers & k-sum": "Stage 9 — Three Pointers & K-Sum",
    "frequency count": "Stage 10 — Frequency Count & Hashing",
    "sorting techniques": "Stage 11 — Sorting Techniques",
    "binary search on arrays": "Stage 12 — Binary Search on Arrays",
    "string basics": "Stage 1 — String Basics",
    "string manipulation": "Stage 2 — String Manipulation",
    "pattern matching": "Stage 3 — Pattern Matching (KMP/Z)",
    "anagrams": "Stage 4 — Anagrams & Frequency Maps",
    "palindrome": "Stage 5 — Palindrome Problems",
    "sliding window on strings": "Stage 6 — Sliding Window on Strings",
    "hashmap basics": "Stage 1 — HashMap Basics",
    "two sum variants": "Stage 3 — Two Sum Variants",
    "subarray sum": "Stage 4 — Subarray with Given Sum",
    "longest subarray": "Stage 5 — Longest Subarray Problems",
    "classic bs": "Stage 1 — Classic Binary Search",
    "classic binary search": "Stage 1 — Classic Binary Search",
    "bs on answer": "Stage 2 — Binary Search on Answer",
    "search rotated": "Stage 3 — Search in Rotated Array",
    "search rotated array": "Stage 3 — Search in Rotated Array",
    "bs on 2d matrix": "Stage 4 — BS on 2D Matrix",
    "aggressive problems": "Stage 5 — Aggressive Problems (Minimize Max)",
    "recursion basics": "Stage 1 — Recursion Basics",
    "subsets": "Stage 2 — Subset & Subsequence Generation",
    "subset generation": "Stage 2 — Subset & Subsequence Generation",
    "permutations": "Stage 3 — Permutations",
    "backtracking basics": "Stage 4 — Backtracking Basics",
    "n-queens": "Stage 5 — N-Queens & Sudoku Solver",
    "word search": "Stage 6 — Word Search & Maze Problems",
    "ll basics": "Stage 1 — LL Basics & Traversal",
    "ll reversal": "Stage 2 — Reversal Problems",
    "fast slow on ll": "Stage 3 — Fast & Slow Pointer on LL",
    "merge sort ll": "Stage 4 — Merge & Sort LL",
    "cycle detection": "Stage 5 — Cycle Detection"
  };

  const getDbName = (name) => {
    if (!name) return "";
    const lower = name.toLowerCase().trim();
    if (normMap[lower]) return normMap[lower];

    const clean = lower.replace(/[^a-z0-9]/g, '');
    if (normMap[clean]) return normMap[clean];

    if (manual[lower]) return manual[lower];

    const cleanManual = lower.replace(/^stage\s+\d+\s*[-—:\s]*/i, '').replace(/[^a-z0-9]/g, '');
    if (manual[cleanManual]) return manual[cleanManual];

    const found = allSubtopicNames.find(n => n.toLowerCase().includes(lower) || lower.includes(n.toLowerCase()));
    if (found) return found;

    return name;
  };

  return { allSubtopicNames, getDbName };
}

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
  const { getDbName } = getNormalizationHelpers(topics);

  // Map performance by normalized subtopic name for easy access
  const perfMap = {};
  topicPerformances.forEach((p) => {
    perfMap[getDbName(p.subtopic)] = p;
  });

  // Fetch UserProgress for completed subtopics if userId is available
  let completedSubtopicsSet = new Set();
  let userId = null;
  if (topicPerformances && topicPerformances.length > 0) {
    userId = topicPerformances[0].userId;
  }
  if (userId) {
    const progress = await UserProgress.findOne({ userId });
    if (progress && progress.completedSubtopics) {
      progress.completedSubtopics.forEach(sub => {
        completedSubtopicsSet.add(getDbName(sub));
      });
    }
  }

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
        const dbPrereqName = getDbName(prereqName);

        // Treat completed prerequisite as solveRate = 1.0 (satisfied)
        if (completedSubtopicsSet.has(dbPrereqName)) {
          return true;
        }

        // Find total problem count of prerequisite
        let totalProblemsInPrereq = 0;
        for (const t of topics) {
          const found = t.subtopics.find((s) => s.name === dbPrereqName);
          if (found) {
            totalProblemsInPrereq = found.problemCount || (found.problems && found.problems.length) || 5;
            break;
          }
        }

        const perf = perfMap[dbPrereqName];
        if (!perf) {
          return false; // If no performance history and not completed, prereq is not met
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
      const dbSub = getDbName(sub);
      if (dbSub && !finalUnlocked.includes(dbSub)) {
        finalUnlocked.push(dbSub);
      }
    });
  }

  // 2. Force locks
  if (forcedLocked && forcedLocked.length > 0) {
    const dbForcedLocked = forcedLocked.map(getDbName);
    finalUnlocked = finalUnlocked.filter((sub) => !dbForcedLocked.includes(getDbName(sub)));
  }

  return finalUnlocked;
};

/**
 * runUnlockEngine
 * Runs unlock evaluations for a userId and saves updates.
 */
async function runUnlockEngine(userId) {
  // 1. Fetch UserProgress for userId
  let progress = await UserProgress.findOne({ userId });
  if (!progress) {
    progress = new UserProgress({
      userId,
      unlockedSubtopics: [],
      completedSubtopics: [],
      mastery: {}
    });
  }

  // 2. Fetch all TopicPerformance records for userId
  const topicPerformances = await TopicPerformance.find({ userId });

  // 3. Fetch all Topics with full subtopic + prerequisite data
  const topics = await Topic.find({});

  const { getDbName } = getNormalizationHelpers(topics);

  // Normalize current list of unlocked and completed subtopics
  const currentUnlocked = new Set((progress.unlockedSubtopics || []).map(getDbName));
  const completedSubtopicsSet = new Set((progress.completedSubtopics || []).map(getDbName));

  const perfMap = {};
  topicPerformances.forEach((p) => {
    perfMap[getDbName(p.subtopic)] = p;
  });

  // Threshold
  let threshold = 35;
  if (progress.overrideUnlockThreshold !== null && progress.overrideUnlockThreshold !== undefined) {
    threshold = progress.overrideUnlockThreshold;
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
  const newlyUnlocked = [];

  // 4. For each subtopic in the system:
  topics.forEach((topic) => {
    topic.subtopics.forEach((subtopic) => {
      const subName = subtopic.name;

      // a. Check if already in unlockedSubtopics → skip
      if (currentUnlocked.has(subName)) {
        return;
      }

      // If no prerequisites, always unlock
      if (!subtopic.prerequisites || subtopic.prerequisites.length === 0) {
        newlyUnlocked.push(subName);
        currentUnlocked.add(subName);
        return;
      }

      // b. Check prerequisites
      const allSatisfied = subtopic.prerequisites.every((prereqName) => {
        const dbPrereqName = getDbName(prereqName);

        // Treat completed prerequisite as solveRate = 1.0 (satisfied)
        if (completedSubtopicsSet.has(dbPrereqName)) {
          return true;
        }

        // Find total problem count of prerequisite
        let totalProblemsInPrereq = 0;
        for (const t of topics) {
          const found = t.subtopics.find((s) => s.name === dbPrereqName);
          if (found) {
            totalProblemsInPrereq = found.problemCount || (found.problems && found.problems.length) || 5;
            break;
          }
        }

        const perf = perfMap[dbPrereqName];
        if (!perf) {
          return false;
        }

        const solvedInPrereq = perf.totalSolved || 0;
        const solveRate = totalProblemsInPrereq > 0 ? (solvedInPrereq / totalProblemsInPrereq) : 0;
        const masteryScore = perf.masteryScore || 0;

        return solveRate >= fractionThreshold || masteryScore >= threshold;
      });

      if (allSatisfied) {
        newlyUnlocked.push(subName);
        currentUnlocked.add(subName);
      }
    });
  });

  // Apply admin overrides
  if (progress.forcedUnlockedSubtopics && progress.forcedUnlockedSubtopics.length > 0) {
    progress.forcedUnlockedSubtopics.forEach((sub) => {
      const dbSub = getDbName(sub);
      if (dbSub && !currentUnlocked.has(dbSub)) {
        currentUnlocked.add(dbSub);
        newlyUnlocked.push(dbSub);
      }
    });
  }

  if (progress.forcedLockedSubtopics && progress.forcedLockedSubtopics.length > 0) {
    progress.forcedLockedSubtopics.forEach((sub) => {
      const dbSub = getDbName(sub);
      if (dbSub && currentUnlocked.has(dbSub)) {
        currentUnlocked.delete(dbSub);
        const idx = newlyUnlocked.indexOf(dbSub);
        if (idx !== -1) {
          newlyUnlocked.splice(idx, 1);
        }
      }
    });
  }

  // 5. Save updated UserProgress
  progress.unlockedSubtopics = Array.from(currentUnlocked);
  progress.completedSubtopics = Array.from(completedSubtopicsSet);
  progress.lastUnlockCheck = new Date();

  await progress.save();

  // 6. Return list of newly unlocked subtopics
  return newlyUnlocked;
}

module.exports = { evaluateUnlocks, runUnlockEngine };
