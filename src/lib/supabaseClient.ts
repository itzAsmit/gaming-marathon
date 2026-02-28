// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Your Supabase URL and anon key should be stored in environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    // Disable auto-connect to prevent WebSocket spam on cellular networks
    // where direct Supabase connections are blocked/throttled.
    params: { eventsPerSecond: 0 },
  },
  global: {
    headers: { 'x-client-info': 'gaming-marathon-web' },
  },
  auth: {
    // Shorter timeout for auth operations on slow networks
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
