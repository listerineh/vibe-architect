import { supabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Supabase Authentication Helpers
 * 
 * Utility functions for common authentication operations
 */

export interface SignUpData {
  email: string;
  password: string;
  metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, metadata }: SignUpData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    console.error('Error signing up:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { error: error as AuthError };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { error: error as AuthError };
  }
}

/**
 * Update password for the current user
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error updating password:', error);
    return { error: error as AuthError };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthChange(callback: (user: User | null, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata: Record<string, any>): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: metadata,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error updating user metadata:', error);
    return { error: error as AuthError };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithProvider(provider: 'google' | 'github' | 'gitlab' | 'bitbucket') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error signing in with ${provider}:`, error);
    return { data: null, error: error as AuthError };
  }
}
