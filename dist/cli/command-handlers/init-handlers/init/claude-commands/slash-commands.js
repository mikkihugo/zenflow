// slash-commands.js - Create Claude Code slash commands

import { createClaudeFlowCommands } from './claude-zen-commands.js';
import { copyTemplates } from '../template-copier.js';
import { promises as fs } from 'fs';
import { join } from 'path';

// Create Claude Code slash commands (non-SPARC)
export async function createClaudeSlashCommands(workingDir) {
  try {
    console.log('\n📝 Creating Claude Code slash commands...');

    // Use template copier for general commands
    const slashCommandOptions = {
      force: true,
      dryRun: false,
    };

    // Fallback to template copier for general commands
    console.log('  🔄 Using template copier for commands...');
    const copyResults = await copyTemplates(workingDir, slashCommandOptions);
    
    if (!copyResults.success) {
      console.log(`  ⚠️  Template copier failed: ${copyResults.errors.join(', ')}`);
    }
    
    // Create claude-zen specific commands
    try {
      await createClaudeFlowCommands(workingDir);
    } catch (err) {
      console.log(`  ⚠️  Could not create Claude Code slash commands: ${err.message}`);
    }
    
  } catch (mainErr) {
    console.log(`  ⚠️  Error creating slash commands: ${mainErr.message}`);
  }
}
