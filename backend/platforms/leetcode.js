const axios = require("axios");

const getLeetCodeData = async (username) => {
  if (!username) {
    return {
      platform: "leetcode",
      profile: null,
      submissions: [],
      contestRanking: null,
      contestHistory: []
    };
  }

  const query = `
    query leetcodeData($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      recentSubmissionList(username: $username, limit: 100) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
      }
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { username }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        timeout: 15000
      }
    );

    if (response.data && response.data.errors) {
      console.warn("LeetCode GraphQL returned errors:", response.data.errors);
    }

    const data = response.data ? response.data.data : null;
    return {
      platform: "leetcode",
      profile: data && data.matchedUser ? data.matchedUser : null,
      submissions: data && data.recentSubmissionList ? data.recentSubmissionList : [],
      contestRanking: data && data.userContestRanking ? data.userContestRanking : null,
      contestHistory: data && data.userContestRankingHistory ? data.userContestRankingHistory : []
    };
  } catch (error) {
    console.error("LeetCode API Integration Error:", error.message);
    return {
      platform: "leetcode",
      profile: null,
      submissions: [],
      contestRanking: null,
      contestHistory: []
    };
  }
};

module.exports = { getLeetCodeData };
