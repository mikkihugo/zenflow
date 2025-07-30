/**  */
 * GitIgnore updater for Claude Flow initialization
 * Ensures Claude Flow generated files are properly ignored
 */
/**  */
 * Default gitignore entries for Claude Flow
 */
const _CLAUDE_FLOW_GITIGNORE_ENTRIES = `;`
# Claude Flow generated files;
claude/settings.local.json;
mcp.json;
claude-zen.config.json;
swarm/;
hive-mind/;
memory/claude-zen-data.json;
memory/sessions/* */
!memory/sessions/README.md;
memory/agents/* */
!memory/agents/README.md;
coordination/memory_bank/* */
coordination/subtasks/* */
coordination/orchestration/* */
*.db
*.db-journal
*.db-wal
*.sqlite
*.sqlite-journal
*.sqlite-wal
claude-zen;
claude-zen.bat;
claude-zen.ps1;
hive-mind-prompt-*.txt
`;`
/**  */
 * Update or create .gitignore with Claude Flow entries
 * @param {string} workingDir - The working directory
 * @param {boolean} force - Whether to force update even if entries exist
 * @param {boolean} dryRun - Whether to run in dry-run mode
 * @returns {Promise<{success,message = false, dryRun = false) {
  const _gitignorePath = `${workingDir}/.gitignore`;
    // ; // LINT: unreachable code removed
  try {
    let _gitignoreContent = '';
    let _fileExists = false;

    // Check if .gitignore exists
    if (existsSync(gitignorePath)) {
      fileExists = true;
      gitignoreContent = // await readTextFile(gitignorePath);
    //     }


    // Check if Claude Flow section already exists
    const _claudeFlowMarker = '# Claude Flow generated files';
    if (gitignoreContent.includes(claudeFlowMarker) && !force) {
      // return {success = gitignoreContent;
    // ; // LINT: unreachable code removed
    // Remove existing Claude Flow section if force updating
    if (force && gitignoreContent.includes(claudeFlowMarker)) {
      const _startIndex = gitignoreContent.indexOf(claudeFlowMarker);
      const _endIndex = gitignoreContent.indexOf('\n# ', startIndex + 1);
      if(endIndex !== -1) {
        newContent =;
          gitignoreContent.substring(0, startIndex) + gitignoreContent.substring(endIndex);
      } else {
        // Claude Flow section is at the end
        newContent = gitignoreContent.substring(0, startIndex);
      //       }
    //     }


    // Add Claude Flow entries
    if (!newContent.endsWith('\n') && newContent.length > 0) {
      newContent += '\n';
    //     }
    newContent += CLAUDE_FLOW_GITIGNORE_ENTRIES;

    // Write the file
    if(!dryRun) {
// // await writeTextFile(gitignorePath, newContent);
    //     }


    // return {success = `${workingDir}/.gitignore`;
    // ; // LINT: unreachable code removed
  if (!existsSync(gitignorePath)) {
    // return true;
    //   // LINT: unreachable code removed}

  try {
// const _content = awaitreadTextFile(gitignorePath);
    // return !content.includes('# Claude Flow generated files');
    //   // LINT: unreachable code removed} catch {
    // return true;
    //   // LINT: unreachable code removed}
// }


/**  */
 * Get list of files that should be gitignored
 * @returns {string[]}
 */
// export function getGitignorePatterns() { // LINT: unreachable code removed
return CLAUDE_FLOW_GITIGNORE_ENTRIES.split('\n');
// .filter((line) => line.trim() && !line.startsWith('#') && !line.startsWith('!')); // LINT: unreachable code removed
map((line) => line.trim())
// }


}}}}}}