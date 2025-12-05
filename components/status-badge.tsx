import { cn } from "@/lib/utils"
import type { Note } from "@/lib/vault"

type NoteStatus = Note['status']

interface StatusBadgeProps {
  status: NoteStatus
  className?: string
}

const statusConfig: Record<NoteStatus, { label: string; className: string }> = {
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
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn("inline-flex items-center px-1.5 py-0.5 text-xs rounded-full", config.className, className)}
      style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem" }}
    >
      {config.label}
    </span>
  )
}
