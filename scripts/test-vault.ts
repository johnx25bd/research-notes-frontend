#!/usr/bin/env tsx
import { getAllNotes, getNoteBySlug } from '../lib/vault';
import { computeBacklinks } from '../lib/backlinks';

async function test() {
  console.log('🧪 Testing vault infrastructure...\n');

  // Test 1: getAllNotes
  console.log('Test 1: getAllNotes()');
  const notes = await getAllNotes();
  console.log(`✓ Found ${notes.length} notes`);

  if (notes.length > 0) {
    console.log('\nSample note:');
    const sample = notes[0];
    console.log(`  - Slug: ${sample.slug}`);
    console.log(`  - Title: ${sample.title}`);
    console.log(`  - Status: ${sample.status}`);
    console.log(`  - Last Tended: ${sample.lastTended}`);
    console.log(`  - Tags: ${sample.tags.join(', ')}`);
    console.log(`  - Featured: ${sample.featured}`);
    console.log(`  - Content preview: ${sample.content.substring(0, 50)}...`);
  }

  // Test 2: getNoteBySlug
  console.log('\n\nTest 2: getNoteBySlug()');
  const note = await getNoteBySlug('test-note-one');
  if (note) {
    console.log(`✓ Found note: ${note.title}`);
  } else {
    console.log('✗ Note not found');
  }

  // Test 3: computeBacklinks
  console.log('\n\nTest 3: computeBacklinks()');
  const backlinks = computeBacklinks(notes);
  console.log('✓ Computed backlinks:');
  Object.entries(backlinks).forEach(([slug, links]) => {
    if (links.length > 0) {
      console.log(`  - ${slug}: [${links.join(', ')}]`);
    }
  });

  console.log('\n✅ All tests completed!');
}

test();
