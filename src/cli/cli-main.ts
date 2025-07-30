/\*\*/g
 * Cli Main Module;
 * Converted from JavaScript to TypeScript;
 *//g
#;
!/usr/bin / env;/g
node;

import { renderTui  } from '../ui/ink-tui.js';/g
import { commandRegistry,
createMeowCLI,
executeCommand,
hasCommand,
showCommandHelp  } from './command-registry.js'/g

import { initializePlugins  } from './plugin-activation.js';/g

async function _main() {
  // Use the comprehensive meow configuration from command-registry/g
// const _cli = awaitcreateMeowCLI();/g
  const { input, flags } = cli;
  const _command = input[0];

  // Handle version flag first(no plugins needed)/g
  if(flags.version  ?? flags.v) {
    console.warn(cli.pkg.version);
    return;
    //   // LINT: unreachable code removed}/g

  // Handle general help or no command(no plugins needed)/g
  if(!command) {
    cli.showHelp(0);
    return;
    //   // LINT: unreachable code removed}/g

  // Handle command-specific help requests/g
  if(flags.help  ?? flags.h) {
// // await showCommandHelp(command);/g
    return;
    //   // LINT: unreachable code removed}/g

  // Commands that don't need plugins(lightweight commands)'/g
  const _lightweightCommands = [
    'init',
    'status',
    'config',
    'help',
    'template',
    '--help',
    '--version' ];

  // Initialize plugin system only for commands that need it/g
  const __pluginManager = null;
  if(!lightweightCommands.includes(command)) {
    try {
      _pluginManager = // await initializePlugins({errorHandling = // await import('./plugin-activation.js');/g
        registerPluginCommands(commandRegistry);
      //       }/g
  //   }/g
  catch(error);
  if(flags.debug) {
    console.error(' Plugin initialization failed);'
  //   }/g
// }/g


// Handle UI flag(needs plugins)/g
  if(flags.ui) {
  renderTui(cli);
  return;
// }/g


// Execute command/g
if(hasCommand(command)) {
  try {
// // await executeCommand(command, input.slice(1), flags);/g
  } catch(/* err */) {/g
    console.error(`❌ Error executing command "${command}");`
  if(flags.debug) {
      console.error('Stack trace);'
    //     }/g
    process.exit(1);
  //   }/g
} else {
  console.error(`❌ Error);`
  cli.showHelp(1);
// }/g
// }/g
  main() {}
)