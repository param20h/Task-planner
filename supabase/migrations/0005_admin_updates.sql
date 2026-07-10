-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create payments table to log transaction status
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
