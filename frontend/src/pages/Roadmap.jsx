import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import axios from "axios";
import { getDifficultyColor } from "../utils/helpers";
import {
  Map,
  ExternalLink,
  CheckCircle2,
  Circle,
  AlertCircle,
  RefreshCw,
  Milestone,
  Lock,
  Award,
  BookOpen,
  PlayCircle,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from "lucide-react";

// Static mapping for descriptive topic details in Generic roadmap
const topicInfo = {
  "Arrays": {
    why: "Foundation of all DSA. Master arrays before moving forward.",
    prereq: "Binary Search, Strings, Hashing, Recursion"
  },
  "Strings": {
    why: "Essential for parsing and text processing. Frequently asked in interviews.",
    prereq: "Tries, Dynamic Programming"
  },
  "Hashing": {
    why: "Key for O(1) lookups and solving search problems efficiently.",
    prereq: "Graphs, Topic Explorer advanced stages"
  },
  "Binary Search": {
    why: "Crucial optimization technique to reduce O(N) searches to O(log N).",
    prereq: "Aggressive Problems, advanced sorting"
  },
  "Recursion & Backtracking": {
    why: "Fundamental concepts for dynamic programming and tree/graph traversals.",
    prereq: "Trees, Graphs, Dynamic Programming"
  },
  "Linked List": {
    why: "Understanding dynamic memory allocation and pointer manipulations.",
    prereq: "Stacks & Queues, Trees"
  },
  "Stacks & Queues": {
    why: "Linear structures with LIFO/FIFO logic used in traversals and monotonic logic.",
    prereq: "Trees, Graphs"
  },
  "Trees": {
    why: "Hierarchical data structure representing decisions, parsing, and databases.",
    prereq: "Tries, Graphs, Segment Trees"
  },
  "Graphs": {
    why: "Modeling networks, dependencies, and complex relations in real systems.",
    prereq: "Advanced DP, Network Flow"
  },
  "Dynamic Programming": {
    why: "Optimization technique based on subproblem solutions to solve complex recurrences.",
    prereq: "Advanced DP on Trees, Bitmask DP"
  },
  "Tries": {
    why: "Prefix tree structure for fast retrieval of keys over a dictionary.",
    prereq: "Advanced String Matching"
  },
  "Greedy": {
    why: "Making locally optimal choices to find a global optimum.",
    prereq: "Activity selection, interval scheduling"
  },
  "Bit Manipulation": {
    why: "Direct bitwise operations for memory optimization and fast arithmetic.",
    prereq: "Bitmask DP"
  },
  "Math & Number Theory": {
    why: "Prime numbers, GCD, and modular arithmetic needed for cryptography and competitive programming.",
    prereq: "Advanced algorithms"
  },
  "Heaps & Priority Queue": {
    why: "Optimal for accessing the minimum or maximum element dynamically in O(1).",
    prereq: "Dijkstra's Algorithm, sorting"
  }
};

const Roadmap = () => {
  const { user, progress } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personalized"); // "personalized" or "generic"
  const [personalizedData, setPersonalizedData] = useState(null);
  const [genericRoadmap, setGenericRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [elapsedText, setElapsedText] = useState("Just now");

  // Accordion states
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true }); // Week 1 expanded by default
  const [expandedTopics, setExpandedTopics] = useState({}); // Key: `${weekNumber}-${subtopicName}`
  const [expandedGenericTopics, setExpandedGenericTopics] = useState({}); // Key: topicName

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [personalData, genericData] = await Promise.all([
        api.getPersonalizedRoadmap(user._id),
        api.getGenericRoadmap()
      ]);
      setPersonalizedData(personalData);
      setGenericRoadmap(genericData);
    } catch (err) {
      console.error("Failed to load roadmaps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Live timer for "Last generated" indicator
  useEffect(() => {
    if (!personalizedData?.generatedAt) return;

    const updateElapsed = () => {
      const diff = Date.now() - new Date(personalizedData.generatedAt).getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (seconds < 15) {
        setElapsedText("Just now");
      } else if (seconds < 60) {
        setElapsedText(`${seconds} seconds ago`);
      } else if (minutes === 1) {
        setElapsedText("1 minute ago");
      } else {
        setElapsedText(`${minutes} minutes ago`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 10000);
    return () => clearInterval(interval);
  }, [personalizedData?.generatedAt]);

  const handleRegenerate = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/roadmap/adaptive/${user._id}?force=true`);
      setPersonalizedData(res.data);
      // Reset expansions to original state
      setExpandedWeeks({ 1: true });
      setExpandedTopics({});
    } catch (err) {
      console.error("Failed to regenerate roadmap:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleProblem = async (problemId) => {
    // 1. Optimistic local update
    setPersonalizedData((prev) => {
      if (!prev) return prev;
      const completed = [...(prev.completedProblems || [])];
      const idx = completed.indexOf(problemId);
      if (idx > -1) {
        completed.splice(idx, 1);
      } else {
        completed.push(problemId);
      }
      return { ...prev, completedProblems: completed };
    });

    try {
      // 2. Persist in snapshot and general progress
      const res = await axios.post("http://localhost:5000/api/roadmap/toggle-problem", { problemId });
      setPersonalizedData(res.data);
    } catch (err) {
      console.error("Failed to toggle problem:", err);
      // Revert if API fails
      fetchData();
    }
  };

  const getMasteryColorClass = (mastery) => {
    if (mastery < 40) return "text-red-500 bg-red-500/10 border border-red-500/20";
    if (mastery <= 70) return "text-amber-500 bg-amber-500/10 border border-amber-500/20";
    return "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
  };

  const getMasteryEmoji = (mastery) => {
    if (mastery < 40) return "🔴";
    if (mastery <= 70) return "🟡";
    return "🟢";
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center gap-2.5 font-sans">
            <Map className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Learning Roadmap
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Toggle between the standard structured DSA milestones and your personalized weekly adaptive study plan.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/60 dark:bg-slate-950 p-1 rounded-lg border border-slate-300/40 dark:border-slate-800/40 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab("personalized")}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === "personalized"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Adaptive Roadmap
          </button>
          <button
            onClick={() => setActiveTab("generic")}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === "generic"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Generic Roadmap
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      ) : activeTab === "personalized" ? (
        /* ADAPTIVE ROADMAP VIEW */
        <div className="flex flex-col gap-6">
          
          {/* Summary / Performance Card */}
          {personalizedData && !personalizedData.noPerformanceData && !personalizedData.noPlatformConnected && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-400">
                  🗺 Personalized Guidance
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-850 dark:text-slate-100 mt-1 my-0">
                  Your Personalized Roadmap
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-2xs text-slate-500 dark:text-slate-400 mt-2">
                  <span>Based on your performance across <strong className="text-slate-700 dark:text-slate-300">{user.studiedTopics?.length || 0}</strong> topics</span>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <strong>{personalizedData.totalWeakAreas || 0}</strong> weak areas identified
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <strong>{personalizedData.totalRevisionNeeded || 0}</strong> topics need revision
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 self-stretch md:self-auto">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="w-full md:w-auto px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
                  {regenerating ? "Regenerating..." : "Regenerate Roadmap"}
                </button>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 italic">
                  Last generated: {elapsedText}
                </span>
              </div>
            </div>
          )}

          {/* EDGE CASES RENDERING */}
          {!personalizedData || personalizedData.noPerformanceData ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xs text-center flex flex-col items-center max-w-xl mx-auto my-8 gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-200">
                  No Performance Data Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm">
                  Complete some problems first to generate your roadmap. Start with the Topics page to unlock your learning path.
                </p>
              </div>
              <button
                onClick={() => navigate("/explorer")}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Go to Topics
              </button>
            </div>
          ) : personalizedData.noPlatformConnected ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xs text-center flex flex-col items-center max-w-xl mx-auto my-8 gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-200">
                  No Connected Profiles
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm">
                  Connect your LeetCode or Codeforces profile to get a personalized roadmap based on your actual performance.
                </p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Go to Profile
              </button>
            </div>
          ) : personalizedData.allMastered ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xs text-center flex flex-col items-center max-w-xl mx-auto my-8 gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Award className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-200">
                  All Current Topics Mastered!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm">
                  Great work! You've mastered your current topics. Unlock new topics to continue your journey.
                </p>
              </div>
              <button
                onClick={() => navigate("/explorer")}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Unlock New Topics
              </button>
            </div>
          ) : (
            /* ADAPTIVE WEEKS ACCORDION LIST */
            <div className="flex flex-col gap-4">
              {personalizedData.weeks.map((weekData) => {
                const isWeekExpanded = !!expandedWeeks[weekData.weekNumber];

                // Calculate completed vs total problems dynamically for this week
                let weekTotal = 0;
                let weekSolved = 0;
                weekData.items.forEach((item) => {
                  weekTotal += item.recommendedProblems?.length || 0;
                  item.recommendedProblems?.forEach((p) => {
                    if (personalizedData.completedProblems?.includes(p._id.toString())) {
                      weekSolved++;
                    }
                  });
                });

                return (
                  <div
                    key={weekData.weekNumber}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col text-left transition-all duration-200"
                  >
                    {/* Week Accordion Header */}
                    <div
                      onClick={() =>
                        setExpandedWeeks((prev) => ({
                          ...prev,
                          [weekData.weekNumber]: !isWeekExpanded
                        }))
                      }
                      className="bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100/40 dark:hover:bg-slate-900/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none border-b border-slate-100 dark:border-slate-850"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200/50 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-2xs">
                          W{weekData.weekNumber}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100 mt-0.5 my-0">
                            {weekData.title}
                          </h3>
                          <span className="text-2xs text-slate-500 dark:text-slate-450 block mt-0.5 leading-snug">
                            "{weekData.subtitle}"
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-2xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-350">
                          {weekSolved} / {weekTotal} Completed
                        </span>
                        <span className="text-slate-400">
                          {isWeekExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </span>
                      </div>
                    </div>

                    {/* Subtopics Content List */}
                    {isWeekExpanded && (
                      <div className="p-6 flex flex-col gap-4">
                        {weekData.items.map((item, idx) => {
                          const isTopicExpanded = !!expandedTopics[`${weekData.weekNumber}-${item.subtopic}`];

                          return (
                            <div
                              key={item.subtopic}
                              className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs"
                            >
                              {/* Subtopic Accordion Row Trigger */}
                              <div
                                onClick={() =>
                                  setExpandedTopics((prev) => ({
                                    ...prev,
                                    [`${weekData.weekNumber}-${item.subtopic}`]: !isTopicExpanded
                                  }))
                                }
                                className={`w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer select-none transition-colors border-b ${
                                  isTopicExpanded
                                    ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-250 dark:border-slate-800"
                                    : "hover:bg-slate-50/40 dark:hover:bg-slate-850/20 border-transparent"
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-wrap min-w-0 pr-4">
                                  <span className="text-slate-400 font-bold shrink-0">{idx + 1}.</span>
                                  <span className="font-bold text-slate-850 dark:text-slate-200 text-xs truncate">
                                    {item.subtopic}
                                  </span>
                                  <span className="text-4xs text-slate-450 dark:text-slate-500">({item.topic})</span>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span
                                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${getMasteryColorClass(
                                      item.masteryScore
                                    )}`}
                                  >
                                    {item.masteryScore}% Mastery {getMasteryEmoji(item.masteryScore)}
                                  </span>
                                  <span className="text-slate-400">
                                    {isTopicExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </span>
                                </div>
                              </div>

                              {/* Expanded subtopic problem list view */}
                              {isTopicExpanded && (
                                <div className="p-5 bg-slate-50/30 dark:bg-slate-950/20 flex flex-col gap-4">
                                  
                                  {/* Diagnosis Banner */}
                                  <div className="flex items-start gap-2 text-2xs text-slate-550 dark:text-slate-450 bg-indigo-50/20 dark:bg-slate-950/45 px-3.5 py-2.5 rounded-lg border border-slate-200/50 dark:border-slate-850">
                                    <span className="font-bold text-indigo-650 dark:text-indigo-400 shrink-0">
                                      Diagnosis:
                                    </span>
                                    <span>{item.reason}</span>
                                  </div>

                                  {/* Problem Checklist Header */}
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-2.5">
                                      RECOMMENDED PROBLEMS:
                                    </span>

                                    {/* Problems Vertical Checklist */}
                                    {(!item.recommendedProblems || item.recommendedProblems.length === 0) ? (
                                      <p className="text-xs text-slate-450 italic my-0">Problems coming soon</p>
                                    ) : (
                                      <div className="flex flex-col gap-2">
                                        {item.recommendedProblems.map((problem) => {
                                          const isSolved = personalizedData.completedProblems?.includes(problem._id.toString());
                                          
                                          let platformLabel = "LC";
                                          let platformColor = "text-orange-650 dark:text-orange-400 border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/20";
                                          if (problem.platform === "gfg") {
                                            platformLabel = "GFG";
                                            platformColor = "text-emerald-600 dark:text-emerald-455 border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20";
                                          } else if (problem.platform === "codeforces") {
                                            platformLabel = "CF";
                                            platformColor = "text-blue-650 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20";
                                          } else {
                                            platformLabel = (problem.platform || "").toUpperCase();
                                            platformColor = "text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20";
                                          }

                                          return (
                                            <div
                                              key={problem._id}
                                              className={`flex items-center justify-between p-3 rounded-lg border text-2xs transition-all ${
                                                isSolved
                                                  ? "bg-slate-50/20 dark:bg-slate-900/30 border-slate-100 dark:border-slate-850 opacity-60"
                                                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700"
                                              }`}
                                            >
                                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                                {/* Checkbox */}
                                                <button
                                                  onClick={() => handleToggleProblem(problem._id)}
                                                  className="focus:outline-none shrink-0 transition-colors cursor-pointer"
                                                  title={isSolved ? "Mark unsolved" : "Mark solved"}
                                                >
                                                  {isSolved ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                                                  ) : (
                                                    <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-500" />
                                                  )}
                                                </button>

                                                {/* Problem title (strikethrough when solved) */}
                                                <span className={`font-semibold text-2xs truncate ${isSolved ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>
                                                  {problem.title}
                                                </span>
                                              </div>

                                              {/* Badges & external link */}
                                              <div className="flex items-center gap-2 shrink-0 font-mono">
                                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${platformColor}`}>
                                                  {platformLabel}
                                                </span>
                                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${getDifficultyColor(problem.difficulty)}`}>
                                                  {problem.difficulty}
                                                </span>
                                                <a
                                                  href={problem.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="p-1.5 text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
                                                  title="Open in new tab"
                                                >
                                                  <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* GENERIC DSA ROADMAP TAB VIEW (Topic Accordions list) */
        <div className="flex flex-col gap-4 text-left">
          {genericRoadmap.map((milestone) => {
            const isExpanded = !!expandedGenericTopics[milestone.topic];

            // Setup colors and statuses
            let statusBadge = "Locked";
            let statusBadgeColor = "text-slate-500 bg-slate-500/10 border-slate-500/20";
            let dotColorClass = "bg-slate-400 dark:bg-slate-600";

            if (milestone.status === "completed" || milestone.avgMastery > 75) {
              statusBadge = "Completed";
              statusBadgeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
              dotColorClass = "bg-emerald-500";
            } else if (milestone.status === "in_progress") {
              statusBadge = "In Progress";
              statusBadgeColor = "text-indigo-650 bg-indigo-500/10 border-indigo-500/20";
              dotColorClass = "bg-indigo-600";
            }

            const info = topicInfo[milestone.topic] || {
              why: "Essential DSA milestone to build reasoning and problem solving speed.",
              prereq: "Standard curriculum prerequisite nodes"
            };

            return (
              <div
                key={milestone.topic}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs"
              >
                {/* Header Row clickable */}
                <div
                  onClick={() =>
                    setExpandedGenericTopics((prev) => ({
                      ...prev,
                      [milestone.topic]: !isExpanded
                    }))
                  }
                  className={`w-full px-6 py-4 flex items-center justify-between font-semibold text-xs text-slate-900 dark:text-slate-100 cursor-pointer select-none transition-colors border-b ${
                    isExpanded
                      ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-250 dark:border-slate-800"
                      : "hover:bg-slate-50/40 dark:hover:bg-slate-850/20 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColorClass}`} />
                    <span className="font-extrabold text-slate-850 dark:text-slate-200 text-sm truncate">
                      {milestone.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeColor}`}>
                      {statusBadge}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-450 text-xs font-semibold">
                      Progress: {milestone.solvedProblems || 0} / {milestone.totalProblems || 0}
                    </span>
                    <span className="text-slate-450">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/20 dark:bg-slate-900/20 flex flex-col gap-6 text-left border-t border-slate-100 dark:border-slate-850">
                    
                    {/* Subtopics checklist */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-2">
                        SUBTOPICS IN ORDER:
                      </span>
                      <div className="flex flex-col gap-1.5 pl-2 text-2xs text-slate-700 dark:text-slate-350">
                        {milestone.subtopics.map((sub) => (
                          <div key={sub.name} className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">•</span>
                            <span>{sub.name}</span>
                            <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded font-mono font-semibold ${getDifficultyColor(sub.difficulty)}`}>
                              {sub.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanatory blocks */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-1">
                        WHY THIS TOPIC:
                      </span>
                      <p className="text-2xs text-slate-500 dark:text-slate-450 font-medium leading-relaxed my-0 pl-2">
                        "{info.why}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-1">
                        PREREQUISITE FOR:
                      </span>
                      <p className="text-2xs text-slate-500 dark:text-slate-450 font-medium leading-relaxed my-0 pl-2">
                        {info.prereq}
                      </p>
                    </div>

                    {/* Actions and status summary bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-2xs font-semibold text-slate-500">
                        <span>YOUR STATUS:</span>
                        <span className={`px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                          {statusBadge} — {milestone.solvedProblems || 0} / {milestone.totalProblems || 0}
                        </span>
                      </div>

                      <button
                        onClick={() => navigate("/explorer", { state: { topic: milestone.topic } })}
                        className="px-4 py-2 border border-indigo-650 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-2xs font-bold rounded-lg shadow-3xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        Practice This Topic →
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Roadmap;
