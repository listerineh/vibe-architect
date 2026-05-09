import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * 
 * Initialize Supabase client for the application.
 * Make sure to set all environment variables in .env.local
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is incomplete. Please check your environment variables.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export URL for reference
export const SUPABASE_URL = supabaseUrl;
