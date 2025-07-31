#!/usr/bin/env node

/**
 * CLI Main Module
 * Converted from JavaScript to TypeScript
 */

import { renderTui } from '../ui/ink-tui.js';
import { 
  commandRegistry,
  createMeowCLI,
  executeCommand,
  hasCommand,
  showCommandHelp 
} from './command-registry.js';
import { initializePlugins } from './plugin-activation.js';

async function main(): Promise<void> {
  // Use the comprehensive meow configuration from command-registry
  const cli = await createMeowCLI();
  const { input, flags } = cli;
  const command = input[0];

  // Handle version flag first (no plugins needed)
  if (flags.version || flags.v) {
    console.log(cli.pkg.version);
    return;
  }

  // Handle general help or no command (no plugins needed)
  if (!command) {
    cli.showHelp(0);
    return;
  }

  // Handle command-specific help requests
  if (flags.help || flags.h) {
    await showCommandHelp(command);
    return;
  }

  // Commands that don't need plugins (lightweight commands)
  const lightweightCommands = [
    'init',
    'status',
    'config',
    'help',
    'template',
    '--help',
    '--version'
  ];

  // Initialize plugin system only for commands that need it
  let pluginManager: any = null;
  if (!lightweightCommands.includes(command)) {
    try {
      pluginManager = await initializePlugins({
        errorHandling: 'graceful',
        timeout: 10000
      });
      
      if (pluginManager) {
        const { registerPluginCommands } = await import('./plugin-activation.js');
        registerPluginCommands(commandRegistry);
      }
    } catch (error) {
      if (flags.debug) {
        console.error('⚠️ Plugin initialization failed:', error);
      }
    }
  }

  // Handle UI flag (needs plugins)
  if (flags.ui) {
    renderTui(cli);
    return;
  }

  // Execute command
  if (hasCommand(command)) {
    try {
      await executeCommand(command, input.slice(1), flags);
    } catch (err) {
      console.error(`❌ Error executing command "${command}":`, err);
      if (flags.debug) {
        console.error('Stack trace:', err);
      }
      process.exit(1);
    }
  } else {
    console.error(`❌ Error: Unknown command "${command}"`);
    cli.showHelp(1);
  }
}

main().catch((error) => {
  console.error('❌ CLI Main error:', error);
  process.exit(1);
});