/**
 * GitHub CLI Safety Utilities
 * Safe GitHub operations with timeout protection and special character handling
 * Based on upstream commits 958f5910 + f4107494
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import TimeoutProtection from './timeout-protection.js';

/**
 * GitHub CLI execution options interface
 */
export interface GitHubCliOptions {
  timeout?: number;
  cwd?: string;
  input?: string | null;
}

/**
 * GitHub CLI command result interface
 */
export interface GitHubCliResult {
  success: boolean;
  stdout: string;
  stderr: string;
  code: number;
  timedOut?: boolean;
}

/**
 * GitHub Pull Request parameters interface
 */
export interface PullRequestParams {
  title: string;
  body?: string;
  base?: string;
  head?: string;
  draft?: boolean;
  repo?: string | null;
}

/**
 * GitHub Pull Request list options interface
 */
export interface PullRequestListOptions {
  state?: 'open' | 'closed' | 'merged' | 'all';
  limit?: number;
  repo?: string | null;
}

/**
 * GitHub CLI Safety class for secure GitHub operations
 */
export class GitHubCliSafe {
  static readonly TEMP_FILE_PREFIX = 'claude-flow-gh-safe-';
  static readonly DEFAULT_TIMEOUT = 120000; // 2 minutes

  /**
   * Create a temporary file for safe command execution
   * @param content - Content to write to temp file
   * @returns Path to the temporary file
   */
  static async createTempFile(content: string): Promise<string> {
    const tempDir = tmpdir();
    const randomSuffix = randomBytes(8).toString('hex');
    const tempFilePath = join(tempDir, `${GitHubCliSafe.TEMP_FILE_PREFIX}${randomSuffix}.tmp`);
    
    await fs.writeFile(tempFilePath, content, 'utf8');
    return tempFilePath;
  }

