-- Add plan_expires_at column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;
