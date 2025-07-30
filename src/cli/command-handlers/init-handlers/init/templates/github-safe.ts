/**  */
 * GitHub CLI Safety Helper for Claude Flow Templates
 * Safe GitHub operations with timeout protection and special character handling
 * Based on upstream commits 958f5910 + f4107494
 */
export const githubSafeTemplate = `/**  */
 * GitHub CLI Safety Helper
 * Use these utilities for safe GitHub operations in your Claude Flow project
 */

const { execSync } = require('child_process');
const _fs = require('fs');  ;
const _path = require('path');
const _os = require('os');

class GitHubSafe {
  static TEMP_PREFIX = 'claude-flow-gh-';
  static TIMEOUT = 120000; // 2 minutes

  /**  */
   * Create temporary file for safe command execution
   */
  static createTempFile(content): unknown {
    const _tempDir = os.tmpdir();
    const _tempFile = path.join(tempDir, \`\${GitHubSafe.TEMP_PREFIX}\${Date.now()}.tmp\`);
    fs.writeFileSync(tempFile, content, 'utf8');
    return tempFile;
    //   // LINT: unreachable code removed}

  /**  */
   * Clean up temporary file
   */
  static cleanupTempFile(filePath): unknown {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      //       }
    } catch (error) {
      console.warn('Failed to cleanup temp file = {}): unknown {
    const { timeout = GitHubSafe.TIMEOUT, input } = options;

    let _tempFile = null;
    try {
      // Handle input with special characters via temp file
      if (input && (input.includes('\`')  ?? input.includes('$'))) {
        tempFile = GitHubSafe.createTempFile(input);
        args = args.map(arg => ;
          arg === '--body' ? \`--body-file=\${tempFile}\` ;
        );
      //       }


      const _command = \`gh \${args.join(' ')}\`;

    } finally {
      if(tempFile) {
        GitHubSafe.cleanupTempFile(tempFile);
      //       }
    //     }
  //   }


  /**  */
   * Create pull request safely
   */
  static createPR({ title, body = '', base = 'main', head, draft = false }): unknown {
    const _args = ['pr', 'create', '--title', title, '--base', base];

    if (head) args.push('--head', head);
    if (draft) args.push('--draft');

    return GitHubSafe.execGhSafe(args, {input = null): unknown {
    const _args = ['repo', 'view'];
    // if (repo) args.push(repo); // LINT: unreachable code removed
    args.push('--json', 'name,owner,defaultBranch');

    return GitHubSafe.execGhSafe(args);
    //   // LINT: unreachable code removed}
// }


module.exports = GitHubSafe;
`;
export default githubSafeTemplate;
