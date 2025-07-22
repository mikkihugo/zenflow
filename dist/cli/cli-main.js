#!/usr/bin/env node
/**
 * Simple CLI wrapper for Claude-Zen (JavaScript version)
 * This version avoids TypeScript issues in node_modules
 */

import {
  executeCommand,
  hasCommand,
  showCommandHelp,
  showAllCommands,
  listCommands,
} from './command-registry.js';
import { parseFlags } from './utils.js';
import { spawn } from 'child_process';
import process from 'process';
import { promises as fs } from 'fs';
import readline from 'readline';
import { getMainHelp, getCommandHelp, getStandardizedCommandHelp } from './help-text.js';

const VERSION = '2.0.0-alpha.67';

function printHelp(plain = false) {
  console.log(getMainHelp(plain));
}

function printCommandHelp(command) {
  // Try standardized help first
  const standardCommands = ['agent', 'memory'];
  if (standardCommands.includes(command)) {
    const help = getStandardizedCommandHelp(command);
    console.log(help);
  } else {
    const help = getCommandHelp(command);
    console.log(help);
  }
}

// Legacy help function for backward compatibility
function printLegacyHelp() {
  console.log(`
🌊 Claude-Zen v${VERSION} - Enterprise-Grade AI Agent Orchestration Platform

🎯 ENTERPRISE FEATURES: Complete ruv-swarm integration with 27 MCP tools, neural networking, and production-ready infrastructure

USAGE:
  claude-zen <command> [options]

🚀 INSTALLATION & ENTERPRISE SETUP:
  npx claude-zen@2.0.0 init  # Enterprise + ruv-swarm integration
  
  Enterprise features include:
  • Complete ruv-swarm integration with 27 MCP tools
  • Neural network processing with WASM optimization
  • Multi-agent coordination (hierarchical, mesh, ring, star topologies)
  • Cross-session memory and persistent learning
  • GitHub workflow automation (6 specialized modes)
  • Production-ready Docker infrastructure
  • Enterprise security and compliance features

🧠 SWARM INTELLIGENCE COMMANDS (v2.0.0):
  swarm "objective" [--strategy] [--mode] [--max-agents N] [--parallel] [--monitor]
    --strategy: research, development, analysis, testing, optimization, maintenance
    --mode: centralized, distributed, hierarchical, mesh, hybrid
    --parallel: Enable parallel execution (2.8-4.4x speed improvement)
    --monitor: Real-time swarm monitoring and performance tracking

🐙 GITHUB WORKFLOW AUTOMATION (v2.0.0):
  github gh-coordinator        # GitHub workflow orchestration and coordination
  github pr-manager           # Pull request management with multi-reviewer coordination
  github issue-tracker        # Issue management and project coordination
  github release-manager      # Release coordination and deployment pipelines
  github repo-architect       # Repository structure optimization
  github sync-coordinator     # Multi-package synchronization and version alignment

🏗️ CORE ENTERPRISE COMMANDS:
  init                        # Initialize with enterprise environment + ruv-swarm
  start [--ui] [--swarm]      # Start orchestration with swarm intelligence
  spawn <type> [--name]       # Create AI agent with swarm coordination
  agent <subcommand>          # Advanced agent management with neural patterns
  workflow <subcommand>       # Advanced workflow modes with neural enhancement
  memory <subcommand>         # Cross-session persistent memory with neural learning
  status                      # Comprehensive system status with performance metrics

🤖 NEURAL AGENT TYPES (ruv-swarm Integration):
  researcher     # Research with web access and data analysis
  coder          # Code development with neural patterns
  analyst        # Performance analysis and optimization
  architect      # System design with enterprise patterns
  tester         # Comprehensive testing with automation
  coordinator    # Multi-agent orchestration and workflow management
  reviewer       # Code review with security and quality checks
  optimizer      # Performance optimization and bottleneck analysis

🎮 ENTERPRISE QUICK START:
  # Initialize enterprise environment
  npx claude-zen@2.0.0 init
  
  # Start enterprise orchestration with swarm intelligence
  ./claude-zen start --ui --swarm
  
  # Deploy intelligent multi-agent development workflow
  ./claude-zen swarm "build enterprise API" --strategy development --parallel --monitor
  
  # GitHub workflow automation
  ./claude-zen github pr-manager "coordinate release with automated testing"
  
  # Neural memory management
  ./claude-zen memory store "architecture" "microservices with API gateway pattern"
  
  # Real-time system monitoring
  ./claude-zen status --verbose

🏢 ENTERPRISE COMMAND CATEGORIES:
  Core Intelligence:    swarm, agent, memory, neural
  GitHub Automation:    github (6 specialized modes)
  Development:          init, start, status, config, workflow
  Infrastructure:       mcp, terminal, session, docker
  Enterprise:           project, deploy, cloud, security, analytics, audit

🧠 NEURAL NETWORK FEATURES (v2.0.0):
  • WASM-powered cognitive patterns with SIMD optimization
  • 27 MCP tools for comprehensive workflow automation
  • Cross-session learning and adaptation
  • Real-time performance monitoring (sub-10ms response times)
  • 32.3% token usage reduction through intelligent coordination
  • Self-healing workflows with automatic error recovery

📊 ENTERPRISE PERFORMANCE METRICS:
  • 84.8% SWE-Bench solve rate through coordinated intelligence
  • 2.8-4.4x speed improvement with parallel execution
  • 60% Docker build performance improvement
  • 100% test success rate with comprehensive validation
  • Sub-10ms MCP response times

🔗 INTEGRATION & COMPATIBILITY:
  • Node.js 20+ optimization for enterprise environments
  • Complete Claude Code integration with enhanced capabilities
  • Multi-platform support (Windows, macOS, Linux)
  • Enterprise security with access control and audit logging
  • Cross-package synchronization and dependency management

GET DETAILED HELP:
  claude-zen help <command>           # Command-specific enterprise documentation
  claude-zen <command> --help         # Alternative help syntax
  
  Examples:
    claude-zen help swarm             # Swarm intelligence coordination
    claude-zen help github            # GitHub workflow automation
    claude-zen help neural            # Neural network processing
    claude-zen help enterprise        # Enterprise features and compliance

COMMON OPTIONS:
  --verbose, -v                        Enable detailed output with performance metrics
  --help                               Show command help with enterprise features
  --config <path>                      Use custom enterprise configuration
  --parallel                           Enable parallel execution (default for swarms)
  --monitor                            Real-time monitoring and performance tracking

📚 Documentation: https://github.com/ruvnet/claude-code-flow
🐝 ruv-swarm: https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm

🚀 Enterprise-Grade AI Agent Orchestration - Built with ❤️ by rUv for the Claude community
`);
}

