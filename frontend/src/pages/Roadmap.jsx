import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
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
  AlertTriangle
} from "lucide-react";

const Roadmap = () => {
  const { user, progress } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personalized"); // "personalized" or "generic"
  const [personalizedData, setPersonalizedData] = useState(null);
  const [genericRoadmap, setGenericRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [visibleWeeks, setVisibleWeeks] = useState(2);
  const [elapsedText, setElapsedText] = useState("Just now");

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

  // Live timer to update "Last generated X minutes/seconds ago"
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
    const interval = setInterval(updateElapsed, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [personalizedData?.generatedAt]);

  const handleRegenerate = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      const personalData = await api.getPersonalizedRoadmap(user._id);
      setPersonalizedData(personalData);
    } catch (err) {
      console.error("Failed to regenerate roadmap:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleProblem = async (problemId) => {
    try {
      await api.markProblemSolved(problemId);
      // Refresh local progress and study plan weights
      const [personalData, genericData] = await Promise.all([
        api.getPersonalizedRoadmap(user._id),
        api.getGenericRoadmap()
      ]);
      setPersonalizedData(personalData);
      setGenericRoadmap(genericData);
    } catch (err) {
      console.error("Failed to toggle problem:", err);
    }
  };

  // Helper to get mastery badge styles
  const getMasteryBadgeStyles = (mastery) => {
    if (mastery < 40) {
      return "bg-red-500/10 text-red-500 border border-red-500/20";
    }
    if (mastery <= 70) {
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }
    return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
  };

  // Set of solved problem IDs for checkmarks
  const solvedSet = new Set((progress?.solvedProblems || []).map((id) => id.toString()));

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
                  Performance Diagnostic
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
            /* WEEKS LIST */
            <div className="flex flex-col gap-8">
              {personalizedData.weeks.slice(0, visibleWeeks).map((weekData) => {
                // Calculate solved details for the entire week
                let totalSolved = 0;
                let totalProblems = 0;
                weekData.items.forEach((item) => {
                  totalProblems += item.recommendedProblems.length;
                  item.recommendedProblems.forEach((p) => {
                    if (solvedSet.has(p._id.toString())) {
                      totalSolved++;
                    }
                  });
                });

                return (
                  <div
                    key={weekData.weekNumber}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col text-left"
                  >
                    {/* Week Header */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200/50 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-2xs">
                          W{weekData.weekNumber}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold block">
                            Milestone Schedule
                          </span>
                          <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100 mt-0.5 my-0">
                            {weekData.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-2xs text-slate-500 dark:text-slate-400 italic">
                          {weekData.subtitle}
                        </span>
                        <span className="font-mono text-2xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-350">
                          {totalSolved} / {totalProblems} Completed
                        </span>
                      </div>
                    </div>

                    {/* Week Subtopics list */}
                    <div className="p-6 flex flex-col gap-6">
                      {weekData.items.map((item, index) => {
                        return (
                          <div
                            key={item.subtopic}
                            className={`pb-6 ${
                              index < weekData.items.length - 1
                                ? "border-b border-slate-100 dark:border-slate-850"
                                : ""
                            }`}
                          >
                            {/* Subtopic Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm sm:text-base my-0">
                                  {index + 1}. {item.subtopic}
                                </h4>
                                <span className="text-xs text-slate-400">({item.topic})</span>
                              </div>

                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${getMasteryBadgeStyles(
                                  item.masteryScore
                                )}`}
                              >
                                {item.masteryScore}% Mastery
                              </span>
                            </div>

                            {/* Subtopic Reason */}
                            <div className="flex items-center gap-2 text-2xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                              <span className="font-semibold text-indigo-650 dark:text-indigo-400">
                                Diagnosis:
                              </span>
                              <span>{item.reason}</span>
                            </div>

                            {/* Recommended Problems */}
                            <div className="pl-0 sm:pl-4">
                              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-2.5">
                                Recommended Practice Checklist
                              </span>

                              {item.recommendedProblems.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Problems coming soon</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {item.recommendedProblems.map((problem) => {
                                    const isSolved = solvedSet.has(problem._id.toString());
                                    return (
                                      <div
                                        key={problem._id}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                          isSolved
                                            ? "bg-slate-50/40 dark:bg-slate-900/30 border-slate-100 dark:border-slate-850 opacity-60"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <button
                                            onClick={() => handleToggleProblem(problem._id)}
                                            className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none"
                                            title={isSolved ? "Mark unsolved" : "Mark solved"}
                                          >
                                            {isSolved ? (
                                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                                            ) : (
                                              <Circle className="w-5 h-5" />
                                            )}
                                          </button>

                                          <div className="flex flex-col text-left min-w-0">
                                            <span className="font-semibold text-2xs text-slate-800 dark:text-slate-200 truncate">
                                              {problem.title}
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider mt-0.5">
                                              {problem.platform}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold ${getDifficultyColor(
                                              problem.difficulty
                                            )}`}
                                          >
                                            {problem.difficulty}
                                          </span>
                                          <a
                                            href={problem.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            title="Solve in new tab"
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
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {personalizedData.weeks.length > visibleWeeks && (
                <button
                  onClick={() => setVisibleWeeks((prev) => prev + 1)}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl font-bold text-xs shadow-3xs transition-all self-center mt-2 cursor-pointer"
                >
                  Load More Weeks
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* GENERIC DSA ROADMAP: Vertical Timeline style */
        <div className="relative pl-6 sm:pl-8 py-4 text-left">
          
          {/* Vertical timeline line */}
          <div className="absolute left-[29px] sm:left-[37px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="flex flex-col gap-8">
            {genericRoadmap.map((milestone) => {
              // Color style based on mastery/status
              let circleColorClass = "";
              let statusText = "";
              let textBadgeColor = "";
              let icon = null;

              if (milestone.status === "completed") {
                circleColorClass = "bg-emerald-500 border-emerald-600 dark:border-emerald-400 text-white";
                statusText = `Completed (${Math.round(milestone.avgMastery)}% Avg Mastery)`;
                textBadgeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                icon = <CheckCircle2 className="w-4 h-4 text-white" />;
              } else if (milestone.status === "in_progress") {
                circleColorClass = "bg-indigo-600 border-indigo-700 dark:border-indigo-400 text-white";
                statusText = `In Progress (${Math.round(milestone.avgMastery)}% Avg Mastery)`;
                textBadgeColor = "text-indigo-650 bg-indigo-500/10 border-indigo-500/20";
                icon = <PlayCircle className="w-4 h-4 text-white" />;
              } else {
                circleColorClass = "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-850 text-slate-400 dark:text-slate-600";
                statusText = "Locked / Not Started";
                textBadgeColor = "text-slate-500 bg-slate-500/10 border-slate-500/20";
                icon = <Lock className="w-3.5 h-3.5" />;
              }

              return (
                <div key={milestone.topic} className="relative flex gap-6 items-start">
                  
                  {/* Node Icon on line */}
                  <div
                    className={`absolute -left-[14px] sm:-left-[22px] top-1.5 h-7 w-7 sm:h-9 sm:w-9 rounded-full border-2 flex items-center justify-center font-bold z-10 shadow-2xs ${circleColorClass}`}
                    title={statusText}
                  >
                    {icon}
                  </div>

                  {/* Milestone Card */}
                  <div
                    onClick={() => navigate("/explorer", { state: { topic: milestone.topic } })}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer rounded-2xl p-5 ml-6 flex flex-col gap-4 transition-all duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850/50 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                          Milestone {milestone.order}
                        </span>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg mt-0.5 my-0">
                          {milestone.topic}
                        </h3>
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${textBadgeColor}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Subtopics list grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {milestone.subtopics.map((sub) => (
                        <div
                          key={sub.name}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 flex flex-col gap-2 text-2xs text-left"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200 leading-snug">{sub.name}</span>
                          <div className="flex items-center justify-between text-[10px] gap-2 flex-wrap mt-auto">
                            <span className={`px-1.5 py-0.2 rounded font-bold uppercase font-mono ${getDifficultyColor(sub.difficulty)}`}>
                              {sub.difficulty}
                            </span>
                            {sub.prerequisites && sub.prerequisites.length > 0 ? (
                              <span className="text-slate-450 font-medium truncate max-w-[100px]" title={sub.prerequisites.join(", ")}>
                                Prereq: {sub.prerequisites[0].replace(/Stage \d+ — /, "")}
                              </span>
                            ) : (
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Core Start</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
