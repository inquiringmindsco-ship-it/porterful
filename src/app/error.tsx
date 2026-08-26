'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--pf-bg)] px-4">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="text-6xl mb-6">⚠️</div>
        
        <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
        <p className="text-[var(--pf-text-secondary)] mb-8">
          We encountered an unexpected error. Your action has been logged.
        </p>
        
        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="pf-btn pf-btn-primary"
          >
            Try Again
          </button>
          <a href="/" className="pf-btn pf-btn-secondary">
            Go Home
          </a>
        </div>
        
        {/* Error ID for support */}
        {error.digest && (
          <p className="mt-8 text-xs text-[var(--pf-text-muted)]">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
