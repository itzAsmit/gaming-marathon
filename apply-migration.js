import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Applying migration: add is_active column to players table...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE public.players 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    `
  });

  if (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Please run this SQL manually in your Supabase dashboard:');
    console.log('\nALTER TABLE public.players');
    console.log('ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;\n');
    process.exit(1);
  }

  console.log('✅ Migration applied successfully!');
  console.log('All existing players are now set to active by default.');
}

applyMigration();
