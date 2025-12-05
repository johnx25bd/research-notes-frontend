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
    "inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground",
    active && "text-foreground",
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
      <Link href={href} className={baseClasses} style={{ fontFamily: "var(--font-ui)" }}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses} style={{ fontFamily: "var(--font-ui)" }}>
        {content}
      </button>
    )
  }

  return (
    <span className={baseClasses} style={{ fontFamily: "var(--font-ui)" }}>
      {content}
    </span>
  )
}
