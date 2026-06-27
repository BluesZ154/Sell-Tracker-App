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

// Security header
app.use(helmet());

// Allow frontend connect
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Logging request
app.use(morgan("dev"));

// Parse JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Rate limiter (anti spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // max 100 request
});

// ==================
// 🚀 ROUTES
// ==================

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/stocklogs", stockLogsRoutes);

// ==================
// ❗ ERROR HANDLER
// ==================

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ==================
// ▶️ RUN SERVER + CONNECT DB
// ==================

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });

  })
  .catch((err) => {
    console.log("❌ DB Connection Failed:", err.message);
  });