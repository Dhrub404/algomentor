const axios = require("axios");

const testAPI = async () => {
  try {
    const baseUrl = "http://localhost:5000/api";
    console.log("1. Simulating Admin / User Authentication via POST /auth/login...");
    
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: "test@algomentor.com",
      password: "Test@123"
    });

    const { token, _id, username } = loginRes.data;
    console.log(`✓ Authentication successful! Token: ${token.substring(0, 20)}...`);
    console.log(`✓ Authenticated User: ${username} (ID: ${_id})`);

    // Set auth header globally for axios
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    console.log("\n2. Fetching weakness diagnostics via GET /dashboard/weakness/:userId...");
    const weaknessRes = await axios.get(`${baseUrl}/dashboard/weakness/${_id}`);
    console.log(`✓ Status: ${weaknessRes.status}`);
    console.log(`✓ Weakness Diagnostics Count: ${weaknessRes.data.length}`);
    if (weaknessRes.data.length > 0) {
      console.log(`  Top weakness: ${weaknessRes.data[0].subtopic} (${weaknessRes.data[0].weaknessScore}% weakness)`);
    }

    console.log("\n3. Fetching daily practice sheet via GET /practice/daily/:userId...");
    const practiceRes = await axios.get(`${baseUrl}/practice/daily/${_id}`);
    console.log(`✓ Status: ${practiceRes.status}`);
    console.log(`✓ Practice problems returned: ${practiceRes.data.problems.length}`);
    console.log(`✓ Cache Status: ${practiceRes.data.completedProblems ? "Dynamic Caching Active" : "No Caching"}`);

    if (practiceRes.data.problems.length > 0) {
      const prob = practiceRes.data.problems[0];
      console.log(`  First practice problem: ${prob.title} (${prob.platform}, reason: ${prob.reason})`);
      
      console.log("\n4. Simulating completing problem via POST /practice/complete...");
      const completeRes = await axios.post(`${baseUrl}/practice/complete`, {
        problemId: prob._id
      });
      console.log(`✓ Status: ${completeRes.status}`);
      console.log(`✓ Response Message: ${completeRes.data.message}`);
    }

    console.log("\nAPI integration validation completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("API validation failed:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

testAPI();
