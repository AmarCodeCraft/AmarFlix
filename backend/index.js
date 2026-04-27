import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import { connectDB } from "./config/db.js";
import configurePassport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow frontend origin with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "AmarFlix backend is running.",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/user", userRoutes);

// Global error handler for multer and other errors
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "File too large. Maximum size is 1GB.",
    });
  }
  if (err.message?.includes("Only")) {
    return res.status(400).json({
      message: err.message,
    });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({
    message: "Internal server error.",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 AmarFlix server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