function printVersion() {
  console.log(`Claude-Zen v${VERSION}`);
}

function printError(message) {
  console.error(`❌ Error: ${message}`);
}

function printSuccess(message) {
  console.log(`✅ ${message}`);
}

function printWarning(message) {
  console.warn(`⚠️  Warning: ${message}`);
}

function showHelpWithCommands(plain = false) {
  printHelp(plain);
  console.log('\nRegistered Commands:');
  const commands = listCommands();
  for (const command of commands) {
    console.log(`  ${command.name.padEnd(12)} ${command.description}`);
  }
  console.log('\nUse "claude-zen help <command>" for detailed usage information');
}

async function main() {
  const args = process.argv.slice(2); // Remove 'node' and script name

  if (args.length === 0) {
    printHelp(usePlainHelp);
    return;
  }

  const command = args[0];
  const { flags, args: parsedArgs } = parseFlags(args.slice(1));

  // Check for --plain flag for help early
  const usePlainHelp = args.includes('--plain');

  // Apply environment-based smart defaults
  let enhancedFlags = flags;
  try {
    const { detectExecutionEnvironment, applySmartDefaults } = await import(
      './utils/environment-detector.js'
    );
    enhancedFlags = applySmartDefaults(flags);

    // Store environment info for commands that need it
    enhancedFlags._environment = detectExecutionEnvironment({ skipWarnings: true });
  } catch (e) {
    // If environment detector fails, continue with original flags
    enhancedFlags = flags;
  }

  // Check if user is asking for help on a specific command
  if (
    command !== 'help' &&
    command !== '--help' &&
    command !== '-h' &&
    (enhancedFlags.help || enhancedFlags.h)
  ) {
    const detailedHelp = getCommandHelp(command);
    if (detailedHelp && !detailedHelp.includes('Help not available')) {
      printCommandHelp(command);
    } else if (hasCommand(command)) {
      showCommandHelp(command);
    } else {
      printError(`Unknown command: ${command}`);
      console.log('\nRun "claude-zen --help" to see available commands.');
    }
    return;
  }

  // Handle special commands first
  switch (command) {
    case 'env-check':
    case 'environment':
      if (enhancedFlags._environment) {
        const env = enhancedFlags._environment;
        console.log(`\n🖥️  Environment Detection Results:`);
        console.log(`   Terminal: ${env.terminalType}`);
        console.log(`   Interactive: ${env.isInteractive ? 'Yes' : 'No'}`);
        console.log(`   TTY Support: ${env.supportsRawMode ? 'Yes' : 'No'}`);
        console.log(
          `   Detected: ${env.isVSCode ? 'VS Code' : env.isCI ? 'CI/CD' : env.isDocker ? 'Docker' : env.isSSH ? 'SSH' : 'Standard Terminal'}`,
        );
        if (env.recommendedFlags.length > 0) {
          console.log(`\n💡 Recommended flags:`);
          console.log(`   ${env.recommendedFlags.join(' ')}`);
        }
        if (enhancedFlags.appliedDefaults && enhancedFlags.appliedDefaults.length > 0) {
          console.log(`\n✅ Auto-applied:`);
          console.log(`   ${enhancedFlags.appliedDefaults.join(' ')}`);
        }
        console.log();
      } else {
        console.log('Environment detection not available');
      }
      return;
    case 'version':
    case '--version':
    case '-v':
      printVersion();
      return;

    case 'help':
    case '--help':
    case '-h':
      if (parsedArgs.length > 0) {
        // Try our detailed help first
        const detailedHelp = getCommandHelp(parsedArgs[0]);
        if (detailedHelp && !detailedHelp.includes('Help not available')) {
          printCommandHelp(parsedArgs[0]);
        } else {
          // Fall back to command registry help
          showCommandHelp(parsedArgs[0]);
        }
      } else {
        printHelp(usePlainHelp);
      }
      return;
  }

  // Check if this is a registered modular command
  if (hasCommand(command)) {
    try {
      await executeCommand(command, parsedArgs, flags);
      return;
    } catch (err) {
      printError(err.message);
      console.log(`
Run "claude-zen ${command} --help" for usage information.`);
      return;
    }
  }

  // All commands are handled through the command registry
  // If we reach here, the command is unknown
  printError(`Unknown command: ${command}`);
  console.log('Run "claude-zen help" for available commands');

  // Suggest similar commands
  const commonCommands = [
    'agent',
    'task',
    'spawn',
    'init',
    'start',
    'status',
    'memory',
    'workflow',
    'help',
    'security',
    'backup',
  ];
  const suggestions = commonCommands.filter(
    (cmd) => cmd.startsWith(command.toLowerCase()) || cmd.includes(command.toLowerCase()),
  );

  if (suggestions.length > 0) {
    console.log('\nDid you mean:');
    suggestions.forEach((cmd) => console.log(`  claude-zen ${cmd}`));
  }

  process.exit(1);
}

