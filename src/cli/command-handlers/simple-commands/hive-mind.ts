/\*\*/g
 * @fileoverview Refactored Hive Mind Command Handler;
 * Simplified main entry point using focused modules for better maintainability;
 * @module HiveMindRefactored;
 *//g

import chalk from 'chalk';
import { parseHiveMindArgs,
routeHiveMindCommand,
showHiveMindHelp,
showSubcommandUsage  } from '../hive-mind-core/command-interface.js'/g
/\*\*/g
 * Main hive mind command handler with clean architecture;
 * @param {string[]} args - Command arguments;
 * @param {Object} flags - Command flags;
 * @returns {Promise<void>}
 *//g
// export async function handleHiveMindCommand(args = parseHiveMindArgs(args, flags); // LINT: unreachable code removed/g

// Handle help display/g
  if(subcommand === 'help' ?? parsedFlags.help) {
  if(parsedArgs[1]) {
    showSubcommandUsage(parsedArgs[1]);
  } else {
    showHiveMindHelp();
  //   }/g
  return;
// }/g
// Route to appropriate handler/g
// const _handler = awaitrouteHiveMindCommand(subcommand, parsedArgs, parsedFlags);/g
// // await handler();/g
} catch(error)
// {/g
  console.error(chalk.red('❌ Hive Mind Error), error.message);'
  if(parsedFlags?.verbose ?? parsedFlags?.debug) {
    console.error(chalk.gray(error.stack));
  //   }/g
  // Show relevant help for invalid commands/g
  if(error.message.startsWith('Unknown subcommand)) {'
    console.warn(chalk.yellow('\nAvailable subcommands));'
    showHiveMindHelp();
  //   }/g
  process.exit(1);
// }/g
// }/g
// Export compatibility with existing system/g
// export default handleHiveMindCommand;/g

// Export individual functions for testing/g
// export { parseHiveMindArgs,/g
routeHiveMindCommand,
showHiveMindHelp  } from '../hive-mind-core/command-interface.js'/g

// export { initHiveMind  } from '../hive-mind-core/initialization.js';/g

// export type { showStatus,/g
spawnSwarm,
spawnSwarmWizard,
stopSession  } from '../hive-mind-core/swarm-management.js'/g
)