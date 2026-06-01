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
  const seed = getHashCode(handle);
  const rating = 1000 + (seed % 1000);
  const maxRating = rating + (seed % 200);
  const stars = rating < 1400 ? "1★" : rating < 1600 ? "2★" : rating < 1800 ? "3★" : "4★";
  const globalRank = 10000 + (seed % 50000);
  const submissions = await getSimulatedSubmissions("codechef", handle);

  return {
    platform: "codechef",
    handle,
    rating,
    maxRating,
    stars,
    globalRank,
    submissions
  };
};

const getGeeksForGeeksData = async (handle) => {
  if (!handle) return { platform: "geeksforgeeks", submissions: [], score: 0 };
  const seed = getHashCode(handle);
  const score = 100 + (seed % 500);
  const monthlyScore = Math.round(score * 0.2);
  const instRank = 1 + (seed % 500);
  const submissions = await getSimulatedSubmissions("geeksforgeeks", handle);

  return {
    platform: "geeksforgeeks",
    handle,
    score,
    monthlyScore,
    instRank,
    submissions
  };
};

const getHackerRankData = async (handle) => {
  if (!handle) return { platform: "hackerrank", submissions: [], score: 0 };
  const seed = getHashCode(handle);
  const score = 50 + (seed % 400);
  const level = (seed % 5) + 1;
  const badges = (seed % 4) + 1;
  const certs = seed % 3;
  const submissions = await getSimulatedSubmissions("hackerrank", handle);

  return {
    platform: "hackerrank",
    handle,
    score,
    level,
    badges,
    certs,
    submissions
  };
};

const getCodingNinjasData = async (handle) => {
  if (!handle) return { platform: "codingninjas", submissions: [], points: 0 };
  const seed = getHashCode(handle);
  const points = 200 + (seed % 1000);
  const rank = 5000 + (seed % 20000);
  const accuracy = 70 + (seed % 25);
  const submissions = await getSimulatedSubmissions("codingninjas", handle);

  return {
    platform: "codingninjas",
    handle,
    points,
    rank,
    accuracy: `${accuracy}%`,
    submissions
  };
};

const getHackerEarthData = async (handle) => {
  if (!handle) return { platform: "hackerearth", submissions: [], points: 0 };
  const seed = getHashCode(handle);
  const points = 100 + (seed % 800);
  const rating = 1100 + (seed % 700);
  const globalRank = 1000 + (seed % 15000);
  const submissions = await getSimulatedSubmissions("hackerearth", handle);

  return {
    platform: "hackerearth",
    handle,
    points,
    rating,
    globalRank,
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
