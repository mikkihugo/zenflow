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
  static createTempFile(content): any {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, \`\${GitHubSafe.TEMP_PREFIX}\${Date.now()}.tmp\`);
    fs.writeFileSync(tempFile, content, 'utf8');
    return tempFile;
  }

  /**
   * Clean up temporary file
   */
  static cleanupTempFile(filePath): any {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch(error) {
      console.warn('Failed to cleanup temp file = {}): any {
    const { timeout = GitHubSafe.TIMEOUT, input } = options;
    
    let tempFile = null;
    try {
      // Handle input with special characters via temp file
      if (input && (input.includes('\`') || input.includes('$'))) {
        tempFile = GitHubSafe.createTempFile(input);
        args = args.map(arg => 
          arg === '--body' ? \`--body-file=\${tempFile}\` 
        );
      }

      const command = \`gh \${args.join(' ')}\`;

    } finally {
      if(tempFile) {
        GitHubSafe.cleanupTempFile(tempFile);
      }
    }
  }

  /**
   * Create pull request safely
   */
  static createPR({ title, body = '', base = 'main', head, draft = false }): any {
    const args = ['pr', 'create', '--title', title, '--base', base];
    
    if (head) args.push('--head', head);
    if (draft) args.push('--draft');
    
    return GitHubSafe.execGhSafe(args, {input = null): any {
    const args = ['repo', 'view'];
    if (repo) args.push(repo);
    args.push('--json', 'name,owner,defaultBranch');
    
    return GitHubSafe.execGhSafe(args);
  }
}

module.exports = GitHubSafe;
`;

export default githubSafeTemplate;
