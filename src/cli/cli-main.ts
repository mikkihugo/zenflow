#!/usr/bin/env node

/**
 * CLI Main Module
 * 
 * Entry point for the Claude Flow CLI application.
 * Integrates the new CliApp architecture with services, utilities, and commands.
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { CliApp } from './core/app';
import { initializeServices, Services } from './services/index';
import { createLogger } from './utils/logger';
// import { renderTui } from '../ui/ink-tui'; // TODO: Implement TUI

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import command classes
import { InitCommand } from './commands/init/init-command';
import { StatusCommand } from './commands/status/status-command';
import { SwarmCommand } from './commands/swarm/swarm-command';
import { HelpCommand } from './commands/help/help-command';

/**
 * Get package information
 */
function getPackageInfo() {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageData = JSON.parse(readFileSync(packagePath, 'utf8'));
    return {
      name: packageData.name || 'claude-flow',
      version: packageData.version || '1.0.0',
      description: packageData.description || 'Claude Flow CLI'
    };
  } catch (error) {
    return {
      name: 'claude-flow',
      version: '1.0.0',
      description: 'Claude Flow CLI'
    };
  }
}

/**
 * Register all built-in commands
 */
function registerCommands(app: CliApp): void {
  // Core commands
  app.registerCommand(new InitCommand());
  app.registerCommand(new StatusCommand());
  app.registerCommand(new SwarmCommand());
  app.registerCommand(new HelpCommand());
}

/**
 * Main CLI application entry point
 */
async function main(): Promise<void> {
  const logger = createLogger({ prefix: 'CLI' });
  const packageInfo = getPackageInfo();
  
  try {
    // Initialize services first
    logger.info('Initializing services...');
    await initializeServices();
    
    // Create CLI application
    const app = CliApp.create({
      name: packageInfo.name,
      version: packageInfo.version,
      description: packageInfo.description,
      config: {
        files: [
          'claude-flow.config.json',
          '.claude-flow.json',
        ],
        envPrefix: 'CLAUDE_FLOW',
        createDefault: true,
      },
      commandPaths: [
        join(__dirname, 'commands'),
      ],
      pluginPaths: [
        join(process.cwd(), 'plugins'),
        join(process.cwd(), 'node_modules', '@claude-flow'),
      ],
      flags: {
        ui: {
          type: 'boolean',
          description: 'Launch interactive UI',
        },
        dryRun: {
          type: 'boolean',
          description: 'Show what would be done without executing',
        },
        timeout: {
          type: 'number',
          description: 'Command timeout in milliseconds',
        },
      },
      setupErrorHandlers: true,
      colors: true,
      helpOnEmpty: true,
    });
    
    // Register built-in commands
    registerCommands(app);
    
    // Handle special UI flag before normal processing
    const args = process.argv.slice(2);
    if (args.includes('--ui')) {
      logger.info('Launching interactive UI...');
      // TODO: Implement TUI mode
      logger.warn('TUI mode not yet implemented');
      return;
    }
    
    // Set up application event handlers
    app.on('initialized', () => {
      logger.info('CLI application initialized');
    });
    
    app.on('command-start', ({ name }) => {
      logger.debug(`Executing command: ${name}`);
    });
    
    app.on('command-complete', ({ name, result }) => {
      logger.debug(`Command '${name}' completed in ${result.executionTime}ms`);
    });
    
    app.on('command-error', ({ name, error }) => {
      logger.error(`Command '${name}' failed:`, error.message);
    });
    
    // Run the application
    const exitCode = await app.run(process.argv.slice(2));
    
    // Clean shutdown
    await app.shutdown();
    
    // Dispose services
    const { serviceRegistry } = await import('./services/index.js');
    await serviceRegistry.dispose();
    
    process.exit(exitCode);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Fatal error in CLI application:', errorMessage);
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }
    
    // Try to clean up services on error
    try {
      const { serviceRegistry } = await import('./services/index.js');
      await serviceRegistry.dispose();
    } catch (cleanupError) {
      logger.error('Error during cleanup:', cleanupError);
    }
    
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions and rejections
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown on SIGINT and SIGTERM
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  try {
    const { serviceRegistry } = await import('./services/index.js');
    await serviceRegistry.dispose();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  try {
    const { serviceRegistry } = await import('./services/index.js');
    await serviceRegistry.dispose();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error('❌ CLI startup error:', error);
  process.exit(1);
});