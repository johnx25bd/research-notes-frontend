#!/usr/bin/env tsx
import { getAllNotes } from '../lib/vault';

interface ValidationIssue {
  filepath: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

const SENSITIVE_KEYWORDS = [
  'password', 'api key', 'secret', 'confidential',
  'private note:', 'do not share'
];

async function validate() {
  console.log('🔍 Validating Research Notes vault...\n');

  const notes = await getAllNotes();
  const issues: ValidationIssue[] = [];

  if (notes.length === 0) {
    console.log('⚠️  No notes found in vault');
    return;
  }

  console.log(`Found ${notes.length} notes\n`);

  notes.forEach(note => {
    // Check required frontmatter
    if (!note.title) {
      issues.push({
        filepath: note.filepath,
        severity: 'error',
        message: 'Missing title in frontmatter'
      });
    }

    if (!note.status) {
      issues.push({
        filepath: note.filepath,
        severity: 'warning',
        message: 'Missing status (seed/budding/evergreen)'
      });
    }

    // Check for sensitive content
    const contentLower = note.content.toLowerCase();
    SENSITIVE_KEYWORDS.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        issues.push({
          filepath: note.filepath,
          severity: 'warning',
          message: `Contains sensitive keyword: "${keyword}"`
        });
      }
    });

    // Check broken wikilinks
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    const matches = [...note.content.matchAll(wikilinkRegex)];

    matches.forEach(match => {
      const linkedTitle = match[1].trim().toLowerCase();
      const exists = notes.some(n =>
        n.title.toLowerCase() === linkedTitle ||
        n.slug === linkedTitle
      );

      if (!exists) {
        issues.push({
          filepath: note.filepath,
          severity: 'info',
          message: `Broken link: [[${match[1]}]]`
        });
      }
    });
  });

  // Report results
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach(issue => {
      console.log(`  ${issue.filepath}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach(issue => {
      console.log(`  ${issue.filepath}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  if (infos.length > 0) {
    console.log('ℹ️  INFO:\n');
    infos.forEach(issue => {
      console.log(`  ${issue.filepath}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  if (issues.length === 0) {
    console.log('✅ All validations passed!');
  }

  if (errors.length > 0) {
    console.log('\n❌ Validation failed. Please fix errors before deploying.');
    process.exit(1);
  }

  console.log(`\n✅ Ready to deploy ${notes.length} notes`);
}

validate();
