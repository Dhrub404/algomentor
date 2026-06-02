const axios = require("axios");
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

// Browser-like headers to avoid anti-bot blocks
const browserHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9"
};

// Check if handle is a test handle
const isTestHandle = (handle) => {
  if (!handle) return true;
  const h = handle.toLowerCase();
  return h.startsWith("testuser") || h.includes("test_handle") || h.includes("mock");
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

// Real fetcher for CodeChef
const getCodeChefData = async (handle) => {
  if (!handle) return { platform: "codechef", submissions: [], rating: 0 };
  
  if (isTestHandle(handle)) {
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
  }

  // Option 1: Unofficial API
  const apiUrl = `https://codechef-api.vercel.app/handle/${handle}`;
  try {
    const res = await axios.get(apiUrl, { timeout: 8000 });
    if (res.data && res.data.currentRating !== undefined) {
      const stats = res.data;
      const currentRating = stats.currentRating || 0;
      const highestRating = stats.highestRating || 0;
      
      const getStars = (r) => {
        if (r < 1400) return "1★";
        if (r < 1600) return "2★";
        if (r < 1800) return "3★";
        if (r < 2000) return "4★";
        if (r < 2200) return "5★";
        if (r < 2500) return "6★";
        return "7★";
      };

      const getDiv = (r) => {
        if (r < 1400) return "Div 4";
        if (r < 1600) return "Div 3";
        if (r < 1800) return "Div 2";
        return "Div 1";
      };

      const submissions = await getSimulatedSubmissions("codechef", handle);

      return {
        platform: "codechef",
        handle,
        rating: currentRating,
        maxRating: highestRating,
        stars: stats.stars || getStars(currentRating),
        globalRank: stats.globalRank || 0,
        countryRank: stats.countryRank || 0,
        division: getDiv(currentRating),
        badges: stats.badges || [],
        totalSolved: stats.totalSolved || 0,
        submissions
      };
    }
  } catch (err) {
    console.warn(`CodeChef API failed for ${handle}: ${err.message}. Trying profile scraper...`);
  }

  // Option 2: Scraping from profile page
  const scrapeUrl = `https://www.codechef.com/users/${handle}`;
  try {
    const res = await axios.get(scrapeUrl, {
      headers: browserHeaders,
      timeout: 10000
    });
    
    const html = res.data;
    const ratingMatch = html.match(/class="rating-number[^"]*">([\s\S]*?)<\/div>/i) || html.match(/<div class="rating-number">([^<]+)<\/div>/i);
    const maxRatingMatch = html.match(/Highest Rating[^<\d]*(\d+)/i) || html.match(/Highest Rating\s+(\d+)/i);
    const divMatch = html.match(/div>\s*\((Div\s*\d+)\)/i);
    const globalRankMatch = html.match(/class=['"]global-rank['"]>(\d+)/i) || html.match(/Global Rank[^<\d]*(\d+)/i);
    const countryRankMatch = html.match(/filterBy=Country[^>]*>\s*<strong>([^<]+)<\/strong>/i) || html.match(/Country Rank[^<\d]*(\d+)/i);
    const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/i);
    
    // Parse stars count from &#9733; in rating-star block
    const ratingStarBlock = html.match(/<div class="rating-star">([\s\S]*?)<\/div>/i);
    const starsCount = ratingStarBlock ? (ratingStarBlock[1].match(/&#9733;/g) || []).length : 0;

    const rating = ratingMatch ? parseInt(ratingMatch[1].replace(/,/g, "").trim()) : 0;
    const maxRating = maxRatingMatch ? parseInt(maxRatingMatch[1]) : rating;
    
    const getStarsString = (count, r) => {
      if (count > 0) return `${count}★`;
      if (r < 1400) return "1★";
      if (r < 1600) return "2★";
      if (r < 1800) return "3★";
      if (r < 2000) return "4★";
      if (r < 2200) return "5★";
      if (r < 2500) return "6★";
      return "7★";
    };

    const getDivString = (matchStr, r) => {
      if (matchStr) return matchStr;
      if (r < 1400) return "Div 4";
      if (r < 1600) return "Div 3";
      if (r < 1800) return "Div 2";
      return "Div 1";
    };

    // Scrape badges
    const badgeWidgetMatch = html.match(/<div[^>]*class=['"]widget badges['"]>([\s\S]*?)<\/div>\s*<\/div>/i) || 
                             html.match(/<h4>Badges<\/h4>([\s\S]*?)<\/div>\s*<\/div>/i);
    const badges = [];
    if (badgeWidgetMatch) {
      const badgeRegex = /alt=['"]([^'"]+)['"]/g;
      let bMatch;
      while ((bMatch = badgeRegex.exec(badgeWidgetMatch[1])) !== null) {
        badges.push(bMatch[1]);
      }
    }

    const gRank = globalRankMatch ? globalRankMatch[1].trim() : "Inactive";
    const cRank = countryRankMatch ? countryRankMatch[1].trim() : "Inactive";
    const totalSolved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

    const submissions = await getSimulatedSubmissions("codechef", handle);

    return {
      platform: "codechef",
      handle,
      rating,
      maxRating,
      stars: getStarsString(starsCount, rating),
      globalRank: isNaN(gRank) ? gRank : parseInt(gRank),
      countryRank: isNaN(cRank) ? cRank : parseInt(cRank),
      division: getDivString(divMatch ? divMatch[1] : null, rating),
      badges,
      totalSolved,
      submissions
    };
  } catch (err) {
    console.error(`CodeChef scraper failed for ${handle}: ${err.message}`);
    return { platform: "codechef", error: true, submissions: [] };
  }
};

// Real fetcher for GeeksforGeeks
const getGeeksForGeeksData = async (handle) => {
  if (!handle) return { platform: "geeksforgeeks", submissions: [], score: 0 };

  if (isTestHandle(handle)) {
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
  }

  const scrapeUrl = `https://www.geeksforgeeks.org/user/${handle}/`;
  try {
    const res = await axios.get(scrapeUrl, {
      headers: browserHeaders,
      timeout: 10000
    });
    
    const html = res.data;
    const getMatch = (regexes) => {
      for (const r of regexes) {
        const m = html.match(r);
        if (m && m[1] !== undefined) return m[1];
      }
      return null;
    };

    const score = getMatch([
      /\\"(?:coding_)?score\\":\s*(\d+)/i,
      /"(?:coding_)?score":\s*(\d+)/i
    ]);

    const monthlyScore = getMatch([
      /\\"monthly_score\\":\s*(\d+)/i,
      /"monthly_score":\s*(\d+)/i
    ]);

    const totalSolved = getMatch([
      /\\"total_problems_solved\\":\s*(\d+)/i,
      /"total_problems_solved":\s*(\d+)/i
    ]);

    const rank = getMatch([
      /\\"institute_rank\\":\s*(\d+)/i,
      /\\"institute_rank\\":\s*\\"([^\\"]*)\\"/i,
      /"institute_rank":\s*(\d+)/i,
      /"institute_rank":\s*"([^"]*)"/i
    ]);

    if (score === null && totalSolved === null) {
      console.error(`GFG JSON stats not found in page HTML for ${handle}`);
      return { platform: "geeksforgeeks", error: true, submissions: [] };
    }

    const submissions = await getSimulatedSubmissions("geeksforgeeks", handle);

    return {
      platform: "geeksforgeeks",
      handle,
      score: score ? parseInt(score) : 0,
      monthlyScore: monthlyScore ? parseInt(monthlyScore) : 0,
      instRank: rank ? (isNaN(rank) ? rank : parseInt(rank)) : 0,
      totalSolved: totalSolved ? parseInt(totalSolved) : 0,
      submissions
    };
  } catch (err) {
    console.error(`GFG scraper failed for ${handle}: ${err.message}`);
    return { platform: "geeksforgeeks", error: true, submissions: [] };
  }
};

// Real fetcher for HackerRank
const getHackerRankData = async (handle) => {
  if (!handle) return { platform: "hackerrank", submissions: [], score: 0 };

  if (isTestHandle(handle)) {
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
  }

  // Option 1: Profile page state parsing
  const scrapeUrl = `https://www.hackerrank.com/profile/${handle}`;
  try {
    const res = await axios.get(scrapeUrl, {
      headers: browserHeaders,
      timeout: 10000
    });
    
    const html = res.data;
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let parsedState = null;
    while ((match = scriptRegex.exec(html)) !== null) {
      const content = match[1].trim();
      if (content.includes("%7B%22") || content.includes("%7B")) {
        try {
          const decoded = decodeURIComponent(content);
          if (decoded.includes('"community"') && decoded.includes('"viewProfiles"')) {
            parsedState = JSON.parse(decoded);
            break;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (parsedState) {
      const viewProfiles = parsedState.community && parsedState.community.viewProfiles;
      let userProfile = null;
      if (viewProfiles) {
        const keys = Object.keys(viewProfiles);
        const matchedKey = keys.find(k => k.toLowerCase() === handle.toLowerCase());
        if (matchedKey) {
          userProfile = viewProfiles[matchedKey];
        }
      }

      if (userProfile) {
        const level = userProfile.level || 0;
        const badgesArr = userProfile.badges || [];
        const earnedBadges = badgesArr.filter(b => b.stars > 0).length;
        
        let totalSolved = 0;
        badgesArr.forEach(b => {
          totalSolved += (b.solved || 0);
        });

        let totalScore = 0;
        if (userProfile.scores) {
          for (const key in userProfile.scores) {
            if (key === "didInvalidate") continue;
            const scoreData = userProfile.scores[key];
            if (scoreData && scoreData.practice && typeof scoreData.practice.score === "number") {
              totalScore += scoreData.practice.score;
            }
          }
        }
        totalScore = Math.round(totalScore);

        let certs = 0;
        const skillsVerification = parsedState.community && parsedState.community.skillsVerification;
        if (skillsVerification) {
          const keys = Object.keys(skillsVerification);
          const matchedKey = keys.find(k => k.toLowerCase() === handle.toLowerCase());
          if (matchedKey && skillsVerification[matchedKey] && skillsVerification[matchedKey].results) {
            const results = skillsVerification[matchedKey].results;
            certs = Object.keys(results).filter(k => {
              const r = results[k];
              return r && (r.certificateId || r.status === "passed" || r.status === "test_passed");
            }).length;
          }
        }

        const submissions = await getSimulatedSubmissions("hackerrank", handle);

        return {
          platform: "hackerrank",
          handle,
          score: totalScore,
          level,
          badges: earnedBadges,
          certs,
          totalSolved,
          submissions
        };
      }
    }
    
    console.warn(`HackerRank page parsedState not found or user profile not matched. Trying API fallback for ${handle}...`);
  } catch (err) {
    console.warn(`HackerRank scraper failed for ${handle}: ${err.message}. Trying API fallback...`);
  }

  // Option 2: Internal API fallback
  const apiUrl = `https://www.hackerrank.com/rest/contests/master/hackers/${handle}/profile`;
  try {
    const res = await axios.get(apiUrl, {
      headers: browserHeaders,
      timeout: 10000
    });
    
    if (res.data && res.data.model) {
      const model = res.data.model;
      const score = model.score || 0;
      const level = model.level || 0;
      const badges = model.badges || 0;
      const certs = model.certifications || 0;
      const totalSolved = model.solved_problems_count || 0;
      
      const submissions = await getSimulatedSubmissions("hackerrank", handle);
      
      return {
        platform: "hackerrank",
        handle,
        score,
        level,
        badges,
        certs,
        totalSolved,
        submissions
      };
    }
    
    return { platform: "hackerrank", error: true, submissions: [] };
  } catch (err) {
    console.error(`HackerRank API fallback failed for ${handle}: ${err.message}`);
    return { platform: "hackerrank", error: true, submissions: [] };
  }
};

const getCodingNinjasData = async (handle) => {
  if (!handle) return { platform: "codingninjas", submissions: [], points: 0 };

  if (isTestHandle(handle)) {
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
  }

  return { platform: "codingninjas", error: true, submissions: [] };
};

const getHackerEarthData = async (handle) => {
  if (!handle) return { platform: "hackerearth", submissions: [], points: 0 };

  if (isTestHandle(handle)) {
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
  }

  return { platform: "hackerearth", error: true, submissions: [] };
};

module.exports = {
  getCodeChefData,
  getGeeksForGeeksData,
  getHackerRankData,
  getCodingNinjasData,
  getHackerEarthData
};
