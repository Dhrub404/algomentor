import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Save, RefreshCw, AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    defaultUnlockThreshold: 35,
    revisionAlertDays: 14,
    dailyPracticeSize: 6,
    revisionAlertsEnabled: true,
    leaderboardVisible: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", message: "" }

  const fetchSettings = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setFeedback({ type: "error", message: "Failed to load system settings from API server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value) || 0
    }));
  };

  const handleToggle = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await axios.put("http://localhost:5000/api/admin/settings", settings);
      setSettings(res.data.settings);
      setFeedback({ type: "success", message: "System settings updated successfully." });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setFeedback({ type: "error", message: err.response?.data?.message || "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space font-extrabold text-2xl text-white tracking-tight my-0 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-rose-500" />
            Global Platform Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system constants, decay intervals, daily practice rules, and default engine thresholds.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          title="Reload Settings"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          {feedback.type === "success" ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Progression & Unlocks */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
              <h3 className="font-space font-bold text-sm text-slate-200 m-0 border-b border-slate-800/60 pb-2">
                DSA Progression & Unlocks
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-3xs font-semibold uppercase tracking-wider text-slate-400">
                  Default Unlock Threshold (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="defaultUnlockThreshold"
                    min="10"
                    max="90"
                    value={settings.defaultUnlockThreshold}
                    onChange={handleInputChange}
                    className="flex-1 accent-rose-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono text-sm font-bold text-rose-400 w-12 text-right">
                    {settings.defaultUnlockThreshold}%
                  </span>
                </div>
                <p className="text-5xs text-slate-500 leading-normal mt-1">
                  The fallback mastery score required in a subtopic to satisfy prerequisites for downstream modules. Individual subtopics can override this value.
                </p>
              </div>
            </div>

            {/* Daily Practice Limit */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
              <h3 className="font-space font-bold text-sm text-slate-200 m-0 border-b border-slate-800/60 pb-2">
                Daily Practice Sheet
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-3xs font-semibold uppercase tracking-wider text-slate-400">
                  Daily Practice Size (Problems)
                </label>
                <input
                  type="number"
                  name="dailyPracticeSize"
                  min="2"
                  max="15"
                  value={settings.dailyPracticeSize}
                  onChange={handleInputChange}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 text-xs font-semibold focus:border-rose-500/50 focus:outline-none"
                  required
                />
                <p className="text-5xs text-slate-500 leading-normal mt-1.5">
                  The maximum number of problems allocated in a user's daily personalized practice set. Balances weak area reinforcement and next-topic advancement.
                </p>
              </div>
            </div>

            {/* Inactivity Decay & Alerts */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
              <h3 className="font-space font-bold text-sm text-slate-200 m-0 border-b border-slate-800/60 pb-2">
                Inactivity Decay & Revisions
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-3xs font-semibold uppercase tracking-wider text-slate-400">
                  Revision Alert Trigger (Days)
                </label>
                <input
                  type="number"
                  name="revisionAlertDays"
                  min="3"
                  max="60"
                  value={settings.revisionAlertDays}
                  onChange={handleInputChange}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 text-xs font-semibold focus:border-rose-500/50 focus:outline-none"
                  required
                />
                <p className="text-5xs text-slate-500 leading-normal mt-1.5">
                  Number of days of zero activity in a studied subtopic before the revision engine triggers decay alerts and queues problems back to daily sheets.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                    Enable Decay Alerts
                  </span>
                  <span className="text-5xs text-slate-500">
                    Send subtopics to revision queues based on inactivity triggers.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("revisionAlertsEnabled")}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {settings.revisionAlertsEnabled ? (
                    <ToggleRight className="w-9 h-9 text-rose-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="font-space font-bold text-sm text-slate-200 m-0 border-b border-slate-800/60 pb-2">
                  Global Visibility Toggles
                </h3>
                <p className="text-5xs text-slate-500 leading-normal mt-3">
                  Restrict or open access to public social interfaces. If hidden, the client will restrict access to global standings.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                    Leaderboard Visible
                  </span>
                  <span className="text-5xs text-slate-500">
                    Allow student profiles to view rankings and comparisons.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("leaderboardVisible")}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {settings.leaderboardVisible ? (
                    <ToggleRight className="w-9 h-9 text-rose-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg hover:shadow-rose-500/10 transition-all"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save System Variables
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
