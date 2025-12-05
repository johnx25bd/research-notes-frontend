"use client"

import { Search } from "lucide-react"
import { TagChip } from "./tag-chip"
import type { NoteStatus } from "@/lib/mock-data"

interface FiltersBarProps {
  tags: string[]
  selectedTag: string | null
  onTagSelect: (tag: string | null) => void
  selectedStatus: NoteStatus | null
  onStatusSelect: (status: NoteStatus | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const statuses: { value: NoteStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "seed", label: "Seed" },
  { value: "developing", label: "Developing" },
  { value: "evergreen", label: "Evergreen" },
]

export function FiltersBar({
  tags,
  selectedTag,
  onTagSelect,
  selectedStatus,
  onStatusSelect,
  searchQuery,
  onSearchChange,
}: FiltersBarProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-input rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1">
        {statuses.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => onStatusSelect(value)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
              selectedStatus === value
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5">
        <TagChip tag="All tags" active={selectedTag === null} onClick={() => onTagSelect(null)} />
        {tags.map((tag) => (
          <TagChip key={tag} tag={tag} active={selectedTag === tag} onClick={() => onTagSelect(tag)} />
        ))}
      </div>
    </div>
  )
}
