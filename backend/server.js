
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const candidateRoutes = require("./routes/candidateRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/candidates", candidateRoutes);

// Basic API route
app.get("/", (req, res) => {
  res.json({
    message: "Mini ATS API is running!",
    status: "success",
  });
});

// Database health-check route
app.get("/api/health", (req, res) => {
  res.json({
    server: "running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
  }
}

startServer();
