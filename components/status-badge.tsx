import { cn } from "@/lib/utils"
import type { NoteStatus } from "@/lib/mock-data"

interface StatusBadgeProps {
  status: NoteStatus
  className?: string
}

const statusConfig: Record<NoteStatus, { label: string; className: string }> = {
  seed: {
    label: "Seed",
    className: "text-muted-foreground bg-muted",
  },
  budding: {
    label: "Budding",
    className: "text-muted-foreground bg-muted",
  },
  evergreen: {
    label: "Evergreen",
    className: "text-primary/80 bg-primary/10",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 text-xs rounded-full", config.className, className)}
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {config.label}
    </span>
  )
}
