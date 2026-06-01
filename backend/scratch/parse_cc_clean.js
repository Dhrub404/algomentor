const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "codechef_tourist.html");
if (!fs.existsSync(htmlPath)) {
  console.log("File not found:", htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");

// 1. Rating
const ratingMatch = html.match(/<div class="rating-number">([^<]+)<\/div>/i);
console.log("Rating:", ratingMatch ? ratingMatch[1].trim() : "NOT FOUND");

// 2. Highest Rating
const highestRatingMatch = html.match(/Highest Rating\s+(\d+)/i) || 
                            html.match(/\(Highest Rating\s+(\d+)\)/i) || 
                            html.match(/Highest Rating[^<\d]*(\d+)/i);
console.log("Highest Rating:", highestRatingMatch ? highestRatingMatch[1].trim() : "NOT FOUND");

// 3. Stars
// CodeChef stars are usually represented by elements like rating-star class or 1★, etc.
// Let's find "★" or stars in html
const starsMatch = html.match(/<span class="rating">([^★<]*★+[^<]*)<\/span>/i) ||
                   html.match(/<span[^>]*rating-star[^>]*>([\s\S]*?)<\/span>/i) ||
                   html.match(/rating-star">([^<]+)/i) ||
                   html.match(/(\d+)★/i);
console.log("Stars:", starsMatch ? starsMatch[1] || starsMatch[0] : "NOT FOUND");

// Let's find where "star" or "★" is in the HTML
const starIdx = html.indexOf("★");
if (starIdx !== -1) {
  console.log("Found Star at index:", starIdx);
  console.log("Star context:", html.substring(starIdx - 100, starIdx + 100));
}

// 4. Global Rank & Country Rank
const globalRankMatch = html.match(/<a href="\/ratings\/all">[\s\S]*?<strong>([^<]+)<\/strong>[\s\S]*?Global Rank/i) ||
                        html.match(/Global Rank[\s\S]*?<strong>([^<]+)<\/strong>/i) ||
                        html.match(/Global Rank[^<\d]*(\d+)/i);
console.log("Global Rank:", globalRankMatch ? globalRankMatch[1].trim() : "NOT FOUND");

const countryRankMatch = html.match(/href="\/ratings\/all\?filterBy=Country[^>]*>[\s\S]*?<strong>([^<]+)<\/strong>[\s\S]*?Country Rank/i) ||
                         html.match(/Country Rank[\s\S]*?<strong>([^<]+)<\/strong>/i) ||
                         html.match(/Country Rank[^<\d]*(\d+)/i);
console.log("Country Rank:", countryRankMatch ? countryRankMatch[1].trim() : "NOT FOUND");

// Let's print around "Global Rank" to inspect what it looks like
const grIdx = html.indexOf("Global Rank");
if (grIdx !== -1) {
  console.log("Global Rank Context:", html.substring(grIdx - 150, grIdx + 150));
}

// Let's print around "Country Rank" to inspect what it looks like
const crIdx = html.indexOf("Country Rank");
if (crIdx !== -1) {
  console.log("Country Rank Context:", html.substring(crIdx - 150, crIdx + 150));
}

// 5. Badges
const badgeMatches = [];
const badgeRegex = /class="badge-title">([^<]+)<\/div>/gi;
let match;
while ((match = badgeRegex.exec(html)) !== null) {
  badgeMatches.push(match[1].trim());
}
console.log("Scraped Badges:", badgeMatches);

// Let's look for rating stars by counting filled stars in the code or text
// Often it has something like class="rating" containing rating star symbols or a class list
const ratingStarsClean = html.match(/<span class="rating">([^<]+)<\/span>/i);
if (ratingStarsClean) {
  console.log("Rating span text:", ratingStarsClean[1].trim());
}
