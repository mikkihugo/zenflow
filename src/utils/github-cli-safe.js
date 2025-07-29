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

export class GitHubCliSafe {
  static TEMP_FILE_PREFIX = 'claude-flow-gh-safe-';
  static DEFAULT_TIMEOUT = 120000; // 2 minutes

  /**
   * Create a temporary file for safe command execution
   * @param {string} content - Content to write to temp file
   * @returns {Promise<string>} Path to the temporary file
   */
  static async createTempFile(content) {
    const tempDir = tmpdir();
    const randomSuffix = randomBytes(8).toString('hex');
    const tempFilePath = join(tempDir, `${GitHubCliSafe.TEMP_FILE_PREFIX}${randomSuffix}.tmp`);
    
    await fs.writeFile(tempFilePath, content, 'utf8');
    return tempFilePath;
  }

  /**
   * Clean up temporary file
   * @param {string} filePath - Path to the temporary file
   */
  static async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors during cleanup
      console.log(`⚠️ Failed to cleanup temp file: ${filePath}`);
    }
  }

  /**
   * Escape special characters for GitHub CLI
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  static escapeSpecialChars(text) {
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
   * @param {string[]} args - GitHub CLI arguments
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Command result
   */
  static async execGhSafe(args, options = {}) {
    const {
      timeout = GitHubCliSafe.DEFAULT_TIMEOUT,
      cwd = process.cwd(),
      input = null
    } = options;

    let tempFilePath = null;

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
      return {
        success: false,
        stdout: '',
        stderr: error.message,
        code: -1,
        timedOut: error.message.includes('Timeout')
      };
    } finally {
      if (tempFilePath) {
        await GitHubCliSafe.cleanupTempFile(tempFilePath);
      }
    }
  }

  /**
   * Create a pull request safely
   * @param {Object} params - PR parameters
   * @returns {Promise<Object>} Result of PR creation
   */
  static async createPullRequestSafe(params) {
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
   * @param {string} repo - Repository name (optional)
   * @returns {Promise<Object>} Repository information
   */
  static async getRepoInfoSafe(repo = null) {
    const args = ['repo', 'view'];
    if (repo) {
      args.push(repo);
    }
    args.push('--json', 'name,owner,defaultBranch,description,url');

    return await GitHubCliSafe.execGhSafe(args, { timeout: 30000 });
  }

  /**
   * List pull requests safely
   * @param {Object} options - List options
   * @returns {Promise<Object>} List of pull requests
   */
  static async listPullRequestsSafe(options = {}) {
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
   * @returns {Promise<Object>} Auth status
   */
  static async checkAuthStatus() {
    return await GitHubCliSafe.execGhSafe(['auth', 'status'], { timeout: 10000 });
  }

  /**
   * Safe command substitution handler
   * Replaces dangerous command substitution with safe alternatives
   * @param {string} command - Command string to process
   * @returns {string} Safe command string
   */
  static sanitizeCommandSubstitution(command) {
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
   * @param {string} repo - Repository name
   * @returns {boolean} Whether the repo name is valid
   */
  static isValidRepoName(repo) {
    if (typeof repo !== 'string' || repo.length === 0) {
      return false;
    }

    // Basic validation for owner/repo format
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    return repoPattern.test(repo);
  }
}

export default GitHubCliSafe;