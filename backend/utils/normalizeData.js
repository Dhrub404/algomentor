/**
 * Normalizes platform-specific raw data into a unified format:
 * {
 *   platform: "codeforces" | "leetcode",
 *   rating: Number,
 *   contestsCount: Number,
 *   solvedProblemsCount: Number,
 *   solvedProblemIds: String[], // List of solved problem identifiers (e.g., "158A", "two-sum")
 *   submissions: Array<{ problemId: String, title: String, result: "AC"|"WA", timestamp: Date }>
 * }
 */
const normalizeData = (platform, rawData) => {
  if (platform === "codeforces") {
    const info = rawData.info || {};
    const submissions = rawData.submissions || [];
    const ratingHistory = rawData.ratingHistory || [];

    const normalizedSubmissions = submissions.map((sub) => {
      const contestId = sub.problem ? sub.problem.contestId : "";
      const index = sub.problem ? sub.problem.index : "";
      return {
        problemId: `${contestId}${index}`,
        title: sub.problem ? sub.problem.name : "Unknown",
        result: sub.verdict === "OK" ? "AC" : "WA",
        timestamp: new Date(sub.creationTimeSeconds * 1000)
      };
    });

    const solvedProblemIds = Array.from(
      new Set(
        normalizedSubmissions
          .filter((sub) => sub.result === "AC")
          .map((sub) => sub.problemId)
      )
    );

    return {
      platform: "codeforces",
      rating: info.rating || 0,
      contestsCount: ratingHistory.length,
      solvedProblemsCount: solvedProblemIds.length,
      solvedProblemIds,
      submissions: normalizedSubmissions
    };
  }

  if (platform === "leetcode") {
    const profile = rawData.profile || {};
    const submissions = rawData.submissions || [];
    const contestRanking = rawData.contestRanking || {};

    const normalizedSubmissions = submissions.map((sub) => {
      return {
        problemId: sub.titleSlug,
        title: sub.title,
        result: sub.statusDisplay === "Accepted" ? "AC" : "WA",
        timestamp: new Date(parseInt(sub.timestamp) * 1000)
      };
    });

    const solvedProblemIds = Array.from(
      new Set(
        normalizedSubmissions
          .filter((sub) => sub.result === "AC")
          .map((sub) => sub.problemId)
      )
    );

    // Get total AC count from profile if available
    let solvedProblemsCount = solvedProblemIds.length;
    if (profile.submitStatsGlobal && profile.submitStatsGlobal.acSubmissionNum) {
      const allStats = profile.submitStatsGlobal.acSubmissionNum.find(
        (x) => x.difficulty === "All"
      );
      if (allStats) {
        solvedProblemsCount = Math.max(allStats.count, solvedProblemsCount);
      }
    }

    return {
      platform: "leetcode",
      rating: contestRanking.rating ? Math.round(contestRanking.rating) : 0,
      contestsCount: contestRanking.attendedContestsCount || 0,
      solvedProblemsCount,
      solvedProblemIds,
      submissions: normalizedSubmissions
    };
  }

  return null;
};

module.exports = normalizeData;
