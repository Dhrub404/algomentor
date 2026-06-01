import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default authorization header if token exists
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setAuthHeader(token);
        try {
          // Fetch current user details and progress
          const response = await axios.get("http://localhost:5000/api/user/profile");
          setUser(response.data);
        } catch (error) {
          console.error("Error loading user profile:", error);
          localStorage.removeItem("token");
          setAuthHeader(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password
      });

      const { token, ...userData } = response.data;
      localStorage.setItem("token", token);
      setAuthHeader(token);

      // Fetch full profile (includes empty progress schemas)
      const profileResponse = await axios.get("http://localhost:5000/api/user/profile");
      setUser(profileResponse.data);
      setLoading(false);
      return profileResponse.data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      setAuthHeader(token);

      const profileResponse = await axios.get("http://localhost:5000/api/user/profile");
      setUser(profileResponse.data);
      setLoading(false);
      return profileResponse.data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || "Login failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthHeader(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("http://localhost:5000/api/user/update", profileData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Profile update failed";
    }
  };

  const connectHandles = async (handlesObj) => {
    try {
      const response = await axios.post("http://localhost:5000/api/user/connect-platform", handlesObj);
      setUser({
        user: response.data.user,
        progress: response.data.progress,
        performances: response.data.performances
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Connecting handles failed";
    }
  };

  const refetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/profile");
      setUser(response.data);
    } catch (error) {
      console.error("Error refetching user details:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user?.user || null,
        progress: user?.progress || null,
        performances: user?.performances || [],
        loading,
        register,
        login,
        logout,
        updateProfile,
        connectHandles,
        refetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
