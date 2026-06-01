import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import {
  Compass, RefreshCw, Lock, Unlock, AlertCircle, CheckCircle, ExternalLink,
  ChevronDown, ChevronRight, BookOpen, CheckCircle2, Circle
} from "lucide-react";
import { getDifficultyColor } from "../utils/helpers";

const TopicExplorer = () => {
  const { progress, performances, refetchUser } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [selectedTopicName, setSelectedTopicName] = useState("");
  const [solvingIds, setSolvingIds] = useState(new Set());

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await api.getAllTopics();
      setTopics(data);

      // Expand the first topic by default
      if (data.length > 0) {
        setExpandedTopics({ [data[0]._id]: true });
        if (data[0].subtopics.length > 0) {
          setSelectedSubtopic(data[0].subtopics[0]);
          setSelectedTopicName(data[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to load topics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const toggleTopicExpand = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleSelectSubtopic = (sub, parentName) => {
    setSelectedSubtopic(sub);
    setSelectedTopicName(parentName);
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
      // Reload topics to refresh problem checklists and counts
      const updatedTopics = await api.getAllTopics();
      setTopics(updatedTopics);
      
      // Update selected subtopic pointer to reflect populated list changes
      if (selectedSubtopic) {
        let foundSub = null;
        for (let t of updatedTopics) {
          let s = t.subtopics.find(x => x.name === selectedSubtopic.name);
          if (s) {
            foundSub = s;
            break;
          }
        }
        if (foundSub) {
          setSelectedSubtopic(foundSub);
        }
      }
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

  const unlockedSubtopics = progress?.unlockedSubtopics || [];
  const solvedSet = new Set((progress?.solvedProblems || []).map((id) => id.toString()));

  const getSubtopicProgressColor = (mastery, isUnlocked) => {
    if (!isUnlocked) return "bg-slate-300 dark:bg-slate-700";
    if (mastery < 40) return "bg-amber-500";
    if (mastery >= 80) return "bg-emerald-500";
    return "bg-indigo-600 dark:bg-indigo-400";
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Topic accordion list */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {topics.map((topic) => {
              const isExpanded = !!expandedTopics[topic._id];
              return (
                <div
                  key={topic._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs"
                >
                  {/* Topic Header Toggle */}
                  <button
                    onClick={() => toggleTopicExpand(topic._id)}
                    className="w-full px-5 py-4 flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 border-b border-slate-100 dark:border-slate-850 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{topic.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-5xs uppercase tracking-wider text-slate-450 dark:text-slate-505 font-bold">
                        {topic.subtopics.length} items
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Subtopics Accordion Content */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                      {topic.subtopics.map((sub) => {
                        const isUnlocked = unlockedSubtopics.includes(sub.name);
                        const isSelected = selectedSubtopic?.name === sub.name;
                        const perf = performances.find((p) => p.subtopic === sub.name);
                        const mastery = perf?.masteryScore || 0;

                        return (
                          <button
                            key={sub.name}
                            onClick={() => handleSelectSubtopic(sub, topic.name)}
                            className={`w-full px-5 py-3.5 flex flex-col gap-2 transition-colors text-left focus:outline-none ${
                              isSelected
                                ? "bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-650"
                                : "hover:bg-slate-50/50 dark:hover:bg-slate-850/20"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 truncate">
                                {isUnlocked ? (
                                  <Unlock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                                )}
                                <span className={`font-semibold text-xs truncate ${isUnlocked ? "text-slate-850 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
                                  {sub.name}
                                </span>
                              </div>
                              <span className={`text-5xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getDifficultyColor(sub.difficulty)} shrink-0`}>
                                {sub.difficulty}
                              </span>
                            </div>

                            {/* Thin Progress Bar below name */}
                            <div className="w-full h-1.5 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getSubtopicProgressColor(mastery, isUnlocked)}`}
                                style={{ width: `${isUnlocked ? Math.max(8, mastery) : 0}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT PANEL: Subtopic Detail Inspector */}
          <div className="lg:col-span-7">
            {selectedSubtopic ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-6 shadow-2xs text-left">
                
                {/* Detail Header */}
                <div className="border-b border-slate-100 dark:border-slate-850 pb-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-4xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                      {selectedTopicName}
                    </span>
                    <span className={`text-4xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${
                      unlockedSubtopics.includes(selectedSubtopic.name)
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20"
                        : "text-slate-450 dark:text-slate-505 border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-850/50"
                    }`}>
                      {unlockedSubtopics.includes(selectedSubtopic.name) ? "Unlocked" : "Locked"}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white my-0">
                    {selectedSubtopic.name}
                  </h2>
                </div>

                {/* Prerequisites Warning Block */}
                {!unlockedSubtopics.includes(selectedSubtopic.name) ? (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/20 flex gap-2.5 text-xs text-amber-800 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Subtopic Locked:</span> Prerequisite subtopics must meet the unlock criteria first:
                      <div className="flex gap-2 mt-2 flex-wrap font-semibold">
                        {selectedSubtopic.prerequisites.map((p) => (
                          <span key={p} className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/10 text-amber-700 dark:text-amber-400 text-4xs">
                            {p}
                          </span>
                        ))}
                      </div>
                      <p className="text-4xs text-slate-500 mt-2 leading-relaxed my-0">
                        Requires an average solved rate &ge; 35% or mastery score &ge; 35 in parent nodes to trigger progression checks.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Unlocked stats */}
                    <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
                      {[
                        {
                          label: "Mastery Score",
                          value: `${performances.find((p) => p.subtopic === selectedSubtopic.name)?.masteryScore || 0}%`,
                          desc: "Inverse weakness score"
                        },
                        {
                          label: "Problems Solved",
                          value: `${performances.find((p) => p.subtopic === selectedSubtopic.name)?.totalSolved || 0}`,
                          desc: "Solved in taxonomy"
                        },
                        {
                          label: "Platform Accuracy",
                          value: `${performances.find((p) => p.subtopic === selectedSubtopic.name)?.accuracy || 0}%`,
                          desc: "Correct ratio"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <span className="text-5xs uppercase tracking-wider text-slate-400 font-semibold">{item.label}</span>
                          <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{item.value}</span>
                          <span className="text-5xs text-slate-450 dark:text-slate-505 mt-0.5">{item.desc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mapped problems list */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                        Subtopic Problems Checklist
                      </h3>

                      <div className="flex flex-col gap-3">
                        {selectedSubtopic.problems && selectedSubtopic.problems.length > 0 ? (
                          selectedSubtopic.problems.map((prob) => {
                            const isSolved = solvedSet.has(prob._id.toString());
                            const isSolving = solvingIds.has(prob._id.toString());
                            const platformColor =
                              prob.platform === "codeforces"
                                ? "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20"
                                : "text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20";

                            return (
                              <div
                                key={prob._id}
                                className={`border rounded-lg p-3.5 flex items-center justify-between gap-4 transition-all ${
                                  isSolved
                                    ? "border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 opacity-70"
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => !isSolved && handleMarkSolved(prob._id)}
                                    disabled={isSolved || isSolving}
                                    className={`transition-colors shrink-0 focus:outline-none ${
                                      isSolved
                                        ? "text-emerald-500 cursor-default"
                                        : isSolving
                                        ? "text-indigo-650 dark:text-indigo-400 animate-spin"
                                        : "text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400"
                                    }`}
                                  >
                                    {isSolved ? (
                                      <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
                                    ) : isSolving ? (
                                      <RefreshCw className="w-5 h-5" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>

                                  <div className="flex flex-col text-left gap-0.5">
                                    <a
                                      href={prob.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold text-2xs text-slate-800 dark:text-slate-200 hover:text-indigo-650 dark:hover:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                      {prob.title}
                                      <ExternalLink className="w-3.5 h-3.5" />
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
                                  className="px-3 py-1.5 rounded-lg border border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-4xs font-bold uppercase tracking-wider flex items-center gap-1"
                                >
                                  Solve
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/20 dark:bg-slate-900/10">
                            No problems mapped to this subtopic directory yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

              </div>
            ) : (
              <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 p-24 text-center text-slate-400 dark:text-slate-500 shadow-2xs">
                <Compass className="w-10 h-10 mx-auto mb-2 text-slate-350 dark:text-slate-700" />
                <p className="text-xs font-semibold">Select a subtopic from the menu checklist on the left to inspect its structure, prerequisites, and problems.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default TopicExplorer;
