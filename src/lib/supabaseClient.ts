// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    'Supabase environment variables are missing (VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY). ' +
    'Supabase features will be disabled.'
  );
}

export { supabase };
export const isSupabaseConfigured = () => supabase !== null;
