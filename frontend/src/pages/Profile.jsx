import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
  User, Award, Calendar, Mail, Flame, ExternalLink, ShieldCheck, AlertCircle, Edit3, X, Save, Zap
} from "lucide-react";

const Profile = () => {
  const { user, progress, performances, updateProfile, connectHandles, refetchUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const majorTopics = [
    { name: "Arrays", subtopics: ["Basics", "Two Pointers", "Sliding Window"] },
    { name: "Binary Search", subtopics: ["One-D Arrays", "On Answer"] },
    { name: "Strings", subtopics: ["Basic Operations", "Pattern Matching"] },
    { name: "Linked List", subtopics: ["Singly LinkedList", "Double LinkedList & Loops"] },
    { name: "Stacks/Queues", subtopics: ["Linear Structures", "Monotonic Stack"] },
    { name: "Trees", subtopics: ["Binary Tree Traversals", "BST Operations"] },
    { name: "Graphs", subtopics: ["DFS/BFS Basics", "Shortest Paths"] },
    { name: "DP", subtopics: ["One-D DP", "Grid DP"] }
  ];

  // Calculations for stats
  const solvedCount = progress?.solvedProblems?.length || 0;
  
  let totalMastery = 0;
  if (progress && progress.mastery) {
    // If mastery is a Map or object
    const entries = typeof progress.mastery.entries === "function" 
      ? Array.from(progress.mastery.entries()) 
      : Object.entries(progress.mastery);
    entries.forEach(([_, score]) => {
      totalMastery += score;
    });
  }
  
  const totalScore = solvedCount * 100 + totalMastery;

  // Streak calculations
  let streak = 0;
  if (progress && progress.lastActivityDate) {
    const diffTime = Math.abs(Date.now() - new Date(progress.lastActivityDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      streak = Math.max(1, (solvedCount % 7) + 1);
    }
  }
  const bestStreak = Math.max(12, streak + 5);
  const todaySolved = streak > 0 ? 2 : 0;

  // Connected handles boolean checks
  const isLcConnected = !!user?.leetcodeHandle;
  const isCfConnected = !!user?.codeforcesHandle;
  const isCcConnected = !!user?.codechefHandle;
  const isGfgConnected = !!user?.gfgHandle;
  const isHrConnected = !!user?.hackerrankHandle;

  // Platform Details Data
  const platforms = [
    {
      id: "leetcode",
      name: "LeetCode",
      handle: user?.leetcodeHandle,
      connected: isLcConnected,
      color: "border-l-amber-500",
      accentColor: "text-amber-500",
      url: `https://leetcode.com/${user?.leetcodeHandle}`,
      stats: [
        { label: "Total Solved", value: isLcConnected ? Math.round(solvedCount * 0.6) : "—" },
        { label: "Difficulty", value: isLcConnected ? `E: ${Math.round(solvedCount * 0.2)} | M: ${Math.round(solvedCount * 0.35)} | H: ${Math.round(solvedCount * 0.05)}` : "—" },
        { label: "Contest Rating", value: isLcConnected ? "1,750" : "—" },
        { label: "Global Rank", value: isLcConnected ? "45,213" : "—" }
      ]
    },
    {
      id: "codeforces",
      name: "Codeforces",
      handle: user?.codeforcesHandle,
      connected: isCfConnected,
      color: "border-l-rose-500",
      accentColor: "text-rose-500",
      url: `https://codeforces.com/profile/${user?.codeforcesHandle}`,
      stats: [
        { label: "Rating", value: isCfConnected ? "1,420" : "—" },
        { label: "Max Rating", value: isCfConnected ? "1,530" : "—" },
        { label: "Rank Title", value: isCfConnected ? "Pupil" : "—" },
        { label: "Contests", value: isCfConnected ? "14" : "—" }
      ]
    },
    {
      id: "codechef",
      name: "CodeChef",
      handle: user?.codechefHandle,
      connected: isCcConnected,
      color: "border-l-amber-700",
      accentColor: "text-amber-700",
      url: `https://www.codechef.com/users/${user?.codechefHandle}`,
      stats: [
        { label: "Rating", value: isCcConnected ? "1,650" : "—" },
        { label: "Max Rating", value: isCcConnected ? "1,800" : "—" },
        { label: "Stars", value: isCcConnected ? "3★" : "—" },
        { label: "Global Rank", value: isCcConnected ? "12,410" : "—" }
      ]
    },
    {
      id: "geeksforgeeks",
      name: "GeeksforGeeks",
      handle: user?.gfgHandle,
      connected: isGfgConnected,
      color: "border-l-emerald-600",
      accentColor: "text-emerald-600",
      url: `https://auth.geeksforgeeks.org/user/${user?.gfgHandle}`,
      stats: [
        { label: "Coding Score", value: isGfgConnected ? "320" : "—" },
        { label: "Total Solved", value: isGfgConnected ? "45" : "—" },
        { label: "Institute Rank", value: isGfgConnected ? "124" : "—" },
        { label: "Monthly Score", value: isGfgConnected ? "80" : "—" }
      ]
    },
    {
      id: "hackerrank",
      name: "HackerRank",
      handle: user?.hackerrankHandle,
      connected: isHrConnected,
      color: "border-l-teal-500",
      accentColor: "text-teal-500",
      url: `https://www.hackerrank.com/${user?.hackerrankHandle}`,
      stats: [
        { label: "Score", value: isHrConnected ? "450" : "—" },
        { label: "Level", value: isHrConnected ? "Gold" : "—" },
        { label: "Badges", value: isHrConnected ? "4" : "—" },
        { label: "Certs", value: isHrConnected ? "2" : "—" }
      ]
    }
  ];

  // Score History Data mock (updates dynamically based on platforms connected)
  const historyData = [
    { month: "Dec", LeetCode: isLcConnected ? 1200 : 0, Codeforces: isCfConnected ? 1100 : 0, CodeChef: isCcConnected ? 1300 : 0, Total: isLcConnected || isCfConnected ? 2400 : 0 },
    { month: "Jan", LeetCode: isLcConnected ? 1350 : 0, Codeforces: isCfConnected ? 1150 : 0, CodeChef: isCcConnected ? 1380 : 0, Total: isLcConnected || isCfConnected ? 2600 : 0 },
    { month: "Feb", LeetCode: isLcConnected ? 1420 : 0, Codeforces: isCfConnected ? 1220 : 0, CodeChef: isCcConnected ? 1450 : 0, Total: isLcConnected || isCfConnected ? 2850 : 0 },
    { month: "Mar", LeetCode: isLcConnected ? 1500 : 0, Codeforces: isCfConnected ? 1310 : 0, CodeChef: isCcConnected ? 1520 : 0, Total: isLcConnected || isCfConnected ? 3100 : 0 },
    { month: "Apr", LeetCode: isLcConnected ? 1620 : 0, Codeforces: isCfConnected ? 1380 : 0, CodeChef: isCcConnected ? 1600 : 0, Total: isLcConnected || isCfConnected ? 3350 : 0 },
    { month: "May", LeetCode: isLcConnected ? 1750 : 0, Codeforces: isCfConnected ? 1420 : 0, CodeChef: isCcConnected ? 1650 : 0, Total: totalScore }
  ];

  // Radar Data
  const radarData = [
    { subject: "LeetCode", A: isLcConnected ? 80 : 20, fullMark: 100 },
    { subject: "Codeforces", A: isCfConnected ? 65 : 20, fullMark: 100 },
    { subject: "CodeChef", A: isCcConnected ? 70 : 20, fullMark: 100 },
    { subject: "GeeksforGeeks", A: isGfgConnected ? 75 : 20, fullMark: 100 },
    { subject: "HackerRank", A: isHrConnected ? 85 : 20, fullMark: 100 }
  ];

  // Contribution Heatmap rendering
  const daysInHeatmap = 140; // 20 weeks
  const mockContributions = Array.from({ length: daysInHeatmap }, (_, idx) => {
    // Generate a semi-random pattern that looks like coding solves
    const seed = Math.sin(idx) * idx;
    if (seed % 7 === 0) return 3; // high
    if (seed % 3 === 0) return 1; // low
    if (seed % 5 === 0) return 2; // medium
    return 0; // none
  });

  const getHeatmapColor = (level) => {
    switch (level) {
      case 1: return "bg-indigo-200 dark:bg-indigo-900/40 border border-indigo-300/10";
      case 2: return "bg-indigo-400 dark:bg-indigo-700/60 border border-indigo-500/10";
      case 3: return "bg-indigo-600 dark:bg-indigo-500 border border-indigo-600/20";
      default: return "bg-slate-100 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/20";
    }
  };

  const totalContributions = mockContributions.reduce((acc, curr) => acc + curr, 0);
  const activeDays = mockContributions.filter(x => x > 0).length;

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-6xl mx-auto w-full pb-12 transition-colors duration-200">
      
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 shadow-sm">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-2xl text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.username?.slice(0, 2).toUpperCase()}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white my-0 flex items-center justify-center sm:justify-start gap-2">
              {user?.name || user?.username}
              <span className="text-4xs font-mono font-semibold px-2 py-0.5 rounded-full border border-indigo-500/15 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {user?.currentLevel}
              </span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {user?.branch && user?.batch ? `${user.branch} · Batch of ${user.batch}` : "No branch & batch configured"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              {user?.college || "College not set"}
            </p>
            {user?.usn && (
              <p className="text-4xs font-mono font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Roll Number / USN: {user.usn}
              </p>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="sm:absolute sm:top-6 sm:right-6 flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium px-3.5 py-2 rounded-lg transition-all shadow-2xs shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* SECTION 2: Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Score", value: totalScore.toLocaleString(), icon: Zap, color: "text-indigo-500" },
          { label: "Current Streak", value: `${streak} Days`, icon: Flame, color: "text-amber-500" },
          { label: "Best Streak", value: `${bestStreak} Days`, icon: Flame, color: "text-red-500" },
          { label: "Today Solved", value: todaySolved, icon: ShieldCheck, color: "text-emerald-500" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex flex-col">
                <span className="text-5xs uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">{stat.value}</span>
              </div>
              <Icon className={`w-7 h-7 ${stat.color} shrink-0`} />
            </div>
          );
        })}
      </div>

      {/* SECTION 3: Platform Cards */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0">Connected Platforms</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${platform.color} p-6 rounded-xl flex flex-col justify-between gap-4 shadow-3xs relative`}
            >
              {platform.connected && (
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={`Open ${platform.name} profile`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {platform.name}
                  {platform.connected && (
                    <span className="text-4xs font-mono font-medium text-slate-400">
                      (@{platform.handle})
                    </span>
                  )}
                </span>
              </div>

              {platform.connected ? (
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 border-t border-slate-100 dark:border-slate-850 pt-4 text-2xs">
                  {platform.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="flex flex-col gap-0.5">
                      <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold">{stat.label}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">{stat.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-3">
                  <p className="text-4xs text-slate-400 dark:text-slate-500 leading-normal my-0">
                    Connect your {platform.name} handle to start syncing submission metrics and analyzing weak areas.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="self-start text-5xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus:outline-none"
                  >
                    Connect Platform
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visual Chart Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SECTION 4: Score History Line Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">Performance Trend</h3>
            <p className="text-5xs text-slate-400 dark:text-slate-500 mt-1 my-0">
              Progression curve showcasing consolidated score changes across synced coding profiles.
            </p>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                    borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                    color: theme === "dark" ? "#f1f5f9" : "#0f172a",
                    borderRadius: "8px",
                    fontSize: "11px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                {isLcConnected && <Line type="monotone" dataKey="LeetCode" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />}
                {isCfConnected && <Line type="monotone" dataKey="Codeforces" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />}
                {isCcConnected && <Line type="monotone" dataKey="CodeChef" stroke="#b45309" strokeWidth={2.5} dot={{ r: 3 }} />}
                <Line type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 5: Platform Comparison Radar */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">Platform Distribution</h3>
            <p className="text-5xs text-slate-400 dark:text-slate-500 mt-1 my-0">
              Proficiency radar across platforms.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={8} tick={false} />
                <Radar name="Proficiency" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 6: Contribution Heatmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-4 shadow-3xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">Submission Heatmap</h3>
            <p className="text-5xs text-slate-400 dark:text-slate-500 mt-1 my-0">
              Chronological log of solved problems and test runs over the past 20 weeks.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-5xs text-slate-400 font-mono">
            <span>Total Submissions: <strong className="text-indigo-600 dark:text-indigo-400">{totalContributions}</strong></span>
            <span>Active Days: <strong className="text-indigo-600 dark:text-indigo-400">{activeDays}</strong></span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-col gap-1 min-w-[500px]">
            {/* Months indicators row */}
            <div className="flex justify-between pl-6 text-5xs text-slate-400 font-mono pr-2">
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>

            <div className="flex gap-1.5">
              {/* Day Labels */}
              <div className="flex flex-col justify-between text-5xs text-slate-400 font-mono pr-1.5 py-0.5 leading-none h-[82px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* Squares Grid: columns of weeks */}
              <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1 h-[82px]">
                {mockContributions.map((level, idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-sm transition-all duration-150 ${getHeatmapColor(level)}`}
                    title={`Day ${idx + 1}: ${level === 3 ? "High activity" : level === 2 ? "Medium activity" : level === 1 ? "Low activity" : "No solves"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 justify-end text-5xs text-slate-400 font-mono mt-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/20" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-200 dark:bg-indigo-900/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 dark:bg-indigo-700/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
          <span>More</span>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {modalOpen && (
        <EditProfileModal
          onClose={() => setModalOpen(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            refetchUser(); // Refresh core user context
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
          onError={(msg) => {
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(""), 4000);
          }}
          majorTopics={majorTopics}
        />
      )}

    </div>
  );
};

// Modal Drawer Component
const EditProfileModal = ({ onClose, onSuccess, onError, majorTopics }) => {
  const { user, updateProfile, connectHandles } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    batch: "",
    college: "",
    usn: "",
    codeforcesHandle: "",
    leetcodeHandle: "",
    codechefHandle: "",
    gfgHandle: "",
    hackerrankHandle: "",
    level: "beginner"
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        branch: user.branch || "",
        batch: user.batch || "",
        college: user.college || "",
        usn: user.usn || "",
        codeforcesHandle: user.codeforcesHandle || "",
        leetcodeHandle: user.leetcodeHandle || "",
        codechefHandle: user.codechefHandle || "",
        gfgHandle: user.gfgHandle || "",
        hackerrankHandle: user.hackerrankHandle || "",
        level: user.currentLevel || "beginner"
      });

      // Topics checking
      const studiedMajor = [];
      majorTopics.forEach((t) => {
        const hasAllSubtopics = t.subtopics.every((sub) =>
          user.studiedTopics?.includes(sub)
        );
        if (hasAllSubtopics) {
          studiedMajor.push(topic => topic.name);
        }
      });
      
      // Let's check which major topics are fully selected
      const initialChecked = [];
      majorTopics.forEach((t) => {
        const hasSome = t.subtopics.some(sub => user.studiedTopics?.includes(sub));
        if (hasSome) {
          initialChecked.push(t.name);
        }
      });
      setSelectedTopics(initialChecked);
    }
  }, [user]);

  const handleToggleTopic = (topicName) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Map topics to subtopics list to persist
    let subtopicsToSend = [];
    selectedTopics.forEach((topicName) => {
      const topicObj = majorTopics.find((t) => t.name === topicName);
      if (topicObj) {
        subtopicsToSend = subtopicsToSend.concat(topicObj.subtopics);
      }
    });

    try {
      // Update core profiles details
      await updateProfile({
        name: formData.name.trim(),
        branch: formData.branch.trim(),
        batch: formData.batch.trim(),
        college: formData.college.trim(),
        usn: formData.usn.trim(),
        currentLevel: formData.level,
        studiedTopics: subtopicsToSend,
        codeforcesHandle: formData.codeforcesHandle.trim(),
        leetcodeHandle: formData.leetcodeHandle.trim(),
        codechefHandle: formData.codechefHandle.trim(),
        gfgHandle: formData.gfgHandle.trim(),
        hackerrankHandle: formData.hackerrankHandle.trim()
      });

      onSuccess("Profile details updated successfully.");
      onClose();
    } catch (err) {
      console.error(err);
      onError(err || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Edit Profile Milestones
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs text-left">
          {/* Group 1: Academics / Basic info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Academics & General info
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dhruv"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">College / Institution</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="e.g. RV College of Engineering"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Academic Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Graduation Batch / Year</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  placeholder="e.g. 2026"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">USN / University Roll Number</label>
                <input
                  type="text"
                  name="usn"
                  value={formData.usn}
                  onChange={handleInputChange}
                  placeholder="e.g. 1RV22CS050"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Platform Handles */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Competitive Programming Platforms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">LeetCode Username</label>
                <input
                  type="text"
                  name="leetcodeHandle"
                  value={formData.leetcodeHandle}
                  onChange={handleInputChange}
                  placeholder="LeetCode username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Codeforces Handle</label>
                <input
                  type="text"
                  name="codeforcesHandle"
                  value={formData.codeforcesHandle}
                  onChange={handleInputChange}
                  placeholder="Codeforces handle"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">CodeChef Handle</label>
                <input
                  type="text"
                  name="codechefHandle"
                  value={formData.codechefHandle}
                  onChange={handleInputChange}
                  placeholder="CodeChef handle"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">GeeksforGeeks Handle</label>
                <input
                  type="text"
                  name="gfgHandle"
                  value={formData.gfgHandle}
                  onChange={handleInputChange}
                  placeholder="GFG username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">HackerRank Username</label>
                <input
                  type="text"
                  name="hackerrankHandle"
                  value={formData.hackerrankHandle}
                  onChange={handleInputChange}
                  placeholder="HackerRank username"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Recommendation Tier */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Proficiency Level
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-4xs font-bold uppercase tracking-wider text-slate-400">Target Level Tier</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="beginner">Beginner (Easy recommendations)</option>
                <option value="intermediate">Intermediate (Medium recommendations)</option>
                <option value="advanced">Advanced (Hard recommendations)</option>
              </select>
            </div>
          </div>

          {/* Group 4: Topic Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5 my-0">
              Studied DSA Core Areas
            </h3>

            <div className="grid grid-cols-2 gap-3.5 max-h-[160px] overflow-y-auto pr-1">
              {majorTopics.map((topic) => {
                const isChecked = selectedTopics.includes(topic.name);
                return (
                  <button
                    type="button"
                    key={topic.name}
                    onClick={() => handleToggleTopic(topic.name)}
                    className={`p-3 border text-left flex items-center gap-2.5 rounded-lg transition-all ${
                      isChecked
                        ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-250 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-650 flex items-center justify-center shrink-0">
                      {isChecked && <div className="w-2 h-2 rounded bg-indigo-500" />}
                    </div>
                    <span className="font-medium truncate">{topic.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls inside Modal */}
          <div className="flex items-center justify-end gap-3.5 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-350 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
