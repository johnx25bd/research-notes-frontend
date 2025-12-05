import { execSync } from 'child_process';
import fs from 'fs';

export async function getGitDate(filepath: string): Promise<string> {
  try {
    // Determine vault path for git operations
    const vaultPath = filepath.includes('research-notes')
      ? filepath.split('research-notes')[0] + 'research-notes'
      : process.cwd();

    // Get last commit date for this specific file
    const result = execSync(
      `git log -1 --format=%cI -- "${filepath}"`,
      {
        encoding: 'utf-8',
        cwd: vaultPath
      }
    );

    const date = result.trim();
    if (date) return date;

    // Fallback to file system mtime if no git history yet
    const stats = fs.statSync(filepath);
    return stats.mtime.toISOString();
  } catch (error) {
    // If git fails, use file system
    try {
      const stats = fs.statSync(filepath);
      return stats.mtime.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}
