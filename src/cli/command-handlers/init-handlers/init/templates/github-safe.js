/**
 * GitHub CLI Safety Helper for Claude Flow Templates
 * Safe GitHub operations with timeout protection and special character handling
 * Based on upstream commits 958f5910 + f4107494
 */

export const githubSafeTemplate = `/**
 * GitHub CLI Safety Helper
 * Use these utilities for safe GitHub operations in your Claude Flow project
 */

const { execSync } = require('child_process');
const fs = require('fs');  
const path = require('path');
const os = require('os');

class GitHubSafe {
  static TEMP_PREFIX = 'claude-flow-gh-';
  static TIMEOUT = 120000; // 2 minutes

  /**
   * Create temporary file for safe command execution
   */
  static createTempFile(content) {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, \`\${GitHubSafe.TEMP_PREFIX}\${Date.now()}.tmp\`);
    fs.writeFileSync(tempFile, content, 'utf8');
    return tempFile;
  }

  /**
   * Clean up temporary file
   */
  static cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Failed to cleanup temp file:', filePath);
    }
  }

  /**
   * Escape special characters for GitHub CLI
   */
  static escapeSpecialChars(text) {
    return text
      .replace(/\`/g, '\\\\`')           // Escape backticks
      .replace(/\\$/g, '\\\\$')          // Escape dollar signs  
      .replace(/"/g, '\\\\"')            // Escape double quotes
      .replace(/\\n/g, '\\\\n')          // Escape newlines
      .replace(/\\r/g, '\\\\r');         // Escape carriage returns
  }

  /**
   * Execute GitHub CLI command safely
   */
  static execGhSafe(args, options = {}) {
    const { timeout = GitHubSafe.TIMEOUT, input } = options;
    
    let tempFile = null;
    try {
      // Handle input with special characters via temp file
      if (input && (input.includes('\`') || input.includes('$'))) {
        tempFile = GitHubSafe.createTempFile(input);
        args = args.map(arg => 
          arg === '--body' ? \`--body-file=\${tempFile}\` : arg
        );
      }

      const command = \`gh \${args.join(' ')}\`;
      const result = execSync(command, {
        timeout,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return {
        success: true,
        stdout: result,
        stderr: ''
      };

    } catch (error) {
      return {
        success: false,
        stdout: '',
        stderr: error.message,
        timedOut: error.signal === 'SIGTERM'
      };
    } finally {
      if (tempFile) {
        GitHubSafe.cleanupTempFile(tempFile);
      }
    }
  }

  /**
   * Create pull request safely
   */
  static createPR({ title, body = '', base = 'main', head, draft = false }) {
    const args = ['pr', 'create', '--title', title, '--base', base];
    
    if (head) args.push('--head', head);
    if (draft) args.push('--draft');
    
    return GitHubSafe.execGhSafe(args, { input: body });
  }

  /**
   * Get repository info safely
   */
  static getRepoInfo(repo = null) {
    const args = ['repo', 'view'];
    if (repo) args.push(repo);
    args.push('--json', 'name,owner,defaultBranch');
    
    return GitHubSafe.execGhSafe(args);
  }
}

module.exports = GitHubSafe;
`;

export default githubSafeTemplate;