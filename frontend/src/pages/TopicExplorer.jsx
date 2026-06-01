import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import {
  Compass, RefreshCw, Lock, Unlock, AlertTriangle, ExternalLink,
  ChevronDown, ChevronRight, BookOpen, CheckCircle2, Circle, Trophy
} from "lucide-react";
import { getDifficultyColor } from "../utils/helpers";

const TopicExplorer = () => {
  const { progress, performances, refetchUser } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [expandedSubtopicName, setExpandedSubtopicName] = useState(null);
  const [solvingIds, setSolvingIds] = useState(new Set());

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await api.getAllTopics();
      setTopics(data);
    } catch (err) {
      console.error("Failed to load topics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const solvedSet = new Set((progress?.solvedProblems || []).map((id) => id.toString()));

  // Calculate statistics for each topic
  const topicStats = topics.map((topic) => {
    let total = 0;
    let solved = 0;
    topic.subtopics.forEach((sub) => {
      total += sub.problems?.length || 0;
      sub.problems?.forEach((p) => {
        if (solvedSet.has(p._id.toString())) solved += 1;
      });
    });
    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    return {
      _id: topic._id,
      name: topic.name,
      order: topic.order,
      total,
      solved,
      percent,
      isAllDone: total > 0 && solved === total
    };
  });

  const grandTotalProblems = topicStats.reduce((acc, t) => acc + t.total, 0) || 394;
  const grandTotalSolved = topicStats.reduce((acc, t) => acc + t.solved, 0) || 0;
  const overallPercent = grandTotalProblems > 0 ? Math.round((grandTotalSolved / grandTotalProblems) * 100) : 0;

  // Auto-expand first incomplete topic on page load
  useEffect(() => {
    if (topics.length > 0 && progress && !expandedTopicId) {
      const firstIncomplete = topics.find((topic) => {
        let total = 0;
        let solved = 0;
        topic.subtopics.forEach((sub) => {
          total += sub.problems?.length || 0;
          sub.problems?.forEach((p) => {
            if (solvedSet.has(p._id.toString())) solved += 1;
          });
        });
        return solved < total;
      });

      if (firstIncomplete) {
        setExpandedTopicId(firstIncomplete._id);
      } else {
        setExpandedTopicId(topics[0]._id);
      }
    }
  }, [topics, progress]);

  const handleToggleTopic = (topicId) => {
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
    } else {
      setExpandedTopicId(topicId);
    }
    setExpandedSubtopicName(null); // Reset subtopic expansion when swapping topics
  };

  const handleToggleSubtopic = (subName) => {
    if (expandedSubtopicName === subName) {
      setExpandedSubtopicName(null);
    } else {
      setExpandedSubtopicName(subName);
    }
  };

  const handleSidebarTopicClick = (topicId) => {
    setExpandedTopicId(topicId);
    setExpandedSubtopicName(null);

    // Scroll selected topic into view smoothly
    setTimeout(() => {
      const element = document.getElementById(`topic-row-${topicId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  };

  const handleMarkSolved = async (problemId) => {
    if (solvingIds.has(problemId)) return;
    setSolvingIds((prev) => {
      const next = new Set(prev);
      next.add(problemId);
      return next;
    });

    try {
      await api.markProblemSolved(problemId);
      await refetchUser();
      // Reload topics to refresh problem checklist data and solved state
      const updatedTopics = await api.getAllTopics();
      setTopics(updatedTopics);
    } catch (err) {
      console.error("Error marking problem solved:", err);
      alert("Failed to mark problem solved.");
    } finally {
      setSolvingIds((prev) => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  };

  const getLockTooltip = (subtopic) => {
    if (!subtopic.prerequisites || subtopic.prerequisites.length === 0) return "";
    return `Complete ${subtopic.prerequisites.join(" & ")} first`;
  };

  const getProgressBg = (percent) => {
    if (percent === 100) return "bg-emerald-500";
    if (percent >= 50) return "bg-indigo-600 dark:bg-indigo-500";
    if (percent > 0) return "bg-amber-500";
    return "bg-slate-300 dark:bg-slate-700";
  };

  const getProgressBorder = (percent) => {
    if (percent === 100) return "border-emerald-500/20";
    if (percent >= 50) return "border-indigo-500/20";
    if (percent > 0) return "border-amber-500/20";
    return "border-slate-200 dark:border-slate-800";
  };

  const getProgressText = (percent) => {
    if (percent === 100) return "text-emerald-500 dark:text-emerald-400";
    if (percent >= 50) return "text-indigo-650 dark:text-indigo-400";
    if (percent > 0) return "text-amber-500";
    return "text-slate-500 dark:text-slate-400";
  };

  // SVGs specs for Overall Ring
  const circleRadius = 40;
  const strokeCircumference = 2 * Math.PI * circleRadius;
  const strokeOffset = strokeCircumference - (strokeCircumference * overallPercent) / 100;

  const unlockedSubtopics = progress?.unlockedSubtopics || [];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            DSA Topic Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse the curriculum taxonomy, verify prerequisites, and inspect mapped coding problems.
          </p>
        </div>
        <button
          onClick={fetchTopics}
          className="p-2 rounded-lg text-slate-450 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* TOP SECTION: Overall progress summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Box: Overall circle progress */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex items-center gap-6 shadow-2xs">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={circleRadius}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={circleRadius}
                    className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-300"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={strokeCircumference}
                    strokeDashoffset={strokeOffset}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                    {overallPercent}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                    Done
                  </span>
                </div>
              </div>
              <div className="text-left flex flex-col gap-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-400 m-0">
                  Curriculum Progress
                </h3>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {grandTotalSolved} / {grandTotalProblems}
                </span>
                <span className="text-4xs text-slate-400 dark:text-slate-500 leading-normal">
                  Total problems solved across all 15 competitive programming sections.
                </span>
              </div>
            </div>

            {/* Right Box: Topic progress list overview (Horizontal bars) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-2xs flex flex-col gap-3">
              <h3 className="text-left font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-400 m-0 border-b border-slate-100 dark:border-slate-850 pb-2">
                Topic Breakdown Standings
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5 text-left max-h-[140px] overflow-y-auto pr-1">
                {topicStats.map((stat) => (
                  <button
                    key={stat._id}
                    onClick={() => handleSidebarTopicClick(stat._id)}
                    className="flex flex-col gap-1 group text-left hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center justify-between text-4xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-350 truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {stat.name}
                      </span>
                      <span className="font-mono font-bold text-slate-500 shrink-0">
                        {stat.solved}/{stat.total}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressBg(stat.percent)}`}
                        style={{ width: `${stat.percent}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM SPLIT LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT/CENTER COLUMN: Topic Accordion tree */}
            <div className="lg:col-span-8 flex flex-col gap-3.5">
              {topics.map((topic, index) => {
                const isExpanded = expandedTopicId === topic._id;
                const stats = topicStats.find((s) => s._id === topic._id) || { percent: 0, solved: 0, total: 0, isAllDone: false };

                return (
                  <div
                    key={topic._id}
                    id={`topic-row-${topic._id}`}
                    className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-2xs transition-colors duration-200 ${
                      isExpanded
                        ? "border-slate-350 dark:border-slate-700"
                        : "border-slate-200 dark:border-slate-800/80"
                    }`}
                  >
                    {/* Collapsed state row trigger */}
                    <div
                      onClick={() => handleToggleTopic(topic._id)}
                      className={`w-full px-5 py-4 flex items-center justify-between font-semibold text-xs text-slate-900 dark:text-slate-100 cursor-pointer select-none transition-colors border-b ${
                        isExpanded
                          ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-250 dark:border-slate-800"
                          : "hover:bg-slate-50/40 dark:hover:bg-slate-850/20 border-transparent"
                      }`}
                    >
                      {/* Left info: toggle arrow + order + name + completeness label */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="text-slate-400 shrink-0">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                        <span className="text-slate-400 text-4xs uppercase tracking-widest font-bold shrink-0">
                          SECTION {index + 1}
                        </span>
                        <span className="font-bold text-slate-850 dark:text-slate-200 text-xs truncate">
                          {topic.name}
                        </span>
                        {stats.isAllDone && (
                          <span className="text-emerald-500 dark:text-emerald-450 font-bold text-[10px] shrink-0 ml-1.5 hidden sm:inline">
                            ✓ All done!
                          </span>
                        )}
                      </div>

                      {/* Right info: progress bar + fraction solved */}
                      <div className="flex items-center gap-4 shrink-0">
                        {stats.isAllDone && !isExpanded && (
                          <span className="text-emerald-500 dark:text-emerald-450 font-bold text-[10px] sm:hidden">
                            ✓
                          </span>
                        )}
                        <div className="w-24 sm:w-36 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden xs:block">
                          <div
                            className={`h-full ${getProgressBg(stats.percent)} transition-all duration-300`}
                            style={{ width: `${stats.percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-xs font-bold w-12 text-right">
                          {stats.solved}/{stats.total}
                        </span>
                      </div>
                    </div>

                    {/* Accordion Expansion: Subtopics/Stages list */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900 transition-all duration-300">
                        {topic.subtopics.map((sub, sIdx) => {
                          const isUnlocked = unlockedSubtopics.includes(sub.name);
                          const stageProblems = sub.problems || [];
                          const stageTotal = stageProblems.length;
                          const stageSolved = stageProblems.filter((p) => solvedSet.has(p._id.toString())).length;
                          const stagePercent = stageTotal > 0 ? Math.round((stageSolved / stageTotal) * 100) : 0;
                          const isCompleted = stageTotal > 0 && stageSolved === stageTotal;
                          const isSubExpanded = expandedSubtopicName === sub.name;
                          const lockTooltipText = getLockTooltip(sub);

                          return (
                            <div key={sub.name} className="flex flex-col text-left">
                              {/* Stage Row Header */}
                              <div
                                onClick={() => isUnlocked && handleToggleSubtopic(sub.name)}
                                className={`px-8 py-3.5 flex items-center justify-between text-xs transition-colors select-none ${
                                  isUnlocked
                                    ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/30"
                                    : "cursor-not-allowed bg-slate-50/20 dark:bg-slate-950/10 opacity-55"
                                } ${isSubExpanded ? "bg-slate-50/50 dark:bg-slate-850/40" : ""}`}
                              >
                                {/* Left side: indicator chevron / lock + Stage Name + Completed Badge */}
                                <div className="flex items-center gap-3 truncate pr-4">
                                  {isUnlocked ? (
                                    <span className="text-slate-400">
                                      {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 dark:text-slate-600">
                                      <Lock className="w-3.5 h-3.5" />
                                    </span>
                                  )}

                                  <span className={`font-semibold text-slate-800 dark:text-slate-200 truncate`}>
                                    {sub.name}
                                  </span>

                                  {isUnlocked && isCompleted && (
                                    <span className="text-emerald-500 dark:text-emerald-450 font-bold text-4xs ml-3 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" />
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>

                                {/* Right side: Progress meter or lock icon with hover tooltip */}
                                <div className="flex items-center gap-4 shrink-0 font-medium">
                                  {isUnlocked ? (
                                    <>
                                      <div className="w-20 sm:w-28 h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden hidden xs:block">
                                        <div
                                          className={`h-full ${getProgressBg(stagePercent)} transition-all duration-300`}
                                          style={{ width: `${stagePercent}%` }}
                                        />
                                      </div>
                                      <span className="font-mono text-slate-500 dark:text-slate-450 text-3xs font-semibold w-8 text-right">
                                        {stageSolved}/{stageTotal}
                                      </span>
                                    </>
                                  ) : (
                                    <div className="relative group">
                                      <span className="text-slate-400 dark:text-slate-600 text-3xs flex items-center gap-1 cursor-help hover:text-slate-500 dark:hover:text-slate-450 select-none">
                                        🔒 Locked
                                      </span>
                                      {/* Custom absolute-positioned hover tooltip */}
                                      <div className="absolute hidden group-hover:block bg-slate-900 dark:bg-slate-950 text-white text-4xs rounded-lg px-2.5 py-1.5 -top-9 right-0 whitespace-nowrap z-50 shadow-md border border-slate-700/60 dark:border-slate-800 font-sans tracking-wide">
                                        {lockTooltipText || "Complete parent prerequisites first"}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Stage Problems checklist list block (Inner accordion layout) */}
                              {isUnlocked && isSubExpanded && (
                                <div className="px-12 py-4 bg-slate-50/40 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-2.5">
                                  {stageProblems.map((prob) => {
                                    const isSolved = solvedSet.has(prob._id.toString());
                                    const isSolving = solvingIds.has(prob._id.toString());
                                    const platformColor =
                                      prob.platform === "codeforces"
                                        ? "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20"
                                        : "text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20";

                                    return (
                                      <div
                                        key={prob._id}
                                        className={`flex items-center justify-between p-3 rounded-lg border text-2xs transition-all ${
                                          isSolved
                                            ? "bg-slate-50/30 dark:bg-slate-900/35 border-slate-100 dark:border-slate-850 opacity-60"
                                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                          <button
                                            onClick={() => !isSolved && handleMarkSolved(prob._id)}
                                            disabled={isSolved || isSolving}
                                            className={`focus:outline-none shrink-0 ${
                                              isSolved
                                                ? "text-emerald-500 cursor-default"
                                                : isSolving
                                                ? "text-indigo-600 dark:text-indigo-400 animate-spin"
                                                : "text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400"
                                            }`}
                                          >
                                            {isSolved ? (
                                              <CheckCircle2 className="w-4.5 h-4.5 fill-emerald-500/10" />
                                            ) : isSolving ? (
                                              <RefreshCw className="w-4.5 h-4.5" />
                                            ) : (
                                              <Circle className="w-4.5 h-4.5" />
                                            )}
                                          </button>

                                          <div className="flex flex-col text-left gap-0.5 min-w-0">
                                            <a
                                              href={prob.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="font-semibold text-slate-800 dark:text-slate-250 hover:text-indigo-650 dark:hover:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                                            >
                                              <span className="truncate">{prob.title}</span>
                                              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                            </a>
                                            <div className="flex items-center gap-1.5">
                                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${platformColor}`}>
                                                {prob.platform}
                                              </span>
                                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${getDifficultyColor(prob.difficulty)}`}>
                                                {prob.difficulty}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <a
                                          href={prob.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-slate-800 dark:hover:text-slate-150 font-bold uppercase tracking-wider text-4xs flex items-center gap-1 shrink-0 select-none transition-colors"
                                        >
                                          Solve
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
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
                );
              })}
            </div>

            {/* RIGHT COLUMN: sticky guide / reference rules */}
            <div className="lg:col-span-4 flex flex-col gap-4 text-left lg:sticky lg:top-20">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4 text-xs leading-normal">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-400 m-0 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <Trophy className="w-4 h-4 text-indigo-500" />
                  Mentorship Guide
                </h3>
                
                <div className="flex flex-col gap-4 mt-2">
                  <div className="p-3 bg-indigo-50/40 dark:bg-slate-950/20 border border-indigo-200/50 dark:border-slate-800 rounded-lg">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                      Unlock Threshold Rules
                    </span>
                    <p className="text-4xs text-slate-500 dark:text-slate-400 mt-1 leading-normal my-0">
                      Locked stages unlock automatically when all listed parent prerequisites achieve an average solve rate of at least <strong className="text-slate-700 dark:text-slate-300">35%</strong>.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 text-3xs text-slate-500 dark:text-slate-400 leading-normal">
                    <div className="flex items-start gap-2">
                      <div className="w-4.5 h-4.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold text-[9px] shrink-0">✓</div>
                      <p className="my-0">
                        Mark problems solved inline to dynamically update progress. Your score changes instantly inside Leaderboard rankings.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-4.5 h-4.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[9px] shrink-0">!</div>
                      <p className="my-0">
                        Connecting LeetCode and Codeforces profiles automatically fetches submissions to unlock topics in the background.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TopicExplorer;
