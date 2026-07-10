import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Admin client — bypasses RLS, used for all server-side DB operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Auth client — uses anon key, used for auth operations
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
