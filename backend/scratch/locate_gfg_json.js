const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "gfg_dheeraj.html"), "utf8");

const idx = html.indexOf('"score":');
if (idx !== -1) {
  console.log("Found score JSON at index:", idx);
  console.log("Context around score JSON:");
  console.log(html.substring(idx - 200, idx + 200));
} else {
  console.log("score JSON not found");
}