  /**
   * Clean up temporary file
   * @param filePath - Path to the temporary file
   */
  static async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors during cleanup
      console.log(`⚠️ Failed to cleanup temp file: ${filePath}`);
    }
  }

  /**
   * Escape special characters for GitHub CLI
   * @param text - Text to escape
   * @returns Escaped text
   */
  static escapeSpecialChars(text: unknown): string {
    if (typeof text !== 'string') {
      return String(text);
    }

    return text
      .replace(/`/g, '\\`')           // Escape backticks
      .replace(/\$/g, '\\$')          // Escape dollar signs
      .replace(/"/g, '\\"')           // Escape double quotes
      .replace(/\n/g, '\\n')          // Escape newlines
      .replace(/\r/g, '\\r')          // Escape carriage returns
      .replace(/\t/g, '\\t');         // Escape tabs
  }

  /**
   * Execute GitHub CLI command safely with timeout protection
   * @param args - GitHub CLI arguments
   * @param options - Execution options
   * @returns Command result
   */
  static async execGhSafe(args: string[], options: GitHubCliOptions = {}): Promise<GitHubCliResult> {
    const {
      timeout = GitHubCliSafe.DEFAULT_TIMEOUT,
      cwd = process.cwd(),
      input = null
    } = options;

    let tempFilePath: string | null = null;

    try {
      // If there's input with special characters, use temp file approach
      let finalArgs = [...args];
      if (input && (input.includes('`') || input.includes('$') || input.includes('"'))) {
        tempFilePath = await GitHubCliSafe.createTempFile(input);
        finalArgs = finalArgs.map(arg => 
          arg === '--body' ? `--body-file=${tempFilePath}` : arg
        );
      }

      // Import runCommand dynamically to avoid circular dependencies
      const { runCommand } = await import('../cli/utils.js');
      
      const commandPromise = runCommand('gh', finalArgs, {
        cwd,
        stdout: 'piped',
        stderr: 'piped',
        ...(input && !tempFilePath ? { stdin: 'piped' } : {})
      });

      const result = await TimeoutProtection.withTimeout(
        commandPromise,
        timeout,
        `GitHub CLI command: gh ${finalArgs.join(' ')}`
      );

      return {
        success: result.success,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        code: result.code || 0
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        stdout: '',
        stderr: errorMessage,
        code: -1,
        timedOut: errorMessage.includes('Timeout')
      };
    } finally {
      if (tempFilePath) {
        await GitHubCliSafe.cleanupTempFile(tempFilePath);
      }
    }
  }

  /**
   * Create a pull request safely
   * @param params - PR parameters
   * @returns Result of PR creation
   */
  static async createPullRequestSafe(params: PullRequestParams): Promise<GitHubCliResult> {
    const {
      title,
      body = '',
      base = 'main',
      head,
      draft = false,
      repo = null
    } = params;

    const args = ['pr', 'create'];
    
    // Add title (always safe to add directly)
    args.push('--title', title);
    
    // Add base and head
    args.push('--base', base);
    if (head) {
      args.push('--head', head);
    }
    
    // Add draft flag if needed
    if (draft) {
      args.push('--draft');
    }
    
    // Add repo if specified
    if (repo) {
      args.push('--repo', repo);
    }

    // Handle body with special characters
    if (body) {
      if (body.includes('`') || body.includes('$') || body.length > 1000) {
        // Use temp file for complex bodies
        const tempFilePath = await GitHubCliSafe.createTempFile(body);
        args.push('--body-file', tempFilePath);
        
        const result = await GitHubCliSafe.execGhSafe(args);
        await GitHubCliSafe.cleanupTempFile(tempFilePath);
        return result;
      } else {
        // Safe to use directly
        args.push('--body', body);
      }
    }

    return await GitHubCliSafe.execGhSafe(args);
  }

  /**
   * Get repository information safely
   * @param repo - Repository name (optional)
   * @returns Repository information
   */
  static async getRepoInfoSafe(repo: string | null = null): Promise<GitHubCliResult> {
    const args = ['repo', 'view'];
    if (repo) {
      args.push(repo);
    }
    args.push('--json', 'name,owner,defaultBranch,description,url');

    return await GitHubCliSafe.execGhSafe(args, { timeout: 30000 });
  }

  /**
   * List pull requests safely
   * @param options - List options
   * @returns List of pull requests
   */
  static async listPullRequestsSafe(options: PullRequestListOptions = {}): Promise<GitHubCliResult> {
    const {
      state = 'open',
      limit = 10,
      repo = null
    } = options;

    const args = ['pr', 'list'];
    args.push('--state', state);
    args.push('--limit', String(limit));
    args.push('--json', 'number,title,author,url,createdAt');
    
    if (repo) {
      args.push('--repo', repo);
    }

    return await GitHubCliSafe.execGhSafe(args, { timeout: 60000 });
  }

  /**
   * Check GitHub CLI authentication status
   * @returns Auth status
   */
  static async checkAuthStatus(): Promise<GitHubCliResult> {
    return await GitHubCliSafe.execGhSafe(['auth', 'status'], { timeout: 10000 });
  }

  /**
   * Safe command substitution handler
   * Replaces dangerous command substitution with safe alternatives
   * @param command - Command string to process
   * @returns Safe command string
   */
  static sanitizeCommandSubstitution(command: unknown): string {
    if (typeof command !== 'string') {
      return String(command);
    }

    // Replace dangerous command substitution patterns
    return command
      .replace(/\$\([^)]+\)/g, '""')     // Remove $(command) patterns
      .replace(/`[^`]+`/g, '""')         // Remove `command` patterns
      .replace(/\${[^}]+}/g, '""');      // Remove ${var} patterns
  }

  /**
   * Validate GitHub repository name
   * @param repo - Repository name
   * @returns Whether the repo name is valid
   */
  static isValidRepoName(repo: unknown): repo is string {
    if (typeof repo !== 'string' || repo.length === 0) {
      return false;
    }

    // Basic validation for owner/repo format
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    return repoPattern.test(repo);
  }
}

export default GitHubCliSafe;