const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "gfg_dheeraj.html"), "utf8");

// We want to test matching \"score\":0, \"monthly_score\":0, \"total_problems_solved\":0, \"institute_rank\":\"\"
const scoreRegex = /\\"(?:coding_)?score\\":\s*(\d+)/i;
const matchScore = html.match(scoreRegex);
console.log("Score Match:", matchScore ? matchScore[1] : "not found");

const monthlyScoreRegex = /\\"monthly_score\\":\s*(\d+)/i;
const matchMonthly = html.match(monthlyScoreRegex);
console.log("Monthly Score Match:", matchMonthly ? matchMonthly[1] : "not found");

const solvedRegex = /\\"total_problems_solved\\":\s*(\d+)/i;
const matchSolved = html.match(solvedRegex);
console.log("Solved Match:", matchSolved ? matchSolved[1] : "not found");

const rankRegex = /\\"institute_rank\\":\s*\\"([^\\"]*)\\"/i;
const matchRank = html.match(rankRegex);
console.log("Rank Match:", matchRank ? matchRank[1] : "not found");

// Let's also check if there is an unescaped version in the html (for pages where it might not be escaped)
const rawScoreRegex = /"(?:coding_)?score":\s*(\d+)/i;
const rawMatchScore = html.match(rawScoreRegex);
console.log("Raw Score Match:", rawMatchScore ? rawMatchScore[1] : "not found");
