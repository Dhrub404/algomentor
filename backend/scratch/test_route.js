const mongoose = require("mongoose");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const { calculateLeaderboardScore } = require("../utils/scoreCalculator");
require("dotenv").config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/algomentor";
    await mongoose.connect(mongoUri);
    console.log("Connected successfully to DB!");

    const users = await User.find({}).select(
      "username name currentLevel codeforcesHandle leetcodeHandle codechefHandle gfgHandle hackerrankHandle codingNinjasHandle hackerEarthHandle branch batch college usn createdAt"
    );
    const progressList = await UserProgress.find({});
    const performances = await TopicPerformance.find({});

    console.log(`Fetched ${users.length} users, ${progressList.length} progress profiles, ${performances.length} performances.`);

    const leaderboardData = users.map((user) => {
      const progress = progressList.find(
        (p) => p.userId.toString() === user._id.toString()
      );
      const userPerfs = performances.filter(
        (p) => p.userId.toString() === user._id.toString()
      );

      const solvedCount = progress ? progress.solvedProblems.length : 0;

      let streak = 0;
      if (progress && progress.lastActivityDate) {
        const diffTime = Math.abs(Date.now() - new Date(progress.lastActivityDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          streak = Math.max(1, (solvedCount % 7) + 1); 
        }
      }

      const solvedByPlatform = {
        leetcode: 0,
        codeforces: 0,
        codechef: 0,
        geeksforgeeks: 0,
        hackerrank: 0,
        codingninjas: 0,
        hackerearth: 0
      };

      userPerfs.forEach((perf) => {
        const platform = perf.platform;
        const solved = perf.totalSolved || 0;
        if (solvedByPlatform[platform] !== undefined) {
          solvedByPlatform[platform] += solved;
        } else if (platform === "combined") {
          solvedByPlatform.leetcode += Math.round(solved * 0.5);
          solvedByPlatform.codeforces += Math.round(solved * 0.5);
        }
      });

      const finalScore = calculateLeaderboardScore(user, {
        solvedCount,
        streak,
        solvedByPlatform
      });

      return {
        username: user.username,
        solvedCount,
        score: finalScore,
        finalScore,
        streak
      };
    });

    leaderboardData.sort((a, b) => b.finalScore - a.finalScore);
    console.log("Leaderboard standings from DB:");
    console.log(leaderboardData);

    await mongoose.disconnect();
    console.log("DB disconnected.");
  } catch (err) {
    console.error("Test failed:", err);
  }
};

run();
