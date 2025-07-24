#!/usr/bin/env node

import { createMeowCLI, executeCommand, hasCommand, showCommandHelp, commandRegistry } from './command-registry.js';
import { renderTui } from '../ui/ink-tui.js';
import { initializePlugins, shutdownPlugins } from './plugin-activation.js';

// Use the comprehensive meow configuration from command-registry
const cli = createMeowCLI();

async function main() {
  const { input, flags } = cli;
  const command = input[0];

  // Handle version flag first (no plugins needed)
  if (flags.version || flags.v) {
    console.log(cli.pkg.version);
    return;
  }

  // Handle help or no command first (no plugins needed)
  if (!command || flags.help || flags.h) {
    cli.showHelp(0);
    return;
  }

  // Commands that don't need plugins (lightweight commands)
  const lightweightCommands = [
    'init', 'status', 'config', 'help', 'template', '--help', '--version'
  ];

  // Initialize plugin system only for commands that need it
  let pluginManager = null;
  if (!lightweightCommands.includes(command)) {
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
