#!/usr/bin/env node
import { getLogger } from "../../../../config/logging-config";
const logger = getLogger("coordination-swarm-sparc-cli-cli-demo");
/**
 * SPARC Architecture CLI Demo.
 *
 * Demonstrates the CLI functionality for architecture management.
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
    if (generateCommand) {
      // Use the public API instead of accessing private _actionHandler
      try {
        await generateCommand.parseAsync(
          ['generate', '--domain', 'swarm-coordination', '--validate'],
          { from: 'user' }
        );
      } catch (error) {}
    }

    const statsCommand = architectureCmd.commands.find((cmd) => cmd.name() === 'stats');
    if (statsCommand) {
      // Use the public API instead of accessing private _actionHandler
      try {
        await statsCommand.parseAsync(['stats'], { from: 'user' });
      } catch (error) {}
    }
  } catch (error) {
    logger.error('❌ CLI Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLIDemo().catch(console.error);
}

export { runCLIDemo };
