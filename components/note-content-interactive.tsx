"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { StatusBadge } from "@/components/status-badge"
import type { Note } from "@/lib/vault"

interface NoteContentInteractiveProps {
  html: string
  allNotes: Note[]
}

export function NoteContentInteractive({ html, allNotes }: NoteContentInteractiveProps) {
  const [processedContent, setProcessedContent] = useState<React.ReactNode>(null)

  useEffect(() => {
    // Parse HTML and replace internal links with hover-enabled components
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const links = doc.querySelectorAll('a.internal-link')

    // Convert links to React elements with hover cards
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    const bodyHTML = doc.body.innerHTML
    const linkPattern = /<a class="internal-link[^"]*" href="\/notes\/([^"]+)">([^<]+)<\/a>/g
    let match

    const parts: React.ReactNode[] = []
    let currentIndex = 0

    while ((match = linkPattern.exec(bodyHTML)) !== null) {
      // Add HTML before this link
      if (match.index > currentIndex) {
        parts.push(
          <span
            key={`text-${currentIndex}`}
            dangerouslySetInnerHTML={{ __html: bodyHTML.slice(currentIndex, match.index) }}
          />
        )
      }

      const slug = match[1]
      const linkText = match[2]
      const note = allNotes.find(n => n.slug === slug)

      if (note) {
        parts.push(
          <HoverCard key={`link-${match.index}`} openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link
                href={`/notes/${slug}`}
                className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-all duration-200"
              >
                {linkText}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 p-4 border-border/50" side="top" align="start">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium text-sm leading-snug">{note.title}</h4>
                  <StatusBadge status={note.status} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {note.summary || ''}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      } else {
        // Broken link - keep as-is
        parts.push(
          <span key={`broken-${match.index}`} dangerouslySetInnerHTML={{ __html: match[0] }} />
        )
      }

      currentIndex = match.index + match[0].length
    }

    // Add remaining HTML
    if (currentIndex < bodyHTML.length) {
      parts.push(
        <span key="final" dangerouslySetInnerHTML={{ __html: bodyHTML.slice(currentIndex) }} />
      )
    }

    setProcessedContent(<>{parts}</>)
  }, [html, allNotes])

  return <div>{processedContent}</div>
}
