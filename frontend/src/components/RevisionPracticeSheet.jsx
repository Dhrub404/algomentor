import React, { useState } from "react";
import { ExternalLink, CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { getDifficultyColor } from "../utils/helpers";
import api from "../services/api";

const RevisionPracticeSheet = ({ problems, completedProblems = [], onProblemSolved }) => {
  const [solvingIds, setSolvingIds] = useState(new Set());

  const handleMarkSolved = async (problemId) => {
    if (solvingIds.has(problemId)) return;
    
    setSolvingIds((prev) => {
      const next = new Set(prev);
      next.add(problemId);
      return next;
    });

    try {
      await api.markRevisionProblemSolved(problemId);
      if (onProblemSolved) {
        onProblemSolved(problemId);
      }
    } catch (err) {
      console.error("Failed to mark problem solved:", err);
      alert(err.message || "An error occurred");
    } finally {
      setSolvingIds((prev) => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  };

  const solvedSet = new Set(completedProblems.map((id) => id.toString()));

  if (!problems || problems.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center shadow-3xs">
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          No revision problems in this category!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {problems.map((problem) => {
        const isSolved = solvedSet.has(problem._id.toString());
        const isSolving = solvingIds.has(problem._id.toString());
        const platformColor =
          problem.platform === "codeforces"
            ? "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20"
            : "text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20";

        return (
          <div
            key={problem._id}
            className={`bg-white dark:bg-slate-900 border rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 ${
              isSolved 
                ? "border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 opacity-60" 
                : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 shadow-2xs"
            }`}
          >
            {/* Left: Checkbox & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => !isSolved && handleMarkSolved(problem._id)}
                disabled={isSolved || isSolving}
                className={`transition-colors shrink-0 focus:outline-none ${
                  isSolved
                    ? "text-emerald-500 cursor-default"
                    : isSolving
                    ? "text-indigo-600 dark:text-indigo-400 animate-spin"
                    : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {isSolved ? (
                  <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
                ) : isSolving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sm text-slate-850 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {problem.title}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <span className={`text-4xs uppercase font-semibold px-2 py-0.5 rounded border ${platformColor}`}>
                    {problem.platform}
                  </span>

                  <span className={`text-4xs uppercase font-semibold px-2 py-0.5 rounded ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-4xs text-slate-500 dark:text-slate-400">
                    {problem.topic} &bull; {problem.subtopic}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div>
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200/40 dark:border-slate-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
              >
                Solve
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RevisionPracticeSheet;
