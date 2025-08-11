#!/usr/bin/env node
/**
 * @file Interface implementation: terminal-interface-router.
 */

/**
 * Terminal Interface Router - Google Standard Entry Point.
 *
 * Routes between different terminal interface modes based on context.
 * Single responsibility: mode detection and component routing.
 * Renamed from main.tsx to reflect actual responsibility.
 */

import { render } from 'ink';
import React from 'react';
import { CommandExecutionRenderer } from './command-execution-renderer.js';
import { InteractiveTerminalApplication } from './interactive-terminal-application.js';
import { createSimpleLogger } from './utils/logger.js';
import { detectMode } from './utils/mode-detector.js';

const logger = createSimpleLogger('TerminalInterface');

export interface TerminalAppProps {
  commands: string[];
  flags: Record<string, any>;
  onExit: (code: number) => void;
}

/**
 * Main Terminal App - Routes to command execution or interactive terminal interface.
 * Enhanced with Advanced CLI capabilities for AI-powered project management.
 *
 * @param root0
 * @param root0.commands
 * @param root0.flags
 * @param root0.onExit
 */
export const TerminalApp: React.FC<TerminalAppProps> = ({
  commands,
  flags,
  onExit,
}) => {
  const mode = detectMode(commands, flags);

  logger.debug(`Terminal mode detected: ${mode}`);

  switch (mode) {
    case 'command':
      return (
        <CommandExecutionRenderer
          commands={commands}
          flags={flags}
          onExit={onExit}
        />
      );

    case 'interactive':
      return (
        <InteractiveTerminalApplication
          flags={flags}
          onExit={onExit}
        />
      );

    default:
      // Fallback to command execution mode
      return (
        <CommandExecutionRenderer
          commands={commands}
          flags={flags}
          onExit={onExit}
        />
      );
  }
};

/**
 * Parse command line arguments.
 *
 * @example
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const flags: Record<string, any> = {};
  const commands: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg && arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        flags[key] = nextArg;
        i++; // Skip next arg
      } else {
        flags[key] = true;
      }
    } else if (arg && arg.startsWith('-')) {
      const key = arg.slice(1);
      flags[key] = true;
    } else if (arg) {
      commands.push(arg);
    }
  }

  return { commands, flags };
}

/**
 * Handle version flag.
 *
 * @example
 */
async function handleVersion() {
  try {
    const { readFile } = await import('node:fs/promises');
    const packageData = await readFile('package.json', 'utf-8');
    const _packageJson = JSON.parse(packageData);
    process.exit(0);
  } catch {
    process.exit(0);
  }
}

/**
 * Handle help flag.
 *
 * @example
 */
function handleHelp() {
  process.exit(0);
}

/**
 * Main terminal application entry point.
 *
 * @example
 */
async function main() {
  try {
    const { commands, flags } = parseArgs();

    // Handle special flags first
    if (flags['version'] || flags['v']) {
      await handleVersion();
    }

    if (flags['help'] || flags['h']) {
      handleHelp();
    }

    // Check for web interface mode
    if (flags['web']) {
      const { launchInterface } = await import(
        '../../core/interface-launcher.js'
      );
      await launchInterface({
        preferredMode: 'web',
        webPort: flags['port'] || 3000,
        verbose: flags['verbose'],
      });
      return;
    }

    logger.debug(`Commands: ${commands.join(' ')}`);
    logger.debug(`Flags:`, flags);

    // Render unified terminal app
    const { unmount } = render(
      <TerminalApp
        commands={commands}
        flags={flags}
        onExit={(code) => process.exit(code)}
      />,
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
    console.error(
      '❌ Terminal interface error:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

/**
 * Error handling.
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
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
