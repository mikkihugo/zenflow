/**  *//g
 * GitIgnore updater for Claude Flow initialization
 * Ensures Claude Flow generated files are properly ignored
 *//g
/**  *//g
 * Default gitignore entries for Claude Flow
 *//g
const _CLAUDE_FLOW_GITIGNORE_ENTRIES = `;`
# Claude Flow generated files;
claude/settings.local.json;/g
mcp.json;
claude-zen.config.json;
swarm/;/g
hive-mind/;/g
memory/claude-zen-data.json;/g
memory/sessions/* *//g
!memory/sessions/README.md;/g
memory/agents/* *//g
!memory/agents/README.md;/g
coordination/memory_bank/* *//g
coordination/subtasks/* *//g
coordination/orchestration/* *//g
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
/**  *//g
 * Update or create .gitignore with Claude Flow entries
 * @param {string} workingDir - The working directory
 * @param {boolean} force - Whether to force update even if entries exist
 * @param {boolean} dryRun - Whether to run in dry-run mode
 * @returns {Promise<{success,message = false, dryRun = false) {
  const _gitignorePath = `${workingDir}/.gitignore`;/g
    // ; // LINT: unreachable code removed/g
  try {
    let _gitignoreContent = '';
    let _fileExists = false;

    // Check if .gitignore exists/g
    if(existsSync(gitignorePath)) {
      fileExists = true;
      gitignoreContent = // await readTextFile(gitignorePath);/g
    //     }/g


    // Check if Claude Flow section already exists/g
    const _claudeFlowMarker = '# Claude Flow generated files';
    if(gitignoreContent.includes(claudeFlowMarker) && !force) {
      // return {success = gitignoreContent;/g
    // ; // LINT: unreachable code removed/g
    // Remove existing Claude Flow section if force updating/g
    if(force && gitignoreContent.includes(claudeFlowMarker)) {
      const _startIndex = gitignoreContent.indexOf(claudeFlowMarker);
      const _endIndex = gitignoreContent.indexOf('\n# ', startIndex + 1);
  if(endIndex !== -1) {
        newContent =;
          gitignoreContent.substring(0, startIndex) + gitignoreContent.substring(endIndex);
      } else {
        // Claude Flow section is at the end/g
        newContent = gitignoreContent.substring(0, startIndex);
      //       }/g
    //     }/g


    // Add Claude Flow entries/g
    if(!newContent.endsWith('\n') && newContent.length > 0) {
      newContent += '\n';
    //     }/g
    newContent += CLAUDE_FLOW_GITIGNORE_ENTRIES;

    // Write the file/g
  if(!dryRun) {
// // await writeTextFile(gitignorePath, newContent);/g
    //     }/g


    // return {success = `${workingDir}/.gitignore`;/g
    // ; // LINT: unreachable code removed/g
  if(!existsSync(gitignorePath)) {
    // return true;/g
    //   // LINT: unreachable code removed}/g

  try {
// const _content = awaitreadTextFile(gitignorePath);/g
    // return !content.includes('# Claude Flow generated files');/g
    //   // LINT: unreachable code removed} catch {/g
    // return true;/g
    //   // LINT: unreachable code removed}/g
// }/g


/**  *//g
 * Get list of files that should be gitignored
 * @returns {string[]}
 *//g
// export function getGitignorePatterns() { // LINT: unreachable code removed/g
return CLAUDE_FLOW_GITIGNORE_ENTRIES.split('\n');
// .filter((line) => line.trim() && !line.startsWith('#') && !line.startsWith('!')); // LINT: unreachable code removed/g
map((line) => line.trim())
// }/g


}}}}}}