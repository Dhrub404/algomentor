import React, { useState, useEffect } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { Trophy, Flame, RefreshCw, Star, Search, ShieldAlert } from "lucide-react";

const Leaderboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("score"); // "score" | "solvedCount" | "streak"
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard();
      // Apply initial sort by score descending
      const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy]);
      setUsers(sorted);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleSort = (field) => {
    setSortBy(field);
    const sorted = [...users].sort((a, b) => b[field] - a[field]);
    setUsers(sorted);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Global Hall of Fame
          </h1>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
            Compare performance scores with competitive programmers globally. Solve tasks to rank up!
          </p>
        </div>

        <button
          onClick={fetchLeaderboard}
          className="p-2 rounded-lg text-slate-450 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Standings"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Roster Controls: Search & Sort buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2 pl-10 pr-4 text-slate-900 dark:text-slate-200 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-2xs font-semibold">
          <span className="text-slate-400 font-bold mr-1">Sort by:</span>
          {[
            { key: "score", label: "Composite Score" },
            { key: "solvedCount", label: "Solved Count" },
            { key: "streak", label: "Active Streak" }
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => handleSort(btn.key)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all duration-150 ${
                sortBy === btn.key
                  ? "bg-indigo-65/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-900/30 shadow-2xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Standings list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center rounded-xl shadow-2xs">
          <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No competitive programmers found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 font-semibold text-3xs uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">Programmer</th>
                  <th className="py-4 px-6">Target Level</th>
                  <th className="py-4 px-6">Linked Handles</th>
                  <th className="py-4 px-6 text-center">Solved Count</th>
                  <th className="py-4 px-6 text-center">Active Streak</th>
                  <th className="py-4 px-6 text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((item, index) => {
                  const isCurrentUser = currentUser && item._id.toString() === currentUser._id.toString();
                  const isTopThree = index < 3;
                  
                  // Rank border left styling
                  const rankBorder =
                    index === 0
                      ? "border-l-4 border-l-amber-500"
                      : index === 1
                      ? "border-l-4 border-l-slate-400"
                      : index === 2
                      ? "border-l-4 border-l-amber-700"
                      : "border-l-4 border-l-transparent";

                  const rankColor =
                    index === 0
                      ? "text-amber-500 bg-amber-500/10 border-amber-500/20 font-bold"
                      : index === 1
                      ? "text-slate-400 bg-slate-400/10 border-slate-400/20 font-bold"
                      : index === 2
                      ? "text-amber-700 bg-amber-700/10 border-amber-700/20 font-bold"
                      : "text-slate-450 border-transparent bg-slate-100 dark:bg-slate-800/40";

                  return (
                    <tr
                      key={item._id}
                      className={`transition-colors border-b border-slate-100 dark:border-slate-850/40 ${rankBorder} ${
                        isCurrentUser
                          ? "bg-indigo-50/50 dark:bg-indigo-950/15 font-semibold text-indigo-900 dark:text-indigo-300 border-y border-indigo-100 dark:border-indigo-900/40"
                          : "hover:bg-slate-50/35 dark:hover:bg-slate-850/20"
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4.5 px-6 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border text-4xs ${rankColor}`}>
                          {index + 1}
                        </span>
                      </td>

                      {/* Programmer name */}
                      <td className="py-4.5 px-6">
                        <span className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-1.5">
                          {item.username}
                          {index === 0 && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />}
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider ml-1">
                              You
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Target level */}
                      <td className="py-4.5 px-6">
                        <span className="text-4xs uppercase font-extrabold px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400">
                          {item.currentLevel}
                        </span>
                      </td>

                      {/* Handles Linked */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-wrap items-center gap-2 text-4xs font-mono font-semibold">
                          {item.codeforcesHandle && (
                            <span className="px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-950/30 bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-450">
                              CF: {item.codeforcesHandle}
                            </span>
                          )}
                          {item.leetcodeHandle && (
                            <span className="px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-950/30 bg-amber-50 dark:bg-amber-950/15 text-amber-600 dark:text-amber-500">
                              LC: {item.leetcodeHandle}
                            </span>
                          )}
                          {!item.codeforcesHandle && !item.leetcodeHandle && (
                            <span className="text-slate-400 italic font-sans text-5xs">None linked</span>
                          )}
                        </div>
                      </td>

                      {/* Solved Problems */}
                      <td className="py-4.5 px-6 text-center font-bold text-slate-800 dark:text-slate-350">
                        {item.solvedCount}
                      </td>

                      {/* Streak */}
                      <td className="py-4.5 px-6 text-center">
                        {item.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 font-bold text-4xs">
                            <Flame className="w-3.5 h-3.5 fill-amber-500/10" />
                            {item.streak}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">-</span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-4.5 px-6 text-right font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {item.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
