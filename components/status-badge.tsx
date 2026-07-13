import { cn } from "@/lib/utils"
import type { Note } from "@/lib/vault"

type NoteStatus = Note['status']

interface StatusBadgeProps {
  status: NoteStatus
  className?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  fragment: {
    label: "Fragment",
    className: "text-muted-foreground/80 bg-muted/60",
  },
  working: {
    label: "Working",
    className: "text-muted-foreground/80 bg-muted/60",
  },
  stable: {
    label: "Stable",
    className: "text-primary/70 bg-primary/5",
  },
  // Artifact status values
  active: {
    label: "Active",
    className: "text-primary/70 bg-primary/5",
  },
  preview: {
    label: "Preview",
    className: "text-primary/70 bg-primary/5",
  },
  historical: {
    label: "Historical",
    className: "text-muted-foreground/80 bg-muted/60",
  },
  forthcoming: {
    label: "Forthcoming",
    className: "text-muted-foreground/70 bg-transparent border border-dashed border-current/40",
  },
  // Legacy status values (backward compatibility)
  seed: {
    label: "Fragment",
    className: "text-muted-foreground/80 bg-muted/60",
  },
  budding: {
    label: "Working",
    className: "text-muted-foreground/80 bg-muted/60",
  },
  evergreen: {
    label: "Stable",
    className: "text-primary/70 bg-primary/5",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.fragment

  return (
    <span
      className={cn("inline-flex items-center px-1.5 py-0.5 text-xs rounded-full", config.className, className)}
      style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem" }}
    >
      {config.label}
    </span>
  )
}
