#!/usr/bin/env tsx
import { getAllNotes, getAllResearch, getResearchIndex, type ArtifactKind, type ArtifactStatus, type ArtifactTier } from '../lib/vault';

interface ValidationIssue {
  filepath: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

const ARTIFACT_KINDS: ArtifactKind[] = [
  'paper', 'spec', 'talk', 'prototype', 'post', 'report', 'thread', 'library',
];

const ARTIFACT_STATUSES: ArtifactStatus[] = ['active', 'preview', 'historical', 'forthcoming'];

const ARTIFACT_TIERS: ArtifactTier[] = ['card', 'note'];

// Validate the research area: curated artifacts and the framing index. Returns
// issues to fold into the main report. Every `type: artifact` entry must carry
// the curation fields the index and artifact pages depend on, and any research
// entry that claims a track must name a track the index actually defines.
async function validateResearch(): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const research = await getAllResearch();
  const index = await getResearchIndex();

  if (!index) {
    issues.push({
      filepath: 'content/research/index.md',
      severity: 'error',
      message: 'Missing research index note (type: research-index) with a tracks list',
    });
    return issues;
  }

  const validTracks = new Set(index.tracks.map(t => t.slug));
  if (validTracks.size === 0) {
    issues.push({
      filepath: 'content/research/index.md',
      severity: 'error',
      message: 'Research index defines no tracks',
    });
  }

  research.forEach(entry => {
    const where = entry.filepath;

    if (entry.type === 'artifact') {
      if (!entry.summary) {
        issues.push({ filepath: where, severity: 'error', message: 'Artifact missing summary' });
      }
      if (!entry.fits) {
        issues.push({ filepath: where, severity: 'error', message: 'Artifact missing fits (how it fits the thesis)' });
      }
      if (!entry.date) {
        issues.push({ filepath: where, severity: 'error', message: 'Artifact missing date (YYYY or YYYY-MM)' });
      }
      if (!entry.artifactKind) {
        issues.push({ filepath: where, severity: 'error', message: 'Artifact missing artifact_kind' });
      } else if (!ARTIFACT_KINDS.includes(entry.artifactKind)) {
        issues.push({ filepath: where, severity: 'error', message: `Unknown artifact_kind "${entry.artifactKind}" (expected one of: ${ARTIFACT_KINDS.join(', ')})` });
      }
      if (!entry.tracks || entry.tracks.length === 0) {
        issues.push({ filepath: where, severity: 'error', message: 'Artifact must declare at least one track' });
      }
      if (!ARTIFACT_STATUSES.includes(entry.status as ArtifactStatus)) {
        issues.push({ filepath: where, severity: 'error', message: `Artifact status "${entry.status}" is not one of: ${ARTIFACT_STATUSES.join(', ')}` });
      }
      // Forthcoming entries are announced but unpublished — they are the one
      // case allowed to have no link yet. Publishing later means adding a URL
      // and flipping the status.
      if (entry.status !== 'forthcoming' && (!entry.links || entry.links.length === 0)) {
        issues.push({ filepath: where, severity: 'error', message: 'Artifact must have at least one link with a URL (external or on-site)' });
      }
      // A lineage pointer must name a real research entry.
      if (entry.supersededBy && !research.some(n => n.slug === entry.supersededBy)) {
        issues.push({ filepath: where, severity: 'error', message: `superseded_by "${entry.supersededBy}" does not match any research entry slug` });
      }
    }

    // Any research entry that claims tracks (artifacts and hosted notes alike)
    // must reference tracks the index defines, and must declare an editorial
    // tier so the page knows whether it renders as a card or a compact row.
    (entry.tracks ?? []).forEach(track => {
      if (!validTracks.has(track)) {
        issues.push({
          filepath: where,
          severity: 'error',
          message: `Track "${track}" is not defined in the research index track list`,
        });
      }
    });
    if ((entry.tracks?.length ?? 0) > 0 && !ARTIFACT_TIERS.includes(entry.tier as ArtifactTier)) {
      issues.push({
        filepath: where,
        severity: 'error',
        message: `Tracked research entry must declare tier: card | note (got "${entry.tier ?? 'none'}")`,
      });
    }
  });

  return issues;
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

  // Fold in research-area validation (artifacts + framing index).
  const researchIssues = await validateResearch();
  issues.push(...researchIssues);

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
      const exists = notes.some(n => {
        const noteTitle = typeof n.title === 'string' ? n.title.toLowerCase() : '';
        return noteTitle === linkedTitle || n.slug === linkedTitle;
      });

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
