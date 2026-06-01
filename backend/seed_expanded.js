const mongoose = require("mongoose");
require("dotenv").config();

const Topic = require("./models/Topic");
const ProblemMapping = require("./models/ProblemMapping");

const sectionDefinitions = [
  {
    name: "Arrays",
    order: 1,
    stages: [
      { name: "Stage 1 — Array Basics & Traversal", count: 5, difficulty: "easy", prereqs: [] },
      { name: "Stage 2 — Prefix Sum", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 3 — Difference Array", count: 4, difficulty: "medium", prereqs: ["Stage 2 — Prefix Sum"] },
      { name: "Stage 4 — Kadane's Algorithm", count: 5, difficulty: "medium", prereqs: ["Stage 2 — Prefix Sum"] },
      { name: "Stage 5 — Sliding Window Fixed Size", count: 5, difficulty: "medium", prereqs: ["Stage 4 — Kadane's Algorithm"] },
      { name: "Stage 6 — Sliding Window Variable Size", count: 5, difficulty: "medium", prereqs: ["Stage 4 — Kadane's Algorithm"] },
      { name: "Stage 7 — Two Pointers", count: 5, difficulty: "medium", prereqs: ["Stage 6 — Sliding Window Variable Size"] },
      { name: "Stage 8 — Fast & Slow Pointers", count: 4, difficulty: "medium", prereqs: ["Stage 7 — Two Pointers"] },
      { name: "Stage 9 — Three Pointers & K-Sum", count: 4, difficulty: "medium", prereqs: ["Stage 7 — Two Pointers"] },
      { name: "Stage 10 — Frequency Count & Hashing", count: 5, difficulty: "easy", prereqs: [] },
      { name: "Stage 11 — Sorting Techniques", count: 5, difficulty: "easy", prereqs: [] },
      { name: "Stage 12 — Binary Search on Arrays", count: 5, difficulty: "easy", prereqs: [] }
    ]
  },
  {
    name: "Strings",
    order: 2,
    stages: [
      { name: "Stage 1 — String Basics", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 2 — String Manipulation", count: 5, difficulty: "easy", prereqs: ["Stage 1 — String Basics"] },
      { name: "Stage 3 — Pattern Matching (KMP/Z)", count: 4, difficulty: "hard", prereqs: ["Stage 2 — String Manipulation"] },
      { name: "Stage 4 — Anagrams & Frequency Maps", count: 5, difficulty: "easy", prereqs: ["Stage 2 — String Manipulation"] },
      { name: "Stage 5 — Palindrome Problems", count: 5, difficulty: "easy", prereqs: ["Stage 2 — String Manipulation"] },
      { name: "Stage 6 — Sliding Window on Strings", count: 5, difficulty: "medium", prereqs: ["Stage 2 — String Manipulation"] }
    ]
  },
  {
    name: "Hashing",
    order: 3,
    stages: [
      { name: "Stage 1 — HashMap Basics", count: 5, difficulty: "easy", prereqs: ["Stage 10 — Frequency Count & Hashing"] },
      { name: "Stage 2 — Frequency & Count Problems", count: 5, difficulty: "easy", prereqs: ["Stage 1 — HashMap Basics"] },
      { name: "Stage 3 — Two Sum Variants", count: 5, difficulty: "easy", prereqs: ["Stage 1 — HashMap Basics"] },
      { name: "Stage 4 — Subarray with Given Sum", count: 4, difficulty: "medium", prereqs: ["Stage 2 — Frequency & Count Problems"] },
      { name: "Stage 5 — Longest Subarray Problems", count: 4, difficulty: "medium", prereqs: ["Stage 2 — Frequency & Count Problems"] }
    ]
  },
  {
    name: "Binary Search",
    order: 4,
    stages: [
      { name: "Stage 1 — Classic Binary Search", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 2 — Binary Search on Answer", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Classic Binary Search"] },
      { name: "Stage 3 — Search in Rotated Array", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Classic Binary Search"] },
      { name: "Stage 4 — BS on 2D Matrix", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Classic Binary Search"] },
      { name: "Stage 5 — Aggressive Problems (Minimize Max)", count: 5, difficulty: "medium", prereqs: ["Stage 2 — Binary Search on Answer"] }
    ]
  },
  {
    name: "Recursion & Backtracking",
    order: 5,
    stages: [
      { name: "Stage 1 — Recursion Basics", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 2 — Subset & Subsequence Generation", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Recursion Basics"] },
      { name: "Stage 3 — Permutations", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Recursion Basics"] },
      { name: "Stage 4 — Backtracking Basics", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Recursion Basics"] },
      { name: "Stage 5 — N-Queens & Sudoku Solver", count: 3, difficulty: "hard", prereqs: ["Stage 4 — Backtracking Basics"] },
      { name: "Stage 6 — Word Search & Maze Problems", count: 4, difficulty: "medium", prereqs: ["Stage 4 — Backtracking Basics"] }
    ]
  },
  {
    name: "Linked List",
    order: 6,
    stages: [
      { name: "Stage 1 — LL Basics & Traversal", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Recursion Basics"] },
      { name: "Stage 2 — Reversal Problems", count: 5, difficulty: "easy", prereqs: ["Stage 1 — LL Basics & Traversal"] },
      { name: "Stage 3 — Fast & Slow Pointer on LL", count: 5, difficulty: "medium", prereqs: ["Stage 1 — LL Basics & Traversal"] },
      { name: "Stage 4 — Merge & Sort LL", count: 4, difficulty: "medium", prereqs: ["Stage 2 — Reversal Problems"] },
      { name: "Stage 5 — Cycle Detection", count: 4, difficulty: "medium", prereqs: ["Stage 3 — Fast & Slow Pointer on LL"] }
    ]
  },
  {
    name: "Stacks & Queues",
    order: 7,
    stages: [
      { name: "Stage 1 — Stack Basics", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal", "Stage 1 — LL Basics & Traversal"] },
      { name: "Stage 2 — Monotonic Stack", count: 5, difficulty: "hard", prereqs: ["Stage 1 — Stack Basics"] },
      { name: "Stage 3 — Queue & Deque Basics", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Stack Basics"] },
      { name: "Stage 4 — Sliding Window Maximum", count: 4, difficulty: "hard", prereqs: ["Stage 3 — Queue & Deque Basics"] },
      { name: "Stage 5 — Stack on Strings", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Stack Basics"] }
    ]
  },
  {
    name: "Trees",
    order: 8,
    stages: [
      { name: "Stage 1 — Tree Traversals (BFS/DFS)", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Recursion Basics"] },
      { name: "Stage 2 — Tree Height & Diameter", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Tree Traversals (BFS/DFS)"] },
      { name: "Stage 3 — Binary Search Tree", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Tree Traversals (BFS/DFS)"] },
      { name: "Stage 4 — Lowest Common Ancestor", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Tree Traversals (BFS/DFS)"] },
      { name: "Stage 5 — Tree DP Problems", count: 4, difficulty: "hard", prereqs: ["Stage 2 — Tree Height & Diameter"] },
      { name: "Stage 6 — Views & Boundary Traversal", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Tree Traversals (BFS/DFS)"] }
    ]
  },
  {
    name: "Graphs",
    order: 9,
    stages: [
      { name: "Stage 1 — Graph Representation", count: 4, difficulty: "easy", prereqs: ["Stage 1 — Tree Traversals (BFS/DFS)", "Stage 2 — Subset & Subsequence Generation"] },
      { name: "Stage 2 — BFS & DFS", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Graph Representation"] },
      { name: "Stage 3 — Cycle Detection", count: 5, difficulty: "medium", prereqs: ["Stage 2 — BFS & DFS"] },
      { name: "Stage 4 — Topological Sort", count: 4, difficulty: "medium", prereqs: ["Stage 2 — BFS & DFS"] },
      { name: "Stage 5 — Shortest Path (Dijkstra/BFS)", count: 5, difficulty: "medium", prereqs: ["Stage 2 — BFS & DFS"] },
      { name: "Stage 6 — Minimum Spanning Tree", count: 4, difficulty: "medium", prereqs: ["Stage 2 — BFS & DFS"] },
      { name: "Stage 7 — Disjoint Set Union (DSU)", count: 4, difficulty: "medium", prereqs: ["Stage 2 — BFS & DFS"] },
      { name: "Stage 8 — Strongly Connected Components", count: 3, difficulty: "hard", prereqs: ["Stage 4 — Topological Sort"] }
    ]
  },
  {
    name: "Dynamic Programming",
    order: 10,
    stages: [
      { name: "Stage 1 — DP Basics & Memoization", count: 5, difficulty: "medium", prereqs: ["Stage 2 — Subset & Subsequence Generation", "Stage 2 — Prefix Sum"] },
      { name: "Stage 2 — 1D DP (Fibonacci, Climbing)", count: 5, difficulty: "easy", prereqs: ["Stage 1 — DP Basics & Memoization"] },
      { name: "Stage 3 — 0/1 Knapsack", count: 5, difficulty: "medium", prereqs: ["Stage 1 — DP Basics & Memoization"] },
      { name: "Stage 4 — Unbounded Knapsack", count: 4, difficulty: "medium", prereqs: ["Stage 3 — 0/1 Knapsack"] },
      { name: "Stage 5 — Longest Common Subsequence", count: 5, difficulty: "medium", prereqs: ["Stage 1 — DP Basics & Memoization"] },
      { name: "Stage 6 — Longest Increasing Subsequence", count: 4, difficulty: "medium", prereqs: ["Stage 1 — DP Basics & Memoization"] },
      { name: "Stage 7 — Matrix Chain / Interval DP", count: 4, difficulty: "hard", prereqs: ["Stage 3 — 0/1 Knapsack"] },
      { name: "Stage 8 — DP on Grids", count: 5, difficulty: "medium", prereqs: ["Stage 1 — DP Basics & Memoization"] },
      { name: "Stage 9 — DP on Trees", count: 4, difficulty: "hard", prereqs: ["Stage 1 — DP Basics & Memoization"] },
      { name: "Stage 10 — Bitmask DP", count: 3, difficulty: "hard", prereqs: ["Stage 3 — 0/1 Knapsack"] }
    ]
  },
  {
    name: "Greedy",
    order: 11,
    stages: [
      { name: "Stage 1 — Greedy Basics", count: 5, difficulty: "easy", prereqs: ["Stage 11 — Sorting Techniques"] },
      { name: "Stage 2 — Interval Scheduling", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Greedy Basics"] },
      { name: "Stage 3 — Activity Selection", count: 4, difficulty: "easy", prereqs: ["Stage 1 — Greedy Basics"] },
      { name: "Stage 4 — Huffman & Fractional Knapsack", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Greedy Basics"] }
    ]
  },
  {
    name: "Bit Manipulation",
    order: 12,
    stages: [
      { name: "Stage 1 — Bit Basics", count: 5, difficulty: "easy", prereqs: [] },
      { name: "Stage 2 — XOR Tricks", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Bit Basics"] },
      { name: "Stage 3 — Bit Masking", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Bit Basics"] },
      { name: "Stage 4 — Power of 2 Problems", count: 4, difficulty: "easy", prereqs: ["Stage 1 — Bit Basics"] }
    ]
  },
  {
    name: "Math & Number Theory",
    order: 13,
    stages: [
      { name: "Stage 1 — Number Logic", count: 5, difficulty: "easy", prereqs: [] },
      { name: "Stage 2 — Prime & Sieve", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Number Logic"] },
      { name: "Stage 3 — GCD, LCM, Modular Arithmetic", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Number Logic"] },
      { name: "Stage 4 — Combinatorics Basics", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Number Logic"] }
    ]
  },
  {
    name: "Tries",
    order: 14,
    stages: [
      { name: "Stage 1 — Trie Basics", count: 4, difficulty: "medium", prereqs: ["Stage 1 — HashMap Basics", "Stage 1 — Tree Traversals (BFS/DFS)"] },
      { name: "Stage 2 — Word Search & Prefix Problems", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Trie Basics"] },
      { name: "Stage 3 — XOR Trie", count: 3, difficulty: "hard", prereqs: ["Stage 1 — Trie Basics"] }
    ]
  },
  {
    name: "Heaps & Priority Queue",
    order: 15,
    stages: [
      { name: "Stage 1 — Heap Basics", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Tree Traversals (BFS/DFS)"] },
      { name: "Stage 2 — Kth Largest/Smallest", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Heap Basics"] },
      { name: "Stage 3 — Merge K Sorted Lists", count: 4, difficulty: "hard", prereqs: ["Stage 1 — Heap Basics"] },
      { name: "Stage 4 — Sliding Window with Heap", count: 4, difficulty: "medium", prereqs: ["Stage 1 — Heap Basics"] }
    ]
  }
];

const seedExpandedDB = async () => {
  try {
    console.log("Connecting to MongoDB for expanded seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    // Clear existing collections
    console.log("Clearing existing Topics and ProblemMappings...");
    await Topic.deleteMany({});
    await ProblemMapping.deleteMany({});

    const allProblemsToInsert = [];
    const topicDocuments = [];

    // Loop through sections and stages to construct problem mappings first
    for (const section of sectionDefinitions) {
      const subtopicsArray = [];

      for (const stage of section.stages) {
        const stageProblems = [];

        // Generate problem mapping elements programmatically
        for (let i = 1; i <= stage.count; i++) {
          const platformsList = ["leetcode", "codeforces", "codechef", "geeksforgeeks", "hackerrank", "codingninjas", "hackerearth"];
          // Use section order, stage index and problem index to distribute evenly
          const platform = platformsList[(section.order * 11 + section.stages.indexOf(stage) * 7 + i) % platformsList.length];
          
          let platformPrefix = "";
          if (platform === "leetcode") platformPrefix = "lc";
          else if (platform === "codeforces") platformPrefix = "cf";
          else if (platform === "codechef") platformPrefix = "cc";
          else if (platform === "geeksforgeeks") platformPrefix = "gfg";
          else if (platform === "hackerrank") platformPrefix = "hr";
          else if (platform === "codingninjas") platformPrefix = "cn";
          else if (platform === "hackerearth") platformPrefix = "he";

          const platformProblemId = `${platformPrefix}_${section.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}_s${section.stages.indexOf(stage) + 1}_p${i}`;
          
          let title = "";
          let url = "";
          
          if (platform === "leetcode") {
            title = `${stage.name.replace("Stage ", "L")} - Challenge ${i}`;
            url = `https://leetcode.com/problems/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}/`;
          } else if (platform === "codeforces") {
            title = `${stage.name.replace("Stage ", "CF")} - Contest Prob ${i}`;
            url = `https://codeforces.com/problemset/problem/1000/${i}`;
          } else if (platform === "codechef") {
            title = `${stage.name.replace("Stage ", "CC")} - Challenge ${i}`;
            url = `https://www.codechef.com/problems/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}`;
          } else if (platform === "geeksforgeeks") {
            title = `${stage.name.replace("Stage ", "GFG")} - Practice ${i}`;
            url = `https://practice.geeksforgeeks.org/problems/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}/1`;
          } else if (platform === "hackerrank") {
            title = `${stage.name.replace("Stage ", "HR")} - Problem ${i}`;
            url = `https://www.hackerrank.com/challenges/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}`;
          } else if (platform === "codingninjas") {
            title = `${stage.name.replace("Stage ", "CN")} - Challenge ${i}`;
            url = `https://www.naukri.com/code360/problems/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}`;
          } else if (platform === "hackerearth") {
            title = `${stage.name.replace("Stage ", "HE")} - Challenge ${i}`;
            url = `https://www.hackerearth.com/practice/algorithms/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}`;
          }

          const probDoc = {
            platformProblemId,
            platform,
            title,
            url,
            topic: section.name,
            subtopic: stage.name,
            difficulty: stage.difficulty,
            tags: [section.name.toLowerCase(), "adaptive-curriculum"]
          };
          
          allProblemsToInsert.push(probDoc);
          stageProblems.push(probDoc);
        }
      }
    }

    // Insert all generated problem mappings at once
    console.log(`Inserting ${allProblemsToInsert.length} generated Problem Mappings...`);
    const insertedProblems = await ProblemMapping.insertMany(allProblemsToInsert);
    console.log("Problem mappings inserted successfully.");

    // Map the inserted database IDs back into our topic structures
    for (const section of sectionDefinitions) {
      const subtopicsList = [];
      let subOrder = 1;

      for (const stage of section.stages) {
        // Filter out problem IDs matching this exact section and stage
        const matchingIds = insertedProblems
          .filter((p) => p.topic === section.name && p.subtopic === stage.name)
          .map((p) => p._id);

        subtopicsList.push({
          name: stage.name,
          order: subOrder++,
          difficulty: stage.difficulty,
          prerequisites: stage.prereqs,
          unlockThreshold: 35,
          problemCount: stage.count,
          problems: matchingIds
        });
      }

      topicDocuments.push({
        name: section.name,
        order: section.order,
        subtopics: subtopicsList
      });
    }

    // Seed Topics collection
    console.log(`Inserting ${topicDocuments.length} Topics into database...`);
    await Topic.insertMany(topicDocuments);
    console.log("Topics seeded successfully!");

    mongoose.disconnect();
    console.log("MongoDB connection closed safely.");
    process.exit(0);
  } catch (error) {
    console.error("Expanded seeding failure:", error);
    process.exit(1);
  }
};

seedExpandedDB();
