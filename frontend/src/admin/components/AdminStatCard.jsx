import React from "react";

const AdminStatCard = ({ title, value, icon: Icon, description, color = "rose" }) => {
  const colorMap = {
    rose: {
      bgIcon: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      borderGlow: "hover:border-rose-500/25 shadow-rose-500/5 hover:shadow-rose-500/10"
    },
    amber: {
      bgIcon: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      borderGlow: "hover:border-amber-500/25 shadow-amber-500/5 hover:shadow-amber-500/10"
    },
    indigo: {
      bgIcon: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      borderGlow: "hover:border-indigo-500/25 shadow-indigo-500/5 hover:shadow-indigo-500/10"
    },
    emerald: {
      bgIcon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      borderGlow: "hover:border-emerald-500/25 shadow-emerald-500/5 hover:shadow-emerald-500/10"
    }
  };

  const scheme = colorMap[color] || colorMap.rose;

  return (
    <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-300 ${scheme.borderGlow} flex items-center gap-4`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${scheme.bgIcon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <h3 className="font-space font-extrabold text-2xl text-slate-100 my-0 mt-0.5">
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
