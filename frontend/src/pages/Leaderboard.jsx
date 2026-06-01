import React, { useState, useEffect, useMemo, useContext } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { ThemeContext } from "../context/ThemeContext";
import { 
  Trophy, Flame, Search, ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight, Crown
} from "lucide-react";

// Simple hash helper to make mock fields deterministic based on username
const getHashCode = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getAvatarColor = (name) => {
  const colors = [
    "bg-red-500/90 text-white border-red-500/20",
    "bg-emerald-500/90 text-white border-emerald-500/20",
    "bg-blue-500/90 text-white border-blue-500/20",
    "bg-amber-500/90 text-white border-amber-500/20",
    "bg-purple-500/90 text-white border-purple-500/20",
    "bg-indigo-500/90 text-white border-indigo-500/20",
    "bg-pink-500/90 text-white border-pink-500/20",
    "bg-rose-500/90 text-white border-rose-500/20",
    "bg-teal-500/90 text-white border-teal-500/20",
    "bg-cyan-500/90 text-white border-cyan-500/20"
  ];
  return colors[getHashCode(name) % colors.length];
};

const getCollegeFallback = (username, dbCollege) => {
  if (dbCollege && dbCollege.trim()) return dbCollege;
  const colleges = [
    "RV College of Engineering",
    "PES University Mandya",
    "BMS College of Engineering",
    "MS Ramaiah Institute of Tech",
    "Bangalore Institute of Tech"
  ];
  return colleges[getHashCode(username) % colleges.length];
};

const getBranchFallback = (username, dbBranch) => {
  if (dbBranch && dbBranch.trim()) return dbBranch;
  const branches = [
    "Computer Science",
    "Information Technology",
    "Information Science",
    "Electronics & Comm.",
    "Artificial Intelligence"
  ];
  return branches[getHashCode(username) % branches.length];
};

const getBatchFallback = (username, dbBatch) => {
  if (dbBatch && dbBatch.trim()) return dbBatch;
  const batches = ["2026", "2027", "2025", "2028"];
  return batches[getHashCode(username) % batches.length];
};

// Platform Score Calculators
const getLeetCodeSolved = (u) => {
  if (!u.leetcodeHandle) return null;
  return 65 + (getHashCode(u.leetcodeHandle) % 80) + (u.solvedCount || 0);
};

const getCodeforcesRating = (u) => {
  if (!u.codeforcesHandle) return null;
  return 1000 + (getHashCode(u.codeforcesHandle) % 800) + (u.solvedCount * 4);
};

const getCodeChefRating = (u) => {
  if (!u.codechefHandle) return null;
  return 950 + (getHashCode(u.codechefHandle) % 700) + (u.solvedCount * 3);
};

const getGfgScore = (u) => {
  if (!u.gfgHandle) return null;
  return 120 + (getHashCode(u.gfgHandle) % 400) + (u.solvedCount * 2);
};

const getStreakVal = (u) => {
  return u.streak || null;
};

const Leaderboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveTime, setLiveTime] = useState("");

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [selectedYear, setSelectedYear] = useState("All Years");

  // Platform and Sorting states
  const [activePlatform, setActivePlatform] = useState("All"); // "All" | "LeetCode" | "Codeforces" | "CodeChef" | "GFG" | "Streak"
  const [sortBy, setSortBy] = useState("score"); // "score" | "leetcode" | "codeforces" | "codechef" | "gfg" | "streak" | "username"
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" | "asc"

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Clock Interval
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setLiveTime(date.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Users
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Sync sorting columns if platform pills are clicked
  const handlePillClick = (platform) => {
    setActivePlatform(platform);
    setCurrentPage(1);
    
    // Auto map sortBy based on pill selected
    if (platform === "All") setSortBy("score");
    else if (platform === "LeetCode") setSortBy("leetcode");
    else if (platform === "Codeforces") setSortBy("codeforces");
    else if (platform === "CodeChef") setSortBy("codechef");
    else if (platform === "GFG") setSortBy("gfg");
    else if (platform === "Streak") setSortBy("streak");
    setSortOrder("desc");
  };

  const handleSortHeader = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Process and parse user list with fallbacks for filters
  const parsedUsers = useMemo(() => {
    return users.map((u) => {
      const college = getCollegeFallback(u.username, u.college);
      const branch = getBranchFallback(u.username, u.branch);
      const batch = getBatchFallback(u.username, u.batch);
      
      // Years calculation: 2026 -> 3rd Year, 2027 -> 2nd Year, etc. (assuming current is 2025/2026 context)
      let academicYear = "1st Year";
      if (batch === "2025") academicYear = "4th Year";
      else if (batch === "2026") academicYear = "3rd Year";
      else if (batch === "2027") academicYear = "2nd Year";
      else if (batch === "2028") academicYear = "1st Year";

      // Platform metrics
      const lcSolved = getLeetCodeSolved(u);
      const cfRating = getCodeforcesRating(u);
      const ccRating = getCodeChefRating(u);
      const gfgScore = getGfgScore(u);
      const streakVal = getStreakVal(u);

      return {
        ...u,
        college,
        branch,
        batch,
        academicYear,
        lcSolved,
        cfRating,
        ccRating,
        gfgScore,
        streakVal
      };
    });
  }, [users]);

  // Extract unique options dynamically for dropdown lists
  const collegeOptions = useMemo(() => {
    const set = new Set(parsedUsers.map((u) => u.college));
    return ["All Colleges", ...Array.from(set)];
  }, [parsedUsers]);

  const branchOptions = useMemo(() => {
    const set = new Set(parsedUsers.map((u) => u.branch));
    return ["All Branches", ...Array.from(set)];
  }, [parsedUsers]);

  const batchOptions = useMemo(() => {
    const set = new Set(parsedUsers.map((u) => u.batch));
    return ["All Batches", ...Array.from(set)];
  }, [parsedUsers]);

  const yearOptions = useMemo(() => {
    const set = new Set(parsedUsers.map((u) => u.academicYear));
    return ["All Years", ...Array.from(set)];
  }, [parsedUsers]);

  // Search & Metadata Filtering Logic
  const filteredUsers = useMemo(() => {
    return parsedUsers.filter((u) => {
      // 1. Search term (student name)
      const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Dropdown Filters
      const matchesCollege = selectedCollege === "All Colleges" || u.college === selectedCollege;
      const matchesBranch = selectedBranch === "All Branches" || u.branch === selectedBranch;
      const matchesBatch = selectedBatch === "All Batches" || u.batch === selectedBatch;
      const matchesYear = selectedYear === "All Years" || u.academicYear === selectedYear;

      return matchesSearch && matchesCollege && matchesBranch && matchesBatch && matchesYear;
    });
  }, [parsedUsers, searchTerm, selectedCollege, selectedBranch, selectedBatch, selectedYear]);

  // Sorting Logic
  const sortedUsers = useMemo(() => {
    const getSortValue = (u, field) => {
      switch (field) {
        case "username":
          return u.username.toLowerCase();
        case "leetcode":
          return u.lcSolved || 0;
        case "codeforces":
          return u.cfRating || 0;
        case "codechef":
          return u.ccRating || 0;
        case "gfg":
          return u.gfgScore || 0;
        case "streak":
          return u.streakVal || 0;
        case "score":
        default:
          // In combined score pill mode, sort by combined mastery
          return u.score || 0;
      }
    };

    const sorted = [...filteredUsers].sort((a, b) => {
      const valA = getSortValue(a, sortBy);
      const valB = getSortValue(b, sortBy);

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "desc" 
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      } else {
        return sortOrder === "desc" 
          ? (valB - valA) 
          : (valA - valB);
      }
    });

    return sorted;
  }, [filteredUsers, sortBy, sortOrder]);

  // Pagination slice
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const getSortDropdownLabel = () => {
    switch (sortBy) {
      case "leetcode": return "LeetCode Solved";
      case "codeforces": return "Codeforces Rating";
      case "codechef": return "CodeChef Rating";
      case "gfg": return "GFG Score";
      case "streak": return "Streak Count";
      case "score": default: return "Total Score";
    }
  };

  const getDisplayScoreValue = (u) => {
    if (activePlatform === "All") return u.score;
    if (activePlatform === "LeetCode") return u.lcSolved !== null ? u.lcSolved : "—";
    if (activePlatform === "Codeforces") return u.cfRating !== null ? u.cfRating : "—";
    if (activePlatform === "CodeChef") return u.ccRating !== null ? u.ccRating : "—";
    if (activePlatform === "GFG") return u.gfgScore !== null ? u.gfgScore : "—";
    if (activePlatform === "Streak") return u.streakVal !== null ? `${u.streakVal}d` : "—";
    return u.score;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-12 transition-colors duration-200">
      
      {/* SECTION 1: HERO BANNER */}
      <div className="bg-[#090d16] dark:bg-slate-950 border border-slate-800 p-8 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden text-left min-h-[120px]">
        {/* Subtle dot background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />
        
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white my-0 leading-tight">
            Leaderboard
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-2 mb-0">
            {sortedUsers.length} {sortedUsers.length === 1 ? "student" : "students"} ranked · {liveTime || "HH:MM:SS AM/PM"}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 py-1.5 px-3 rounded-full text-emerald-450 text-[10px] font-bold tracking-wider uppercase">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
          <span className="w-2 h-2 bg-emerald-500 rounded-full absolute left-3 shrink-0" />
          Live
        </div>

        {/* Thin bottom accent gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
      </div>

      {/* SECTION 2: FILTERS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col gap-5 shadow-3xs text-left">
        
        {/* Row 1: Search, Sort & Order Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-slate-200 text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            {/* Sort Select */}
            <div className="relative text-xs">
              <select
                value={sortBy}
                onChange={(e) => handleSortHeader(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2.5 pl-4 pr-10 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer w-full md:w-[170px]"
              >
                <option value="score">Sort: Total Score</option>
                <option value="leetcode">Sort: LeetCode Solved</option>
                <option value="codeforces">Sort: Codeforces Rating</option>
                <option value="codechef">Sort: CodeChef Rating</option>
                <option value="gfg">Sort: GFG Score</option>
                <option value="streak">Sort: Streak Count</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-850 rounded-lg px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-950/60 font-semibold text-xs text-slate-650 dark:text-slate-350 transition-colors shrink-0 select-none"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === "desc" ? "High → Low" : "Low → High"}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Metadata dropdown selectors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: selectedCollege, onChange: setSelectedCollege, options: collegeOptions },
            { value: selectedBranch, onChange: setSelectedBranch, options: branchOptions },
            { value: selectedBatch, onChange: setSelectedBatch, options: batchOptions },
            { value: selectedYear, onChange: setSelectedYear, options: yearOptions }
          ].map((item, idx) => (
            <div key={idx} className="relative text-2xs">
              <select
                value={item.value}
                onChange={(e) => { item.onChange(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 rounded-lg py-2.5 pl-3.5 pr-10 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {item.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Row 3: Platform Pills */}
        <div className="border-t border-slate-100 dark:border-slate-850/65 pt-4 flex flex-col md:flex-row md:items-center gap-4 text-xs font-semibold">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">
            Platform
          </span>

          <div className="flex flex-wrap gap-2.5">
            {[
              { id: "All", label: "All" },
              { id: "LeetCode", label: "LeetCode" },
              { id: "Codeforces", label: "Codeforces" },
              { id: "CodeChef", label: "CodeChef" },
              { id: "GFG", label: "GFG" },
              { id: "Streak", label: "🔥 Streak" }
            ].map((pill) => {
              const isSelected = activePlatform === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => handlePillClick(pill.id)}
                  className={`px-4 py-1.5 rounded-full border text-2xs font-semibold transition-all duration-150 focus:outline-none ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-650 text-white shadow-2xs"
                      : "border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION 3: LEADERBOARD TABLE */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-24">
          <span className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-8 w-8 bg-indigo-500" />
          </span>
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-xl shadow-2xs">
          <Trophy className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No students found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-850 font-bold text-3xs uppercase tracking-wider text-slate-450">
                    {/* Headers click triggers sort */}
                    {[
                      { id: "rank", label: "#", align: "center", className: "w-20" },
                      { id: "username", label: "Student", align: "left" },
                      { id: "score", label: "Score", align: "left" },
                      { id: "leetcode", label: "LeetCode", align: "left" },
                      { id: "codeforces", label: "Codeforces", align: "left" },
                      { id: "codechef", label: "CodeChef", align: "left" },
                      { id: "gfg", label: "GFG", align: "left" },
                      { id: "streak", label: "Streak", align: "left" }
                    ].map((col) => {
                      const isSortedCol = sortBy === col.id || (col.id === "score" && sortBy === "score") || (col.id === "leetcode" && sortBy === "leetcode");
                      return (
                        <th
                          key={col.id}
                          onClick={() => col.id !== "rank" && handleSortHeader(col.id)}
                          className={`py-4.5 px-6 font-bold ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.className || ""} ${col.id !== "rank" ? "cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200" : ""}`}
                        >
                          <div className={`flex items-center gap-1 ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start"}`}>
                            <span>{col.label}</span>
                            {isSortedCol && (
                              <span className="text-[10px] text-indigo-500 font-bold">
                                {sortOrder === "desc" ? "↓" : "↑"}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-750 dark:text-slate-350">
                  {paginatedUsers.map((item, localIndex) => {
                    // Global index calculation
                    const index = (currentPage - 1) * itemsPerPage + localIndex;
                    const isCurrentUser = currentUser && item._id.toString() === currentUser._id.toString();
                    const isTopThree = index < 3;

                    // Medal rendering configurations
                    let rankContent;
                    if (index === 0) rankContent = <span className="text-base" title="Rank 1 - Gold Medalist">🥇</span>;
                    else if (index === 1) rankContent = <span className="text-base" title="Rank 2 - Silver Medalist">🥈</span>;
                    else if (index === 2) rankContent = <span className="text-base" title="Rank 3 - Bronze Medalist">🥉</span>;
                    else {
                      rankContent = (
                        <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 font-bold">
                          {index + 1}
                        </span>
                      );
                    }

                    // Avatar color
                    const avatarColorClass = getAvatarColor(item.username);

                    // Row highlights
                    let rowBg = "hover:bg-slate-50/40 dark:hover:bg-slate-850/20";
                    if (isCurrentUser) {
                      rowBg = "bg-indigo-50/30 dark:bg-indigo-950/15 font-semibold text-indigo-900 dark:text-indigo-350";
                    } else if (index === 0) {
                      rowBg = "bg-amber-500/[0.02] hover:bg-amber-500/[0.04] dark:bg-amber-500/[0.01]";
                    } else if (index === 1 || index === 2) {
                      rowBg = "bg-indigo-500/[0.01] hover:bg-indigo-500/[0.03]";
                    }

                    // Left highlight border for top 3 & current logged in user
                    let borderHighlight = "border-l-4 border-l-transparent";
                    if (isCurrentUser) borderHighlight = "border-l-4 border-l-indigo-600 dark:border-l-indigo-500";
                    else if (index === 0) borderHighlight = "border-l-4 border-l-amber-400/80";
                    else if (index === 1) borderHighlight = "border-l-4 border-l-slate-400/80";
                    else if (index === 2) borderHighlight = "border-l-4 border-l-amber-700/80";

                    return (
                      <tr
                        key={item._id}
                        className={`transition-all duration-150 border-b border-slate-100 dark:border-slate-850/40 ${borderHighlight} ${rowBg}`}
                      >
                        {/* Rank */}
                        <td className="py-4.5 px-6 text-center">
                          {rankContent}
                        </td>

                        {/* Student card (Name, avatar, details) */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`h-9 w-9 rounded-full ${avatarColorClass} flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-white/5 shrink-0`}>
                                {item.username.slice(0, 2).toUpperCase()}
                              </div>
                              {index === 0 && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rotate-[12deg] z-10" title="Section King crown">
                                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5 leading-none">
                                {item.username}
                                {isCurrentUser && (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                    You
                                  </span>
                                )}
                              </span>
                              <span className="text-4xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                                {item.branch} · {item.batch}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Dynamic Score column */}
                        <td className="py-4.5 px-6 font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {getDisplayScoreValue(item)}
                        </td>

                        {/* LeetCode count */}
                        <td className="py-4.5 px-6 font-semibold text-slate-650 dark:text-slate-350">
                          {item.lcSolved !== null ? item.lcSolved : "—"}
                        </td>

                        {/* Codeforces rating */}
                        <td className="py-4.5 px-6 font-semibold text-slate-650 dark:text-slate-350">
                          {item.cfRating !== null ? item.cfRating : "—"}
                        </td>

                        {/* CodeChef rating */}
                        <td className="py-4.5 px-6 font-semibold text-slate-650 dark:text-slate-350">
                          {item.ccRating !== null ? item.ccRating : "—"}
                        </td>

                        {/* GFG Score */}
                        <td className="py-4.5 px-6 font-semibold text-slate-650 dark:text-slate-350">
                          {item.gfgScore !== null ? item.gfgScore : "—"}
                        </td>

                        {/* Streak count */}
                        <td className="py-4.5 px-6">
                          {item.streakVal !== null && item.streakVal > 0 ? (
                            <span className="inline-flex items-center gap-0.5 font-bold text-slate-800 dark:text-slate-200">
                              <span className="text-[11px]" title="Active Streak">🔥</span>
                              <span>{item.streakVal}d</span>
                            </span>
                          ) : (
                            <span className="text-slate-450">—</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION CONTROLLER */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg border font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-indigo-600 border-indigo-650 text-white"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Leaderboard;
