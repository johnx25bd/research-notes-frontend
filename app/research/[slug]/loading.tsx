import { LayoutShell } from '@/components/layout-shell'

// Artifact and note pages keep the site's narrow reading column, so their
// loading shell stays narrow too — this overrides the wide /research segment
// skeleton, which exists only for the dashboard-style index.
export default function Loading() {
  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="space-y-2 pt-8">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}
