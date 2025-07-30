#!/usr/bin/env node

/**
 * Fix hook variable interpolation in Claude Code settings.json files
 * Addresses issue #249 - ${file} and ${command} variables not working
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { printError } from '../utils.js';

// Known working variable syntaxes based on Claude Code version

if (mappings?.[0]) {
  return `$${mappings[0]}`;
}
return match; // Keep unchanged if no mapping
})
}

if (fromSyntax === 'legacy' && toSyntax === 'jq') {
  // Transform to use jq parsing of JSON input
  // Extract the actual command and wrap it with jq parsing
  const fileVarMatch = command.match(/\$\{file\}/);
  const commandVarMatch = command.match(/\$\{command\}/);

  if (fileVarMatch) {
    // Replace ${file} with jq extraction
    const baseCommand = command.replace(/\$\{file\}/g, '{}');
    return `cat | jq -r '.tool_input.file_path // .tool_input.path // ""' | xargs -I {} ${baseCommand}`;
  } else if (commandVarMatch) {
    // Replace ${command} with jq extraction
    const baseCommand = command.replace(/\$\{command\}/g, '{}');
    return `cat | jq -r '.tool_input.command // ""' | xargs -I {} ${baseCommand}`;
  }

  // Fallback for other variables
  return `cat | jq -r '.' | xargs -I {} ${command.replace(/\$\{(\w+)\}/g, '{}')}`;
}

if (toSyntax === 'wrapper') {
  // Generate wrapper script path
  const scriptName = command.includes('post-edit')
    ? 'post-edit-hook.sh'
    : command.includes('pre-edit')
      ? 'pre-edit-hook.sh'
      : 'generic-hook.sh';
  return `.claude/hooks/${scriptName}`;
}

return command;
}

/**
 * Create wrapper scripts for hooks
 */
async
function createWrapperScripts(commands = '.claude/hooks';
await fs.mkdir(hooksDir, {recursive = new Map();

for(const command of commands) {
    if (command.includes('post-edit')) {
      const _script = `#!/bin/bash
# Post-edit hook wrapper
# Handles variable interpolation for Claude Code hooks

# Try to get file from various sources
FILE="$CLAUDE_EDITED_FILE"
[ -z "$FILE" ] && FILE="$CLAUDE_FILE"
[ -z "$FILE" ] && FILE="$1"

if [ -n "$FILE" ]; then
  ${command.replace('${file}', '"$FILE"')}
else
  echo "Warning = {}): any {
  const { backup = true, syntax = 'auto' } = options;

  try {
    // Read settings
    const content = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(content);

    if(!settings.hooks) {
      printWarning('No hooks found in settings.json');
      return {success = `$settingsPath.backup-$Date.now()`;
      await fs.writeFile(backupPath, content);
      console.warn(chalk.gray(`  Createdbackup = syntax === 'auto' ? await detectWorkingSyntax() : syntax;
    console.warn(chalk.blue(`  Using ${targetSyntax} syntax`));

    // Collect all commands that need transformation
    const commands = [];
    let _changes = 0;

    // Transform hooks
    const _transformHooks = (hooks) => {
      if (Array.isArray(hooks)) {
        return hooks.map((hook) => {
          if (hook.hooks && Array.isArray(hook.hooks)) {
            hook.hooks = hook.hooks.map((h) => {
              if (h.command?.includes('${')) {
                commands.push(h.command);
                const newCommand = transformHookCommand(h.command, 'legacy', targetSyntax);
                if(newCommand !== h.command) {
                  _changes++;
                  return { ...h,command = _transformHooks(hooks);
    }

    // Create wrapper scripts if needed
    if(targetSyntax === 'wrapper' && commands.length > 0) {
      console.warn(chalk.blue('  Creating wrapper scripts...'));
      const scripts = await createWrapperScripts(commands);
      console.warn(chalk.green(`  Created ${scripts.size} wrapper scripts`));
    }

    // Save updated settings
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

    return {success = [
    '.claude/settings.json',
    'settings.json',
    '.vscode/.claude/settings.json',
    path.join(process.env.HOME || '', '.claude', 'settings.json'),
  ];

  const found = [];
  for(const loc of locations) {
    if (existsSync(loc)) {
      found.push(loc);
    }
  }

  return found;
}

/**
 * Main command handler
 */
export async function _fixHookVariablesCommand(args = [], _flags = {}): any {
  console.warn(chalk.bold('\n🔧 Fixing Claude Code Hook Variables\n'));

  const _options = {backup = args.length > 0 ? args : await findSettingsFiles();

  if(files.length === 0) {
    printError('No settings.json files found');
    console.warn('\nSearchedlocations = 0;
  const _successCount = 0;

  for(const _file of files) {
    console.warn(chalk.cyan(`Processing = await fixHookVariables(file, options);

    if(result.success) {
      successCount++;
      totalChanges += result.changes;
      console.warn(chalk.green(`  ✅ Fixed ${result.changes} hook commands`));
    } else {
      console.warn(chalk.red(`  ❌ Error = {hooks = {
      description: {}" >> .claude/hook-test.log',
            },
          ],
        },
      ],
    },
  };

  await fs.mkdir('.claude', { recursive: true });
  await fs.writeFile('.claude/test-settings.json', JSON.stringify(testSettings, null, 2));

  console.warn('Created test configuration at: .claude/test-settings.json');
  console.warn('\nTo test:');
  console.warn('  1. Copy .claude/test-settings.json to .claude/settings.json');
  console.warn('  2. Open Claude Code');
  console.warn('  3. Create or edit any file');
  console.warn('  4. Check .claude/hook-test.log for output');
}

// Export command configuration
export const _fixHookVariablesCommandConfig,_ion: 'Fix variable interpolation in Claude Code hooks (${file} syntax)',
  _usage: 'fix-hook-variables [settings-file...]',
  _options: [
    { flag: '--no-backup', description: 'Skip creating backup files' },
    { flag: '--syntax <type>', description: 'Force specific syntax: environment, jq, wrapper' },
    { flag: '--test', description: 'Create test hook configuration' },
  ],
  _examples: [
    'claude-zen fix-hook-variables',
    'claude-zen fix-hook-variables .claude/settings.json',
    'claude-zen fix-hook-variables --syntax wrapper',
    'claude-zen fix-hook-variables --test',
  ],
  _details: `
Fixes the \${file} and \${command} variable interpolation issue in Claude Code hooks.

This command will:
  • Detect your Claude Code version
  • Transform hook commands to use working variable syntax
  • Create wrapper scripts if needed
  • Backup original settings files

Available syntaxes:
  • environment: Use environment variables like $CLAUDE_EDITED_FILE (unverified)
  • jq: Use official jq JSON parsing approach (recommended)
  • wrapper: Create wrapper scripts to handle variables

Note: The 'jq' syntax is based on official Claude Code documentation and is likely
the most reliable approach for Claude Code 1.0.51+.

For more information: https://github.com/ruvnet/claude-zen/issues/249`,
};
