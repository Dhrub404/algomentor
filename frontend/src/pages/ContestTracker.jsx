import React, { useState, useEffect, useContext } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import { formatDate, formatDuration } from "../utils/helpers";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { BarChart3, Calendar, Trophy, RefreshCw, ExternalLink } from "lucide-react";

const ContestTracker = () => {
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState({ codeforces: [], leetcode: [] });
  const [loading, setLoading] = useState(true);

  const fetchContestData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [upcomingData, historyData] = await Promise.all([
        api.getUpcomingContests(),
        api.getContestHistory(user._id)
      ]);
      setUpcoming(upcomingData);
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to load contest tracking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestData();
  }, [user]);

  const cfChartData = history.codeforces.map((h, index) => ({
    name: `CF #${index + 1}`,
    Codeforces: h.rating,
    contest: h.contestName,
    rank: h.rank
  }));

  const lcChartData = history.leetcode.map((h, index) => ({
    name: `LC #${index + 1}`,
    LeetCode: h.rating,
    contest: h.contestName,
    rank: h.rank
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-md text-xs flex flex-col gap-1 text-left">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{data.contest}</p>
          <p className="text-indigo-650 dark:text-indigo-400 font-semibold font-mono">Rating: {payload[0].value}</p>
          <p className="text-slate-500 font-mono">Rank: #{data.rank}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Competitive Contest Tracker
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
            Stay updated with upcoming Codeforces schedules and track your historical platform rating trajectories.
          </p>
        </div>

        <button
          onClick={fetchContestData}
          className="p-2 rounded-lg text-slate-450 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Data"
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
          
          {/* Left: Rating Progression Charts */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Codeforces chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4 text-left">
              <h3 className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 m-0">
                Codeforces Rating Progression
              </h3>
              {cfChartData.length > 0 ? (
                <div className="w-full h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cfChartData} margin={{ left: -20, right: 10, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="Codeforces"
                        stroke="#EF4444"
                        strokeWidth={2.5}
                        dot={{ r: 3, stroke: "#EF4444", strokeWidth: 1, fill: theme === "dark" ? "#0f172a" : "#ffffff" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-900/10">
                  No Codeforces contest history found. Make sure your handle is linked and sync is complete.
                </p>
              )}
            </div>

            {/* LeetCode chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4 text-left">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 m-0">
                LeetCode Contest Rating Progression
              </h3>
              {lcChartData.length > 0 ? (
                <div className="w-full h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lcChartData} margin={{ left: -20, right: 10, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="LeetCode"
                        stroke="#F59E0B"
                        strokeWidth={2.5}
                        dot={{ r: 3, stroke: "#F59E0B", strokeWidth: 1, fill: theme === "dark" ? "#0f172a" : "#ffffff" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-900/10">
                  No LeetCode contest history found. Participate in Weekly Contests to track progression.
                </p>
              )}
            </div>
          </div>

          {/* Right: Upcoming Contests list */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xs flex flex-col gap-4 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 m-0 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Upcoming Schedules
              </h3>

              {upcoming.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {upcoming.slice(0, 5).map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-2 hover:border-slate-350 dark:hover:border-slate-700 transition-colors"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-2xs leading-snug line-clamp-2">
                        {c.name}
                      </span>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-450 font-medium font-mono">
                        <span>Date: {formatDate(c.startTime)}</span>
                        <span>Length: {formatDuration(c.durationSeconds)}</span>
                      </div>

                      <a
                        href={`https://codeforces.com/contests/${c.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-center py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-4xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        Register on Codeforces
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                  No upcoming contests scheduled at this time.
                </p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ContestTracker;
