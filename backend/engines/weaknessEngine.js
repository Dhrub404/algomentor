const TopicPerformance = require("../models/TopicPerformance");
const UserProgress = require("../models/UserProgress");

/**
 * Calculate performance scores for a subtopic performance record
 */
const calculatePerformanceScores = (perfData, subtopicDiff) => {
  const { totalAttempted = 0, totalSolved = 0, wrongAttempts = 0, lastPracticed } = perfData;

  // 1. Accuracy (0 to 100)
  const accuracy = totalAttempted > 0 ? (totalSolved / totalAttempted) * 100 : 0;

  // 2. Consistency Score (0 to 100)
  let daysSinceLastPracticed = 30; // default to 30 days if never practiced
  if (lastPracticed) {
    const diffTime = Math.abs(Date.now() - new Date(lastPracticed).getTime());
    daysSinceLastPracticed = diffTime / (1000 * 60 * 60 * 24);
  }
  const volumeFactor = Math.min(totalSolved * 10, 50); // Up to 5 solved problems gives max volume points
  const recencyFactor = Math.max(0, 50 - (daysSinceLastPracticed * 2.5)); // Drops off over 20 days
  const consistencyScore = volumeFactor + recencyFactor;

  // 3. Difficulty Weight (0 to 100)
  const difficultyWeight = subtopicDiff === "easy" ? 50 : subtopicDiff === "medium" ? 75 : 100;

  // 4. Mastery Score (0 to 100)
  const masteryScore = (accuracy * 0.4) + (consistencyScore * 0.3) + (difficultyWeight * 0.3);

  // 5. Weakness Score (0 to 100)
  const wrongAttemptsPoints = Math.min(wrongAttempts * 5, 30);
  const lowAccuracyPoints = (1 - (accuracy / 100)) * 40;
  const lowRecentActivityPoints = lastPracticed 
    ? Math.min(daysSinceLastPracticed * 2, 30) 
    : 30;

  const weaknessScore = Math.min(wrongAttemptsPoints + lowAccuracyPoints + lowRecentActivityPoints, 100);

  // Asynchronously trigger lastEngineRun update to track that calculations took place
  if (perfData && perfData.userId) {
    const userId = perfData.userId;
    setImmediate(async () => {
      try {
        await UserProgress.updateOne(
          { userId },
          { $set: { lastEngineRun: new Date() } }
        );
      } catch (err) {
        console.error("Error setting lastEngineRun in calculatePerformanceScores:", err.message);
      }
    });
  }

  return {
    accuracy: Math.round(accuracy),
    consistencyScore: Math.round(consistencyScore),
    difficultyWeight,
    masteryScore: Math.round(masteryScore),
    weaknessScore: Math.round(weaknessScore)
  };
};

/**
 * Retrieves the top weak subtopics for the given user:
 * weaknessScore > 50 OR masteryScore < 40
 */
const getWeakSubtopics = async (userId) => {
  if (!userId) return [];

  // Fetch all TopicPerformance records for this user
  const performances = await TopicPerformance.find({ userId });

  // Filter only subtopics where weaknessScore > 50 OR masteryScore < 40
  const weakPerformances = performances.filter(
    (p) => (p.weaknessScore > 50 || p.masteryScore < 40)
  );

  // Sort by weaknessScore descending
  weakPerformances.sort((a, b) => b.weaknessScore - a.weaknessScore);

  return weakPerformances.map((p) => ({
    subtopic: p.subtopic,
    topic: p.topic,
    masteryScore: p.masteryScore || 0,
    weaknessScore: p.weaknessScore || 0,
    accuracy: p.accuracy || 0,
    lastPracticed: p.lastPracticed,
    revisionNeeded: p.revisionNeeded || false
  }));
};

module.exports = {
  calculatePerformanceScores,
  getWeakSubtopics
};
