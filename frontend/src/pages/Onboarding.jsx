import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Globe, GraduationCap, CheckSquare, Compass, ArrowRight, ShieldCheck } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [handles, setHandles] = useState({
    codeforces: "",
    leetcode: "",
    codechef: "",
    geeksforgeeks: "",
    hackerrank: "",
    codingninjas: "",
    hackerearth: ""
  });
  const [level, setLevel] = useState("beginner");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

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
      ],
      desc: "Prefix sums, Kadane's, two pointers, sliding windows & basic search"
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
      ],
      desc: "Manipulations, KMP/Z matching, anagram frequency maps & palindromes"
    },
    {
      name: "Hashing",
      subtopics: [
        "Stage 1 — HashMap Basics",
        "Stage 2 — Frequency & Count Problems",
        "Stage 3 — Two Sum Variants",
        "Stage 4 — Subarray with Given Sum",
        "Stage 5 — Longest Subarray Problems"
      ],
      desc: "HashMaps, frequency counts, Two Sum variants, & sum subarrays"
    },
    {
      name: "Binary Search",
      subtopics: [
        "Stage 1 — Classic Binary Search",
        "Stage 2 — Binary Search on Answer",
        "Stage 3 — Search in Rotated Array",
        "Stage 4 — BS on 2D Matrix",
        "Stage 5 — Aggressive Problems (Minimize Max)"
      ],
      desc: "Sorted ranges search, BS on answer, rotated list & 2D binary search"
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
      ],
      desc: "Recursive stack traces, subsets, permutations, & sudoku solver mazes"
    },
    {
      name: "Linked List",
      subtopics: [
        "Stage 1 — LL Basics & Traversal",
        "Stage 2 — Reversal Problems",
        "Stage 3 — Fast & Slow Pointer on LL",
        "Stage 4 — Merge & Sort LL",
        "Stage 5 — Cycle Detection"
      ],
      desc: "Singly & doubly pointers, reversals, slow-fast cycle detection, & merges"
    },
    {
      name: "Stacks & Queues",
      subtopics: [
        "Stage 1 — Stack Basics",
        "Stage 2 — Monotonic Stack",
        "Stage 3 — Queue & Deque Basics",
        "Stage 4 — Sliding Window Maximum",
        "Stage 5 — Stack on Strings"
      ],
      desc: "LIFO/FIFO buffers, monotonic stacks, deques & window max indicators"
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
      ],
      desc: "Hierarchical nodes traversal, BST properties, LCA, & views"
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
      ],
      desc: "Adjacency lists, DFS/BFS traversals, Dijkstra, DSU disjoint union & MST"
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
      ],
      desc: "Optimal substructures, 1D DP, Knapsacks, subsequence matching, & grid DP"
    },
    {
      name: "Greedy",
      subtopics: [
        "Stage 1 — Greedy Basics",
        "Stage 2 — Interval Scheduling",
        "Stage 3 — Activity Selection",
        "Stage 4 — Huffman & Fractional Knapsack"
      ],
      desc: "Local sorting metrics, scheduling tasks, & fractional knapsacks"
    },
    {
      name: "Bit Manipulation",
      subtopics: [
        "Stage 1 — Bit Basics",
        "Stage 2 — XOR Tricks",
        "Stage 3 — Bit Masking",
        "Stage 4 — Power of 2 Problems"
      ],
      desc: "Binary shift logic, XOR tricks, masks, & power indicators"
    },
    {
      name: "Math & Number Theory",
      subtopics: [
        "Stage 1 — Number Logic",
        "Stage 2 — Prime & Sieve",
        "Stage 3 — GCD, LCM, Modular Arithmetic",
        "Stage 4 — Combinatorics Basics"
      ],
      desc: "Eratosthenes primes sieve, Euclidean GCD, modular maths, & combinations"
    },
    {
      name: "Tries",
      subtopics: [
        "Stage 1 — Trie Basics",
        "Stage 2 — Word Search & Prefix Problems",
        "Stage 3 — XOR Trie"
      ],
      desc: "Prefix tries, autocomplete lookups, & maximum XOR calculations"
    },
    {
      name: "Heaps & Priority Queue",
      subtopics: [
        "Stage 1 — Heap Basics",
        "Stage 2 — Kth Largest/Smallest",
        "Stage 3 — Merge K Sorted Lists",
        "Stage 4 — Sliding Window with Heap"
      ],
      desc: "Min/Max heaps, Kth element query, list merging, & heap-based windows"
    }
  ];

  const handleToggleTopic = (topicName) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    // Map selected major topics to their subtopics
    let studiedSubtopics = [];
    selectedTopics.forEach((topicName) => {
      const topicObj = majorTopics.find((t) => t.name === topicName);
      if (topicObj) {
        studiedSubtopics = studiedSubtopics.concat(topicObj.subtopics);
      }
    });

    try {
      await updateProfile({
        currentLevel: level,
        codeforcesHandle: handles.codeforces.trim(),
        leetcodeHandle: handles.leetcode.trim(),
        codechefHandle: handles.codechef.trim(),
        gfgHandle: handles.geeksforgeeks.trim(),
        hackerrankHandle: handles.hackerrank.trim(),
        codingNinjasHandle: handles.codingninjas.trim(),
        hackerEarthHandle: handles.hackerearth.trim(),
        studiedTopics: studiedSubtopics
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding failed:", err);
      alert(err || "Onboarding failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Step Indicators */}
      <div className="max-w-2xl w-full flex items-center justify-between mb-8 px-4 text-xs font-semibold">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  step === num
                    ? "bg-indigo-650 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-400 text-white"
                    : step > num
                    ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                }`}
              >
                {num}
              </div>
              <span className={`text-[11px] font-semibold hidden sm:inline ${step === num ? "text-slate-900 dark:text-slate-100 font-bold" : "text-slate-400 dark:text-slate-500"}`}>
                {num === 1 ? "Handles Link" : num === 2 ? "Skill Level" : "DSA Scope"}
              </span>
            </div>
            {num < 3 && <div className={`flex-1 h-px mx-4 ${step > num ? "bg-indigo-500/50" : "bg-slate-200 dark:bg-slate-800"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Card container */}
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm text-left">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Globe className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              Link Competitive Profiles
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-450 mb-6 leading-relaxed">
              Connect LeetCode and Codeforces to sync progress and analyze subtopic details. (You can skip these and link them later in settings).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-amber-500">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. lc_master"
                  value={handles.leetcode}
                  onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-rose-500">
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tourist"
                  value={handles.codeforces}
                  onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-amber-700">
                  CodeChef Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. chef_user"
                  value={handles.codechef}
                  onChange={(e) => setHandles({ ...handles, codechef: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-450">
                  GeeksforGeeks Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. gfg_profile"
                  value={handles.geeksforgeeks}
                  onChange={(e) => setHandles({ ...handles, geeksforgeeks: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  HackerRank Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. hr_coder"
                  value={handles.hackerrank}
                  onChange={(e) => setHandles({ ...handles, hackerrank: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-indigo-500">
                  Coding Ninjas Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. ninja_360"
                  value={handles.codingninjas}
                  onChange={(e) => setHandles({ ...handles, codingninjas: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-purple-500">
                  HackerEarth Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. earth_dev"
                  value={handles.hackerearth}
                  onChange={(e) => setHandles({ ...handles, hackerearth: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <GraduationCap className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              Select Target Skill Level
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-450 mb-6 leading-relaxed">
              Choose your current expertise. This optimizes problem recommendation difficulty recommendation parameters.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "beginner", title: "Beginner", desc: "Just starting DSA. Target: Easy problems (LeetCode Easy, CF Division 3 A/B)." },
                { key: "intermediate", title: "Intermediate", desc: "Know basic topics. Target: Medium problems (LeetCode Medium, CF B/C)." },
                { key: "advanced", title: "Advanced", desc: "Fluent in algorithms. Target: Hard problems (LeetCode Hard, CF C/D/E)." }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLevel(item.key)}
                  className={`p-5 rounded-lg border text-left flex flex-col gap-2.5 transition-all duration-150 focus:outline-none ${
                    level === item.key
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 shadow-2xs"
                      : "bg-slate-50/40 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  <span className={`font-bold text-sm ${level === item.key ? "text-indigo-600 dark:text-indigo-450 font-bold" : "text-slate-800 dark:text-slate-300"}`}>
                    {item.title}
                  </span>
                  <span className="text-4xs text-slate-500 dark:text-slate-400 leading-normal">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Compass className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              Choose Studied DSA Topics
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-450 mb-6 leading-relaxed">
              Check the topics you've already studied. AlgoMentor will analyze weaknesses and generate daily sheets ONLY for unlocked studied subtopics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {majorTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.name);
                return (
                  <button
                    key={topic.name}
                    type="button"
                    onClick={() => handleToggleTopic(topic.name)}
                    className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-all duration-150 focus:outline-none ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 shadow-2xs"
                        : "bg-slate-50/40 dark:bg-slate-950/20 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                    <div>
                      <span className={`font-semibold text-xs ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-300"}`}>
                        {topic.name}
                      </span>
                      <p className="text-4xs text-slate-500 dark:text-slate-400 leading-normal mt-1">{topic.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 mt-8 pt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none focus:outline-none"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors text-xs font-semibold flex items-center gap-1.5 focus:outline-none"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting || selectedTopics.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 focus:outline-none"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? "Finishing..." : "Finish Onboarding"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
