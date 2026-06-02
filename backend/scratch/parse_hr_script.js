const fs = require("fs");
const path = require("path");

const rawScriptPath = path.join(__dirname, "hr_large_script_2.js");
if (!fs.existsSync(rawScriptPath)) {
  console.log("File not found:", rawScriptPath);
  process.exit(1);
}

let scriptContent = fs.readFileSync(rawScriptPath, "utf8").trim();

// The script content might be wrapped in some javascript code like:
// window.__initial_data__ = "..." or similar. Let's see if we can find where it starts and ends,
// or if it's just a URI encoded string in a specific script tag.
// Let's decode it first.
try {
  // If it starts with some assignment, extract the string literal.
  // Let's find first %7B and decode from there to the end.
  const startIdx = scriptContent.indexOf("%7B");
  if (startIdx !== -1) {
    // Find the end: could be trailing quotes or semicolon
    let endIdx = scriptContent.lastIndexOf("%7D");
    if (endIdx !== -1) {
      scriptContent = scriptContent.substring(startIdx, endIdx + 3);
    }
  }
  
  const decoded = decodeURIComponent(scriptContent);
  console.log("Decoded successfully! Length:", decoded.length);
  
  const parsed = JSON.parse(decoded);
  console.log("Parsed JSON successfully!");
  console.log("Root keys:", Object.keys(parsed));
  
  // Save parsed JSON to file
  fs.writeFileSync(path.join(__dirname, "hr_parsed_state.json"), JSON.stringify(parsed, null, 2));
  console.log("Saved parsed state to hr_parsed_state.json");
  
  // Let's search inside the parsed state for badge, certifications, solved, score, level
  // We can write a recursive search helper
  const searchKeyVal = (obj, path = "") => {
    if (obj === null || obj === undefined) return;
    if (typeof obj === "object") {
      for (const k in obj) {
        if (k.toLowerCase().includes("badge") || k.toLowerCase().includes("certif") || k.toLowerCase().includes("solved") || k.toLowerCase().includes("level") || k.toLowerCase().includes("score")) {
          console.log(`Found matching key "${k}" at path "${path}.${k}":`, typeof obj[k] === "object" ? "Object/Array" : obj[k]);
        }
        searchKeyVal(obj[k], `${path}.${k}`);
      }
    }
  };
  
  searchKeyVal(parsed);
  
} catch (err) {
  console.log("Failed to parse script tag:", err.message);
}
