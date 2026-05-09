/**
 * Global Type Definitions
 * 
 * Shared TypeScript types and interfaces used across the application.
 * Organize types by domain or feature for better maintainability.
 */

/**
 * Common utility types
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string | number;

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * User types
 */
export interface User {
  id: ID;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form types
 */
export interface FormState<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Component prop types
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Status types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'system';
