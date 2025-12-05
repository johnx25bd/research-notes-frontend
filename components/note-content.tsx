"use client"

import { NoteLink } from "./note-link"
import { Fragment, type ReactNode } from "react"

interface NoteContentProps {
  content: string
}

// Parse text and replace [[links]] with NoteLink components
function parseInlineContent(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /\[\[([^\]]+)\]\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      parts.push(...parseFormatting(beforeText, `before-${match.index}`))
    }

    // Add the NoteLink component
    parts.push(<NoteLink key={`link-${match.index}`} noteTitle={match[1]} />)

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(...parseFormatting(text.slice(lastIndex), `end-${lastIndex}`))
  }

  return parts
}

// Parse bold and inline code
function parseFormatting(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /(\*\*([^*]+)\*\*)|(`([^`]+)`)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(<Fragment key={`${keyPrefix}-text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</Fragment>)
    }

    if (match[2]) {
      // Bold text
      parts.push(<strong key={`${keyPrefix}-bold-${match.index}`}>{match[2]}</strong>)
    } else if (match[4]) {
      // Inline code
      parts.push(<code key={`${keyPrefix}-code-${match.index}`}>{match[4]}</code>)
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<Fragment key={`${keyPrefix}-final`}>{text.slice(lastIndex)}</Fragment>)
  } else if (lastIndex === 0) {
    parts.push(<Fragment key={`${keyPrefix}-all`}>{text}</Fragment>)
  }

  return parts
}

export function NoteContent({ content }: NoteContentProps) {
  return (
    <div className="prose text-foreground">
      {content.split("\n\n").map((paragraph, idx) => {
        // Handle headings
        if (paragraph.startsWith("## ")) {
          return <h2 key={idx}>{parseInlineContent(paragraph.replace("## ", ""))}</h2>
        }
        if (paragraph.startsWith("### ")) {
          return <h3 key={idx}>{parseInlineContent(paragraph.replace("### ", ""))}</h3>
        }

        // Handle blockquotes
        if (paragraph.startsWith("> ")) {
          return <blockquote key={idx}>{parseInlineContent(paragraph.replace("> ", "").replace(/"/g, ""))}</blockquote>
        }

        // Handle code blocks
        if (paragraph.startsWith("```")) {
          const lines = paragraph.split("\n")
          const code = lines.slice(1, -1).join("\n")
          return (
            <pre key={idx}>
              <code>{code}</code>
            </pre>
          )
        }

        // Handle lists
        if (paragraph.startsWith("- ") || paragraph.startsWith("1. ")) {
          const items = paragraph.split("\n").filter(Boolean)
          const isOrdered = paragraph.startsWith("1. ")
          const ListTag = isOrdered ? "ol" : "ul"
          return (
            <ListTag key={idx} className={isOrdered ? "list-decimal" : "list-disc"}>
              {items.map((item, i) => (
                <li key={i}>{parseInlineContent(item.replace(/^[-\d.]+\s*\*?\*?/, "").replace(/\*\*/g, ""))}</li>
              ))}
            </ListTag>
          )
        }

        // Regular paragraphs
        if (paragraph.trim()) {
          return <p key={idx}>{parseInlineContent(paragraph)}</p>
        }

        return null
      })}
    </div>
  )
}
