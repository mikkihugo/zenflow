/**
 * @fileoverview Refactored Hive Mind Command Handler
 * Simplified main entry point using focused modules for better maintainability
 * @module HiveMindRefactored
 */

import chalk from 'chalk';
import { 
  showHiveMindHelp, 
  parseHiveMindArgs, 
  routeHiveMindCommand,
  showSubcommandUsage
} from '../hive-mind-core/command-interface.js';

/**
 * Main hive mind command handler with clean architecture
 * @param {string[]} args - Command arguments
 * @param {Object} flags - Command flags
 * @returns {Promise<void>}
 */
export async function handleHiveMindCommand(args, flags) {
  try {
    // Parse and validate arguments
    const { subcommand, args: parsedArgs, flags: parsedFlags } = parseHiveMindArgs(args, flags);
    
    // Handle help display
    if (subcommand === 'help' || parsedFlags.help) {
      if (parsedArgs[1]) {
        showSubcommandUsage(parsedArgs[1]);
      } else {
        showHiveMindHelp();
      }
      return;
    }
    
    // Route to appropriate handler
    const handler = await routeHiveMindCommand(subcommand, parsedArgs, parsedFlags);
    await handler();
    
  } catch (error) {
    console.error(chalk.red('❌ Hive Mind Error:'), error.message);
    
    if (parsedFlags?.verbose || parsedFlags?.debug) {
      console.error(chalk.gray(error.stack));
    }
    
    // Show relevant help for invalid commands
    if (error.message.startsWith('Unknown subcommand:')) {
      console.log(chalk.yellow('\nAvailable subcommands:'));
      showHiveMindHelp();
    }
    
    process.exit(1);
  }
}

// Export compatibility with existing system
export default handleHiveMindCommand;

// Export individual functions for testing
export {
  showHiveMindHelp,
  parseHiveMindArgs,
  routeHiveMindCommand
} from '../hive-mind-core/command-interface.js';

export {
  initHiveMind
} from '../hive-mind-core/initialization.js';

export {
  spawnSwarm,
  spawnSwarmWizard,
  showStatus,
  stopSession
} from '../hive-mind-core/swarm-management.js';