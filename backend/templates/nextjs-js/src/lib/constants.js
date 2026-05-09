/**
 * Application Constants
 * 
 * Centralized configuration values and constants.
 * Modify these values to customize application behavior.
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'My App',
  description: 'A modern Next.js application',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  author: 'Your Name',
};

/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};

/**
 * Feature flags
 * Enable/disable features across the application
 */
export const FEATURES = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  darkMode: true,
  notifications: true,
};

/**
 * UI Constants
 */
export const UI = {
  maxContentWidth: '1280px',
  sidebarWidth: '280px',
  headerHeight: '64px',
  animationDuration: 300, // milliseconds
};

/**
 * Validation rules
 */
export const VALIDATION = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  maxUsernameLength: 50,
  maxBioLength: 500,
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
};