// REPL Implementation
async function startRepl() {
  console.log('🧠 Claude-Flow Interactive Shell v' + VERSION);
  console.log('Type "help" for available commands, "exit" to quit\n');

  const replState = {
    history: [],
    historyIndex: -1,
    currentSession: null,
    context: {
      agents: [],
      tasks: [],
      terminals: [],
      memory: {},
    },
  };

  // REPL command handlers
  const replCommands = {
    help: () => {
      console.log(`
📚 Available REPL Commands:
  
System:
  status          - Show system status
  config [key]    - Show configuration (or specific key)
  clear           - Clear the screen
  history         - Show command history
  exit/quit       - Exit REPL mode

Agents:
  agent spawn <type> [name]     - Spawn new agent
  agent list                    - List active agents
  agent info <id>              - Show agent details
  agent terminate <id>         - Terminate agent

Tasks:
  task create <type> <desc>    - Create new task
  task list                    - List active tasks
  task assign <task> <agent>   - Assign task to agent
  task status <id>            - Show task status

Memory:
  memory store <key> <value>   - Store data in memory
  memory get <key>            - Retrieve data from memory
  memory list                 - List all memory keys
  memory clear                - Clear all memory

Terminal:
  terminal create [name]       - Create terminal session
  terminal list               - List terminals
  terminal exec <cmd>         - Execute command
  terminal attach <id>        - Attach to terminal

Shortcuts:
  !<command>     - Execute shell command
  /<search>      - Search command history
  ↑/↓           - Navigate command history
`);
    },

    status: () => {
      console.log('🟢 Claude-Zen Status:');
      console.log(`  Agents: ${replState.context.agents.length} active`);
      console.log(`  Tasks: ${replState.context.tasks.length} in queue`);
      console.log(`  Terminals: ${replState.context.terminals.length} active`);
      console.log(`  Memory Keys: ${Object.keys(replState.context.memory).length}`);
    },

    clear: () => {
      console.clear();
      console.log('🧠 Claude-Zen Interactive Shell v' + VERSION);
    },

    history: () => {
      console.log('📜 Command History:');
      replState.history.forEach((cmd, i) => {
        console.log(`  ${i + 1}: ${cmd}`);
      });
    },

    config: async (key) => {
      try {
        const config = JSON.parse(await readTextFile('claude-zen.config.json'));
        if (key) {
          const keys = key.split('.');
          let value = config;
          for (const k of keys) {
            value = value[k];
          }
          console.log(`${key}: ${JSON.stringify(value, null, 2)}`);
        } else {
          console.log(JSON.stringify(config, null, 2));
        }
      } catch {
        console.log('No configuration file found. Using defaults.');
      }
    },
  };

  // Process REPL commands
  async function processReplCommand(input) {
    const trimmed = input.trim();
    if (!trimmed) return true;

    // Add to history
    replState.history.push(trimmed);
    replState.historyIndex = replState.history.length;

    // Handle special commands
    if (trimmed === 'exit' || trimmed === 'quit') {
      console.log('👋 Exiting Claude-Zen REPL...');
      return false;
    }

    // Handle shell commands
    if (trimmed.startsWith('!')) {
      const shellCmd = trimmed.substring(1);
      try {
        await new Promise((resolve) => {
          const proc = spawn('sh', ['-c', shellCmd], {
            stdio: ['inherit', 'pipe', 'pipe'],
          });

          proc.stdout.on('data', (data) => {
            console.log(data.toString());
          });

          proc.stderr.on('data', (data) => {
            console.error(data.toString());
          });

          proc.on('exit', resolve);
        });
      } catch (err) {
        console.error(`Shell error: ${err.message}`);
      }
      return true;
    }

    // Handle search
    if (trimmed.startsWith('/')) {
      const search = trimmed.substring(1);
      const matches = replState.history.filter((cmd) => cmd.includes(search));
      if (matches.length > 0) {
        console.log('🔍 Search results:');
        matches.forEach((cmd) => console.log(`  ${cmd}`));
      } else {
        console.log('No matches found');
      }
      return true;
    }

    // Parse command and arguments
    const parts = trimmed.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    // Handle built-in REPL commands
    if (replCommands[command]) {
      await replCommands[command](...args);
      return true;
    }

    // Handle multi-word commands
    if (command === 'agent') {
      await handleAgentCommand(args, replState);
    } else if (command === 'task') {
      await handleTaskCommand(args, replState);
    } else if (command === 'memory') {
      await handleMemoryCommand(args, replState);
    } else if (command === 'terminal') {
      await handleTerminalCommand(args, replState);
    } else {
      console.log(`Unknown command: ${command}. Type "help" for available commands.`);
    }

    return true;
  }

  // Agent command handler
  async function handleAgentCommand(args, state) {
    const subCmd = args[0];
    switch (subCmd) {
      case 'spawn':
        const type = args[1] || 'researcher';
        const name = args[2] || `agent-${Date.now()}`;
        const agent = {
          id: `agent-${Date.now()}`,
          type,
          name,
          status: 'active',
          created: new Date().toISOString(),
        };
        state.context.agents.push(agent);
        printSuccess(`Spawned ${type} agent: ${name} (${agent.id})`);
        break;

      case 'list':
        if (state.context.agents.length === 0) {
          console.log('No active agents');
        } else {
          console.log('Active agents:');
          state.context.agents.forEach((agent) => {
            console.log(`  ${agent.id} - ${agent.name} (${agent.type}) - ${agent.status}`);
          });
        }
        break;

      case 'info':
        const agentId = args[1];
        const foundAgent = state.context.agents.find((a) => a.id === agentId || a.name === agentId);
        if (foundAgent) {
          console.log(`Agent: ${foundAgent.name}`);
          console.log(`  ID: ${foundAgent.id}`);
          console.log(`  Type: ${foundAgent.type}`);
          console.log(`  Status: ${foundAgent.status}`);
          console.log(`  Created: ${foundAgent.created}`);
        } else {
          printError(`Agent not found: ${agentId}`);
        }
        break;

      case 'terminate':
        const termId = args[1];
        const index = state.context.agents.findIndex((a) => a.id === termId || a.name === termId);
        if (index >= 0) {
          const removed = state.context.agents.splice(index, 1)[0];
          printSuccess(`Terminated agent: ${removed.name}`);
        } else {
          printError(`Agent not found: ${termId}`);
        }
        break;

      default:
        console.log('Agent commands: spawn, list, info, terminate');
    }
  }

  // Task command handler
  async function handleTaskCommand(args, state) {
    const subCmd = args[0];
    switch (subCmd) {
      case 'create':
        const type = args[1] || 'general';
        const description = args.slice(2).join(' ') || 'No description';
        const task = {
          id: `task-${Date.now()}`,
          type,
          description,
          status: 'pending',
          created: new Date().toISOString(),
        };
        state.context.tasks.push(task);
        printSuccess(`Created task: ${task.id}`);
        console.log(`  Type: ${type}`);
        console.log(`  Description: ${description}`);
        break;

      case 'list':
        if (state.context.tasks.length === 0) {
          console.log('No active tasks');
        } else {
          console.log('Active tasks:');
          state.context.tasks.forEach((task) => {
            console.log(`  ${task.id} - ${task.type} - ${task.status}`);
            console.log(`    ${task.description}`);
          });
        }
        break;

      case 'assign':
        const taskId = args[1];
        const assignAgentId = args[2];
        const foundTask = state.context.tasks.find((t) => t.id === taskId);
        const assignAgent = state.context.agents.find(
          (a) => a.id === assignAgentId || a.name === assignAgentId,
        );

        if (foundTask && assignAgent) {
          foundTask.assignedTo = assignAgent.id;
          foundTask.status = 'assigned';
          printSuccess(`Assigned task ${taskId} to agent ${assignAgent.name}`);
        } else {
          printError('Task or agent not found');
        }
        break;

      case 'status':
        const statusId = args[1];
        const statusTask = state.context.tasks.find((t) => t.id === statusId);
        if (statusTask) {
          console.log(`Task: ${statusTask.id}`);
          console.log(`  Type: ${statusTask.type}`);
          console.log(`  Status: ${statusTask.status}`);
          console.log(`  Description: ${statusTask.description}`);
          if (statusTask.assignedTo) {
            console.log(`  Assigned to: ${statusTask.assignedTo}`);
          }
          console.log(`  Created: ${statusTask.created}`);
        } else {
          printError(`Task not found: ${statusId}`);
        }
        break;

      default:
        console.log('Task commands: create, list, assign, status');
    }
  }

  // Memory command handler
  async function handleMemoryCommand(args, state) {
    const subCmd = args[0];
    switch (subCmd) {
      case 'store':
        const key = args[1];
        const value = args.slice(2).join(' ');
        if (key && value) {
          state.context.memory[key] = value;
          printSuccess(`Stored: ${key} = ${value}`);
        } else {
          printError('Usage: memory store <key> <value>');
        }
        break;

      case 'get':
        const getKey = args[1];
        if (getKey && state.context.memory[getKey]) {
          console.log(`${getKey}: ${state.context.memory[getKey]}`);
        } else {
          console.log(`Key not found: ${getKey}`);
        }
        break;

      case 'list':
        const keys = Object.keys(state.context.memory);
        if (keys.length === 0) {
          console.log('No data in memory');
        } else {
          console.log('Memory keys:');
          keys.forEach((key) => {
            console.log(`  ${key}: ${state.context.memory[key]}`);
          });
        }
        break;

      case 'clear':
        state.context.memory = {};
        printSuccess('Memory cleared');
        break;

      default:
        console.log('Memory commands: store, get, list, clear');
    }
  }

  // Terminal command handler
  async function handleTerminalCommand(args, state) {
    const subCmd = args[0];
    switch (subCmd) {
      case 'create':
        const name = args[1] || `term-${Date.now()}`;
        const terminal = {
          id: name,
          status: 'active',
          created: new Date().toISOString(),
        };
        state.context.terminals.push(terminal);
        printSuccess(`Created terminal: ${name}`);
        break;

      case 'list':
        if (state.context.terminals.length === 0) {
          console.log('No active terminals');
        } else {
          console.log('Active terminals:');
          state.context.terminals.forEach((term) => {
            console.log(`  ${term.id} - ${term.status}`);
          });
        }
        break;

      case 'exec':
        const cmd = args.slice(1).join(' ');
        if (cmd) {
          console.log(`Executing: ${cmd}`);
          console.log('(Command execution simulated in REPL)');
        } else {
          printError('Usage: terminal exec <command>');
        }
        break;

      case 'attach':
        const attachId = args[1];
        if (attachId) {
          state.currentSession = attachId;
          console.log(`Attached to terminal: ${attachId}`);
          console.log('(Type "terminal detach" to detach)');
        } else {
          printError('Usage: terminal attach <id>');
        }
        break;

      case 'detach':
        if (state.currentSession) {
          console.log(`Detached from terminal: ${state.currentSession}`);
          state.currentSession = null;
        } else {
          console.log('Not attached to any terminal');
        }
        break;

      default:
        console.log('Terminal commands: create, list, exec, attach, detach');
    }
  }

  // Main REPL loop with Node.js readline
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Set prompt based on session
  function updatePrompt() {
    rl.setPrompt(
      replState.currentSession ? `claude-zen:${replState.currentSession}> ` : 'claude-zen> ',
    );
  }

  updatePrompt();
  rl.prompt();

  // Handle each line of input
  rl.on('line', async (input) => {
    input = input.trim();

    // Process command
    const shouldContinue = await processReplCommand(input);
    if (!shouldContinue) {
      rl.close();
    } else {
      updatePrompt();
      rl.prompt();
    }
  });

  // Handle CTRL+C
  rl.on('SIGINT', () => {
    console.log('\nExiting Claude-Zen...');
    rl.close();
    process.exit(0);
  });

  // Wait for REPL to close
  return new Promise((resolve) => {
    rl.on('close', resolve);
  });
}

