/**
 * Weakness Engine
 * Calculates weaknessScore and masteryScore.
 * 
 * Rules:
 * - weaknessScore = (wrongAttempts + lowAccuracy + lowRecentActivity) -> 0 to 100
 * - masteryScore = (accuracy * 0.4) + (consistency * 0.3) + (difficultyWeight * 0.3)
 * - Only analyze topics the user has marked as studied.
 * - Never show weakness for locked/unstudied topics.
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
  // wrongAttempts weight: max 30 points (each wrong attempt adds 5 points)
  const wrongAttemptsPoints = Math.min(wrongAttempts * 5, 30);
  
  // lowAccuracy weight: max 40 points (0% accuracy = 40 points, 100% accuracy = 0 points)
  const lowAccuracyPoints = (1 - (accuracy / 100)) * 40;

  // lowRecentActivity weight: max 30 points
  const lowRecentActivityPoints = lastPracticed 
    ? Math.min(daysSinceLastPracticed * 2, 30) 
    : 30;

  const weaknessScore = Math.min(wrongAttemptsPoints + lowAccuracyPoints + lowRecentActivityPoints, 100);

  return {
    accuracy: Math.round(accuracy),
    consistencyScore: Math.round(consistencyScore),
    difficultyWeight,
    masteryScore: Math.round(masteryScore),
    weaknessScore: Math.round(weaknessScore)
  };
};

module.exports = { calculatePerformanceScores };
