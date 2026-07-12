-- Add hevy_api_key column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hevy_api_key TEXT;
