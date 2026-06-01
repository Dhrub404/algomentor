import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Map,
  CheckSquare,
  BarChart3,
  Trophy,
  User,
  HelpCircle
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Topic Explorer", path: "/explorer", icon: Compass },
    { name: "Personalized Roadmap", path: "/roadmap", icon: Map },
    { name: "Practice Generator", path: "/practice", icon: CheckSquare },
    { name: "Contest Tracker", path: "/contests", icon: BarChart3 },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "My Profile", path: "/profile", icon: User }
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-darkBorder/40 glass-panel flex flex-col justify-between py-6">
      {/* Navigation */}
      <div className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigoAccent/15 to-indigoAccent/5 text-indigo-400 border-l-4 border-indigoAccent shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-6 text-2xs text-slate-500 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 hover:text-slate-400 cursor-pointer transition-colors">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support & FAQ</span>
        </div>
        <span>AlgoMentor v1.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
