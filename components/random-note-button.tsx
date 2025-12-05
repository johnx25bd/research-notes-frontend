"use client"

import { useRouter } from "next/navigation"
import { Shuffle } from "lucide-react"

interface RandomNoteButtonProps {
  noteSlugs: string[]
}

export function RandomNoteButton({ noteSlugs }: RandomNoteButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    const randomSlug = noteSlugs[Math.floor(Math.random() * noteSlugs.length)]
    router.push(`/notes/${randomSlug}`)
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <Shuffle className="h-3.5 w-3.5" />
      Random note
    </button>
  )
}
