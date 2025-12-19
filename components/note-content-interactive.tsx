"use client"

import Link from "next/link"
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from "html-react-parser"
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
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      // Only process Element nodes
      if (!(domNode instanceof Element)) return

      // Check if this is an internal link
      if (domNode.name === 'a' && domNode.attribs?.class?.includes('internal-link')) {
        const href = domNode.attribs.href || ''
        const slug = href.replace('/notes/', '')
        const linkText = domToReact(domNode.children as DOMNode[], options)
        const note = allNotes.find(n => n.slug === slug)
        const isBroken = domNode.attribs.class?.includes('broken-link')

        // Broken link - render without hover card
        if (isBroken || !note) {
          return (
            <Link
              href={href}
              className="text-muted-foreground"
            >
              {linkText}
            </Link>
          )
        }

        // Valid internal link - render with hover card
        return (
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link
                href={href}
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
      }
    }
  }

  return <div>{parse(html, options)}</div>
}
