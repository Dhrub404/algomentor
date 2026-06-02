const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { getCodeforcesData } = require("../platforms/codeforces");
const { getLeetCodeData } = require("../platforms/leetcode");
const { getCodeChefData, getGeeksForGeeksData, getHackerRankData } = require("../platforms/simulatedPlatforms");
const normalizeData = require("../utils/normalizeData");

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/algomentor");
    console.log("Connected successfully!");

    const cfHandle = "dhruvmahajan174";
    const lcHandle = "dhruvmahajan714";
    const ccHandle = "dhrub_mahajan";
    const gfgHandle = "dhruvmahajan123";
    const hrHandle = "dhruvmahajan714";

    console.log("\n1. Fetching Codeforces...");
    try {
      const cfRaw = await getCodeforcesData(cfHandle);
      console.log("Codeforces raw keys:", Object.keys(cfRaw));
    } catch (e) {
      console.error("Codeforces failed:", e.message);
    }

    console.log("\n2. Fetching LeetCode...");
    try {
      const lcRaw = await getLeetCodeData(lcHandle);
      console.log("LeetCode raw keys:", Object.keys(lcRaw));
    } catch (e) {
      console.error("LeetCode failed:", e.message);
    }

    console.log("\n3. Fetching CodeChef...");
    try {
      const ccRaw = await getCodeChefData(ccHandle);
      console.log("CodeChef raw keys:", Object.keys(ccRaw));
    } catch (e) {
      console.error("CodeChef failed:", e.message);
    }

    console.log("\n4. Fetching GFG...");
    try {
      const gfgRaw = await getGeeksForGeeksData(gfgHandle);
      console.log("GFG raw keys:", Object.keys(gfgRaw));
    } catch (e) {
      console.error("GFG failed:", e.message);
    }

    console.log("\n5. Fetching HackerRank...");
    try {
      const hrRaw = await getHackerRankData(hrHandle);
      console.log("HackerRank raw keys:", Object.keys(hrRaw));
    } catch (e) {
      console.error("HackerRank failed:", e.message);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Fatal Error:", err);
  }
};

run();
