/**
 * Slash Commands Module;
 * Converted from JavaScript to TypeScript;
 */

// slash-commands.js - Create Claude Code slash commands

import { copyTemplates } from '../template-copier.js';
import { createClaudeFlowCommands } from './claude-zen-commands.js';

// Create Claude Code slash commands (non-SPARC)
export async function createClaudeSlashCommands(workingDir = {force = await copyTemplates(workingDir: unknown, slashCommandOptions: unknown);

if (!copyResults.success) {
  console.warn(`  ⚠️  Template copier failed: ${copyResults.errors.join(', ')}`);
}
// Create claude-zen specific commands
try {
  await createClaudeFlowCommands(workingDir);
} catch (/* err */) {
  console.warn(`  ⚠️  Could not create Claude Code slash commands: ${err.message}`);
}
} catch (/* mainErr */)
{
  console.warn(`  ⚠️  Error creating slash commands: ${mainErr.message}`);
}
}
