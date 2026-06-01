// Platform priority: Codeforces > LeetCode > CodeChef > GFG > HackerRank > Coding Ninjas
// because competitive programming ratings should matter more than simple solved counts.

// Clean constants for weights
const CF_WEIGHT = 7;
const LC_WEIGHT = 4;
const CC_WEIGHT = 4;
const GFG_WEIGHT = 2;
const HR_BADGE_WEIGHT = 5;
const HR_SOLVED_WEIGHT = 3;
const CN_WEIGHT = 2.5;
const STREAK_WEIGHT = 0.5;

const MAX_STREAK_CAP = 30;

/**
 * Hash function helper matching frontend implementation
 * to dynamically determine simulated ratings/problems solved.
 */
const getHashCode = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Calculates the normalized weighted score for leaderboard standings.
 *
 * @param {Object} user - The user document containing handles
 * @param {Object} stats - Extracted stats for calculations
 * @param {number} stats.solvedCount - Total problems solved in AlgoMentor taxonomy
 * @param {number} stats.streak - Current daily streak count of user
 * @param {Object} stats.solvedByPlatform - Dictionary mapping platforms to solved problem count
 * @returns {number} Dynamic final score rounded to nearest integer (never NaN)
 */
const calculateLeaderboardScore = (user, progressOrStats, statsInput) => {
  let progress = null;
  let stats = {};

  if (progressOrStats && (progressOrStats.platformStats || progressOrStats.userId || progressOrStats.submissions)) {
    progress = progressOrStats;
    stats = statsInput || {};
  } else {
    stats = progressOrStats || {};
  }

  const solvedCount = stats.solvedCount || 0;
  const streak = stats.streak || 0;
  const solvedByPlatform = stats.solvedByPlatform || {};

  let finalScore = 0;

  // Helper to get stats from progress.platformStats Map
  const getStats = (platform) => {
    if (!progress || !progress.platformStats) return null;
    if (typeof progress.platformStats.get === "function") {
      return progress.platformStats.get(platform);
    }
    return progress.platformStats[platform];
  };

  // 1. CODEFORCES SCORE (HIGH PRIORITY)
  if (user.codeforcesHandle) {
    const cfData = getStats("codeforces");
    const cfRating = cfData?.stats?.rating ?? cfData?.rating;
    const codeforcesRating = (typeof cfRating === "number") ? cfRating : (1000 + (getHashCode(user.codeforcesHandle) % 800) + (solvedCount * 4));
    const cfScore = (codeforcesRating / 100) * CF_WEIGHT;
    finalScore += cfScore;
  }

  // 2. LEETCODE SCORE
  if (user.leetcodeHandle) {
    const lcData = getStats("leetcode");
    const lcSolved = lcData?.stats?.solved ?? lcData?.totalSolved;
    const leetcodeSolved = (typeof lcSolved === "number") ? lcSolved : (65 + (getHashCode(user.leetcodeHandle) % 80) + solvedCount);
    const lcScore = Math.sqrt(leetcodeSolved) * LC_WEIGHT;
    finalScore += lcScore;
  }

  // 3. CODECHEF SCORE
  if (user.codechefHandle) {
    const ccData = getStats("codechef");
    const ccRating = ccData?.stats?.rating ?? ccData?.rating;
    const codechefRating = (typeof ccRating === "number") ? ccRating : (950 + (getHashCode(user.codechefHandle) % 700) + (solvedCount * 3));
    const ccScore = (codechefRating / 100) * CC_WEIGHT;
    finalScore += ccScore;
  }

  // 4. GFG SCORE
  if (user.gfgHandle) {
    const gfgData = getStats("geeksforgeeks");
    const gfgRating = gfgData?.stats?.rating ?? gfgData?.rating;
    const gfgScore = (typeof gfgRating === "number") ? gfgRating : (120 + (getHashCode(user.gfgHandle) % 400) + (solvedCount * 2));
    const gfgScoreVal = Math.sqrt(gfgScore) * GFG_WEIGHT;
    finalScore += gfgScoreVal;
  }

  // 5. HACKERRANK SCORE
  if (user.hackerrankHandle) {
    const hrData = getStats("hackerrank");
    const hrBadges = hrData?.stats?.badges ?? hrData?.badges;
    const hrSolved = hrData?.stats?.solved ?? hrData?.totalSolved;
    const hackerRankBadges = (typeof hrBadges === "number") ? hrBadges : (1 + (getHashCode(user.hackerrankHandle) % 4));
    const hackerRankSolved = (typeof hrSolved === "number") ? hrSolved : (solvedByPlatform.hackerrank || 0);
    const hrScore = Math.max(hackerRankBadges * HR_BADGE_WEIGHT, Math.sqrt(hackerRankSolved) * HR_SOLVED_WEIGHT);
    finalScore += hrScore;
  }

  // 6. CODING NINJAS SCORE
  if (user.codingNinjasHandle) {
    const cnData = getStats("codingninjas");
    const cnRating = cnData?.stats?.rating ?? cnData?.rating;
    const codingNinjasScore = (typeof cnRating === "number") ? cnRating : (320 + (getHashCode(user.codingNinjasHandle) % 500));
    const cnScore = Math.sqrt(codingNinjasScore) * CN_WEIGHT;
    finalScore += cnScore;
  }

  // 7. DAILY STREAK BONUS
  const streakScore = Math.min(streak, MAX_STREAK_CAP) * STREAK_WEIGHT;
  finalScore += streakScore;

  // Never return NaN
  if (isNaN(finalScore)) {
    return 0;
  }

  return Math.round(finalScore);
};

module.exports = {
  calculateLeaderboardScore,
  getHashCode
};
