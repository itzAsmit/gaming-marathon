// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Your Supabase URL and anon key should be stored in environment variables.
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
