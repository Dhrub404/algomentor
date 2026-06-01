const fs = require("fs");
const path = require("path");

const files = ["gfg_profile.html", "gfg_dheeraj.html"];

files.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`${filename} does not exist.`);
    return;
  }
  const html = fs.readFileSync(filePath, "utf8");
  console.log(`\n--- PARSING ${filename} (Size: ${html.length}) ---`);
  
  // Look for score, coding score, rank, solved
  const keywords = ["score", "solved", "rank", "institute", "coding score", "problems solved"];
  keywords.forEach(kw => {
    const idx = html.toLowerCase().indexOf(kw);
    if (idx !== -1) {
      console.log(`Found "${kw}" at index ${idx}. Context:`);
      console.log(html.substring(idx - 50, idx + 150).replace(/\s+/g, " ").trim());
    } else {
      console.log(`"${kw}" not found`);
    }
  });

  // Let's print the title
  const title = html.match(/<title>([^<]+)<\/title>/i);
  console.log("Title:", title ? title[1] : "not found");
});
