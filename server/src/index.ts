import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { Client } from "pg";

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
import subscriptionRoutes from "./routes/subscription.routes";
import adminRoutes from "./routes/admin.routes";

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
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);

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

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL environment variable is missing. Skipping database auto-migrations.");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("⚙️  Running database schema auto-migrations and RLS security policies...");
    await client.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
      
      CREATE TABLE IF NOT EXISTS payments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
        razorpay_order_id TEXT NOT NULL UNIQUE,
        razorpay_payment_id TEXT,
        amount NUMERIC NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Admin select all profiles" ON profiles;
      CREATE POLICY "Admin select all profiles" ON profiles 
        FOR SELECT TO authenticated 
        USING (auth.jwt() ->> 'email' = 'parambrar862@gmail.com');
      
      DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;
      CREATE POLICY "Admin update all profiles" ON profiles 
        FOR UPDATE TO authenticated 
        USING (auth.jwt() ->> 'email' = 'parambrar862@gmail.com');
      
      DROP POLICY IF EXISTS "Users insert own payments" ON payments;
      CREATE POLICY "Users insert own payments" ON payments 
        FOR INSERT TO authenticated 
        WITH CHECK (auth.uid()::text = profile_id);
      
      DROP POLICY IF EXISTS "Users select own payments" ON payments;
      CREATE POLICY "Users select own payments" ON payments 
        FOR SELECT TO authenticated 
        USING (auth.uid()::text = profile_id);
      
      DROP POLICY IF EXISTS "Users update own payments" ON payments;
      CREATE POLICY "Users update own payments" ON payments 
        FOR UPDATE TO authenticated 
        USING (auth.uid()::text = profile_id);
      
      DROP POLICY IF EXISTS "Admin select all payments" ON payments;
      CREATE POLICY "Admin select all payments" ON payments 
        FOR SELECT TO authenticated 
        USING (auth.jwt() ->> 'email' = 'parambrar862@gmail.com');
      
      DROP POLICY IF EXISTS "Admin update all payments" ON payments;
      CREATE POLICY "Admin update all payments" ON payments 
        FOR UPDATE TO authenticated 
        USING (auth.jwt() ->> 'email' = 'parambrar862@gmail.com');
    `);
    console.log("✅ Database schema auto-migrations applied successfully!");
  } catch (err) {
    console.error("❌ Auto-migration failed on server boot:", err);
  } finally {
    await client.end();
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Momentum API server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  // runMigrations(); // Migrations successfully applied via Supabase Dashboard SQL Editor
});

export default app;
