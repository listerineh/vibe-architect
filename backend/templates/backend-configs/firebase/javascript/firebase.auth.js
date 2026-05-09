import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Firebase Authentication Helpers
 * 
 * Utility functions for common authentication operations
 */

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, displayName }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn({ email, password }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    await updateProfile(user, updates);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}
