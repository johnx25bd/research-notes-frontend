"use client"

import { useRouter } from "next/navigation"
import { Shuffle } from "lucide-react"
import { getRandomNote } from "@/lib/mock-data"

export function RandomNoteButton() {
  const router = useRouter()

  const handleClick = () => {
    const note = getRandomNote()
    router.push(`/notes/${note.slug}`)
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
