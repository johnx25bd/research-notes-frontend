'use client'

import { useEffect } from 'react'
import { LayoutShell } from '@/components/layout-shell'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry) if configured
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  }, [error])

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We encountered an unexpected error while loading this page.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          Try again
        </button>
      </div>
    </LayoutShell>
  )
}
