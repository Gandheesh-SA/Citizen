// app.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup (update origin for production)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/feedback", feedbackRoutes);

// Static uploads (for complaint images)
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => res.send("✅ API is running"));
app.get("/api/test", (req, res) =>
  res.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
    status: "OK",
  })
);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

module.exports = app;
