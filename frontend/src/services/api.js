import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = {
  // Topic endpoints
  getAllTopics: async () => {
    const res = await axios.get(`${API_BASE}/topics/all`);
    return res.data;
  },
  
  getUserProgress: async (userId) => {
    const res = await axios.get(`${API_BASE}/topics/progress/${userId}`);
    return res.data;
  },

  markProblemSolved: async (problemId) => {
    const res = await axios.post(`${API_BASE}/topics/mark-solved`, { problemId });
    return res.data;
  },

  // Practice endpoints
  getDailyPractice: async (userId) => {
    const res = await axios.get(`${API_BASE}/practice/daily/${userId}`);
    return res.data;
  },

  // Roadmap endpoints
  getGenericRoadmap: async () => {
    const res = await axios.get(`${API_BASE}/roadmap/generic`);
    return res.data;
  },

  getPersonalizedRoadmap: async (userId) => {
    const res = await axios.get(`${API_BASE}/roadmap/personalized/${userId}`);
    return res.data;
  },

  // Contest endpoints
  getUpcomingContests: async () => {
    const res = await axios.get(`${API_BASE}/contest/upcoming`);
    return res.data;
  },

  getContestHistory: async (userId) => {
    const res = await axios.get(`${API_BASE}/contest/history/${userId}`);
    return res.data;
  },

  // Leaderboard endpoint
  getLeaderboard: async () => {
    const res = await axios.get(`${API_BASE}/leaderboard`);
    return res.data;
  }
};

export default api;
