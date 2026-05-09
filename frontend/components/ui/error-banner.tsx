'use client'

import { useEffect, useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onClose: () => void
  duration?: number
}

export function ErrorBanner({ message, onClose, duration = 5000 }: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-red-500/90 backdrop-blur-sm text-white rounded-lg shadow-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Error</h3>
          <p className="text-sm text-white/90">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface ErrorBannerContainerProps {
  errors: Array<{ id: string; message: string }>
  onRemove: (id: string) => void
}

export function ErrorBannerContainer({ errors, onRemove }: ErrorBannerContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {errors.map((error, index) => (
        <div
          key={error.id}
          style={{ transform: `translateY(${index * 10}px)` }}
          className="transition-transform duration-300"
        >
          <ErrorBanner message={error.message} onClose={() => onRemove(error.id)} />
        </div>
      ))}
    </div>
  )
}
