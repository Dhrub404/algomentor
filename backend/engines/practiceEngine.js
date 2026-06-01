const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const SystemSettings = require("../models/SystemSettings");

/**
 * Practice Engine
 * Priority = weak subtopics + unlocked + not practiced recently.
 * Returns dailyPracticeSize problems max (e.g. 4-6).
 * Never recommends topics the user hasn't studied in onboarding.
 */
const generateDailyPractice = async (user, userProgress) => {
  const { studiedTopics = [], currentLevel = "beginner" } = user;
  const { unlockedSubtopics = [], solvedProblems = [] } = userProgress;

  // Filter subtopics that are both studied AND unlocked
  const eligibleSubtopics = unlockedSubtopics.filter((subtopic) =>
    studiedTopics.includes(subtopic)
  );

  if (eligibleSubtopics.length === 0) {
    return [];
  }

  // Fetch global settings
  let practiceSize = 6;
  try {
    const settings = await SystemSettings.findOne({});
    if (settings) {
      practiceSize = settings.dailyPracticeSize;
    }
  } catch (err) {
    console.warn("Could not load system settings for daily practice size:", err.message);
  }

  // Min limit is practiceSize - 2, at least 1
  const minPracticeSize = Math.max(1, practiceSize - 2);

  // Fetch performance for eligible subtopics
  const performances = await TopicPerformance.find({
    userId: user._id,
    subtopic: { $in: eligibleSubtopics }
  });

  const perfMap = {};
  performances.forEach((p) => {
    perfMap[p.subtopic] = p;
  });

  // Score each subtopic based on weakness and recency
  const scoredSubtopics = eligibleSubtopics.map((subtopic) => {
    const perf = perfMap[subtopic];
    let weaknessScore = 0;
    let daysSinceLastPracticed = 30; // default high value

    if (perf) {
      weaknessScore = perf.weaknessScore || 0;
      if (perf.lastPracticed) {
        const diffTime = Math.abs(Date.now() - new Date(perf.lastPracticed).getTime());
        daysSinceLastPracticed = diffTime / (1000 * 60 * 60 * 24);
      }
    } else {
      // No performance record yet - high priority to get started
      weaknessScore = 50;
      daysSinceLastPracticed = 15;
    }

    // Priority Score formula
    const priorityScore = (weaknessScore * 0.6) + (daysSinceLastPracticed * 2.0);

    return {
      subtopic,
      priorityScore
    };
  });

  // Sort subtopics by priority score descending
  scoredSubtopics.sort((a, b) => b.priorityScore - a.priorityScore);

  const dailyProblems = [];
  const solvedSet = new Set(solvedProblems.map((id) => id.toString()));

  // Let's pull from top priority subtopics
  for (const item of scoredSubtopics) {
    if (dailyProblems.length >= practiceSize) break;

    // Find unsolved problems for this subtopic
    const subtopicProblems = await ProblemMapping.find({
      subtopic: item.subtopic,
      _id: { $nin: Array.from(solvedSet) }
    });

    if (subtopicProblems.length === 0) continue;

    // Sort problems by level alignment: prefer user's level
    subtopicProblems.sort((a, b) => {
      const difficultyPriority = { easy: 1, medium: 2, hard: 3 };
      const userLevelTarget = currentLevel === "beginner" ? 1 : currentLevel === "intermediate" ? 2 : 3;

      const diffA = Math.abs(difficultyPriority[a.difficulty] - userLevelTarget);
      const diffB = Math.abs(difficultyPriority[b.difficulty] - userLevelTarget);

      return diffA - diffB;
    });

    // Select up to 2 problems from this subtopic to maintain diversity
    const countToTake = Math.min(2, practiceSize - dailyProblems.length);
    for (let i = 0; i < countToTake && i < subtopicProblems.length; i++) {
      dailyProblems.push(subtopicProblems[i]);
    }
  }

  // Fallback: If we still have fewer than minPracticeSize problems, search any studied + unlocked subtopics (even if recently solved)
  if (dailyProblems.length < minPracticeSize) {
    for (const item of scoredSubtopics) {
      if (dailyProblems.length >= minPracticeSize) break;

      const allSubtopicProblems = await ProblemMapping.find({
        subtopic: item.subtopic,
        _id: { $nin: dailyProblems.map((p) => p._id) }
      });

      const countToTake = Math.min(1, minPracticeSize - dailyProblems.length);
      if (allSubtopicProblems.length > 0 && countToTake > 0) {
        dailyProblems.push(allSubtopicProblems[0]);
      }
    }
  }

  return dailyProblems;
};

module.exports = { generateDailyPractice };