// Helper functions for init command
function createMinimalClaudeMd() {
  return `# Claude Code Integration

This file provides guidance to Claude when working with this codebase.

## Project Overview
[Describe your project here]

## Key Conventions
- Code style guidelines
- Naming conventions
- Architecture patterns

## Important Notes
- Special considerations
- Areas to be careful with
`;
}

function createFullClaudeMd() {
  return `# Claude Code Integration Guide

This document provides comprehensive guidance to Claude when working with this codebase.

## Project Overview
[Provide a detailed description of your project, its purpose, and main features]

## Architecture
[Describe the overall architecture, main components, and how they interact]

## Code Conventions
- **Naming**: [Describe naming conventions for files, functions, variables, etc.]
- **Style**: [Code formatting preferences, linting rules]
- **Patterns**: [Design patterns used in the project]
- **Testing**: [Testing approach and requirements]

## Directory Structure
\`\`\`
project/
├── src/          # Source code
├── tests/        # Test files
├── docs/         # Documentation
└── ...           # Other directories
\`\`\`

## Development Workflow
1. [Step-by-step development process]
2. [How to run tests]
3. [How to build/deploy]

## Important Considerations
- [Security considerations]
- [Performance requirements]
- [Compatibility requirements]

## Common Tasks
- **Add a new feature**: [Instructions]
- **Fix a bug**: [Process]
- **Update documentation**: [Guidelines]

## Dependencies
[List key dependencies and their purposes]

## Troubleshooting
[Common issues and solutions]
`;
}

