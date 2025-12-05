# Deployment Automation Setup

This document describes the automated deployment pipeline for the Research Notes frontend.

## Overview

When you push changes to the Research Notes vault, GitHub Actions automatically:
1. Validates all notes for required frontmatter and broken links
2. Builds the Next.js site
3. Deploys to Vercel

## Prerequisites

### Vercel Account Setup

1. Create a Vercel account at https://vercel.com
2. Create a new project linked to the `research-notes-frontend` repository
3. Get your deployment credentials:
   - **Vercel Token**: Go to Account Settings → Tokens → Create Token
   - **Vercel Org ID**: Found in your organization settings
   - **Vercel Project ID**: Found in project settings

### GitHub Secrets Configuration

In your Research Notes vault repository, add these secrets:

1. Go to Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `VERCEL_TOKEN`: Your Vercel deployment token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

## Validation Script

The `scripts/validate.ts` script checks notes before deployment:

### Error Conditions (Build Fails)
- Missing title in frontmatter

### Warning Conditions (Build Continues)
- Missing status field (seed/budding/evergreen)
- Sensitive keywords detected (password, api key, secret, etc.)

### Info Conditions (Build Continues)
- Broken wikilinks to non-existent notes

### Running Locally

```bash
# Run validation
pnpm validate

# Run validation and build
pnpm build
```

## Publishing Workflow

### Quick Publish (Recommended)

Use the convenience script in your vault:

```bash
# From anywhere
~/Projects/obsidian/research-notes/scripts/publish.sh

# Or with a custom message
~/Projects/obsidian/research-notes/scripts/publish.sh "Add new note on Web3"
```

### Manual Publish

```bash
cd ~/Projects/obsidian/research-notes
git add .
git commit -m "Update notes"
git push
```

### Monitor Deployment

After pushing, monitor the deployment:

```bash
# Watch GitHub Actions workflow
gh run watch

# Or check GitHub Actions tab in your vault repository
```

## Deployment Process

1. **Push to Vault**: You push changes to the Research Notes vault
2. **GitHub Actions Triggered**: Workflow starts automatically
3. **Validation**: Script checks all notes for errors
4. **Build**: Next.js builds the static site
5. **Deploy**: Site deploys to Vercel
6. **Live**: Changes appear at your production URL (~2 minutes total)

## Troubleshooting

### Build Fails with Validation Errors

Check the GitHub Actions logs for specific errors:
- Missing frontmatter fields
- Broken wikilinks
- Sensitive content

Fix the issues in your notes and push again.

### Deployment Fails

1. Verify GitHub secrets are set correctly
2. Check Vercel project settings
3. Review GitHub Actions logs for specific errors

### Local Development

The frontend development server doesn't require Vercel:

```bash
cd /path/to/research-notes-frontend
pnpm dev
```

## Files Modified

### Frontend Repository
- `scripts/validate.ts` - Validation script
- `package.json` - Added validate script
- `vercel.json` - Vercel deployment configuration
- `DEPLOYMENT.md` - This file

### Vault Repository
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `scripts/publish.sh` - One-command publishing script

## Workflow Triggers

The GitHub Actions workflow triggers on:
- Pushes to `main` branch
- Changes to `notes/**`, `attachments/**`, or `meta/**` directories

Changes to other files (like README.md or .obsidian config) won't trigger deployment.
