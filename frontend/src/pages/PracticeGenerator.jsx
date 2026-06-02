import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import PracticeSheet from "../components/PracticeSheet";
import RevisionPracticeSheet from "../components/RevisionPracticeSheet";
import api from "../services/api";
import { CheckSquare, Info, RefreshCw, Sparkles, BookOpen, AlertCircle } from "lucide-react";

const PracticeGenerator = () => {
  const { user, progress, refetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") === "revision" ? "revision" : "daily";
  });
  const [dailyData, setDailyData] = useState({ problems: [], revisionAlerts: [] });
  const [revisionData, setRevisionData] = useState({ urgentSubtopics: [], recommendedSubtopics: [], completedProblems: [] });
  const [loading, setLoading] = useState(true);
  const [revisionLoading, setRevisionLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "revision" || tab === "daily") {
      setActiveTab(tab);
    }
  }, [window.location.search]);

  const fetchDailySheet = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getDailyPractice(user._id);
      setDailyData(data);
    } catch (err) {
      console.error("Failed to load daily sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisionSheet = async () => {
    if (!user) return;
    setRevisionLoading(true);
    try {
      const data = await api.getRevisionPractice(user._id);
      setRevisionData(data);
    } catch (err) {
      console.error("Failed to load revision sheet:", err);
    } finally {
      setRevisionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "daily") {
      fetchDailySheet();
    } else {
      fetchRevisionSheet();
    }
  }, [user, activeTab, progress?.solvedProblems?.length]);

  const handleProblemSolved = async () => {
    await refetchUser();
    await fetchDailySheet();
  };

  const handleRevisionProblemSolved = async () => {
    await refetchUser();
    await fetchRevisionSheet();
  };

  const getRevisionHeaderStats = () => {
    const totalSubtopics = (revisionData?.urgentSubtopics?.length || 0) + (revisionData?.recommendedSubtopics?.length || 0);
    const activeDaysSince = (revisionData?.urgentSubtopics || [])
      .concat(revisionData?.recommendedSubtopics || [])
      .map(s => s.daysSincePractice)
      .filter(d => d !== 999);
    const lastRevisionDays = activeDaysSince.length > 0 ? Math.min(...activeDaysSince) : null;
    const lastRevisionStr = lastRevisionDays !== null ? `${lastRevisionDays} days ago` : "Never";
    return { totalSubtopics, lastRevisionStr };
  };

  const { totalSubtopics, lastRevisionStr } = getRevisionHeaderStats();

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Practice Sheet Generator
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
            Solve your customized daily practice and revision sheets to maintain mastery across studied topics.
          </p>
        </div>
        <button
          onClick={activeTab === "daily" ? fetchDailySheet : fetchRevisionSheet}
          className="p-2 rounded-lg text-slate-450 hover:text-slate-655 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "daily"
              ? "border-indigo-650 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-450 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Daily Practice
        </button>
        <button
          onClick={() => setActiveTab("revision")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "revision"
              ? "border-indigo-650 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-450 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Revision
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {activeTab === "daily" ? (
          <>
            {/* Left: Problems Checklist */}
            <div className="lg:col-span-8 flex flex-col gap-4 text-left">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 m-0">Today's Focus Set</h3>
                  <button
                    onClick={fetchDailySheet}
                    className="p-1.5 rounded-lg text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    title="Refresh Practice Set"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
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

            {/* Right: Engine Details info */}
            <div className="lg:col-span-4 flex flex-col gap-4 text-left">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4 text-xs leading-normal">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 m-0 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                  Practice Engine Rules
                </h3>

                <div className="flex flex-col gap-4 text-slate-500 dark:text-slate-400 mt-2">
                  <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-slate-950/40 border border-indigo-200/50 dark:border-indigo-950/20">
                    <p className="font-bold text-indigo-700 dark:text-indigo-400 m-0 text-3xs uppercase tracking-wide">
                      Selection Heuristics
                    </p>
                    <p className="text-4xs text-slate-450 dark:text-slate-500 mt-1 leading-normal my-0">
                      Subtopics are prioritised using: <br />
                      <span className="font-mono text-indigo-655 dark:text-indigo-400 mt-0.5 inline-block">Score = (Weakness &times; 0.6) + (NeglectDays &times; 2)</span>
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start text-3xs">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="my-0 leading-normal">
                      Only subtopics that are both **studied** in onboarding and **unlocked** by prerequisites are selected.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start text-3xs">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="my-0 leading-normal">
                      Generates a maximum of **4-6 problems** per day to maintain healthy focus and prevent burnout.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start text-3xs">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="my-0 leading-normal">
                      Problems are selected from LeetCode or Codeforces matching your target recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left: Revision Content */}
            <div className="lg:col-span-8 flex flex-col gap-4 text-left">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 m-0">Topics Needing Revision</h3>
                  <button
                    onClick={fetchRevisionSheet}
                    className="p-1.5 rounded-lg text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    title="Refresh Revision Set"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {revisionLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                ) : !revisionData || ((revisionData.urgentSubtopics?.length || 0) === 0 && (revisionData.recommendedSubtopics?.length || 0) === 0) ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-3">
                      <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-slate-850 dark:text-slate-200 font-semibold text-sm m-0">
                      Great work! No topics need revision right now.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 my-0">
                      Keep practicing your unlocked topics to maintain progress.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850/50 p-3.5 rounded-lg flex items-center justify-between gap-4">
                      <span>You have <strong className="text-indigo-600 dark:text-indigo-400">{totalSubtopics}</strong> subtopics requiring refresh.</span>
                      <span>Last revision activity: <strong className="text-slate-700 dark:text-slate-300">{lastRevisionStr}</strong></span>
                    </div>

                    {revisionData.urgentSubtopics?.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-rose-500 flex items-center gap-1.5 m-0 mt-2">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          Urgent Revision (Not practiced for 2+ weeks)
                        </h4>
                        <RevisionPracticeSheet
                          problems={revisionData.urgentSubtopics.flatMap(s => s.problems)}
                          completedProblems={revisionData.completedProblems}
                          onProblemSolved={handleRevisionProblemSolved}
                        />
                      </div>
                    )}

                    {revisionData.recommendedSubtopics?.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5 m-0 mt-4">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Recommended Revision (Not practiced for 1-2 weeks)
                        </h4>
                        <RevisionPracticeSheet
                          problems={revisionData.recommendedSubtopics.flatMap(s => s.problems)}
                          completedProblems={revisionData.completedProblems}
                          onProblemSolved={handleRevisionProblemSolved}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Revision Engine Details info */}
            <div className="lg:col-span-4 flex flex-col gap-4 text-left">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4 text-xs leading-normal">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 m-0 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                  Revision Engine Rules
                </h3>

                <div className="flex flex-col gap-4 text-slate-500 dark:text-slate-400 mt-2">
                  <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-slate-950/40 border border-indigo-200/50 dark:border-indigo-950/20">
                    <p className="font-bold text-indigo-700 dark:text-indigo-400 m-0 text-3xs uppercase tracking-wide">
                      Neglect Decay Threshold
                    </p>
                    <p className="text-4xs text-slate-450 dark:text-slate-500 mt-1 leading-normal my-0">
                      Revision is triggered when: <br />
                      <span className="font-mono text-indigo-655 dark:text-indigo-400 mt-0.5 inline-block">lastPracticed &gt; 10 days ago</span>
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start text-3xs">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="my-0 leading-normal">
                      **Urgent Revision** is triggered at **14+ days** of neglect.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start text-3xs">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="my-0 leading-normal">
                      **Recommended Revision** is triggered at **10-14 days** of neglect.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start text-3xs">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="my-0 leading-normal">
                      Difficulty adapts based on your recent accuracy metrics on each subtopic.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeGenerator;
