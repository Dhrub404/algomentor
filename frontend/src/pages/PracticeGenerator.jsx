import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import PracticeSheet from "../components/PracticeSheet";
import api from "../services/api";
import { CheckSquare, Info, RefreshCw, Sparkles } from "lucide-react";

const PracticeGenerator = () => {
  const { user, progress, refetchUser } = useAuth();
  const [dailyData, setDailyData] = useState({ problems: [], revisionAlerts: [] });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDailySheet();
  }, [user, progress?.solvedProblems?.length]);

  const handleProblemSolved = async () => {
    await refetchUser();
    await fetchDailySheet();
  };

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
            Solve your customized daily practice sheet to trigger dynamic subtopic unlock calculations.
          </p>
        </div>
        <button
          onClick={fetchDailySheet}
          className="p-2 rounded-lg text-slate-450 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
      </div>
    </div>
  );
};

export default PracticeGenerator;
