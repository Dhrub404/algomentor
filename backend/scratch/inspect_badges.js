const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "codechef_tourist.html"), "utf8");

// Search for any mention of badge
const matches = [];
const regex = /class="[^"]*badge[^"]*"[^>]*>([\s\S]*?)<\//gi;
let m;
while ((m = regex.exec(html)) !== null) {
  matches.push(m[0]);
}
console.log("Badge-related element matches:", matches.slice(0, 10));

const badgeIdx = html.indexOf("badge");
if (badgeIdx !== -1) {
  console.log("Badge word context:", html.substring(badgeIdx - 100, badgeIdx + 300));
} else {
  console.log("No badge word found in HTML.");
}
