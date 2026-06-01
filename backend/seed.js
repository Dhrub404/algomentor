const mongoose = require("mongoose");
require("dotenv").config();

const Topic = require("./models/Topic");
const ProblemMapping = require("./models/ProblemMapping");

const defaultProblems = [
  // ARRAYS - Basics
  {
    platformProblemId: "1",
    platform: "leetcode",
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    topic: "Arrays",
    subtopic: "Basics",
    difficulty: "easy",
    tags: ["arrays", "hash-table"]
  },
  {
    platformProblemId: "4A",
    platform: "codeforces",
    title: "Watermelon",
    url: "https://codeforces.com/problemset/problem/4/A",
    topic: "Arrays",
    subtopic: "Basics",
    difficulty: "easy",
    tags: ["brute force", "math"]
  },
  {
    platformProblemId: "158A",
    platform: "codeforces",
    title: "Next Round",
    url: "https://codeforces.com/problemset/problem/158/A",
    topic: "Arrays",
    subtopic: "Basics",
    difficulty: "easy",
    tags: ["implementation"]
  },
  {
    platformProblemId: "231A",
    platform: "codeforces",
    title: "Team",
    url: "https://codeforces.com/problemset/problem/231/A",
    topic: "Arrays",
    subtopic: "Basics",
    difficulty: "easy",
    tags: ["greedy"]
  },
  {
    platformProblemId: "263A",
    platform: "codeforces",
    title: "Beautiful Matrix",
    url: "https://codeforces.com/problemset/problem/263/A",
    topic: "Arrays",
    subtopic: "Basics",
    difficulty: "easy",
    tags: ["implementation"]
  },

  // ARRAYS - Two Pointers
  {
    platformProblemId: "125",
    platform: "leetcode",
    title: "Valid Palindrome",
    url: "https://leetcode.com/problems/valid-palindrome/",
    topic: "Arrays",
    subtopic: "Two Pointers",
    difficulty: "easy",
    tags: ["two-pointers", "string"]
  },
  {
    platformProblemId: "167",
    platform: "leetcode",
    title: "Two Sum II - Input Array Is Sorted",
    url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    topic: "Arrays",
    subtopic: "Two Pointers",
    difficulty: "medium",
    tags: ["two-pointers", "binary-search"]
  },
  {
    platformProblemId: "15",
    platform: "leetcode",
    title: "3Sum",
    url: "https://leetcode.com/problems/3sum/",
    topic: "Arrays",
    subtopic: "Two Pointers",
    difficulty: "medium",
    tags: ["two-pointers", "sorting"]
  },
  {
    platformProblemId: "11",
    platform: "leetcode",
    title: "Container With Most Water",
    url: "https://leetcode.com/problems/container-with-most-water/",
    topic: "Arrays",
    subtopic: "Two Pointers",
    difficulty: "medium",
    tags: ["two-pointers", "greedy"]
  },

  // ARRAYS - Sliding Window
  {
    platformProblemId: "3",
    platform: "leetcode",
    title: "Longest Substring Without Repeating Characters",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    topic: "Arrays",
    subtopic: "Sliding Window",
    difficulty: "medium",
    tags: ["sliding-window", "hash-table"]
  },
  {
    platformProblemId: "209",
    platform: "leetcode",
    title: "Minimum Size Subarray Sum",
    url: "https://leetcode.com/problems/minimum-size-subarray-sum/",
    topic: "Arrays",
    subtopic: "Sliding Window",
    difficulty: "medium",
    tags: ["sliding-window", "two-pointers"]
  },
  {
    platformProblemId: "438",
    platform: "leetcode",
    title: "Find All Anagrams in a String",
    url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
    topic: "Arrays",
    subtopic: "Sliding Window",
    difficulty: "medium",
    tags: ["sliding-window", "hash-table"]
  },

  // BINARY SEARCH - One-D Arrays
  {
    platformProblemId: "704",
    platform: "leetcode",
    title: "Binary Search",
    url: "https://leetcode.com/problems/binary-search/",
    topic: "Binary Search",
    subtopic: "One-D Arrays",
    difficulty: "easy",
    tags: ["binary-search"]
  },
  {
    platformProblemId: "35",
    platform: "leetcode",
    title: "Search Insert Position",
    url: "https://leetcode.com/problems/search-insert-position/",
    topic: "Binary Search",
    subtopic: "One-D Arrays",
    difficulty: "easy",
    tags: ["binary-search"]
  },
  {
    platformProblemId: "34",
    platform: "leetcode",
    title: "Find First and Last Position of Element in Sorted Array",
    url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    topic: "Binary Search",
    subtopic: "One-D Arrays",
    difficulty: "medium",
    tags: ["binary-search"]
  },

  // BINARY SEARCH - On Answer
  {
    platformProblemId: "875",
    platform: "leetcode",
    title: "Koko Eating Bananas",
    url: "https://leetcode.com/problems/koko-eating-bananas/",
    topic: "Binary Search",
    subtopic: "On Answer",
    difficulty: "medium",
    tags: ["binary-search"]
  },
  {
    platformProblemId: "1011",
    platform: "leetcode",
    title: "Capacity To Ship Packages Within D Days",
    url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    topic: "Binary Search",
    subtopic: "On Answer",
    difficulty: "medium",
    tags: ["binary-search"]
  },

  // STRINGS - Basic Operations
  {
    platformProblemId: "58",
    platform: "leetcode",
    title: "Length of Last Word",
    url: "https://leetcode.com/problems/length-of-last-word/",
    topic: "Strings",
    subtopic: "Basic Operations",
    difficulty: "easy",
    tags: ["string"]
  },
  {
    platformProblemId: "14",
    platform: "leetcode",
    title: "Longest Common Prefix",
    url: "https://leetcode.com/problems/longest-common-prefix/",
    topic: "Strings",
    subtopic: "Basic Operations",
    difficulty: "easy",
    tags: ["string"]
  },
  {
    platformProblemId: "71A",
    platform: "codeforces",
    title: "Way Too Long Words",
    url: "https://codeforces.com/problemset/problem/71/A",
    topic: "Strings",
    subtopic: "Basic Operations",
    difficulty: "easy",
    tags: ["strings"]
  },
  {
    platformProblemId: "282A",
    platform: "codeforces",
    title: "Bit++",
    url: "https://codeforces.com/problemset/problem/282/A",
    topic: "Strings",
    subtopic: "Basic Operations",
    difficulty: "easy",
    tags: ["implementation"]
  },
  {
    platformProblemId: "112A",
    platform: "codeforces",
    title: "Petya and Strings",
    url: "https://codeforces.com/problemset/problem/112/A",
    topic: "Strings",
    subtopic: "Basic Operations",
    difficulty: "easy",
    tags: ["strings"]
  },

  // STRINGS - Pattern Matching
  {
    platformProblemId: "28",
    platform: "leetcode",
    title: "Find the Index of the First Occurrence in a String",
    url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    topic: "Strings",
    subtopic: "Pattern Matching",
    difficulty: "easy",
    tags: ["string-matching", "two-pointers"]
  },
  {
    platformProblemId: "1392",
    platform: "leetcode",
    title: "Longest Happy Prefix",
    url: "https://leetcode.com/problems/longest-happy-prefix/",
    topic: "Strings",
    subtopic: "Pattern Matching",
    difficulty: "hard",
    tags: ["string-matching", "rolling-hash"]
  },
  {
    platformProblemId: "4C",
    platform: "codeforces",
    title: "Registration System",
    url: "https://codeforces.com/problemset/problem/4/C",
    topic: "Strings",
    subtopic: "Pattern Matching",
    difficulty: "medium",
    tags: ["data structures", "hashing"]
  },

  // LINKED LIST - Singly LinkedList
  {
    platformProblemId: "206",
    platform: "leetcode",
    title: "Reverse Linked List",
    url: "https://leetcode.com/problems/reverse-linked-list/",
    topic: "Linked List",
    subtopic: "Singly LinkedList",
    difficulty: "easy",
    tags: ["linked-list"]
  },
  {
    platformProblemId: "21",
    platform: "leetcode",
    title: "Merge Two Sorted Lists",
    url: "https://leetcode.com/problems/merge-two-sorted-lists/",
    topic: "Linked List",
    subtopic: "Singly LinkedList",
    difficulty: "easy",
    tags: ["linked-list", "recursion"]
  },
  {
    platformProblemId: "83",
    platform: "leetcode",
    title: "Remove Duplicates from Sorted List",
    url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
    topic: "Linked List",
    subtopic: "Singly LinkedList",
    difficulty: "easy",
    tags: ["linked-list"]
  },

  // LINKED LIST - Double LinkedList & Loops
  {
    platformProblemId: "141",
    platform: "leetcode",
    title: "Linked List Cycle",
    url: "https://leetcode.com/problems/linked-list-cycle/",
    topic: "Linked List",
    subtopic: "Double LinkedList & Loops",
    difficulty: "easy",
    tags: ["linked-list", "two-pointers"]
  },
  {
    platformProblemId: "142",
    platform: "leetcode",
    title: "Linked List Cycle II",
    url: "https://leetcode.com/problems/linked-list-cycle-ii/",
    topic: "Linked List",
    subtopic: "Double LinkedList & Loops",
    difficulty: "medium",
    tags: ["linked-list", "two-pointers"]
  },

  // STACKS/QUEUES - Linear Structures
  {
    platformProblemId: "20",
    platform: "leetcode",
    title: "Valid Parentheses",
    url: "https://leetcode.com/problems/valid-parentheses/",
    topic: "Stacks/Queues",
    subtopic: "Linear Structures",
    difficulty: "easy",
    tags: ["stack", "string"]
  },
  {
    platformProblemId: "155",
    platform: "leetcode",
    title: "Min Stack",
    url: "https://leetcode.com/problems/min-stack/",
    topic: "Stacks/Queues",
    subtopic: "Linear Structures",
    difficulty: "medium",
    tags: ["stack", "design"]
  },
  {
    platformProblemId: "225",
    platform: "leetcode",
    title: "Implement Stack using Queues",
    url: "https://leetcode.com/problems/implement-stack-using-queues/",
    topic: "Stacks/Queues",
    subtopic: "Linear Structures",
    difficulty: "easy",
    tags: ["stack", "design"]
  },

  // STACKS/QUEUES - Monotonic Stack
  {
    platformProblemId: "496",
    platform: "leetcode",
    title: "Next Greater Element I",
    url: "https://leetcode.com/problems/next-greater-element-i/",
    topic: "Stacks/Queues",
    subtopic: "Monotonic Stack",
    difficulty: "easy",
    tags: ["stack", "monotonic-stack"]
  },
  {
    platformProblemId: "739",
    platform: "leetcode",
    title: "Daily Temperatures",
    url: "https://leetcode.com/problems/daily-temperatures/",
    topic: "Stacks/Queues",
    subtopic: "Monotonic Stack",
    difficulty: "medium",
    tags: ["stack", "monotonic-stack"]
  },
  {
    platformProblemId: "84",
    platform: "leetcode",
    title: "Largest Rectangle in Histogram",
    url: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    topic: "Stacks/Queues",
    subtopic: "Monotonic Stack",
    difficulty: "hard",
    tags: ["stack", "monotonic-stack"]
  },

  // TREES - Binary Tree Traversals
  {
    platformProblemId: "94",
    platform: "leetcode",
    title: "Binary Tree Inorder Traversal",
    url: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    topic: "Trees",
    subtopic: "Binary Tree Traversals",
    difficulty: "easy",
    tags: ["tree", "depth-first-search"]
  },
  {
    platformProblemId: "102",
    platform: "leetcode",
    title: "Binary Tree Level Order Traversal",
    url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    topic: "Trees",
    subtopic: "Binary Tree Traversals",
    difficulty: "medium",
    tags: ["tree", "breadth-first-search"]
  },
  {
    platformProblemId: "104",
    platform: "leetcode",
    title: "Maximum Depth of Binary Tree",
    url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    topic: "Trees",
    subtopic: "Binary Tree Traversals",
    difficulty: "easy",
    tags: ["tree", "depth-first-search"]
  },

  // TREES - BST Operations
  {
    platformProblemId: "98",
    platform: "leetcode",
    title: "Validate Binary Search Tree",
    url: "https://leetcode.com/problems/validate-binary-search-tree/",
    topic: "Trees",
    subtopic: "BST Operations",
    difficulty: "medium",
    tags: ["tree", "binary-search-tree"]
  },
  {
    platformProblemId: "700",
    platform: "leetcode",
    title: "Search in a Binary Search Tree",
    url: "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    topic: "Trees",
    subtopic: "BST Operations",
    difficulty: "easy",
    tags: ["tree", "binary-search-tree"]
  },
  {
    platformProblemId: "701",
    platform: "leetcode",
    title: "Insert into a Binary Search Tree",
    url: "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    topic: "Trees",
    subtopic: "BST Operations",
    difficulty: "medium",
    tags: ["tree", "binary-search-tree"]
  },

  // GRAPHS - DFS/BFS Basics
  {
    platformProblemId: "200",
    platform: "leetcode",
    title: "Number of Islands",
    url: "https://leetcode.com/problems/number-of-islands/",
    topic: "Graphs",
    subtopic: "DFS/BFS Basics",
    difficulty: "medium",
    tags: ["graph", "depth-first-search", "breadth-first-search"]
  },
  {
    platformProblemId: "133",
    platform: "leetcode",
    title: "Clone Graph",
    url: "https://leetcode.com/problems/clone-graph/",
    topic: "Graphs",
    subtopic: "DFS/BFS Basics",
    difficulty: "medium",
    tags: ["graph", "breadth-first-search", "depth-first-search"]
  },
  {
    platformProblemId: "207",
    platform: "leetcode",
    title: "Course Schedule",
    url: "https://leetcode.com/problems/course-schedule/",
    topic: "Graphs",
    subtopic: "DFS/BFS Basics",
    difficulty: "medium",
    tags: ["graph", "topological-sort", "depth-first-search"]
  },
  {
    platformProblemId: "707B",
    platform: "codeforces",
    title: "Bakry and Partitioning",
    url: "https://codeforces.com/problemset/problem/1583/C",
    topic: "Graphs",
    subtopic: "DFS/BFS Basics",
    difficulty: "medium",
    tags: ["graphs", "dfs and similar"]
  },

  // GRAPHS - Shortest Paths
  {
    platformProblemId: "743",
    platform: "leetcode",
    title: "Network Delay Time",
    url: "https://leetcode.com/problems/network-delay-time/",
    topic: "Graphs",
    subtopic: "Shortest Paths",
    difficulty: "medium",
    tags: ["graph", "shortest-path", "dijkstra"]
  },
  {
    platformProblemId: "20C",
    platform: "codeforces",
    title: "Dijkstra?",
    url: "https://codeforces.com/problemset/problem/20/C",
    topic: "Graphs",
    subtopic: "Shortest Paths",
    difficulty: "hard",
    tags: ["shortest paths", "graphs"]
  },

  // DP - One-D DP
  {
    platformProblemId: "70",
    platform: "leetcode",
    title: "Climbing Stairs",
    url: "https://leetcode.com/problems/climbing-stairs/",
    topic: "DP",
    subtopic: "One-D DP",
    difficulty: "easy",
    tags: ["dynamic-programming"]
  },
  {
    platformProblemId: "322",
    platform: "leetcode",
    title: "Coin Change",
    url: "https://leetcode.com/problems/coin-change/",
    topic: "DP",
    subtopic: "One-D DP",
    difficulty: "medium",
    tags: ["dynamic-programming", "breadth-first-search"]
  },
  {
    platformProblemId: "198",
    platform: "leetcode",
    title: "House Robber",
    url: "https://leetcode.com/problems/house-robber/",
    topic: "DP",
    subtopic: "One-D DP",
    difficulty: "medium",
    tags: ["dynamic-programming"]
  },
  {
    platformProblemId: "455A",
    platform: "codeforces",
    title: "Boredom",
    url: "https://codeforces.com/problemset/problem/455/A",
    topic: "DP",
    subtopic: "One-D DP",
    difficulty: "medium",
    tags: ["dp"]
  },
  {
    platformProblemId: "189A",
    platform: "codeforces",
    title: "Cut Ribbon",
    url: "https://codeforces.com/problemset/problem/189/A",
    topic: "DP",
    subtopic: "One-D DP",
    difficulty: "medium",
    tags: ["dp"]
  },

  // DP - Grid DP
  {
    platformProblemId: "62",
    platform: "leetcode",
    title: "Unique Paths",
    url: "https://leetcode.com/problems/unique-paths/",
    topic: "DP",
    subtopic: "Grid DP",
    difficulty: "medium",
    tags: ["dynamic-programming"]
  },
  {
    platformProblemId: "64",
    platform: "leetcode",
    title: "Minimum Path Sum",
    url: "https://leetcode.com/problems/minimum-path-sum/",
    topic: "DP",
    subtopic: "Grid DP",
    difficulty: "medium",
    tags: ["dynamic-programming"]
  }
];

