const axios = require("axios");

const testCodeChef = async (username) => {
  console.log("\n--- TESTING CODECHEF ---");
  // Option 1: Unofficial API
  const apiUrl = `https://codechef-api.vercel.app/handle/${username}`;
  try {
    console.log(`Fetching CodeChef from unofficial API: ${apiUrl}`);
    const res = await axios.get(apiUrl, { timeout: 10000 });
    console.log("Option 1 Success:", res.data);
  } catch (err) {
    console.log("Option 1 Failed:", err.message);
  }

  // Option 2: Scraping URL
  const scrapeUrl = `https://www.codechef.com/users/${username}`;
  try {
    console.log(`Fetching CodeChef HTML from profile: ${scrapeUrl}`);
    const res = await axios.get(scrapeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    console.log("Option 2 HTML Status:", res.status);
    const html = res.data;
    
    // Parse rating, maxRating, stars, globalRank, countryRank via regex
    const ratingRegex = /<div class="rating-number">([^<]+)<\/div>/i;
    const matchRating = html.match(ratingRegex);
    console.log("Scraped rating match:", matchRating ? matchRating[1] : "not found");

    const maxRatingRegex = /href="\/ratings\/all">\(Highest Rating ([^)]+)\)<\/a>/i;
    const matchMax = html.match(maxRatingRegex);
    console.log("Scraped maxRating match:", matchMax ? matchMax[1] : "not found");
  } catch (err) {
    console.log("Option 2 Failed:", err.message);
  }
};

const testGFG = async (username) => {
  console.log("\n--- TESTING GEEKSFORGEEKS ---");
  // Option 1: Direct profile scraping
  const scrapeUrl = `https://auth.geeksforgeeks.org/user/${username}/`;
  try {
    console.log(`Fetching GFG HTML from profile: ${scrapeUrl}`);
    const res = await axios.get(scrapeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    console.log("GFG HTML Status:", res.status);
    const html = res.data;
    
    // Try to find the score, solved problems, and ranks via regex
    // GFG structures coding score inside <span class="scoreCard_cft_value"> or similar
    const codingScoreRegex = /Coding Score:?\s*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i;
    const matchScore = html.match(codingScoreRegex);
    console.log("Scraped score match 1:", matchScore ? matchScore[1] : "not found");

    // Check alternate pattern
    const scoreCardRegex = /<div class="score_card_value[^"]*">([^<]+)<\/div>/g;
    console.log("Scraped score cards:", html.match(scoreCardRegex));

    // Look for numbers like 145 or solved count
  } catch (err) {
    console.log("GFG Scraper Failed:", err.message);
  }

  // Option 2: Vercel API
  const vercelUrl = `https://geeks-for-geeks-stats-api.vercel.app/?userName=${username}`;
  try {
    console.log(`Fetching GFG from API: ${vercelUrl}`);
    const res = await axios.get(vercelUrl, { timeout: 10000 });
    console.log("GFG API Success:", res.data);
  } catch (err) {
    console.log("GFG API Failed:", err.message);
  }
};

const testHackerRank = async (username) => {
  console.log("\n--- TESTING HACKERRANK ---");
  // Option 1: Internal API
  const apiUrl = `https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`;
  try {
    console.log(`Fetching HackerRank from internal API: ${apiUrl}`);
    const res = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    console.log("HackerRank Internal API Success:", res.data ? Object.keys(res.data) : "empty");
    if (res.data && res.data.model) {
      console.log("HackerRank model keys:", Object.keys(res.data.model));
      console.log("Score/solved stats:", {
        score: res.data.model.score,
        solved: res.data.model.solved,
        level: res.data.model.level
      });
    }
  } catch (err) {
    console.log("HackerRank Internal API Failed:", err.message);
  }
};

const run = async () => {
  await testCodeChef("testuser_cc");
  await testGFG("testuser_gfg");
  await testHackerRank("testuser_hr");
};

run();
