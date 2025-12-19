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

// Extract plain text preview from markdown content
function getContentPreview(content: string, maxLength: number = 300): string {
  // Remove frontmatter if present
  let text = content.replace(/^---\n[\s\S]*?\n---\n/, '')

  // Remove markdown syntax
  text = text
    .replace(/^#{1,6}\s+/gm, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1') // Wikilinks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/^>\s+/gm, '') // Blockquotes
    .replace(/^[-*+]\s+/gm, '') // List bullets
    .replace(/^\d+\.\s+/gm, '') // Numbered lists
    .trim()

  // Take first few paragraphs up to maxLength
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  let preview = ''

  for (const paragraph of paragraphs) {
    if (preview.length + paragraph.length > maxLength) {
      preview += paragraph.slice(0, maxLength - preview.length) + '...'
      break
    }
    preview += paragraph + '\n\n'
    if (preview.length >= maxLength * 0.8) break // Stop after ~80% of max length
  }

  return preview.trim() || 'No preview available.'
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
            style={{ display: 'contents' }}
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
            <HoverCardContent className="w-80 p-4 border-border/50 overflow-hidden" side="top" align="start">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium text-sm leading-snug">{note.title}</h4>
                  <StatusBadge status={note.status} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                  {getContentPreview(note.content, 300)}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      } else {
        // Broken link - keep as-is
        parts.push(
          <span key={`broken-${match.index}`} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: match[0] }} />
        )
      }

      currentIndex = match.index + match[0].length
    }

    // Add remaining HTML
    if (currentIndex < bodyHTML.length) {
      parts.push(
        <span key="final" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: bodyHTML.slice(currentIndex) }} />
      )
    }

    setProcessedContent(<>{parts}</>)
  }, [html, allNotes])

  return <div>{processedContent}</div>
}
