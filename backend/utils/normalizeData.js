const normalizeData = (platform, rawData) => {
  if (!rawData || rawData.error) return null;

  const getCodeChefStars = (rating) => {
    if (rating < 1400) return "1★";
    if (rating < 1600) return "2★";
    if (rating < 1800) return "3★";
    if (rating < 2000) return "4★";
    if (rating < 2200) return "5★";
    if (rating < 2500) return "6★";
    return "7★";
  };

  const getCodeChefDivision = (rating) => {
    if (rating < 1400) return "Div 4";
    if (rating < 1600) return "Div 3";
    if (rating < 1800) return "Div 2";
    return "Div 1";
  };

  if (platform === "codeforces") {
    const info = rawData.info || {};
    const submissions = rawData.submissions || [];
    const ratingHistory = rawData.ratingHistory || [];

    const normalizedSubmissions = submissions.map((sub) => {
      const contestId = sub.problem ? sub.problem.contestId : "";
      const index = sub.problem ? sub.problem.index : "";
      return {
        platform: "codeforces",
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
      username: info.handle || rawData.handle || "",
      fetchedAt: rawData.fetchedAt || new Date(),
      stats: {
        rating: info.rating || 0,
        maxRating: info.maxRating || 0,
        stars: 0,
        rank: info.rank || "Newbie",
        solved: solvedProblemIds.length,
        score: 0,
        badges: 0,
        instituteRank: 0,
        monthlyScore: 0
      },
      totalSolved: solvedProblemIds.length,
      rating: info.rating || 0,
      maxRating: info.maxRating || 0,
      rank: info.rank || "Newbie",
      submissions: normalizedSubmissions,
      contests: ratingHistory.length,
      easy: 0,
      medium: 0,
      hard: 0,
      badges: 0,
      stars: 0
    };
  }

  if (platform === "leetcode") {
    const profile = rawData.profile || {};
    const submissions = rawData.submissions || [];
    const contestRanking = rawData.contestRanking || {};

    const normalizedSubmissions = submissions.map((sub) => {
      return {
        platform: "leetcode",
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

    let easy = 0, medium = 0, hard = 0;
    if (profile.submitStatsGlobal && profile.submitStatsGlobal.acSubmissionNum) {
      profile.submitStatsGlobal.acSubmissionNum.forEach((stat) => {
        if (stat.difficulty === "Easy") easy = stat.count;
        if (stat.difficulty === "Medium") medium = stat.count;
        if (stat.difficulty === "Hard") hard = stat.count;
      });
    }

    let solvedProblemsCount = solvedProblemIds.length;
    if (profile.submitStatsGlobal && profile.submitStatsGlobal.acSubmissionNum) {
      const allStats = profile.submitStatsGlobal.acSubmissionNum.find(
        (x) => x.difficulty === "All"
      );
      if (allStats) {
        solvedProblemsCount = Math.max(allStats.count, solvedProblemsCount);
      }
    }

    const ratingVal = contestRanking.rating ? Math.round(contestRanking.rating) : 0;
    const rankVal = contestRanking.globalRanking || 0;

    return {
      platform: "leetcode",
      username: rawData.handle || rawData.username || profile.username || "",
      fetchedAt: rawData.fetchedAt || new Date(),
      stats: {
        rating: ratingVal,
        maxRating: 0,
        stars: 0,
        rank: rankVal,
        solved: solvedProblemsCount,
        score: 0,
        badges: 0,
        instituteRank: 0,
        monthlyScore: 0,
        easy,
        medium,
        hard,
        contests: contestRanking.attendedContestsCount || 0
      },
      totalSolved: solvedProblemsCount,
      rating: ratingVal,
      maxRating: 0,
      rank: rankVal,
      submissions: normalizedSubmissions,
      contests: contestRanking.attendedContestsCount || 0,
      easy,
      medium,
      hard,
      badges: 0,
      stars: 0
    };
  }

  if (platform === "codechef") {
    const submissions = rawData.submissions || [];
    const normalizedSubmissions = submissions.map((sub) => ({
      platform: "codechef",
      problemId: sub.problemId,
      title: sub.title || sub.problemId,
      result: sub.result === "AC" ? "AC" : "WA",
      timestamp: new Date(sub.timestamp)
    }));

    const solvedProblemIds = Array.from(
      new Set(
        normalizedSubmissions
          .filter((sub) => sub.result === "AC")
          .map((sub) => sub.problemId)
      )
    );

    const rating = rawData.rating || 0;
    const maxRating = rawData.maxRating || 0;
    const globalRank = rawData.globalRank || 0;
    const countryRank = rawData.countryRank || 0;
    const stars = rawData.stars || getCodeChefStars(rating);
    const division = rawData.division || getCodeChefDivision(rating);
    const badges = rawData.badges || [];

    return {
      platform: "codechef",
      username: rawData.handle || "",
      fetchedAt: rawData.fetchedAt || new Date(),
      stats: {
        rating,
        maxRating,
        stars,
        division,
        rank: globalRank,
        globalRank,
        countryRank,
        badges,
        solved: rawData.totalSolved || solvedProblemIds.length,
        score: 0,
        instituteRank: 0,
        monthlyScore: 0
      },
      totalSolved: rawData.totalSolved || solvedProblemIds.length,
      rating,
      maxRating,
      rank: globalRank,
      submissions: normalizedSubmissions,
      contests: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      badges: badges.length,
      stars,
      division,
      countryRank
    };
  }

  if (platform === "geeksforgeeks" || platform === "gfg") {
    const submissions = rawData.submissions || [];
    const normalizedSubmissions = submissions.map((sub) => ({
      platform: "geeksforgeeks",
      problemId: sub.problemId,
      title: sub.title || sub.problemId,
      result: sub.result === "AC" ? "AC" : "WA",
      timestamp: new Date(sub.timestamp)
    }));

    const solvedProblemIds = Array.from(
      new Set(
        normalizedSubmissions
          .filter((sub) => sub.result === "AC")
          .map((sub) => sub.problemId)
      )
    );

    return {
      platform: "geeksforgeeks",
      username: rawData.handle || "",
      fetchedAt: rawData.fetchedAt || new Date(),
      stats: {
        rating: rawData.score || 0,
        score: rawData.score || 0,
        codingScore: rawData.score || 0,
        maxRating: rawData.monthlyScore || 0,
        stars: 0,
        rank: rawData.instRank || 0,
        instituteRank: rawData.instRank || 0,
        solved: rawData.totalSolved || solvedProblemIds.length,
        badges: 0,
        monthlyScore: rawData.monthlyScore || 0
      },
      totalSolved: rawData.totalSolved || solvedProblemIds.length,
      rating: rawData.score || 0,
      maxRating: rawData.monthlyScore || 0,
      rank: rawData.instRank || 0,
      submissions: normalizedSubmissions,
      contests: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      badges: 0,
      stars: 0
    };
  }

  if (platform === "hackerrank") {
    const submissions = rawData.submissions || [];
    const normalizedSubmissions = submissions.map((sub) => ({
      platform: "hackerrank",
      problemId: sub.problemId,
      title: sub.title || sub.problemId,
      result: sub.result === "AC" ? "AC" : "WA",
      timestamp: new Date(sub.timestamp)
    }));

    const solvedProblemIds = Array.from(
      new Set(
        normalizedSubmissions
          .filter((sub) => sub.result === "AC")
          .map((sub) => sub.problemId)
      )
    );

    return {
      platform: "hackerrank",
      username: rawData.handle || "",
      fetchedAt: rawData.fetchedAt || new Date(),
      stats: {
        rating: rawData.score || 0,
        score: rawData.score || 0,
        maxRating: 0,
        stars: 0,
        rank: rawData.level || 0,
        level: rawData.level || 0,
        solved: rawData.totalSolved || solvedProblemIds.length,
        badges: rawData.badges || 0,
        certs: rawData.certs || 0,
        instituteRank: 0,
        monthlyScore: 0
      },
      totalSolved: rawData.totalSolved || solvedProblemIds.length,
      rating: rawData.score || 0,
      rank: rawData.level || 0,
      submissions: normalizedSubmissions,
      contests: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      badges: rawData.badges || 0,
      certs: rawData.certs || 0,
      stars: 0
    };
  }

  if (platform === "codingninjas") {
    const submissions = rawData.submissions || [];
    const normalizedSubmissions = submissions.map((sub) => ({
      platform: "codingninjas",
      problemId: sub.problemId,
      title: sub.title || sub.problemId,
      result: sub.result === "AC" ? "AC" : "WA",
      timestamp: new Date(sub.timestamp)
    }));

    const solvedProblemIds = Array.from(
      new Set(
        normalizedSubmissions
          .filter((sub) => sub.result === "AC")
          .map((sub) => sub.problemId)
      )
    );

    return {
      platform: "codingninjas",
      username: rawData.handle || "",
      fetchedAt: rawData.fetchedAt || new Date(),
      stats: {
        rating: rawData.points || 0,
        score: rawData.points || 0,
        maxRating: 0,
        stars: 0,
        rank: rawData.rank || 0,
        solved: rawData.totalSolved || solvedProblemIds.length,
        badges: 0,
        accuracy: rawData.accuracy || "0%",
        instituteRank: 0,
        monthlyScore: 0
      },
      totalSolved: rawData.totalSolved || solvedProblemIds.length,
      rating: rawData.points || 0,
      rank: rawData.rank || 0,
      accuracy: rawData.accuracy || "0%",
      submissions: normalizedSubmissions,
      contests: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      badges: 0,
      stars: 0
    };
  }

  if (platform === "hackerearth") {
    const submissions = rawData.submissions || [];
    const normalizedSubmissions = submissions.map((sub) => ({
      platform: "hackerearth",
      problemId: sub.problemId,
      title: sub.title || sub.problemId,
      result: sub.result === "AC" ? "AC" : "WA",
      timestamp: new Date(sub.timestamp)
    }));

    const solvedProblemIds = Array.from(
      new Set(
        normalizedSubmissions
          .filter((sub) => sub.result === "AC")
          .map((sub) => sub.problemId)
      )
    );

    return {
      platform: "hackerearth",
      username: rawData.handle || "",
      fetchedAt: rawData.fetchedAt || new Date(),
      stats: {
        rating: rawData.rating || 0,
        maxRating: rawData.points || 0,
        stars: 0,
        rank: rawData.globalRank || 0,
        solved: rawData.totalSolved || solvedProblemIds.length,
        score: rawData.points || 0,
        badges: 0,
        points: rawData.points || 0,
        instituteRank: 0,
        monthlyScore: 0
      },
      totalSolved: rawData.totalSolved || solvedProblemIds.length,
      rating: rawData.rating || 0,
      maxRating: rawData.points || 0,
      rank: rawData.globalRank || 0,
      points: rawData.points || 0,
      submissions: normalizedSubmissions,
      contests: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      badges: 0,
      stars: 0
    };
  }

  return null;
};

module.exports = normalizeData;


