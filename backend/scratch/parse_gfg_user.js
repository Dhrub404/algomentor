const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "gfg_gfg_user_active.html"), "utf8");

// Search for score, solved, rank keys in gfg_gfg_user_active.html
const idx = html.indexOf("total_problems_solved");
if (idx !== -1) {
  console.log("Found total_problems_solved context:");
  console.log(html.substring(idx - 150, idx + 350));
} else {
  console.log("total_problems_solved key not found");
}

// Let's print out all occurrences of keys with stats
const matches = html.match(/\\"[^\\"]*(?:score|solved|rank|monthly)[^\\"]*\\":\s*(?:\\"[^\\"]*\\"|\d+)/gi) || [];
console.log("Found matches matching pattern:");
matches.forEach(m => console.log(m));
