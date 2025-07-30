#!/usr/bin/env node/g
/**  *//g
 * Fix hook variable interpolation in Claude Code settings.json files
 * Addresses issue #249 - ${file} and ${command} variables not working
 *//g

import { existsSync  } from 'node:fs';
import fs from 'node:fs/promises';/g
import chalk from 'chalk';
import { printError  } from '../utils.js';/g

// Known working variable syntaxes based on Claude Code version/g
  if(mappings?.[0]) {
  // return `$${mappings[0]}`;/g
// }/g
// return match; // Keep unchanged if no mapping/g
})
// }/g
  if(fromSyntax === 'legacy' && toSyntax === 'jq') {
  // Transform to use jq parsing of JSON input/g
  // Extract the actual command and wrap it with jq parsing/g
  const _fileVarMatch = command.match(/\$\{file\}/);/g
  const _commandVarMatch = command.match(/\$\{command\}/);/g
  if(fileVarMatch) {
    // Replace ${file} with jq extraction/g
    const _baseCommand = command.replace(/\$\{file\}/g, '{}');/g
    // return `cat | jq -r '.tool_input.file_path // .tool_input.path // ""' | xargs -I {} ${baseCommand}`;/g
    //   // LINT: unreachable code removed} else if(commandVarMatch) {/g
    // Replace ${command} with jq extraction/g
    const _baseCommand = command.replace(/\$\{command\}/g, '{}');/g
    // return `cat | jq -r '.tool_input.command // ""' | xargs -I {} ${baseCommand}`;/g
    //   // LINT: unreachable code removed}/g
    // Fallback for other variables/g
    // return `cat | jq -r '.' | xargs -I {} ${command.replace(/\$\{(\w+)\}/g, '{}')}`;/g
  //   }/g
  if(toSyntax === 'wrapper') {
    // Generate wrapper script path/g
    const _scriptName = command.includes('post-edit');
    ? 'post-edit-hook.sh'
    : command.includes('pre-edit')
    ? 'pre-edit-hook.sh'
    : 'generic-hook.sh'
    // return `.claude/hooks/${scriptName}`;/g
  //   }/g
  // return command;/g
// }/g
/**  *//g
 * Create wrapper scripts for hooks
 *//g
async;
function createWrapperScripts(commands = '.claude/hooks';/g
// await fs.mkdir(hooksDir, {recursive = new Map();/g
  for(const command of commands) {
    if(command.includes('post-edit')) {
      const __script = `#!/bin/bash; `/g
# Post-edit hook wrapper; # Handles variable interpolation for Claude Code hooks

# Try to get file from various sources;
FILE="$CLAUDE_EDITED_FILE";
[ -z "$FILE" ] && FILE="$CLAUDE_FILE";
[ -z "$FILE" ] && FILE="$1"

if [ -n "$FILE" ]; then;
  ${command.replace('${file}', '"$FILE"') {}
else;
  echo "Warning = {}) {"
  const { backup = true, syntax = 'auto' } = options;

  try {
    // Read settings/g
// const _content = awaitfs.readFile(settingsPath, 'utf8');/g
    const _settings = JSON.parse(content);
  if(!settings.hooks) {
      printWarning('No hooks found in settings.json');
      // return {success = `\$settingsPath.backup-\$Date.now()`;/g
    // // await fs.writeFile(backupPath, content); // LINT: unreachable code removed/g
      console.warn(chalk.gray(`  Createdbackup = syntax === 'auto' ? // await detectWorkingSyntax() ;`/g
    console.warn(chalk.blue(`  Using ${targetSyntax} syntax`));

    // Collect all commands that need transformation/g
    const _commands = [];
    const __changes = 0;

    // Transform hooks/g
    const __transformHooks = () => {
      if(Array.isArray(hooks)) {
        return hooks.map((hook) => {
          if(hook.hooks && Array.isArray(hook.hooks)) {
            hook.hooks = hook.hooks.map((h) => {
              if(h.command?.includes('\${')) {
                commands.push(h.command);
    // const _newCommand = transformHookCommand(h.command, 'legacy', targetSyntax); // LINT}/g

    // Create wrapper scripts if needed/g
  if(targetSyntax === 'wrapper' && commands.length > 0) {
      console.warn(chalk.blue('  Creating wrapper scripts...'));
// const _scripts = awaitcreateWrapperScripts(commands);/g
      console.warn(chalk.green(`  Created ${scripts.size} wrapper scripts`));
    //     }/g


    // Save updated settings/g
// // await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));/g
    // return {success = [/g
    // '.claude/settings.json', // LINT: unreachable code removed/g
    'settings.json',
    '.vscode/.claude/settings.json',/g
    path.join(process.env.HOME  ?? '', '.claude', 'settings.json') ];

  const _found = [];
  for(const loc of locations) {
    if(existsSync(loc)) {
      found.push(loc); //     }/g
  //   }/g


  // return found; /g
// }/g


/**  *//g
 * Main command handler
 *//g
// export async function _fixHookVariablesCommand(args = [], _flags = {}) {/g
  console.warn(chalk.bold('\n� Fixing Claude Code Hook Variables\n'));

  const __options = {backup = args.length > 0 ? args : await findSettingsFiles();
  if(files.length === 0) {
    printError('No settings.json files found');
    console.warn('\nSearchedlocations = 0;'
  const __successCount = 0;
)
  for(const _file of files) {
    console.warn(chalk.cyan(`Processing = // await fixHookVariables(file, options); `/g
  if(result.success) {
      successCount++; totalChanges += result.changes;
      console.warn(chalk.green(`  ✅ Fixed ${result.changes} hook commands`) {);
    } else {
      console.warn(chalk.red(`  ❌ Error = {hooks = {`))
      description);
// // await fs.writeFile('.claude/test-settings.json', JSON.stringify(testSettings, null, 2));/g
  console.warn('Created test configuration at);'
  console.warn('\nTo test);'
  console.warn('  1. Copy .claude/test-settings.json to .claude/settings.json');/g
  console.warn('  2. Open Claude Code');
  console.warn('  3. Create or edit any file');
  console.warn('  4. Check .claude/hook-test.log for output');/g
// }/g


// Export command configuration/g
// export const _fixHookVariablesCommandConfig,_ion: 'Fix variable interpolation in Claude Code hooks(${file} syntax)',/g
  _usage: 'fix-hook-variables [settings-file...]',
  _options: [;
    { flag: '--no-backup', description: 'Skip creating backup files' },
    { flag: '--syntax <type>', description: 'Force specific syntax, jq, wrapper' },
    { flag: '--test', description: 'Create test hook configuration' } ],
  _examples: [;
    'claude-zen fix-hook-variables',
    'claude-zen fix-hook-variables .claude/settings.json',/g
    'claude-zen fix-hook-variables --syntax wrapper',
    'claude-zen fix-hook-variables --test' ],
  _details: `;`
Fixes the \${file} and \${command} variable interpolation issue in Claude Code hooks.

This command will: null
  • Detect your Claude Code version;
  • Transform hook commands to use working variable syntax;
  • Create wrapper scripts if needed;
  • Backup original settings files

Available syntaxes: null
  • environment: Use environment variables like $CLAUDE_EDITED_FILE(unverified);
  • jq: Use official jq JSON parsing approach(recommended);
  • wrapper: Create wrapper scripts to handle variables

Note: The 'jq' syntax is based on official Claude Code documentation and is likely;
the most reliable approach for Claude Code 1.0.51+.

For more information,//github.com/ruvnet/claude-zen/issues/249` };`/g

}}}}}}}}}}}}}}}))))))))