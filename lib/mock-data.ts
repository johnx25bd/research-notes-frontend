export type NoteStatus = "seed" | "budding" | "evergreen"

export interface Note {
  slug: string
  title: string
  summary: string
  status: NoteStatus
  updatedAt: string
  tags: string[]
  content: string
  backlinks: string[]
  relatedNotes: string[]
  featured?: boolean
}

export const notes: Note[] = [
  {
    slug: "atomic-habits",
    title: "Atomic Habits and Compound Growth",
    summary:
      "Small changes, remarkable results. How 1% improvements compound over time to create significant transformation.",
    status: "evergreen",
    updatedAt: "2025-01-15",
    tags: ["productivity", "habits", "growth"],
    featured: true,
    content: `The central thesis of atomic habits is deceptively simple: small changes compound into remarkable results over time. This connects deeply with how I think about [[Personal Knowledge Management]]—building knowledge bit by bit.

## The 1% Rule

If you can get 1% better each day for one year, you'll end up thirty-seven times better by the time you're done. Conversely, if you get 1% worse each day for one year, you'll decline nearly down to zero.

> Habits are the compound interest of self-improvement.

This principle is also central to [[Deliberate Practice]]—small, focused improvements compound over time.

## Identity-Based Habits

The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become:

- **Outcome-based habits**: Focus on the goal (lose 20 pounds)
- **Identity-based habits**: Focus on who you wish to become (become a healthy person)

## The Four Laws of Behavior Change

1. Make it obvious
2. Make it attractive
3. Make it easy
4. Make it satisfying

Each law corresponds to a step in the habit loop: cue, craving, response, and reward.

\`\`\`
Cue → Craving → Response → Reward
\`\`\`

The key insight is that habits are not about having something, but about becoming someone. See also [[Learning in Public]] for how sharing your habits creates accountability.`,
    backlinks: ["personal-knowledge-management", "learning-in-public"],
    relatedNotes: ["spaced-repetition", "deliberate-practice"],
  },
  {
    slug: "personal-knowledge-management",
    title: "Personal Knowledge Management",
    summary: "Building a second brain to capture, organize, and retrieve ideas. Systems for thinking better.",
    status: "evergreen",
    updatedAt: "2025-01-12",
    tags: ["pkm", "notes", "thinking"],
    featured: true,
    content: `Personal Knowledge Management (PKM) is the practice of capturing, organizing, and retrieving knowledge to enhance thinking and creativity. It's the foundation of my [[Digital Garden Philosophy]].

## Why PKM Matters

In an age of information abundance, the bottleneck isn't access to information—it's knowing what to do with it. PKM helps us:

- Capture fleeting thoughts before they disappear
- Connect ideas across different domains
- Build on past thinking rather than starting from scratch

This connects with [[Atomic Habits and Compound Growth]]—small notes compound into significant understanding.

## Core Principles

### Capture Everything

The mind is for having ideas, not holding them. Use a trusted system to capture:

- Quotes and highlights from reading
- Random thoughts and observations
- Meeting notes and conversations

### Progressive Summarization

Don't process everything immediately. Use layers of highlighting:

1. Bold the key passages
2. Highlight within the bold
3. Write a summary in your own words

### Linking Over Filing

Traditional folder hierarchies force artificial categorization. Instead:

- Use backlinks to connect related ideas
- Let structure emerge organically
- Trust search and links over navigation

This is the essence of [[The Zettelkasten Method]]—connections create meaning.

\`\`\`typescript
// Example: linking notes programmatically
const note = {
  title: "PKM",
  links: ["[[atomic-habits]]", "[[zettelkasten]]"]
}
\`\`\``,
    backlinks: ["digital-garden-philosophy", "zettelkasten"],
    relatedNotes: ["atomic-habits", "learning-in-public"],
  },
  {
    slug: "digital-garden-philosophy",
    title: "Digital Garden Philosophy",
    summary: "Notes as growing things, not finished products. Embracing imperfection and iteration in public.",
    status: "budding",
    updatedAt: "2025-01-10",
    tags: ["digital-garden", "writing", "thinking"],
    featured: true,
    content: `A digital garden is a different way of thinking about online presence. It's not a blog, not a portfolio—it's a network of evolving ideas.

## Gardens vs. Streams

Traditional blogs are streams: chronological, polished, published once. Gardens are different:

- **Non-chronological**: Ideas don't have publish dates
- **Imperfect**: Notes exist at various stages of completion
- **Interconnected**: Links matter more than hierarchy
- **Growing**: Notes are tended over time

This philosophy aligns with [[Learning in Public]]—sharing work in progress rather than waiting for perfection.

## The Gardening Metaphor

Just like a real garden:

- Some ideas are **seeds**: barely formed thoughts
- Others are **budding**: taking shape but not complete
- A few become **evergreen**: mature, well-developed ideas

## Why Garden in Public?

> Working in public creates a trail of learning that others can follow.

Benefits include:
- Clarifies your own thinking
- Invites serendipitous connections
- Builds a body of work over time

The structure emerges from [[Personal Knowledge Management]] practices and builds through [[The Adjacent Possible]]—each note opens new connections.`,
    backlinks: ["learning-in-public"],
    relatedNotes: ["personal-knowledge-management", "zettelkasten"],
  },
  {
    slug: "zettelkasten",
    title: "The Zettelkasten Method",
    summary: "A slip-box system for linking atomic notes. How Niklas Luhmann wrote 70 books and 400 articles.",
    status: "evergreen",
    updatedAt: "2025-01-08",
    tags: ["pkm", "notes", "methodology"],
    content: `Zettelkasten (German for "slip-box") is a personal knowledge management system developed by sociologist Niklas Luhmann. It's one of the core methodologies behind my approach to [[Personal Knowledge Management]].

## How It Works

The core idea is surprisingly simple:

1. **Atomic notes**: Each note contains one idea
2. **Unique identifiers**: Every note has a permanent address
3. **Links**: Notes connect to related notes
4. **Index**: Entry points into the network

## Luhmann's Output

Using this system, Luhmann produced:
- 70 books
- 400+ scholarly articles
- Over 90,000 index cards

This kind of output exemplifies [[Atomic Habits and Compound Growth]]—small daily additions creating massive results.

## Key Principles

### One Idea Per Note

Notes should be atomic—small enough to be reusable, complete enough to stand alone.

### Write for Your Future Self

Every note should be written as if explaining the idea to someone who has no context. This is great practice for [[Learning in Public]].

### Links Create Value

The magic happens in the connections:

\`\`\`
Note A ←→ Note B ←→ Note C
    ↓
Note D ←→ Note E
\`\`\`

Unexpected connections emerge when you link freely. This is the essence of [[The Adjacent Possible]].`,
    backlinks: ["personal-knowledge-management"],
    relatedNotes: ["digital-garden-philosophy", "atomic-habits"],
  },
  {
    slug: "learning-in-public",
    title: "Learning in Public",
    summary: "Share what you learn as you learn it. Building reputation and connections through open work.",
    status: "budding",
    updatedAt: "2025-01-05",
    tags: ["learning", "writing", "career"],
    content: `Learning in public means sharing your learning journey openly, even (especially) when you don't have it all figured out. This is the spirit behind my [[Digital Garden Philosophy]].

## The Approach

Instead of waiting until you're an expert:

- Write about what you just learned
- Document your mistakes and corrections
- Ask questions openly
- Build in public

## Benefits

### For You

- Clarifies thinking through writing
- Creates a record of your journey
- Attracts mentors and collaborators

### For Others

- Helps people a few steps behind you
- Shows realistic learning paths
- Humanizes expertise

## Overcoming Fear

The main obstacle is fear of being wrong. But:

> The expert was once the beginner who kept showing up.

Start with what you know, even if it's not much. Your future self will thank you.

This connects with [[Atomic Habits and Compound Growth]]—showing up daily matters more than being perfect. And it's enhanced by good [[Personal Knowledge Management]] to track what you're learning.`,
    backlinks: ["digital-garden-philosophy", "atomic-habits"],
    relatedNotes: ["personal-knowledge-management"],
  },
  {
    slug: "spaced-repetition",
    title: "Spaced Repetition Systems",
    summary: "Using memory science to retain what you learn. The forgetting curve and optimal review intervals.",
    status: "seed",
    updatedAt: "2025-01-03",
    tags: ["learning", "memory", "productivity"],
    content: `Spaced repetition is a learning technique that incorporates increasing intervals of time between reviews of previously learned material.

## The Forgetting Curve

Hermann Ebbinghaus discovered that we forget information exponentially:

- After 1 hour: ~50% forgotten
- After 1 day: ~70% forgotten
- After 1 week: ~90% forgotten

## The Solution

Review at increasing intervals:
- 1 day
- 3 days
- 1 week
- 2 weeks
- 1 month
- 3 months

Each review strengthens the memory and extends retention. This pairs well with [[Deliberate Practice]]—reviewing with intention, not just passively.

## Tools

Popular SRS tools include:
- Anki
- SuperMemo
- RemNote

Still exploring how to integrate this with my note-taking workflow... see [[Personal Knowledge Management]] for the broader system I'm developing.`,
    backlinks: ["atomic-habits"],
    relatedNotes: ["deliberate-practice"],
  },
  {
    slug: "deliberate-practice",
    title: "Deliberate Practice",
    summary: "Purposeful practice with feedback. Moving beyond the plateau to genuine expertise.",
    status: "seed",
    updatedAt: "2024-12-28",
    tags: ["learning", "growth", "expertise"],
    content: `Deliberate practice is a specific type of practice that is purposeful and systematic.

## Key Characteristics

Unlike naive practice, deliberate practice:

1. Has clear, specific goals
2. Requires full concentration
3. Involves immediate feedback
4. Pushes beyond comfort zone

## The 10,000 Hour Myth

It's not just about time spent—it's about how you spend that time. 10,000 hours of mindless repetition won't make you an expert.

This connects to [[Atomic Habits and Compound Growth]]—it's not just showing up, it's showing up with intention.

## Application

Areas to explore:
- How does this apply to knowledge work?
- What does "feedback" look like for thinking?
- Can writing be deliberate practice for thinking?

[[Learning in Public]] might be a form of deliberate practice—you get feedback from others and from the act of explaining.

More research needed... [[Spaced Repetition Systems]] could help retain the insights from deliberate practice sessions.`,
    backlinks: ["atomic-habits"],
    relatedNotes: ["spaced-repetition", "learning-in-public"],
  },
  {
    slug: "the-adjacent-possible",
    title: "The Adjacent Possible",
    summary: "Innovation happens at the edges of what's possible. How constraints enable creativity.",
    status: "budding",
    updatedAt: "2024-12-20",
    tags: ["creativity", "innovation", "thinking"],
    content: `The adjacent possible is a concept from Stuart Kauffman, borrowed by Steven Johnson to explain innovation.

## The Concept

At any moment, there's a set of first-order combinations available—things you can create with what currently exists. This is the adjacent possible.

> The strange and beautiful truth about the adjacent possible is that its boundaries grow as you explore them.

## Implications for Creativity

You can't jump to revolutionary ideas directly. Innovation is incremental:

1. Master what exists
2. See what's newly possible
3. Take one step into new territory
4. Repeat

This is why [[The Zettelkasten Method]] works so well—each new note expands what connections are possible.

## In Practice

For note-taking and thinking:
- Each new connection opens new possibilities
- Combinations of ideas create new adjacent possibilities
- The more you write, the more connections become available

The garden grows its own possibilities. This is central to [[Digital Garden Philosophy]]—you can't plan the garden in advance, you tend it and watch it grow.

See also [[Personal Knowledge Management]] for the systems that enable this exploration.`,
    backlinks: [],
    relatedNotes: ["digital-garden-philosophy", "personal-knowledge-management"],
  },
]

export const tags = [
  { name: "productivity", count: 3 },
  { name: "habits", count: 1 },
  { name: "growth", count: 2 },
  { name: "pkm", count: 2 },
  { name: "notes", count: 2 },
  { name: "thinking", count: 3 },
  { name: "digital-garden", count: 1 },
  { name: "writing", count: 2 },
  { name: "methodology", count: 1 },
  { name: "learning", count: 3 },
  { name: "career", count: 1 },
  { name: "memory", count: 1 },
  { name: "expertise", count: 1 },
  { name: "creativity", count: 1 },
  { name: "innovation", count: 1 },
]

export function getNoteBySlug(slug: string): Note | undefined {
  return notes.find((note) => note.slug === slug)
}

export function getNotesByTag(tag: string): Note[] {
  return notes.filter((note) => note.tags.includes(tag))
}

export function getRandomNote(): Note {
  return notes[Math.floor(Math.random() * notes.length)]
}
