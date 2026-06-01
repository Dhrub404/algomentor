const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");

/**
 * Roadmap Engine
 * A. Generic static DSA roadmap (same for everyone)
 * B. Personalized roadmap (based on weaknessScore)
 */

// Generic static DSA roadmap structure
const getGenericRoadmap = async () => {
  const topics = await Topic.find().sort({ order: 1 });
  return topics.map((t) => ({
    topic: t.name,
    order: t.order,
    subtopics: t.subtopics.map((s) => ({
      name: s.name,
      difficulty: s.difficulty,
      prerequisites: s.prerequisites,
      problemCount: s.problemCount
    }))
  }));
};

const getPersonalizedRoadmap = async (user, userProgress) => {
  const { studiedTopics = [] } = user;
  const { unlockedSubtopics = [], solvedProblems = [] } = userProgress;

  // Fetch all performances for this user
  const performances = await TopicPerformance.find({
    userId: user._id,
    subtopic: { $in: studiedTopics }
  }).sort({ weaknessScore: -1 }); // Sort by weakness descending

  // Filter out locked subtopics (we only personalize based on unlocked + studied)
  const eligiblePerformances = performances.filter((p) =>
    unlockedSubtopics.includes(p.subtopic)
  );

  const solvedSet = new Set(solvedProblems.map((id) => id.toString()));

  const weeklySchedule = [];
  let weekCounter = 1;

  // 1. First assign weeks for the actual weak subtopics (weaknessScore > 30)
  for (const perf of eligiblePerformances) {
    if (perf.weaknessScore <= 30) continue;

    // Fetch 8-10 problems for this subtopic
    const subtopicProblems = await ProblemMapping.find({ subtopic: perf.subtopic });

    // Prioritize unsolved problems
    const unsolved = subtopicProblems.filter((p) => !solvedSet.has(p._id.toString()));
    const solved = subtopicProblems.filter((p) => solvedSet.has(p._id.toString()));

    const recommended = [...unsolved, ...solved].slice(0, 10);

    weeklySchedule.push({
      week: weekCounter++,
      subtopic: perf.subtopic,
      topic: perf.topic,
      weaknessScore: perf.weaknessScore,
      masteryScore: perf.masteryScore,
      status: "weakness_focus",
      problems: recommended
    });
  }

  // 2. If user has fewer than 4 weeks of weak subtopics, let's suggest the next unlocked studied subtopics
  // which are not yet fully mastered (masteryScore < 70)
  const remainingEligible = eligiblePerformances.filter(
    (p) => p.weaknessScore <= 30 && p.masteryScore < 70
  );

  for (const perf of remainingEligible) {
    if (weeklySchedule.length >= 6) break;

    const subtopicProblems = await ProblemMapping.find({ subtopic: perf.subtopic });
    const unsolved = subtopicProblems.filter((p) => !solvedSet.has(p._id.toString()));
    const solved = subtopicProblems.filter((p) => solvedSet.has(p._id.toString()));
    const recommended = [...unsolved, ...solved].slice(0, 10);

    weeklySchedule.push({
      week: weekCounter++,
      subtopic: perf.subtopic,
      topic: perf.topic,
      weaknessScore: perf.weaknessScore,
      masteryScore: perf.masteryScore,
      status: "reinforcement",
      problems: recommended
    });
  }

  // 3. If still empty, add some general studied subtopics that are unlocked
  if (weeklySchedule.length === 0) {
    // Find any unlocked and studied subtopics
    const allStudiedAndUnlocked = unlockedSubtopics.filter((sub) =>
      studiedTopics.includes(sub)
    );

    for (const subName of allStudiedAndUnlocked) {
      if (weeklySchedule.length >= 4) break;

      // Find parent topic
      const parentTopic = await Topic.findOne({ "subtopics.name": subName });
      const topicName = parentTopic ? parentTopic.name : "DSA";

      const subtopicProblems = await ProblemMapping.find({ subtopic: subName });
      const recommended = subtopicProblems.slice(0, 8);

      weeklySchedule.push({
        week: weekCounter++,
        subtopic: subName,
        topic: topicName,
        weaknessScore: 0,
        masteryScore: 0,
        status: "introduction",
        problems: recommended
      });
    }
  }

  return weeklySchedule;
};

module.exports = { getGenericRoadmap, getPersonalizedRoadmap };
