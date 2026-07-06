import { LayoutShell } from "@/components/layout-shell"
import { NotesPageClient } from "@/components/notes-page-client"
import { getAllResearch } from "@/lib/vault"

export const metadata = {
  title: "Research",
  description: "Longer-form research — frameworks, notes, and work in progress.",
}

export default async function ResearchPage() {
  const research = await getAllResearch()

  return (
    <LayoutShell>
      <NotesPageClient
        notes={research}
        title="Research"
        description="Longer-form research — frameworks, notes, and work in progress."
        searchPlaceholder="Search research..."
      />
    </LayoutShell>
  )
}
