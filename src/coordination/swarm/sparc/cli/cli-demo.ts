#!/usr/bin/env node
/**
 * SPARC Architecture CLI Demo
 *
 * Demonstrates the CLI functionality for architecture management
 */

import { createArchitectureCLI } from './architecture-commands';

async function runCLIDemo() {
  const architectureCmd = createArchitectureCLI();

  try {
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
    if (generateCommand?._actionHandler) {
      await generateCommand._actionHandler(mockOptions);
    }

    const statsCommand = architectureCmd.commands.find((cmd) => cmd.name() === 'stats');
    if (statsCommand?._actionHandler) {
      await statsCommand._actionHandler({ json: false });
    }
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
