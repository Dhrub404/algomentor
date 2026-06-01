import React, { useState, useEffect } from "react";
import axios from "axios";
import { Code2, Search, Filter, Plus, Edit3, Trash2, X, Save, RefreshCw } from "lucide-react";
import { getDifficultyColor } from "../../utils/helpers";

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  // Editor states
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    platformProblemId: "",
    platform: "leetcode",
    title: "",
    url: "",
    topic: "",
    subtopic: "",
    difficulty: "easy",
    tags: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [probRes, topRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/problems"),
        axios.get("http://localhost:5000/api/admin/topics")
      ]);
      setProblems(probRes.data);
      setTopics(topRes.data);

      if (topRes.data.length > 0) {
        // Pre-fill default topic choices for adding
        setFormData((prev) => ({
          ...prev,
          topic: topRes.data[0].name,
          subtopic: topRes.data[0].subtopics[0]?.name || ""
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (prob) => {
    setEditingProblemId(prob._id);
    setIsAdding(false);
    setFormData({
      platformProblemId: prob.platformProblemId,
      platform: prob.platform,
      title: prob.title,
      url: prob.url,
      topic: prob.topic,
      subtopic: prob.subtopic,
      difficulty: prob.difficulty,
      tags: prob.tags ? prob.tags.join(", ") : ""
    });
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingProblemId(null);
    setFormData({
      platformProblemId: "",
      platform: "leetcode",
      title: "",
      url: "",
      topic: topics[0]?.name || "",
      subtopic: topics[0]?.subtopics[0]?.name || "",
      difficulty: "easy",
      tags: ""
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Check if topic changed to auto-select its first subtopic
    if (name === "topic") {
      const selectedTopicObj = topics.find((t) => t.name === value);
      const firstSub = selectedTopicObj?.subtopics[0]?.name || "";
      setFormData((prev) => ({
        ...prev,
        topic: value,
        subtopic: firstSub
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t !== "")
    };

    try {
      await axios.post("http://localhost:5000/api/admin/problems", payload);
      alert("Problem mapped successfully");
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save problem mapping");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t !== "")
    };

    try {
      await axios.put(`http://localhost:5000/api/admin/problems/${editingProblemId}`, payload);
      alert("Problem mapping updated");
      setEditingProblemId(null);
      fetchData();
    } catch (err) {
      alert("Failed to update problem mapping");
    }
  };

  const handleDelete = async (probId) => {
    if (!window.confirm("Are you sure you want to delete this problem mapping?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/problems/${probId}`);
      alert("Problem mapping deleted successfully");
      fetchData();
    } catch (err) {
      alert("Failed to delete mapping");
    }
  };

  // Get eligible subtopics for currently selected topic in form
  const currentFormTopicObj = topics.find((t) => t.name === formData.topic);
  const eligibleSubtopics = currentFormTopicObj ? currentFormTopicObj.subtopics : [];

  // Filter problems logic
  const filteredProblems = problems.filter((prob) => {
    const matchesSearch =
      prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prob.platformProblemId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = filterPlatform === "" || prob.platform === filterPlatform;
    const matchesTopic = filterTopic === "" || prob.topic === filterTopic;
    const matchesDiff = filterDifficulty === "" || prob.difficulty === filterDifficulty;

    return matchesSearch && matchesPlatform && matchesTopic && matchesDiff;
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space font-extrabold text-2xl text-white tracking-tight my-0 flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-rose-500" />
            DSA Problem Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Map competitive programming platform tasks to appropriate subtopic domains and difficulties.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Roster Controls & Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title or problem ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-10 pr-4 text-slate-200 text-xs focus:border-rose-500/50 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-2xs">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400 focus:text-slate-200"
          >
            <option value="">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>

          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400 focus:text-slate-200"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t._id} value={t.name}>{t.name}</option>
            ))}
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400 focus:text-slate-200"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg px-3 py-1.5 font-bold uppercase transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Problem
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-rose-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Problem mappings table */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-2xs">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-space text-4xs uppercase tracking-wider font-extrabold sticky top-0">
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-5">Title</th>
                    <th className="py-3 px-5">Platform</th>
                    <th className="py-3 px-5">Subtopic Domain</th>
                    <th className="py-3 px-5">Difficulty</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredProblems.map((prob) => {
                    const platformColor =
                      prob.platform === "codeforces"
                        ? "text-rose-400 border-rose-500/15 bg-rose-500/5"
                        : "text-amber-500 border-amber-500/15 bg-amber-500/5";

                    return (
                      <tr key={prob._id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-slate-400">{prob.platformProblemId}</td>
                        <td className="py-3.5 px-5">
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-200 hover:text-indigo-400 hover:underline"
                          >
                            {prob.title}
                          </a>
                        </td>
                        <td className="py-3.5 px-5 uppercase font-mono">
                          <span className={`px-2 py-0.5 rounded border text-4xs ${platformColor}`}>
                            {prob.platform}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-400">{prob.subtopic}</td>
                        <td className="py-3.5 px-5 uppercase font-bold text-3xs tracking-wider">
                          <span className={`px-2 py-0.5 rounded ${getDifficultyColor(prob.difficulty)}`}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleEditClick(prob)}
                            className="p-1 rounded bg-slate-950 border border-slate-850 hover:border-rose-500/25 text-slate-500 hover:text-rose-400 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prob._id)}
                            className="p-1 rounded bg-slate-950 border border-slate-850 hover:border-rose-500/25 text-slate-500 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Add/Edit form */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {(isAdding || editingProblemId) ? (
              <form
                onSubmit={isAdding ? handleSaveAdd : handleSaveEdit}
                className="p-6 rounded-2xl bg-slate-900 border border-rose-500/20 shadow-xl flex flex-col gap-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-space font-bold text-sm text-rose-400 m-0">
                    {isAdding ? "Add Problem Mapping" : "Edit Problem Mapping"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingProblemId(null);
                    }}
                    className="text-slate-500 hover:text-slate-200"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Platform */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Platform</label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200"
                      disabled={!isAdding}
                    >
                      <option value="leetcode">LeetCode</option>
                      <option value="codeforces">Codeforces</option>
                    </select>
                  </div>

                  {/* Problem ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                      Platform Problem Key / Slug
                    </label>
                    <input
                      type="text"
                      name="platformProblemId"
                      value={formData.platformProblemId}
                      onChange={handleFormChange}
                      placeholder="e.g. two-sum or 158A"
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                      disabled={!isAdding}
                      required
                    />
                  </div>

                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Problem Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Two Sum"
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Solve URL</label>
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleFormChange}
                      placeholder="e.g. https://leetcode.com/problems/..."
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Topic selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Major Topic</label>
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    >
                      {topics.map((t) => (
                        <option key={t._id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subtopic selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Subtopic Division</label>
                    <select
                      name="subtopic"
                      value={formData.subtopic}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    >
                      {eligibleSubtopics.map((s) => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleFormChange}
                      placeholder="e.g. arrays, brute-force"
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mt-2"
                >
                  <Save className="w-4 h-4" />
                  Save Mapping
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 flex flex-col items-center justify-center py-24 text-slate-500 text-center text-xs">
                <Code2 className="w-8 h-8 text-slate-600 mb-2" />
                <span>Select a problem edit button, or click "Add Problem" to map a new task.</span>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
};

export default AdminProblems;
