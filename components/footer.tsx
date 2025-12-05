import { RandomNoteButton } from "./random-note-button"

export function Footer() {
  return (
    <footer className="py-12 mt-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-ui)" }}>
            A digital garden, tended with care
          </p>
          <RandomNoteButton />
        </div>
      </div>
    </footer>
  )
}
