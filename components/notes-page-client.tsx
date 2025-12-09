"use client"

import { useState, useMemo } from "react"
import { NoteRow } from "@/components/note-row"
import { Search } from "lucide-react"
import type { Note } from "@/lib/vault"

type NoteStatus = Note['status']

interface NotesPageClientProps {
  notes: Note[]
}

export function NotesPageClient({ notes }: NotesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<NoteStatus | null>(null)

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (selectedStatus && note.status !== selectedStatus) {
          return false
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesTitle = note.title.toLowerCase().includes(query)
          const matchesSummary = note.summary?.toLowerCase().includes(query)
          if (!matchesTitle && !matchesSummary) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => new Date(b.lastTended).getTime() - new Date(a.lastTended).getTime())
  }, [notes, selectedStatus, searchQuery])

  const statuses: { value: NoteStatus | null; label: string }[] = [
    { value: null, label: "All" },
    { value: "fragment", label: "Fragment" },
    { value: "working", label: "Working" },
    { value: "stable", label: "Stable" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 animate-fade-in-up">Map</h1>
      <p className="text-muted-foreground mb-10">All notes in the garden, from fresh seeds to evergreen ideas.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-10" style={{ fontFamily: "var(--font-ui)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((status) => (
            <button
              key={status.label}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                selectedStatus === status.value
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No notes match your search.</p>
      ) : (
        <div className="space-y-0">
          {filteredNotes.map((note) => (
            <NoteRow key={note.slug} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
