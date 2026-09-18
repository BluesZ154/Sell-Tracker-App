import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import transactionRoutes from "./routes/transactionsRoutes.js";
import stockLogsRoutes from "./routes/stockLogRoutes.js";

dotenv.config();

const app = express();

// ==================
// 🔐 MIDDLEWARE
// ==================

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sell-tracker-app-audx.vercel.app",
    ],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ==================
// 🛡️ RATE LIMITER
// ==================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// ==================
// 🚀 DATABASE
// ==================

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    throw error;
  }
};

// Pastikan database terkoneksi sebelum request diproses
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// ==================
// 🚀 ROUTES
// ==================

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/stocklogs", stockLogsRoutes);

// ==================
// 🏠 TEST ROUTE
// ==================

app.get("/", (req, res) => {
  res.json({
    message: "SellTracker API is running",
  });
});

// ==================
// ❗ ERROR HANDLER
// ==================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ==================
// 🚀 VERCEL
// ==================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;