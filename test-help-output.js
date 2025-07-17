#!/usr/bin/env node
/**
 * Test script for standardized help output
 */

import { HelpFormatter } from './src/cli/help-formatter.js';
import { ValidationHelper } from './src/cli/validation-helper.js';

console.log('Testing Claude Flow Standardized Help Output\n');
console.log('='.repeat(70));

// Test 1: Main help output
console.log('\n1. MAIN HELP OUTPUT:');
console.log('-'.repeat(50));

const mainHelp = {
  name: 'claude-flow',
  description: 'Advanced AI agent orchestration system',
  usage: `claude-flow <command> [<args>] [options]
    claude-flow <command> --help
    claude-flow --version`,
  commands: [
    { name: 'hive-mind', description: 'Manage hive mind swarm intelligence' },
    { name: 'init', description: 'Initialize Claude Flow configuration' },
    { name: 'start', description: 'Start orchestration system' },
    { name: 'swarm', description: 'Execute multi-agent swarm coordination' },
    { name: 'agent', description: 'Manage individual agents' },
    { name: 'status', description: 'Show system status and health' }
  ],
  globalOptions: [
    {
      flags: '--config <path>',
      description: 'Configuration file path',
      defaultValue: '.claude/config.json'
    },
    {
      flags: '--verbose',
      description: 'Enable verbose output'
    },
    {
      flags: '--json',
      description: 'Output in JSON format'
    },
    {
      flags: '--help',
      description: 'Show help information'
    }
  ],
  examples: [
    'claude-flow init --sparc',
    'claude-flow hive-mind wizard',
    'claude-flow swarm "Build REST API"'
  ]
};

console.log(HelpFormatter.formatHelp(mainHelp));

// Test 2: Command-specific help
console.log('\n\n2. COMMAND-SPECIFIC HELP (hive-mind):');
console.log('-'.repeat(50));

const hiveMindHelp = {
  name: 'claude-flow hive-mind',
  description: 'Manage hive mind swarm intelligence',
  usage: 'claude-flow hive-mind <subcommand> [options]',
  commands: [
    { name: 'init', description: 'Initialize hive mind system' },
    { name: 'spawn', description: 'Create intelligent swarm with objective' },
    { name: 'status', description: 'View active swarms and metrics' },
    { name: 'stop', description: 'Stop a running swarm' },
    { name: 'wizard', description: 'Interactive setup wizard' }
  ],
  options: [
    {
      flags: '--queen-type <type>',
      description: 'Queen coordination type',
      defaultValue: 'adaptive',
      validValues: ['strategic', 'tactical', 'adaptive']
    },
    {
      flags: '--workers <count>',
      description: 'Number of worker agents',
      defaultValue: '5'
    },
    {
      flags: '--no-consensus',
      description: 'Disable consensus requirements'
    }
  ],
  examples: [
    'claude-flow hive-mind spawn "Build REST API" --queen-type strategic',
    'claude-flow hive-mind status --json'
  ]
};

console.log(HelpFormatter.formatHelp(hiveMindHelp));

// Test 3: Error messages
console.log('\n\n3. ERROR MESSAGE FORMATS:');
console.log('-'.repeat(50));

// Test basic error
console.log('\na) Basic error:');
console.log(HelpFormatter.formatError(
  'Connection refused on port 3000',
  'claude-flow start',
  'claude-flow start [options]'
));

// Test validation error
console.log('\nb) Validation error:');
console.log(HelpFormatter.formatValidationError(
  'monarch',
  'queen-type',
  ['strategic', 'tactical', 'adaptive'],
  'claude-flow hive-mind spawn'
));

// Test 4: Format stripping
console.log('\n\n4. FORMAT STRIPPING TEST:');
console.log('-'.repeat(50));

const emojiText = '🌊 Claude-Flow v2.0.0 🚀 - Enterprise-Grade AI Agent Orchestration Platform 🎯';
const cleanText = HelpFormatter.stripFormatting(emojiText);
console.log('Original:', emojiText);
console.log('Cleaned: ', cleanText);

console.log('\n' + '='.repeat(70));
console.log('Test completed successfully!');