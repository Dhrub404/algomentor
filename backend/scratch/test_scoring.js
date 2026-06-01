const { calculateLeaderboardScore, getHashCode } = require("../utils/scoreCalculator");

console.log("-----------------------------------------");
console.log("RUNNING SCORING UTILITY TEST");
console.log("-----------------------------------------");

// Verify getHashCode works
console.log("Hash for 'testuser_lc':", getHashCode("testuser_lc"));

// Mock user with all platforms connected
const userAll = {
  leetcodeHandle: "testuser_lc",
  codeforcesHandle: "testuser_cf",
  codechefHandle: "testuser_cc",
  gfgHandle: "testuser_gfg",
  hackerrankHandle: "testuser_hr",
  codingNinjasHandle: "testuser_cn"
};

// Mock user with some platforms connected
const userPartial = {
  leetcodeHandle: "testuser_lc",
  codeforcesHandle: "", // missing CF
  codechefHandle: "testuser_cc",
  gfgHandle: "", // missing GFG
  hackerrankHandle: "", // missing HR
  codingNinjasHandle: "" // missing CN
};

// Stats
const stats = {
  solvedCount: 15,
  streak: 5,
  solvedByPlatform: {
    hackerrank: 4,
    leetcode: 5,
    codeforces: 6
  }
};

console.log("Score for User (All connected):");
const scoreAll = calculateLeaderboardScore(userAll, stats);
console.log("Score:", scoreAll);

console.log("Score for User (Partial connected):");
const scorePartial = calculateLeaderboardScore(userPartial, stats);
console.log("Score:", scorePartial);

console.log("-----------------------------------------");
console.log("TESTING SPECIFIC BUGS");
console.log("-----------------------------------------");
console.log("Empty user check (no handles):");
const scoreEmpty = calculateLeaderboardScore({}, stats);
console.log("Score:", scoreEmpty); // should be 2.5 (5 * 0.5) rounded to 3
console.log("Is NaN check:", isNaN(scoreEmpty));

console.log("All verifications complete!");