function createMinimalMemoryBankMd() {
  return `# Memory Bank

Session memory and context storage.

## Current Session
- Started: ${new Date().toISOString()}
- Context: [Current work context]

## Key Information
- [Important facts to remember]

## Progress Log
- [Track progress here]
`;
}

function createFullMemoryBankMd() {
  return `# Memory Bank

This file serves as persistent memory storage for Claude across sessions.

## Session Information
- **Current Session**: Started ${new Date().toISOString()}
- **Project Phase**: [Development/Testing/Production]
- **Active Tasks**: [List current tasks]

## Project Context
### Technical Stack
- Languages: [List languages used]
- Frameworks: [List frameworks]
- Tools: [Development tools]

### Architecture Decisions
- [Record key architectural decisions]
- [Rationale for technology choices]

## Important Information
### API Keys and Secrets
- [Never store actual secrets here, just references]

### External Services
- [List integrated services]
- [Configuration requirements]

### Database Schema
- [Current schema version]
- [Recent migrations]

## Progress Tracking
### Completed Tasks
- [x] [Completed task 1]
- [x] [Completed task 2]

### In Progress
- [ ] [Current task 1]
- [ ] [Current task 2]

### Upcoming
- [ ] [Future task 1]
- [ ] [Future task 2]

## Code Patterns
### Established Patterns
\`\`\`javascript
// Example pattern
\`\`\`

### Anti-patterns to Avoid
- [List anti-patterns]

## Meeting Notes
### [Date]
- Participants: [Names]
- Decisions: [Key decisions]
- Action items: [Tasks assigned]

## Debugging History
### Issue: [Issue name]
- **Date**: [Date]
- **Symptoms**: [What was observed]
- **Root Cause**: [What caused it]
- **Solution**: [How it was fixed]

## Performance Metrics
- [Baseline metrics]
- [Optimization goals]

## Documentation Links
- [API Documentation]: [URL]
- [Design Documents]: [URL]
- [Issue Tracker]: [URL]
`;
}

