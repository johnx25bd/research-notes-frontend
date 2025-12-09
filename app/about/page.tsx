import { LayoutShell } from "@/components/layout-shell"
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { processMarkdown } from '@/lib/markdown'

async function getAboutContent() {
  try {
    // Read directly from research-notes vault
    const aboutPath = '/Users/x25bd/Projects/obsidian/research-notes/About.md'
    const raw = await fs.readFile(aboutPath, 'utf-8')
    const { data, content } = matter(raw)
    const html = await processMarkdown(content, [])

    return {
      title: data.title || 'About this garden',
      subtitle: data.subtitle || data.summary || 'A space for ideas to grow at their own pace.',
      html
    }
  } catch (error) {
    // Fallback to default content if About.md doesn't exist
    return {
      title: 'About this garden',
      subtitle: 'A space for ideas to grow at their own pace.',
      html: `
        <p>This is a digital garden—a collection of notes that grow and evolve over time. Unlike a traditional blog, these notes are not organized chronologically. Instead, they form a network of interconnected ideas.</p>

        <h2>What is a digital garden?</h2>
        <p>A digital garden is a different way of thinking about online presence. It's not a blog, not a portfolio—it's a network of evolving ideas. Notes exist at various stages of completion, and that's intentional.</p>

        <h2>How to explore</h2>
        <p>There are several ways to navigate this garden:</p>
        <ul>
          <li>Follow the links within notes to discover related ideas</li>
          <li>Use the Map to browse all notes</li>
          <li>Check backlinks to see how notes connect</li>
          <li>Try the random note button for serendipitous discovery</li>
        </ul>

        <h2>Note statuses</h2>
        <p>Each note has a status indicating its maturity:</p>
        <ul>
          <li><strong>Fragment</strong> — A nascent idea, barely formed</li>
          <li><strong>Working</strong> — Taking shape but not complete</li>
          <li><strong>Stable</strong> — Mature, well-developed, and relatively stable</li>
        </ul>

        <p>Feel free to wander, wonder, and make your own connections.</p>
      `
    }
  }
}

export default async function AboutPage() {
  const { title, subtitle, html } = await getAboutContent()

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 animate-fade-in-up">{title}</h1>
        <p className="text-lg text-muted-foreground mb-12">{subtitle}</p>

        <div className="prose text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </LayoutShell>
  )
}
