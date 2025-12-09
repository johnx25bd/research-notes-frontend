import type { MetadataRoute } from 'next'
import { getAllNotes } from '@/lib/vault'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://johnx.co'
  const notes = await getAllNotes()

  // Get all unique tags
  const allTags = new Set<string>()
  notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)))

  const noteEntries: MetadataRoute.Sitemap = notes.map((note) => ({
    url: `${baseUrl}/notes/${note.slug}`,
    lastModified: new Date(note.lastTended),
    changeFrequency: 'weekly',
    priority: note.featured ? 0.9 : 0.7,
  }))

  const tagEntries: MetadataRoute.Sitemap = Array.from(allTags).map((tag) => ({
    url: `${baseUrl}/tags/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/notes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...noteEntries,
    ...tagEntries,
  ]
}
