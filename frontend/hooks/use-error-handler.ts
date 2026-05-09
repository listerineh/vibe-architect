'use client'

import { useState, useCallback } from 'react'

interface ErrorItem {
  id: string
  message: string
}

export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorItem[]>([])

  const showError = useCallback((error: unknown) => {
    let message = 'An unexpected error occurred'

    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    } else if (error && typeof error === 'object' && 'detail' in error) {
      message = String(error.detail)
    }

    // Clean up technical error messages for users
    message = cleanErrorMessage(message)

    const id = `error-${Date.now()}-${Math.random()}`
    setErrors((prev) => [...prev, { id, message }])
  }, [])

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  return {
    errors,
    showError,
    removeError,
    clearErrors,
  }
}

function cleanErrorMessage(message: string): string {
  // Remove technical stack traces
  const lines = message.split('\n')
  const firstLine = lines[0]

  // Common error patterns to clean up
  const patterns = [
    { regex: /429.*quota/i, replacement: 'Service is temporarily busy. Please try again in a moment.' },
    { regex: /500.*internal server/i, replacement: 'Server error. Please try again later.' },
    { regex: /404.*not found/i, replacement: 'Resource not found. Please check your request.' },
    { regex: /403.*forbidden/i, replacement: 'Access denied. Please check your permissions.' },
    { regex: /401.*unauthorized/i, replacement: 'Authentication required. Please log in.' },
    { regex: /network.*failed/i, replacement: 'Network connection failed. Please check your internet.' },
    { regex: /timeout/i, replacement: 'Request timed out. Please try again.' },
    { regex: /Failed to fetch/i, replacement: 'Unable to connect to server. Please try again.' },
  ]

  for (const pattern of patterns) {
    if (pattern.regex.test(firstLine)) {
      return pattern.replacement
    }
  }

  // If message is too long, truncate it
  if (firstLine.length > 150) {
    return firstLine.substring(0, 150) + '...'
  }

  return firstLine
}
