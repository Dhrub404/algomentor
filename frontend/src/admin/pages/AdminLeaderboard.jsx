import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, Search, RefreshCw, Star, Mail, ShieldAlert, Award } from "lucide-react";
import { formatDate } from "../../utils/helpers";

const AdminLeaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("avgMastery"); // "avgMastery" | "studiedCount" | "joinedDate" | "username"

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch admin users roster for leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Sort and filter logic
  const handleSort = (field) => {
    setSortBy(field);
  };

  const filteredUsers = users
    .filter(
      (u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "avgMastery") {
        return b.avgMastery - a.avgMastery;
      }
      if (sortBy === "studiedCount") {
        return b.studiedCount - a.studiedCount;
      }
      if (sortBy === "joinedDate") {
        return new Date(b.joinedDate) - new Date(a.joinedDate);
      }
      if (sortBy === "username") {
        return a.username.localeCompare(b.username);
      }
      return 0;
    });

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space font-extrabold text-2xl text-white tracking-tight my-0 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-500" />
            Global Admin Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global ranking of all student profiles indexed by subtopic mastery, study breadth, and account engagement.
          </p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          title="Refresh Standings"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Roster Controls: Search & Sort */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-10 pr-4 text-slate-200 text-xs focus:border-rose-500/50 focus:outline-none placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Sort Actions */}
        <div className="flex items-center gap-2 text-2xs font-space">
          <span className="text-slate-500 font-semibold mr-1">Sort by:</span>
          <button
            onClick={() => handleSort("avgMastery")}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              sortBy === "avgMastery"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/35"
                : "border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            Avg Mastery
          </button>
          <button
            onClick={() => handleSort("studiedCount")}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              sortBy === "studiedCount"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/35"
                : "border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            Subtopics Studied
          </button>
          <button
            onClick={() => handleSort("joinedDate")}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              sortBy === "joinedDate"
                ? "bg-slate-800 text-slate-200 border-slate-700"
                : "border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            Joined Date
          </button>
        </div>
      </div>

      {/* Main standings */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-10 text-center rounded-3xl">
          <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No registered programmers found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-space text-3xs uppercase tracking-wider font-extrabold">
                  <th className="py-4 px-6 text-center">Rank</th>
                  <th className="py-4 px-6">Programmer</th>
                  <th className="py-4 px-6">Level</th>
                  <th className="py-4 px-6">Linked Handles</th>
                  <th className="py-4 px-6 text-center">Breadth</th>
                  <th className="py-4 px-6 text-center">Avg Mastery</th>
                  <th className="py-4 px-6 text-right">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {filteredUsers.map((item, index) => {
                  const rankColor =
                    index === 0
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : index === 1
                      ? "text-slate-300 bg-slate-400/10 border-slate-400/20"
                      : index === 2
                      ? "text-amber-600 bg-amber-700/10 border-amber-700/20"
                      : "text-slate-500 border-transparent bg-slate-900/20";

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/10 transition-colors">
                      {/* Rank */}
                      <td className="py-4 px-6 font-space text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-2xs ${rankColor}`}>
                          {index + 1}
                        </span>
                      </td>

                      {/* Username & Email */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                            {item.username}
                            {index === 0 && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                          </span>
                          <span className="text-4xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-600" />
                            {item.email}
                          </span>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-4 px-6">
                        <span className="text-4xs uppercase font-extrabold px-2 py-0.5 rounded-full border border-rose-500/15 bg-rose-500/5 text-rose-400">
                          {item.currentLevel}
                        </span>
                      </td>

                      {/* Handles */}
                      <td className="py-4 px-6 font-mono text-4xs">
                        <div className="flex items-center gap-2">
                          {item.codeforcesHandle && (
                            <span className="px-1.5 py-0.5 rounded border border-rose-500/15 bg-rose-500/5 text-rose-400 font-semibold">
                              CF: {item.codeforcesHandle}
                            </span>
                          )}
                          {item.leetcodeHandle && (
                            <span className="px-1.5 py-0.5 rounded border border-amber-500/15 bg-amber-500/5 text-amber-500 font-semibold">
                              LC: {item.leetcodeHandle}
                            </span>
                          )}
                          {!item.codeforcesHandle && !item.leetcodeHandle && (
                            <span className="text-slate-600 italic">None linked</span>
                          )}
                        </div>
                      </td>

                      {/* Breadth */}
                      <td className="py-4 px-6 text-center font-semibold font-mono text-slate-400">
                        {item.studiedCount} subtopics
                      </td>

                      {/* Avg Mastery */}
                      <td className="py-4 px-6 text-center font-bold">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-slate-100 text-sm">{item.avgMastery}%</span>
                          {/* Progress bar visual */}
                          <div className="w-16 h-1 bg-slate-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${item.avgMastery}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Date Joined */}
                      <td className="py-4 px-6 text-right text-slate-500 font-mono">
                        {formatDate(item.joinedDate)}
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

export default AdminLeaderboard;
