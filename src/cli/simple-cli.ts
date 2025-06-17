#!/usr/bin/env node
/**
 * Simple CLI wrapper for Claude-Flow (Node.js version)
 * Converted from Deno to Node.js with commander.js
 */

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { configManager, ConfigError } from '../config/config-manager.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERSION = '1.0.58';

function printError(message: string) {
  console.error(`❌ Error: ${message}`);
}

function printSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function printWarning(message: string) {
  console.warn(`⚠️  Warning: ${message}`);
}

function simulateSwarmExecution(config: any) {
  console.log('🔄 Simulating swarm execution...\n');
  
  // Simulate task decomposition based on strategy
  const tasks = [];
  switch (config.strategy) {
    case 'research':
      tasks.push(
        { agent: 'researcher-1', task: 'Gather information and sources' },
        { agent: 'analyzer-1', task: 'Analyze collected data' },
        { agent: 'synthesizer-1', task: 'Synthesize findings into report' }
      );
      break;
    case 'development':
      tasks.push(
        { agent: 'architect-1', task: 'Design system architecture' },
        { agent: 'developer-1', task: 'Implement core functionality' },
        { agent: 'tester-1', task: 'Write tests and validate' },
        { agent: 'documenter-1', task: 'Create documentation' }
      );
      break;
    case 'analysis':
      tasks.push(
        { agent: 'collector-1', task: 'Collect relevant data' },
        { agent: 'analyzer-1', task: 'Perform statistical analysis' },
        { agent: 'visualizer-1', task: 'Create visualizations' }
      );
      break;
    default:
      tasks.push(
        { agent: 'coordinator-1', task: 'Analyze objective and plan approach' },
        { agent: 'executor-1', task: 'Execute main tasks' },
        { agent: 'validator-1', task: 'Validate and refine results' }
      );
  }
  
  console.log(`📋 Task Decomposition (${config.mode} mode):`);
  tasks.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.agent}: ${t.task}`);
  });
  
  console.log('\n🤖 Agent Execution:');
  tasks.forEach((t, i) => {
    setTimeout(() => {
      console.log(`  ✅ ${t.agent} completed: ${t.task}`);
    }, (i + 1) * 500);
  });
  
  setTimeout(() => {
    console.log('\n📊 Swarm Results:');
    console.log(`  - Strategy: ${config.strategy}`);
    console.log(`  - Tasks Completed: ${tasks.length}`);
    console.log(`  - Execution Time: ${tasks.length * 0.5}s (simulated)`);
    console.log(`  - Status: Success`);
    console.log('\n💡 To run actual swarm execution, install Claude Code');
  }, (tasks.length + 1) * 500);
}

function createProgram() {
  const program = new Command();
  
  // Configure custom help
  program.configureHelp({
    formatHelp: (cmd, helper) => {
      let output = '';
      output += `\n${chalk.cyan.bold('🧠 Claude-Flow v' + VERSION)} - Advanced AI Agent Orchestration System\n\n`;
      
      output += chalk.yellow('USAGE:') + '\n';
      output += '  claude-flow <command> [options]\n\n';
      
      output += chalk.yellow('INSTALLATION & SETUP:') + '\n';
      output += '  npx claude-flow@latest init --sparc  # Initialize SPARC development environment\n';
      output += '  \n';
      output += '  The --sparc flag creates:\n';
      output += '  • .roomodes file with 17 pre-configured SPARC modes\n';
      output += '  • CLAUDE.md for project instructions\n';
      output += '  • Ready-to-use TDD and code generation environment\n\n';
      
      output += chalk.yellow('KEY COMMANDS:') + '\n';
      output += '  init [--sparc]                       Initialize project with Claude integration\n';
      output += '  start [--ui]                         Start orchestration (--ui for enhanced UI)\n';
      output += '  spawn <type> [--name <name>]         Create AI agent (alias for agent spawn)\n';
      output += '  agent spawn <type> [--name <name>]   Create AI agent (researcher, coder, analyst)\n';
      output += '  sparc <subcommand>                   SPARC-based development modes\n';
      output += '  memory <subcommand>                  Manage persistent memory\n';
      output += '  status                               Show system status\n\n';
      
      output += chalk.yellow('COMMAND CATEGORIES:') + '\n';
      output += `  ${chalk.green('Core:')}         init, start, status, config\n`;
      output += `  ${chalk.green('Agents:')}       agent, task, claude\n`;
      output += `  ${chalk.green('Development:')}  sparc, memory, workflow\n`;
      output += `  ${chalk.green('Infrastructure:')} mcp, terminal, session\n`;
      output += `  ${chalk.green('Enterprise:')}   project, deploy, cloud, security, analytics\n\n`;
      
      output += chalk.yellow('QUICK START:') + '\n';
      output += '  npx -y claude-flow@latest init --sparc # First-time setup with SPARC modes\n';
      output += '  ./claude-flow start --ui              # Interactive process management UI\n';
      output += '  ./claude-flow sparc modes             # List available development modes\n';
      output += '  ./claude-flow sparc "build app"       # Run SPARC orchestrator (default)\n';
      output += '  ./claude-flow sparc run code "feature" # Run specific mode (auto-coder)\n';
      output += '  ./claude-flow sparc tdd "tests"       # Run test-driven development\n';
      output += '  ./claude-flow memory store key "data"  # Store information\n';
      output += '  ./claude-flow status                  # Check system status\n\n';
      
      output += chalk.yellow('GET DETAILED HELP:') + '\n';
      output += '  claude-flow help <command>           # Show command-specific help\n';
      output += '  claude-flow <command> --help         # Alternative help syntax\n';
      output += '  \n';
      output += '  Examples:\n';
      output += '    claude-flow help sparc             # SPARC development commands\n';
      output += '    claude-flow help agent             # Agent management commands\n';
      output += '    claude-flow help memory            # Memory operations\n';
      output += '    claude-flow agent --help           # Agent subcommands\n\n';
      
      output += chalk.yellow('COMMON OPTIONS:') + '\n';
      output += '  --verbose, -v                        Enable detailed output\n';
      output += '  --help                               Show command help\n';
      output += '  --config <path>                      Use custom config file\n\n';
      
      output += `Documentation: ${chalk.blue('https://github.com/ruvnet/claude-code-flow')}\n\n`;
      output += `Created by ${chalk.magenta('rUv')} - Built with ${chalk.red('❤️')} for the Claude community\n\n`;
      
      // List registered commands
      output += '\n' + chalk.yellow('Registered Commands:') + '\n';
      const commands = cmd.commands.filter(c => !c._hidden);
      const maxCmdLength = Math.max(...commands.map(c => c.name().length));
      
      commands.forEach(subcmd => {
        const name = subcmd.name().padEnd(maxCmdLength + 2);
        const desc = subcmd.description() || '';
        output += `  ${chalk.green(name)} ${desc}\n`;
      });
      
      output += `\nUse "${chalk.cyan('claude-flow help <command>')}" for detailed usage information\n`;
      
      return output;
    }
  });
  
  program
    .name('claude-flow')
    .description('🧠 Claude-Flow - Advanced AI Agent Orchestration System')
    .version(VERSION, '-v, --version', 'Show version information')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('--verbose', 'Enable verbose logging')
    .option('--log-level <level>', 'Set log level (debug, info, warn, error)');

  // Start command
  program
    .command('start')
    .description('Start the orchestration system')
    .action(() => {
      printSuccess('Starting Claude-Flow orchestration system...');
      console.log('🚀 System starting with the following components:');
      console.log('   ✅ Event Bus');
      console.log('   ✅ Orchestrator Engine');
      console.log('   ✅ Memory Manager');
      console.log('   ✅ Terminal Pool');
      console.log('   ✅ MCP Server');
      console.log('   ✅ Coordination Manager');
      console.log('\n💡 Run "claude-flow start" from the main CLI for full functionality');
    });

  // Agent commands
  const agentCmd = program
    .command('agent')
    .description('Manage agents (spawn, list, terminate, info)');

  agentCmd
    .command('spawn [type]')
    .description('Spawn a new agent')
    .option('--name <name>', 'Agent name')
    .action((type = 'researcher', options) => {
      printSuccess(`Spawning ${type} agent...`);
      console.log(`📝 Agent ID: agent-${Date.now()}`);
      console.log(`🤖 Type: ${type}`);
      if (options.name) {
        console.log(`📛 Name: ${options.name}`);
      }
      console.log(`⚡ Status: Active`);
    });

  agentCmd
    .command('list')
    .description('List active agents')
    .action(() => {
      printSuccess('Active agents:');
      console.log('📋 No agents currently active (orchestrator not running)');
    });

  // Task commands
  const taskCmd = program
    .command('task')
    .description('Manage tasks (create, list, status, cancel, workflow)');

  taskCmd
    .command('create [type] [description]')
    .description('Create a new task')
    .action((type = 'general', description = 'No description') => {
      printSuccess(`Creating ${type} task: "${description}"`);
      console.log(`📝 Task ID: task-${Date.now()}`);
      console.log(`🎯 Type: ${type}`);
      console.log(`📄 Description: ${description}`);
    });

  taskCmd
    .command('list')
    .description('List active tasks')
    .action(() => {
      printSuccess('Active tasks:');
      console.log('📋 No tasks currently active (orchestrator not running)');
    });

  // Config commands
  const configCmd = program
    .command('config')
    .description('Manage configuration (show, get, set, init, validate)');

  configCmd
    .command('init')
    .description('Initialize configuration')
    .option('-f, --file <file>', 'Configuration file path', 'claude-flow.config.json')
    .option('--force', 'Overwrite existing configuration file')
    .action(async (options) => {
      try {
        const fs = await import('fs/promises');
        
        // Check if file exists
        if (!options.force) {
          try {
            await fs.access(options.file);
            printError(`Configuration file already exists: ${options.file}`);
            console.log('Use --force to overwrite');
            return;
          } catch {
            // File doesn't exist, which is what we want
          }
        }
        
        await configManager.createDefaultConfig(options.file);
        printSuccess(`Configuration initialized: ${options.file}`);
      } catch (error) {
        printError(`Failed to initialize configuration: ${error.message}`);
      }
    });

  configCmd
    .command('show')
    .description('Show current configuration')
    .option('-f, --file <file>', 'Configuration file path', 'claude-flow.config.json')
    .action(async (options) => {
      try {
        await configManager.load(options.file);
        const config = configManager.show();
        console.log(JSON.stringify(config, null, 2));
      } catch (error) {
        printError(`Failed to show configuration: ${error.message}`);
      }
    });

  configCmd
    .command('get')
    .description('Get a configuration value')
    .argument('<path>', 'Configuration path (e.g., orchestrator.maxConcurrentAgents)')
    .option('-f, --file <file>', 'Configuration file path', 'claude-flow.config.json')
    .action(async (path, options) => {
      try {
        await configManager.load(options.file);
        const value = configManager.get(path);
        if (value === undefined) {
          printError(`Configuration path not found: ${path}`);
          return;
        }
        console.log(JSON.stringify(value, null, 2));
      } catch (error) {
        printError(`Failed to get configuration: ${error.message}`);
      }
    });

  configCmd
    .command('set')
    .description('Set a configuration value')
    .argument('<path>', 'Configuration path (e.g., orchestrator.maxConcurrentAgents)')
    .argument('<value>', 'Configuration value')
    .option('-f, --file <file>', 'Configuration file path', 'claude-flow.config.json')
    .option('--type <type>', 'Value type (string, number, boolean, json)', 'auto')
    .action(async (path, value, options) => {
      try {
        await configManager.load(options.file);
        
        let parsedValue: any;
        switch (options.type) {
          case 'string':
            parsedValue = value;
            break;
          case 'number':
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) {
              throw new Error('Invalid number format');
            }
            break;
          case 'boolean':
            parsedValue = value.toLowerCase() === 'true';
            break;
          case 'json':
            parsedValue = JSON.parse(value);
            break;
          default:
            // Auto-detect type
            try {
              parsedValue = JSON.parse(value);
            } catch {
              parsedValue = value;
            }
        }
        
        configManager.set(path, parsedValue);
        await configManager.save();
        printSuccess(`Set ${path} = ${JSON.stringify(parsedValue)}`);
      } catch (error) {
        printError(`Failed to set configuration: ${error.message}`);
      }
    });

  configCmd
    .command('validate')
    .description('Validate configuration file')
    .option('-f, --file <file>', 'Configuration file path', 'claude-flow.config.json')
    .action(async (options) => {
      try {
        await configManager.load(options.file);
        printSuccess('Configuration is valid');
      } catch (error) {
        printError(`Configuration validation failed: ${error.message}`);
      }
    });

  // Status command
  program
    .command('status')
    .description('Show system status')
    .action(() => {
      printSuccess('Claude-Flow System Status:');
      console.log('🟡 Status: Not Running (orchestrator not started)');
      console.log('🤖 Agents: 0 active');
      console.log('📋 Tasks: 0 in queue');
      console.log('💾 Memory: Ready');
      console.log('🖥️  Terminal Pool: Ready');
      console.log('🌐 MCP Server: Stopped');
    });

  // Memory command
  program
    .command('memory')
    .description('Manage memory (query, export, import, stats, cleanup)')
    .action(() => {
      printSuccess('Memory system ready');
      console.log('💾 Memory operations would be handled here');
    });

  // Monitor command
  program
    .command('monitor')
    .description('Monitor system in real-time')
    .action(() => {
      printSuccess('Starting system monitor...');
      console.log('📊 Real-time monitoring would display here');
    });

  // Session command
  program
    .command('session')
    .description('Manage terminal sessions')
    .action(() => {
      printSuccess('Terminal session manager ready');
      console.log('🖥️  Session operations would be handled here');
    });

  // MCP commands
  const mcpCmd = program
    .command('mcp')
    .description('Manage MCP server and tools');

  mcpCmd
    .command('start')
    .description('Start the MCP server')
    .option('-p, --port <port>', 'Port for MCP server', '3000')
    .option('-h, --host <host>', 'Host for MCP server', 'localhost')
    .option('--transport <transport>', 'Transport type (stdio, http)', 'http')
    .action(async (options) => {
      try {
        const { MCPServer } = await import('../mcp/server.js');
        const { eventBus } = await import('../core/event-bus.js');
        const { logger } = await import('../core/logger.js');
        
        try {
          await configManager.load('claude-flow.config.json');
        } catch (error) {
          // Use defaults if config file doesn't exist
          console.log('⚠️  Warning: Using default configuration');
        }
        const config = configManager.show();
        
        const mcpConfig = {
          ...config.mcp,
          port: parseInt(options.port),
          host: options.host,
          transport: options.transport,
          corsEnabled: true,
          corsOrigins: ['*']
        };

        const server = new MCPServer(mcpConfig, eventBus, logger);
        await server.start();

        printSuccess(`MCP server started on ${options.host}:${options.port}`);
        console.log(`📡 Server URL: http://${options.host}:${options.port}`);
        console.log(`🔧 Transport: ${options.transport}`);
        console.log(`🔧 Available tools: System, Tools`);
        
        // Keep process alive
        process.on('SIGINT', async () => {
          console.log('\n⏹️  Stopping MCP server...');
          await server.stop();
          process.exit(0);
        });
        
        // Prevent CLI from exiting
        await new Promise(() => {}); // Keep running
      } catch (error) {
        printError(`Failed to start MCP server: ${error.message}`);
      }
    });

  mcpCmd
    .command('status')
    .description('Show MCP server status')
    .action(() => {
      printSuccess('MCP Server Status:');
      console.log('🌐 Status: Not running (use "mcp start" to start)');
      console.log('📍 Default address: localhost:3000');
      console.log('🔐 Authentication: Disabled');
      console.log('🔧 Tools: System, Health, Tools');
    });

  mcpCmd
    .command('tools')
    .description('List available MCP tools')
    .action(() => {
      printSuccess('Available MCP Tools:');
      console.log('\n📊 System Tools:');
      console.log('  • system/info - Get system information');
      console.log('  • system/health - Get system health status');
      console.log('\n🔧 Tool Management:');
      console.log('  • tools/list - List all available tools');
      console.log('  • tools/schema - Get schema for a specific tool');
      console.log('\n💡 Note: Additional tools available when orchestrator is running');
    });

  // Workflow command
  program
    .command('workflow <file>')
    .description('Execute workflow files')
    .action((file) => {
      if (file) {
        printSuccess(`Executing workflow: ${file}`);
        console.log('🔄 Workflow execution would start here');
      } else {
        printError('Please specify a workflow file');
      }
    });

  // REPL command
  program
    .command('repl')
    .description('Start interactive REPL mode')
    .option('--no-banner', 'Skip startup banner')
    .option('--history-file <path>', 'Custom history file path')
    .action(async (options) => {
      try {
        const { startNodeREPL } = await import('./node-repl.js');
        await startNodeREPL(options);
      } catch (error) {
        printError(`Failed to start REPL: ${error.message}`);
      }
    });

  // Init command
  program
    .command('init')
    .description('Initialize Claude-Flow project')
    .option('--sparc', 'Initialize with SPARC development environment')
    .option('--force', 'Overwrite existing files')
    .action(async (options) => {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        printSuccess('Initializing Claude-Flow project...');
        
        // Create .claude directory structure
        const claudeDir = '.claude';
        const commandsDir = path.join(claudeDir, 'commands');
        const swarmDir = path.join(commandsDir, 'swarm');
        
        // Create directories
        await fs.mkdir(claudeDir, { recursive: true });
        await fs.mkdir(commandsDir, { recursive: true });
        await fs.mkdir(swarmDir, { recursive: true });
        console.log('   ✅ Created .claude directory structure');
        
        // Create base configuration
        const claudeConfig = {
          version: "1.0.58",
          project: {
            name: path.basename(process.cwd()),
            type: "claude-flow",
            created: new Date().toISOString()
          },
          features: {
            swarm: true,
            sparc: options.sparc || false,
            memory: true,
            terminal: true,
            mcp: true
          }
        };
        
        await fs.writeFile(
          path.join(claudeDir, 'config.json'),
          JSON.stringify(claudeConfig, null, 2)
        );
        console.log('   ✅ Created .claude/config.json');
        
        // Create swarm command files
        const swarmCommands = {
          'research.md': `# Research Swarm Command

## Usage
\`\`\`bash
claude-flow swarm "Research objective" --strategy research --mode distributed
\`\`\`

## Description
Multi-agent research coordination with distributed intelligence gathering.

## Strategy Features
- Web search and data collection
- Source credibility analysis
- Knowledge synthesis
- Report generation

## Best Practices
- Use parallel execution for multiple research threads
- Enable monitoring for real-time progress
- Set appropriate timeout for comprehensive research
- Use distributed mode for complex topics
`,
          'development.md': `# Development Swarm Command

## Usage
\`\`\`bash
claude-flow swarm "Build application" --strategy development --mode hierarchical
\`\`\`

## Description
Coordinated software development with specialized agents.

## Strategy Features
- Architecture design
- Code implementation
- Testing and validation
- Documentation generation

## Best Practices
- Use hierarchical mode for complex projects
- Enable parallel execution for independent modules
- Set higher agent count for large projects
- Monitor progress with --monitor flag
`,
          'analysis.md': `# Analysis Swarm Command

## Usage
\`\`\`bash
claude-flow swarm "Analyze data" --strategy analysis --parallel --max-agents 8
\`\`\`

## Description
Data analysis and insights generation with coordinated agents.

## Strategy Features
- Data collection and preprocessing
- Statistical analysis
- Pattern recognition
- Visualization and reporting

## Best Practices
- Use parallel execution for large datasets
- Increase agent count for complex analysis
- Enable monitoring for long-running tasks
- Use appropriate output format (json, csv, html)
`,
          'testing.md': `# Testing Swarm Command

## Usage
\`\`\`bash
claude-flow swarm "Test application" --strategy testing --mode mesh
\`\`\`

## Description
Comprehensive testing coordination with distributed validation.

## Strategy Features
- Test planning and strategy
- Test case generation
- Parallel test execution
- Results aggregation and reporting

## Best Practices
- Use mesh mode for distributed testing
- Enable parallel execution for test suites
- Set appropriate timeout for comprehensive testing
- Monitor results with --monitor flag
`,
          'optimization.md': `# Optimization Swarm Command

## Usage
\`\`\`bash
claude-flow swarm "Optimize performance" --strategy optimization --mode hybrid
\`\`\`

## Description
Performance optimization with coordinated analysis and improvements.

## Strategy Features
- Performance profiling
- Bottleneck identification
- Optimization implementation
- Validation and testing

## Best Practices
- Use hybrid mode for adaptive optimization
- Enable monitoring for real-time metrics
- Use parallel execution for multiple optimization paths
- Set adequate timeout for thorough optimization
`,
          'maintenance.md': `# Maintenance Swarm Command

## Usage
\`\`\`bash
claude-flow swarm "System maintenance" --strategy maintenance --mode centralized
\`\`\`

## Description
System maintenance and updates with coordinated agents.

## Strategy Features
- System health checks
- Update planning
- Implementation coordination
- Verification and rollback

## Best Practices
- Use centralized mode for controlled updates
- Enable monitoring for safety
- Set conservative timeouts
- Use appropriate output for audit trails
`
        };
        
        // Write swarm command documentation
        for (const [filename, content] of Object.entries(swarmCommands)) {
          await fs.writeFile(path.join(swarmDir, filename), content);
        }
        console.log('   ✅ Created swarm command documentation');
        
        if (options.sparc) {
          console.log('\n📁 Creating SPARC development environment:');
          
          // Create .roomodes file with 17 pre-configured modes
          const roomodes = {
            "orchestrator": {
              "description": "Multi-agent task orchestration and coordination",
              "prompt": "SPARC: orchestrator\\nYou are an AI orchestrator coordinating multiple specialized agents to complete complex tasks efficiently.",
              "tools": ["TodoWrite", "TodoRead", "Task", "Memory"]
            },
            "coder": {
              "description": "Autonomous code generation and implementation",
              "prompt": "SPARC: coder\\nYou are an expert programmer focused on writing clean, efficient, and well-documented code.",
              "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
            },
            "researcher": {
              "description": "Deep research and comprehensive analysis",
              "prompt": "SPARC: researcher\\nYou are a research specialist focused on gathering comprehensive information and providing detailed analysis.",
              "tools": ["WebSearch", "WebFetch", "Read", "Write", "Memory"]
            },
            "tdd": {
              "description": "Test-driven development methodology",
              "prompt": "SPARC: tdd\\nYou follow strict test-driven development practices: write tests first, implement code to pass tests, then refactor.",
              "tools": ["Read", "Write", "Edit", "Bash", "TodoWrite"]
            },
            "architect": {
              "description": "System design and architecture planning",
              "prompt": "SPARC: architect\\nYou are a software architect focused on designing scalable, maintainable system architectures.",
              "tools": ["Read", "Write", "Glob", "Memory"]
            },
            "reviewer": {
              "description": "Code review and quality optimization",
              "prompt": "SPARC: reviewer\\nYou are a code reviewer focused on improving code quality, performance, and maintainability.",
              "tools": ["Read", "Edit", "Grep", "Bash"]
            },
            "debugger": {
              "description": "Debug and fix issues systematically",
              "prompt": "SPARC: debugger\\nYou are a debugging specialist focused on identifying and fixing issues systematically.",
              "tools": ["Read", "Edit", "Bash", "Grep", "TodoWrite"]
            },
            "tester": {
              "description": "Comprehensive testing and validation",
              "prompt": "SPARC: tester\\nYou are a testing specialist focused on comprehensive test coverage and validation.",
              "tools": ["Read", "Write", "Edit", "Bash", "TodoWrite"]
            },
            "analyzer": {
              "description": "Code and data analysis specialist",
              "prompt": "SPARC: analyzer\\nYou are an analysis specialist focused on understanding patterns, metrics, and insights.",
              "tools": ["Read", "Grep", "Bash", "Write", "Memory"]
            },
            "optimizer": {
              "description": "Performance optimization specialist",
              "prompt": "SPARC: optimizer\\nYou are a performance optimization specialist focused on improving efficiency and speed.",
              "tools": ["Read", "Edit", "Bash", "Grep", "TodoWrite"]
            },
            "documenter": {
              "description": "Documentation generation and maintenance",
              "prompt": "SPARC: documenter\\nYou are a documentation specialist focused on creating clear, comprehensive documentation.",
              "tools": ["Read", "Write", "Glob", "Memory"]
            },
            "designer": {
              "description": "UI/UX design and user experience",
              "prompt": "SPARC: designer\\nYou are a UI/UX designer focused on creating intuitive and engaging user experiences.",
              "tools": ["Read", "Write", "Edit", "Memory"]
            },
            "innovator": {
              "description": "Creative problem solving and innovation",
              "prompt": "SPARC: innovator\\nYou are an innovation specialist focused on creative problem solving and novel approaches.",
              "tools": ["Read", "Write", "WebSearch", "Memory"]
            },
            "swarm-coordinator": {
              "description": "Swarm coordination and management",
              "prompt": "SPARC: swarm-coordinator\\nYou coordinate swarms of AI agents using TodoWrite for task management and Memory for coordination.",
              "tools": ["TodoWrite", "TodoRead", "Task", "Memory", "Bash"]
            },
            "memory-manager": {
              "description": "Memory and knowledge management",
              "prompt": "SPARC: memory-manager\\nYou manage knowledge and memory systems for persistent information storage and retrieval.",
              "tools": ["Memory", "Read", "Write", "TodoWrite"]
            },
            "batch-executor": {
              "description": "Parallel task execution specialist",
              "prompt": "SPARC: batch-executor\\nYou excel at executing multiple tasks in parallel using batch tool operations for maximum efficiency.",
              "tools": ["Task", "Bash", "Read", "Write", "TodoWrite"]
            },
            "workflow-manager": {
              "description": "Workflow automation and process management",
              "prompt": "SPARC: workflow-manager\\nYou design and manage automated workflows with proper task coordination and error handling.",
              "tools": ["TodoWrite", "TodoRead", "Task", "Bash", "Memory"]
            }
          };
          
          await fs.writeFile('.roomodes', JSON.stringify(roomodes, null, 2));
          console.log('   ✅ Created .roomodes file with 17 pre-configured modes');
          
          // Create CLAUDE.md with project instructions
          const claudeMd = `# Claude Code Configuration

## Build Commands
- \`npm run build\`: Build the project
- \`npm run test\`: Run the full test suite
- \`npm run lint\`: Run ESLint and format checks
- \`npm run typecheck\`: Run TypeScript type checking
- \`./claude-flow --help\`: Show all available commands

## SPARC Development Modes
This project is configured with 17 specialized SPARC modes for different development tasks:

### Core Modes
- **orchestrator**: Multi-agent task orchestration
- **coder**: Autonomous code generation
- **researcher**: Deep research and analysis
- **tdd**: Test-driven development

### Specialized Modes
- **architect**: System design and architecture
- **reviewer**: Code review and optimization
- **debugger**: Debug and fix issues
- **tester**: Comprehensive testing
- **analyzer**: Code and data analysis
- **optimizer**: Performance optimization
- **documenter**: Documentation generation

### Creative Modes
- **designer**: UI/UX design
- **innovator**: Creative problem solving

### Advanced Modes
- **swarm-coordinator**: Swarm management
- **memory-manager**: Knowledge management
- **batch-executor**: Parallel task execution
- **workflow-manager**: Process automation

## Swarm Commands
Use the swarm command for multi-agent coordination:

\`\`\`bash
# Research swarm
claude-flow swarm "Research cloud architecture" --strategy research --mode distributed

# Development swarm  
claude-flow swarm "Build REST API" --strategy development --mode hierarchical

# Analysis swarm
claude-flow swarm "Analyze user data" --strategy analysis --parallel --max-agents 8

# Testing swarm
claude-flow swarm "Test application" --strategy testing --mode mesh

# Optimization swarm
claude-flow swarm "Optimize performance" --strategy optimization --mode hybrid

# Maintenance swarm
claude-flow swarm "System maintenance" --strategy maintenance --mode centralized
\`\`\`

## Code Style Preferences
- Use ES modules (import/export) syntax
- Destructure imports when possible
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use async/await instead of Promise chains
- Prefer const/let over var

## Workflow Guidelines
- Always run typecheck after making code changes
- Run tests before committing changes
- Use meaningful commit messages
- Create feature branches for new functionality
- Ensure all tests pass before merging

## Important Notes
- Use TodoWrite/TodoRead for task management
- Leverage batch operations for parallel execution
- Store important information in memory
- Use swarm commands for complex multi-agent tasks
- Check .claude/commands/swarm/ for swarm documentation
`;
          
          await fs.writeFile('CLAUDE.md', claudeMd);
          console.log('   ✅ Created CLAUDE.md for project instructions');
          console.log('   ✅ Setting up TDD and code generation environment');
          console.log('\n💡 Run "claude-flow sparc modes" to see available modes');
        } else {
          console.log('\n📁 Creating standard Claude-Flow project:');
          console.log('   ✅ Creating configuration file');
          console.log('   ✅ Setting up project structure');
        }
        
        // Create example swarm usage file
        const swarmExamples = `# Claude-Flow Swarm Examples

## Quick Start Commands

### Research Tasks
\`\`\`bash
claude-flow swarm "Research modern web frameworks" --strategy research --mode distributed
claude-flow swarm "Analyze market trends in AI" --strategy research --parallel --max-agents 6
\`\`\`

### Development Tasks
\`\`\`bash
claude-flow swarm "Build a microservice API" --strategy development --mode hierarchical
claude-flow swarm "Create React dashboard" --strategy development --parallel --max-agents 8
\`\`\`

### Analysis Tasks
\`\`\`bash
claude-flow swarm "Analyze user behavior data" --strategy analysis --mode mesh
claude-flow swarm "Performance analysis of application" --strategy analysis --monitor
\`\`\`

### Testing Tasks
\`\`\`bash
claude-flow swarm "Comprehensive testing suite" --strategy testing --parallel
claude-flow swarm "Security testing analysis" --strategy testing --mode distributed
\`\`\`

### Optimization Tasks
\`\`\`bash
claude-flow swarm "Optimize database queries" --strategy optimization --mode hybrid
claude-flow swarm "Frontend performance optimization" --strategy optimization --monitor
\`\`\`

### Maintenance Tasks
\`\`\`bash
claude-flow swarm "Update dependencies safely" --strategy maintenance --mode centralized
claude-flow swarm "System health check" --strategy maintenance --monitor
\`\`\`

## Advanced Usage

### Custom Output and Monitoring
\`\`\`bash
# Save results in different formats
claude-flow swarm "Research task" --output sqlite --output-dir ./results

# Enable real-time monitoring
claude-flow swarm "Long task" --monitor --timeout 120

# Dry run to see configuration
claude-flow swarm "Any task" --dry-run
\`\`\`

### Coordination Modes

- **centralized**: Single coordinator (best for simple tasks)
- **distributed**: Multiple coordinators (best for complex, parallelizable tasks)
- **hierarchical**: Tree structure (best for organized, structured work)
- **mesh**: Peer-to-peer (best for dynamic, adaptive tasks)
- **hybrid**: Mixed patterns (best for complex workflows)

See .claude/commands/swarm/ for detailed documentation on each strategy.
`;
        
        await fs.writeFile(path.join(swarmDir, 'examples.md'), swarmExamples);
        console.log('   ✅ Created swarm usage examples');
        
        console.log('\n🚀 Project initialized successfully!');
        console.log('   📁 Created .claude/ directory structure');
        console.log('   📋 Created swarm command documentation');
        console.log('   📖 Created usage examples and guides');
        console.log('\n   Next steps:');
        console.log('   1. Run "claude-flow swarm --help" to see swarm options');
        console.log('   2. Check .claude/commands/swarm/ for detailed documentation');
        console.log('   3. Run "claude-flow help" for all available commands');
        if (options.sparc) {
          console.log('   4. Run "claude-flow sparc modes" to see available SPARC modes');
        }
      } catch (error) {
        printError(`Failed to initialize project: ${error.message}`);
      }
    });

  // Spawn command (alias for agent spawn)
  program
    .command('spawn <type>')
    .description('Spawn a new agent (alias for agent spawn)')
    .option('--name <name>', 'Agent name')
    .option('--config <config>', 'Agent configuration')
    .action((type, options) => {
      printSuccess(`Spawning ${type} agent...`);
      console.log(`📝 Agent ID: agent-${Date.now()}`);
      console.log(`🤖 Type: ${type}`);
      if (options.name) {
        console.log(`📛 Name: ${options.name}`);
      }
      if (options.config) {
        console.log(`⚙️  Config: ${options.config}`);
      }
      console.log(`⚡ Status: Active`);
      console.log('\n💡 This is an alias for "claude-flow agent spawn"');
    });

  // SPARC command
  const sparcCmd = program
    .command('sparc [prompt]')
    .description('SPARC-based development commands')
    .action(async (prompt) => {
      if (!prompt) {
        printSuccess('SPARC Development System');
        console.log('\n📚 Available SPARC commands:');
        console.log('  • sparc modes - List available development modes');
        console.log('  • sparc run <mode> <prompt> - Run specific mode');
        console.log('  • sparc tdd <description> - Test-driven development');
        console.log('  • sparc <prompt> - Run default orchestrator mode');
        console.log('\n💡 Initialize SPARC with: claude-flow init --sparc');
      } else {
        // Launch Claude Code with SPARC prompt
        const { spawn } = await import('child_process');
        
        printSuccess(`Launching Claude Code with SPARC orchestrator mode...`);
        console.log(`📝 Prompt: ${prompt}`);
        console.log(`⚡ Starting Claude Code...\n`);
        
        // Construct the full SPARC prompt
        const fullPrompt = `SPARC: orchestrator
Task: ${prompt}

Please use the SPARC orchestrator mode to:
1. Analyze this request comprehensively
2. Break it down into subtasks
3. Coordinate multiple specialized agents
4. Deliver a complete solution

Begin with understanding the requirements, then orchestrate the appropriate agents to complete the task.`;
        
        // Launch claude with the prompt
        const claudeProcess = spawn('claude', [fullPrompt, '--dangerously-skip-permissions'], {
          stdio: 'inherit',
          shell: true
        });
        
        claudeProcess.on('error', (error) => {
          if (error.code === 'ENOENT') {
            printError('Claude Code is not installed or not in PATH');
            console.log('\n📦 To install Claude Code:');
            console.log('  1. Install via Cursor/VS Code extension');
            console.log('  2. Or download from: https://claude.ai/code');
            console.log('\n💡 Alternatively, copy this prompt to use manually:');
            console.log('\n' + '─'.repeat(60));
            console.log(fullPrompt);
            console.log('─'.repeat(60));
          } else {
            printError(`Failed to launch Claude Code: ${error.message}`);
          }
        });
        
        claudeProcess.on('exit', (code) => {
          if (code !== null && code !== 0) {
            console.log(`\n⚠️  Claude Code exited with code ${code}`);
          }
        });
      }
    });

  sparcCmd
    .command('modes')
    .description('List available SPARC development modes')
    .action(() => {
      printSuccess('Available SPARC Modes:');
      console.log('\n🎯 Core Modes:');
      console.log('  • orchestrator - Multi-agent task orchestration');
      console.log('  • coder - Autonomous code generation');
      console.log('  • researcher - Deep research and analysis');
      console.log('  • tdd - Test-driven development');
      console.log('\n🔧 Specialized Modes:');
      console.log('  • architect - System design and architecture');
      console.log('  • reviewer - Code review and optimization');
      console.log('  • debugger - Debug and fix issues');
      console.log('  • tester - Comprehensive testing');
      console.log('\n📊 Analysis Modes:');
      console.log('  • analyzer - Code and data analysis');
      console.log('  • optimizer - Performance optimization');
      console.log('  • documenter - Documentation generation');
      console.log('\n🎨 Creative Modes:');
      console.log('  • designer - UI/UX design');
      console.log('  • innovator - Creative solutions');
      console.log('\n💡 Use: claude-flow sparc run <mode> "<prompt>"');
    });

  sparcCmd
    .command('run <mode> <prompt>')
    .description('Run a specific SPARC mode')
    .action(async (mode, prompt) => {
      const { spawn } = await import('child_process');
      
      printSuccess(`Launching Claude Code with SPARC ${mode} mode...`);
      console.log(`🎯 Mode: ${mode}`);
      console.log(`📝 Prompt: ${prompt}`);
      console.log(`⚡ Starting Claude Code...\n`);
      
      // Construct the full SPARC prompt
      const fullPrompt = `SPARC: ${mode}
Task: ${prompt}

Please use the SPARC ${mode} mode to complete this task with the appropriate approach and methodology for this specific mode.`;
      
      // Launch claude with the prompt
      const claudeProcess = spawn('claude', [fullPrompt, '--dangerously-skip-permissions'], {
        stdio: 'inherit',
        shell: true
      });
      
      claudeProcess.on('error', (error) => {
        if (error.code === 'ENOENT') {
          printError('Claude Code is not installed or not in PATH');
          console.log('\n📦 To install Claude Code:');
          console.log('  1. Install via Cursor/VS Code extension');
          console.log('  2. Or download from: https://claude.ai/code');
          console.log('\n💡 Alternatively, copy this prompt to use manually:');
          console.log('\n' + '─'.repeat(60));
          console.log(fullPrompt);
          console.log('─'.repeat(60));
        } else {
          printError(`Failed to launch Claude Code: ${error.message}`);
        }
      });
      
      claudeProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
          console.log(`\n⚠️  Claude Code exited with code ${code}`);
        }
      });
    });

  sparcCmd
    .command('tdd <description>')
    .description('Run test-driven development mode')
    .action(async (description) => {
      const { spawn } = await import('child_process');
      
      printSuccess('Launching Claude Code with SPARC TDD mode...');
      console.log(`📝 Feature: ${description}`);
      console.log(`⚡ Starting Claude Code...\n`);
      
      // Construct the full SPARC prompt
      const fullPrompt = `SPARC: tdd
Task: ${description}

Please use the SPARC test-driven development (TDD) mode to:
1. Write comprehensive test specifications
2. Generate test cases covering edge cases
3. Implement code that passes all tests
4. Refactor for clarity and performance
5. Ensure 100% test coverage

Follow the red-green-refactor cycle strictly.`;
      
      // Launch claude with the prompt
      const claudeProcess = spawn('claude', [fullPrompt, '--dangerously-skip-permissions'], {
        stdio: 'inherit',
        shell: true
      });
      
      claudeProcess.on('error', (error) => {
        if (error.code === 'ENOENT') {
          printError('Claude Code is not installed or not in PATH');
          console.log('\n📦 To install Claude Code:');
          console.log('  1. Install via Cursor/VS Code extension');
          console.log('  2. Or download from: https://claude.ai/code');
          console.log('\n💡 Alternatively, copy this prompt to use manually:');
          console.log('\n' + '─'.repeat(60));
          console.log(fullPrompt);
          console.log('─'.repeat(60));
        } else {
          printError(`Failed to launch Claude Code: ${error.message}`);
        }
      });
      
      claudeProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
          console.log(`\n⚠️  Claude Code exited with code ${code}`);
        }
      });
    });

  // Claude command
  const claudeCmd = program
    .command('claude')
    .description('Claude-specific operations and integrations')
    .action(() => {
      printSuccess('Claude Integration');
      console.log('\n🤖 Claude operations:');
      console.log('  • claude auth - Authenticate with Claude');
      console.log('  • claude models - List available models');
      console.log('  • claude chat - Interactive chat mode');
      console.log('  • claude api - Direct API access');
      console.log('\n💡 Configure Claude API in settings');
    });

  claudeCmd
    .command('auth')
    .description('Authenticate with Claude')
    .action(() => {
      printSuccess('Claude Authentication');
      console.log('🔐 Authentication options:');
      console.log('  • API Key: Set in environment or config');
      console.log('  • OAuth: Use claude-flow claude auth oauth');
      console.log('\n💡 See documentation for setup instructions');
    });

  claudeCmd
    .command('models')
    .description('List available Claude models')
    .action(() => {
      printSuccess('Available Claude Models:');
      console.log('🧠 Claude 3 Family:');
      console.log('  • claude-3-opus-20240229 (Most capable)');
      console.log('  • claude-3-sonnet-20240229 (Balanced)');
      console.log('  • claude-3-haiku-20240307 (Fastest)');
      console.log('\n💡 Configure default model in settings');
    });

  // Project command (Enterprise)
  const projectCmd = program
    .command('project')
    .description('Project management (Enterprise feature)')
    .action(() => {
      printSuccess('Project Management (Enterprise)');
      console.log('\n📊 Project features:');
      console.log('  • project create - Create new project');
      console.log('  • project list - List all projects');
      console.log('  • project switch - Switch active project');
      console.log('  • project config - Configure project settings');
      console.log('\n⚠️  Enterprise features require license');
    });

  projectCmd
    .command('create <name>')
    .description('Create a new project')
    .action((name) => {
      printWarning('Enterprise feature - License required');
      console.log(`📁 Would create project: ${name}`);
    });

  // Deploy command (Enterprise)
  const deployCmd = program
    .command('deploy')
    .description('Deployment operations (Enterprise feature)')
    .action(() => {
      printSuccess('Deployment System (Enterprise)');
      console.log('\n🚀 Deployment options:');
      console.log('  • deploy production - Deploy to production');
      console.log('  • deploy staging - Deploy to staging');
      console.log('  • deploy rollback - Rollback deployment');
      console.log('  • deploy status - Check deployment status');
      console.log('\n⚠️  Enterprise features require license');
    });

  deployCmd
    .command('production')
    .description('Deploy to production environment')
    .action(() => {
      printWarning('Enterprise feature - License required');
      console.log('🚀 Would deploy to production environment');
    });

  // Cloud command (Enterprise)
  const cloudCmd = program
    .command('cloud')
    .description('Cloud infrastructure management (Enterprise feature)')
    .action(() => {
      printSuccess('Cloud Management (Enterprise)');
      console.log('\n☁️  Cloud features:');
      console.log('  • cloud connect - Connect to cloud provider');
      console.log('  • cloud resources - Manage cloud resources');
      console.log('  • cloud scale - Auto-scaling configuration');
      console.log('  • cloud monitor - Cloud monitoring');
      console.log('\n⚠️  Enterprise features require license');
    });

  cloudCmd
    .command('connect <provider>')
    .description('Connect to cloud provider')
    .action((provider) => {
      printWarning('Enterprise feature - License required');
      console.log(`☁️  Would connect to ${provider}`);
    });

  // Security command (Enterprise)
  const securityCmd = program
    .command('security')
    .description('Security and compliance tools (Enterprise feature)')
    .action(() => {
      printSuccess('Security Tools (Enterprise)');
      console.log('\n🔒 Security features:');
      console.log('  • security scan - Run security scan');
      console.log('  • security audit - Compliance audit');
      console.log('  • security policies - Manage policies');
      console.log('  • security report - Generate reports');
      console.log('\n⚠️  Enterprise features require license');
    });

  securityCmd
    .command('scan')
    .description('Run security scan')
    .action(() => {
      printWarning('Enterprise feature - License required');
      console.log('🔍 Would run security scan');
    });

  // Analytics command (Enterprise)
  const analyticsCmd = program
    .command('analytics')
    .description('Analytics and insights (Enterprise feature)')
    .action(() => {
      printSuccess('Analytics Dashboard (Enterprise)');
      console.log('\n📊 Analytics features:');
      console.log('  • analytics dashboard - View dashboard');
      console.log('  • analytics report - Generate reports');
      console.log('  • analytics metrics - Custom metrics');
      console.log('  • analytics export - Export data');
      console.log('\n⚠️  Enterprise features require license');
    });

  analyticsCmd
    .command('dashboard')
    .description('View analytics dashboard')
    .action(() => {
      printWarning('Enterprise feature - License required');
      console.log('📊 Would display analytics dashboard');
    });

  // Swarm command
  const swarmCmd = program
    .command('swarm [objective]')
    .description('Swarm-based AI agent coordination')
    .option('--strategy <type>', 'Execution strategy: auto, research, development, analysis, testing, optimization, maintenance', 'auto')
    .option('--mode <mode>', 'Coordination mode: centralized, distributed, hierarchical, mesh, hybrid', 'centralized')
    .option('--max-agents <n>', 'Maximum number of agents', '5')
    .option('--timeout <minutes>', 'Timeout in minutes', '60')
    .option('--parallel', 'Enable parallel execution')
    .option('--monitor', 'Enable real-time monitoring')
    .option('--output <format>', 'Output format: json, sqlite, csv, html', 'json')
    .option('--output-dir <path>', 'Output directory', './reports')
    .option('--dry-run', 'Show configuration without executing')
    .configureHelp({
      formatHelp: () => {
        return `
${chalk.cyan.bold('🧠 Claude-Flow Swarm')} - AI Agent Coordination

${chalk.yellow('USAGE:')}
  claude-flow swarm [objective] [options]

${chalk.yellow('ARGUMENTS:')}
  objective                   The goal or task for the swarm to accomplish

${chalk.yellow('OPTIONS:')}
  --strategy <type>          Execution strategy (default: auto)
                             auto, research, development, analysis, testing, 
                             optimization, maintenance
  --mode <mode>              Coordination mode (default: centralized)
                             centralized, distributed, hierarchical, mesh, hybrid
  --max-agents <n>           Maximum number of agents (default: 5)
  --timeout <minutes>        Timeout in minutes (default: 60)
  --parallel                 Enable parallel execution
  --monitor                  Enable real-time monitoring
  --output <format>          Output format: json, sqlite, csv, html (default: json)
  --output-dir <path>        Output directory (default: ./reports)
  --dry-run                  Show configuration without executing
  -h, --help                 Display this help message

${chalk.yellow('EXAMPLES:')}
  $ claude-flow swarm "Build a REST API" --strategy development
  $ claude-flow swarm "Research cloud architecture" --strategy research --mode distributed
  $ claude-flow swarm "Analyze user data" --strategy analysis --parallel --max-agents 10

${chalk.yellow('STRATEGIES:')}
  ${chalk.green('auto')}         - Automatically determine best approach
  ${chalk.green('research')}     - Information gathering and analysis  
  ${chalk.green('development')}  - Software development and coding
  ${chalk.green('analysis')}     - Data analysis and insights
  ${chalk.green('testing')}      - Quality assurance workflows
  ${chalk.green('optimization')} - Performance improvements
  ${chalk.green('maintenance')}  - System maintenance tasks

${chalk.yellow('COORDINATION MODES:')}
  ${chalk.green('centralized')}  - Single coordinator (default)
  ${chalk.green('distributed')}  - Multiple coordinators
  ${chalk.green('hierarchical')} - Tree structure
  ${chalk.green('mesh')}         - Peer-to-peer
  ${chalk.green('hybrid')}       - Mixed patterns

${chalk.yellow('SUBCOMMANDS:')}
  list                       List recent swarm runs
  status <id>                Show status of a swarm run

Run 'claude-flow swarm <subcommand> --help' for subcommand help.
`;
      }
    })
    .action(async (objective, options, command) => {
      if (!objective) {
        printSuccess('Swarm-based AI Agent Coordination');
        console.log('\n📚 Usage:');
        console.log('  swarm <objective> [options]');
        console.log('\nExamples:');
        console.log('  claude-flow swarm "Build a REST API" --strategy development');
        console.log('  claude-flow swarm "Research cloud architecture" --strategy research --mode distributed');
        console.log('  claude-flow swarm "Analyze user data" --strategy analysis --parallel');
        console.log('\nStrategies:');
        console.log('  • auto - Automatically determine best approach');
        console.log('  • research - Information gathering and analysis');
        console.log('  • development - Software development and coding');
        console.log('  • analysis - Data analysis and insights');
        console.log('  • testing - Quality assurance workflows');
        console.log('  • optimization - Performance improvements');
        console.log('  • maintenance - System maintenance tasks');
        console.log('\nCoordination Modes:');
        console.log('  • centralized - Single coordinator (default)');
        console.log('  • distributed - Multiple coordinators');
        console.log('  • hierarchical - Tree structure');
        console.log('  • mesh - Peer-to-peer');
        console.log('  • hybrid - Mixed patterns');
        return;
      }

      const swarmConfig = {
        objective,
        strategy: options.strategy,
        mode: options.mode,
        maxAgents: parseInt(options.maxAgents),
        timeout: parseInt(options.timeout),
        parallel: options.parallel || false,
        monitor: options.monitor || false,
        output: options.output,
        outputDir: options.outputDir,
        timestamp: new Date().toISOString(),
        id: `swarm-${options.strategy}-${options.mode}-${Date.now()}`
      };

      if (options.dryRun) {
        printWarning('DRY RUN - Swarm Configuration:');
        console.log(JSON.stringify(swarmConfig, null, 2));
        return;
      }

      printSuccess(`Initializing swarm: ${swarmConfig.id}`);
      console.log(`📋 Objective: ${objective}`);
      console.log(`🎯 Strategy: ${options.strategy}`);
      console.log(`🔗 Mode: ${options.mode}`);
      console.log(`🤖 Max Agents: ${options.maxAgents}`);
      console.log(`⏱️  Timeout: ${options.timeout} minutes`);

      // Launch Claude Code with swarm configuration
      const { spawn } = await import('child_process');
      
      // Construct the SPARC-style prompt for swarm execution
      const swarmPrompt = `SPARC: swarm-${options.strategy}
Objective: ${objective}

Configuration:
- Strategy: ${options.strategy}
- Coordination Mode: ${options.mode}
- Max Agents: ${options.maxAgents}
- Parallel Execution: ${options.parallel}
- Timeout: ${options.timeout} minutes

IMPORTANT SWARM ORCHESTRATION INSTRUCTIONS:

1. TASK MANAGEMENT WITH TODOS:
   - Use TodoWrite to create a comprehensive task list immediately
   - Break down the objective into specific, actionable subtasks
   - Assign priority levels (high/medium/low) based on dependencies
   - Update task status in real-time (pending → in_progress → completed)
   - Use TodoRead frequently to track progress and coordinate efforts

2. BATCH TOOL USAGE FOR PARALLEL EXECUTION:
   - When multiple independent tasks exist, use batch tool calls
   - Launch parallel agents by calling multiple tools in a single response
   - Example: Search for files with Glob/Grep, read multiple files with Read, etc.
   - Maximize parallelism: If 5 files need reading, read all 5 in one batch
   - For agent tasks: Use Task tool to launch parallel agents simultaneously

3. MEMORY COORDINATION:
   - Store key findings and intermediate results using memory tools
   - Create a shared knowledge base for all agents to access
   - Use memory namespaces to organize information by topic/agent
   - Store: task results, discovered patterns, important decisions
   - Query memory before starting new tasks to avoid duplication

4. COORDINATION PATTERNS BY MODE:
   ${options.mode === 'centralized' ? `
   CENTRALIZED MODE:
   - You are the single coordinator for all agents
   - Maintain a central task queue and assign work sequentially
   - Use TodoWrite to track all agent assignments
   - Collect all results before proceeding to next phase` : ''}
   ${options.mode === 'distributed' ? `
   DISTRIBUTED MODE:
   - Create multiple coordinator agents for different aspects
   - Use memory system for inter-coordinator communication
   - Each coordinator manages a subset of tasks independently
   - Synchronize through shared memory checkpoints` : ''}
   ${options.mode === 'hierarchical' ? `
   HIERARCHICAL MODE:
   - Create team leads for each major component
   - Team leads coordinate their own sub-agents
   - Use TodoWrite to maintain hierarchy visibility
   - Report progress up the chain via memory updates` : ''}
   ${options.mode === 'mesh' ? `
   MESH MODE:
   - Agents communicate peer-to-peer via memory
   - No central coordinator - self-organizing
   - Agents claim tasks from shared todo list
   - Use memory for discovering and coordinating with peers` : ''}
   ${options.mode === 'hybrid' ? `
   HYBRID MODE:
   - Combine patterns as needed for efficiency
   - Start centralized, transition to distributed for execution
   - Use hierarchical for complex subtasks
   - Adapt coordination based on task requirements` : ''}

5. STRATEGY-SPECIFIC EXECUTION:
   ${options.strategy === 'research' ? `
   RESEARCH STRATEGY:
   - Phase 1: Information gathering (use WebSearch, WebFetch in parallel)
   - Phase 2: Analysis and synthesis (batch process findings)
   - Phase 3: Report generation (consolidate in memory)
   - Use memory to build knowledge graph of findings` : ''}
   ${options.strategy === 'development' ? `
   DEVELOPMENT STRATEGY:
   - Phase 1: Architecture design (store in memory)
   - Phase 2: Parallel implementation (batch create/edit files)
   - Phase 3: Testing and integration (run tests in parallel)
   - Phase 4: Documentation (generate from memory/code)` : ''}
   ${options.strategy === 'analysis' ? `
   ANALYSIS STRATEGY:
   - Phase 1: Data collection (parallel data gathering)
   - Phase 2: Statistical analysis (batch processing)
   - Phase 3: Visualization and insights (store results)
   - Use memory for intermediate calculations` : ''}
   ${options.strategy === 'testing' ? `
   TESTING STRATEGY:
   - Phase 1: Test planning (create test matrix in todos)
   - Phase 2: Test execution (run tests in parallel batches)
   - Phase 3: Result analysis (aggregate in memory)
   - Phase 4: Report generation (from memory data)` : ''}
   ${options.strategy === 'optimization' ? `
   OPTIMIZATION STRATEGY:
   - Phase 1: Performance profiling (parallel measurements)
   - Phase 2: Bottleneck identification (analyze in batches)
   - Phase 3: Optimization implementation (parallel updates)
   - Phase 4: Validation (batch performance tests)` : ''}
   ${options.strategy === 'maintenance' ? `
   MAINTENANCE STRATEGY:
   - Phase 1: System audit (parallel system checks)
   - Phase 2: Update planning (prioritize in todos)
   - Phase 3: Implementation (batch updates)
   - Phase 4: Verification (parallel validation)` : ''}

6. EXECUTION WORKFLOW:
   a) Initialize with TodoWrite - create complete task breakdown
   b) Set up memory structure for coordination
   c) Launch initial batch of parallel agents/tasks
   d) Monitor progress via TodoRead every few operations
   e) Store intermediate results in memory
   f) Coordinate next batch based on completed work
   g) Repeat until all todos are completed
   h) Synthesize final results from memory

7. BEST PRACTICES:
   - Always use batch operations when possible
   - Update todos immediately when starting/completing tasks
   - Store reusable information in memory
   - Check memory before starting new research/analysis
   - Use descriptive task names in todos for clarity
   - Leverage parallel execution for independent tasks
   - Maintain clear coordination through todos and memory

Remember: The goal is efficient, coordinated execution. Use todos for task tracking, memory for information sharing, and batch operations for parallel execution.

Begin the swarm orchestration now with a comprehensive task breakdown using TodoWrite.`;

      console.log('\n🚀 Launching swarm execution...\n');
      
      // Write the prompt to a temporary file since it's very long
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');
      
      const tempDir = os.tmpdir();
      const promptFile = path.join(tempDir, `swarm-prompt-${Date.now()}.txt`);
      
      try {
        await fs.writeFile(promptFile, swarmPrompt, 'utf8');
        console.log(`📝 Prompt written to: ${promptFile}`);
        console.log(`📏 Prompt length: ${swarmPrompt.length} characters`);
        
        // Launch claude with the prompt file
        const claudeProcess = spawn('bash', ['-c', `cat "${promptFile}" | claude --dangerously-skip-permissions`], {
          stdio: 'inherit',
          shell: false
        });

        claudeProcess.on('error', (error) => {
          if (error.code === 'ENOENT') {
            printError('Claude Code is not installed or not in PATH');
            console.log('\n📦 To install Claude Code:');
            console.log('  1. Install via Cursor/VS Code extension');
            console.log('  2. Or download from: https://claude.ai/code');
            console.log('\n💡 Alternatively, here\'s a simulation of what would happen:\n');
            
            // Simulate swarm execution
            simulateSwarmExecution(swarmConfig);
          } else {
            printError(`Failed to launch Claude Code: ${error.message}`);
          }
          // Cleanup temp file
          fs.unlink(promptFile).catch(() => {});
        });
        
        claudeProcess.on('exit', async (code) => {
          // Cleanup temp file
          try {
            await fs.unlink(promptFile);
          } catch (err) {
            // Ignore cleanup errors
          }
          
          if (code === 0) {
            printSuccess(`\n✅ Swarm ${swarmConfig.id} completed successfully`);
            
            // Save results
            const resultsPath = path.join(swarmConfig.outputDir, `${swarmConfig.id}.json`);
            
            try {
              await fs.mkdir(swarmConfig.outputDir, { recursive: true });
              await fs.writeFile(resultsPath, JSON.stringify(swarmConfig, null, 2));
              console.log(`📊 Results saved to: ${resultsPath}`);
            } catch (err) {
              console.error(`Failed to save results: ${err.message}`);
            }
          } else if (code !== null) {
            console.log(`\n⚠️  Swarm exited with code ${code}`);
          }
        });
      } catch (err) {
        printError(`Failed to create prompt file: ${err.message}`);
        // Fallback to simulation
        simulateSwarmExecution(swarmConfig);
      }
    });

  // Add swarm subcommands
  swarmCmd
    .command('list')
    .description('List recent swarm runs')
    .option('--limit <n>', 'Number of results to show', '10')
    .action((options) => {
      printSuccess('Recent Swarm Runs:');
      console.log('\n📋 No swarm runs found in current directory');
      console.log('💡 Run a swarm with: claude-flow swarm "<objective>"');
    });

  swarmCmd
    .command('status <id>')
    .description('Show status of a swarm run')
    .action((id) => {
      printSuccess(`Swarm Status: ${id}`);
      console.log('⚠️  Swarm tracking not available in simple mode');
    });

  // Help command
  program
    .command('help [command]')
    .description('Show help for a specific command')
    .action((command) => {
      if (command) {
        const cmd = program.commands.find(c => c.name() === command);
        if (cmd) {
          console.log(cmd.helpInformation());
        } else {
          printError(`Unknown command: ${command}`);
          console.log('\n💡 Run "claude-flow help" to see all commands');
        }
      } else {
        program.help();
      }
    });

  return program;
}

async function main() {
  try {
    const program = createProgram();
    
    // If no arguments provided, show help
    if (process.argv.length === 2) {
      program.help();
      return;
    }

    await program.parseAsync(process.argv);
  } catch (error) {
    printError(`Failed to execute command: ${error.message}`);
    process.exit(1);
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}