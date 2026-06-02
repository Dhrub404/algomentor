const axios = require("axios");

const testHandles = ["dheeraj", "tourist", "gfg_user", "test"];

const run = async () => {
  for (const handle of testHandles) {
    const url = `https://www.hackerrank.com/rest/contests/master/hackers/${handle}/profile`;
    try {
      console.log(`Fetching HackerRank for ${handle}: ${url}`);
      const res = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        },
        timeout: 10000
      });
      console.log(`Status for ${handle}: ${res.status}`);
      if (res.data && res.data.model) {
        const m = res.data.model;
        console.log(`HackerRank Model for ${handle}:`, {
          id: m.id,
          username: m.username,
          score: m.score,
          solved: m.solved_problems_count,
          level: m.level,
          badges: m.badges,
          certs: m.certifications
        });
        // Dump full keys
        console.log("Model keys:", Object.keys(m));
      } else {
        console.log(`Response for ${handle} has no model field.`);
      }
    } catch (err) {
      console.log(`Failed for ${handle}:`, err.message);
    }
  }
};

run();
