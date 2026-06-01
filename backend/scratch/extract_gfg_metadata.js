const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "gfg_dheeraj.html"), "utf8");

console.log("HTML length:", html.length);

const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
console.log("Title tag:", titleMatch ? titleMatch[1].trim() : "not found");

const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/i);
console.log("Canonical link:", canonicalMatch ? canonicalMatch[1] : "not found");

// Check for any __NEXT_DATA__
console.log("Contains __NEXT_DATA__?", html.includes("__NEXT_DATA__"));

// Let's print the first 20 next_f.push scripts matches
const matches = html.match(/self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g) || [];
console.log("Total next_f.push scripts:", matches.length);
matches.slice(0, 10).forEach((m, i) => {
  console.log(`push[${i}]:`, m.substring(0, 150) + "...");
});
