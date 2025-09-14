import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import userRoutes from "./routes/userRoutes";
import http from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import tableRoutes from "./routes/tableRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import logger from "./utils/logger";
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
    origin: allowedOrigins,
    credentials: true,
  })
);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
app.use(express.json());

// --- Socket.IO Realtime Handling ---
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("❌ User disconnected:", socket.id)
  );
});

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("☕ Cafe POS Server is running!");
});

app.use("/api/users", userRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
// Test Error Route
app.get("/error", (req: Request) => {
  throw new Error("Test error!");
});

// 404 Route Handler (must be after all routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// server.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
//   connectDB();
// });

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

connectDB();
export default server;
