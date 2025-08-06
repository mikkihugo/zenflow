#!/usr/bin/env node
/**
 * SPARC Architecture CLI Demo
 *
 * Demonstrates the CLI functionality for architecture management
 */

import { createArchitectureCLI } from './architecture-commands';

async function runCLIDemo() {
  console.log('🏗️  SPARC Architecture CLI Demo\n');

  const architectureCmd = createArchitectureCLI();

  try {
    // Simulate CLI command: generate architecture
    console.log('📋 Demo: Generating architecture from sample pseudocode...');
    console.log('Command: claude-zen sparc architecture generate --validate\n');

    // Simulate the generate command with validation
    const mockOptions = {
      input: null,
      output: null,
      project: null,
      domain: 'swarm-coordination',
      validate: true,
    };

    // Find the generate command and simulate its action
    const generateCommand = architectureCmd.commands.find((cmd) => cmd.name() === 'generate');
    if (generateCommand && generateCommand._actionHandler) {
      await generateCommand._actionHandler(mockOptions);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Simulate CLI command: stats
    console.log('📊 Demo: Getting architecture statistics...');
    console.log('Command: claude-zen sparc architecture stats\n');

    const statsCommand = architectureCmd.commands.find((cmd) => cmd.name() === 'stats');
    if (statsCommand && statsCommand._actionHandler) {
      await statsCommand._actionHandler({ json: false });
    }

    console.log('\n✅ CLI Demo completed successfully!');
    console.log('\n📖 Available Commands:');
    console.log('   claude-zen sparc architecture generate [options]');
    console.log('   claude-zen sparc architecture validate <id> [options]');
    console.log('   claude-zen sparc architecture search [options]');
    console.log('   claude-zen sparc architecture export <id> [options]');
    console.log('   claude-zen sparc architecture stats [options]');
  } catch (error) {
    console.error('❌ CLI Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLIDemo().catch(console.error);
}

export { runCLIDemo };
