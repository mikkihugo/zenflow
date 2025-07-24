/**
 * @fileoverview Hive Mind Command Interface Module
 * Handles help display, command routing, and argument parsing
 * @module HiveMindCommandInterface
 */

import chalk from 'chalk';
import { HelpFormatter } from '../../help-formatter.js';
import { parseFlags, normalizeFlags, applySmartDefaults, validateFlags } from '../../utils.js';

/**
 * Display comprehensive help for hive mind system
 */
export function showHiveMindHelp() {
  console.log(`
${chalk.yellow('🧠 Claude Flow Hive Mind System')}

${chalk.bold('USAGE:')}
  claude-zen hive-mind [subcommand] [options]

${chalk.bold('SUBCOMMANDS:')}
  ${chalk.green('init')}         Initialize hive mind system
  ${chalk.green('spawn')}        Spawn hive mind swarm for a task
  ${chalk.green('status')}       Show hive mind status
  ${chalk.green('resume')}       Resume a paused hive mind session
  ${chalk.green('stop')}         Stop a running hive mind session
  ${chalk.green('sessions')}     List all hive mind sessions
  ${chalk.green('consensus')}    View consensus decisions
  ${chalk.green('memory')}       Manage collective memory
  ${chalk.green('metrics')}      View performance metrics
  ${chalk.green('wizard')}       Interactive hive mind wizard

${chalk.bold('EXAMPLES:')}
  ${chalk.gray('# Initialize hive mind')}
  claude-zen hive-mind init

  ${chalk.gray('# Spawn swarm with interactive wizard')}
  claude-zen hive-mind spawn

  ${chalk.gray('# Quick spawn with objective')}
  claude-zen hive-mind spawn "Build a scalable application"

  ${chalk.gray('# View current status')}
  claude-zen hive-mind status

  ${chalk.gray('# Interactive wizard')}
  claude-zen hive-mind wizard

${chalk.bold('KEY FEATURES:')}
  ${chalk.cyan('🐝')} Queen-led coordination with worker specialization
  ${chalk.cyan('🧠')} Collective memory and knowledge sharing
  ${chalk.cyan('🤝')} Consensus building for critical decisions
  ${chalk.cyan('⚡')} Parallel task execution with auto-scaling
  ${chalk.cyan('🔄')} Work stealing and load balancing
  ${chalk.cyan('📊')} Real-time metrics and performance tracking

${chalk.bold('OPTIONS:')}
  --queen-type <type>    Queen coordinator type (strategic, tactical, adaptive)
  --workers <count>      Number of worker agents (1-32)
  --claude               Enable Claude Code coordination
  --auto-spawn           Auto-spawn Claude Code instances
  --verbose              Detailed output
  --non-interactive      Disable interactive prompts
  --session-dir <path>   Custom session directory
  --memory-limit <mb>    Memory limit per agent
  --timeout <ms>         Operation timeout
`);
}

/**
 * Parse and validate hive mind command arguments
 * @param {string[]} args - Command arguments
 * @param {Object} rawFlags - Raw command flags
 * @returns {Object} Parsed arguments and flags
 */
export function parseHiveMindArgs(args, rawFlags) {
  const flags = parseFlags(rawFlags);
  const normalizedFlags = normalizeFlags(flags);
  const flagsWithDefaults = applySmartDefaults(normalizedFlags, {
    workers: 4,
    queenType: 'strategic',
    timeout: 30000,
    sessionDir: './.claude/hive-mind',
    memoryLimit: 512,
    verbose: false,
    claude: false,
    autoSpawn: false,
    nonInteractive: false
  });

  // Validate flags
  const validationErrors = validateFlags(flagsWithDefaults, {
    workers: { type: 'number', min: 1, max: 32 },
    queenType: { type: 'string', values: ['strategic', 'tactical', 'adaptive'] },
    timeout: { type: 'number', min: 1000, max: 300000 },
    memoryLimit: { type: 'number', min: 64, max: 4096 }
  });

  if (validationErrors.length > 0) {
    throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
  }

  return {
    args,
    flags: flagsWithDefaults,
    subcommand: args[0] || 'help'
  };
}

/**
 * Route command to appropriate handler
 * @param {string} subcommand - The subcommand to execute
 * @param {string[]} args - Remaining arguments
 * @param {Object} flags - Parsed flags
 * @returns {Promise<Function>} Command handler function
 */
export async function routeHiveMindCommand(subcommand, args, flags) {
  const handlers = {
    help: () => showHiveMindHelp(),
    init: () => import('./initialization.js').then(m => m.initHiveMind(flags)),
    spawn: () => import('./swarm-management.js').then(m => m.spawnSwarm(args.slice(1), flags)),
    status: () => import('./swarm-management.js').then(m => m.showStatus(flags)),
    resume: () => import('./session-management.js').then(m => m.resumeSession(args.slice(1), flags)),
    stop: () => import('./swarm-management.js').then(m => m.stopSession(args.slice(1), flags)),
    sessions: () => import('./session-management.js').then(m => m.showSessions(flags)),
    consensus: () => import('./metrics-monitoring.js').then(m => m.showConsensus(flags)),
    memory: () => import('./memory-management.js').then(m => m.manageMemoryWizard()),
    metrics: () => import('./metrics-monitoring.js').then(m => m.showMetrics(flags)),
    wizard: () => import('./swarm-management.js').then(m => m.spawnSwarmWizard())
  };

  const handler = handlers[subcommand];
  if (!handler) {
    throw new Error(`Unknown subcommand: ${subcommand}`);
  }

  return handler;
}

/**
 * Display command usage for specific subcommand
 * @param {string} subcommand - Subcommand to show usage for
 */
export function showSubcommandUsage(subcommand) {
  const formatter = new HelpFormatter();
  
  const usageInfo = {
    init: {
      description: 'Initialize hive mind system with SQLite database and configuration',
      usage: 'claude-zen hive-mind init [options]',
      options: [
        '--session-dir <path>   Custom session directory (default: ./.claude/hive-mind)',
        '--force                Force reinitialize existing setup',
        '--verbose              Show detailed initialization steps'
      ]
    },
    spawn: {
      description: 'Spawn a hive mind swarm for collaborative task execution',
      usage: 'claude-zen hive-mind spawn [objective] [options]',
      options: [
        '--workers <count>      Number of worker agents (1-32, default: 4)',
        '--queen-type <type>    Queen coordinator type (strategic/tactical/adaptive)',
        '--claude               Enable Claude Code coordination',
        '--auto-spawn           Auto-spawn Claude Code instances',
        '--timeout <ms>         Operation timeout (default: 30000)'
      ]
    },
    memory: {
      description: 'Manage collective memory storage and retrieval',
      usage: 'claude-zen hive-mind memory [action] [options]',
      options: [
        '--action <type>        Memory action (list/search/store/clean/export)',
        '--key <key>            Memory key for specific operations',
        '--value <value>        Memory value for store operations',
        '--limit <count>        Limit results (default: 20)'
      ]
    }
  };

  const info = usageInfo[subcommand];
  if (info) {
    formatter.displayUsage(info.usage, info.description, info.options);
  } else {
    console.log(chalk.red(`No usage information available for: ${subcommand}`));
  }
}