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

  describe('Image embeds', () => {
    test('leaves a plain image embed as a bare inline image', async () => {
      const html = await processMarkdown('![[diagram.svg]]', availableNotes);
      expect(html).toContain('src="/attachments/diagram.svg"');
      expect(html).toContain('alt="diagram"');
      // no hint and no caption → not wrapped in a figure
      expect(html).not.toContain('<figure');
    });

    test('uses a pipe segment as alt text', async () => {
      const html = await processMarkdown('![[diagram.svg|a nice chart]]', availableNotes);
      expect(html).toContain('src="/attachments/diagram.svg"');
      expect(html).toContain('alt="a nice chart"');
    });

    test('wraps a width hint in a sized figure', async () => {
      const html = await processMarkdown('![[diagram.svg|75%]]', availableNotes);
      expect(html).toContain('<figure');
      expect(html).toContain('src="/attachments/diagram.svg"');
      expect(html).toContain('width: 75%');
      // fragment is stripped from the served src
      expect(html).not.toContain('#w=');
    });

    test('treats a bare number as a pixel width', async () => {
      const html = await processMarkdown('![[diagram.svg|400]]', availableNotes);
      expect(html).toContain('width: 400px');
    });

    test('supports both alt text and a width hint', async () => {
      const html = await processMarkdown('![[diagram.svg|a nice chart|75%]]', availableNotes);
      expect(html).toContain('alt="a nice chart"');
      expect(html).toContain('width: 75%');
    });

    test('applies the wide layout as a figure that bleeds past the column', async () => {
      const html = await processMarkdown('![[diagram.svg|wide]]', availableNotes);
      expect(html).toContain('src="/attachments/diagram.svg"');
      expect(html).toContain('class="note-figure img-wide"');
      // fragment is stripped from the served src
      expect(html).not.toContain('#layout=');
    });

    test('applies the full layout as a figure class', async () => {
      const html = await processMarkdown('![[diagram.svg|full]]', availableNotes);
      expect(html).toContain('class="note-figure img-full"');
    });

    test('supports both alt text and a wide layout', async () => {
      const html = await processMarkdown('![[diagram.svg|a nice chart|wide]]', availableNotes);
      expect(html).toContain('alt="a nice chart"');
      expect(html).toContain('class="note-figure img-wide"');
    });

    test('turns a following blockquote into a figcaption', async () => {
      const markdown = '![[diagram.svg|wide]]\n> A caption with **bold**.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('class="note-figure img-wide"');
      expect(html).toContain('<figcaption>');
      expect(html).toContain('<strong>bold</strong>');
      // the caption blockquote is consumed, not left as a quote
      expect(html).not.toContain('<blockquote>');
    });

    test('supports a multi-line blockquote caption', async () => {
      const markdown = '![[diagram.svg|wide]]\n> Line one.\n> Line two.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<figcaption>');
      expect(html).toContain('Line one.');
      expect(html).toContain('Line two.');
    });

    test('treats a following italic line as a caption (back-compat)', async () => {
      const markdown = '![[diagram.svg]]\n*italic caption*';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('<figure');
      expect(html).toContain('<figcaption>');
      expect(html).toContain('<em>italic caption</em>');
    });

    test('uses a bold line above the image as a title', async () => {
      const markdown = '**Figure 1**\n\n![[diagram.svg|wide]]';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('class="note-figure img-wide"');
      expect(html).toContain('class="figure-title"');
      expect(html).toContain('Figure 1');
    });

    test('supports a bold title, image, and caption together', async () => {
      const markdown = '**Figure 1**\n![[diagram.svg|wide]]\n> The caption.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('class="figure-title"');
      expect(html).toContain('Figure 1');
      expect(html).toContain('<figcaption>');
      expect(html).toContain('The caption.');
    });

    test('does not treat plain text above an image as a title', async () => {
      const markdown = 'Some intro sentence.\n\n![[diagram.svg|wide]]';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('class="note-figure img-wide"');
      expect(html).not.toContain('figure-title');
      // the sentence stays its own paragraph
      expect(html).toContain('<p>Some intro sentence.</p>');
    });

    test('does not consume a callout blockquote as a caption', async () => {
      const markdown = '![[diagram.svg|wide]]\n\n> [!note]\n> Not a caption.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('class="note-figure img-wide"');
      // the callout is rendered as a callout, not pulled into a figcaption
      expect(html).toContain('callout');
      expect(html).not.toContain('<figcaption>');
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

  describe('Math (KaTeX)', () => {
    test('renders inline $…$ as inline math, not display', async () => {
      const html = await processMarkdown('The pair $(C, E)$ here.', availableNotes);
      expect(html).toContain('class="katex');
      expect(html).not.toContain('katex-display');
    });

    test('renders a single-line $$…$$ as centered display math', async () => {
      const markdown = 'Intro:\n\n$$\\mathcal{E} : (C, E) \\mapsto A$$\n\nAfter.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('katex-display');
    });

    test('renders a multi-line $$…$$ block as display math', async () => {
      const markdown = 'Intro:\n\n$$\nA = (\\pi, Q)\n$$\n\nAfter.';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('katex-display');
    });
  });

  describe('Obsidian annotations', () => {
    test('strips %% comments entirely', async () => {
      const html = await processMarkdown('Before %%a private note%% after.', availableNotes);
      expect(html).toContain('Before');
      expect(html).toContain('after.');
      expect(html).not.toContain('private note');
      expect(html).not.toContain('%%');
    });

    test('unwraps ==highlights== to plain text', async () => {
      const html = await processMarkdown('This is ==important== text.', availableNotes);
      expect(html).toContain('important');
      expect(html).not.toContain('==');
      expect(html).not.toContain('<mark>');
    });

    test('does not pair == across separate code lines', async () => {
      // Two independent equality comparisons must stay intact, not merge.
      const markdown = '`a == b`\n\n`c == d`';
      const html = await processMarkdown(markdown, availableNotes);
      expect(html).toContain('a == b');
      expect(html).toContain('c == d');
    });
  });

  describe('Sidenotes (research area)', () => {
    const footnoteMd = 'A claim.[^1]\n\n[^1]: The supporting note.';

    test('relocates footnotes into inline sidenotes on research pages', async () => {
      const html = await processMarkdown(footnoteMd, [], 'research');
      expect(html).toContain('class="sidenote"');
      expect(html).toContain('The supporting note.');
      // the collected footnotes section is removed in favor of the sidenote
      expect(html).not.toContain('data-footnotes');
    });

    test('keeps the standard footnotes section on notes pages', async () => {
      const html = await processMarkdown(footnoteMd, [], 'notes');
      expect(html).toContain('data-footnotes');
      expect(html).not.toContain('class="sidenote"');
    });
  });

  describe('Print footnotes (research PDF)', () => {
    const footnoteMd = 'A claim.[^1]\n\n[^1]: The supporting note.';

    test('inlines footnotes as floatable spans for the PDF build', async () => {
      const html = await processMarkdown(footnoteMd, [], 'research', {
        footnoteStyle: 'print',
      });
      // Definition inlined at the call site as a footnote span (Paged.js floats
      // it to the page foot), not a margin sidenote.
      expect(html).toContain('class="footnote"');
      expect(html).toContain('The supporting note.');
      expect(html).not.toContain('class="sidenote"');
      // The collected footnotes section is removed.
      expect(html).not.toContain('data-footnotes');
    });

    test('unwraps the definition paragraph so no <p> nests in the span', async () => {
      const html = await processMarkdown(footnoteMd, [], 'research', {
        footnoteStyle: 'print',
      });
      // A <p> inside the inline span would be ejected by the HTML parser,
      // stranding the note text — the definition must be flattened to inline.
      expect(html).not.toMatch(/<span class="footnote"><p>/);
    });

    test('defaults to sidenotes when no footnoteStyle is given', async () => {
      const html = await processMarkdown(footnoteMd, [], 'research');
      expect(html).toContain('class="sidenote"');
      expect(html).not.toContain('class="footnote"');
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
