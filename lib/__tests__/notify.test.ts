import {
  selectNotesToNotify,
  slugFromFile,
  noteUrl,
  buildNotificationEmail,
  type NotifyCandidate,
} from '../notify';

function candidate(file: string, data: NotifyCandidate['data']): NotifyCandidate {
  return { file, data };
}

describe('selectNotesToNotify', () => {
  test('selects published notes flagged notify that are not yet announced', () => {
    const c = candidate('New note.md', { published: true, notify: true });
    expect(selectNotesToNotify([c])).toEqual([c]);
  });

  test('skips notes that are not flagged notify', () => {
    const c = candidate('Quiet note.md', { published: true });
    expect(selectNotesToNotify([c])).toEqual([]);
  });

  test('skips unpublished notes even when flagged', () => {
    const c = candidate('Draft.md', { published: false, notify: true });
    expect(selectNotesToNotify([c])).toEqual([]);
  });

  test('skips notes already announced (notified_at set)', () => {
    const c = candidate('Old.md', {
      published: true,
      notify: true,
      notified_at: '2026-06-01',
    });
    expect(selectNotesToNotify([c])).toEqual([]);
  });

  test('skips stub notes', () => {
    const c = candidate('Stub.md', { published: true, notify: true, stub: true });
    expect(selectNotesToNotify([c])).toEqual([]);
  });

  test('filters a mixed batch down to the eligible notes', () => {
    const eligible = candidate('Ship.md', { published: true, notify: true });
    const batch = [
      eligible,
      candidate('Draft.md', { published: false, notify: true }),
      candidate('Sent.md', { published: true, notify: true, notified_at: '2026-05-01' }),
      candidate('Quiet.md', { published: true }),
    ];
    expect(selectNotesToNotify(batch)).toEqual([eligible]);
  });
});

describe('slugFromFile', () => {
  test('lowercases and hyphenates a title-cased filename', () => {
    expect(slugFromFile('Back to the bench.md')).toBe('back-to-the-bench');
  });

  test('strips a nested directory prefix', () => {
    expect(slugFromFile('subdir/My Note.md')).toBe('my-note');
  });

  test('normalizes em-dashes to hyphens', () => {
    expect(slugFromFile('Before — after.md')).toBe('before---after');
  });
});

describe('noteUrl', () => {
  test('prefers an explicit url from frontmatter', () => {
    const c = candidate('Whatever.md', { url: 'https://johnx.co/notes/custom' });
    expect(noteUrl(c, 'https://johnx.co')).toBe('https://johnx.co/notes/custom');
  });

  test('builds a url from the site base and slug when none is set', () => {
    const c = candidate('Back to the bench.md', {});
    expect(noteUrl(c, 'https://johnx.co/')).toBe(
      'https://johnx.co/notes/back-to-the-bench',
    );
  });
});

describe('buildNotificationEmail', () => {
  const c = candidate('Back to the bench.md', {
    title: 'Back to the bench',
    summary: 'On mixed emotions and being the second mouse.',
    published: true,
    notify: true,
    url: 'https://johnx.co/notes/back-to-the-bench',
  });

  test('subject names the note', () => {
    const email = buildNotificationEmail(c, 'https://johnx.co');
    expect(email.subject).toBe('New note: Back to the bench');
  });

  test('preview text uses the summary when present', () => {
    const email = buildNotificationEmail(c, 'https://johnx.co');
    expect(email.previewText).toBe('On mixed emotions and being the second mouse.');
  });

  test('text and html both contain the note link', () => {
    const email = buildNotificationEmail(c, 'https://johnx.co');
    expect(email.text).toContain('https://johnx.co/notes/back-to-the-bench');
    expect(email.html).toContain('https://johnx.co/notes/back-to-the-bench');
  });

  test('escapes html-significant characters in the title', () => {
    const risky = candidate('x.md', {
      title: 'Tools & <tags>',
      url: 'https://johnx.co/notes/x',
    });
    const email = buildNotificationEmail(risky, 'https://johnx.co');
    expect(email.html).toContain('Tools &amp; &lt;tags&gt;');
    expect(email.html).not.toContain('<tags>');
  });
});
