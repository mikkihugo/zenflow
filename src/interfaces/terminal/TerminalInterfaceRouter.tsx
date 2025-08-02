#!/usr/bin/env node

/**
 * Terminal Interface Router - Google Standard Entry Point
 *
 * Routes between different terminal interface modes based on context.
 * Single responsibility: mode detection and component routing.
 * Renamed from main.tsx to reflect actual responsibility.
 */

import { render } from 'ink';
import type React from 'react';
import { CommandExecutionRenderer } from './CommandExecutionRenderer.js';
import { InteractiveTerminalApplication } from './InteractiveTerminalApplication.js';
import { createSimpleLogger } from './utils/logger.js';
import { detectMode } from './utils/mode-detector.js';

const logger = createSimpleLogger('TerminalInterface');

export interface TerminalAppProps {
  commands: string[];
  flags: Record<string, any>;
  onExit: (code: number) => void;
}

/**
 * Main Terminal App - Routes to command execution or interactive terminal interface
 */
export const TerminalApp: React.FC<TerminalAppProps> = ({ commands, flags, onExit }) => {
  const mode = detectMode(commands, flags);

  logger.debug(`Terminal mode detected: ${mode}`);

  switch (mode) {
    case 'command':
      return <CommandExecutionRenderer commands={commands} flags={flags} onExit={onExit} />;

    case 'interactive':
      return <InteractiveTerminalApplication flags={flags} onExit={onExit} />;

    default:
      // Fallback to command execution mode
      return <CommandExecutionRenderer commands={commands} flags={flags} onExit={onExit} />;
  }
};

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
async function handleVersion() {
  try {
    const { readFile } = await import('fs/promises');
    const packageData = await readFile('package.json', 'utf-8');
    const packageJson = JSON.parse(packageData);
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
🧠 Claude Code Zen - Unified Terminal Interface v2.0.0-alpha.73

USAGE:
  claude-zen [command] [options]

MODES:
  📱 Interactive Terminal: claude-zen --ui (or claude-zen with no commands)
  🖥️  Command Execution: claude-zen <command> [args]

COMMANDS:
  init [name]           Initialize a new project
  status               Show system status  
  swarm <action>       Manage swarms (start, stop, list)
  mcp <action>         MCP server operations
  workspace <action>   Document-driven development workflow
  help                 Show this help message

OPTIONS:
  --ui, --tui          Force interactive TUI mode
  --interactive, -i    Force interactive mode
  --web                Launch Web interface
  --version, -v        Show version
  --help, -h           Show help
  --verbose            Enable verbose logging
  --theme <theme>      Set UI theme (dark, light)

EXAMPLES:
  claude-zen                          # Interactive terminal interface
  claude-zen --ui                     # Force interactive mode
  claude-zen init my-project          # Command execution mode
  claude-zen status --json            # Command with formatted output
  claude-zen swarm start --topology mesh  # Command with options

INTERFACE MODES:
  🖥️  Command Execution: Non-interactive command execution
  📱 Interactive Terminal: Terminal UI with real-time updates
  🌐 Web: Browser-based dashboard (claude-zen --web)

UNIFIED PORT STRUCTURE (Port 3000):
  🌐 Web Dashboard: http://localhost:3000/web
  🔗 API Endpoints: http://localhost:3000/api/*
  📡 MCP Protocol: http://localhost:3000/mcp

For more information, visit: https://github.com/ruvnet/claude-zen-flow
`);
  process.exit(0);
}

/**
 * Main terminal application entry point
 */
async function main() {
  try {
    const { commands, flags } = parseArgs();

    // Handle special flags first
    if (flags.version || flags.v) {
      await handleVersion();
    }

    if (flags.help || flags.h) {
      handleHelp();
    }

    // Check for web interface mode
    if (flags.web) {
      const { launchInterface } = await import('../../core/unified-interface-launcher.js');
      await launchInterface({
        preferredMode: 'web',
        webPort: flags.port || 3000,
        verbose: flags.verbose,
      });
      return;
    }

    logger.debug(`Commands: ${commands.join(' ')}`);
    logger.debug(`Flags:`, flags);

    // Render unified terminal app
    const { unmount } = render(
      <TerminalApp commands={commands} flags={flags} onExit={(code) => process.exit(code)} />
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
    logger.error('Terminal interface error:', error);
    console.error('❌ Terminal interface error:', error instanceof Error ? error.message : error);
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

// Start the application if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Terminal startup error:', error);
    process.exit(1);
  });
}
