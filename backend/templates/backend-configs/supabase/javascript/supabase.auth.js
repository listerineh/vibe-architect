import { supabase } from './supabase';

/**
 * Supabase Authentication Helpers
 * 
 * Utility functions for common authentication operations
 */

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, metadata }) {
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
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      user: null,
      session: null,
      error,
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn({ email, password }) {
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
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      user: null,
      session: null,
      error,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { error };
  }
}

/**
 * Update password for the current user
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { error };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
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
export async function getCurrentSession() {
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
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata) {
  try {
    const { error } = await supabase.auth.updateUser({
      data: metadata,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return { error };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithProvider(provider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    return { data: null, error };
  }
}
