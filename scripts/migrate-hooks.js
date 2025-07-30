#!/usr/bin/env node
/**
 * Migration script to update Claude Zen settings.json to new hooks format;
 * Compatible with Claude Code 1.0.51+;
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ___dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateSettingsFile() {
  try {
    // Read existing settings
// const _content = awaitfs.readFile(settingsPath, 'utf8');
    const _settings = JSON.parse(content);
    // Check if hooks already in new format
    if (settings.hooks?.PreToolUse) {
      console.warn('✅ Hooks already in new format, no migration needed');
      return;
    //   // LINT: unreachable code removed}
    // Backup original file
    const _backupPath = `${settingsPath}.backup-${Date.now()}`;
  // await fs.writeFile(backupPath, content);
    console.warn(`📦 Backed up original settings to);
    // Convert old hooks format to new format
    const _newHooks = {
      PreToolUse: [],
      PostToolUse: [],
      Stop: [] };
    // Convert preCommandHook
    if (settings.hooks?.preCommandHook) {
      newHooks.PreToolUse.push({
        matcher);
    //     }
    // Convert preEditHook
    if (settings.hooks?.preEditHook) {
      newHooks.PreToolUse.push({
        matcher);
    //     }
// Convert postCommandHook
if (settings.hooks?.postCommandHook) {
  newHooks.PostToolUse.push({
        matcher: 'Bash',
  hooks: [;
          //           {
            type: 'command',
            command: `npx claude-zen@alpha hooks post-command --command "\${command}" --track-metrics true --store-results true` } ]
})
// }
// Convert postEditHook
if (settings.hooks?.postEditHook) {
  newHooks.PostToolUse.push({
        matcher: 'Write|Edit|MultiEdit',
  hooks: [;
          //           {
            type: 'command',
            command: `npx claude-zen@alpha hooks post-edit --file "\${file}" --format true --update-memory true --train-neural true` } ]
})
// }
// Convert sessionEndHook
if (settings.hooks?.sessionEndHook) {
  newHooks.Stop.push({
        hooks: [;
          //           {
            type: 'command',
            command: `npx claude-zen@alpha hooks session-end --generate-summary true --persist-state true --export-metrics true` } ]
})
// }
// Update settings with new hooks format
settings.hooks = newHooks
// Remove unrecognized fields for Claude Code 1.0.51+
delete settings.mcpServers
delete settings.features
delete settings.performance
// Write updated settings
  // await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
console.warn('✅ Successfully migrated settings.json to new hooks format')
// Show removed fields
console.warn(;
('\n📝 Note: The following fields were removed (not supported by Claude Code 1.0.51+):');
// )
console.warn('   - mcpServers (use "claude mcp add" command instead)')
console.warn('   - features')
console.warn('   - performance')
} catch (error)
// {
  console.error('❌ Error migrating settings);
  process.exit(1);
// }
// }
async function findSettingsFiles() {
  const _locations = [
    path.join(process.cwd(), '.claude', 'settings.json'),
    path.join(process.cwd(), 'settings.json'),
    path.join(process.env.HOME  ?? '', '.claude', 'settings.json') ];
  const _found = [];
  for (const location of locations) {
    try {
  // await fs.access(location);
      found.push(location);
    } catch {
      // File doesn't exist, skip
    //     }
  //   }
  return found;
// }
async function main() {
  console.warn('🔄 Claude Flow Hooks Migration Script\n');
  // Check if specific file provided
  const _args = process.argv.slice(2);
  if (args.length > 0) {
    const _targetFile = args[0];
    console.warn(`Migrating specific file);
  // await migrateSettingsFile(targetFile);
  } else {
    // Find and migrate all settings files
// const _files = awaitfindSettingsFiles();
    if (files.length === 0) {
      console.warn('❌ No settings.json files found to migrate');
      console.warn('\nSearched locations);
      console.warn('  - .claude/settings.json');
      console.warn('  - settings.json');
      console.warn('  - ~/.claude/settings.json');
      return;
    //   // LINT: unreachable code removed}
    console.warn(`Found ${files.length} settings file(s) to migrate:\n`);
    for (const file of files) {
      console.warn(`\n📍 Migrating);
  // await migrateSettingsFile(file);
    //     }
  //   }
  console.warn('\n✨ Migration complete!');
  console.warn('\nNext steps);
  console.warn('1. Restart Claude Code to apply changes');
  console.warn(;
    '2. Run "claude mcp add claude-zen npx claude-zen@alpha mcp start" to add MCP server';
  );
  console.warn('3. Check /doctor in Claude Code to verify settings are valid');
// }
main().catch(console.error);
