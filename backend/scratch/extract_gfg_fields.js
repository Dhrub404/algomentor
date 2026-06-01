const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "gfg_profile.html"), "utf8");

console.log("HTML length:", html.length);

// Let's search for "testuser_gfg" and find context around it
const index = html.indexOf("testuser_gfg");
if (index !== -1) {
  console.log("Found username at index:", index);
  console.log("Context around username:", html.substring(Math.max(0, index - 200), index + 200));
}

// Let's print out all matches of self.__next_f.push containing statistics
const pushMatches = html.match(/self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g) || [];
console.log("Found next_f.push matches:", pushMatches.length);

// Let's search if any next_f.push string contains coding_score or similar
let foundProps = false;
pushMatches.forEach((m, idx) => {
  if (m.toLowerCase().includes("score") || m.toLowerCase().includes("solve") || m.toLowerCase().includes("rank")) {
    console.log(`Match ${idx} contains keywords:`);
    console.log(m.substring(0, 500));
    foundProps = true;
  }
});

if (!foundProps) {
  console.log("No self.__next_f.push contained keywords. Let's dump all script tags contents:");
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let sCount = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    sCount++;
    const content = match[1];
    if (content.toLowerCase().includes("score") || content.toLowerCase().includes("solve") || content.toLowerCase().includes("rank")) {
      console.log(`Script tag ${sCount} has keyword. First 200 chars:`);
      console.log(content.substring(0, 200));
    }
  }
}
