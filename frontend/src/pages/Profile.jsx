import React, { useState, useEffect, useContext } from "react";
import useAuth from "../hooks/useAuth";
import { ThemeContext } from "../context/ThemeContext";
import {
  User, Award, Calendar, Mail, Flame, ExternalLink, ShieldCheck, AlertCircle, Edit3, X, Save, Zap
} from "lucide-react";

const Profile = () => {
  const { theme } = useContext(ThemeContext);
  const { user, progress, performances, streakData, todaySolved, totalScore, refetchUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [syncing, setSyncing] = useState(false);

  // Trigger real-time sync of platform data on page mount
  useEffect(() => {
    const performMountSync = async () => {
      setSyncing(true);
      await refetchUser();
      setSyncing(false);
    };
    performMountSync();
  }, []);

  // Debugging logs required by SECTION 14
  useEffect(() => {
    if (progress) {
      console.log("Fetched platform data:", progress.platformStats);
      console.log("Calculated streak:", streakData);
      console.log("Heatmap submissions:", progress.submissions);
    }
  }, [progress, streakData]);

  const getPlatformStats = (platformId) => {
    if (!progress || !progress.platformStats) return null;
    // Map serialization yields normal object, handle Mongoose Map or normal JS object keys
    const statsObj = progress.platformStats;
    if (typeof statsObj.get === "function") {
      return statsObj.get(platformId);
    }
    return statsObj[platformId];
  };

  const codechefData = getPlatformStats("codechef");
  const gfgData = getPlatformStats("geeksforgeeks");
  const hackerRankData = getPlatformStats("hackerrank");

  useEffect(() => {
    console.log("CodeChef data:", codechefData);
    console.log("GFG data:", gfgData);
    console.log("HackerRank data:", hackerRankData);
  }, [codechefData, gfgData, hackerRankData]);

  const majorTopics = [
    {
      name: "Arrays",
      subtopics: [
        "Stage 1 — Array Basics & Traversal",
        "Stage 2 — Prefix Sum",
        "Stage 3 — Difference Array",
        "Stage 4 — Kadane's Algorithm",
        "Stage 5 — Sliding Window Fixed Size",
        "Stage 6 — Sliding Window Variable Size",
        "Stage 7 — Two Pointers",
        "Stage 8 — Fast & Slow Pointers",
        "Stage 9 — Three Pointers & K-Sum",
        "Stage 10 — Frequency Count & Hashing",
        "Stage 11 — Sorting Techniques",
        "Stage 12 — Binary Search on Arrays"
      ]
    },
    {
      name: "Strings",
      subtopics: [
        "Stage 1 — String Basics",
        "Stage 2 — String Manipulation",
        "Stage 3 — Pattern Matching (KMP/Z)",
        "Stage 4 — Anagrams & Frequency Maps",
        "Stage 5 — Palindrome Problems",
        "Stage 6 — Sliding Window on Strings"
      ]
    },
    {
      name: "Hashing",
      subtopics: [
        "Stage 1 — HashMap Basics",
        "Stage 2 — Frequency & Count Problems",
        "Stage 3 — Two Sum Variants",
        "Stage 4 — Subarray with Given Sum",
        "Stage 5 — Longest Subarray Problems"
      ]
    },
    {
      name: "Binary Search",
      subtopics: [
        "Stage 1 — Classic Binary Search",
        "Stage 2 — Binary Search on Answer",
        "Stage 3 — Search in Rotated Array",
        "Stage 4 — BS on 2D Matrix",
        "Stage 5 — Aggressive Problems (Minimize Max)"
      ]
    },
    {
      name: "Recursion & Backtracking",
      subtopics: [
        "Stage 1 — Recursion Basics",
        "Stage 2 — Subset & Subsequence Generation",
        "Stage 3 — Permutations",
        "Stage 4 — Backtracking Basics",
        "Stage 5 — N-Queens & Sudoku Solver",
        "Stage 6 — Word Search & Maze Problems"
      ]
    },
    {
      name: "Linked List",
      subtopics: [
        "Stage 1 — LL Basics & Traversal",
        "Stage 2 — Reversal Problems",
        "Stage 3 — Fast & Slow Pointer on LL",
        "Stage 4 — Merge & Sort LL",
        "Stage 5 — Cycle Detection"
      ]
    },
    {
      name: "Stacks & Queues",
      subtopics: [
        "Stage 1 — Stack Basics",
        "Stage 2 — Monotonic Stack",
        "Stage 3 — Queue & Deque Basics",
        "Stage 4 — Sliding Window Maximum",
        "Stage 5 — Stack on Strings"
      ]
    },
    {
      name: "Trees",
      subtopics: [
        "Stage 1 — Tree Traversals (BFS/DFS)",
        "Stage 2 — Tree Height & Diameter",
        "Stage 3 — Binary Search Tree",
        "Stage 4 — Lowest Common Ancestor",
        "Stage 5 — Tree DP Problems",
        "Stage 6 — Views & Boundary Traversal"
      ]
    },
    {
      name: "Graphs",
      subtopics: [
        "Stage 1 — Graph Representation",
        "Stage 2 — BFS & DFS",
        "Stage 3 — Cycle Detection",
        "Stage 4 — Topological Sort",
        "Stage 5 — Shortest Path (Dijkstra/BFS)",
        "Stage 6 — Minimum Spanning Tree",
        "Stage 7 — Disjoint Set Union (DSU)",
        "Stage 8 — Strongly Connected Components"
      ]
    },
    {
      name: "Dynamic Programming",
      subtopics: [
        "Stage 1 — DP Basics & Memoization",
        "Stage 2 — 1D DP (Fibonacci, Climbing)",
        "Stage 3 — 0/1 Knapsack",
        "Stage 4 — Unbounded Knapsack",
        "Stage 5 — Longest Common Subsequence",
        "Stage 6 — Longest Increasing Subsequence",
        "Stage 7 — Matrix Chain / Interval DP",
        "Stage 8 — DP on Grids",
        "Stage 9 — DP on Trees",
        "Stage 10 — Bitmask DP"
      ]
    },
    {
      name: "Greedy",
      subtopics: [
        "Stage 1 — Greedy Basics",
        "Stage 2 — Interval Scheduling",
        "Stage 3 — Activity Selection",
        "Stage 4 — Huffman & Fractional Knapsack"
      ]
    },
    {
      name: "Bit Manipulation",
      subtopics: [
        "Stage 1 — Bit Basics",
        "Stage 2 — XOR Tricks",
        "Stage 3 — Bit Masking",
        "Stage 4 — Power of 2 Problems"
      ]
    },
    {
      name: "Math & Number Theory",
      subtopics: [
        "Stage 1 — Number Logic",
        "Stage 2 — Prime & Sieve",
        "Stage 3 — GCD, LCM, Modular Arithmetic",
        "Stage 4 — Combinatorics Basics"
      ]
    },
    {
      name: "Tries",
      subtopics: [
        "Stage 1 — Trie Basics",
        "Stage 2 — Word Search & Prefix Problems",
        "Stage 3 — XOR Trie"
      ]
    },
    {
      name: "Heaps & Priority Queue",
      subtopics: [
        "Stage 1 — Heap Basics",
        "Stage 2 — Kth Largest/Smallest",
        "Stage 3 — Merge K Sorted Lists",
        "Stage 4 — Sliding Window with Heap"
      ]
    }
  ];

  // Connected handles boolean checks
  const isLcConnected = !!user?.leetcodeHandle;
  const isCfConnected = !!user?.codeforcesHandle;
  const isCcConnected = !!user?.codechefHandle;
  const isGfgConnected = !!user?.gfgHandle;
  const isHrConnected = !!user?.hackerrankHandle;
  const isCnConnected = !!user?.codingNinjasHandle;
  const isHeConnected = !!user?.hackerEarthHandle;


  // Platform Details Data
  const platformsList = [
    {
      id: "leetcode",
      name: "LeetCode",
      handle: user?.leetcodeHandle,
      connected: isLcConnected,
      color: "border-l-amber-500",
      accentColor: "text-amber-500",
      url: `https://leetcode.com/${user?.leetcodeHandle}`,
      getStats: () => {
        const stats = getPlatformStats("leetcode");
        if (!stats) return [{ label: "Status", value: "Data unavailable" }];
        return [
          { label: "Total Solved", value: stats.totalSolved ?? "Data unavailable" },
          { label: "Difficulty", value: (stats.easy !== undefined && stats.medium !== undefined && stats.hard !== undefined) ? `E: ${stats.easy} | M: ${stats.medium} | H: ${stats.hard}` : "Data unavailable" },
          { label: "Contest Rating", value: stats.rating ? stats.rating.toLocaleString() : "0" },
          { label: "Global Rank", value: stats.rank ? stats.rank.toLocaleString() : "Data unavailable" }
        ];
      }
    },
    {
      id: "codeforces",
      name: "Codeforces",
      handle: user?.codeforcesHandle,
      connected: isCfConnected,
      color: "border-l-rose-500",
      accentColor: "text-rose-500",
      url: `https://codeforces.com/profile/${user?.codeforcesHandle}`,
      getStats: () => {
        const stats = getPlatformStats("codeforces");
        if (!stats) return [{ label: "Status", value: "Data unavailable" }];
        return [
          { label: "Rating", value: stats.rating ?? "Data unavailable" },
          { label: "Max Rating", value: stats.maxRating ?? "Data unavailable" },
          { label: "Rank Title", value: stats.rank || "Data unavailable" },
          { label: "Solved / Contests", value: `S: ${stats.totalSolved ?? 0} | C: ${stats.contests ?? 0}` }
        ];
      }
    },
    {
      id: "codechef",
      name: "CodeChef",
      handle: user?.codechefHandle,
      connected: isCcConnected,
      color: "border-l-yellow-600",
      accentColor: "text-yellow-600",
      url: `https://www.codechef.com/users/${user?.codechefHandle}`,
      getStats: () => {
        const stats = getPlatformStats("codechef");
        if (!stats) return [{ label: "Status", value: "Data unavailable" }];
        return [
          { label: "Rating", value: stats.rating ?? "Data unavailable" },
          { label: "Max Rating", value: stats.maxRating ?? "Data unavailable" },
          { label: "Stars", value: stats.stars || "Data unavailable" },
          { label: "Solved / Global Rank", value: `S: ${stats.totalSolved ?? 0} | R: ${stats.rank ? stats.rank.toLocaleString() : "Data unavailable"}` }
        ];
      }
    },
    {
      id: "geeksforgeeks",
      name: "GeeksforGeeks",
      handle: user?.gfgHandle,
      connected: isGfgConnected,
      color: "border-l-emerald-600",
      accentColor: "text-emerald-600",
      url: `https://auth.geeksforgeeks.org/user/${user?.gfgHandle}`,
      getStats: () => {
        const stats = getPlatformStats("geeksforgeeks");
        if (!stats) return [{ label: "Status", value: "Data unavailable" }];
        return [
          { label: "Score", value: stats.rating ?? "Data unavailable" },
          { label: "Total Solved", value: stats.totalSolved ?? "Data unavailable" },
          { label: "Institute Rank", value: stats.rank ? stats.rank.toLocaleString() : "Data unavailable" },
          { label: "Monthly Score", value: stats.maxRating ?? "Data unavailable" }
        ];
      }
    },
    {
      id: "hackerrank",
      name: "HackerRank",
      handle: user?.hackerrankHandle,
      connected: isHrConnected,
      color: "border-l-teal-500",
      accentColor: "text-teal-500",
      url: `https://www.hackerrank.com/${user?.hackerrankHandle}`,
      getStats: () => {
        const stats = getPlatformStats("hackerrank");
        if (!stats) return [{ label: "Status", value: "Data unavailable" }];
        return [
          { label: "Score", value: stats.rating ?? "Data unavailable" },
          { label: "Level", value: stats.rank ?? "Data unavailable" },
          { label: "Badges", value: stats.badges ?? "Data unavailable" },
          { label: "Certs / Solved", value: `C: ${stats.certs ?? 0} | S: ${stats.totalSolved ?? 0}` }
        ];
      }
    },
    {
      id: "codingninjas",
      name: "Coding Ninjas",
      handle: user?.codingNinjasHandle,
      connected: isCnConnected,
      color: "border-l-orange-500",
      accentColor: "text-orange-500",
      url: `https://www.naukri.com/code360/profile/${user?.codingNinjasHandle}`,
      getStats: () => {
        const stats = getPlatformStats("codingninjas");
        if (!stats) return [{ label: "Status", value: "Data unavailable" }];
        return [
          { label: "Total Solved", value: stats.totalSolved ?? "Data unavailable" },
          { label: "Points", value: stats.rating ?? "Data unavailable" },
          { label: "Accuracy", value: stats.accuracy || "Data unavailable" },
          { label: "Coding Rank", value: stats.rank ? stats.rank.toLocaleString() : "Data unavailable" }
        ];
      }
    },
    {
      id: "hackerearth",
      name: "HackerEarth",
      handle: user?.hackerEarthHandle,
      connected: isHeConnected,
      color: "border-l-purple-500",
      accentColor: "text-purple-500",
      url: `https://www.hackerearth.com/@${user?.hackerEarthHandle}`,
      getStats: () => {
        const stats = getPlatformStats("hackerearth");
        if (!stats) return [{ label: "Status", value: "Data unavailable" }];
        return [
          { label: "Points", value: stats.points ?? "Data unavailable" },
          { label: "Problems Solved", value: stats.totalSolved ?? "Data unavailable" },
          { label: "Rating", value: stats.rating ?? "Data unavailable" },
          { label: "Global Rank", value: stats.rank ? stats.rank.toLocaleString() : "Data unavailable" }
        ];
      }
    }
  ];

  // Heatmap generation logic
  const acSubmissions = (progress?.submissions || []).filter(sub => sub.result === "AC");
  const submissionsCountByDate = {};
  acSubmissions.forEach(sub => {
    const d = new Date(sub.timestamp);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      submissionsCountByDate[dateStr] = (submissionsCountByDate[dateStr] || 0) + 1;
    }
  });

  // Calculate startDate (365 days ago) aligned to Sunday
  const todayDate = new Date();
  const startDate = new Date();
  startDate.setDate(todayDate.getDate() - 365);
  const startDayOfWeek = startDate.getDay(); // 0 (Sun) to 6 (Sat)
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const weeks = [];
  let currentWeek = [];
  const tempDate = new Date(startDate);
  tempDate.setHours(0, 0, 0, 0);

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  while (tempDate <= todayMidnight || currentWeek.length > 0) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    if (tempDate > todayMidnight) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      break;
    }

    const y = tempDate.getFullYear();
    const m = String(tempDate.getMonth() + 1).padStart(2, "0");
    const d = String(tempDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const count = submissionsCountByDate[dateStr] || 0;

    currentWeek.push({
      dateStr,
      count,
      timestamp: new Date(tempDate)
    });

    tempDate.setDate(tempDate.getDate() + 1);
  }

  const totalSubmissionsPastYear = weeks.reduce((sum, w) => sum + w.reduce((wSum, day) => wSum + (day ? day.count : 0), 0), 0);
  const activeDaysCount = weeks.reduce((sum, w) => sum + w.filter(day => day && day.count > 0).length, 0);

  const getHeatmapColor = (count) => {
    if (count === 0) return "bg-[#2A2A2A] border border-slate-800/10";
    if (count <= 2) return "bg-[#0E4429] border border-emerald-950/10";
    if (count <= 4) return "bg-[#26A641] border border-emerald-500/10";
    if (count <= 6) return "bg-[#39D353] border border-emerald-400/10";
    return "bg-[#4FFF6D] border border-emerald-300/10";
  };

  const formatLastSynced = () => {
    if (!progress?.lastSynced) return "Never synced";
    const diffMs = Date.now() - new Date(progress.lastSynced).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Last synced just now";
    if (diffMins === 1) return "Last synced 1 min ago";
    if (diffMins < 60) return `Last synced ${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "Last synced 1 hour ago";
    return `Last synced ${diffHours} hours ago`;
  };

  const formatCardLastSynced = (fetchedAt) => {
    if (!fetchedAt) return "Never synced";
    const diffMs = Date.now() - new Date(fetchedAt).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Last synced just now";
    if (diffMins === 1) return "Last synced 1 min ago";
    if (diffMins < 60) return `Last synced ${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "Last synced 1 hour ago";
    return `Last synced ${diffHours} hours ago`;
  };

  const getCodeChefStarsString = (rating) => {
    let count = 1;
    if (rating < 1400) count = 1;
    else if (rating < 1600) count = 2;
    else if (rating < 1800) count = 3;
    else if (rating < 2000) count = 4;
    else if (rating < 2200) count = 5;
    else if (rating < 2500) count = 6;
    else count = 7;
    return "★".repeat(count);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-6xl mx-auto w-full pb-12 transition-colors duration-200">
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 shadow-sm">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-2xl text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.username?.slice(0, 2).toUpperCase()}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center justify-center sm:justify-start gap-2">
              {user?.name || user?.username}
              <span className="text-4xs font-mono font-semibold px-2 py-0.5 rounded-full border border-indigo-500/15 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {user?.currentLevel}
              </span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {user?.branch && user?.batch ? `${user.branch} · Batch of ${user.batch}` : "No branch & batch configured"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              {user?.college || "College not set"}
            </p>
            {user?.usn && (
              <p className="text-4xs font-mono font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Roll Number / USN: {user.usn}
              </p>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="sm:absolute sm:top-6 sm:right-6 flex items-center gap-1.5 border border-slate-300 dark:border-slate-650 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium px-3.5 py-2 rounded-lg transition-all shadow-2xs shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* SECTION 2: Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Score", value: (totalScore || 0).toLocaleString(), icon: Zap, color: "text-indigo-500" },
          { label: "Current Streak", value: `${streakData?.currentStreak || 0} Day${(streakData?.currentStreak || 0) !== 1 ? "s" : ""}`, icon: Flame, color: "text-amber-500" },
          { label: "Best Streak", value: `${streakData?.bestStreak || 0} Day${(streakData?.bestStreak || 0) !== 1 ? "s" : ""}`, icon: Flame, color: "text-red-500" },
          { label: "Today Solved", value: todaySolved || 0, icon: ShieldCheck, color: "text-emerald-500" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-2xs text-left">
              <div className="flex flex-col">
                <span className="text-5xs uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">{stat.value}</span>
              </div>
              <Icon className={`w-7 h-7 ${stat.color} shrink-0`} />
            </div>
          );
        })}
      </div>

      {/* SECTION 3: Platform Cards */}
      <div className="flex flex-col gap-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0">Connected Platforms</h2>
          <span className="text-5xs text-slate-500 font-mono font-medium">{formatLastSynced()}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformsList.map((platform) => {
            if (syncing) {
              return (
                <div
                  key={platform.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col justify-between gap-4 shadow-3xs animate-pulse text-left"
                >
                  <div className="flex flex-col gap-2">
                    <div className="h-4 bg-slate-250 dark:bg-slate-800 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-1/4 mt-1"></div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-3">
                    <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-4/6"></div>
                  </div>
                </div>
              );
            }

            // Custom CodeChef Card
            if (platform.id === "codechef") {
              const isConnected = platform.connected;
              const hasStats = codechefData && !codechefData.error;
              const statsObj = codechefData?.stats || {};
              const ratingVal = statsObj.rating ?? codechefData?.rating ?? 0;
              const maxRatingVal = statsObj.maxRating ?? codechefData?.maxRating ?? 0;
              const divisionVal = statsObj.division ?? (ratingVal < 1400 ? "Div 4" : ratingVal < 1600 ? "Div 3" : ratingVal < 1800 ? "Div 2" : "Div 1");
              const starsVal = getCodeChefStarsString(ratingVal);
              const globalRankVal = statsObj.globalRank ?? statsObj.rank ?? codechefData?.rank ?? 0;
              const countryRankVal = statsObj.countryRank ?? 0;
              let badgesVal = statsObj.badges ?? codechefData?.badges ?? [];
              if (typeof badgesVal === "string") {
                badgesVal = badgesVal.split(",").map(b => b.trim()).filter(Boolean);
              }

              return (
                <div
                  key={platform.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${platform.color} p-6 rounded-xl flex flex-col gap-4 shadow-3xs relative text-left`}
                >
                  {isConnected && (
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title={`Open ${platform.name} profile`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">CodeChef Rating</span>
                    <span className="text-5xs text-slate-400 dark:text-slate-500 font-mono font-medium">DSA Rating</span>
                  </div>

                  {isConnected ? (
                    hasStats ? (
                      <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                            {ratingVal}
                          </span>
                          <span className="text-4xs font-bold text-slate-400 dark:text-slate-550 leading-none self-end pb-1">
                            ({divisionVal})
                          </span>
                          <span className="text-yellow-500 text-sm leading-none self-end pb-1 font-bold">
                            {starsVal}
                          </span>
                        </div>

                        <div className="flex flex-col text-5xs text-slate-450 dark:text-slate-500 leading-normal">
                          <span className="font-semibold text-slate-500 dark:text-slate-450">CodeChef Rating</span>
                          <span className="font-medium text-slate-400 dark:text-slate-550">
                            (Highest Rating {maxRatingVal})
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {globalRankVal ? globalRankVal.toLocaleString() : "Data unavailable"}
                            </span>
                            <span className="text-5xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                              Global Rank
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {countryRankVal ? countryRankVal.toLocaleString() : "Data unavailable"}
                            </span>
                            <span className="text-5xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                              Country Rank
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex flex-col gap-1.5">
                          <span className="text-5xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Badges
                          </span>
                          <div className="flex flex-col gap-1 text-2xs text-slate-600 dark:text-slate-350">
                            {badgesVal && badgesVal.length > 0 ? (
                              badgesVal.map((badge, bIdx) => (
                                <span key={bIdx} className="font-medium">
                                  {badge}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic">No badges yet</span>
                            )}
                          </div>
                        </div>

                        <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-1 border-t border-slate-100 dark:border-slate-850 pt-3">
                          {formatCardLastSynced(codechefData?.fetchedAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-1.5">
                        <span className="text-2xs text-slate-400 italic">Data unavailable</span>
                        <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-2">
                          Temporarily unable to fetch platform data
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-3">
                      <p className="text-4xs text-slate-400 dark:text-slate-500 leading-normal my-0">
                        Connect your CodeChef handle to start syncing submission metrics and analyzing weak areas.
                      </p>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="self-start text-5xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus:outline-none"
                      >
                        Connect Platform
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Custom GeeksforGeeks Card
            if (platform.id === "geeksforgeeks") {
              const isConnected = platform.connected;
              const hasStats = gfgData && !gfgData.error;
              const statsObj = gfgData?.stats || {};
              const scoreVal = statsObj.score ?? statsObj.codingScore ?? gfgData?.rating ?? "Data unavailable";
              const solvedVal = statsObj.solved ?? gfgData?.totalSolved ?? "Data unavailable";
              const rankVal = statsObj.instituteRank ?? statsObj.rank ?? gfgData?.rank ?? "Data unavailable";
              const monthlyVal = statsObj.monthlyScore ?? statsObj.maxRating ?? gfgData?.maxRating ?? "Data unavailable";

              return (
                <div
                  key={platform.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${platform.color} p-6 rounded-xl flex flex-col justify-between gap-4 shadow-3xs relative text-left`}
                >
                  {isConnected && (
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title={`Open ${platform.name} profile`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {platform.name}
                      {isConnected && (
                        <span className="text-4xs font-mono font-medium text-slate-400 truncate max-w-[150px]">
                          (@{platform.handle})
                        </span>
                      )}
                    </span>
                  </div>

                  {isConnected ? (
                    hasStats ? (
                      <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-2xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Coding Score</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{scoreVal}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Problems Solved</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{solvedVal}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Institute Rank</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {rankVal ? rankVal.toLocaleString() : "Data unavailable"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Monthly Score</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{monthlyVal}</span>
                          </div>
                        </div>
                        <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-1 border-t border-slate-105 dark:border-slate-850 pt-3">
                          {formatCardLastSynced(gfgData?.fetchedAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-1.5">
                        <span className="text-2xs text-slate-400 italic">Data unavailable</span>
                        <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-2">
                          Temporarily unable to fetch platform data
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-3">
                      <p className="text-4xs text-slate-400 dark:text-slate-500 leading-normal my-0">
                        Connect your GeeksforGeeks handle to start syncing submission metrics and analyzing weak areas.
                      </p>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="self-start text-5xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus:outline-none"
                      >
                        Connect Platform
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Custom HackerRank Card
            if (platform.id === "hackerrank") {
              const isConnected = platform.connected;
              const hasStats = hackerRankData && !hackerRankData.error;
              const statsObj = hackerRankData?.stats || {};
              const scoreVal = statsObj.score ?? hackerRankData?.rating ?? "Data unavailable";
              const levelVal = statsObj.level ?? statsObj.rank ?? hackerRankData?.rank ?? "Data unavailable";
              const badgesVal = statsObj.badges ?? hackerRankData?.badges ?? "Data unavailable";
              const certsVal = statsObj.certs ?? hackerRankData?.certs ?? "Data unavailable";
              const solvedVal = statsObj.solved ?? hackerRankData?.totalSolved ?? "Data unavailable";

              return (
                <div
                  key={platform.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${platform.color} p-6 rounded-xl flex flex-col justify-between gap-4 shadow-3xs relative text-left`}
                >
                  {isConnected && (
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title={`Open ${platform.name} profile`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {platform.name}
                      {isConnected && (
                        <span className="text-4xs font-mono font-medium text-slate-400 truncate max-w-[150px]">
                          (@{platform.handle})
                        </span>
                      )}
                    </span>
                  </div>

                  {isConnected ? (
                    hasStats ? (
                      <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-2xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Score</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{scoreVal}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Level</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{levelVal}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Badges</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{badgesVal}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Certifications</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{certsVal}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 col-span-2">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">Problems Solved</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{solvedVal}</span>
                          </div>
                        </div>
                        <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-1 border-t border-slate-105 dark:border-slate-850 pt-3">
                          {formatCardLastSynced(hackerRankData?.fetchedAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-1.5">
                        <span className="text-2xs text-slate-400 italic">Unable to fetch HackerRank stats</span>
                        <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-2">
                          Temporarily unable to fetch platform data
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-3">
                      <p className="text-4xs text-slate-400 dark:text-slate-500 leading-normal my-0">
                        Connect your HackerRank handle to start syncing submission metrics and analyzing weak areas.
                      </p>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="self-start text-5xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus:outline-none"
                      >
                        Connect Platform
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // General platforms layout
            const pStats = getPlatformStats(platform.id);
            const isConnected = platform.connected;
            const hasStats = pStats && !pStats.error;

            return (
              <div
                key={platform.id}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${platform.color} p-6 rounded-xl flex flex-col justify-between gap-4 shadow-3xs relative text-left`}
              >
                {isConnected && (
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={`Open ${platform.name} profile`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {platform.name}
                    {isConnected && (
                      <span className="text-4xs font-mono font-medium text-slate-400 truncate max-w-[150px]">
                        (@{platform.handle})
                      </span>
                    )}
                  </span>
                </div>

                {isConnected ? (
                  hasStats ? (
                    <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-2xs">
                        {platform.getStats().map((stat, sIdx) => (
                          <div key={sIdx} className="flex flex-col gap-0.5 text-left">
                            <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">{stat.label}</span>
                            <span className={`font-semibold text-slate-900 dark:text-slate-200 truncate ${stat.value === "Data unavailable" ? "text-slate-400 dark:text-slate-500 italic font-normal" : ""}`}>
                              {stat.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-1 border-t border-slate-105 dark:border-slate-850 pt-3">
                        {formatCardLastSynced(pStats?.fetchedAt)}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-1.5">
                      <span className="text-2xs text-slate-400 italic">Data unavailable</span>
                      <div className="text-5xs text-slate-555 dark:text-slate-500 font-mono mt-2">
                        Unable to sync platform data
                      </div>
                    </div>
                  )
                ) : (
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-3">
                    <p className="text-4xs text-slate-400 dark:text-slate-500 leading-normal my-0">
                      Connect your {platform.name} handle to start syncing submission metrics and analyzing weak areas.
                    </p>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="self-start text-5xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus:outline-none"
                    >
                      Connect Platform
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: Contribution Heatmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">Submission Activity</h3>
            <p className="text-5xs text-slate-400 dark:text-slate-500 mt-1 my-0">
              Chronological log of solved problems and test runs over the past year.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-5xs text-slate-400 font-mono">
            <span>Total Submissions: <strong className="text-indigo-650 dark:text-indigo-400">{totalSubmissionsPastYear}</strong></span>
            <span>Active Days: <strong className="text-indigo-650 dark:text-indigo-400">{activeDaysCount} active days</strong></span>
          </div>
        </div>

        {/* Empty States / Heatmap Grid */}
        {!isLcConnected && !isCfConnected && !isCcConnected && !isGfgConnected && !isHrConnected && !isCnConnected && !isHeConnected ? (
          <div className="flex flex-col items-center justify-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-650 mb-2" />
            <span className="text-2xs font-semibold text-slate-650 dark:text-slate-400">Connect your platform to view analytics</span>
          </div>
        ) : progress?.submissions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <Flame className="w-8 h-8 text-slate-400 dark:text-slate-650 mb-2" />
            <span className="text-2xs font-semibold text-slate-600 dark:text-slate-350">No submission activity yet</span>
            <span className="text-4xs text-slate-400 dark:text-slate-500 mt-1">Start solving problems to build your streak</span>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-850 scrollbar-track-transparent">
            <div className="flex flex-col gap-1 min-w-[760px] select-none relative pb-1">
              {/* Month Labels Row */}
              <div className="flex pl-8 h-4 relative mb-1">
                {weeks.map((week, wIdx) => {
                  const firstDay = week.find(day => day !== null);
                  if (firstDay && firstDay.timestamp.getDate() <= 7) {
                    return (
                      <span
                        key={wIdx}
                        className="absolute text-5xs text-slate-400 font-mono font-semibold"
                        style={{ left: `${32 + wIdx * 14}px` }} // 32px label pad + 14px per column
                      >
                        {firstDay.timestamp.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="flex gap-1.5">
                <div className="flex flex-col justify-between text-5xs text-slate-400 font-mono pr-2 py-0.5 leading-none h-[78px]">
                  <span className="h-2 flex items-center"></span>
                  <span className="h-2 flex items-center font-medium">Mon</span>
                  <span className="h-2 flex items-center"></span>
                  <span className="h-2 flex items-center font-medium">Wed</span>
                  <span className="h-2 flex items-center"></span>
                  <span className="h-2 flex items-center font-medium">Fri</span>
                  <span className="h-2 flex items-center"></span>
                </div>

                <div className="flex-1 flex gap-1 h-[78px]">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day, dIdx) => {
                        if (!day) return <div key={dIdx} className="w-2.5 h-2.5 bg-transparent" />;
                        return (
                          <div
                            key={dIdx}
                            className={`w-2.5 h-2.5 rounded-sm transition-all duration-150 cursor-pointer ${getHeatmapColor(day.count)} hover:scale-110 hover:shadow-xs`}
                            onMouseEnter={(e) => {
                              setHoveredDay(day);
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPos({
                                x: rect.left + window.scrollX + rect.width / 2,
                                y: rect.top + window.scrollY - 8
                              });
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {progress?.submissions?.length > 0 && (
          <div className="flex items-center gap-2 justify-end text-5xs text-slate-400 font-mono mt-2">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#2A2A2A] border border-slate-800/10" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#0E4429]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#26A641]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#39D353]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#4FFF6D]" />
            <span>More</span>
          </div>
        )}
      </div>

      {/* Floating custom dark tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full bg-slate-900 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-slate-200 text-5xs font-mono shadow-xl pointer-events-none"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`
          }}
        >
          <div className="font-semibold text-slate-400">
            {new Date(hoveredDay.dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="mt-0.5 text-indigo-400 font-bold">
            {hoveredDay.count} accepted submission{hoveredDay.count !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {modalOpen && (
        <EditProfileModal
          onClose={() => setModalOpen(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            refetchUser();
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
          onError={(msg) => {
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(""), 4000);
          }}
          majorTopics={majorTopics}
        />
      )}
    </div>
  );
};

// Modal Drawer Component
const EditProfileModal = ({ onClose, onSuccess, onError, majorTopics }) => {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    batch: "",
    college: "",
    usn: "",
    codeforcesHandle: "",
    leetcodeHandle: "",
    codechefHandle: "",
    gfgHandle: "",
    hackerrankHandle: "",
    codingNinjasHandle: "",
    hackerEarthHandle: "",
    level: "beginner"
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        branch: user.branch || "",
        batch: user.batch || "",
        college: user.college || "",
        usn: user.usn || "",
        codeforcesHandle: user.codeforcesHandle || "",
        leetcodeHandle: user.leetcodeHandle || "",
        codechefHandle: user.codechefHandle || "",
        gfgHandle: user.gfgHandle || "",
        hackerrankHandle: user.hackerrankHandle || "",
        codingNinjasHandle: user.codingNinjasHandle || "",
        hackerEarthHandle: user.hackerEarthHandle || "",
        level: user.currentLevel || "beginner"
      });

      // Let's check which major topics are fully selected
      const initialChecked = [];
      majorTopics.forEach((t) => {
        const hasSome = t.subtopics.some(sub => user.studiedTopics?.includes(sub));
        if (hasSome) {
          initialChecked.push(t.name);
        }
      });
      setSelectedTopics(initialChecked);
    }
  }, [user, majorTopics]);

  const handleToggleTopic = (topicName) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Map topics to subtopics list to persist
    let subtopicsToSend = [];
    selectedTopics.forEach((topicName) => {
      const topicObj = majorTopics.find((t) => t.name === topicName);
      if (topicObj) {
        subtopicsToSend = subtopicsToSend.concat(topicObj.subtopics);
      }
    });

    try {
      await updateProfile({
        name: formData.name.trim(),
        branch: formData.branch.trim(),
        batch: formData.batch.trim(),
        college: formData.college.trim(),
        usn: formData.usn.trim(),
        currentLevel: formData.level,
        studiedTopics: subtopicsToSend,
        codeforcesHandle: formData.codeforcesHandle.trim(),
        leetcodeHandle: formData.leetcodeHandle.trim(),
        codechefHandle: formData.codechefHandle.trim(),
        gfgHandle: formData.gfgHandle.trim(),
        hackerrankHandle: formData.hackerrankHandle.trim(),
        codingNinjasHandle: formData.codingNinjasHandle.trim(),
        hackerEarthHandle: formData.hackerEarthHandle.trim()
      });

      onSuccess("Profile details updated successfully.");
      onClose();
    } catch (err) {
      console.error(err);
      onError(err || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Edit Profile Milestones
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs">
          {/* Group 1: Academics / Basic info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Academics & General Info
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dhruv"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">College / Institution</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="e.g. RV College of Engineering"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Academic Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Graduation Batch / Year</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  placeholder="e.g. 2026"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">USN / University Roll Number</label>
                <input
                  type="text"
                  name="usn"
                  value={formData.usn}
                  onChange={handleInputChange}
                  placeholder="e.g. 1RV22CS050"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Platform Handles */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Competitive Programming Platforms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">LeetCode Username</label>
                <input
                  type="text"
                  name="leetcodeHandle"
                  value={formData.leetcodeHandle}
                  onChange={handleInputChange}
                  placeholder="LeetCode username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Codeforces Handle</label>
                <input
                  type="text"
                  name="codeforcesHandle"
                  value={formData.codeforcesHandle}
                  onChange={handleInputChange}
                  placeholder="Codeforces handle"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">CodeChef Handle</label>
                <input
                  type="text"
                  name="codechefHandle"
                  value={formData.codechefHandle}
                  onChange={handleInputChange}
                  placeholder="CodeChef handle"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">GeeksforGeeks Handle</label>
                <input
                  type="text"
                  name="gfgHandle"
                  value={formData.gfgHandle}
                  onChange={handleInputChange}
                  placeholder="GFG username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">HackerRank Username</label>
                <input
                  type="text"
                  name="hackerrankHandle"
                  value={formData.hackerrankHandle}
                  onChange={handleInputChange}
                  placeholder="HackerRank username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Coding Ninjas Username</label>
                <input
                  type="text"
                  name="codingNinjasHandle"
                  value={formData.codingNinjasHandle}
                  onChange={handleInputChange}
                  placeholder="Coding Ninjas username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">HackerEarth Username</label>
                <input
                  type="text"
                  name="hackerEarthHandle"
                  value={formData.hackerEarthHandle}
                  onChange={handleInputChange}
                  placeholder="HackerEarth username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Recommendation Tier */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Proficiency Level
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Target Level Tier</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="beginner">Beginner (Easy recommendations)</option>
                <option value="intermediate">Intermediate (Medium recommendations)</option>
                <option value="advanced">Advanced (Hard recommendations)</option>
              </select>
            </div>
          </div>

          {/* Group 4: Topic Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Studied DSA Core Areas
            </h3>

            <div className="grid grid-cols-2 gap-3.5 max-h-[160px] overflow-y-auto pr-1">
              {majorTopics.map((topic) => {
                const isChecked = selectedTopics.includes(topic.name);
                return (
                  <button
                    type="button"
                    key={topic.name}
                    onClick={() => handleToggleTopic(topic.name)}
                    className={`p-3 border text-left flex items-center gap-2.5 rounded-lg transition-all ${
                      isChecked
                        ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 animate-pulse-once"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-250 dark:border-slate-700 text-slate-550 dark:text-slate-400"
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded border border-slate-350 dark:border-slate-650 flex items-center justify-center shrink-0">
                      {isChecked && <div className="w-2 h-2 rounded bg-indigo-500" />}
                    </div>
                    <span className="font-medium truncate">{topic.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls inside Modal */}
          <div className="flex items-center justify-end gap-3.5 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-350 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