function createMinimalCoordinationMd() {
  return `# Coordination

Task and workflow coordination.

## Active Tasks
1. [Current task]

## Workflow
- [ ] Step 1
- [ ] Step 2

## Resources
- [Available resources]
`;
}

function createFullCoordinationMd() {
  return `# Coordination Center

Central coordination for multi-agent collaboration and task management.

## Active Agents
| Agent ID | Type | Status | Assigned Tasks | Last Active |
|----------|------|--------|----------------|-------------|
| [ID] | [Type] | [Status] | [Tasks] | [Timestamp] |

## Task Queue
### High Priority
1. **[Task Name]**
   - Description: [What needs to be done]
   - Assigned to: [Agent ID]
   - Dependencies: [Other tasks]
   - Deadline: [Date/Time]

### Medium Priority
1. [Task details]

### Low Priority
1. [Task details]

## Workflow Definitions
### [Workflow Name]
\`\`\`yaml
name: [Workflow Name]
description: [What this workflow does]
steps:
  - name: [Step 1]
    agent: [Agent type]
    action: [What to do]
  - name: [Step 2]
    agent: [Agent type]
    action: [What to do]
    depends_on: [Step 1]
\`\`\`

## Resource Allocation
### Computational Resources
- CPU: [Usage/Limits]
- Memory: [Usage/Limits]
- Storage: [Usage/Limits]

### External Resources
- API Rate Limits: [Service: limit]
- Database Connections: [Current/Max]

## Communication Channels
### Inter-Agent Messages
- [Agent A → Agent B]: [Message type]

### External Communications
- Webhooks: [Configured webhooks]
- Notifications: [Notification settings]

## Synchronization Points
- [Sync Point 1]: [Description]
- [Sync Point 2]: [Description]

## Conflict Resolution
### Strategy
- [How conflicts are resolved]

### Recent Conflicts
- [Date]: [Conflict description] → [Resolution]

## Performance Metrics
### Task Completion
- Average time: [Time]
- Success rate: [Percentage]

### Agent Efficiency
- [Agent Type]: [Metrics]

## Scheduled Maintenance
- [Date/Time]: [What will be done]

## Emergency Procedures
### System Overload
1. [Step 1]
2. [Step 2]

### Agent Failure
1. [Recovery procedure]
`;
}

function createAgentsReadme() {
  return `# Agents Directory

This directory stores agent-specific memory and state information.

## Structure
Each agent gets its own subdirectory named by agent ID:
- \`agent-001/\`: First agent's memory
- \`agent-002/\`: Second agent's memory
- etc.

## Files per Agent
- \`profile.json\`: Agent configuration and capabilities
- \`memory.md\`: Agent's working memory
- \`tasks.json\`: Assigned tasks and their status
- \`metrics.json\`: Performance metrics

## Usage
Files in this directory are automatically managed by the Claude-Flow system.
`;
}

function createSessionsReadme() {
  return `# Sessions Directory

This directory stores session-specific information and terminal states.

## Structure
Each session gets a unique directory:
- \`session-[timestamp]/\`: Session data
  - \`metadata.json\`: Session metadata
  - \`terminal.log\`: Terminal output
  - \`commands.history\`: Command history
  - \`state.json\`: Session state snapshot

## Retention Policy
Sessions are retained for 30 days by default, then archived or deleted based on configuration.

## Usage
The Claude-Flow system automatically manages session files. Do not modify these files manually.
`;
}

