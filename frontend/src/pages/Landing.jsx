import React from "react";
import { Link } from "react-router-dom";
import { Compass, Trophy, Zap, Code2, LineChart, ShieldCheck } from "lucide-react";

const Landing = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Hero Section */}
      <div className="max-w-4xl w-full px-6 py-20 text-center flex flex-col items-center gap-6 relative z-10">
        {/* Banner label */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-4xs font-bold uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5 fill-indigo-600/10" />
          Adaptive CP Learning Portal
        </span>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight my-2">
          Master Competitive Programming <br />
          with <span className="text-indigo-600 dark:text-indigo-400">Adaptive DSA Mentorship</span>
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed my-0">
          AlgoMentor hooks to your Codeforces and LeetCode accounts, runs diagnostic analysis on subtopic accuracy, isolates weaknesses, unlocks paths, and crafts daily custom practice sheets.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 font-semibold">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors text-center"
          >
            Start For Free
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold shadow-2xs transition-colors text-center"
          >
            Sign In Account
          </Link>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-6xl w-full px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800 mt-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl text-left shadow-3xs">
          <div className="h-10 w-10 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 rounded-lg flex items-center justify-center mb-4">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-2">Connected Platforms</h3>
          <p className="text-4xs text-slate-500 dark:text-slate-400 leading-normal my-0">
            Input handles for Codeforces and LeetCode to aggregate submissions and ratings in real-time.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl text-left shadow-3xs">
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
            <LineChart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-2">Diagnostic Analytics</h3>
          <p className="text-4xs text-slate-500 dark:text-slate-400 leading-normal my-0">
            Visual bar charts map subtopic weaknesses calculated from attempts, accuracies, and inactivity.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl text-left shadow-3xs">
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-2">Dynamic Unlock Engine</h3>
          <p className="text-4xs text-slate-500 dark:text-slate-400 leading-normal my-0">
            Topics unlock only when prerequisite solve rates cross 35%, ensuring foundations are solid.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
