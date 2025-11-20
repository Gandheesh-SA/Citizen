// app.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const interactionRoutes = require("./routes/interactionsRoutes");

const commentRoutes = require("./routes/commentRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());



app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/news", require("./routes/newsRoutes"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/interactions", interactionRoutes);

app.use("/api/comments", commentRoutes);

app.use("/uploads", express.static("uploads"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
const communityRoutes = require("./routes/communityRoutes");
app.use("/api/communities", communityRoutes);
app.use("/api/help-support", require("./routes/helpSupportRoutes"));

app.get("/", (req, res) => res.send("API is running"));
app.get("/api/test", (req, res) =>
  res.json({ message: "Server is working", timestamp: new Date().toISOString(), status: "OK" })
);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

module.exports = app;