// Helper function to create workflow structure manually
async function createSparcStructureManually() {
  try {
    // Create .roo directory structure
    const rooDirectories = [
      '.roo',
      '.roo/templates',
      '.roo/workflows',
      '.roo/modes',
      '.roo/configs',
    ];

    for (const dir of rooDirectories) {
      try {
        await mkdirAsync(dir, { recursive: true });
        console.log(`  ✓ Created ${dir}/`);
      } catch (err) {
        if (!(err instanceof errors.AlreadyExists)) {
          throw err;
        }
      }
    }

    // Create .roomodes file (copy from existing if available, or create basic version)
    let roomodesContent;
    try {
      // Check if .roomodes already exists and read it
      roomodesContent = await readTextFile('.roomodes');
      console.log('  ✓ Using existing .roomodes configuration');
    } catch {
      // Create basic .roomodes configuration
      roomodesContent = createBasicRoomodesConfig();
      await writeTextFile('.roomodes', roomodesContent);
      console.log('  ✓ Created .roomodes configuration');
    }

    // Create basic workflow templates
    const basicWorkflow = createBasicSparcWorkflow();
    await writeTextFile('.roo/workflows/basic-tdd.json', basicWorkflow);
    console.log('  ✓ Created .roo/workflows/basic-tdd.json');

    // Create README for .roo directory
    const rooReadme = createRooReadme();
    await writeTextFile('.roo/README.md', rooReadme);
    console.log('  ✓ Created .roo/README.md');

    console.log('  ✅ Basic workflow structure created successfully');
  } catch (err) {
    console.log(`  ❌ Failed to create workflow structure: ${err.message}`);
  }
}

function createBasicRoomodesConfig() {
  return JSON.stringify(
    {
      customModes: [
        {
          slug: 'architect',
          name: '🏗️ Architect',
          roleDefinition:
            'You design scalable, secure, and modular architectures based on functional specs and user needs. You define responsibilities across services, APIs, and components.',
          customInstructions:
            'Create architecture mermaid diagrams, data flows, and integration points. Ensure no part of the design includes secrets or hardcoded env values. Emphasize modular boundaries and maintain extensibility.',
          groups: ['read', 'edit'],
          source: 'project',
        },
        {
          slug: 'code',
          name: '🧠 Auto-Coder',
          roleDefinition:
            'You write clean, efficient, modular code based on pseudocode and architecture. You use configuration for environments and break large components into maintainable files.',
          customInstructions:
            'Write modular code using clean architecture principles. Never hardcode secrets or environment values. Split code into files < 500 lines. Use config files or environment abstractions. Use \\`new_task\\` for subtasks and finish with \\`attempt_completion\\`.',
          groups: ['read', 'edit', 'browser', 'mcp', 'command'],
          source: 'project',
        },
        {
          slug: 'tdd',
          name: '🧪 Tester (TDD)',
          roleDefinition:
            'You implement Test-Driven Development (TDD, London School), writing tests first and refactoring after minimal implementation passes.',
          customInstructions:
            'Write failing tests first. Implement only enough code to pass. Refactor after green. Ensure tests do not hardcode secrets. Keep files < 500 lines.',
          groups: ['read', 'edit', 'browser', 'mcp', 'command'],
          source: 'project',
        },
        {
          slug: 'spec-pseudocode',
          name: '📋 Specification Writer',
          roleDefinition:
            'You capture full project context—functional requirements, edge cases, constraints—and translate that into modular pseudocode with TDD anchors.',
          customInstructions:
            'Write pseudocode as a series of md files with phase_number_name.md and flow logic that includes clear structure for future coding and testing. Split complex logic across modules.',
          groups: ['read', 'edit'],
          source: 'project',
        },
        {
          slug: 'integration',
          name: '🔗 System Integrator',
          roleDefinition:
            'You merge the outputs of all modes into a working, tested, production-ready system. You ensure consistency, cohesion, and modularity.',
          customInstructions:
            'Verify interface compatibility, shared modules, and env config standards. Split integration logic across domains as needed. Use \\`new_task\\` for preflight testing.',
          groups: ['read', 'edit', 'browser', 'mcp', 'command'],
          source: 'project',
        },
        {
          slug: 'debug',
          name: '🪲 Debugger',
          roleDefinition:
            'You troubleshoot runtime bugs, logic errors, or integration failures by tracing, inspecting, and analyzing behavior.',
          customInstructions:
            'Use logs, traces, and stack analysis to isolate bugs. Avoid changing env configuration directly. Keep fixes modular.',
          groups: ['read', 'edit', 'browser', 'mcp', 'command'],
          source: 'project',
        },
      ],
    },
    null,
    2,
  );
}

function createBasicSparcWorkflow() {
  return JSON.stringify(
    {
      name: 'Basic TDD Workflow',
      description: 'A simple workflow-based TDD process for development',
      sequential: true,
      steps: [
        {
          mode: 'spec-pseudocode',
          description: 'Create detailed specifications and pseudocode',
          phase: 'specification',
        },
        {
          mode: 'tdd',
          description: 'Write failing tests (Red phase)',
          phase: 'red',
        },
        {
          mode: 'code',
          description: 'Implement minimal code to pass tests (Green phase)',
          phase: 'green',
        },
        {
          mode: 'tdd',
          description: 'Refactor and optimize (Refactor phase)',
          phase: 'refactor',
        },
        {
          mode: 'integration',
          description: 'Integrate and verify complete solution',
          phase: 'integration',
        },
      ],
    },
    null,
    2,
  );
}

