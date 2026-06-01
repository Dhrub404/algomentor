import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Globe, GraduationCap, CheckSquare, Compass, ArrowRight, ShieldCheck } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [handles, setHandles] = useState({
    codeforces: "",
    leetcode: ""
  });
  const [level, setLevel] = useState("beginner");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const majorTopics = [
    { name: "Arrays", subtopics: ["Basics", "Two Pointers", "Sliding Window"], desc: "Subarrays, window sliding, pointer traversal" },
    { name: "Binary Search", subtopics: ["One-D Arrays", "On Answer"], desc: "Divide and conquer search, BS on answer space" },
    { name: "Strings", subtopics: ["Basic Operations", "Pattern Matching"], desc: "Hashing, string match, string manipulation" },
    { name: "Linked List", subtopics: ["Singly LinkedList", "Double LinkedList & Loops"], desc: "Pointers, singly/doubly LL, Floyd cycle detection" },
    { name: "Stacks/Queues", subtopics: ["Linear Structures", "Monotonic Stack"], desc: "Stack, queue, monotonic stack elements" },
    { name: "Trees", subtopics: ["Binary Tree Traversals", "BST Operations"], desc: "DFS/BFS tree traversals, search tree node mutations" },
    { name: "Graphs", subtopics: ["DFS/BFS Basics", "Shortest Paths"], desc: "Traversal, Dijkstra shortest paths, graph modelling" },
    { name: "DP", subtopics: ["One-D DP", "Grid DP"], desc: "Memoization, tabulation, grid-based optimal subpaths" }
  ];

  const handleToggleTopic = (topicName) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    // Map selected major topics to their subtopics
    let studiedSubtopics = [];
    selectedTopics.forEach((topicName) => {
      const topicObj = majorTopics.find((t) => t.name === topicName);
      if (topicObj) {
        studiedSubtopics = studiedSubtopics.concat(topicObj.subtopics);
      }
    });

    try {
      await updateProfile({
        currentLevel: level,
        codeforcesHandle: handles.codeforces.trim(),
        leetcodeHandle: handles.leetcode.trim(),
        studiedTopics: studiedSubtopics
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding failed:", err);
      alert(err || "Onboarding failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Step Indicators */}
      <div className="max-w-2xl w-full flex items-center justify-between mb-8 px-4 text-xs font-semibold">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  step === num
                    ? "bg-indigo-650 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-400 text-white"
                    : step > num
                    ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                }`}
              >
                {num}
              </div>
              <span className={`text-[11px] font-semibold hidden sm:inline ${step === num ? "text-slate-900 dark:text-slate-100 font-bold" : "text-slate-400 dark:text-slate-500"}`}>
                {num === 1 ? "Handles Link" : num === 2 ? "Skill Level" : "DSA Scope"}
              </span>
            </div>
            {num < 3 && <div className={`flex-1 h-px mx-4 ${step > num ? "bg-indigo-500/50" : "bg-slate-200 dark:bg-slate-800"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Card container */}
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm text-left">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Globe className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              Link Competitive Profiles
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-450 mb-6 leading-relaxed">
              Connect LeetCode and Codeforces to sync progress and analyze subtopic details. (You can skip these and link them later in settings).
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tourist"
                  value={handles.codeforces}
                  onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg py-2.5 px-4 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-amber-500">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. lc_master"
                  value={handles.leetcode}
                  onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg py-2.5 px-4 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <GraduationCap className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              Select Target Skill Level
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-450 mb-6 leading-relaxed">
              Choose your current expertise. This optimizes problem recommendation difficulty recommendation parameters.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "beginner", title: "Beginner", desc: "Just starting DSA. Target: Easy problems (LeetCode Easy, CF Division 3 A/B)." },
                { key: "intermediate", title: "Intermediate", desc: "Know basic topics. Target: Medium problems (LeetCode Medium, CF B/C)." },
                { key: "advanced", title: "Advanced", desc: "Fluent in algorithms. Target: Hard problems (LeetCode Hard, CF C/D/E)." }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLevel(item.key)}
                  className={`p-5 rounded-lg border text-left flex flex-col gap-2.5 transition-all duration-150 focus:outline-none ${
                    level === item.key
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 shadow-2xs"
                      : "bg-slate-50/40 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  <span className={`font-bold text-sm ${level === item.key ? "text-indigo-600 dark:text-indigo-450 font-bold" : "text-slate-800 dark:text-slate-300"}`}>
                    {item.title}
                  </span>
                  <span className="text-4xs text-slate-500 dark:text-slate-400 leading-normal">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Compass className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              Choose Studied DSA Topics
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-450 mb-6 leading-relaxed">
              Check the topics you've already studied. AlgoMentor will analyze weaknesses and generate daily sheets ONLY for unlocked studied subtopics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {majorTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.name);
                return (
                  <button
                    key={topic.name}
                    type="button"
                    onClick={() => handleToggleTopic(topic.name)}
                    className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-all duration-150 focus:outline-none ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 shadow-2xs"
                        : "bg-slate-50/40 dark:bg-slate-950/20 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                    <div>
                      <span className={`font-semibold text-xs ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-300"}`}>
                        {topic.name}
                      </span>
                      <p className="text-4xs text-slate-500 dark:text-slate-400 leading-normal mt-1">{topic.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 mt-8 pt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none focus:outline-none"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors text-xs font-semibold flex items-center gap-1.5 focus:outline-none"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting || selectedTopics.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 focus:outline-none"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? "Finishing..." : "Finish Onboarding"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
