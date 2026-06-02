const fs = require("fs");
const path = require("path");

const state = JSON.parse(fs.readFileSync(path.join(__dirname, "hr_parsed_state.json"), "utf8"));

const community = state.community || {};
const username = "dheeraj";

// 1. Badges count
const badges = (community.viewProfiles && community.viewProfiles[username] && community.viewProfiles[username].badges) || [];
console.log("Number of Badges:", badges.length);

// 2. Certifications/Certificates
const skillsVerification = community.skillsVerification || {};
console.log("skillsVerification keys:", Object.keys(skillsVerification));

const userResults = skillsVerification[username] || {};
console.log(`skillsVerification[${username}] keys:`, Object.keys(userResults));
if (userResults.results) {
  const resultKeys = Object.keys(userResults.results);
  console.log("Results count:", resultKeys.length);
  console.log("Sample result details:", userResults.results[resultKeys[0]]);
  
  // Count successfully verified/completed certifications
  const certsCount = resultKeys.filter(k => {
    const res = userResults.results[k];
    return res && (res.certificateId || res.status === "passed" || res.certificates);
  }).length;
  console.log("Filtered Certifications count:", certsCount);
}

// 3. Scores & Total Score
// We want to return a unified 'score' representing the user's HackerRank stats.
// Let's see if we can sum up the scores of all practice domains!
if (community.viewProfiles && community.viewProfiles[username]) {
  const userProfile = community.viewProfiles[username];
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
  console.log("Calculated Total Practice Score:", totalScore);
}
