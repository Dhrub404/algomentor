const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const TopicPerformance = require("../models/TopicPerformance");
const ProblemMapping = require("../models/ProblemMapping");
const Topic = require("../models/Topic");

const { getCodeforcesData } = require("../platforms/codeforces");
const { getLeetCodeData } = require("../platforms/leetcode");
const {
  getCodeChefData,
  getGeeksForGeeksData,
  getHackerRankData,
  getCodingNinjasData,
  getHackerEarthData
} = require("../platforms/simulatedPlatforms");
const normalizeData = require("../utils/normalizeData");

const { calculatePerformanceScores } = require("../engines/weaknessEngine");
const { evaluateUnlocks } = require("../engines/unlockEngine");
const { calculateStreaks, calculateTodaySolved } = require("../utils/streakUtilities");
const { calculateLeaderboardScore } = require("../utils/scoreCalculator");

// Helper to construct profile JSON response dynamically
const buildProfileResponse = async (user, userProgress, performances) => {
  const streakData = calculateStreaks(userProgress.submissions);
  const todaySolved = calculateTodaySolved(userProgress.submissions);

  const solvedByPlatform = {
    leetcode: 0,
    codeforces: 0,
    codechef: 0,
    geeksforgeeks: 0,
    hackerrank: 0,
    codingninjas: 0,
    hackerearth: 0
  };
  performances.forEach((perf) => {
    const platform = perf.platform;
    const solved = perf.totalSolved || 0;
    if (solvedByPlatform[platform] !== undefined) {
      solvedByPlatform[platform] += solved;
    } else if (platform === "combined") {
      solvedByPlatform.leetcode += Math.round(solved * 0.5);
      solvedByPlatform.codeforces += Math.round(solved * 0.5);
    }
  });

  const totalScore = calculateLeaderboardScore(user, userProgress, {
    solvedCount: userProgress.solvedProblems?.length || 0,
    streak: streakData.currentStreak,
    solvedByPlatform
  });

  // Temporarily log for debugging (SECTION 14 requirements)
  console.log("Fetched platform data:", userProgress.platformStats);
  console.log("Calculated streak:", streakData);
  console.log("Heatmap submissions count:", userProgress.submissions ? userProgress.submissions.length : 0);

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      codeforcesHandle: user.codeforcesHandle,
      leetcodeHandle: user.leetcodeHandle,
      codechefHandle: user.codechefHandle || "",
      gfgHandle: user.gfgHandle || "",
      hackerrankHandle: user.hackerrankHandle || "",
      codingNinjasHandle: user.codingNinjasHandle || "",
      hackerEarthHandle: user.hackerEarthHandle || "",
      name: user.name || "",
      branch: user.branch || "",
      batch: user.batch || "",
      college: user.college || "",
      usn: user.usn || "",
      currentLevel: user.currentLevel,
      studiedTopics: user.studiedTopics,
      createdAt: user.createdAt
    },
    progress: userProgress,
    performances: performances || [],
    streakData,
    todaySolved,
    totalScore
  };
};