const defaultTopics = [
  {
    name: "Arrays",
    order: 1,
    subtopics: [
      {
        name: "Basics",
        order: 1,
        difficulty: "easy",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "Two Pointers",
        order: 2,
        difficulty: "medium",
        prerequisites: ["Basics"],
        unlockThreshold: 35
      },
      {
        name: "Sliding Window",
        order: 3,
        difficulty: "medium",
        prerequisites: ["Basics"],
        unlockThreshold: 35
      }
    ]
  },
  {
    name: "Binary Search",
    order: 2,
    subtopics: [
      {
        name: "One-D Arrays",
        order: 1,
        difficulty: "easy",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "On Answer",
        order: 2,
        difficulty: "medium",
        prerequisites: ["One-D Arrays"],
        unlockThreshold: 35
      }
    ]
  },
  {
    name: "Strings",
    order: 3,
    subtopics: [
      {
        name: "Basic Operations",
        order: 1,
        difficulty: "easy",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "Pattern Matching",
        order: 2,
        difficulty: "hard",
        prerequisites: ["Basic Operations"],
        unlockThreshold: 35
      }
    ]
  },
  {
    name: "Linked List",
    order: 4,
    subtopics: [
      {
        name: "Singly LinkedList",
        order: 1,
        difficulty: "easy",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "Double LinkedList & Loops",
        order: 2,
        difficulty: "medium",
        prerequisites: ["Singly LinkedList"],
        unlockThreshold: 35
      }
    ]
  },
  {
    name: "Stacks/Queues",
    order: 5,
    subtopics: [
      {
        name: "Linear Structures",
        order: 1,
        difficulty: "easy",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "Monotonic Stack",
        order: 2,
        difficulty: "hard",
        prerequisites: ["Linear Structures"],
        unlockThreshold: 35
      }
    ]
  },
  {
    name: "Trees",
    order: 6,
    subtopics: [
      {
        name: "Binary Tree Traversals",
        order: 1,
        difficulty: "easy",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "BST Operations",
        order: 2,
        difficulty: "medium",
        prerequisites: ["Binary Tree Traversals"],
        unlockThreshold: 35
      }
    ]
  },
  {
    name: "Graphs",
    order: 7,
    subtopics: [
      {
        name: "DFS/BFS Basics",
        order: 1,
        difficulty: "medium",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "Shortest Paths",
        order: 2,
        difficulty: "hard",
        prerequisites: ["DFS/BFS Basics"],
        unlockThreshold: 35
      }
    ]
  },
  {
    name: "DP",
    order: 8,
    subtopics: [
      {
        name: "One-D DP",
        order: 1,
        difficulty: "medium",
        prerequisites: [],
        unlockThreshold: 35
      },
      {
        name: "Grid DP",
        order: 2,
        difficulty: "hard",
        prerequisites: ["One-D DP"],
        unlockThreshold: 35
      }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    // Clear existing collections
    console.log("Clearing existing Topics and ProblemMappings...");
    await Topic.deleteMany({});
    await ProblemMapping.deleteMany({});

    // Seed Problem Mappings
    console.log(`Inserting ${defaultProblems.length} Problem Mappings...`);
    const insertedProblems = await ProblemMapping.insertMany(defaultProblems);
    console.log("Problems inserted successfully.");

    // Match problem mappings to topics & subtopics
    console.log("Constructing Topic hierarchies...");
    for (let t of defaultTopics) {
      for (let s of t.subtopics) {
        // Find problem object IDs that belong to this topic & subtopic
        const matches = insertedProblems.filter(
          (p) => p.topic === t.name && p.subtopic === s.name
        );
        s.problems = matches.map((p) => p._id);
        s.problemCount = matches.length;
      }
    }

    // Insert Topics
    console.log(`Inserting ${defaultTopics.length} Topics...`);
    await Topic.insertMany(defaultTopics);
    console.log("Topics seeded successfully!");

    mongoose.disconnect();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
