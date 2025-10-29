// app.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes"); 

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS: allow your frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/uploads", express.static("uploads"));

// simple health check
app.get("/", (req, res) => res.send("API is running"));

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is working!",
    timestamp: new Date().toISOString(),
    status: "OK"
  });
});

module.exports = app;
