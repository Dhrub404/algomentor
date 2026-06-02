const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const topicRoutes = require("./routes/topicRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const contestRoutes = require("./routes/contestRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/contest", contestRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("API Running Successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});