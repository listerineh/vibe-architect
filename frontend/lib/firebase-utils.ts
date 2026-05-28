/**
 * Firebase utility functions
 */

/**
 * Get user-friendly error message from Firebase error code
 */
export function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Get user display name from Firebase user
 */
export function getUserDisplayName(user: { displayName?: string | null; email?: string | null }): string {
  return user.displayName || user.email?.split('@')[0] || 'User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: { displayName?: string | null; email?: string | null }): string {
  if (user.displayName) {
    const names = user.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.displayName.charAt(0).toUpperCase();
  }
  return user.email?.charAt(0).toUpperCase() || 'U';
}
