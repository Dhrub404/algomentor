import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function DecayAlert({ userId }) {
  const [isVisible, setIsVisible] = useState(true);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadDecayAlert() {
      try {
        const response = await api.get("/api/dashboard/decay-alert");

        if (!isMounted) return;

        if (response.data && response.data.needsRevision) {
          setAlert(response.data);
        }
      } catch (error) {
        console.error("Fetch decay alert error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (userId) {
      loadDecayAlert();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading || !alert || !isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 mb-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2.5 items-start">
          <span className="text-lg shrink-0 mt-0.5">⚠️</span>
          <div className="text-left">
            <h3 className="font-bold text-amber-850 dark:text-amber-300 text-sm m-0">
              Decay Alert: You have {alert.totalCount} subtopics requiring revision.
            </h3>
            <p className="text-amber-700/80 dark:text-amber-400/70 text-xs m-0 mt-0.5">
              Neglecting these areas for over 14 days causes mastery decay.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-300 text-lg focus:outline-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Topics - Inline display */}
      <div className="flex flex-wrap gap-2 mb-3">
        {alert.topicsList.map((topic, idx) => (
          <span
            key={idx}
            onClick={() => navigate("/practice?tab=revision")}
            className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/45 dark:border-amber-900/10 px-3 py-1 rounded
                       hover:bg-amber-200/70 dark:hover:bg-amber-900/60 cursor-pointer transition-colors font-semibold"
          >
            {topic.subtopic}
          </span>
        ))}
        {alert.totalCount > 3 && (
          <span className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1 font-semibold">
            +{alert.totalCount - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

export default DecayAlert;

