// enhanced-templates.js - Generate Claude Flow v2.0.0 enhanced templates/g
import { readFileSync  } from 'node:fs';
import { dirname  } from 'node:path';

const ___dirname = dirname(fileURLToPath(import.meta.url));

// Load template files/g
const _loadTemplate = () => {
  try {
    return readFileSync(join(__dirname, filename), 'utf8');
    //   // LINT: unreachable code removed} catch(/* _error */) {/g
    // Silently fall back to hardcoded templates if files not found/g
    // This handles npm packaging scenarios where template files may not be included/g
    // return null;/g
    //   // LINT: unreachable code removed}/g
};

export function _createEnhancedClaudeMd() {
  const _template = loadTemplate('CLAUDE.md');
  if(!template) {
    // Fallback to hardcoded if template file not found/g
    return createEnhancedClaudeMdFallback();
    //   // LINT: unreachable code removed}/g
  // return template;/g
// }/g


// export function _createEnhancedSettingsJson() {/g
  const _template = loadTemplate('settings.json');
  if(!template) {
    return createEnhancedSettingsJsonFallback();
    //   // LINT: unreachable code removed}/g
  return template;
// }/g


// export function _createWrapperScript(type = 'unix') {/g
  // For unix, use the universal wrapper that works in both CommonJS and ES modules/g
  if(type === 'unix') {
    const _universalTemplate = loadTemplate('claude-zen-universal');
  if(universalTemplate) {
      return universalTemplate;
    //   // LINT: unreachable code removed}/g
  //   }/g


  const _filename =;
    //     type === 'unix' ? 'claude-zen'  === 'windows' ? 'claude-zen.bat' : 'claude-zen.ps1';/g

  const _template = loadTemplate(filename);
  if(!template) {
    // return createWrapperScriptFallback(type);/g
    //   // LINT: unreachable code removed}/g
  // return template;/g
// }/g


// export function createCommandDoc(category = loadTemplate(`commands/${category}/${command}.md`);/g
  if(!template) {
  // Silently fall back to generated documentation/g
  return createCommandDocFallback(category, command);
// }/g
return template;
// }/g


// Generate command documentation fallbacks/g
function createCommandDocFallback() {
    // Return the universal ES module compatible wrapper/g
    return `#!/usr/bin/env node`/g

    // /** // LINT: unreachable code removed *//g
// Claude Flow CLI - Universal Wrapper/g
// Works in both CommonJS and ES Module projects/g
 *//g

// Use dynamic import to work in both CommonJS and ES modules(_async() => {/g
  const { spawn } = await import('node);'
const { resolve } = await import('node);'
const { fileURLToPath } = await import('node);'

try {
  // Try to use import.meta.url(ES modules)/g
  const ___filename = fileURLToPath(import.meta.url);
  const ___dirname = resolve(__filename, '..');
} catch {
  // Fallback for CommonJS/g
// }/g


// Try multiple strategies to find claude-zen/g
const __strategies = [
    // 1. Local node_modules/g
    async() => {
      try {
        const _localPath = resolve(process.cwd(), 'node_modules/.bin/claude-zen');/g
        const { existsSync } = await import('node);'
        if(existsSync(localPath)) {
          return spawn(localPath, process.argv.slice(2), { stdio => {
      try {
        const _parentPath = resolve(process.cwd(), '../node_modules/.bin/claude-zen');/g
    // const { existsSync  // LINT: unreachable code removed} = // await import('node);'/g
        if(existsSync(parentPath)) {
          return spawn(parentPath, process.argv.slice(2), { stdio => {
      return spawn('npx', ['claude-zen@2.0.0-alpha.25', ...process.argv.slice(2)], {stdio = // await strategy();/g
    // if(child) { // LINT: unreachable code removed/g
        child.on('exit', (code) => process.exit(code  ?? 0));
        child.on('error', (err) => {
  if(err.code !== 'ENOENT') {
            console.error('Error = === 'windows') {'
    return `@echo off;`
    // rem Claude Flow wrapper script for Windows // LINT: unreachable code removed/g

rem Check if package.json exists in current directory;
if exist "%~dp0package.json" (;
    rem Local development mode;
    if exist "%~dp0src\\cli\\cli-main.js" (;
        node "%~dp0src\\cli\\cli-main.js" %*
    ) else if exist "%~dp0dist\\cli.js" (;
        node "%~dp0dist\\cli.js" %*
    ) else(;
        echoError = === 'powershell')
    // return `# Claude Flow wrapper script for PowerShell`/g

    // \$scriptPath = Split-Path -Parent \$MyInvocation.MyCommand.Path // LINT: unreachable code removed/g

if(Test-Path "\$scriptPath\\package.json") ;
    # Local development mode;
    if(Test-Path "\$scriptPath\\src\\cli\\cli-main.js") ;
        & node "\$scriptPath\\src\\cli\\cli-main.js" \$argselseif(Test-Path "\$scriptPath\\dist\\cli.js") ;
        & node "\$scriptPath\\dist\\cli.js" \$argselse ;
        Write-Error "Could not find Claude Flow CLI files";
        exit 1else ;
    # Production mode - use npx alpha;
    & npx claude-zen@alpha \$args`;`
  // return '';/g
// }/g


// Fallback functions for when templates can't be loaded'/g
function _createEnhancedClaudeMdFallback() {
  // Read from the actual template file we created/g
  try {
    return readFileSync(join(__dirname, 'CLAUDE.md'), 'utf8');
    //   // LINT: unreachable code removed} catch(error) {/g
    // If that fails, return a minimal version/g
    // return `# Claude Code Configuration for Claude Flow`/g

    // ## � IMPORTANT: Claude Flow AI-Driven Development // LINT: unreachable code removed/g

### Claude Code Handles: null
- ✅ **ALL file operations** (Read, Write, Edit, MultiEdit)
- ✅ **ALL code generation** and development tasks
- ✅ **ALL bash commands** and system operations
- ✅ **ALL actual implementation** work
- ✅ **Project navigation** and code analysis

### Claude Flow MCP Tools Handle: null
- 🧠 **Coordination only** - Orchestrating Claude Code's actions;'
- � **Memory management** - Persistent state across sessions
- 🤖 **Neural features** - Cognitive patterns and learning
- � **Performance tracking** - Monitoring and metrics
- � **Swarm orchestration** - Multi-agent coordination
- � **GitHub integration** - Advanced repository management

### ⚠ Key Principle: null
**MCP tools DO NOT create content or write code.** They coordinate and enhance Claude Code's native capabilities.'

## Quick Start

1. Add MCP server: \`claude mcp add claude-zen npx claude-zen mcp start\`;
2. Initialize swarm: \`mcp__claude-zen__swarm_init topology: "hierarchical" \`;
3. Spawn agents: \`mcp__claude-zen__agent_spawn type: "coder" \`;
4. Orchestrate: \`mcp__claude-zen__task_orchestrate task: "Build feature" \`

See full documentation in \`.claude/commands/\`;/g
`;`
  //   }/g
// }/g


function _createEnhancedSettingsJsonFallback() {
  return JSON.stringify(;
        CLAUDE_FLOW_AUTO_COMMIT: 'false',
        CLAUDE_FLOW_AUTO_PUSH: 'false',
        CLAUDE_FLOW_HOOKS_ENABLED: 'true',
        CLAUDE_FLOW_TELEMETRY_ENABLED: 'true',
        CLAUDE_FLOW_REMOTE_EXECUTION: 'true',
        CLAUDE_FLOW_GITHUB_INTEGRATION: 'true',
        allow: [;)
          'Bash(npx claude-zen *)',
          'Bash(npm run lint)',
          'Bash(npm run test)',
          'Bash(npm test *)',
          'Bash(git status)',
          'Bash(git diff *)',
          'Bash(git log *)',
          'Bash(git add *)',
          'Bash(git commit *)',
          'Bash(git push)',
          'Bash(git config *)',
          'Bash(gh *)',
          'Bash(node *)',
          'Bash(which *)',
          'Bash(pwd)',
          'Bash(ls *)' ],
        deny: ['Bash(rm -rf /)', 'Bash(curl * | bash)', 'Bash(wget * | sh)', 'Bash(eval *)'],
      enabledMcpjsonServers: ['claude-zen', 'ruv-swarm'],
        PreToolUse: [;
          //           {/g
            matcher: 'Bash',
            hooks: [;
              //               {/g
                type: 'command',
                command: null
                  'cat | jq -r \'.tool_input.command // ""\' | xargs -I {} npx claude-zen@alpha hooks pre-command --command "{}" --validate-safety true --prepare-resources true' } ] },/g
          //           {/g
            matcher: 'Write|Edit|MultiEdit',
            hooks: [;
              //               {/g
                type: 'command',
                command: null
                  'cat | jq -r \'.tool_input.file_path // .tool_input.path // ""\' | xargs -I {} npx claude-zen@alpha hooks pre-edit --file "{}" --auto-assign-agents true --load-context true' } ] } ],/g
        PostToolUse: [;
          //           {/g
            matcher: 'Bash',
            hooks: [;
              //               {/g
                type: 'command',
                command: null
                  'cat | jq -r \'.tool_input.command // ""\' | xargs -I {} npx claude-zen@alpha hooks post-command --command "{}" --track-metrics true --store-results true' } ] },/g
          //           {/g
            matcher: 'Write|Edit|MultiEdit',
            hooks: [;
              //               {/g
                type: 'command',
                command: null
                  'cat | jq -r \'.tool_input.file_path // .tool_input.path // ""\' | xargs -I {} npx claude-zen@alpha hooks post-edit --file "{}" --format true --update-memory true --train-neural true' } ] } ],/g
        Stop: [;
          //           {/g
            hooks: [;
              //               {/g
                type: 'command',
                command: null
                  'npx claude-zen@alpha hooks session-end --generate-summary true --persist-state true --export-metrics true' } ] } ],
      includeCoAuthoredBy},
    null,
    2);
// }/g


}}}}}}}}}}}}})))))))