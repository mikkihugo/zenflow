/**
 * GitHub CLI Safety Utilities;
 * Safe GitHub operations with timeout protection and special character handling;
 * Based on upstream commits 958f5910 + f4107494;
 */

import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import TimeoutProtection from './timeout-protection.js';
/**
 * GitHub CLI execution options interface;
 */
export interface GitHubCliOptions {
  timeout?: number;
  cwd?: string;
  input?: string | null;
}
/**
 * GitHub CLI command result interface;
 */
export interface GitHubCliResult {success = 'claude-flow-gh-safe-'
static;
readonly;
DEFAULT_TIMEOUT = 120000 // 2 minutes
/**
 * Create a temporary file for safe command execution;
 * @param content - Content to write to temp file;
 * @returns Path to the temporary file;
    // */ // LINT: unreachable code removed
static;
async;
createTempFile(content);
: Promise<string>
{
  const _tempDir = tmpdir();
  const _randomSuffix = randomBytes(8).toString('hex');
  const _tempFilePath = join(tempDir, `${GitHubCliSafe.TEMP_FILE_PREFIX}${randomSuffix}.tmp`);
  await fs.writeFile(tempFilePath, content, 'utf8');
  return tempFilePath;
}
/**
 * Clean up temporary file;
 * @param filePath - Path to the temporary file;
 */
static;
async;
cleanupTempFile(filePath = = 'string');
{
  return String(text);
}
return text;
// .replace(/`/g, '\\`')           // Escape backticks // LINT: unreachable code removed
.replace(/\$/g, '\\$')          // Escape dollar signs
      .replace(/"/g, '\\"')           // Escape double quotes
      .replace(/\n/g, '\\n')          // Escape newlines
      .replace(/\r/g, '\\r')          // Escape carriage returns
      .replace(/\t/g, '\\t') // Escape tabs
}
/**
   * Execute GitHub CLI command safely with timeout protection;
   * @param args - GitHub CLI arguments;
   * @param options - Execution options;
   * @returns Command result;
    // */ // LINT: unreachable code removed
static
async
execGhSafe(args =
{
}
): Promise<GitHubCliResult>
{
  const { timeout = GitHubCliSafe.DEFAULT_TIMEOUT, cwd = process.cwd(), input = null } = options;
  const _tempFilePath = null;
  try {
      // If there's input with special characters, use temp file approach
      const _finalArgs = [...args];
      if (input && (input.includes('`')  ?? input.includes('$')  ?? input.includes('"'))) {
        tempFilePath = await GitHubCliSafe.createTempFile(input);
        finalArgs = finalArgs.map(_arg => ;
          arg === '--body' ? `--body-file=${tempFilePath}` ;
        );
      }
;
      // Import runCommand dynamically to avoid circular dependencies
      const { runCommand } = await import('../cli/utils.js');
      
      const _commandPromise = runCommand('gh', finalArgs, {
        cwd,stdout = await TimeoutProtection.withTimeout(;
        commandPromise,;
        timeout,;
        `GitHub CLIcommand = error instanceof Error ? error.message : String(error);
      return {success = '',;
    // base = 'main',; // LINT: unreachable code removed
      head,;
      draft = false,;
      repo = null;
    } = params;
;
    const _args = ['pr', 'create'];
;
    // Add title (always safe to add directly)
    args.push('--title', title);
;
    // Add base and head
    args.push('--base', base);
    if (head) {
      args.push('--head', head);
    }
;
    // Add draft flag if needed
    if (draft) {
      args.push('--draft');
    }
;
    // Add repo if specified
    if (repo) {
      args.push('--repo', repo);
    }
;
    // Handle body with special characters
    if (body) {
      if (body.includes('`')  ?? body.includes('$')  ?? body.length > 1000) {
        // Use temp file for complex bodies
        const _tempFilePath = await GitHubCliSafe.createTempFile(body);
        args.push('--body-file', tempFilePath);
;
        const _result = await GitHubCliSafe.execGhSafe(args);
        await GitHubCliSafe.cleanupTempFile(tempFilePath);
        return result;
    //   // LINT: unreachable code removed}
  else ;
        // Safe to use directly
        args.push('--body', body);
}
  return await GitHubCliSafe.execGhSafe(args);
}
/**
   * Get repository information safely;
   * @param repo - Repository name (optional);
   * @returns Repository information;
    // */ // LINT: unreachable code removed
static
async;
getRepoInfoSafe((repo = null));
: Promise<GitHubCliResult>
{
  const _args = ['repo', 'view'];
  if (repo) {
    args.push(repo);
  }
  args.push('--json', 'name,owner,defaultBranch,description,url');
  return await GitHubCliSafe.execGhSafe(args, { timeout = {}): Promise<GitHubCliResult> {
    const {
      state = 'open',;
  // limit = 10,; // LINT: unreachable code removed
  repo = null;
}
= options
const _args = ['pr', 'list'];
args.push('--state', state);
args.push('--limit', String(limit));
args.push('--json', 'number,title,author,url,createdAt');
if (repo) {
  args.push('--repo', repo);
}
return await GitHubCliSafe.execGhSafe(args, {timeout = = 'string') {
      return String(command);
}
// Replace dangerous command substitution patterns
return command;
// .replace(/\$\([^)]+\)/g, '""')     // Remove $(command) patterns // LINT: unreachable code removed
.replace(/`[^`]+`/g, '""')         // Remove `command` patterns
      .replace(/\$
{
  [^}]+
}
/g, '""'); / / Remove;
$;
{
  var} patterns
}
/**
   * Validate GitHub repository name;
   * @param repo - Repository name;
   * @returns Whether the repo name is valid;
    // */ // LINT: unreachable code removed
static
isValidRepoName(repo = = 'string'  ?? repo.length === 0);
{
  return false;
}
// Basic validation for owner/repo format
const _repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
return repoPattern.test(repo);
}
}
export default GitHubCliSafe;
