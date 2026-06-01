import React from "react";

const MasteryBar = ({ value = 0, size = "md" }) => {
  const roundedValue = Math.min(100, Math.max(0, Math.round(value)));

  // Color selection based on progress
  let progressColor = "from-amber-500 to-amber-400 shadow-amber-500/10";
  let textColor = "text-amber-400";
  let bgTrack = "bg-amber-500/10";

  if (roundedValue >= 70) {
    progressColor = "from-emerald-500 to-teal-400 shadow-emerald-500/10";
    textColor = "text-emerald-400";
    bgTrack = "bg-emerald-500/10";
  } else if (roundedValue >= 35) {
    progressColor = "from-indigoAccent to-violet-500 shadow-indigoAccent/10";
    textColor = "text-indigo-400";
    bgTrack = "bg-indigoAccent/10";
  }

  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className="w-full flex items-center gap-3">
      {/* ProgressBar */}
      <div className={`flex-1 ${bgTrack} rounded-full ${heightClass} overflow-hidden relative border border-white/5`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500 ease-out`}
          style={{ width: `${roundedValue}%` }}
        />
      </div>
      
      {/* Label percentage */}
      <span className={`font-space font-bold text-sm min-w-[2.5rem] text-right ${textColor}`}>
        {roundedValue}%
      </span>
    </div>
  );
};

export default MasteryBar;
