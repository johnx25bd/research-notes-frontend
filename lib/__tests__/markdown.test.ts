import { processMarkdown } from '../markdown';

describe('processMarkdown', () => {
  const availableNotes = ['atomic-habits', 'note-taking', 'evergreen-notes'];

  describe('Basic Markdown', () => {
    test('processes headers correctly', async () => {
      const markdown = '# H1\n## H2\n### H3';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<h1>H1</h1>');
      expect(html).toContain('<h2>H2</h2>');
      expect(html).toContain('<h3>H3</h3>');
    });

    test('processes bold and italic', async () => {
      const markdown = 'This is **bold** and this is *italic*.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    test('processes inline code', async () => {
      const markdown = 'Use `console.log()` for debugging.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<code>console.log()</code>');
    });

    test('processes links', async () => {
      const markdown = '[Google](https://google.com)';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('href="https://google.com"');
      expect(html).toContain('>Google</a>');
    });

    test('processes unordered lists', async () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
      expect(html).toContain('</ul>');
    });

    test('processes ordered lists', async () => {
      const markdown = '1. First\n2. Second\n3. Third';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<ol>');
      expect(html).toContain('<li>First</li>');
      expect(html).toContain('<li>Second</li>');
      expect(html).toContain('</ol>');
    });
  });

  describe('GitHub Flavored Markdown', () => {
    test('processes tables correctly', async () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<th>Header 1</th>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<td>Cell 1</td>');
    });

    test('processes strikethrough', async () => {
      const markdown = 'This is ~~deleted~~ text.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<del>deleted</del>');
    });

    test('processes task lists', async () => {
      const markdown = '- [ ] Unchecked\n- [x] Checked';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('type="checkbox"');
      expect(html).toContain('checked');
    });
  });

  describe('Wikilinks', () => {
    test('processes wikilinks to existing notes', async () => {
      const markdown = 'See [[Atomic Habits]] for more.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('href="/notes/atomic-habits"');
      expect(html).toContain('>Atomic Habits</a>');
    });

    test('processes wikilink aliases', async () => {
      const markdown = 'Read [[Atomic Habits|this book]] now.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('href="/notes/atomic-habits"');
      expect(html).toContain('>this book</a>');
    });

    test('handles wikilinks with different casing', async () => {
      const markdown = 'See [[atomic habits]] for details.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('href="/notes/atomic-habits"');
    });

    test('handles broken wikilinks gracefully', async () => {
      const markdown = 'See [[Nonexistent Note]] please.';
      const html = await processMarkdown(markdown, availableNotes);
      // Broken links still render as links but with the broken-link class
      expect(html).toContain('href="/notes/nonexistent-note"');
      expect(html).toContain('class="internal-link broken-link"');
    });

    test('processes multiple wikilinks in same paragraph', async () => {
      const markdown = 'Connect [[Atomic Habits]] with [[Note Taking]] practices.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('href="/notes/atomic-habits"');
      expect(html).toContain('href="/notes/note-taking"');
    });
  });

  describe('Callouts', () => {
    test('processes note callout', async () => {
      const markdown = '> [!note] Important\n> This is a callout.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('callout');
    });

    test('processes warning callout', async () => {
      const markdown = '> [!warning]\n> Be careful here.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('callout');
      expect(html).toContain('warning');
    });

    test('processes info callout', async () => {
      const markdown = '> [!info] FYI\n> Just so you know.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('callout');
      expect(html).toContain('info');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty markdown', async () => {
      const html = await processMarkdown('', availableNotes);
      expect(html).toBe('');
    });

    test('handles markdown with no wikilinks', async () => {
      const markdown = '# Regular Markdown\n\nNo wikilinks here.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<h1>Regular Markdown</h1>');
      expect(html).toContain('No wikilinks here');
    });

    test('handles special characters in wikilinks', async () => {
      const markdown = '[[Note-Taking]]';
      const html = await processMarkdown(markdown, ['note-taking']);
      expect(html).toContain('href="/notes/note-taking"');
    });

    test('processes very long markdown without errors', async () => {
      const longMarkdown = '# Title\n\n' + 'This is a paragraph. '.repeat(100);
      const html = await processMarkdown(longMarkdown, availableNotes);
      expect(html).toContain('<h1>Title</h1>');
      expect(html.length).toBeGreaterThan(1000);
    });

    test('handles markdown with no available notes', async () => {
      const markdown = '[[Some Note]] reference.';
      const html = await processMarkdown(markdown, []);
      // Should render but not as a link
      expect(html).toBeTruthy();
    });
  });

  describe('Combined Features', () => {
    test('processes markdown with multiple features', async () => {
      const markdown = `# Title

This is **bold** and [[Atomic Habits|a wikilink]].

| Column 1 | Column 2 |
|----------|----------|
| Data     | More     |

> [!note] Remember
> This is important.

- [ ] Task 1
- [x] Task 2`;

      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('href="/notes/atomic-habits"');
      expect(html).toContain('<table>');
      expect(html).toContain('callout');
      expect(html).toContain('type="checkbox"');
    });
  });
});
