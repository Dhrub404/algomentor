const mongoose = require("mongoose");
require("dotenv").config();

const Topic = require("./models/Topic");
const ProblemMapping = require("./models/ProblemMapping");

if (ProblemMapping.schema && ProblemMapping.schema.path) {
  const platformPath = ProblemMapping.schema.path("platform");
  if (platformPath && platformPath.enumValues && !platformPath.enumValues.includes("gfg")) {
    platformPath.enumValues.push("gfg");
  }
}


const sectionDefinitions = [
  {
    name: "Arrays",
    order: 1,
    stages: [
      { name: "Stage 1 — Array Basics & Traversal", count: 5, difficulty: "easy", prereqs: [] },
      { name: "Stage 2 — Prefix Sum", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 3 — Difference Array", count: 4, difficulty: "medium", prereqs: ["Stage 2 — Prefix Sum"] },
      { name: "Stage 4 — Kadane's Algorithm", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 5 — Sliding Window Fixed Size", count: 5, difficulty: "medium", prereqs: ["Stage 2 — Prefix Sum"] },
      { name: "Stage 6 — Sliding Window Variable Size", count: 5, difficulty: "medium", prereqs: ["Stage 5 — Sliding Window Fixed Size"] },
      { name: "Stage 7 — Two Pointers", count: 5, difficulty: "medium", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 8 — Fast & Slow Pointers", count: 4, difficulty: "medium", prereqs: ["Stage 7 — Two Pointers"] },
      { name: "Stage 9 — Three Pointers & K-Sum", count: 4, difficulty: "medium", prereqs: ["Stage 7 — Two Pointers"] },
      { name: "Stage 10 — Frequency Count & Hashing", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 11 — Sorting Techniques", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 12 — Binary Search on Arrays", count: 5, difficulty: "easy", prereqs: ["Stage 11 — Sorting Techniques"] }
    ]
  },
  {
    name: "Strings",
    order: 2,
    stages: [
      { name: "Stage 1 — String Basics", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 2 — String Manipulation", count: 5, difficulty: "easy", prereqs: ["Stage 1 — String Basics"] },
      { name: "Stage 3 — Pattern Matching (KMP/Z)", count: 4, difficulty: "hard", prereqs: ["Stage 2 — String Manipulation"] },
      { name: "Stage 4 — Anagrams & Frequency Maps", count: 5, difficulty: "easy", prereqs: ["Stage 1 — String Basics"] },
      { name: "Stage 5 — Palindrome Problems", count: 5, difficulty: "easy", prereqs: ["Stage 1 — String Basics"] },
      { name: "Stage 6 — Sliding Window on Strings", count: 5, difficulty: "medium", prereqs: ["Stage 5 — Sliding Window Fixed Size"] }
    ]
  },
  {
    name: "Hashing",
    order: 3,
    stages: [
      { name: "Stage 1 — HashMap Basics", count: 5, difficulty: "easy", prereqs: ["Stage 1 — Array Basics & Traversal"] },
      { name: "Stage 2 — Frequency & Count Problems", count: 5, difficulty: "easy", prereqs: ["Stage 1 — HashMap Basics"] },
      { name: "Stage 3 — Two Sum Variants", count: 5, difficulty: "easy", prereqs: ["Stage 1 — HashMap Basics"] },
      { name: "Stage 4 — Subarray with Given Sum", count: 4, difficulty: "medium", prereqs: ["Stage 2 — Prefix Sum"] },
      { name: "Stage 5 — Longest Subarray Problems", count: 4, difficulty: "medium", prereqs: ["Stage 5 — Sliding Window Fixed Size"] }
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
      { name: "Stage 3 — Permutations", count: 4, difficulty: "medium", prereqs: ["Stage 2 — Subset & Subsequence Generation"] },
      { name: "Stage 4 — Backtracking Basics", count: 5, difficulty: "medium", prereqs: ["Stage 2 — Subset & Subsequence Generation"] },
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

const realProblemsMap = {
  "Arrays": {
    "Stage 1 — Array Basics & Traversal": [
      { title: "Two Sum", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/two-sum" },
      { title: "Running Sum of 1d Array", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/running-sum-of-1d-array" },
      { title: "Find the Duplicate Number", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-the-duplicate-number" },
      { title: "Maximum Subarray", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-subarray" },
      { title: "Best Time to Buy and Sell Stock", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock" }
    ],
    "Stage 2 — Prefix Sum": [
      { title: "Range Sum Query - Immutable", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/range-sum-query-immutable" },
      { title: "Subarray Sum Equals K", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/subarray-sum-equals-k" },
      { title: "Product of Array Except Self", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/product-of-array-except-self" },
      { title: "Find Pivot Index", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/find-pivot-index" },
      { title: "Contiguous Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/contiguous-array" }
    ],
    "Stage 3 — Difference Array": [
      { title: "Car Pooling", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/car-pooling" },
      { title: "Corporate Flight Bookings", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/corporate-flight-bookings" },
      { title: "Range Addition", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/range-addition" },
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons" }
    ],
    "Stage 4 — Kadane's Algorithm": [
      { title: "Maximum Subarray", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-subarray" },
      { title: "Maximum Sum Circular Subarray", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-sum-circular-subarray" },
      { title: "Best Time to Buy and Sell Stock II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii" },
      { title: "Maximum Product Subarray", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-product-subarray" },
      { title: "Longest Turbulent Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-turbulent-subarray" }
    ],
    "Stage 5 — Sliding Window Fixed Size": [
      { title: "Maximum Average Subarray I", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/maximum-average-subarray-i" },
      { title: "Number of Sub-arrays of Size K and Average >= Threshold", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold" },
      { title: "Sliding Window Maximum", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/sliding-window-maximum" },
      { title: "Find All Anagrams in a String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string" },
      { title: "Contains Duplicate II", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/contains-duplicate-ii" }
    ],
    "Stage 6 — Sliding Window Variable Size": [
      { title: "Longest Substring Without Repeating Characters", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters" },
      { title: "Minimum Window Substring", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-window-substring" },
      { title: "Longest Repeating Character Replacement", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-repeating-character-replacement" },
      { title: "Max Consecutive Ones III", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/max-consecutive-ones-iii" },
      { title: "Fruit Into Baskets", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/fruit-into-baskets" }
    ],
    "Stage 7 — Two Pointers": [
      { title: "Container With Most Water", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/container-with-most-water" },
      { title: "3Sum", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/3sum" },
      { title: "Remove Duplicates from Sorted Array", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array" },
      { title: "Move Zeroes", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/move-zeroes" },
      { title: "Trapping Rain Water", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/trapping-rain-water" }
    ],
    "Stage 8 — Fast & Slow Pointers": [
      { title: "Linked List Cycle", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/linked-list-cycle" },
      { title: "Find the Duplicate Number", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-the-duplicate-number" },
      { title: "Middle of the Linked List", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/middle-of-the-linked-list" },
      { title: "Happy Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/happy-number" }
    ],
    "Stage 9 — Three Pointers & K-Sum": [
      { title: "4Sum", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/4sum" },
      { title: "3Sum Closest", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/3sum-closest" },
      { title: "3Sum Smaller", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/3sum-smaller" },
      { title: "Sort Colors", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/sort-colors" }
    ],
    "Stage 10 — Frequency Count & Hashing": [
      { title: "Two Sum", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/two-sum" },
      { title: "Top K Frequent Elements", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/top-k-frequent-elements" },
      { title: "Group Anagrams", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/group-anagrams" },
      { title: "Longest Consecutive Sequence", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-consecutive-sequence" },
      { title: "Valid Sudoku", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/valid-sudoku" }
    ],
    "Stage 11 — Sorting Techniques": [
      { title: "Sort an Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/sort-an-array" },
      { title: "Merge Intervals", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/merge-intervals" },
      { title: "Largest Number", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/largest-number" },
      { title: "Kth Largest Element in an Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/kth-largest-element-in-an-array" },
      { title: "Sort Colors", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/sort-colors" }
    ],
    "Stage 12 — Binary Search on Arrays": [
      { title: "Binary Search", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/binary-search" },
      { title: "Search in Rotated Sorted Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/search-in-rotated-sorted-array" },
      { title: "Find Minimum in Rotated Sorted Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array" },
      { title: "Search a 2D Matrix", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/search-a-2d-matrix" },
      { title: "Median of Two Sorted Arrays", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/median-of-two-sorted-arrays" }
    ]
  },
  "Strings": {
    "Stage 1 — String Basics": [
      { title: "Valid Palindrome", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/valid-palindrome" },
      { title: "Reverse String", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/reverse-string" },
      { title: "Valid Anagram", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/valid-anagram" },
      { title: "First Unique Character in a String", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/first-unique-character-in-a-string" },
      { title: "Longest Common Prefix", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/longest-common-prefix" }
    ],
    "Stage 2 — String Manipulation": [
      { title: "Reverse Words in a String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/reverse-words-in-a-string" },
      { title: "String to Integer (atoi)", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/string-to-integer-atoi" },
      { title: "Zigzag Conversion", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/zigzag-conversion" },
      { title: "Count and Say", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/count-and-say" },
      { title: "Roman to Integer", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/roman-to-integer" }
    ],
    "Stage 3 — Pattern Matching (KMP/Z)": [
      { title: "Implement strStr()", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string" },
      { title: "Repeated Substring Pattern", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/repeated-substring-pattern" },
      { title: "Short Encoding of Words", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/short-encoding-of-words" },
      { title: "Longest Happy Prefix", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/longest-happy-prefix" }
    ],
    "Stage 4 — Anagrams & Frequency Maps": [
      { title: "Group Anagrams", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/group-anagrams" },
      { title: "Find All Anagrams in a String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string" },
      { title: "Minimum Window Substring", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-window-substring" },
      { title: "Ransom Note", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/ransom-note" },
      { title: "Permutation in String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/permutation-in-string" }
    ],
    "Stage 5 — Palindrome Problems": [
      { title: "Longest Palindromic Substring", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-palindromic-substring" },
      { title: "Palindromic Substrings", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/palindromic-substrings" },
      { title: "Valid Palindrome II", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/valid-palindrome-ii" },
      { title: "Longest Palindrome", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/longest-palindrome" },
      { title: "Palindrome Partitioning", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/palindrome-partitioning" }
    ],
    "Stage 6 — Sliding Window on Strings": [
      { title: "Longest Substring Without Repeating Characters", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters" },
      { title: "Minimum Window Substring", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-window-substring" },
      { title: "Longest Repeating Character Replacement", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-repeating-character-replacement" },
      { title: "Permutation in String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/permutation-in-string" },
      { title: "Maximum Number of Vowels in Substring", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length" }
    ]
  },
  "Hashing": {
    "Stage 1 — HashMap Basics": [
      { title: "Two Sum", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/two-sum" },
      { title: "Contains Duplicate", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/contains-duplicate" },
      { title: "Intersection of Two Arrays", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/intersection-of-two-arrays" },
      { title: "Happy Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/happy-number" },
      { title: "Single Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/single-number" }
    ],
    "Stage 2 — Frequency & Count Problems": [
      { title: "Top K Frequent Elements", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/top-k-frequent-elements" },
      { title: "Sort Characters By Frequency", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/sort-characters-by-frequency" },
      { title: "First Unique Character", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/first-unique-character-in-a-string" },
      { title: "Unique Number of Occurrences", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/unique-number-of-occurrences" },
      { title: "Majority Element", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/majority-element" }
    ],
    "Stage 3 — Two Sum Variants": [
      { title: "Two Sum II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted" },
      { title: "4Sum II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/4sum-ii" },
      { title: "Pairs of Songs", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/pairs-of-songs-with-total-durations-divisible-by-60" },
      { title: "Count Nice Pairs", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/count-nice-pairs-in-an-array" },
      { title: "Check if Array Pairs are Divisible by k", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/check-if-array-pairs-are-divisible-by-k" }
    ]
  },
  "Binary Search": {
    "Stage 1 — Classic Binary Search": [
      { title: "Binary Search", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/binary-search" },
      { title: "Guess Number Higher or Lower", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/guess-number-higher-or-lower" },
      { title: "First Bad Version", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/first-bad-version" },
      { title: "Search Insert Position", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/search-insert-position" },
      { title: "Count Negative Numbers in Sorted Matrix", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix" }
    ],
    "Stage 2 — Binary Search on Answer": [
      { title: "Koko Eating Bananas", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/koko-eating-bananas" },
      { title: "Minimum Number of Days to Make Bouquets", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets" },
      { title: "Split Array Largest Sum", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/split-array-largest-sum" },
      { title: "Capacity to Ship Packages", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days" },
      { title: "Find the Smallest Divisor", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold" }
    ],
    "Stage 3 — Search in Rotated Array": [
      { title: "Search in Rotated Sorted Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/search-in-rotated-sorted-array" },
      { title: "Find Minimum in Rotated Sorted Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array" },
      { title: "Search in Rotated Sorted Array II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii" },
      { title: "Find Minimum in Rotated Sorted Array II", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii" }
    ]
  },
  "Recursion & Backtracking": {
    "Stage 1 — Recursion Basics": [
      { title: "Pow(x, n)", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/powx-n" },
      { title: "Reverse String", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/reverse-string" },
      { title: "Fibonacci Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/fibonacci-number" },
      { title: "Climbing Stairs", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/climbing-stairs" },
      { title: "Merge Two Sorted Lists", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/merge-two-sorted-lists" }
    ],
    "Stage 2 — Subset & Subsequence Generation": [
      { title: "Subsets", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/subsets" },
      { title: "Subsets II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/subsets-ii" },
      { title: "Letter Combinations of a Phone Number", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number" },
      { title: "Generate Parentheses", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/generate-parentheses" },
      { title: "Combination Sum", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/combination-sum" }
    ],
    "Stage 3 — Permutations": [
      { title: "Permutations", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/permutations" },
      { title: "Permutations II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/permutations-ii" },
      { title: "Next Permutation", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/next-permutation" },
      { title: "Permutation Sequence", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/permutation-sequence" }
    ],
    "Stage 4 — Backtracking Basics": [
      { title: "Combination Sum II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/combination-sum-ii" },
      { title: "Palindrome Partitioning", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/palindrome-partitioning" },
      { title: "Word Search", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/word-search" },
      { title: "Restore IP Addresses", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/restore-ip-addresses" },
      { title: "Path Sum II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/path-sum-ii" }
    ]
  },
  "Linked List": {
    "Stage 1 — LL Basics & Traversal": [
      { title: "Reverse Linked List", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/reverse-linked-list" },
      { title: "Merge Two Sorted Lists", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/merge-two-sorted-lists" },
      { title: "Remove Nth Node From End", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list" },
      { title: "Linked List Cycle", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/linked-list-cycle" },
      { title: "Intersection of Two Linked Lists", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/intersection-of-two-linked-lists" }
    ],
    "Stage 2 — Reversal Problems": [
      { title: "Reverse Linked List II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/reverse-linked-list-ii" },
      { title: "Reverse Nodes in k-Group", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/reverse-nodes-in-k-group" },
      { title: "Swap Nodes in Pairs", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/swap-nodes-in-pairs" },
      { title: "Rotate List", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/rotate-list" },
      { title: "Reorder List", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/reorder-list" }
    ]
  },
  "Stacks & Queues": {
    "Stage 1 — Stack Basics": [
      { title: "Valid Parentheses", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/valid-parentheses" },
      { title: "Min Stack", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/min-stack" },
      { title: "Evaluate Reverse Polish Notation", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation" },
      { title: "Daily Temperatures", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/daily-temperatures" },
      { title: "Implement Queue using Stacks", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/implement-queue-using-stacks" }
    ],
    "Stage 2 — Monotonic Stack": [
      { title: "Next Greater Element I", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/next-greater-element-i" },
      { title: "Next Greater Element II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/next-greater-element-ii" },
      { title: "Largest Rectangle in Histogram", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/largest-rectangle-in-histogram" },
      { title: "Trapping Rain Water", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/trapping-rain-water" },
      { title: "Remove K Digits", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/remove-k-digits" }
    ],
    "Stage 3 — Queue & Deque Basics": [
      { title: "Implement Stack using Queues", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/implement-stack-using-queues" },
      { title: "Design Circular Queue", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/design-circular-queue" },
      { title: "Number of Recent Calls", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/number-of-recent-calls" },
      { title: "Time Needed to Buy Tickets", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/time-needed-to-buy-tickets" },
      { title: "Dota2 Senate", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/dota2-senate" }
    ],
    "Stage 4 — Sliding Window Maximum": [
      { title: "Sliding Window Maximum", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/sliding-window-maximum" },
      { title: "Jump Game VI", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/jump-game-vi" },
      { title: "Constrained Subsequence Sum", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/constrained-subsequence-sum" },
      { title: "Longest Continuous Subarray With Absolute Diff", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit" }
    ],
    "Stage 5 — Stack on Strings": [
      { title: "Remove All Adjacent Duplicates In String", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string" },
      { title: "Decode String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/decode-string" },
      { title: "Remove Duplicate Letters", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/remove-duplicate-letters" },
      { title: "Basic Calculator II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/basic-calculator-ii" }
    ]
  },
  "Trees": {
    "Stage 1 — Tree Traversals (BFS/DFS)": [
      { title: "Binary Tree Inorder Traversal", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/binary-tree-inorder-traversal" },
      { title: "Binary Tree Level Order Traversal", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/binary-tree-level-order-traversal" },
      { title: "Binary Tree Preorder Traversal", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/binary-tree-preorder-traversal" },
      { title: "Binary Tree Postorder Traversal", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/binary-tree-postorder-traversal" },
      { title: "N-ary Tree Level Order Traversal", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/n-ary-tree-level-order-traversal" }
    ],
    "Stage 2 — Tree Height & Diameter": [
      { title: "Maximum Depth of Binary Tree", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree" },
      { title: "Diameter of Binary Tree", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/diameter-of-binary-tree" },
      { title: "Balanced Binary Tree", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/balanced-binary-tree" },
      { title: "Minimum Depth of Binary Tree", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/minimum-depth-of-binary-tree" },
      { title: "Count Good Nodes in Binary Tree", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/count-good-nodes-in-binary-tree" }
    ],
    "Stage 3 — Binary Search Tree": [
      { title: "Validate Binary Search Tree", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/validate-binary-search-tree" },
      { title: "Search in a Binary Search Tree", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/search-in-a-binary-search-tree" },
      { title: "Insert into a Binary Search Tree", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/insert-into-a-binary-search-tree" },
      { title: "Delete Node in a BST", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/delete-node-in-a-bst" },
      { title: "Kth Smallest Element in a BST", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst" }
    ],
    "Stage 4 — Lowest Common Ancestor": [
      { title: "Lowest Common Ancestor of a BST", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree" },
      { title: "Lowest Common Ancestor of a Binary Tree", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree" },
      { title: "Step-By-Step Directions From a Binary Tree Node to Another", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/step-by-step-directions-from-a-binary-tree-node-to-another" },
      { title: "Maximum Difference Between Node and Ancestor", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-difference-between-node-and-ancestor" }
    ],
    "Stage 5 — Tree DP Problems": [
      { title: "House Robber III", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/house-robber-iii" },
      { title: "Binary Tree Maximum Path Sum", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum" },
      { title: "Distribute Coins in Binary Tree", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/distribute-coins-in-binary-tree" },
      { title: "Longest Univalue Path", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-univalue-path" }
    ],
    "Stage 6 — Views & Boundary Traversal": [
      { title: "Binary Tree Right Side View", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/binary-tree-right-side-view" },
      { title: "Binary Tree Left Side View", difficulty: "easy", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1" },
      { title: "Top View of Binary Tree", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1" },
      { title: "Bottom View of Binary Tree", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1" },
      { title: "Vertical Order Traversal", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree" }
    ]
  },
  "Graphs": {
    "Stage 1 — Graph Representation": [
      { title: "Find the Town Judge", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/find-the-town-judge" },
      { title: "Find Center of Star Graph", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/find-center-of-star-graph" },
      { title: "Number of Provinces", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/number-of-provinces" },
      { title: "Create a Graph Representation", difficulty: "easy", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1" }
    ],
    "Stage 2 — BFS & DFS": [
      { title: "Number of Islands", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/number-of-islands" },
      { title: "Flood Fill", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/flood-fill" },
      { title: "Clone Graph", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/clone-graph" },
      { title: "01 Matrix", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/01-matrix" },
      { title: "Rotting Oranges", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/rotting-oranges" }
    ],
    "Stage 3 — Cycle Detection": [
      { title: "Course Schedule", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/course-schedule" },
      { title: "Detect Cycle in Undirected Graph", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1" },
      { title: "Detect Cycle in Directed Graph", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1" },
      { title: "Find Eventual Safe States", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-eventual-safe-states" },
      { title: "Redundant Connection", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/redundant-connection" }
    ],
    "Stage 4 — Topological Sort": [
      { title: "Course Schedule II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/course-schedule-ii" },
      { title: "Alien Dictionary", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/alien-dictionary" },
      { title: "Largest Color Value in a Directed Graph", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/largest-color-value-in-a-directed-graph" },
      { title: "Find All Possible Recipes from Given Supplies", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies" }
    ],
    "Stage 5 — Shortest Path (Dijkstra/BFS)": [
      { title: "Network Delay Time", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/network-delay-time" },
      { title: "Path With Minimum Effort", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/path-with-minimum-effort" },
      { title: "Cheapest Flights Within K Stops", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops" },
      { title: "Swim in Rising Water", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/swim-in-rising-water" },
      { title: "Word Ladder", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/word-ladder" }
    ],
    "Stage 6 — Minimum Spanning Tree": [
      { title: "Min Cost to Connect All Points", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/min-cost-to-connect-all-points" },
      { title: "Connecting Cities With Minimum Cost", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/connecting-cities-with-minimum-cost" },
      { title: "Optimize Water Distribution in a Village", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/optimize-water-distribution-in-a-village" },
      { title: "Minimum Spanning Tree", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1" }
    ],
    "Stage 7 — Disjoint Set Union (DSU)": [
      { title: "Number of Operations to Make Network Connected", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/number-of-operations-to-make-network-connected" },
      { title: "Accounts Merge", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/accounts-merge" },
      { title: "Satisfiability of Equality Equations", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/satisfiability-of-equality-equations" },
      { title: "Smallest String With Swaps", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/smallest-string-with-swaps" }
    ],
    "Stage 8 — Strongly Connected Components": [
      { title: "Critical Connections in a Network", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/critical-connections-in-a-network" },
      { title: "Number of Strongly Connected Components", difficulty: "hard", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1" },
      { title: "Minimum Number of Days to Disconnect Island", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-number-of-days-to-disconnect-island" }
    ]
  },
  "Dynamic Programming": {
    "Stage 1 — DP Basics & Memoization": [
      { title: "Climbing Stairs", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/climbing-stairs" },
      { title: "House Robber", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/house-robber" },
      { title: "Frog Jump", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/geek-jump/1" },
      { title: "Min Cost Climbing Stairs", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/min-cost-climbing-stairs" },
      { title: "Decode Ways", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/decode-ways" }
    ],
    "Stage 2 — 1D DP (Fibonacci, Climbing)": [
      { title: "House Robber II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/house-robber-ii" },
      { title: "Jump Game", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/jump-game" },
      { title: "Jump Game II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/jump-game-ii" },
      { title: "Word Break", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/word-break" },
      { title: "Coin Change", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/coin-change" }
    ],
    "Stage 3 — 0/1 Knapsack": [
      { title: "Partition Equal Subset Sum", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/partition-equal-subset-sum" },
      { title: "Target Sum", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/target-sum" },
      { title: "Last Stone Weight II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/last-stone-weight-ii" },
      { title: "0-1 Knapsack Problem", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1" },
      { title: "Count of Subsets with Sum K", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/perfect-sum-problem5633/1" }
    ],
    "Stage 4 — Unbounded Knapsack": [
      { title: "Coin Change", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/coin-change" },
      { title: "Coin Change II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/coin-change-ii" },
      { title: "Integer Break", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/integer-break" },
      { title: "Unbounded Knapsack", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1" }
    ],
    "Stage 5 — Longest Common Subsequence": [
      { title: "Longest Common Subsequence", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-common-subsequence" },
      { title: "Edit Distance", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/edit-distance" },
      { title: "Shortest Common Supersequence", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/shortest-common-supersequence" },
      { title: "Delete Operation for Two Strings", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/delete-operation-for-two-strings" },
      { title: "Distinct Subsequences", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/distinct-subsequences" }
    ],
    "Stage 6 — Longest Increasing Subsequence": [
      { title: "Longest Increasing Subsequence", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-increasing-subsequence" },
      { title: "Number of Longest Increasing Subsequences", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/number-of-longest-increasing-subsequence" },
      { title: "Russian Doll Envelopes", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/russian-doll-envelopes" },
      { title: "Longest Bitonic Subsequence", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/longest-bitonic-subsequence0824/1" }
    ],
    "Stage 7 — Matrix Chain / Interval DP": [
      { title: "Burst Balloons", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/burst-balloons" },
      { title: "Minimum Cost to Cut a Stick", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick" },
      { title: "Strange Printer", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/strange-printer" },
      { title: "Matrix Chain Multiplication", difficulty: "hard", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1" }
    ],
    "Stage 8 — DP on Grids": [
      { title: "Unique Paths", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/unique-paths" },
      { title: "Unique Paths II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/unique-paths-ii" },
      { title: "Minimum Path Sum", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/minimum-path-sum" },
      { title: "Triangle", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/triangle" },
      { title: "Maximal Square", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximal-square" }
    ],
    "Stage 9 — DP on Trees": [
      { title: "House Robber III", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/house-robber-iii" },
      { title: "Binary Tree Maximum Path Sum", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum" },
      { title: "Diameter of Binary Tree", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/diameter-of-binary-tree" },
      { title: "Longest Path with Different Adjacent Characters", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/longest-path-with-different-adjacent-characters" }
    ],
    "Stage 10 — Bitmask DP": [
      { title: "Minimum XOR Sum of Two Arrays", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-xor-sum-of-two-arrays" },
      { title: "Shortest Path Visiting All Nodes", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/shortest-path-visiting-all-nodes" },
      { title: "Find the Shortest Superstring", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/find-the-shortest-superstring" }
    ]
  },
  "Greedy": {
    "Stage 1 — Greedy Basics": [
      { title: "Assign Cookies", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/assign-cookies" },
      { title: "Lemonade Change", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/lemonade-change" },
      { title: "Valid Parenthesis String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/valid-parenthesis-string" },
      { title: "Minimum Number of Refueling Stops", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops" },
      { title: "Gas Station", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/gas-station" }
    ],
    "Stage 2 — Interval Scheduling": [
      { title: "Non-overlapping Intervals", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/non-overlapping-intervals" },
      { title: "Merge Intervals", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/merge-intervals" },
      { title: "Insert Interval", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/insert-interval" },
      { title: "Meeting Rooms II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/meeting-rooms-ii" },
      { title: "Minimum Interval to Include Each Query", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/minimum-interval-to-include-each-query" }
    ],
    "Stage 3 — Activity Selection": [
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons" },
      { title: "Task Scheduler", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/task-scheduler" },
      { title: "Reorganize String", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/reorganize-string" },
      { title: "Course Schedule III", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/course-schedule-iii" }
    ],
    "Stage 4 — Huffman & Fractional Knapsack": [
      { title: "Minimum Cost to Connect Sticks", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/minimum-cost-to-connect-sticks" },
      { title: "Fractional Knapsack", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1" },
      { title: "Huffman Encoding", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/huffman-encoding3345/1" },
      { title: "Maximum Units on a Truck", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/maximum-units-on-a-truck" }
    ]
  },
  "Bit Manipulation": {
    "Stage 1 — Bit Basics": [
      { title: "Single Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/single-number" },
      { title: "Number of 1 Bits", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/number-of-1-bits" },
      { title: "Counting Bits", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/counting-bits" },
      { title: "Reverse Bits", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/reverse-bits" },
      { title: "Power of Two", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/power-of-two" }
    ],
    "Stage 2 — XOR Tricks": [
      { title: "Single Number II", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/single-number-ii" },
      { title: "Single Number III", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/single-number-iii" },
      { title: "Find the Difference", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/find-the-difference" },
      { title: "Missing Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/missing-number" },
      { title: "XOR Queries of a Subarray", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/xor-queries-of-a-subarray" }
    ],
    "Stage 3 — Bit Masking": [
      { title: "Subsets", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/subsets" },
      { title: "Maximum Product of Word Lengths", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-product-of-word-lengths" },
      { title: "Bitwise AND of Numbers Range", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/bitwise-and-of-numbers-range" },
      { title: "Sum of Two Integers", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/sum-of-two-integers" }
    ],
    "Stage 4 — Power of 2 Problems": [
      { title: "Power of Four", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/power-of-four" },
      { title: "Power of Three", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/power-of-three" },
      { title: "Minimum Flips to Make a OR b Equal to c", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/minimum-flips-to-make-a-or-b-equal-to-c" },
      { title: "Divide Two Integers", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/divide-two-integers" }
    ]
  },
  "Math & Number Theory": {
    "Stage 1 — Number Logic": [
      { title: "Palindrome Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/palindrome-number" },
      { title: "Reverse Integer", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/reverse-integer" },
      { title: "Excel Sheet Column Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/excel-sheet-column-number" },
      { title: "Happy Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/happy-number" },
      { title: "Ugly Number", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/ugly-number" }
    ],
    "Stage 2 — Prime & Sieve": [
      { title: "Count Primes", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/count-primes" },
      { title: "Prime Arrangements", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/prime-arrangements" },
      { title: "Four Divisors", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/four-divisors" },
      { title: "Sieve of Eratosthenes", difficulty: "easy", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/sieve-of-eratosthenes5242/1" },
      { title: "Almost Prime", difficulty: "medium", platform: "codeforces", url: "https://codeforces.com/problemset/problem/26/A" }
    ],
    "Stage 3 — GCD, LCM, Modular Arithmetic": [
      { title: "GCD of Strings", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/greatest-common-divisor-of-strings" },
      { title: "Find GCD of Array", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/find-greatest-common-divisor-of-array" },
      { title: "X of a Kind in a Deck of Cards", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/x-of-a-kind-in-a-deck-of-cards" },
      { title: "Nth Fibonacci with Modular Arithmetic", difficulty: "easy", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/nth-fibonacci-number1335/1" },
      { title: "Water Bottles", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/water-bottles" }
    ],
    "Stage 4 — Combinatorics Basics": [
      { title: "Pascal's Triangle", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/pascals-triangle" },
      { title: "Pascal's Triangle II", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/pascals-triangle-ii" },
      { title: "Unique Paths", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/unique-paths" },
      { title: "K-th Smallest in Lexicographic Order", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/k-th-smallest-in-lexigraphical-order" }
    ]
  },
  "Tries": {
    "Stage 1 — Trie Basics": [
      { title: "Implement Trie (Prefix Tree)", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/implement-trie-prefix-tree" },
      { title: "Design Add and Search Words Data Structure", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure" },
      { title: "Longest Word in Dictionary", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/longest-word-in-dictionary" },
      { title: "Replace Words", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/replace-words" }
    ],
    "Stage 2 — Word Search & Prefix Problems": [
      { title: "Word Search II", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/word-search-ii" },
      { title: "Search Suggestions System", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/search-suggestions-system" },
      { title: "Index Pairs of a String", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/index-pairs-of-a-string" },
      { title: "Map Sum Pairs", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/map-sum-pairs" }
    ],
    "Stage 3 — XOR Trie": [
      { title: "Maximum XOR of Two Numbers in an Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array" },
      { title: "Maximum XOR With an Element From Array", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/maximum-xor-with-an-element-from-array" },
      { title: "Count Pairs With XOR in a Range", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/count-pairs-with-xor-in-a-range" }
    ]
  },
  "Heaps & Priority Queue": {
    "Stage 1 — Heap Basics": [
      { title: "Kth Largest Element in a Stream", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream" },
      { title: "Last Stone Weight", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/last-stone-weight" },
      { title: "Relative Ranks", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/relative-ranks" },
      { title: "Minimum Cost to Connect Sticks", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/minimum-cost-to-connect-sticks" },
      { title: "The K Weakest Rows in a Matrix", difficulty: "easy", platform: "leetcode", url: "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix" }
    ],
    "Stage 2 — Kth Largest/Smallest": [
      { title: "Kth Largest Element in an Array", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/kth-largest-element-in-an-array" },
      { title: "K Closest Points to Origin", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/k-closest-points-to-origin" },
      { title: "Top K Frequent Elements", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/top-k-frequent-elements" },
      { title: "Kth Smallest Element in a Sorted Matrix", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix" },
      { title: "Find K Pairs with Smallest Sums", difficulty: "medium", platform: "leetcode", url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums" }
    ],
    "Stage 3 — Merge K Sorted Lists": [
      { title: "Merge K Sorted Lists", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/merge-k-sorted-lists" },
      { title: "Smallest Range Covering Elements from K Lists", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists" },
      { title: "Find Median from Data Stream", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/find-median-from-data-stream" },
      { title: "Kth Smallest Number in M Sorted Lists", difficulty: "medium", platform: "gfg", url: "https://www.geeksforgeeks.org/problems/find-smallest-range-containing-elements-from-k-lists/1" }
    ],
    "Stage 4 — Sliding Window with Heap": [
      { title: "Sliding Window Maximum", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/sliding-window-maximum" },
      { title: "Find Median from Data Stream", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/find-median-from-data-stream" },
      { title: "Maximum Performance of a Team", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/maximum-performance-of-a-team" },
      { title: "IPO", difficulty: "hard", platform: "leetcode", url: "https://leetcode.com/problems/ipo" }
    ]
  }
};

const getPlatformProblemId = (url, platform) => {
  if (platform === "leetcode") {
    const parts = url.split("/problems/");
    if (parts.length > 1) {
      return parts[1].split("/")[0];
    }
  } else if (platform === "gfg") {
    const parts = url.split("/problems/");
    if (parts.length > 1) {
      return parts[1].split("/")[0];
    }
  } else if (platform === "codeforces") {
    const parts = url.split("/problem/");
    if (parts.length > 1) {
      return parts[1].replace(/\//g, "-").replace(/-$/, "");
    }
  }
  return url.replace(/[^a-zA-Z0-9]/g, "-");
};

const seedExpandedDB = async () => {
  try {
    console.log("Connecting to MongoDB for expanded seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    console.log("Clearing existing Topics and ProblemMappings...");
    await Topic.deleteMany({});
    await ProblemMapping.deleteMany({});

    const seenProblems = new Set();
    const allProblemsToInsert = [];
    const topicDocuments = [];

    for (const section of sectionDefinitions) {
      for (const stage of section.stages) {
        const stageProblems = [];
        const mappedList = realProblemsMap[section.name] && realProblemsMap[section.name][stage.name];

        if (mappedList) {
          for (let pIdx = 0; pIdx < mappedList.length; pIdx++) {
            const item = mappedList[pIdx];
            let platformProblemId = getPlatformProblemId(item.url, item.platform);
            const uniqKey = `${platformProblemId}_${item.platform}`;
            
            if (seenProblems.has(uniqKey)) {
              const suffix = stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              platformProblemId = `${platformProblemId}-${suffix}`;
            }
            seenProblems.add(`${platformProblemId}_${item.platform}`);

            const probDoc = {
              platformProblemId,
              platform: item.platform,
              title: item.title,
              url: item.url,
              topic: section.name,
              subtopic: stage.name,
              difficulty: item.difficulty,
              tags: [section.name.toLowerCase(), "adaptive-curriculum"]
            };
            allProblemsToInsert.push(probDoc);
            stageProblems.push(probDoc);
          }
        } else {
          // Fallback programmatic generator
          for (let i = 1; i <= stage.count; i++) {
            const platformsList = ["leetcode", "codeforces", "geeksforgeeks"];
            const platform = platformsList[(section.order * 11 + section.stages.indexOf(stage) * 7 + i) % platformsList.length];
            
            let platformPrefix = "";
            if (platform === "leetcode") platformPrefix = "lc";
            else if (platform === "codeforces") platformPrefix = "cf";
            else if (platform === "geeksforgeeks") platformPrefix = "gfg";

            let platformProblemId = `${platformPrefix}_${section.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}_s${section.stages.indexOf(stage) + 1}_p${i}`;
            const uniqKey = `${platformProblemId}_${platform}`;
            
            if (seenProblems.has(uniqKey)) {
              const suffix = stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              platformProblemId = `${platformProblemId}-${suffix}`;
            }
            seenProblems.add(`${platformProblemId}_${platform}`);

            let title = "";
            let url = "";
            
            if (platform === "leetcode") {
              title = `${stage.name.replace("Stage ", "L")} - Challenge ${i}`;
              url = `https://leetcode.com/problems/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}/`;
            } else if (platform === "codeforces") {
              title = `${stage.name.replace("Stage ", "CF")} - Contest Prob ${i}`;
              url = `https://codeforces.com/problemset/problem/1000/${i}`;
            } else if (platform === "geeksforgeeks") {
              title = `${stage.name.replace("Stage ", "GFG")} - Practice ${i}`;
              url = `https://practice.geeksforgeeks.org/problems/${stage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chall-${i}/1`;
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
    }

    console.log(`Inserting ${allProblemsToInsert.length} generated Problem Mappings...`);
    const insertedProblems = await ProblemMapping.insertMany(allProblemsToInsert);
    console.log("Problem mappings inserted successfully.");

    for (const section of sectionDefinitions) {
      const subtopicsList = [];
      let subOrder = 1;

      for (const stage of section.stages) {
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
