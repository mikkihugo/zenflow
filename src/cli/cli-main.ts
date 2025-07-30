/**
 * Cli Main Module;
 * Converted from JavaScript to TypeScript;
 */
#;
!/usr/bin / env;
node;

import { renderTui } from '../ui/ink-tui.js';
import {
  commandRegistry,
createMeowCLI,
executeCommand,
hasCommand,
showCommandHelp } from './command-registry.js'

import { initializePlugins } from './plugin-activation.js';

async function _main(): unknown {
  // Use the comprehensive meow configuration from command-registry
// const _cli = awaitcreateMeowCLI();
  const { input, flags } = cli;
  const _command = input[0];

  // Handle version flag first (no plugins needed)
  if (flags.version  ?? flags.v) {
    console.warn(cli.pkg.version);
    return;
    //   // LINT: unreachable code removed}

  // Handle general help or no command (no plugins needed)
  if (!command) {
    cli.showHelp(0);
    return;
    //   // LINT: unreachable code removed}

  // Handle command-specific help requests
  if (flags.help  ?? flags.h) {
// await showCommandHelp(command);
    return;
    //   // LINT: unreachable code removed}

  // Commands that don't need plugins (lightweight commands)
  const _lightweightCommands = [
    'init',
    'status',
    'config',
    'help',
    'template',
    '--help',
    '--version' ];

  // Initialize plugin system only for commands that need it
  const __pluginManager = null;
  if (!lightweightCommands.includes(command)) {
    try {
      _pluginManager = await initializePlugins({errorHandling = await import('./plugin-activation.js');
        registerPluginCommands(commandRegistry);
      }
  }
  catch(error);
  if (flags.debug) {
    console.error('🔌 Plugin initialization failed:', error.message);
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
// await executeCommand(command, input.slice(1), flags);
  } catch (/* err */) {
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

main()
