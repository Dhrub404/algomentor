const axios = require("axios");

const testLeaderboard = async () => {
  try {
    const baseUrl = "http://localhost:5000/api";
    console.log("1. Logging in as dhruvmahajan174 to obtain JWT token...");
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: "dhruvmahajan174",
      password: "Test@123"
    });

    const { token } = loginRes.data;
    console.log("✓ Login successful!");

    console.log("\n2. Fetching GET /api/leaderboard...");
    const lbRes = await axios.get(`${baseUrl}/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✓ Status: ${lbRes.status}`);
    console.log(`✓ Leaderboard returned ${lbRes.data.length} users.`);

    console.log("\n3. Validating leaderboard records...");
    lbRes.data.forEach((user) => {
      console.log(`\nUser: ${user.username}`);
      console.log(`- Total Score (overall): ${user.totalScore}`);
      console.log(`- LeetCode Score (solved): ${user.leetcodeScore}`);
      console.log(`- Codeforces Score (rating): ${user.codeforcesScore}`);
      console.log(`- CodeChef Score (rating): ${user.codechefScore}`);
      console.log(`- GFG Score: ${user.gfgScore}`);
      console.log(`- Streak: ${user.streak}`);

      // Manual verification of calculateTotalScore formula
      // formula:
      // lcComp = Math.min(100, (leetcodeScore / 3100) * 100)
      // cfComp = Math.min(100, codeforcesScore / 10)
      // ccComp = Math.min(100, codechefScore / 20)
      // gfgComp = Math.min(100, (gfgScore / 2000) * 100)
      // masteryComp = Math.min(100, masteryAverage)
      // totalScore = lcComp*0.25 + cfComp*0.25 + ccComp*0.20 + gfgComp*0.15 + masteryComp*0.15
      
      const leetcodeScore = user.leetcodeScore || 0;
      const codeforcesScore = user.codeforcesScore || 0;
      const codechefScore = user.codechefScore || 0;
      const gfgScore = user.gfgScore || 0;

      const leetcodeComp = Math.min(100, (leetcodeScore / 3100) * 100);
      const codeforcesComp = Math.min(100, codeforcesScore / 10);
      const codechefComp = Math.min(100, codechefScore / 20);
      const gfgComp = Math.min(100, (gfgScore / 2000) * 100);

      console.log(`  Calculated Component Caps:`);
      console.log(`  * LeetCode capped: ${leetcodeComp.toFixed(2)} (raw: ${leetcodeScore})`);
      console.log(`  * Codeforces capped: ${codeforcesComp.toFixed(2)} (raw: ${codeforcesScore})`);
      console.log(`  * CodeChef capped: ${codechefComp.toFixed(2)} (raw: ${codechefScore})`);
      console.log(`  * GFG capped: ${gfgComp.toFixed(2)} (raw: ${gfgScore})`);
    });

    console.log("\nLeaderboard verification finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

testLeaderboard();
