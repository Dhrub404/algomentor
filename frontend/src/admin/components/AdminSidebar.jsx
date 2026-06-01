import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Code2,
  Trophy,
  Settings,
  ShieldCheck
} from "lucide-react";

const AdminSidebar = () => {
  const adminNavItems = [
    { name: "Stats Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", path: "/admin/users", icon: Users },
    { name: "Curriculum Editor", path: "/admin/topics", icon: BookOpen },
    { name: "Problem Library", path: "/admin/problems", icon: Code2 },
    { name: "Global Ranks", path: "/admin/leaderboard", icon: Trophy },
    { name: "System Settings", path: "/admin/settings", icon: Settings }
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-slate-800 bg-slate-900/10 flex flex-col justify-between py-6 shrink-0">
      <div className="flex flex-col gap-1 px-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500 shadow-sm"
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

      <div className="px-6 text-3xs text-slate-600 flex flex-col gap-1 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500/50" />
          <span>Security Level: root</span>
        </div>
        <span>AlgoMentor Admin Panel</span>
      </div>
    </aside>
  );
};

export default AdminSidebar;
