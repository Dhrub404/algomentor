const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "codechef_tourist.html");
if (!fs.existsSync(htmlPath)) {
  console.log("File not found:", htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
console.log("HTML Length:", html.length);

// 1. Rating
// Let's print out text around "rating-number" or rating divs
const ratingMatches = html.match(/class="rating-number[^"]*">([\s\S]*?)<\/div>/i);
console.log("Rating match:", ratingMatches ? ratingMatches[1].trim() : "not found");

// Let's print out text around "rating-header" or similar
const ratingSection = html.match(/<div class="rating-header[\s\S]*?<\/div>/gi);
console.log("Rating header match:", ratingSection ? ratingSection.slice(0, 3) : "not found");

// 2. Highest rating
const highestRatingMatch = html.match(/Highest Rating\s*(\d+)/i) || html.match(/\(Highest Rating\s*(\d+)\)/i);
console.log("Highest Rating match:", highestRatingMatch ? highestRatingMatch[0] : "not found");

const highestRatingMatch2 = html.match(/Highest Rating\s*<\/span>\s*(\d+)/i) || html.match(/Highest Rating[^<]*<\/a>\s*(\d+)/i) || html.match(/Highest Rating[^<]*\s*<\/div>\s*<div[^>]*>(\d+)/i);
console.log("Highest Rating match 2:", highestRatingMatch2 ? highestRatingMatch2[0] : "not found");

// Let's print any strings matching "Highest Rating"
const hrMatches = html.match(/[\s\S]{0,100}Highest Rating[\s\S]{0,100}/gi) || [];
console.log("Highest Rating surrounding text:");
hrMatches.forEach((m, i) => console.log(`${i}: ${m.trim()}`));

// 3. Stars
const starMatch = html.match(/(\d+)★/i) || html.match(/class="rating">([^<]+)/i) || html.match(/rating-star">([^<]+)/i);
console.log("Stars match:", starMatch ? starMatch[0] : "not found");

// Let's look for rating stars e.g. class="rating"
const ratingStarMatches = html.match(/class="rating">([\s\S]*?)<\/span>/gi) || [];
console.log("rating matches:");
ratingStarMatches.forEach((m, i) => console.log(`${i}: ${m.trim()}`));

// 4. Global Rank & Country Rank
const globalRankMatch = html.match(/<a href="\/ratings\/all">[\s\S]*?<strong>([^<]+)<\/strong>/i) || html.match(/Global Rank:?\s*<strong>(\d+)/i);
console.log("Global Rank match:", globalRankMatch ? globalRankMatch[1] : "not found");

const countryRankMatch = html.match(/href="\/ratings\/all\?filterBy=Country[\s\S]*?<strong>([^<]+)<\/strong>/i);
console.log("Country Rank match:", countryRankMatch ? countryRankMatch[1] : "not found");

// Let's dump the rank block by finding "Global Rank" or similar
const rankBlockMatches = html.match(/[\s\S]{0,100}Global Rank[\s\S]{0,200}/gi) || [];
console.log("Rank block surrounding text:");
rankBlockMatches.forEach((m, i) => console.log(`${i}: ${m.trim()}`));

// 5. Badges
const badgeMatches = html.match(/class="badge-title">([^<]+)<\/div>/gi) || [];
console.log("Badge matches:", badgeMatches.map(m => m.match(/class="badge-title">([^<]+)<\/div>/i)[1]));

const badgeMatches2 = html.match(/badge-title">([^<]+)/gi) || [];
console.log("Badge matches 2:", badgeMatches2);

// Let's look for any badge-related classes
const badgeClasses = html.match(/class="[^"]*badge[^"]*">([^<]+)/gi) || [];
console.log("Badge class matches:", badgeClasses);

// Let's look for "Div"
const divMatches = html.match(/[\s\S]{0,50}Div[\s\S]{0,50}/gi) || [];
console.log("Div matches:");
divMatches.forEach((m, i) => console.log(`${i}: ${m.trim()}`));
