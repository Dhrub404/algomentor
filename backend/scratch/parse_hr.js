const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "hr_dheeraj.html"), "utf8");
console.log("HTML length:", html.length);

// Let's search for keywords
const keywords = ["level", "badge", "certif", "solved", "score"];
keywords.forEach(kw => {
  const count = (html.toLowerCase().match(new RegExp(kw, "g")) || []).length;
  console.log(`Keyword "${kw}" occurrences: ${count}`);
});

// Let's search for JSON scripts, e.g., Next/Nuxt or window.__INITIAL_STATE__
const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/i) || 
                   html.match(/__INITIAL_STATE__\s*=\s*({[\s\S]*?});/i) ||
                   html.match(/<script[^>]*id="[^"]*state[^"]*"[^>]*>([^<]+)<\/script>/i);
if (stateMatch) {
  console.log("Found __INITIAL_STATE__ block. Length:", stateMatch[1].length);
  fs.writeFileSync(path.join(__dirname, "hr_initial_state.js"), `module.exports = ${stateMatch[1]}`);
  console.log("Saved __INITIAL_STATE__ to hr_initial_state.js");
} else {
  console.log("__INITIAL_STATE__ not found. Let's search for any script tag containing a large JSON.");
  
  // Find all script tags
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  let idx = 0;
  while ((m = scriptRegex.exec(html)) !== null) {
    const content = m[1];
    if (content.length > 5000) {
      idx++;
      console.log(`Script tag ${idx} length: ${content.length}`);
      if (content.toLowerCase().includes("badge") || content.toLowerCase().includes("solved")) {
        console.log(`Script tag ${idx} contains badge/solved! Saving first 1000 chars:`);
        console.log(content.substring(0, 1000));
        fs.writeFileSync(path.join(__dirname, `hr_large_script_${idx}.js`), content);
      }
    }
  }
}
