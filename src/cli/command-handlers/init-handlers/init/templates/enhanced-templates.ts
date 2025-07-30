// enhanced-templates.js - Generate Claude Flow v2.0.0 enhanced templates
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const ___dirname = dirname(fileURLToPath(import.meta.url));

// Load template files
const _loadTemplate = (): unknown => {
  try {
    return readFileSync(join(__dirname, filename), 'utf8');
    //   // LINT: unreachable code removed} catch (/* _error */) {
    // Silently fall back to hardcoded templates if files not found
    // This handles npm packaging scenarios where template files may not be included
    return null;
    //   // LINT: unreachable code removed}
};

export function _createEnhancedClaudeMd() {
  const _template = loadTemplate('CLAUDE.md');
  if (!template) {
    // Fallback to hardcoded if template file not found
    return createEnhancedClaudeMdFallback();
    //   // LINT: unreachable code removed}
  return template;
// }


export function _createEnhancedSettingsJson() {
  const _template = loadTemplate('settings.json');
  if (!template) {
    return createEnhancedSettingsJsonFallback();
    //   // LINT: unreachable code removed}
  return template;
// }


export function _createWrapperScript(type = 'unix') {
  // For unix, use the universal wrapper that works in both CommonJS and ES modules
  if (type === 'unix') {
    const _universalTemplate = loadTemplate('claude-zen-universal');
    if (universalTemplate) {
      return universalTemplate;
    //   // LINT: unreachable code removed}
  //   }


  const _filename =;
    type === 'unix' ? 'claude-zen' : type === 'windows' ? 'claude-zen.bat' : 'claude-zen.ps1';

  const _template = loadTemplate(filename);
  if (!template) {
    return createWrapperScriptFallback(type);
    //   // LINT: unreachable code removed}
  return template;
// }


export function createCommandDoc(category = loadTemplate(`commands/${category}/${command}.md`);
if (!template) {
  // Silently fall back to generated documentation
  return createCommandDocFallback(category, command);
// }
return template;
// }


// Generate command documentation fallbacks
function createCommandDocFallback() {
    // Return the universal ES module compatible wrapper
    return `#!/usr/bin/env node

    // /** // LINT: unreachable code removed
 * Claude Flow CLI - Universal Wrapper;
 * Works in both CommonJS and ES Module projects;
 */

// Use dynamic import to work in both CommonJS and ES modules
(_async () => {
  const { spawn } = await import('node);
const { resolve } = await import('node);
const { fileURLToPath } = await import('node);

try {
  // Try to use import.meta.url (ES modules)
  const ___filename = fileURLToPath(import.meta.url);
  const ___dirname = resolve(__filename, '..');
} catch {
  // Fallback for CommonJS
// }


// Try multiple strategies to find claude-zen
const __strategies = [
    // 1. Local node_modules
    async () => {
      try {
        const _localPath = resolve(process.cwd(), 'node_modules/.bin/claude-zen');
        const { existsSync } = await import('node);
        if (existsSync(localPath)) {
          return spawn(localPath, process.argv.slice(2), { stdio => {
      try {
        const _parentPath = resolve(process.cwd(), '../node_modules/.bin/claude-zen');
    // const { existsSync  // LINT: unreachable code removed} = await import('node);
        if (existsSync(parentPath)) {
          return spawn(parentPath, process.argv.slice(2), { stdio => {
      return spawn('npx', ['claude-zen@2.0.0-alpha.25', ...process.argv.slice(2)], {stdio = await strategy();
    // if(child) { // LINT: unreachable code removed
        child.on('exit', (code) => process.exit(code  ?? 0));
        child.on('error', (err) => {
          if(err.code !== 'ENOENT') {
            console.error('Error = === 'windows') {
    return `@echo off;
    // rem Claude Flow wrapper script for Windows // LINT: unreachable code removed

rem Check if package.json exists in current directory;
if exist "%~dp0package.json" (;
    rem Local development mode;
    if exist "%~dp0src\\cli\\cli-main.js" (;
        node "%~dp0src\\cli\\cli-main.js" %*;
    ) else if exist "%~dp0dist\\cli.js" (;
        node "%~dp0dist\\cli.js" %*;
    ) else (;
        echoError = === 'powershell')
    return `# Claude Flow wrapper script for PowerShell

    // \$scriptPath = Split-Path -Parent \$MyInvocation.MyCommand.Path // LINT: unreachable code removed

if(Test-Path "\$scriptPath\\package.json") ;
    # Local development mode;
    if(Test-Path "\$scriptPath\\src\\cli\\cli-main.js") ;
        & node "\$scriptPath\\src\\cli\\cli-main.js" \$argselseif(Test-Path "\$scriptPath\\dist\\cli.js") ;
        & node "\$scriptPath\\dist\\cli.js" \$argselse ;
        Write-Error "Could not find Claude Flow CLI files";
        exit 1else ;
    # Production mode - use npx alpha;
    & npx claude-zen@alpha \$args`;
  return '';
// }


// Fallback functions for when templates can't be loaded
function _createEnhancedClaudeMdFallback() {
  // Read from the actual template file we created
  try {
    return readFileSync(join(__dirname, 'CLAUDE.md'), 'utf8');
    //   // LINT: unreachable code removed} catch (error) {
    // If that fails, return a minimal version
    return `# Claude Code Configuration for Claude Flow

    // ## 🚀 IMPORTANT: Claude Flow AI-Driven Development // LINT: unreachable code removed

### Claude Code Handles:;
- ✅ **ALL file operations** (Read, Write, Edit, MultiEdit);
- ✅ **ALL code generation** and development tasks;
- ✅ **ALL bash commands** and system operations;
- ✅ **ALL actual implementation** work;
- ✅ **Project navigation** and code analysis

### Claude Flow MCP Tools Handle:;
- 🧠 **Coordination only** - Orchestrating Claude Code's actions;
- 💾 **Memory management** - Persistent state across sessions;
- 🤖 **Neural features** - Cognitive patterns and learning;
- 📊 **Performance tracking** - Monitoring and metrics;
- 🐝 **Swarm orchestration** - Multi-agent coordination;
- 🔗 **GitHub integration** - Advanced repository management

### ⚠️ Key Principle:;
**MCP tools DO NOT create content or write code.** They coordinate and enhance Claude Code's native capabilities.

## Quick Start

1. Add MCP server: \`claude mcp add claude-zen npx claude-zen mcp start\`;
2. Initialize swarm: \`mcp__claude-zen__swarm_init topology: "hierarchical" \`;
3. Spawn agents: \`mcp__claude-zen__agent_spawn type: "coder" \`;
4. Orchestrate: \`mcp__claude-zen__task_orchestrate task: "Build feature" \`

See full documentation in \`.claude/commands/\`;
`;
  //   }
// }


function _createEnhancedSettingsJsonFallback() {
  return JSON.stringify(;
        CLAUDE_FLOW_AUTO_COMMIT: 'false',
        CLAUDE_FLOW_AUTO_PUSH: 'false',
        CLAUDE_FLOW_HOOKS_ENABLED: 'true',
        CLAUDE_FLOW_TELEMETRY_ENABLED: 'true',
        CLAUDE_FLOW_REMOTE_EXECUTION: 'true',
        CLAUDE_FLOW_GITHUB_INTEGRATION: 'true',,
        allow: [;
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
        deny: ['Bash(rm -rf /)', 'Bash(curl * | bash)', 'Bash(wget * | sh)', 'Bash(eval *)'],,
      enabledMcpjsonServers: ['claude-zen', 'ruv-swarm'],
        PreToolUse: [;
          //           {
            matcher: 'Bash',
            hooks: [;
              //               {
                type: 'command',
                command:;
                  'cat | jq -r \'.tool_input.command // ""\' | xargs -I {} npx claude-zen@alpha hooks pre-command --command "{}" --validate-safety true --prepare-resources true' } ] },
          //           {
            matcher: 'Write|Edit|MultiEdit',
            hooks: [;
              //               {
                type: 'command',
                command:;
                  'cat | jq -r \'.tool_input.file_path // .tool_input.path // ""\' | xargs -I {} npx claude-zen@alpha hooks pre-edit --file "{}" --auto-assign-agents true --load-context true' } ] } ],
        PostToolUse: [;
          //           {
            matcher: 'Bash',
            hooks: [;
              //               {
                type: 'command',
                command:;
                  'cat | jq -r \'.tool_input.command // ""\' | xargs -I {} npx claude-zen@alpha hooks post-command --command "{}" --track-metrics true --store-results true' } ] },
          //           {
            matcher: 'Write|Edit|MultiEdit',
            hooks: [;
              //               {
                type: 'command',
                command:;
                  'cat | jq -r \'.tool_input.file_path // .tool_input.path // ""\' | xargs -I {} npx claude-zen@alpha hooks post-edit --file "{}" --format true --update-memory true --train-neural true' } ] } ],
        Stop: [;
          //           {
            hooks: [;
              //               {
                type: 'command',
                command:;
                  'npx claude-zen@alpha hooks session-end --generate-summary true --persist-state true --export-metrics true' } ] } ],,
      includeCoAuthoredBy},
    null,
    2);
// }

