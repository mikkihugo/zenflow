#!/usr/bin/env node
/**
 * @file Main Terminal Interface Entry Point.
 *
 * This is the main entry point for the Claude-Zen terminal interface.
 * It gets called by the CLI binary and launches the appropriate terminal interface.
 */
import { getLogger } from '../../config/logging-config.ts';
import { detectModeWithReason, launchTerminalInterface } from './index.ts';
import {
  detectTerminalEnvironment,
  generateEnvironmentReport,
  checkRawModeSupport,
} from './utils/terminal-environment-detector.ts';

const logger = getLogger('interfaces-terminal-main');

/**
 * Main entry point for terminal interface.
 *
 * @example
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const commands = args.filter((arg) => !arg.startsWith('-'));
    const flags = parseFlags(args);

    // Enhanced terminal environment detection
    const terminalDetection = detectTerminalEnvironment();
    const rawModeCheck = checkRawModeSupport();

    // Show environment report for verbose/debug mode
    if (flags.verbose || flags.debug) {
      console.log(generateEnvironmentReport());
      console.log(''); // Empty line
    }

    // Check if TUI can be safely launched
    if (!terminalDetection.supported) {
      console.log('⚠️ TUI interface cannot be launched in current environment:');
      terminalDetection.issues.forEach((issue) => console.log(`  • ${issue}`));

      if (terminalDetection.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        terminalDetection.recommendations.forEach((rec) =>
          console.log(`  • ${rec}`)
        );
      }

      if (terminalDetection.fallbackOptions.length > 0) {
        console.log('\n🔄 Alternative options:');
        terminalDetection.fallbackOptions.forEach((option) =>
          console.log(`  • ${option}`)
        );
      }

      // Exit gracefully instead of crashing
      logger.warn('TUI not supported, exiting gracefully');
      process.exit(1);
    }

    // Additional raw mode verification if needed
    if (!rawModeCheck.supported && rawModeCheck.canTest) {
      console.log(`⚠️ Raw mode verification failed: ${rawModeCheck.error}`);
      console.log('Attempting to continue with limited functionality...');
    }

    // Detect terminal mode with debugging
    const modeResult = detectModeWithReason(commands, flags);

    if (flags.verbose || flags.debug) {
      logger.info('Terminal detection result:', {
        supported: terminalDetection.supported,
        issues: terminalDetection.issues,
        rawModeSupported: rawModeCheck.supported,
      });
    }

    // Launch the terminal interface using Ink (like Claude CLI does)
    logger.info('🚀 Launching Ink-based terminal interface...');

    // Launch the terminal interface - default to interactive mode
    await launchTerminalInterface({
      mode: flags.mode || modeResult?.mode || 'interactive',
      theme: flags.theme || 'dark',
      verbose: flags.verbose,
      autoRefresh: !flags['no-refresh'],
      refreshInterval:
        typeof flags['refresh-interval'] === 'number'
          ? flags['refresh-interval']
          : (typeof flags['refresh-interval'] === 'string'
              ? Number.parseInt(flags['refresh-interval'])
              : 3000) || 3000,
    });
  } catch (error) {
    logger.error('❌ Failed to launch terminal interface:', error);

    // Enhanced error reporting
    if (error instanceof Error) {
      logger.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: flags.verbose
          ? error.stack
          : error.stack?.split('\n').slice(0, 3).join('\n'),
      });
    }

    process.exit(1);
  }
}

/**
 * Terminal interface flag values.
 *
 * @example
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
 * Parse command line flags into typed object.
 *
 * @param args
 * @example
 */
function parseFlags(args: string[]): TerminalFlags {
  const flags: TerminalFlags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg && arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        // Handle special types
        if (key === 'refresh-interval') {
          const parsed = Number.parseInt(nextArg);
          flags[key] = Number.isNaN(parsed) ? 3000 : parsed;
        } else if (key === 'port') {
          const parsed = Number.parseInt(nextArg);
          flags[key] = Number.isNaN(parsed) ? nextArg : parsed;
        } else {
          flags[key] = nextArg;
        }
        i++; // Skip next arg
      } else {
        flags[key] = true;
      }
    } else if (arg && arg.startsWith('-') && arg.length > 1) {
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
const isMainModule =
  process.argv[1]?.endsWith('main.js') || process.argv[1]?.endsWith('main.ts');
if (isMainModule) {
  main().catch((error) => {
    logger.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { main };
export default main;
