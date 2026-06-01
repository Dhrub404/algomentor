import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminStatCard from "../components/AdminStatCard";
import { Users, Code2, BookOpen, BarChart3, Radio, RefreshCw, ArrowRight } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalTopics: 0,
    totalSubmissions: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space font-extrabold text-2xl text-white tracking-tight my-0">
            System Operations Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and global variables configuration hub.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          title="Refresh Statistics"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <AdminStatCard
              title="Registered Users"
              value={stats.totalUsers}
              icon={Users}
              description="Total user database accounts"
              color="indigo"
            />
            <AdminStatCard
              title="Problems Mapped"
              value={stats.totalProblems}
              icon={Code2}
              description="LeetCode & Codeforces mappings"
              color="rose"
            />
            <AdminStatCard
              title="Core Topics"
              value={stats.totalTopics}
              icon={BookOpen}
              description="Primary curriculum categories"
              color="amber"
            />
            <AdminStatCard
              title="Aggregated Hits"
              value={stats.totalSubmissions}
              icon={BarChart3}
              description="Total submission logs mapped"
              color="emerald"
            />
            <AdminStatCard
              title="Active (7 Days)"
              value={stats.activeUsers}
              icon={Radio}
              description="Users active within a week"
              color="rose"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <h3 className="font-space font-bold text-sm text-slate-300 m-0">Quick Action Modules</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: "User Controls", desc: "View rosters, edit masteries, bypass thresholds, and reset progress profiles.", path: "/admin/users", border: "hover:border-indigo-500/30" },
                { title: "DSA Curriculum", desc: "Modify thresholds, expand topics, and edit prerequisite configurations.", path: "/admin/topics", border: "hover:border-amber-500/30" },
                { title: "Problem Mappings", desc: "Create, edit, and categorize competitive programming problem mappings.", path: "/admin/problems", border: "hover:border-rose-500/30" },
                { title: "System Variables", desc: "Configure global variables like daily sizes and decay periods.", path: "/admin/settings", border: "hover:border-slate-500/30" }
              ].map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4 transition-all duration-300 ${item.border}`}
                >
                  <div>
                    <h4 className="font-space font-bold text-xs text-slate-200 my-0">{item.title}</h4>
                    <p className="text-4xs text-slate-500 leading-normal mt-1">{item.desc}</p>
                  </div>
                  <span className="text-5xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5 hover:text-slate-200">
                    Open Module
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
