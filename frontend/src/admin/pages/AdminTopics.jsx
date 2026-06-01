import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, RefreshCw, Plus, Edit3, X, Save, AlertTriangle } from "lucide-react";
import { getDifficultyColor } from "../../utils/helpers";

const AdminTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSubtopic, setEditingSubtopic] = useState(null);
  const [addingSubtopicToTopicId, setAddingSubtopicToTopicId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    difficulty: "easy",
    prerequisites: [],
    unlockThreshold: 35
  });

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/topics");
      setTopics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleEditClick = (topicId, sub) => {
    setEditingSubtopic({ topicId, _id: sub._id });
    setFormData({
      name: sub.name,
      difficulty: sub.difficulty,
      prerequisites: sub.prerequisites || [],
      unlockThreshold: sub.unlockThreshold || 35
    });
  };

  const handleAddClick = (topicId) => {
    setAddingSubtopicToTopicId(topicId);
    setFormData({
      name: "",
      difficulty: "easy",
      prerequisites: [],
      unlockThreshold: 35
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePrereqToggle = (subName) => {
    setFormData((prev) => {
      const nextPrereq = prev.prerequisites.includes(subName)
        ? prev.prerequisites.filter((p) => p !== subName)
        : [...prev.prerequisites, subName];
      return { ...prev, prerequisites: nextPrereq };
    });
  };

  const handleSaveEdit = async () => {
    const { topicId, _id } = editingSubtopic;
    try {
      await axios.put(`http://localhost:5000/api/admin/topics/${topicId}/subtopic/${_id}`, formData);
      alert("Subtopic updated successfully");
      setEditingSubtopic(null);
      fetchTopics();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleSaveAdd = async () => {
    const topicId = addingSubtopicToTopicId;
    try {
      await axios.post(`http://localhost:5000/api/admin/topics/${topicId}/subtopic`, formData);
      alert("Subtopic created successfully");
      setAddingSubtopicToTopicId(null);
      fetchTopics();
    } catch (err) {
      alert("Creation failed");
    }
  };

  // Get flat list of all subtopics names to show as prerequisites options
  const allSubtopicNames = topics.reduce((acc, t) => {
    const subs = t.subtopics.map((s) => s.name);
    return acc.concat(subs);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space font-extrabold text-2xl text-white tracking-tight my-0 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-amber-500" />
            DSA Curriculum Editor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Edit unlock limits, modify subtopic difficulty levels, and adjust prerequisite dependencies.
          </p>
        </div>
        <button
          onClick={fetchTopics}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Topics list */}
          <div className="flex flex-col gap-6">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-space font-bold text-slate-200 text-sm">{topic.name}</h3>
                  <button
                    onClick={() => handleAddClick(topic._id)}
                    className="flex items-center gap-1 text-3xs font-bold uppercase px-2.5 py-1 rounded bg-indigoAccent/10 text-indigo-400 hover:bg-indigoAccent hover:text-white border border-indigoAccent/15 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Subtopic
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {topic.subtopics.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-3.5 rounded-xl bg-slate-950/20 border border-slate-850 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-slate-200">{sub.name}</span>
                        <div className="flex items-center gap-2 flex-wrap text-4xs">
                          <span className={`px-1.5 py-0.2 rounded font-semibold uppercase ${getDifficultyColor(sub.difficulty)}`}>
                            {sub.difficulty}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400">
                            Threshold: {sub.unlockThreshold}%
                          </span>
                          {sub.prerequisites?.length > 0 && (
                            <span className="text-slate-500 font-medium font-mono">
                              Prereq: {sub.prerequisites.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleEditClick(topic._id, sub)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-500/25 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Edit/Add Editor Form */}
          <div className="flex flex-col gap-6 sticky top-24">
            
            {editingSubtopic && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/20 shadow-xl flex flex-col gap-5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-space font-bold text-sm text-rose-400 m-0">Edit Subtopic Mapping</h3>
                  <button onClick={() => setEditingSubtopic(null)} className="text-slate-500 hover:text-slate-200">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Subtopic Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    />
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

                  {/* Unlock Threshold */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                      Unlock Threshold Rate (%)
                    </label>
                    <input
                      type="number"
                      name="unlockThreshold"
                      value={formData.unlockThreshold}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Prerequisites */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                      Prerequisites (Check to link)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-2 bg-slate-950 border border-slate-850 rounded-xl">
                      {allSubtopicNames
                        .filter((n) => n !== formData.name) // Can't depend on itself
                        .map((n) => {
                          const checked = formData.prerequisites.includes(n);
                          return (
                            <button
                              key={n}
                              onClick={() => handlePrereqToggle(n)}
                              className={`p-2 rounded-lg border text-left text-3xs font-semibold flex items-center gap-2 transition-all ${
                                checked
                                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                  : "border-transparent text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              <div className="w-3.5 h-3.5 rounded border border-slate-800 flex items-center justify-center">
                                {checked && <div className="w-2 h-2 rounded bg-rose-500" />}
                              </div>
                              <span className="truncate">{n}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveEdit}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mt-2"
                >
                  <Save className="w-4 h-4" />
                  Save Subtopic
                </button>
              </div>
            )}

            {addingSubtopicToTopicId && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/20 shadow-xl flex flex-col gap-5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-space font-bold text-sm text-indigo-400 m-0">Add New Subtopic</h3>
                  <button onClick={() => setAddingSubtopicToTopicId(null)} className="text-slate-500 hover:text-slate-200">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">Subtopic Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Tree Traversals"
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    />
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

                  {/* Unlock Threshold */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                      Unlock Threshold Rate (%)
                    </label>
                    <input
                      type="number"
                      name="unlockThreshold"
                      value={formData.unlockThreshold}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Prerequisites */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-4xs font-bold uppercase tracking-wider text-slate-500">
                      Prerequisites (Check to link)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-2 bg-slate-950 border border-slate-850 rounded-xl">
                      {allSubtopicNames.map((n) => {
                        const checked = formData.prerequisites.includes(n);
                        return (
                          <button
                            key={n}
                            onClick={() => handlePrereqToggle(n)}
                            className={`p-2 rounded-lg border text-left text-3xs font-semibold flex items-center gap-2 transition-all ${
                              checked
                                ? "bg-indigoAccent/10 border-indigoAccent/30 text-indigo-400"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            <div className="w-3.5 h-3.5 rounded border border-slate-800 flex items-center justify-center">
                              {checked && <div className="w-2 h-2 rounded bg-indigoAccent" />}
                            </div>
                            <span className="truncate">{n}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveAdd}
                  className="w-full bg-indigoAccent hover:bg-indigo-600 text-white py-2 px-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Subtopic
                </button>
              </div>
            )}

            {!editingSubtopic && !addingSubtopicToTopicId && (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 flex flex-col items-center justify-center py-20 text-slate-500 text-center text-xs">
                <AlertTriangle className="w-8 h-8 text-slate-600 mb-2" />
                <span>Select a subtopic edit button, or click "Add Subtopic" on a topic card to launch configuration editor.</span>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
};

export default AdminTopics;
