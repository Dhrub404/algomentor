const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { getCodeChefData, getGeeksForGeeksData, getHackerRankData } = require("../platforms/simulatedPlatforms");
const normalizeData = require("../utils/normalizeData");

const runTest = async () => {
  console.log("=== TESTING REAL PLATFORM FETCHES ===");
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/algomentor");
    console.log("Connected successfully!");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
  
  // 1. CodeChef: tourist
  try {
    console.log("\nFetching CodeChef for 'tourist'...");
    const rawCc = await getCodeChefData("tourist");
    console.log("Raw CodeChef Response keys:", Object.keys(rawCc));
    if (rawCc.error) {
      console.log("CodeChef returned error status.");
    } else {
      const ccNorm = normalizeData("codechef", rawCc);
      console.log("Normalized CodeChef Stats:", ccNorm ? ccNorm.stats : "null");
    }
  } catch (err) {
    console.error("CodeChef test threw error:", err.message);
  }

  // 2. GeeksForGeeks: gfg_user
  try {
    console.log("\nFetching GFG for 'gfg_user'...");
    const rawGfg = await getGeeksForGeeksData("gfg_user");
    console.log("Raw GFG Response keys:", Object.keys(rawGfg));
    if (rawGfg.error) {
      console.log("GFG returned error status.");
    } else {
      const gfgNorm = normalizeData("geeksforgeeks", rawGfg);
      console.log("Normalized GFG Stats:", gfgNorm ? gfgNorm.stats : "null");
    }
  } catch (err) {
    console.error("GFG test threw error:", err.message);
  }

  // 3. HackerRank: dheeraj
  try {
    console.log("\nFetching HackerRank for 'dheeraj'...");
    const rawHr = await getHackerRankData("dheeraj");
    console.log("Raw HackerRank Response keys:", Object.keys(rawHr));
    if (rawHr.error) {
      console.log("HackerRank returned error status.");
    } else {
      const hrNorm = normalizeData("hackerrank", rawHr);
      console.log("Normalized HackerRank Stats:", hrNorm ? hrNorm.stats : "null");
    }
  } catch (err) {
    console.error("HackerRank test threw error:", err.message);
  }

  console.log("\nClosing database connection...");
  await mongoose.disconnect();
  console.log("=== TEST COMPLETED ===");
};

runTest();
