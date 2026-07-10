import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from both server/.env and root/.env.local
dotenv.config();

const rootEnvPath = path.resolve(__dirname, "../../.env.local");
if (fs.existsSync(rootEnvPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(rootEnvPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined in your environment files.");
  process.exit(1);
}

const sql = `
-- 1. Add email column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create payments table
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

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS policies for profiles
DROP POLICY IF EXISTS "Admin select all profiles" ON profiles;
CREATE POLICY "Admin select all profiles" ON profiles 
  FOR SELECT TO authenticated 
  USING (auth.jwt() ->> 'email' = 'parambrar862@gmail.com');

DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;
CREATE POLICY "Admin update all profiles" ON profiles 
  FOR UPDATE TO authenticated 
  USING (auth.jwt() ->> 'email' = 'parambrar862@gmail.com');

-- 5. Enable RLS policies for payments
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
`;

async function main() {
  console.log("🚀 Connecting to Supabase PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase connections
  });

  try {
    await client.connect();
    console.log("✅ Connected! Running schema migrations and RLS policies...");
    await client.query(sql);
    console.log("🎉 Database schema successfully migrated! Email column added & admin RLS policies created.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await client.end();
  }
}

main();
