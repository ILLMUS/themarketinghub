import { createClient } from "@supabase/supabase-js";

// Grab environment variables safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables! Check that your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Pass empty strings as fallbacks so it throws a controlled error or runs if keys load later
export const supabase = createClient(
  supabaseUrl || "", 
  supabaseAnonKey || ""
);