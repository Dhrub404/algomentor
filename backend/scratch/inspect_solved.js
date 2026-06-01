const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "codechef_tourist.html"), "utf8");

// Search for solved in the html
const regex = /Fully Solved\s*\(([^)]+)\)/i;
const match = html.match(regex);
console.log("Fully Solved match:", match ? match[0] : "not found");

const regexAll = /[\s\S]{0,100}Solved[\s\S]{0,150}/gi;
let m;
let count = 0;
while ((m = regexAll.exec(html)) !== null && count < 10) {
  count++;
  console.log(`${count}: ${m[0].trim()}\n---`);
}
