const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "gfg_dheeraj_new.html");
if (!fs.existsSync(htmlPath)) {
  console.log("File not found:", htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
console.log("HTML Length:", html.length);

// Let's check if __NEXT_DATA__ or any other next-data structure is present
const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
if (nextDataMatch) {
  console.log("Found __NEXT_DATA__!");
  const jsonStr = nextDataMatch[1];
  console.log("JSON Length:", jsonStr.length);
  try {
    const data = JSON.parse(jsonStr);
    console.log("Keys of parsed data:", Object.keys(data));
    fs.writeFileSync(path.join(__dirname, "gfg_next_data.json"), JSON.stringify(data, null, 2));
    console.log("Wrote next data JSON to gfg_next_data.json");
  } catch (err) {
    console.log("Error parsing json:", err.message);
  }
} else {
  console.log("__NEXT_DATA__ script tag NOT found.");
  // Let's search for script tags containing self.__next_f.push
  const pushMatches = html.match(/self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g) || [];
  console.log("Found self.__next_f.push matches:", pushMatches.length);
  if (pushMatches.length > 0) {
    // Let's join and decode them
    let combined = "";
    pushMatches.forEach(m => {
      const match = m.match(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/);
      if (match) {
        combined += match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
      }
    });
    fs.writeFileSync(path.join(__dirname, "gfg_next_f_push.txt"), combined);
    console.log("Wrote combined next_f.push content to gfg_next_f_push.txt");
    
    // Look for some keywords
    const keywords = ["score", "solved", "rank", "dheeraj", "mastery", "coding"];
    keywords.forEach(kw => {
      const has = combined.toLowerCase().includes(kw);
      console.log(`Contains "${kw}":`, has);
    });
  }
}
