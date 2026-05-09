/**
 * Supabase Type Definitions
 * 
 * Common types used across Supabase services
 */

import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string | undefined;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      // Define your database tables here
      // Example:
      // users: {
      //   Row: User;
      //   Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
      //   Update: Partial<Omit<User, 'id'>>;
      // };
    };
    Views: {
      // Define your database views here
    };
    Functions: {
      // Define your database functions here
    };
  };
}

export type { SupabaseUser, Session };
