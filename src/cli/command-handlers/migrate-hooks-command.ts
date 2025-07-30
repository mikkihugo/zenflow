#!/usr/bin/env node
/**  */
 * CLI command wrapper for migrate-hooks script
 */

import { execSync  } from 'node:child_process';
import { promises as fs  } from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___dirname = path.dirname(fileURLToPath(import.meta.url));

export async function migrateHooksCommand(flags = path.join(__dirname, '../../../scripts/migrate-hooks.js');

// Check if script exists
try {
// // await fs.access(scriptPath);
} catch {
  console.error('❌ Migration script not found. Please ensure you have the latest version.');
  process.exit(1);
// }
// Build command with any additional arguments
const _command = ['node', scriptPath];
if(args.length > 0) {
  command.push(...args);
// }
// Execute the migration script
execSync(command.join(' '), {
      stdio = {
      handler: 'inherit',
cwd: process.cwd() })
} catch(error)
// {
  console.error('❌ Migration failed);'
  process.exit(1);
// }
// }
// Export the command configuration
// export const migrateHooksCommandConfig,ler,
  description: 'Migrate settings.json hooks to Claude Code 1.0.51+ format',
usage: 'migrate-hooks [settings-file]',
examples: [;
    'claude-zen migrate-hooks                    # Migrate all found settings.json files',
    'claude-zen migrate-hooks .claude/settings.json  # Migrate specific file' ],
details: `;`
Migrates old hooks format to new Claude Code 1.0.51+ format:
  • Converts object-based hooks to array-based format;
  • Creates backup before making changes;
  • Removes unsupported fields(mcpServers, features, performance);
  • Searches common locations if no file specified

The migration is safe and creates backups of original files.` }`
)