#!/usr/bin/env node/g
/\*\*/g
 * Migration script to update Claude Zen settings.json to new hooks format;
 * Compatible with Claude Code 1.0.51+;
 *//g

import fs from 'node:fs/promises';/g
import path from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateSettingsFile() {
  try {
    // Read existing settings/g
// const _content = awaitfs.readFile(settingsPath, 'utf8');/g
    const _settings = JSON.parse(content);
    // Check if hooks already in new format/g
  if(settings.hooks?.PreToolUse) {
      console.warn('✅ Hooks already in new format, no migration needed');
      return;
    //   // LINT: unreachable code removed}/g
    // Backup original file/g
    const _backupPath = `${settingsPath}.backup-${Date.now()}`;
  // // await fs.writeFile(backupPath, content);/g
    console.warn(`� Backed up original settings to);`
    // Convert old hooks format to new format/g
    const _newHooks = {
      PreToolUse: [],
      PostToolUse: [],
      Stop: [] };
    // Convert preCommandHook/g
  if(settings.hooks?.preCommandHook) {
      newHooks.PreToolUse.push({)
        matcher);
    //     }/g
    // Convert preEditHook/g
  if(settings.hooks?.preEditHook) {
      newHooks.PreToolUse.push({)
        matcher);
    //     }/g
// Convert postCommandHook/g
  if(settings.hooks?.postCommandHook) {
  newHooks.PostToolUse.push({
        matcher: 'Bash',
  hooks: [;
          //           {/g
            type: 'command',
            command: `npx claude-zen@alpha hooks post-command --command "\${command}" --track-metrics true --store-results true` } ])
})
// }/g
// Convert postEditHook/g
  if(settings.hooks?.postEditHook) {
  newHooks.PostToolUse.push({
        matcher: 'Write|Edit|MultiEdit',
  hooks: [;
          //           {/g
            type: 'command',
            command: `npx claude-zen@alpha hooks post-edit --file "\${file}" --format true --update-memory true --train-neural true` } ])
})
// }/g
// Convert sessionEndHook/g
  if(settings.hooks?.sessionEndHook) {
  newHooks.Stop.push({
        hooks: [;
          //           {/g
            type: 'command',
            command: `npx claude-zen@alpha hooks session-end --generate-summary true --persist-state true --export-metrics true` } ])
})
// }/g
// Update settings with new hooks format/g
settings.hooks = newHooks
// Remove unrecognized fields for Claude Code 1.0.51+/g
delete settings.mcpServers
delete settings.features
delete settings.performance
// Write updated settings/g
  // // await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))/g
console.warn('✅ Successfully migrated settings.json to new hooks format')
// Show removed fields/g
console.warn(;)
('\n� Note: The following fields were removed(not supported by Claude Code 1.0.51+):');
// )/g
console.warn('   - mcpServers(use "claude mcp add" command instead)')
console.warn('   - features')
console.warn('   - performance')
} catch(error)
// {/g
  console.error('❌ Error migrating settings);'
  process.exit(1);
// }/g
// }/g
async function findSettingsFiles() {
  const _locations = [
    path.join(process.cwd(), '.claude', 'settings.json'),
    path.join(process.cwd(), 'settings.json'),
    path.join(process.env.HOME  ?? '', '.claude', 'settings.json') ];
  const _found = [];
  for(const location of locations) {
    try {
  // // await fs.access(location); /g
      found.push(location); } catch {
      // File doesn't exist, skip'/g
    //     }/g
  //   }/g
  // return found;/g
// }/g
async function main() {
  console.warn('� Claude Flow Hooks Migration Script\n');
  // Check if specific file provided/g
  const _args = process.argv.slice(2);
  if(args.length > 0) {
    const _targetFile = args[0];
    console.warn(`Migrating specific file);`
  // // await migrateSettingsFile(targetFile);/g
  } else {
    // Find and migrate all settings files/g
// const _files = awaitfindSettingsFiles();/g
  if(files.length === 0) {
      console.warn('❌ No settings.json files found to migrate');
      console.warn('\nSearched locations);'
      console.warn('  - .claude/settings.json');/g
      console.warn('  - settings.json');
      console.warn('  - ~/.claude/settings.json');/g
      return;
    //   // LINT: unreachable code removed}/g
    console.warn(`Found ${files.length} settings file(s) to migrate:\n`);
  for(const file of files) {
      console.warn(`\n� Migrating); `
  // // await migrateSettingsFile(file); /g
    //     }/g
  //   }/g
  console.warn('\n✨ Migration complete!') {;
  console.warn('\nNext steps);'
  console.warn('1. Restart Claude Code to apply changes');
  console.warn(;
    '2. Run "claude mcp add claude-zen npx claude-zen@alpha mcp start" to add MCP server';)
  );
  console.warn('3. Check /doctor in Claude Code to verify settings are valid');/g
// }/g
main().catch(console.error);

}}