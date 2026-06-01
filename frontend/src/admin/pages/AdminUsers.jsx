import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Settings,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  X,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react";
import { formatDate } from "../../utils/helpers";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [syncingUser, setSyncingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenUser = async (userId) => {
    setSyncingUser(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/users/${userId}`);
      setSelectedUser(res.data);
      setModalOpen(true);
    } catch (err) {
      alert("Failed to load user details");
    } finally {
      setSyncingUser(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space font-extrabold text-2xl text-white tracking-tight my-0 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-rose-500" />
            User Account Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate profiles, override progress milestones, trigger engines on-demand, and manage lock parameters.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Roster Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
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
      </div>

      {/* Roster Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-rose-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-space text-3xs uppercase tracking-wider font-extrabold">
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Current Level</th>
                  <th className="py-4 px-6">Linked Handles</th>
                  <th className="py-4 px-6 text-center">Studied Scope</th>
                  <th className="py-4 px-6 text-center">Avg Mastery</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-200">{u.username}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">{u.email}</td>
                    <td className="py-4 px-6 uppercase font-bold text-3xs tracking-wider text-rose-400">
                      {u.currentLevel}
                    </td>
                    <td className="py-4 px-6 font-mono text-4xs text-slate-400">
                      {u.codeforcesHandle && <span className="mr-3 text-rose-400">CF: {u.codeforcesHandle}</span>}
                      {u.leetcodeHandle && <span className="text-amber-500">LC: {u.leetcodeHandle}</span>}
                      {!u.codeforcesHandle && !u.leetcodeHandle && <span className="text-slate-600 italic">None linked</span>}
                    </td>
                    <td className="py-4 px-6 text-center font-bold font-mono">{u.studiedCount} subtopics</td>
                    <td className="py-4 px-6 text-center font-bold font-space text-slate-200">{u.avgMastery}%</td>
                    <td className="py-4 px-6 text-slate-500">{formatDate(u.joinedDate)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenUser(u._id)}
                        disabled={syncingUser}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg text-4xs font-bold uppercase transition-all"
                      >
                        {syncingUser ? "Opening..." : "Simulate / Test"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Simulation Modal */}
      {modalOpen && selectedUser && (
        <UserDetailModal
          userObj={selectedUser}
          onClose={() => {
            setModalOpen(false);
            setSelectedUser(null);
            fetchUsers(); // Refresh list to reflect updates
          }}
        />
      )}
    </div>
  );
};

// Modal Component for Deep Simulation Actions
const UserDetailModal = ({ userObj, onClose }) => {
  const { user, progress, performances } = userObj;
  
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [overrideMastery, setOverrideMastery] = useState("");
  const [overrideThreshold, setOverrideThreshold] = useState(
    progress.overrideUnlockThreshold === null ? "" : progress.overrideUnlockThreshold
  );
  
  const [engineOutput, setEngineOutput] = useState(null);
  const [engineLoading, setEngineLoading] = useState(false);
  const [simulatingProblem, setSimulatingProblem] = useState(null);

  // Fetch problems and topics list to show choices
  useEffect(() => {
    const fetchSelectables = async () => {
      try {
        const [probRes, topRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/problems"),
          axios.get("http://localhost:5000/api/admin/topics")
        ]);
        setProblems(probRes.data);
        setTopics(topRes.data);
        
        // Default select first subtopic
        if (topRes.data.length > 0 && topRes.data[0].subtopics.length > 0) {
          setSelectedSubtopic(topRes.data[0].subtopics[0].name);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSelectables();
  }, []);

  const triggerAction = async (endpoint, data, successAlert) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${user._id}/${endpoint}`, data);
      alert(successAlert || "Action completed successfully!");
      // reload user modal data
      const refetch = await axios.get(`http://localhost:5000/api/admin/users/${user._id}`);
      userObj.progress = refetch.data.progress;
      userObj.performances = refetch.data.performances;
      // Trigger local render sync
      setOverrideThreshold(refetch.data.progress.overrideUnlockThreshold === null ? "" : refetch.data.progress.overrideUnlockThreshold);
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleSaveMastery = () => {
    if (overrideMastery === "" || isNaN(overrideMastery)) return;
    triggerAction("mastery", {
      subtopic: selectedSubtopic,
      masteryScore: parseInt(overrideMastery)
    }, `Mastery score for "${selectedSubtopic}" set to ${overrideMastery}%`);
  };

  const handleForceUnlock = (subName) => {
    triggerAction("unlock-subtopic", { subtopic: subName }, `Subtopic "${subName}" force-unlocked.`);
  };

  const handleForceLock = (subName) => {
    triggerAction("lock-subtopic", { subtopic: subName }, `Subtopic "${subName}" force-locked.`);
  };

  const handleSaveOverrideThreshold = async () => {
    try {
      const val = overrideThreshold === "" ? null : parseInt(overrideThreshold);
      await axios.put(`http://localhost:5000/api/admin/users/${user._id}/override-threshold`, {
        threshold: val
      });
      alert("Unlock threshold override updated successfully!");
    } catch (err) {
      alert("Failed to update override threshold");
    }
  };

  const handleSimulateProblem = async (problemId, status) => {
    setSimulatingProblem(problemId);
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${user._id}/mark-problem`, {
        problemId,
        status
      });
      // reload user details
      const refetch = await axios.get(`http://localhost:5000/api/admin/users/${user._id}`);
      userObj.progress = refetch.data.progress;
      userObj.performances = refetch.data.performances;
    } catch (err) {
      alert("Failed to simulate status");
    } finally {
      setSimulatingProblem(null);
    }
  };

  const handleResetProgress = async () => {
    if (!window.confirm("CAUTION: This will delete ALL progress, solved problems, and topic performance logs for this user. Continue?")) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/users/${user._id}/reset-progress`);
      alert("User progress completely reset!");
      onClose();
    } catch (err) {
      alert("Reset failed");
    }
  };

  const handleRunEngine = async (engineName) => {
    setEngineLoading(true);
    setEngineOutput(null);
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/users/${user._id}/run-engine/${engineName}`);
      setEngineOutput({
        name: engineName,
        data: res.data.output
      });
    } catch (err) {
      alert("Engine run failed");
    } finally {
      setEngineLoading(false);
    }
  };

  // Maps solved set to compare statuses
  const solvedSet = new Set(progress.solvedProblems.map(id => id.toString()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="font-space font-bold text-slate-100 text-sm">
              Simulation Console &rarr; {user.username}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left panel: Overrides & Engines */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Override threshold and reset */}
            <div className="p-4 rounded-2xl bg-slate-950/20 border border-slate-800 flex flex-col gap-4 text-xs">
              <h4 className="font-space font-bold text-rose-400 m-0">General Overrides</h4>

              <div className="flex flex-col gap-2">
                <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                  Override Unlock Threshold (%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 50 (null for system settings)"
                    value={overrideThreshold}
                    onChange={(e) => setOverrideThreshold(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:border-rose-500/50 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveOverrideThreshold}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>

              <button
                onClick={handleResetProgress}
                className="mt-2 w-full py-2.5 rounded-lg border border-rose-500/25 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold uppercase flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Progress
              </button>
            </div>

            {/* Overwrite Mastery */}
            <div className="p-4 rounded-2xl bg-slate-950/20 border border-slate-800 flex flex-col gap-4 text-xs">
              <h4 className="font-space font-bold text-rose-400 m-0">Overwrite Mastery Score</h4>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                    Select Subtopic
                  </label>
                  <select
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs"
                  >
                    {topics.map((t) =>
                      t.subtopics.map((s) => (
                        <option key={s.name} value={s.name}>
                          {t.name} &rarr; {s.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                    Mastery Score (0-100)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 75"
                      value={overrideMastery}
                      onChange={(e) => setOverrideMastery(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs"
                    />
                    <button
                      onClick={handleSaveMastery}
                      className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold"
                    >
                      Save Score
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bypass Lock/Unlock subtopics */}
            <div className="p-4 rounded-2xl bg-slate-950/20 border border-slate-800 flex flex-col gap-4 text-xs">
              <h4 className="font-space font-bold text-rose-400 m-0">Force Lock / Unlock Override</h4>
              <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                {topics.map((t) =>
                  t.subtopics.map((s) => {
                    const isForcedUnlock = progress.forcedUnlockedSubtopics?.includes(s.name);
                    const isForcedLock = progress.forcedLockedSubtopics?.includes(s.name);
                    
                    return (
                      <div key={s.name} className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                        <span className="font-medium text-slate-300 truncate max-w-[140px]" title={s.name}>
                          {s.name}
                        </span>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleForceUnlock(s.name)}
                            className={`p-1.5 rounded-lg border text-4xs font-bold uppercase flex items-center gap-1 transition-all ${
                              isForcedUnlock
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "border-slate-800 text-slate-500 hover:text-emerald-400"
                            }`}
                            title="Force Unlock Subtopic"
                          >
                            <Unlock className="w-3 h-3" />
                            Unlock
                          </button>
                          <button
                            onClick={() => handleForceLock(s.name)}
                            className={`p-1.5 rounded-lg border text-4xs font-bold uppercase flex items-center gap-1 transition-all ${
                              isForcedLock
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                : "border-slate-800 text-slate-500 hover:text-rose-400"
                            }`}
                            title="Force Lock Subtopic"
                          >
                            <Lock className="w-3 h-3" />
                            Lock
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Run engines */}
            <div className="p-4 rounded-2xl bg-slate-950/20 border border-slate-800 flex flex-col gap-4 text-xs">
              <h4 className="font-space font-bold text-rose-400 m-0">Engine Execution Controls</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Weakness Engine", key: "weakness" },
                  { name: "Unlock Engine", key: "unlock" },
                  { name: "Practice Engine", key: "practice" },
                  { name: "Revision Engine", key: "revision" }
                ].map((eng) => (
                  <button
                    key={eng.key}
                    onClick={() => handleRunEngine(eng.key)}
                    disabled={engineLoading}
                    className="py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 font-bold transition-all flex items-center justify-center gap-1 text-3xs uppercase"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {eng.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel: Problem statuses / Engine output log */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* If engine log is active, display it */}
            {engineOutput && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col gap-3 relative animate-in slide-in-from-top-4 duration-200">
                <button
                  onClick={() => setEngineOutput(null)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute top-3 right-3"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <h4 className="font-space font-bold text-xs text-rose-400 m-0 uppercase tracking-wider">
                  Engine Output: {engineOutput.name}
                </h4>
                
                <pre className="text-[10px] font-mono text-emerald-400 leading-normal max-h-[160px] overflow-y-auto bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  {JSON.stringify(engineOutput.data, null, 2)}
                </pre>
              </div>
            )}

            {/* Problem Simulation Table */}
            <div className="p-5 rounded-3xl bg-slate-950/20 border border-slate-800 flex-1 flex flex-col gap-3 overflow-hidden">
              <h4 className="font-space font-bold text-xs text-slate-200 m-0">
                Simulation Library: Problem Markings
              </h4>
              <p className="text-4xs text-slate-500 my-0">
                Adjusting problem status automatically updates UserProgress and evaluates unlocks dynamically.
              </p>

              {/* Table */}
              <div className="flex-1 overflow-y-auto mt-2 pr-1">
                <div className="flex flex-col gap-2">
                  {problems.map((prob) => {
                    const isSolved = solvedSet.has(prob._id.toString());
                    const currentStatus = isSolved ? "solved" : "not attempted";

                    return (
                      <div
                        key={prob._id}
                        className="p-3 rounded-xl border border-slate-800/65 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-2xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200">{prob.title}</span>
                          <span className="text-4xs text-slate-500 font-mono mt-0.5">
                            {prob.platform.toUpperCase()} &bull; {prob.subtopic} &bull; {prob.difficulty.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          {["solved", "attempted", "not attempted"].map((status) => {
                            const active =
                              status === "solved" && isSolved
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                                : status === "attempted" && !isSolved
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold"
                                : status === "not attempted" && !isSolved
                                ? "bg-slate-850 text-slate-400 border-transparent"
                                : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300";

                            return (
                              <button
                                key={status}
                                onClick={() => handleSimulateProblem(prob._id, status)}
                                disabled={simulatingProblem !== null}
                                className={`px-2.5 py-1 rounded-lg border text-4xs uppercase tracking-wider transition-all ${active}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
