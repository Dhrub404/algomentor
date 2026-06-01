const ProblemMapping = require("../models/ProblemMapping");

// Simple hash function to make mock data deterministic based on the user's handle
const getHashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generates a mock submissions list for a given platform and handle
const getSimulatedSubmissions = async (platform, handle) => {
  if (!handle) {
    return [];
  }

  const seed = getHashCode(handle);
  const matchedProblems = await ProblemMapping.find({ platform });

  if (matchedProblems.length === 0) {
    return [];
  }

  const submissions = [];
  // Use seed to determine number of solved problems (e.g., 20% to 50% of the mapped problems)
  const numProblemsToSolve = Math.max(5, Math.round(((seed % 31) + 20) / 100 * matchedProblems.length));

  // Deterministically shuffle problems based on seed to select which ones are solved
  const shuffled = [...matchedProblems];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  const selectedProblems = shuffled.slice(0, numProblemsToSolve);

  selectedProblems.forEach((prob, idx) => {
    // Generate an AC submission
    const daysAgo = (seed + idx * 7) % 60; // Spread across last 60 days
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Add 0-2 wrong attempts before the success attempt
    const wrongAttemptsCount = (seed + idx) % 3;
    for (let w = 0; w < wrongAttemptsCount; w++) {
      const waTime = new Date(timestamp.getTime() - (w + 1) * 30 * 60 * 1000); // 30 mins before AC
      submissions.push({
        problemId: prob.platformProblemId,
        title: prob.title,
        result: "WA",
        timestamp: waTime
      });
    }

    submissions.push({
      problemId: prob.platformProblemId,
      title: prob.title,
      result: "AC",
      timestamp
    });
  });

  return submissions;
};

// Simulated fetchers for each platform
const getCodeChefData = async (handle) => {
  if (!handle) return { platform: "codechef", submissions: [], rating: 0 };
  
  // Simulate fetch error for non-test handles to prevent fake random ratings
  if (!handle.startsWith("testuser") && !handle.endsWith("_test_handle")) {
    return { platform: "codechef", error: true, submissions: [] };
  }

  const submissions = await getSimulatedSubmissions("codechef", handle);
  return {
    platform: "codechef",
    handle,
    rating: 1083,
    maxRating: 1083,
    stars: "1★",
    globalRank: 117797,
    countryRank: 112775,
    division: "Div 4",
    badges: ["Contest Contender - Bronze Badge"],
    totalSolved: 32,
    submissions
  };
};

const getGeeksForGeeksData = async (handle) => {
  if (!handle) return { platform: "geeksforgeeks", submissions: [], score: 0 };

  // Simulate fetch error for non-test handles to prevent fake random ratings
  if (!handle.startsWith("testuser") && !handle.endsWith("_test_handle")) {
    return { platform: "geeksforgeeks", error: true, submissions: [] };
  }

  const submissions = await getSimulatedSubmissions("geeksforgeeks", handle);
  return {
    platform: "geeksforgeeks",
    handle,
    score: 145,
    monthlyScore: 29,
    instRank: 12,
    totalSolved: 68,
    submissions
  };
};

const getHackerRankData = async (handle) => {
  if (!handle) return { platform: "hackerrank", submissions: [], score: 0 };

  // Simulate fetch error for non-test handles to prevent fake random ratings
  if (!handle.startsWith("testuser") && !handle.endsWith("_test_handle")) {
    return { platform: "hackerrank", error: true, submissions: [] };
  }

  const submissions = await getSimulatedSubmissions("hackerrank", handle);
  return {
    platform: "hackerrank",
    handle,
    score: 10,
    level: 5,
    badges: 1,
    certs: 2,
    totalSolved: 15,
    submissions
  };
};

const getCodingNinjasData = async (handle) => {
  if (!handle) return { platform: "codingninjas", submissions: [], points: 0 };

  // Simulate fetch error for non-test handles to prevent fake random ratings
  if (!handle.startsWith("testuser") && !handle.endsWith("_test_handle")) {
    return { platform: "codingninjas", error: true, submissions: [] };
  }

  const submissions = await getSimulatedSubmissions("codingninjas", handle);
  return {
    platform: "codingninjas",
    handle,
    points: 520,
    rank: 8214,
    accuracy: "84%",
    totalSolved: 47,
    submissions
  };
};

const getHackerEarthData = async (handle) => {
  if (!handle) return { platform: "hackerearth", submissions: [], points: 0 };

  // Simulate fetch error for non-test handles to prevent fake random ratings
  if (!handle.startsWith("testuser") && !handle.endsWith("_test_handle")) {
    return { platform: "hackerearth", error: true, submissions: [] };
  }

  const submissions = await getSimulatedSubmissions("hackerearth", handle);
  return {
    platform: "hackerearth",
    handle,
    points: 430,
    rating: 1350,
    globalRank: 4120,
    totalSolved: 28,
    submissions
  };
};

module.exports = {
  getCodeChefData,
  getGeeksForGeeksData,
  getHackerRankData,
  getCodingNinjasData,
  getHackerEarthData
};

