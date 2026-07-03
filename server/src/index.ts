import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import foodRoutes from "./routes/food.routes";
import waterRoutes from "./routes/water.routes";
import workoutRoutes from "./routes/workout.routes";
import tasksRoutes from "./routes/tasks.routes";
import plannerRoutes from "./routes/planner.routes";
import journalRoutes from "./routes/journal.routes";
import goalsRoutes from "./routes/goals.routes";
import analyticsRoutes from "./routes/analytics.routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS — allow requests from the Next.js frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Momentum API server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
