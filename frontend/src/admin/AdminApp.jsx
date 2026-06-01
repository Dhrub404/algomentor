import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Admin Components
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTopics from "./pages/AdminTopics";
import AdminProblems from "./pages/AdminProblems";
import AdminLeaderboard from "./pages/AdminLeaderboard";
import AdminSettings from "./pages/AdminSettings";

import { ShieldAlert, RefreshCw } from "lucide-react";

// Admin Context to pass auth actions
export const AdminContext = React.createContext();

const AdminApp = () => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = (token) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
    // Configure default headers for future calls
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    navigate("/admin/dashboard");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    delete axios.defaults.headers.common["Authorization"];
    navigate("/admin/login");
  };

  // Configure Axios headers on mount/token update
  useEffect(() => {
    if (adminToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    setLoading(false);
  }, [adminToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigoAccent">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Guard routing
  const isLoginPage = location.pathname === "/admin/login";
  if (!adminToken && !isLoginPage) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminContext.Provider value={{ adminToken, login: handleAdminLogin, logout: handleAdminLogout }}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-outfit">
        {/* Navbar */}
        {!isLoginPage && <AdminNavbar />}

        {/* Workspace */}
        <div className="flex flex-1 w-full">
          {!isLoginPage && <AdminSidebar />}

          <main className="flex-1 flex flex-col p-6 overflow-y-auto">
            <Routes>
              {/* Public admin */}
              <Route path="login" element={<AdminLogin />} />

              {/* Protected admin */}
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="topics" element={<AdminTopics />} />
              <Route path="problems" element={<AdminProblems />} />
              <Route path="leaderboard" element={<AdminLeaderboard />} />
              <Route path="settings" element={<AdminSettings />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to={adminToken ? "dashboard" : "login"} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
};

export default AdminApp;
