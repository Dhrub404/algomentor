const axios = require("axios");

const getCodeforcesData = async (handle) => {
  if (!handle) {
    return {
      platform: "codeforces",
      info: null,
      submissions: [],
      ratingHistory: []
    };
  }

  try {
    const infoUrl = `https://codeforces.com/api/user.info?handles=${handle}`;
    const statusUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=200`;
    const ratingUrl = `https://codeforces.com/api/user.rating?handle=${handle}`;

    const [infoRes, statusRes, ratingRes] = await Promise.all([
      axios.get(infoUrl).catch(() => null),
      axios.get(statusUrl).catch(() => null),
      axios.get(ratingUrl).catch(() => null)
    ]);

    const info = infoRes && infoRes.data.status === "OK" ? infoRes.data.result[0] : null;
    const submissions = statusRes && statusRes.data.status === "OK" ? statusRes.data.result : [];
    const ratingHistory = ratingRes && ratingRes.data.status === "OK" ? ratingRes.data.result : [];

    return {
      platform: "codeforces",
      info,
      submissions,
      ratingHistory
    };
  } catch (error) {
    console.error("Codeforces API Integration Error:", error.message);
    return {
      platform: "codeforces",
      info: null,
      submissions: [],
      ratingHistory: []
    };
  }
};

module.exports = { getCodeforcesData };
