'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { ErrorBannerContainer } from '@/components/ui'

interface ErrorContextType {
  showError: (error: unknown) => void
  clearErrors: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const { errors, showError, removeError, clearErrors } = useErrorHandler()

  return (
    <ErrorContext.Provider value={{ showError, clearErrors }}>
      {children}
      <ErrorBannerContainer errors={errors} onRemove={removeError} />
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}
