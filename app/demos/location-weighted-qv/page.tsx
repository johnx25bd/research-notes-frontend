import type { Metadata } from 'next'
import Demo from './demo'

export const metadata: Metadata = {
  title: 'Presence as Franchise — Newspeak House Guest Room',
  description:
    'A teaching demo: located, verifiable check-ins over a term accrue into presence, and presence — not money — becomes governance voice.',
  // Unlisted: reachable by URL, kept out of search indexes and the sitemap.
  robots: { index: false, follow: false },
}

export default function Page() {
  return <Demo />
}
