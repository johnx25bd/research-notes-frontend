import { LayoutShell } from "@/components/layout-shell"
import { NotesPageClient } from "@/components/notes-page-client"
import { getAllNotes } from "@/lib/vault"

export default async function NotesPage() {
  const notes = await getAllNotes()

  return (
    <LayoutShell>
      <NotesPageClient notes={notes} />
    </LayoutShell>
  )
}
