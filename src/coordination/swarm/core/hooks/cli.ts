#!/usr/bin/env node
/**
 * @file Coordination system: cli.
 */

import { getLogger } from '../../../config/logging-config';

const logger = getLogger('coordination-swarm-core-hooks-cli');

/**
 * CLI handler for ruv-swarm hooks.
 * Usage: npx ruv-swarm hook <type> [options].
 */

import { handleHook } from './index.ts';

async function main() {
  const args = process.argv.slice(2);

  // Skip if not a hook command
  if (args[0] !== 'hook') {
    return;
  }

  const [, hookType] = args;
  const options = parseArgs(args.slice(2));

  if (!hookType) {
    logger.error('Hook type is required');
    process.exit(1);
  }

  try {
    const result = await handleHook(hookType, options);

    // Exit with appropriate code
    if (result?.continue === false) {
      process.exit(2); // Blocking error
    } else {
      process.exit(0); // Success
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(
      JSON.stringify({
        continue: true,
        error: errorMessage,
        stack: process.env['DEBUG'] ? errorStack : undefined,
      })
    );
    process.exit(1); // Non-blocking error
  }
}

function parseArgs(args: string[]): any {
  const options: any = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg) continue; // Skip undefined/null args

    if (arg.startsWith('--')) {
      const key = arg.substring(2);

      // Check if next arg is a value or another flag
      const nextArg = args[i + 1];
      if (nextArg != null && !nextArg.startsWith('--')) {
        // Next arg is the value
        options[toCamelCase(key)] = nextArg;
        i++; // Skip the value in next iteration
      } else {
        // Boolean flag
        options[toCamelCase(key)] = true;
      }
    } else if (!args[i - 1]?.startsWith('--')) {
      // Positional argument
      if (!options?._) {
        options._ = [];
      }
      options?._?.push(arg);
    }
  }

  return options;
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1]?.toUpperCase() ?? '');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
