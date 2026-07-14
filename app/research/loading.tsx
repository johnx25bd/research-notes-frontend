import { LayoutShell } from '@/components/layout-shell'

// Route-scoped loading shell: /research uses the wide container, so its
// skeleton must too — otherwise the nav and left edge jump from the narrow
// column to the wide one when the page streams in during client navigation.
export default function Loading() {
  return (
    <LayoutShell wide>
      <div className="container-wide py-10">
        <div className="animate-pulse space-y-4 max-w-[70ch]">
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
