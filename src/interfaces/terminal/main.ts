#!/usr/bin/env node
/**
 * @fileoverview Main Terminal Interface Entry Point
 *
 * This is the main entry point for the Claude-Zen terminal interface.
 * It gets called by the CLI binary and launches the appropriate terminal interface.
 */

import { detectModeWithReason, launchTerminalInterface } from './index';

/**
 * Main entry point for terminal interface
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const commands = args.filter((arg) => !arg.startsWith('-'));
    const flags = parseFlags(args);

    // Detect terminal mode with debugging
    const modeResult = detectModeWithReason(commands, flags);

    if (flags.verbose || flags.debug) {
    }

    // Launch the terminal interface
    await launchTerminalInterface({
      mode: flags.mode || modeResult.mode,
      theme: flags.theme || 'dark',
      verbose: flags.verbose || false,
      autoRefresh: !flags['no-refresh'],
      refreshInterval:
        typeof flags['refresh-interval'] === 'number'
          ? flags['refresh-interval']
          : (typeof flags['refresh-interval'] === 'string'
              ? parseInt(flags['refresh-interval'])
              : 3000) || 3000,
    });
  } catch (error) {
    console.error('❌ Failed to launch terminal interface:', error);
    process.exit(1);
  }
}

/**
 * Terminal interface flag values
 */
interface TerminalFlags {
  // Mode flags
  mode?: 'auto' | 'command' | 'interactive';
  ui?: boolean;
  tui?: boolean;
  interactive?: boolean;
  i?: boolean;

  // Appearance flags
  theme?: 'dark' | 'light';

  // Behavior flags
  verbose?: boolean;
  debug?: boolean;
  'no-refresh'?: boolean;
  'refresh-interval'?: string | number;

  // Special flags
  version?: boolean;
  v?: boolean;
  help?: boolean;
  h?: boolean;
  web?: boolean;
  port?: string | number;

  // Additional string or boolean flags
  [key: string]: string | number | boolean | undefined;
}

/**
 * Parse command line flags into typed object
 */
function parseFlags(args: string[]): TerminalFlags {
  const flags: TerminalFlags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        // Handle special types
        if (key === 'refresh-interval') {
          const parsed = parseInt(nextArg);
          flags[key] = Number.isNaN(parsed) ? 3000 : parsed;
        } else if (key === 'port') {
          const parsed = parseInt(nextArg);
          flags[key] = Number.isNaN(parsed) ? nextArg : parsed;
        } else {
          flags[key] = nextArg;
        }
        i++; // Skip next arg
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const key = arg.slice(1);
      flags[key] = true;
    }
  }

  return flags;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Launch if called directly (compatible with CommonJS and ESM)
const isMainModule = process.argv[1]?.endsWith('main.js') || process.argv[1]?.endsWith('main.ts');
if (isMainModule) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { main };
export default main;
