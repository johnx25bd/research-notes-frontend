import Link from 'next/link'
import { LayoutShell } from '@/components/layout-shell'

export default function NotFound() {
  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist in this garden yet.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Go home
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Browse notes
          </Link>
        </div>
      </div>
    </LayoutShell>
  )
}
