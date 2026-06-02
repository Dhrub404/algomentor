const axios = require("axios");
const fs = require("fs");
const path = require("path");

const testHandles = ["sharma", "rahul", "dheeraj", "gfg_user"];

const run = async () => {
  for (const handle of testHandles) {
    const url = `https://www.geeksforgeeks.org/user/${handle}/`;
    try {
      console.log(`Fetching: ${url}`);
      const res = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        },
        timeout: 10000
      });
      const html = res.data;
      console.log(`Status for ${handle}: ${res.status}, Length: ${html.length}`);
      
      const scoreRegex = /\\"(?:coding_)?score\\":\s*(\d+)/i;
      const matchScore = html.match(scoreRegex);
      
      const solvedRegex = /\\"total_problems_solved\\":\s*(\d+)/i;
      const matchSolved = html.match(solvedRegex);

      const rankRegex = /\\"institute_rank\\":\s*\\"([^\\"]*)\\"/i || /\\"institute_rank\\":\s*(\d+)/i;
      const matchRank = html.match(rankRegex);

      console.log(`Stats parsed for ${handle}:`, {
        score: matchScore ? matchScore[1] : "not found",
        solved: matchSolved ? matchSolved[1] : "not found",
        rank: matchRank ? matchRank[1] : "not found"
      });
      
      if (matchScore && parseInt(matchScore[1]) > 0) {
        console.log(`Found active user: ${handle}! Saving HTML.`);
        fs.writeFileSync(path.join(__dirname, `gfg_${handle}_active.html`), html);
      }
    } catch (err) {
      console.log(`Failed for ${handle}:`, err.message);
    }
  }
};

run();
