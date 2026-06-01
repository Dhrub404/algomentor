import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import WeaknessChart from "../components/WeaknessChart";
import PracticeSheet from "../components/PracticeSheet";
import api from "../services/api";
import {
  Compass, Trophy, Activity, AlertTriangle, RefreshCw, Flame, Award, Zap, X
} from "lucide-react";

const Dashboard = () => {
  const { user, progress, performances, refetchUser, connectHandles } = useAuth();
  const [dailyData, setDailyData] = useState({ problems: [], revisionAlerts: [] });
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alertsDismissed, setAlertsDismissed] = useState(false);

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

  useEffect(() => {
    fetchDailySheet();
  }, [user, progress?.solvedProblems?.length]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await connectHandles(user.codeforcesHandle, user.leetcodeHandle);
      await fetchDailySheet();
    } catch (err) {
      console.error("Sync error:", err);
      alert(err || "Failed to sync platform handles.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProblemSolved = async () => {
    await refetchUser();
    await fetchDailySheet();
  };

  // Calculations for stats
  const solvedCount = progress?.solvedProblems?.length || 0;
  const unlockedCount = progress?.unlockedSubtopics?.length || 0;
  const studiedCount = user?.studiedTopics?.length || 0;

  // Streak
  let streakCount = 0;
  if (progress && progress.lastActivityDate) {
    const diffTime = Math.abs(Date.now() - new Date(progress.lastActivityDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      streakCount = progress.solvedProblems ? (progress.solvedProblems.length % 7) + 1 : 1;
    }
  }

  // Count strong areas (masteryScore >= 70) and weak ones (masteryScore < 40)
  const strongAreas = performances.filter((p) => p.masteryScore >= 70);
  const weakAreas = performances.filter((p) => p.masteryScore < 40 && p.totalAttempted > 0);

  const getProgressBarColor = (score) => {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      
      {/* Upper Panel: Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.username}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            Linked handles:{" "}
            {user?.codeforcesHandle && (
              <span className="text-rose-600 dark:text-rose-400 font-mono font-semibold mr-3">CF: {user.codeforcesHandle}</span>
            )}
            {user?.leetcodeHandle && (
              <span className="text-amber-600 dark:text-amber-500 font-mono font-semibold">LC: {user.leetcodeHandle}</span>
            )}
            {!user?.codeforcesHandle && !user?.leetcodeHandle && (
              <span className="text-slate-500 font-medium">None linked</span>
            )}
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing || (!user?.codeforcesHandle && !user?.leetcodeHandle)}
          className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Handles"}
        </button>
      </div>

      {/* Revision Alerts Banner (Dismissible) */}
      {!alertsDismissed && dailyData.revisionAlerts && dailyData.revisionAlerts.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-left">
              <span className="font-bold">Decay Alert:</span> You have {dailyData.revisionAlerts.length} subtopics requiring revision. Neglecting these areas for over 14 days causes mastery decay.
              <div className="flex gap-2.5 mt-2 flex-wrap">
                {dailyData.revisionAlerts.slice(0, 3).map((a) => (
                  <span key={a.subtopic} className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/10 font-medium text-4xs">
                    {a.subtopic}
                  </span>
                ))}
                {dailyData.revisionAlerts.length > 3 && (
                  <span className="text-4xs text-slate-500 font-medium mt-0.5">+{dailyData.revisionAlerts.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setAlertsDismissed(true)}
            className="p-0.5 text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-300 focus:outline-none"
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
          { label: "Mastered Areas", value: `${strongAreas.length} Skills`, icon: Award, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/10" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex flex-col text-left">
                <span className="text-5xs uppercase tracking-wider text-slate-400 font-semibold">{card.label}</span>
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
          {/* Weakness chart card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs">
            <div className="text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                Subtopic Weakness Diagnostics
              </h3>
              <p className="text-5xs text-slate-450 dark:text-slate-500 mt-1 my-0">
                Aggregated metric computed from wrong platform submissions and topic neglect.
              </p>
            </div>
            
            <WeaknessChart performances={performances} />
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
              <div className="flex flex-col gap-3.5">
                {weakAreas.slice(0, 4).map((area) => (
                  <div key={area.subtopic} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{area.subtopic}</span>
                      <span className="font-semibold text-red-500">{area.masteryScore}% Mastery</span>
                    </div>
                    {/* Progress bar fill */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressBarColor(area.masteryScore)}`}
                        style={{ width: `${area.masteryScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">
                Great job! No subtopics fall below the weak threshold boundaries.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Daily Practice Set */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs flex-grow text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                  Daily Practice Set
                </h3>
              </div>
              <span className="text-5xs uppercase tracking-wider font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                Daily Focus
              </span>
            </div>

            {loadingDaily ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
            ) : (
              <PracticeSheet
                problems={dailyData.problems}
                solvedProblems={progress?.solvedProblems}
                onProblemSolved={handleProblemSolved}
              />
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
