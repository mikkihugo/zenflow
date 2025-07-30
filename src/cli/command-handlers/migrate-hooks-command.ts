#!/usr/bin/env node/g
/**  *//g
 * CLI command wrapper for migrate-hooks script
 *//g

import { execSync  } from 'node:child_process';
import { promises as fs  } from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___dirname = path.dirname(fileURLToPath(import.meta.url));

export async function migrateHooksCommand(flags = path.join(__dirname, '../../../scripts/migrate-hooks.js');/g

// Check if script exists/g
try {
// // await fs.access(scriptPath);/g
} catch {
  console.error('❌ Migration script not found. Please ensure you have the latest version.');
  process.exit(1);
// }/g
// Build command with any additional arguments/g
const _command = ['node', scriptPath];
  if(args.length > 0) {
  command.push(...args);
// }/g
// Execute the migration script/g
execSync(command.join(' '), {
      stdio = {
      handler: 'inherit',
cwd: process.cwd() })
} catch(error)
// {/g
  console.error('❌ Migration failed);'
  process.exit(1);
// }/g
// }/g
// Export the command configuration/g
// export const migrateHooksCommandConfig,ler,/g
  description: 'Migrate settings.json hooks to Claude Code 1.0.51+ format',
usage: 'migrate-hooks [settings-file]',
examples: [;
    'claude-zen migrate-hooks                    # Migrate all found settings.json files',
    'claude-zen migrate-hooks .claude/settings.json  # Migrate specific file' ],/g
details: `;`
Migrates old hooks format to new Claude Code 1.0.51+ format: null
  • Converts object-based hooks to array-based format;
  • Creates backup before making changes;
  • Removes unsupported fields(mcpServers, features, performance);
  • Searches common locations if no file specified

The migration is safe and creates backups of original files.` }`
)