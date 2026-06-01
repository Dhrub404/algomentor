import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import { getDifficultyColor } from "../utils/helpers";
import { Map, Calendar, Layers, ExternalLink, CheckCircle2, Circle, AlertCircle, RefreshCw, Milestone } from "lucide-react";

const Roadmap = () => {
  const { user, progress } = useAuth();
  const [activeTab, setActiveTab] = useState("personalized"); // "personalized" or "generic"
  const [personalizedRoadmap, setPersonalizedRoadmap] = useState([]);
  const [genericRoadmap, setGenericRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [personalData, genericData] = await Promise.all([
        api.getPersonalizedRoadmap(user._id),
        api.getGenericRoadmap()
      ]);
      setPersonalizedRoadmap(personalData);
      setGenericRoadmap(genericData);
    } catch (err) {
      console.error("Failed to load roadmaps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, progress?.solvedProblems?.length]);

  const solvedSet = new Set((progress?.solvedProblems || []).map((id) => id.toString()));

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center gap-2.5">
            <Map className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            DSA Roadmap Guide
          </h1>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
            Toggle between the standard structured DSA milestones and your personalized weekly adaptive study plan.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/60 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-300/40 dark:border-slate-800/40 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab("personalized")}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-150 ${
              activeTab === "personalized"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Adaptive Roadmap
          </button>
          <button
            onClick={() => setActiveTab("generic")}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-150 ${
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
          {personalizedRoadmap.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center rounded-xl shadow-2xs">
              <p className="text-slate-400 text-sm">
                No personalized roadmap generated. Please complete onboarding and connect platform handles to begin.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {personalizedRoadmap.map((weekData) => {
                const weekSolved = weekData.problems.filter((p) => solvedSet.has(p._id.toString())).length;

                return (
                  <div
                    key={weekData.week}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs flex flex-col text-left"
                  >
                    {/* Week Header */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-slate-800 border border-indigo-200/50 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                          W{weekData.week}
                        </div>
                        <div>
                          <span className="text-4xs uppercase tracking-widest text-indigo-650 dark:text-indigo-400 font-bold">
                            Week {weekData.week} Target
                          </span>
                          <h3 className="font-bold text-base text-slate-850 dark:text-slate-200 mt-0.5 my-0 flex items-center gap-1.5 flex-wrap">
                            {weekData.subtopic}{" "}
                            <span className="text-xs font-normal text-slate-500">({weekData.topic})</span>
                          </h3>
                        </div>
                      </div>

                      {/* Right stats */}
                      <div className="flex flex-wrap items-center gap-3.5 text-4xs">
                        {weekData.status === "weakness_focus" ? (
                          <span className="uppercase font-bold px-2 py-0.5 rounded border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/10">
                            Weakness Target
                          </span>
                        ) : weekData.status === "reinforcement" ? (
                          <span className="uppercase font-bold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/10">
                            Reinforcement
                          </span>
                        ) : (
                          <span className="uppercase font-bold px-2 py-0.5 rounded border border-slate-250 dark:border-slate-750 text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800">
                            Introduction
                          </span>
                        )}

                        <span className="font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {weekSolved} / {weekData.problems.length} Solved
                        </span>
                      </div>
                    </div>

                    {/* Week Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {weekData.problems.map((problem) => {
                          const isSolved = solvedSet.has(problem._id.toString());
                          const platformColor =
                            problem.platform === "codeforces"
                              ? "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20"
                              : "text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20";

                          return (
                            <div
                              key={problem._id}
                              className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
                                isSolved
                                  ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-850 opacity-60"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={isSolved ? "text-emerald-500 animate-in fade-in" : "text-slate-400"}>
                                  {isSolved ? (
                                    <CheckCircle2 className="w-4.5 h-4.5 fill-emerald-500/10" />
                                  ) : (
                                    <Circle className="w-4.5 h-4.5" />
                                  )}
                                </div>
                                <div className="flex flex-col text-left gap-0.5">
                                  <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-2xs text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1"
                                  >
                                    {problem.title}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <span className="text-[9px] text-slate-500 font-medium uppercase font-mono">
                                    {problem.platform} &bull; {problem.difficulty}
                                  </span>
                                </div>
                              </div>

                              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* GENERIC DSA ROADMAP: Vertical Timeline style */
        <div className="relative pl-6 sm:pl-8 py-4 text-left">
          {/* Vertical timeline line */}
          <div className="absolute left-[29px] sm:left-[37px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="flex flex-col gap-8">
            {genericRoadmap.map((milestone) => (
              <div key={milestone.topic} className="relative flex gap-6 items-start">
                
                {/* Node Icon on line */}
                <div className="absolute -left-[14px] sm:-left-[22px] top-1 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center text-3xs sm:text-xs font-bold text-indigo-650 dark:text-indigo-400 z-10 shadow-sm">
                  {milestone.order}
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs ml-6 flex flex-col gap-4">
                  <div>
                    <span className="text-4xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                      Milestone {milestone.order}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1 my-0">
                      {milestone.topic}
                    </h3>
                  </div>

                  {/* Subtopics list grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {milestone.subtopics.map((sub) => (
                      <div
                        key={sub.name}
                        className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 flex flex-col gap-2 text-2xs"
                      >
                        <span className="font-semibold text-slate-850 dark:text-slate-300">{sub.name}</span>
                        <div className="flex items-center justify-between text-4xs gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.2 rounded font-semibold uppercase ${getDifficultyColor(sub.difficulty)}`}>
                            {sub.difficulty}
                          </span>
                          {sub.prerequisites && sub.prerequisites.length > 0 ? (
                            <span className="text-slate-500 font-medium truncate max-w-[100px]" title={sub.prerequisites.join(", ")}>
                              Prereq: {sub.prerequisites.join(", ")}
                            </span>
                          ) : (
                            <span className="text-indigo-600 dark:text-indigo-400/80 font-medium">Core Start</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
