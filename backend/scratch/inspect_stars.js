const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "codechef_tourist.html"), "utf8");

// Search for star or rating classes
const matches = html.match(/rating-star[^>]*>([\s\S]*?)<\/span>/gi) || [];
console.log("rating-star matches:", matches);

const ratingClasses = html.match(/class="[^"]*rating[^"]*"[^>]*>([\s\S]*?)<\//gi) || [];
console.log("rating class matches:", ratingClasses.slice(0, 10));

const starsText = html.match(/class="rating">([^<]+)/i);
console.log("rating text:", starsText ? starsText[1].trim() : "not found");

const starImg = html.match(/<span class="[^"]*rating[^"]*">([\s\S]*?)<\/span>/i);
console.log("rating span outer:", starImg ? starImg[0] : "not found");

// Print around rating-number
const ratingNumIdx = html.indexOf("rating-number");
if (ratingNumIdx !== -1) {
  console.log("Rating Number Context:", html.substring(ratingNumIdx - 200, ratingNumIdx + 300));
}
