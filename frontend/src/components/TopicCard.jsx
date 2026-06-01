import React from "react";
import MasteryBar from "./MasteryBar";
import { Lock, Unlock, HelpCircle, AlertCircle } from "lucide-react";
import { getDifficultyColor } from "../utils/helpers";

const TopicCard = ({ topic, progress, performances }) => {
  const unlockedSubtopics = progress?.unlockedSubtopics || [];
  const completedSubtopics = progress?.completedSubtopics || [];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-darkBorder/40 shadow-xl flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-darkBorder/30 pb-3">
        <h3 className="font-space font-bold text-lg text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded bg-indigoAccent inline-block" />
          {topic.name}
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {topic.subtopics.length} subtopics
        </span>
      </div>

      {/* Subtopics List */}
      <div className="flex flex-col gap-4">
        {topic.subtopics.map((subtopic) => {
          const isUnlocked = unlockedSubtopics.includes(subtopic.name);
          const perf = performances.find((p) => p.subtopic === subtopic.name);
          const mastery = perf?.masteryScore || 0;

          return (
            <div
              key={subtopic.name}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isUnlocked
                  ? "bg-slate-900/40 border-darkBorder/40 hover:border-slate-700/60"
                  : "bg-slate-950/60 border-slate-900/60 opacity-60 hover:opacity-75"
              }`}
            >
              {/* Top Row: Unlocked info & badges */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <Unlock className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                  <span className={`font-semibold text-sm ${isUnlocked ? "text-slate-200" : "text-slate-500"}`}>
                    {subtopic.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Difficulty */}
                  <span className={`text-3xs uppercase tracking-wider font-bold px-2 py-0.5 rounded ${getDifficultyColor(subtopic.difficulty)}`}>
                    {subtopic.difficulty}
                  </span>
                </div>
              </div>

              {/* Progress/Mastery or Lock requirements */}
              {isUnlocked ? (
                <div>
                  <div className="flex justify-between items-center text-3xs text-slate-400 mb-1">
                    <span>Mastery Progress</span>
                    {perf ? (
                      <span>{perf.totalSolved} solved / {perf.totalAttempted} attempted</span>
                    ) : (
                      <span>Not started yet</span>
                    )}
                  </div>
                  <MasteryBar value={mastery} size="sm" />
                </div>
              ) : (
                <div className="text-3xs text-slate-500 flex items-center gap-1.5 py-1.5 px-2.5 rounded bg-slate-900/20 border border-slate-800/35">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                  <span>
                    Prerequisites needed:{" "}
                    <span className="font-semibold text-slate-400">
                      {subtopic.prerequisites.join(", ")}
                    </span>{" "}
                    (Requires solve rate &ge; 35% or mastery &ge; 35)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicCard;
