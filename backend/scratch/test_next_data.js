const axios = require("axios");

const testGFG = async (username) => {
  const url = `https://auth.geeksforgeeks.org/user/${username}/practice/`;
  try {
    console.log(`Fetching GFG Practice HTML for ${username}: ${url}`);
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    const html = res.data;
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (match) {
      console.log("__NEXT_DATA__ script tag found!");
      const parsed = JSON.parse(match[1]);
      if (parsed.props && parsed.props.pageProps && parsed.props.pageProps.userInfo) {
        const info = parsed.props.pageProps.userInfo;
        console.log("User stats summary for " + username + ":", {
          score: info.coding_score,
          solved: info.total_problems_solved,
          rank: info.institute_rank,
          monthlyScore: info.monthly_score || info.monthly_score_gfg
        });
      } else {
        console.log("pageProps/userInfo not found in Next data.");
      }
    } else {
      console.log("__NEXT_DATA__ script tag NOT found.");
    }
  } catch (err) {
    console.log("GFG test failed:", err.message);
  }
};

testGFG("dheeraj");
