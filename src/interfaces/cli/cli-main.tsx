#!/usr/bin/env node

/**
 * React CLI Main Entry Point
 * 
 * Modern CLI using React/Ink for rich terminal interfaces.
 * Replaces the traditional CLI with interactive components.
 */

import { render } from 'ink';
import React from 'react';
import { App } from './app';
import { createSimpleLogger } from './simple-logger.js';

const logger = createSimpleLogger('ReactCLI');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const flags: Record<string, any> = {};
  const commands: string[] = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('-')) {
        flags[key] = nextArg;
        i++; // Skip next arg
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      flags[key] = true;
    } else {
      commands.push(arg);
    }
  }
  
  return { commands, flags };
}

/**
 * Handle version flag
 */
function handleVersion() {
  try {
    const packageJson = require('../../../package.json');
    console.log(`v${packageJson.version}`);
    process.exit(0);
  } catch {
    console.log('v2.0.0-alpha.73');
    process.exit(0);
  }
}

/**
 * Handle help flag
 */
function handleHelp() {
  console.log(`
🧠 Claude Code Zen - React CLI v2.0.0-alpha.73

USAGE:
  claude-zen [command] [options]

COMMANDS:
  init [name]           Initialize a new project
  status               Show system status  
  swarm <action>       Manage swarms (start, stop, list)
  mcp <action>         MCP server operations
  help                 Show this help message

OPTIONS:
  --interactive, -i    Force interactive mode
  --ui                 Launch Terminal UI
  --web                Launch Web interface
  --version, -v        Show version
  --help, -h           Show help
  --verbose            Enable verbose logging
  --theme <theme>      Set UI theme (dark, light)

EXAMPLES:
  claude-zen                          # Interactive mode
  claude-zen init my-project          # Initialize project
  claude-zen status                   # Show status
  claude-zen swarm start              # Start swarm
  claude-zen --ui                     # Launch TUI
  claude-zen --web                    # Launch web interface

INTERFACE MODES:
  🖥️  CLI: Command line interface (default)
  📱 TUI: Terminal UI with real-time updates  
  🌐 Web: Browser-based dashboard

For more information, visit: https://github.com/ruvnet/claude-code-flow
`);
  process.exit(0);
}

/**
 * Main CLI application
 */
async function main() {
  try {
    const { commands, flags } = parseArgs();
    
    // Handle special flags
    if (flags.version || flags.v) {
      handleVersion();
    }
    
    if (flags.help || flags.h) {
      handleHelp();
    }
    
    // Check for interface mode flags
    if (flags.ui) {
      // Launch TUI interface
      const { launchInterface } = await import('../../core/unified-interface-launcher.js');
      await launchInterface({ preferredMode: 'tui', verbose: flags.verbose });
      return;
    }
    
    if (flags.web) {
      // Launch Web interface
      const { launchInterface } = await import('../../core/unified-interface-launcher.js');
      await launchInterface({ preferredMode: 'web', webPort: flags.port || 3456, verbose: flags.verbose });
      return;
    }
    
    // Determine if we should run in interactive mode
    const isInteractive = flags.interactive || flags.i || (commands.length === 0 && process.stdin.isTTY);
    
    logger.debug(`CLI Mode: ${isInteractive ? 'Interactive' : 'Command'}`);
    logger.debug(`Commands: ${commands.join(' ')}`);
    logger.debug(`Flags:`, flags);
    
    // Render React CLI App
    const { unmount } = render(
      <App 
        commands={commands}
        flags={flags}
        interactive={isInteractive}
        onExit={(code) => process.exit(code)}
      />
    );
    
    // Handle graceful shutdown
    const shutdown = (signal: string) => {
      logger.debug(`Received ${signal}, shutting down...`);
      unmount();
      process.exit(0);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
  } catch (error) {
    logger.error('CLI Error:', error);
    console.error('❌ CLI Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Error handling
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error('❌ CLI startup error:', error);
  process.exit(1);
});