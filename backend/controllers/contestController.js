const axios = require("axios");
const User = require("../models/User");
const { getCodeforcesData } = require("../platforms/codeforces");
const { getLeetCodeData } = require("../platforms/leetcode");

// @desc    Get upcoming contests from Codeforces
// @route   GET /api/contest/upcoming
// @access  Private
const getUpcomingContests = async (req, res) => {
  try {
    const response = await axios.get("https://codeforces.com/api/contest.list?gym=false", {
      timeout: 10000
    });

    if (response.data && response.data.status === "OK") {
      const contests = response.data.result;
      // Filter for upcoming contests
      const upcoming = contests
        .filter((c) => c.phase === "BEFORE")
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
        .slice(0, 10)
        .map((c) => ({
          id: c.id,
          name: c.name,
          platform: "Codeforces",
          startTime: new Date(c.startTimeSeconds * 1000),
          durationSeconds: c.durationSeconds,
          type: c.type
        }));

      res.json(upcoming);
    } else {
      res.status(400).json({ message: "Failed to retrieve contests from Codeforces" });
    }
  } catch (error) {
    console.error("Error fetching upcoming contests:", error.message);
    // Return empty list rather than crash
    res.json([]);
  }
};

// @desc    Get contest history for a user
// @route   GET /api/contest/history/:userId
// @access  Private
const getUserContestHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = {
      codeforces: [],
      leetcode: []
    };

    // 1. Fetch Codeforces contest rating history
    if (user.codeforcesHandle) {
      try {
        const cfRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${user.codeforcesHandle}`, {
          timeout: 8000
        });
        if (cfRes.data && cfRes.data.status === "OK") {
          result.codeforces = cfRes.data.result.map((h) => ({
            contestName: h.contestName,
            rating: h.newRating,
            rank: h.rank,
            date: new Date(h.ratingUpdateTimeSeconds * 1000)
          }));
        }
      } catch (cfErr) {
        console.warn("Could not fetch CF contest history for user:", cfErr.message);
      }
    }

    // 2. Fetch LeetCode contest rating history
    if (user.leetcodeHandle) {
      try {
        const lcData = await getLeetCodeData(user.leetcodeHandle);
        if (lcData && lcData.contestHistory) {
          result.leetcode = lcData.contestHistory
            .filter((h) => h.attended)
            .map((h) => ({
              contestName: h.contest.title,
              rating: Math.round(h.rating),
              rank: h.ranking,
              date: new Date(parseInt(h.contest.startTime) * 1000)
            }));
        }
      } catch (lcErr) {
        console.warn("Could not fetch LC contest history for user:", lcErr.message);
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error retrieving user contest history:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUpcomingContests, getUserContestHistory };
