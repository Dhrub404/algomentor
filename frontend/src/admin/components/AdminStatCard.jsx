import React from "react";

const AdminStatCard = ({ title, value, icon: Icon, description, color = "indigo" }) => {
  const colorMap = {
    red: {
      bgIcon: "bg-red-500/10 border-red-500/20 text-red-400",
      borderGlow: "hover:border-red-500/25"
    },
    amber: {
      bgIcon: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      borderGlow: "hover:border-amber-500/25"
    },
    indigo: {
      bgIcon: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      borderGlow: "hover:border-indigo-500/25"
    },
    emerald: {
      bgIcon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      borderGlow: "hover:border-emerald-500/25"
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-6 rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300 ${scheme.borderGlow} flex items-center gap-4 text-left`}>
      <div className={`h-12 w-12 rounded-lg flex items-center justify-center border ${scheme.bgIcon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <h3 className="font-semibold text-2xl text-slate-100 my-0 mt-0.5">
          {value}
        </h3>
        {description && (
          <p className="text-4xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default AdminStatCard;
