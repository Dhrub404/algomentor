import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { LogIn, Mail, Lock } from "lucide-react";
import Toast from "../components/Toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [toast, setToast] = useState(null); // { type, message, key }
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (type, message) => {
    // Use a unique key so React always remounts the Toast (resets its timer)
    setToast({ type, message, key: Date.now() });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      const validationMessage = "Please fill in both email/username and password.";
      setErrorMessage(validationMessage);
      showToast("error", validationMessage);
      return;
    }

    setErrorMessage("");
    setLoggingIn(true);

    try {
      const userData = await login(email, password);
      const username = userData?.user?.username || "user";
      showToast("success", `Welcome back, ${username}!`);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error("Login attempt failed:", err);
      const msg = typeof err === "string"
        ? err
        : err?.message || "Invalid email/username or password";
      setErrorMessage(msg);
      showToast("error", msg);
      // Also show a simple popup so the user sees an immediate message
      // (keeps existing toast behavior intact)
      try {
        window.alert("You have entered the wrong id and password");
      } catch (e) {
        // ignore if alerts are unavailable
      }
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* Toast renders via portal directly to document.body */}
      {toast && (
        <Toast
          key={toast.key}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight my-0">
            Sign In Account
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Welcome back! Sign in to continue your CP diagnostics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left" noValidate>
          {/* Email / Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-4xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com or username"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-4xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-slate-100 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4" />
            {loggingIn ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850 text-center text-xs text-slate-400">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