// Helper to perform full platform sync for a user
const syncPlatformData = async (user) => {
  const cfHandle = user.codeforcesHandle;
  const lcHandle = user.leetcodeHandle;
  const ccHandle = user.codechefHandle;
  const gfgHandle = user.gfgHandle;
  const hrHandle = user.hackerrankHandle;
  const cnHandle = user.codingNinjasHandle;
  const heHandle = user.hackerEarthHandle;

  if (!cfHandle && !lcHandle && !ccHandle && !gfgHandle && !hrHandle && !cnHandle && !heHandle) {
    return { message: "No handles connected" };
  }

  try {
    // 0. Load existing UserProgress to check cache
    let userProgress = await UserProgress.findOne({ userId: user._id });
    if (!userProgress) {
      userProgress = new UserProgress({ userId: user._id, platformStats: new Map() });
    }

    const isCacheValid = (platformId, handle) => {
      if (!userProgress || !userProgress.platformStats) return false;
      const cached = typeof userProgress.platformStats.get === "function"
        ? userProgress.platformStats.get(platformId)
        : userProgress.platformStats[platformId];
      if (!cached || cached.error) return false;
      if (cached.username !== handle) return false;
      
      const fetchedAt = cached.fetchedAt;
      if (!fetchedAt) return false;
      
      const ageMs = Date.now() - new Date(fetchedAt).getTime();
      return ageMs < 15 * 60 * 1000; // 15 minutes TTL
    };

    const getCachedData = (platformId) => {
      return typeof userProgress.platformStats.get === "function"
        ? userProgress.platformStats.get(platformId)
        : userProgress.platformStats[platformId];
    };

    const cfDataCached = cfHandle && isCacheValid("codeforces", cfHandle);
    const lcDataCached = lcHandle && isCacheValid("leetcode", lcHandle);
    const ccDataCached = ccHandle && isCacheValid("codechef", ccHandle);
    const gfgDataCached = gfgHandle && isCacheValid("geeksforgeeks", gfgHandle);
    const hrDataCached = hrHandle && isCacheValid("hackerrank", hrHandle);
    const cnDataCached = cnHandle && isCacheValid("codingninjas", cnHandle);
    const heDataCached = heHandle && isCacheValid("hackerearth", heHandle);

    // 1. Fetch raw data from connected platforms in parallel (only if not cached)
    const [cfRaw, lcRaw, ccRaw, gfgRaw, hrRaw, cnRaw, heRaw] = await Promise.all([
      (cfHandle && !cfDataCached) ? getCodeforcesData(cfHandle) : Promise.resolve(null),
      (lcHandle && !lcDataCached) ? getLeetCodeData(lcHandle) : Promise.resolve(null),
      (ccHandle && !ccDataCached) ? getCodeChefData(ccHandle) : Promise.resolve(null),
      (gfgHandle && !gfgDataCached) ? getGeeksForGeeksData(gfgHandle) : Promise.resolve(null),
      (hrHandle && !hrDataCached) ? getHackerRankData(hrHandle) : Promise.resolve(null),
      (cnHandle && !cnDataCached) ? getCodingNinjasData(cnHandle) : Promise.resolve(null),
      (heHandle && !heDataCached) ? getHackerEarthData(heHandle) : Promise.resolve(null)
    ]);

    // 2. Normalize fresh data
    const cfDataFresh = cfRaw ? normalizeData("codeforces", cfRaw) : null;
    const lcDataFresh = lcRaw ? normalizeData("leetcode", lcRaw) : null;
    const ccDataFresh = ccRaw ? normalizeData("codechef", ccRaw) : null;
    const gfgDataFresh = gfgRaw ? normalizeData("geeksforgeeks", gfgRaw) : null;
    const hrDataFresh = hrRaw ? normalizeData("hackerrank", hrRaw) : null;
    const cnDataFresh = cnRaw ? normalizeData("codingninjas", cnRaw) : null;
    const heDataFresh = heRaw ? normalizeData("hackerearth", heRaw) : null;

    // Resolve final data (fresh or cached)
    const cfData = cfDataCached ? getCachedData("codeforces") : cfDataFresh;
    const lcData = lcDataCached ? getCachedData("leetcode") : lcDataFresh;
    const ccData = ccDataCached ? getCachedData("codechef") : ccDataFresh;
    const gfgData = gfgDataCached ? getCachedData("geeksforgeeks") : gfgDataFresh;
    const hrData = hrDataCached ? getCachedData("hackerrank") : hrDataFresh;
    const cnData = cnDataCached ? getCachedData("codingninjas") : cnDataFresh;
    const heData = heDataCached ? getCachedData("hackerearth") : heDataFresh;

    // Debugging logs (SECTION 9 requirements)
    const codechefData = ccData;
    const hackerRankData = hrData;
    console.log("CodeChef fetch result:", codechefData);
    console.log("GFG fetch result:", gfgData);
    console.log("HackerRank fetch result:", hackerRankData);

    // 3. Aggregate all normalized submissions
    let allSubmissions = [];
    if (cfData && cfData.submissions) allSubmissions = allSubmissions.concat(cfData.submissions);
    if (lcData && lcData.submissions) allSubmissions = allSubmissions.concat(lcData.submissions);
    if (ccData && ccData.submissions) allSubmissions = allSubmissions.concat(ccData.submissions);
    if (gfgData && gfgData.submissions) allSubmissions = allSubmissions.concat(gfgData.submissions);
    if (hrData && hrData.submissions) allSubmissions = allSubmissions.concat(hrData.submissions);
    if (cnData && cnData.submissions) allSubmissions = allSubmissions.concat(cnData.submissions);
    if (heData && heData.submissions) allSubmissions = allSubmissions.concat(heData.submissions);

    // Save platformStats map
    userProgress.platformStats = new Map();
    if (cfHandle) userProgress.platformStats.set("codeforces", cfData || { error: true, fetchedAt: new Date() });
    if (lcHandle) userProgress.platformStats.set("leetcode", lcData || { error: true, fetchedAt: new Date() });
    if (ccHandle) userProgress.platformStats.set("codechef", ccData || { error: true, fetchedAt: new Date() });
    if (gfgHandle) userProgress.platformStats.set("geeksforgeeks", gfgData || { error: true, fetchedAt: new Date() });
    if (hrHandle) userProgress.platformStats.set("hackerrank", hrData || { error: true, fetchedAt: new Date() });
    if (cnHandle) userProgress.platformStats.set("codingninjas", cnData || { error: true, fetchedAt: new Date() });
    if (heHandle) userProgress.platformStats.set("hackerearth", heData || { error: true, fetchedAt: new Date() });

    // Merge submissions
    const existingSubmissions = userProgress.submissions || [];
    const subMap = new Map();
    const makeKey = (sub) => {
      const time = new Date(sub.timestamp).getTime();
      return `${sub.platform}_${sub.problemId}_${sub.result}_${time}`;
    };
    existingSubmissions.forEach(sub => {
      subMap.set(makeKey(sub), sub);
    });
    allSubmissions.forEach(sub => {
      subMap.set(makeKey(sub), sub);
    });
    userProgress.submissions = Array.from(subMap.values());
    userProgress.lastSynced = new Date();
    userProgress.lastActivityDate = new Date();

    let solvedCountLength = 0;
    let unlockedCountLength = userProgress.unlockedSubtopics ? userProgress.unlockedSubtopics.length : 0;

    if (userProgress.submissions.length > 0) {
      // Sort submissions by time ascending to process sequentially
      userProgress.submissions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Find all problem mapping entries in our database that are in the user's submission history
      const problemIdsInHistory = userProgress.submissions.map((sub) => sub.problemId);
      const mappings = await ProblemMapping.find({
        platformProblemId: { $in: problemIdsInHistory }
      });

      const mappingMap = {}; // mapping by platformProblemId
      mappings.forEach((m) => {
        mappingMap[m.platformProblemId] = m;
      });

      // Compute statistics grouped by subtopic
      const subtopicStats = {};

      userProgress.submissions.forEach((sub) => {
        const match = mappingMap[sub.problemId];
        if (!match) return; // problem not mapped in our DSA taxonomy

        const subName = match.subtopic;
        if (!subtopicStats[subName]) {
          subtopicStats[subName] = {
            topic: match.topic,
            problems: {}
          };
        }

        if (!subtopicStats[subName].problems[sub.problemId]) {
          subtopicStats[subName].problems[sub.problemId] = {
            solved: false,
            wrongAttempts: 0,
            attempts: 0,
            lastTime: sub.timestamp
          };
        }

        const pStat = subtopicStats[subName].problems[sub.problemId];
        pStat.attempts += 1;
        pStat.lastTime = sub.timestamp > pStat.lastTime ? sub.timestamp : pStat.lastTime;

        if (sub.result === "AC") {
          pStat.solved = true;
        } else {
          pStat.wrongAttempts += 1;
        }
      });

      // Merge newly solved problem object IDs into userProgress.solvedProblems
      const solvedProblemObjectIds = [];
      mappings.forEach((m) => {
        const subName = m.subtopic;
        const isAc = subtopicStats[subName]?.problems[m.platformProblemId]?.solved;
        if (isAc && !userProgress.solvedProblems.includes(m._id)) {
          solvedProblemObjectIds.push(m._id);
        }
      });

      if (solvedProblemObjectIds.length > 0) {
        // Avoid duplicate additions
        const existingSet = new Set(userProgress.solvedProblems.map((id) => id.toString()));
        solvedProblemObjectIds.forEach((id) => {
          if (!existingSet.has(id.toString())) {
            userProgress.solvedProblems.push(id);
          }
        });
      }
      solvedCountLength = solvedProblemObjectIds.length;

      // Update TopicPerformance database records
      const topicsList = await Topic.find({});
      
      // Create a flat dictionary of subtopic difficulties for score weightings
      const subtopicDifficultyMap = {};
      topicsList.forEach((t) => {
        t.subtopics.forEach((s) => {
          subtopicDifficultyMap[s.name] = s.difficulty;
        });
      });

      for (const subtopicName of Object.keys(subtopicStats)) {
        const stats = subtopicStats[subtopicName];
        const problemsArray = Object.values(stats.problems);

        const totalAttempted = problemsArray.length;
        const totalSolved = problemsArray.filter((p) => p.solved).length;
        const wrongAttempts = problemsArray.reduce((acc, curr) => acc + curr.wrongAttempts, 0);
        const lastPracticed = new Date(Math.max(...problemsArray.map((p) => new Date(p.lastTime).getTime())));

        // Find or create performance entry
        let performance = await TopicPerformance.findOne({
          userId: user._id,
          subtopic: subtopicName
        });

        if (!performance) {
          performance = new TopicPerformance({
            userId: user._id,
            subtopic: subtopicName,
            topic: stats.topic
          });
        }

        performance.totalAttempted = totalAttempted;
        performance.totalSolved = totalSolved;
        performance.wrongAttempts = wrongAttempts;
        performance.lastPracticed = lastPracticed;

        // Determine platform
        const subProblems = Object.keys(stats.problems);
        const platformsUsed = new Set();
        subProblems.forEach((pid) => {
          const platform = mappingMap[pid]?.platform;
          if (platform) platformsUsed.add(platform);
        });
        performance.platform = platformsUsed.size > 1 ? "combined" : (platformsUsed.values().next().value || "combined");

        // Calculate weakness and mastery scores
        const difficulty = subtopicDifficultyMap[subtopicName] || "easy";
        const scores = calculatePerformanceScores(performance, difficulty);

        performance.accuracy = scores.accuracy;
        performance.consistencyScore = scores.consistencyScore;
        performance.difficultyWeight = scores.difficultyWeight;
        performance.masteryScore = scores.masteryScore;
        performance.weaknessScore = scores.weaknessScore;

        await performance.save();

        // Update mastery inside progress Map
        userProgress.mastery.set(subtopicName, scores.masteryScore);
      }

      // Re-calculate unlocks
      const allPerformances = await TopicPerformance.find({ userId: user._id });
      const newlyUnlockedSubtopics = await evaluateUnlocks(
        allPerformances,
        topicsList,
        userProgress.overrideUnlockThreshold,
        userProgress.forcedUnlockedSubtopics,
        userProgress.forcedLockedSubtopics
      );
      userProgress.unlockedSubtopics = newlyUnlockedSubtopics;
      unlockedCountLength = newlyUnlockedSubtopics.length;
    }

    await userProgress.save();

    return {
      message: "Sync complete!",
      solvedCount: solvedCountLength,
      unlockedCount: unlockedCountLength
    };
  } catch (err) {
    console.error("Platform Sync Fatal Error:", err);
    throw err;
  }
};



// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Auto-sync platform data on profile load to fetch fresh values
    try {
      await syncPlatformData(user);
    } catch (syncErr) {
      console.warn("Auto-sync failed on profile load, continuing with current stats:", syncErr.message);
    }

    const progress = await UserProgress.findOne({ userId: user._id });
    const performances = await TopicPerformance.find({ userId: user._id });

    let userProgress = progress;
    const topicsList = await Topic.find({});
    
    if (!userProgress) {
      const initialUnlocked = [];
      topicsList.forEach((t) => {
        t.subtopics.forEach((s) => {
          if (!s.prerequisites || s.prerequisites.length === 0) {
            initialUnlocked.push(s.name);
          }
        });
      });

      userProgress = new UserProgress({
        userId: user._id,
        unlockedSubtopics: initialUnlocked,
        completedSubtopics: [],
        mastery: {}
      });
      await userProgress.save();
    } else {
      const newlyUnlockedSubtopics = await evaluateUnlocks(
        performances,
        topicsList,
        userProgress.overrideUnlockThreshold,
        userProgress.forcedUnlockedSubtopics,
        userProgress.forcedLockedSubtopics
      );
      userProgress.unlockedSubtopics = newlyUnlockedSubtopics;
      await userProgress.save();
    }

    const responsePayload = await buildProfileResponse(user, userProgress, performances);
    res.json(responsePayload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile & Onboarding
// @route   PUT /api/user/update
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fields that can be updated
    if (req.body.currentLevel) user.currentLevel = req.body.currentLevel;
    if (req.body.studiedTopics) user.studiedTopics = req.body.studiedTopics;
    if (req.body.codeforcesHandle !== undefined) user.codeforcesHandle = req.body.codeforcesHandle;
    if (req.body.leetcodeHandle !== undefined) user.leetcodeHandle = req.body.leetcodeHandle;
    if (req.body.codechefHandle !== undefined) user.codechefHandle = req.body.codechefHandle;
    if (req.body.gfgHandle !== undefined) user.gfgHandle = req.body.gfgHandle;
    if (req.body.hackerrankHandle !== undefined) user.hackerrankHandle = req.body.hackerrankHandle;
    if (req.body.codingNinjasHandle !== undefined) user.codingNinjasHandle = req.body.codingNinjasHandle;
    if (req.body.hackerEarthHandle !== undefined) user.hackerEarthHandle = req.body.hackerEarthHandle;
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.branch !== undefined) user.branch = req.body.branch;
    if (req.body.batch !== undefined) user.batch = req.body.batch;
    if (req.body.college !== undefined) user.college = req.body.college;
    if (req.body.usn !== undefined) user.usn = req.body.usn;

    await user.save();

    // Trigger initial UserProgress and Topic unlocks setup if it doesn't exist
    let progress = await UserProgress.findOne({ userId: user._id });
    if (!progress) {
      const topicsList = await Topic.find({});
      const initialUnlocked = [];
      topicsList.forEach((t) => {
        t.subtopics.forEach((s) => {
          if (!s.prerequisites || s.prerequisites.length === 0) {
            initialUnlocked.push(s.name);
          }
        });
      });

      progress = new UserProgress({
        userId: user._id,
        unlockedSubtopics: initialUnlocked,
        completedSubtopics: [],
        mastery: {}
      });
      await progress.save();
    }

    // If any handle is modified, run an immediate sync
    if (
      req.body.codeforcesHandle ||
      req.body.leetcodeHandle ||
      req.body.codechefHandle ||
      req.body.gfgHandle ||
      req.body.hackerrankHandle ||
      req.body.codingNinjasHandle ||
      req.body.hackerEarthHandle
    ) {
      try {
        await syncPlatformData(user);
      } catch (syncErr) {
        console.warn("Initial sync error during onboarding/profile update:", syncErr.message);
      }
    }

    const updatedProgress = await UserProgress.findOne({ userId: user._id });
    const updatedPerformances = await TopicPerformance.find({ userId: user._id });

    const responsePayload = await buildProfileResponse(user, updatedProgress, updatedPerformances);
    res.json(responsePayload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Connect platform handles and sync submissions
// @route   POST /api/user/connect-platform
// @access  Private
const connectPlatform = async (req, res) => {
  const {
    codeforcesHandle,
    leetcodeHandle,
    codechefHandle,
    gfgHandle,
    hackerrankHandle,
    codingNinjasHandle,
    hackerEarthHandle
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (codeforcesHandle !== undefined) user.codeforcesHandle = codeforcesHandle;
    if (leetcodeHandle !== undefined) user.leetcodeHandle = leetcodeHandle;
    if (codechefHandle !== undefined) user.codechefHandle = codechefHandle;
    if (gfgHandle !== undefined) user.gfgHandle = gfgHandle;
    if (hackerrankHandle !== undefined) user.hackerrankHandle = hackerrankHandle;
    if (codingNinjasHandle !== undefined) user.codingNinjasHandle = codingNinjasHandle;
    if (hackerEarthHandle !== undefined) user.hackerEarthHandle = hackerEarthHandle;

    await user.save();

    console.log(`Starting sync for user ${user.username}...`);
    
    // Perform data synchronization
    const syncResult = await syncPlatformData(user);

    // Refetch final data to return
    const progress = await UserProgress.findOne({ userId: user._id });
    const performances = await TopicPerformance.find({ userId: user._id });

    const responsePayload = await buildProfileResponse(user, progress, performances);
    responsePayload.syncResult = syncResult;
    responsePayload.message = "Handles connected and data synchronized successfully";

    res.json(responsePayload);
  } catch (error) {
    console.error("Connect platform error:", error.message);
    res.status(500).json({ message: `Sync failed: ${error.message}` });
  }
};

module.exports = { getUserProfile, updateUserProfile, connectPlatform, syncPlatformData };
