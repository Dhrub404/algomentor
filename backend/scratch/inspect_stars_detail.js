const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "codechef_tourist.html"), "utf8");

// Print around rating-star
const starIdx = html.indexOf("rating-star");
if (starIdx !== -1) {
  console.log("Rating Star Context:", html.substring(starIdx - 100, starIdx + 500));
}

// Let's count occurrences of &#9733;
const starsCount = (html.match(/&#9733;/g) || []).length;
console.log("Total occurrences of &#9733;:", starsCount);
