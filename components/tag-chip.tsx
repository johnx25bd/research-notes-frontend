"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface TagChipProps {
  tag: string
  count?: number
  href?: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function TagChip({ tag, count, href, active, onClick, className }: TagChipProps) {
  const baseClasses = cn(
    "inline-flex items-center text-xs px-1.5 py-0.5 rounded transition-colors",
    "text-muted-foreground/60 border border-current/20 hover:text-muted-foreground hover:border-current/40",
    active && "text-muted-foreground border-current/40",
    className,
  )

  const content = (
    <>
      <span>{tag}</span>
      {count !== undefined && <span className="ml-1 opacity-50">({count})</span>}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseClasses} style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem" }}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses} style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem" }}>
        {content}
      </button>
    )
  }

  return (
    <span className={baseClasses} style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem" }}>
      {content}
    </span>
  )
}
