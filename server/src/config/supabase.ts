import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Admin client — bypasses RLS, used for all server-side DB operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Auth client — uses anon key, used for auth operations
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Assigns a Pro API key to a user in a round-robin fashion from the pool of keys in `pro_api_keys`.
 * If the pool is empty, no key is assigned.
 */
export async function assignProApiKey(userId: string): Promise<string | null> {
  try {
    // 1. Fetch all API keys from pro_api_keys ordered by id
    const { data: keys, error: keysError } = await supabaseAdmin
      .from("pro_api_keys")
      .select("key_value")
      .order("id", { ascending: true });

    if (keysError) {
      console.error("[API Key Assignment] Failed to fetch pro_api_keys:", keysError.message);
      return null;
    }

    if (!keys || keys.length === 0) {
      console.warn("[API Key Assignment] No API keys available in the pool. Skipping assignment.");
      return null;
    }

    // 2. Count the number of current pro profiles that have an assigned key
    const { count, error: countError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("plan", "pro")
      .not("groq_api_key", "is", null);

    if (countError) {
      console.error("[API Key Assignment] Failed to count pro users:", countError.message);
      return null;
    }

    const proCount = count || 0;
    
    // 3. Round-robin select the key
    const selectedKeyObj = keys[proCount % keys.length];
    const assignedKey = selectedKeyObj.key_value;

    // 4. Update the user's profile with the key
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ groq_api_key: assignedKey })
      .eq("id", userId);

    if (updateError) {
      console.error(`[API Key Assignment] Failed to update user profile ${userId}:`, updateError.message);
      return null;
    }

    console.log(`[API Key Assignment] Successfully assigned API key (index ${proCount % keys.length}) to user ${userId}.`);
    return assignedKey;
  } catch (err) {
    console.error("[API Key Assignment] Exception during helper execution:", err);
    return null;
  }
}

/**
 * Clears the assigned Pro API key for a user (called during downgrade).
 */
export async function clearProApiKey(userId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ groq_api_key: null })
      .eq("id", userId);

    if (error) {
      console.error(`[API Key Assignment] Failed to clear API key for user ${userId}:`, error.message);
    } else {
      console.log(`[API Key Assignment] Cleared API key for user ${userId}.`);
    }
  } catch (err) {
    console.error("[API Key Assignment] Exception during clear API key execution:", err);
  }
}
