const axios = require("axios");

const testDhruvLogin = async () => {
  try {
    const baseUrl = "http://localhost:5000/api";
    console.log("1. Logging in as dhruvmahajan174 via POST /auth/login...");
    
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: "dhruvmahajan174",
      password: "Test@123"
    });

    const { token, _id, username } = loginRes.data;
    console.log(`✓ Authentication successful! Token: ${token.substring(0, 20)}...`);
    console.log(`✓ Authenticated User: ${username} (ID: ${_id})`);

    // Verify token with headers
    console.log("\n2. Fetching user profile via GET /user/profile with Authorization Header...");
    const profileRes = await axios.get(`${baseUrl}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Status: ${profileRes.status}`);
    console.log(`✓ User Name in Profile: ${profileRes.data.user.name}`);
    console.log(`✓ Studied Topics: ${profileRes.data.user.studiedTopics.join(", ")}`);
    console.log(`✓ Subtopic Mastery keys: ${Object.keys(profileRes.data.progress.mastery || {}).length}`);
    console.log(`✓ Leetcode Solved Stats: ${profileRes.data.progress.platformStats.leetcode?.solved}`);
    console.log(`✓ Codeforces Rating: ${profileRes.data.progress.platformStats.codeforces?.rating}`);
    console.log(`✓ CodeChef Stars: ${profileRes.data.progress.platformStats.codechef?.stars}`);
    console.log(`✓ GeeksForGeeks Score: ${profileRes.data.progress.platformStats.geeksforgeeks?.score}`);
    console.log(`✓ HackerRank Score: ${profileRes.data.progress.platformStats.hackerrank?.score}`);

    // Verify token validation in query params
    console.log("\n3. Fetching user profile via GET /user/profile with token in Query Params...");
    const profileQueryRes = await axios.get(`${baseUrl}/user/profile?token=${token}`);
    console.log(`✓ Status: ${profileQueryRes.status}`);
    console.log(`✓ User Name: ${profileQueryRes.data.user.name}`);

    console.log("\nAll dhruvmahajan174 login and API integrations validated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

testDhruvLogin();
