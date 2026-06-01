import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../AdminApp";
import { ShieldCheck, LogOut, Layout } from "lucide-react";

const AdminNavbar = () => {
  const { logout } = useContext(AdminContext);

  return (
    <nav className="h-16 w-full bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Brand & Badge */}
      <div className="flex items-center gap-3">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
            M
          </div>
          <span className="font-sans font-bold text-lg text-slate-100 tracking-tight">
            AlgoMentor <span className="text-indigo-400 font-mono text-3xs border border-indigo-500/30 px-2 py-0.5 rounded-full ml-1 bg-indigo-500/5">ADMIN</span>
          </span>
        </Link>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-4">
        {/* Main App Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
        >
          <Layout className="w-3.5 h-3.5" />
          Go to App
        </a>

        <div className="h-6 w-px bg-slate-800" />

        {/* Admin profile */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Admin User</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
