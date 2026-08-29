import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import userRoutes from "./routes/userRoutes";
import tableRoutes from "./routes/tableRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import customerRoutes from "./routes/customerRoutes";
import modifierRoutes from "./routes/modifierRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import shiftRoutes from "./routes/shiftRoutes";
import reservationRoutes from "./routes/reservationRoutes";
import activityLogRoutes from "./routes/activityLogRoutes";
import publicMenuRoutes from "./routes/publicMenuRoutes";

import http from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import logger from "./utils/logger";
import path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(
  morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } })
);

const allowedOrigins = [
  "http://localhost:3000",
  "https://cafe-sync.vercel.app",
  "http://localhost:5173",
  process.env.FRONTEND_URL || "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev origins seamlessly
    },
    credentials: true,
  })
);

export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(express.json());

// --- Socket.IO Realtime Handling ---
io.on("connection", (socket) => {
  console.log("🔌 Client connected to Socket.IO:", socket.id);
  socket.on("disconnect", () =>
    console.log("❌ Client disconnected:", socket.id)
  );
});

// Root & Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Cafe Sync POS API",
    version: "2.0.0",
    status: "online",
    time: new Date().toISOString(),
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "✅ Cafe Sync Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes
app.use("/api/users", userRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/modifiers", modifierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/public", publicMenuRoutes);

// 404 Route Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`🚀 Cafe Sync POS Server running on http://localhost:${PORT}`);
    connectDB();
  });
} else {
  connectDB();
}

export default server;
