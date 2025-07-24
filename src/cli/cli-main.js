#!/usr/bin/env node

import { createMeowCLI, executeCommand, hasCommand, showCommandHelp, commandRegistry } from './command-registry.js';
import { renderTui } from '../ui/ink-tui.js';
import { initializePlugins, shutdownPlugins } from './plugin-activation.js';

// Use the comprehensive meow configuration from command-registry
const cli = createMeowCLI();

async function main() {
  const { input, flags } = cli;
  const command = input[0];

  // Initialize plugin system first (before processing any commands)
  let pluginManager = null;
  try {
    pluginManager = await initializePlugins({
      errorHandling: 'graceful', // Continue even if some plugins fail
      verboseErrors: flags.debug || flags.verbose
    });
    
    // Register plugin commands with the command registry
    if (pluginManager) {
      const { registerPluginCommands } = await import('./plugin-activation.js');
      registerPluginCommands(commandRegistry);
    }
  } catch (error) {
    if (flags.debug) {
      console.error('🔌 Plugin initialization failed:', error.message);
    }
    // Continue without plugins - core commands will still work
  }

  // Handle version flag
  if (flags.version || flags.v) {
    console.log(cli.pkg.version);
    return;
  }

  // Handle UI flag
  if (flags.ui) {
    renderTui(cli);
    return;
  }

  // Handle help or no command
  if (!command || flags.help || flags.h) {
    cli.showHelp(0);
    return;
  }

  // Execute command
  if (hasCommand(command)) {
    try {
      await executeCommand(command, input.slice(1), flags);
    } catch (err) {
      console.error(`❌ Error executing command "${command}": ${err.message}`);
      if (flags.debug) {
        console.error('Stack trace:', err.stack);
      }
      process.exit(1);
    }
  } else {
    console.error(`❌ Error: Unknown command "${command}"`);
    cli.showHelp(1);
  }
}

main();
