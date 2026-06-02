const axios = require("axios");

const testDecayAlertEndpoint = async () => {
  try {
    const baseUrl = "http://localhost:5000/api";
    console.log("1. Logging in as dhruvmahajan174...");
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: "dhruvmahajan174",
      password: "Test@123"
    });

    const { token } = loginRes.data;
    console.log("Token obtained.");

    console.log("2. Fetching GET /dashboard/decay-alert...");
    const response = await axios.get(`${baseUrl}/dashboard/decay-alert`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Status:", response.status);
    console.log("Response Body:", JSON.stringify(response.data, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Failed:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

testDecayAlertEndpoint();
