export const formatDate = (dateString) => {
  if (!dateString) return "Never";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "hard":
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  }
};

export const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins > 0 ? `${mins}m` : ""}`;
  }
  return `${mins} mins`;
};