function createRooReadme() {
  return `# .roo Directory - Workflow Development Environment

This directory contains workflow development environment configuration and templates.

## Directory Structure

\`\`\`
.roo/
├── README.md           # This file
├── templates/          # Template files for common patterns
├── workflows/          # Predefined workflows
│   └── basic-tdd.json  # Basic TDD workflow
├── modes/              # Custom mode definitions (optional)
└── configs/            # Configuration files
\`\`\`

## Workflow Methodology

Workflow is a systematic approach to software development:

1. **Specification**: Define clear requirements and constraints
2. **Planning**: Create detailed logic flows and algorithms  
3. **Architecture**: Design system structure and components
4. **Implementation**: Implement, test, and optimize using TDD
5. **Completion**: Integrate, document, and validate

## Usage with Claude-Zen

Use the claude-zen workflow commands to leverage this environment:

\`\`\`bash
# List available modes
claude-zen workflow modes

# Run specific mode
claude-zen workflow run code "implement user authentication"

# Execute full TDD workflow  
claude-zen workflow tdd "payment processing system"

# Use custom workflow
claude-zen workflow execute .roo/workflows/basic-tdd.json
\`\`\`


## Configuration

The main configuration is in \`.roomodes\` at the project root. This directory provides additional templates and workflows to support the development process.

## Customization

You can customize this environment by:
- Adding new workflow templates to \`workflows/\`
- Creating mode-specific templates in \`templates/\`
- Adding project-specific configurations in \`configs/\`

For more information, see: https://github.com/ruvnet/claude-code-flow/docs/workflow.md
`;
}

function createWorkflowClaudeMd() {
  return `# Claude Code Configuration - Workflow Development Environment

## Project Overview
This project uses systematic workflow methodology for Test-Driven Development with AI assistance through Claude-Zen orchestration.

## Workflow Development Commands

### Core Workflow Commands
- \`npx claude-zen workflow modes\`: List all available workflow development modes
- \`npx claude-zen workflow run <mode> "<task>"\`: Execute specific workflow mode for a task
- \`npx claude-zen workflow tdd "<feature>"\`: Run complete TDD workflow
- \`npx claude-zen workflow info <mode>\`: Get detailed information about a specific mode

### Standard Build Commands
- \`npm run build\`: Build the project
- \`npm run test\`: Run the test suite
- \`npm run lint\`: Run linter and format checks
- \`npm run typecheck\`: Run TypeScript type checking

## Workflow Methodology

### 1. Planning Phase
\`\`\`bash
# Create detailed specifications and requirements
npx claude-zen workflow run planning "Define user authentication requirements"
\`\`\`
- Define clear functional requirements
- Document edge cases and constraints
- Create user stories and acceptance criteria
- Establish non-functional requirements

### 2. Architecture Phase
\`\`\`bash
# Design system architecture and component structure
npx claude-zen workflow run architect "Design authentication service architecture"
\`\`\`
- Create system diagrams and component relationships
- Define API contracts and interfaces
- Plan database schemas and data flows
- Establish security and scalability patterns

### 3. Implementation Phase (TDD)
\`\`\`bash
# Execute Test-Driven Development cycle
npx claude-zen workflow tdd "implement user authentication system"
\`\`\`

**TDD Cycle:**
1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Optimize and clean up code
4. **Repeat**: Continue until feature is complete

### 4. Integration Phase
\`\`\`bash
# Integration, documentation, and validation
npx claude-zen workflow run integration "integrate authentication with user management"
\`\`\`
- Integrate all components
- Perform end-to-end testing
- Create comprehensive documentation
- Validate against original requirements

## Code Style and Best Practices

### Development Principles
- **Modular Design**: Keep files under 500 lines, break into logical components
- **Environment Safety**: Never hardcode secrets or environment-specific values
- **Test-First**: Always write tests before implementation (Red-Green-Refactor)
- **Clean Architecture**: Separate concerns, use dependency injection
- **Documentation**: Maintain clear, up-to-date documentation

### Coding Standards
- Use TypeScript for type safety and better tooling
- Follow consistent naming conventions (camelCase for variables, PascalCase for classes)
- Implement proper error handling and logging
- Use async/await for asynchronous operations
- Prefer composition over inheritance

### Memory and State Management
- Use claude-zen memory system for persistent state across sessions
- Store progress and findings using namespaced keys
- Query previous work before starting new tasks
- Export/import memory for backup and sharing

## Important Notes

- Always run tests before committing (\`npm run test\`)
- Use workflow memory system to maintain context across sessions
- Follow the Red-Green-Refactor cycle during TDD phases
- Document architectural decisions in memory for future reference
- Regular security reviews for any authentication or data handling code

For more information about workflow methodology, see: https://github.com/ruvnet/claude-code-flow/docs/workflow.md
`;
}

// Check if this module is being run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  await main();
}
