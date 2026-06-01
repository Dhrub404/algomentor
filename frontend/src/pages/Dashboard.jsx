import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import WeaknessChart from "../components/WeaknessChart";
import api from "../services/api";
import { getDifficultyColor } from "../utils/helpers";
import {
  Compass,
  Trophy,
  Activity,
  AlertTriangle,
  RefreshCw,
  Flame,
  Award,
  Zap,
  X,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const { user, progress, performances, refetchUser, connectHandles } = useAuth();
  const [dailyData, setDailyData] = useState({ problems: [], revisionAlerts: [] });
  const [weaknessDiagnostics, setWeaknessDiagnostics] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingWeakness, setLoadingWeakness] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alertsDismissed, setAlertsDismissed] = useState(false);
  const [completingIds, setCompletingIds] = useState(new Set());

  const fetchDailySheet = async () => {
    if (!user) return;
    setLoadingDaily(true);
    try {
      const data = await api.getDailyPractice(user._id);
      setDailyData(data);
    } catch (err) {
      console.error("Failed to load daily practice sheet:", err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const fetchWeaknessDiagnostics = async () => {
    if (!user) return;
    setLoadingWeakness(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/dashboard/weakness/${user._id}`);
      setWeaknessDiagnostics(res.data || []);
    } catch (err) {
      console.error("Failed to load weakness diagnostics:", err);
    } finally {
      setLoadingWeakness(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchDailySheet(), fetchWeaknessDiagnostics()]);
  };

  useEffect(() => {
    fetchAllData();
  }, [user, progress?.solvedProblems?.length]);

  const hasAnyHandle = !!(
    user?.leetcodeHandle ||
    user?.codeforcesHandle ||
    user?.codechefHandle ||
    user?.gfgHandle ||
    user?.hackerrankHandle ||
    user?.codingNinjasHandle ||
    user?.hackerEarthHandle
  );

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await connectHandles({
        leetcodeHandle: user.leetcodeHandle,
        codeforcesHandle: user.codeforcesHandle,
        codechefHandle: user.codechefHandle,
        gfgHandle: user.gfgHandle,
        hackerrankHandle: user.hackerrankHandle,
        codingNinjasHandle: user.codingNinjasHandle,
        hackerEarthHandle: user.hackerEarthHandle
      });
      await fetchAllData();
    } catch (err) {
      console.error("Sync error:", err);
      alert(err || "Failed to sync platform handles.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCompleteProblem = async (problemId) => {
    if (completingIds.has(problemId)) return;

    setCompletingIds((prev) => {
      const next = new Set(prev);
      next.add(problemId);
      return next;
    });

    try {
      // POST request to complete problem
      await axios.post("http://localhost:5000/api/practice/complete", { problemId });
      await refetchUser();
      await fetchAllData();
    } catch (err) {
      console.error("Failed to mark problem completed:", err);
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  };

  // Calculations for stats
  const solvedCount = progress?.solvedProblems?.length || 0;
  const unlockedCount = progress?.unlockedSubtopics?.length || 0;
  const studiedCount = user?.studiedTopics?.length || 0;

  // Streak calculation
  let streakCount = 0;
  if (progress && progress.lastActivityDate) {
    const diffTime = Math.abs(Date.now() - new Date(progress.lastActivityDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      streakCount = progress.solvedProblems ? (progress.solvedProblems.length % 7) + 1 : 1;
    }
  }

  // Count strong areas (masteryScore >= 70) and weak ones (masteryScore < 40)
  const strongAreas = (performances || []).filter((p) => p.masteryScore >= 70);
  const weakAreas = (performances || []).filter((p) => p.masteryScore < 40 && p.totalAttempted > 0);

  // Get progress bar color based on weakness Score (Part 4)
  const getWeaknessBarColor = (weaknessScore) => {
    if (weaknessScore > 65) return "bg-red-500";
    if (weaknessScore >= 40) return "bg-amber-500";
    return "bg-indigo-650";
  };

  // Get progress bar color for Weak Area Mastery status (Part 6)
  const getMasteryBarColor = (masteryScore) => {
    if (masteryScore < 35) return "bg-red-500";
    return "bg-amber-500";
  };

  // Format date helper
  const getFormattedDate = () => {
    return new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Helper for slot reason badges
  const getReasonBadge = (reason) => {
    switch (reason) {
      case "weakness":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            Weak Area
          </span>
        );
      case "revision":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Revision Due
          </span>
        );
      case "current":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Current Topic
          </span>
        );
      case "bonus":
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Practice
          </span>
        );
    }
  };

  const solvedSet = new Set((progress?.solvedProblems || []).map((id) => id.toString()));

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      
      {/* Upper Panel: Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.username}</span>
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 my-0">
            Monitor CP performance metrics, review decay logs, and complete your personalized practice sheet.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing || !hasAnyHandle}
          className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg shadow-sm transition-colors text-xs font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Handles"}
        </button>
      </div>

      {/* Revision Alerts Banner (Dismissible) */}
      {!alertsDismissed && dailyData.revisionAlerts && dailyData.revisionAlerts.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-650 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-left">
              <span className="font-bold">Decay Alert:</span> You have {dailyData.revisionAlerts.length} subtopics requiring revision. Neglecting these areas for over 14 days causes mastery decay.
              <div className="flex gap-2.5 mt-2 flex-wrap">
                {dailyData.revisionAlerts.slice(0, 3).map((a) => (
                  <span key={a.subtopic} className="px-2 py-0.5 rounded bg-amber-100/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/45 dark:border-amber-900/10 font-mono text-[9px] font-bold">
                    {a.subtopic}
                  </span>
                ))}
                {dailyData.revisionAlerts.length > 3 && (
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">+{dailyData.revisionAlerts.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setAlertsDismissed(true)}
            className="p-0.5 text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-300 focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Solved Count", value: solvedCount, icon: Trophy, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/10" },
          { label: "Unlocked Scope", value: `${unlockedCount} / ${studiedCount || "0"}`, icon: Compass, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/10" },
          { label: "Streak Count", value: `${streakCount} Days`, icon: Flame, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/10" },
          { label: "Strong Areas", value: `${strongAreas.length} Skills`, icon: Award, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/10" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{card.label}</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">{card.value}</span>
              </div>
              <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color} shrink-0`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Container Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Weakness Analytics & Mastery Progress */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Subtopic Weakness Diagnostics Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-5 shadow-3xs text-left">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                Subtopic Weakness Diagnostics
              </h3>
              <p className="text-5xs text-slate-450 dark:text-slate-500 mt-1 my-0">
                Aggregated metric computed from wrong platform submissions and topic neglect.
              </p>
            </div>
            
            {loadingWeakness ? (
              <div className="py-12 flex justify-center">
                <RefreshCw className="w-6 h-6 text-indigo-650 animate-spin" />
              </div>
            ) : weaknessDiagnostics.length > 0 ? (
              <div className="flex flex-col gap-4">
                {weaknessDiagnostics.slice(0, 5).map((item) => {
                  const practicedText = item.lastPracticed
                    ? `Last practiced: ${Math.ceil((Date.now() - new Date(item.lastPracticed).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                    : "Never practiced";

                  return (
                    <div key={item.subtopic} className="flex flex-col gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.subtopic}</span>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border border-slate-200/50 dark:border-slate-750">
                            {item.topic}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400 dark:text-slate-500 text-2xs">{item.masteryScore}% Mastery</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-2xs">{item.weaknessScore}% Weakness</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getWeaknessBarColor(item.weaknessScore)}`}
                          style={{ width: `${item.weaknessScore}%` }}
                        />
                      </div>

                      {/* Detail row */}
                      <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {practicedText}
                        </span>

                        {item.revisionNeeded && (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
                            Revision Due
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-450 dark:text-slate-500 py-4 text-center">
                Strong performance across all studied topics! Keep solving to unlock new areas.
              </p>
            )}
          </div>

          {/* Weakness Areas Progress List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs text-left">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                Weak Area Mastery Status
              </h3>
              <p className="text-5xs text-slate-450 dark:text-slate-500 mt-1 my-0">
                Subtopics requiring solving focus to reach the threshold limit.
              </p>
            </div>

            {weakAreas.length > 0 ? (
              <div className="flex flex-col gap-4">
                {weakAreas.slice(0, 4).map((area) => {
                  const remaining = 40 - area.masteryScore;
                  return (
                    <div key={area.subtopic} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-2xs">
                        <span className="font-bold text-slate-850 dark:text-slate-100">{area.subtopic}</span>
                        <span className="font-mono font-bold text-red-500">{area.masteryScore}% Mastery</span>
                      </div>
                      
                      {/* Progress bar track with 40% vertical tick boundary line */}
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-850 rounded-full relative overflow-hidden">
                        {/* 40% Threshold Marker Line */}
                        <div
                          style={{ left: "40%" }}
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10"
                          title="40% Mastery Threshold Boundary"
                        />
                        {/* Actual mastery fill */}
                        <div
                          className={`h-full transition-all duration-300 ${getMasteryBarColor(area.masteryScore)}`}
                          style={{ width: `${area.masteryScore}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-450 dark:text-slate-500 italic mt-0.5">
                        Need <strong className="text-red-500">{remaining}%</strong> more to reach threshold
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-450 dark:text-slate-500 py-2">
                Great job! No subtopics fall below the weak threshold boundaries.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Daily Practice Set */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs flex-grow text-left">
            
            {/* Practice set Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                  Daily Practice Set
                </h3>
              </div>
              
              {!loadingDaily && dailyData && dailyData.problems && (
                <span className="text-[9px] font-mono font-bold tracking-wider bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-slate-850 px-2 py-0.5 rounded-md">
                  {(dailyData.problems || []).filter(p => p?._id && solvedSet.has(p._id.toString())).length} / {dailyData.problems.length} Done
                </span>
              )}
            </div>

            {loadingDaily ? (
              <div className="flex-grow flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 text-indigo-650 animate-spin" />
              </div>
            ) : dailyData.problems && dailyData.problems.length > 0 ? (
              <div className="flex flex-col gap-4">
                
                <div className="text-[10px] font-semibold text-slate-450 dark:text-slate-550 block italic">
                  Today's Practice &bull; {getFormattedDate()}
                </div>

                <div className="flex flex-col gap-3">
                  {dailyData.problems.map((problem) => {
                    const isSolved = problem?._id ? solvedSet.has(problem._id.toString()) : false;
                    const isCompleting = problem?._id ? completingIds.has(problem._id.toString()) : false;

                    return (
                      <div
                        key={problem._id}
                        className={`p-3 border.5 rounded-xl flex items-start gap-3 transition-all relative overflow-hidden ${
                          isSolved
                            ? "bg-slate-50/50 dark:bg-slate-900/35 border-slate-100 dark:border-slate-850 opacity-60"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 shadow-2xs"
                        }`}
                      >
                        {/* Checkbox button */}
                        <button
                          disabled={isSolved || isCompleting}
                          onClick={() => handleCompleteProblem(problem._id)}
                          className={`mt-0.5 shrink-0 focus:outline-none transition-colors ${
                            isSolved
                              ? "text-emerald-500 cursor-default"
                              : isCompleting
                              ? "text-indigo-600 dark:text-indigo-400 animate-spin"
                              : "text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 cursor-pointer"
                          }`}
                        >
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
                          ) : isCompleting ? (
                            <RefreshCw className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          {/* Top Badges row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {getReasonBadge(problem.reason)}
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-750">
                              {problem.subtopic}
                            </span>
                          </div>

                          {/* Problem Title link */}
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-xs text-slate-850 dark:text-slate-200 hover:text-indigo-650 dark:hover:text-indigo-400 hover:underline flex items-center gap-1 leading-snug break-words mt-1 text-left"
                          >
                            {problem.title}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>

                          {/* Platform + Diff row */}
                          <div className="flex items-center gap-2 mt-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            <span>{problem.platform}</span>
                            <span>&bull;</span>
                            <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</span>
                          </div>
                        </div>

                        {/* Solve Button link */}
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-slate-800 text-indigo-650 dark:text-indigo-300 hover:bg-indigo-650 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-100 dark:border-slate-700 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 self-center"
                        >
                          Solve
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  No practice problems generated. Refresh or ensure you have selected studied topics in onboarding!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
