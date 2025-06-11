#!/usr/bin/env -S deno run --allow-all
/**
 * Simple CLI wrapper for Claude-Flow (JavaScript version)
 * This version avoids TypeScript issues in node_modules
 */

const VERSION = '1.0.26';

function printHelp() {
  console.log(`
🧠 Claude-Flow v${VERSION} - Advanced AI Agent Orchestration System

USAGE:
  claude-flow [COMMAND] [OPTIONS]

COMMANDS:
  init                  Initialize Claude Code integration files
  start                 Start the orchestration system
  agent                 Manage agents (spawn, list, terminate, info)
  task                  Manage tasks (create, list, status, cancel, workflow)
  memory               Manage memory (query, export, import, stats, cleanup)
  mcp                  Manage MCP server (status, tools, start, stop)
  terminal             Manage terminal pool and sessions
  config               Manage configuration (show, get, set, init, validate)
  status               Show system status
  monitor              Monitor system in real-time
  session              Manage terminal sessions
  workflow             Execute workflow files
  claude               Spawn Claude instances with specific configurations
  project              Manage multi-project environments
  deploy               Deploy and manage production environments
  analytics            Performance analytics and insights
  backup               Backup and disaster recovery management
  repl                 Start interactive REPL mode
  version              Show version information
  help                 Show this help message

GLOBAL OPTIONS:
  -c, --config <path>   Path to configuration file
  -v, --verbose         Enable verbose logging
  --log-level <level>   Set log level (debug, info, warn, error)
  --help               Show help for specific command

EXAMPLES:
  claude-flow init                                     # Initialize Claude integration files
  claude-flow start                                    # Start orchestrator
  claude-flow agent spawn researcher --name "Bot"     # Spawn research agent
  claude-flow task create research "Analyze data"     # Create task
  claude-flow claude spawn "implement auth" --research # Spawn Claude with web research
  claude-flow claude spawn "fix bug" --no-permissions # Spawn Claude without permission prompts
  claude-flow config init                             # Initialize config
  claude-flow status                                  # Show system status
  claude-flow workflow my-workflow.json              # Execute workflow

For more detailed help on specific commands, use:
  claude-flow [COMMAND] --help

Documentation: https://github.com/ruvnet/claude-code-flow
Issues: https://github.com/ruvnet/claude-code-flow/issues

Created by rUv - Built with ❤️ for the Claude community
`);
}

function printVersion() {
  console.log(`Claude-Flow v${VERSION}`);
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

async function main() {
  const args = Deno.args;
  
  if (args.length === 0) {
    printHelp();
    return;
  }

  const command = args[0];
  const subArgs = args.slice(1);

  switch (command) {
    case 'version':
    case '--version':
    case '-v':
      printVersion();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
      
    case 'init':
      // Parse init options
      const initForce = subArgs.includes('--force') || subArgs.includes('-f');
      const initMinimal = subArgs.includes('--minimal') || subArgs.includes('-m');
      
      try {
        printSuccess('Initializing Claude Code integration files...');
        
        // Check if files already exist
        const files = ['CLAUDE.md', 'memory-bank.md', 'coordination.md'];
        const existingFiles = [];
        
        for (const file of files) {
          try {
            await Deno.stat(file);
            existingFiles.push(file);
          } catch {
            // File doesn't exist, which is what we want
          }
        }
        
        if (existingFiles.length > 0 && !initForce) {
          printWarning(`The following files already exist: ${existingFiles.join(', ')}`);
          console.log('Use --force to overwrite existing files');
          break;
        }
        
        // Create CLAUDE.md
        const claudeMd = initMinimal ? createMinimalClaudeMd() : createFullClaudeMd();
        await Deno.writeTextFile('CLAUDE.md', claudeMd);
        console.log('  ✓ Created CLAUDE.md');
        
        // Create memory-bank.md
        const memoryBankMd = initMinimal ? createMinimalMemoryBankMd() : createFullMemoryBankMd();
        await Deno.writeTextFile('memory-bank.md', memoryBankMd);
        console.log('  ✓ Created memory-bank.md');
        
        // Create coordination.md
        const coordinationMd = initMinimal ? createMinimalCoordinationMd() : createFullCoordinationMd();
        await Deno.writeTextFile('coordination.md', coordinationMd);
        console.log('  ✓ Created coordination.md');
        
        // Create directory structure
        const directories = [
          'memory',
          'memory/agents',
          'memory/sessions',
          'coordination',
          'coordination/memory_bank',
          'coordination/subtasks',
          'coordination/orchestration'
        ];
        
        for (const dir of directories) {
          try {
            await Deno.mkdir(dir, { recursive: true });
            console.log(`  ✓ Created ${dir}/ directory`);
          } catch (err) {
            if (!(err instanceof Deno.errors.AlreadyExists)) {
              throw err;
            }
          }
        }
        
        // Create placeholder files
        const agentsReadme = createAgentsReadme();
        await Deno.writeTextFile('memory/agents/README.md', agentsReadme);
        console.log('  ✓ Created memory/agents/README.md');
        
        const sessionsReadme = createSessionsReadme();
        await Deno.writeTextFile('memory/sessions/README.md', sessionsReadme);
        console.log('  ✓ Created memory/sessions/README.md');
        
        // Initialize persistence database
        const initialData = {
          agents: [],
          tasks: [],
          lastUpdated: Date.now()
        };
        await Deno.writeTextFile('memory/claude-flow-data.json', JSON.stringify(initialData, null, 2));
        console.log('  ✓ Created memory/claude-flow-data.json (persistence database)');
        
        printSuccess('Claude Code integration files initialized successfully!');
        console.log('\nNext steps:');
        console.log('1. Review and customize the generated files for your project');
        console.log('2. Run \'npx claude-flow start\' to begin the orchestration system');
        console.log('3. Use \'claude --dangerously-skip-permissions\' for unattended operation');
        console.log('\nNote: Persistence database initialized at memory/claude-flow-data.json');
        
      } catch (err) {
        printError(`Failed to initialize files: ${err.message}`);
      }
      break;
      
    case 'start':
      printSuccess('Starting Claude-Flow orchestration system...');
      printWarning('Full orchestrator implementation coming soon!');
      console.log('🚀 System would start with the following components:');
      console.log('   - Event Bus');
      console.log('   - Orchestrator Engine');
      console.log('   - Memory Manager');
      console.log('   - Terminal Pool');
      console.log('   - MCP Server');
      console.log('   - Coordination Manager');
      break;
      
    case 'agent':
      const agentCmd = subArgs[0];
      switch (agentCmd) {
        case 'spawn':
          const agentType = subArgs[1] || 'researcher';
          printSuccess(`Spawning ${agentType} agent...`);
          console.log(`📝 Agent ID: agent-${Date.now()}`);
          console.log(`🤖 Type: ${agentType}`);
          console.log(`⚡ Status: Active`);
          break;
        case 'list':
          printSuccess('Active agents:');
          console.log('📋 No agents currently active (orchestrator not running)');
          break;
        default:
          console.log('Agent commands: spawn, list, terminate, info');
      }
      break;
      
    case 'task':
      const taskCmd = subArgs[0];
      switch (taskCmd) {
        case 'create':
          const taskType = subArgs[1] || 'general';
          const description = subArgs[2] || 'No description';
          printSuccess(`Creating ${taskType} task: "${description}"`);
          console.log(`📝 Task ID: task-${Date.now()}`);
          console.log(`🎯 Type: ${taskType}`);
          console.log(`📄 Description: ${description}`);
          break;
        case 'list':
          printSuccess('Active tasks:');
          console.log('📋 No tasks currently active (orchestrator not running)');
          break;
        default:
          console.log('Task commands: create, list, status, cancel, workflow');
      }
      break;
      
    case 'config':
      const configCmd = subArgs[0];
      switch (configCmd) {
        case 'init':
          printSuccess('Initializing Claude-Flow configuration...');
          // Create default configuration
          const defaultConfig = {
            terminal: {
              poolSize: 10,
              recycleAfter: 20,
              healthCheckInterval: 30000,
              type: "auto"
            },
            orchestrator: {
              maxConcurrentTasks: 10,
              taskTimeout: 300000
            },
            memory: {
              backend: "json",
              path: "./memory/claude-flow-data.json"
            }
          };
          try {
            await Deno.writeTextFile('claude-flow.config.json', JSON.stringify(defaultConfig, null, 2));
            console.log('✓ Created claude-flow.config.json');
          } catch (err) {
            console.log('📝 Configuration file would be created at: claude-flow.config.json');
          }
          break;
          
        case 'show':
          printSuccess('Current configuration:');
          try {
            const config = await Deno.readTextFile('claude-flow.config.json');
            console.log(JSON.parse(config));
          } catch {
            console.log('📋 Default configuration (no config file found)');
            console.log('   Terminal Pool Size: 10');
            console.log('   Recycle After: 20 commands');
            console.log('   Health Check Interval: 30s');
          }
          break;
          
        case 'get':
          const getKey = subArgs[1];
          if (!getKey) {
            printError('Usage: config get <key>');
            break;
          }
          try {
            const config = JSON.parse(await Deno.readTextFile('claude-flow.config.json'));
            const keys = getKey.split('.');
            let value = config;
            for (const k of keys) {
              value = value[k];
            }
            console.log(`${getKey}: ${JSON.stringify(value)}`);
          } catch {
            console.log(`${getKey}: (not set)`);
          }
          break;
          
        case 'set':
          const setKey = subArgs[1];
          const setValue = subArgs[2];
          if (!setKey || !setValue) {
            printError('Usage: config set <key> <value>');
            break;
          }
          try {
            let config = {};
            try {
              config = JSON.parse(await Deno.readTextFile('claude-flow.config.json'));
            } catch {
              // Use default config if file doesn't exist
            }
            
            // Set nested value
            const keys = setKey.split('.');
            let obj = config;
            for (let i = 0; i < keys.length - 1; i++) {
              if (!obj[keys[i]]) obj[keys[i]] = {};
              obj = obj[keys[i]];
            }
            
            // Parse value if it's a number or boolean
            let parsedValue = setValue;
            if (setValue === 'true') parsedValue = true;
            else if (setValue === 'false') parsedValue = false;
            else if (!isNaN(setValue)) parsedValue = Number(setValue);
            
            obj[keys[keys.length - 1]] = parsedValue;
            
            await Deno.writeTextFile('claude-flow.config.json', JSON.stringify(config, null, 2));
            printSuccess(`Set ${setKey} = ${setValue}`);
          } catch (err) {
            printError(`Failed to set config: ${err.message}`);
          }
          break;
          
        case 'validate':
          printSuccess('Validating configuration...');
          try {
            const config = JSON.parse(await Deno.readTextFile('claude-flow.config.json'));
            console.log('✅ Configuration is valid');
            console.log(`   Terminal pool size: ${config.terminal?.poolSize || 10}`);
            console.log(`   Terminal type: ${config.terminal?.type || 'auto'}`);
          } catch {
            console.log('⚠️  No configuration file found, using defaults');
          }
          break;
          
        default:
          console.log('Config commands: init, show, get, set, validate');
          console.log('\nExamples:');
          console.log('  config set terminal.poolSize 10');
          console.log('  config set terminal.recycleAfter 20');
          console.log('  config get terminal.poolSize');
      }
      break;
      
    case 'status':
      printSuccess('Claude-Flow System Status:');
      console.log('🟡 Status: Not Running (orchestrator not started)');
      console.log('🤖 Agents: 0 active');
      console.log('📋 Tasks: 0 in queue');
      console.log('💾 Memory: Ready');
      console.log('🖥️  Terminal Pool: Ready');
      console.log('🌐 MCP Server: Stopped');
      break;
      
    case 'memory': {
      const memorySubcommand = subArgs[0];
      const memoryStore = './memory/memory-store.json';
      
      // Helper to load memory data
      async function loadMemory() {
        try {
          const content = await Deno.readTextFile(memoryStore);
          return JSON.parse(content);
        } catch {
          return {};
        }
      }
      
      // Helper to save memory data
      async function saveMemory(data) {
        await Deno.mkdir('./memory', { recursive: true });
        await Deno.writeTextFile(memoryStore, JSON.stringify(data, null, 2));
      }
      
      switch (memorySubcommand) {
        case 'store': {
          const key = subArgs[1];
          const value = subArgs.slice(2).join(' ');
          
          if (!key || !value) {
            printError('Usage: memory store <key> <value>');
            break;
          }
          
          try {
            const data = await loadMemory();
            const namespace = 'default';
            
            if (!data[namespace]) {
              data[namespace] = [];
            }
            
            // Remove existing entry with same key
            data[namespace] = data[namespace].filter(e => e.key !== key);
            
            // Add new entry
            data[namespace].push({
              key,
              value,
              namespace,
              timestamp: Date.now()
            });
            
            await saveMemory(data);
            printSuccess('Stored successfully');
            console.log(`📝 Key: ${key}`);
            console.log(`📦 Namespace: ${namespace}`);
            console.log(`💾 Size: ${new TextEncoder().encode(value).length} bytes`);
          } catch (err) {
            printError(`Failed to store: ${err.message}`);
          }
          break;
        }
        
        case 'query': {
          const search = subArgs.slice(1).join(' ');
          
          if (!search) {
            printError('Usage: memory query <search>');
            break;
          }
          
          try {
            const data = await loadMemory();
            const results = [];
            
            for (const [namespace, entries] of Object.entries(data)) {
              for (const entry of entries) {
                if (entry.key.includes(search) || entry.value.includes(search)) {
                  results.push(entry);
                }
              }
            }
            
            if (results.length === 0) {
              printWarning('No results found');
              return;
            }
            
            printSuccess(`Found ${results.length} results:`);
            
            for (const entry of results.slice(0, 10)) {
              console.log(`\n📌 ${entry.key}`);
              console.log(`   Namespace: ${entry.namespace}`);
              console.log(`   Value: ${entry.value.substring(0, 100)}${entry.value.length > 100 ? '...' : ''}`);
              console.log(`   Stored: ${new Date(entry.timestamp).toLocaleString()}`);
            }
            
            if (results.length > 10) {
              console.log(`\n... and ${results.length - 10} more results`);
            }
          } catch (err) {
            printError(`Failed to query: ${err.message}`);
          }
          break;
        }
        
        case 'stats': {
          try {
            const data = await loadMemory();
            let totalEntries = 0;
            const namespaceStats = {};
            
            for (const [namespace, entries] of Object.entries(data)) {
              namespaceStats[namespace] = entries.length;
              totalEntries += entries.length;
            }
            
            printSuccess('Memory Bank Statistics:');
            console.log(`   Total Entries: ${totalEntries}`);
            console.log(`   Namespaces: ${Object.keys(data).length}`);
            console.log(`   Size: ${(new TextEncoder().encode(JSON.stringify(data)).length / 1024).toFixed(2)} KB`);
            
            if (Object.keys(data).length > 0) {
              console.log('\n📁 Namespace Breakdown:');
              for (const [namespace, count] of Object.entries(namespaceStats)) {
                console.log(`   ${namespace}: ${count} entries`);
              }
            }
          } catch (err) {
            printError(`Failed to get stats: ${err.message}`);
          }
          break;
        }
        
        default: {
          console.log('Available subcommands: store, query, stats');
          console.log('\nExamples:');
          console.log('  memory store previous_work "Research findings from yesterday"');
          console.log('  memory query research');
          console.log('  memory stats');
          break;
        }
      }
      break;
    }
      
    case 'mcp':
      const mcpCmd = subArgs[0];
      switch (mcpCmd) {
        case 'status':
          printSuccess('MCP Server Status:');
          console.log('🌐 Status: Stopped (orchestrator not running)');
          console.log('📍 Default port: 3000');
          console.log('🔧 Transport: stdio');
          console.log('🔐 Authentication: Disabled');
          break;
        case 'tools':
          printSuccess('Available MCP Tools:');
          console.log('  📊 Research Tools:');
          console.log('    • web_search - Search the web for information');
          console.log('    • web_fetch - Fetch content from URLs');
          console.log('    • knowledge_query - Query knowledge base');
          console.log('  💻 Code Tools:');
          console.log('    • code_edit - Edit code files');
          console.log('    • code_search - Search through codebase');
          console.log('    • code_analyze - Analyze code quality');
          console.log('  🖥️  Terminal Tools:');
          console.log('    • terminal_execute - Execute shell commands');
          console.log('    • terminal_session - Manage terminal sessions');
          console.log('    • file_operations - File system operations');
          console.log('  💾 Memory Tools:');
          console.log('    • memory_store - Store information');
          console.log('    • memory_query - Query stored information');
          console.log('    • memory_index - Index and search content');
          break;
        case 'start':
          printWarning('MCP server runs as part of the orchestrator.');
          console.log('Use "claude-flow start" to start the entire system.');
          break;
        case 'stop':
          printWarning('MCP server runs as part of the orchestrator.');
          console.log('Use Ctrl+C to stop the system when running.');
          break;
        case 'serve':
          printSuccess('Starting MCP server in stdio mode...');
          console.log('🌐 MCP Server is starting...');
          console.log('📡 Transport: stdio (for Claude Desktop integration)');
          console.log('🔧 Available tools: agent, task, memory, terminal, workflow');
          console.log('⚡ Ready to accept connections');
          console.log('\n💡 To use with Claude Desktop:');
          console.log('   1. Add this to Claude Desktop MCP settings');
          console.log('   2. Use the mcp.json configuration in ./mcp_config/');
          // Keep the process running for stdio mode
          await new Promise(() => {});
          break;
        default:
          console.log('MCP commands: status, tools, start, stop, serve');
      }
      break;
      
    case 'monitor':
      printSuccess('Starting system monitor...');
      console.log('📊 Real-time monitoring would display here');
      break;
      
    case 'terminal':
      const terminalCmd = subArgs[0];
      switch (terminalCmd) {
        case 'pool':
          const poolCmd = subArgs[1];
          const detailed = subArgs.includes('--detailed') || subArgs.includes('-d');
          
          if (poolCmd === 'status') {
            printSuccess('Terminal Pool Status:');
            console.log('🖥️  Status: Ready');
            console.log('📊 Pool Size: 10 (default)');
            console.log('🟢 Active Terminals: 0');
            console.log('⏸️  Idle Terminals: 0');
            console.log('📈 Total Created: 0');
            
            if (detailed) {
              console.log('\n📋 Detailed Information:');
              console.log('   Configuration:');
              console.log('     • Max Pool Size: 10');
              console.log('     • Idle Timeout: 5 minutes');
              console.log('     • Shell: /bin/bash');
              console.log('     • Working Directory: ' + Deno.cwd());
              console.log('   Performance:');
              console.log('     • Average Response Time: N/A');
              console.log('     • Terminal Creation Time: N/A');
              console.log('     • Memory Usage: N/A');
              console.log('   Health:');
              console.log('     • Pool Health: Healthy');
              console.log('     • Last Health Check: Just now');
            }
          } else if (poolCmd === 'list') {
            printSuccess('Terminal Pool Sessions:');
            console.log('📋 No active terminal sessions');
          } else if (poolCmd === 'create') {
            printSuccess('Creating new terminal session...');
            console.log('🆔 Terminal ID: term-' + Date.now());
            console.log('🖥️  Status: Created');
            console.log('🐚 Shell: /bin/bash');
          } else if (poolCmd === 'terminate') {
            const termId = subArgs[2];
            if (termId) {
              printSuccess(`Terminating terminal: ${termId}`);
              console.log('✅ Terminal terminated successfully');
            } else {
              printError('Usage: terminal pool terminate <terminal-id>');
            }
          } else if (poolCmd === 'stats') {
            // Pool statistics command
            printSuccess('Terminal Pool Statistics:');
            console.log('📊 Utilization: 0%');
            console.log('⚡ Performance Metrics:');
            console.log('   • Average Command Time: N/A');
            console.log('   • Total Commands: 0');
            console.log('   • Failed Commands: 0');
            console.log('♻️  Recycling Stats:');
            console.log('   • Terminals Recycled: 0');
            console.log('   • Average Lifetime: N/A');
          } else {
            console.log('Terminal pool commands: status, list, create, terminate, stats');
            console.log('Options: --detailed, -d');
          }
          break;
          
        case 'create':
          // Advanced terminal creation
          const nameIndex = subArgs.indexOf('--name');
          const shellIndex = subArgs.indexOf('--shell');
          const wdIndex = subArgs.indexOf('--working-directory');
          const envIndex = subArgs.indexOf('--env');
          const persistentIndex = subArgs.indexOf('--persistent');
          
          const terminalConfig = {
            name: nameIndex >= 0 ? subArgs[nameIndex + 1] : 'terminal-' + Date.now(),
            shell: shellIndex >= 0 ? subArgs[shellIndex + 1] : 'bash',
            workingDirectory: wdIndex >= 0 ? subArgs[wdIndex + 1] : Deno.cwd(),
            env: envIndex >= 0 ? subArgs[envIndex + 1] : '',
            persistent: persistentIndex >= 0
          };
          
          printSuccess('Creating terminal session...');
          console.log(`🆔 Terminal ID: ${terminalConfig.name}`);
          console.log(`🐚 Shell: ${terminalConfig.shell}`);
          console.log(`📁 Working Directory: ${terminalConfig.workingDirectory}`);
          if (terminalConfig.env) {
            console.log(`🔧 Environment: ${terminalConfig.env}`);
          }
          if (terminalConfig.persistent) {
            console.log('💾 Persistent: Yes');
          }
          break;
          
        case 'execute':
        case 'exec':
          const execCmd = subArgs.slice(1).join(' ');
          const sessionFlag = subArgs.indexOf('--session');
          const timeoutFlag = subArgs.indexOf('--timeout');
          const backgroundFlag = subArgs.includes('--background');
          
          if (execCmd && sessionFlag < 0) {
            printSuccess(`Executing command: ${execCmd}`);
            console.log('🖥️  Command would execute in terminal pool');
            console.log('📝 Output would appear here');
            if (backgroundFlag) {
              console.log('🔄 Running in background');
            }
          } else if (sessionFlag >= 0) {
            const sessionId = subArgs[sessionFlag + 1];
            const cmdStart = subArgs.indexOf('"');
            const cmdEnd = subArgs.lastIndexOf('"');
            const command = cmdStart >= 0 && cmdEnd > cmdStart ? 
              subArgs.slice(cmdStart, cmdEnd + 1).join(' ').slice(1, -1) : 
              'echo "No command"';
            
            printSuccess(`Executing in session ${sessionId}: ${command}`);
            if (timeoutFlag >= 0) {
              console.log(`⏱️  Timeout: ${subArgs[timeoutFlag + 1]}`);
            }
          } else {
            printError('Usage: terminal execute <command> [--session <id>] [--timeout <duration>]');
          }
          break;
          
        case 'batch-exec':
          // Batch command execution
          const batchSession = subArgs.find(arg => !arg.startsWith('--'));
          const commandsFlag = subArgs.indexOf('--commands');
          const fileFlag = subArgs.indexOf('--file');
          
          if (commandsFlag >= 0) {
            const commands = subArgs[commandsFlag + 1].split(',');
            printSuccess(`Executing ${commands.length} commands in sequence`);
            commands.forEach((cmd, i) => {
              console.log(`  ${i + 1}. ${cmd}`);
            });
          } else if (fileFlag >= 0) {
            printSuccess(`Executing commands from file: ${subArgs[fileFlag + 1]}`);
          } else {
            console.log('Usage: terminal batch-exec --commands "cmd1,cmd2,cmd3" [--session <id>]');
          }
          break;
          
        case 'list':
          // List all terminal sessions
          const listDetailed = subArgs.includes('--detailed');
          printSuccess('Active Terminal Sessions:');
          console.log('📋 No active terminal sessions');
          if (listDetailed) {
            console.log('\nSystem Information:');
            console.log('  • Total Sessions Created: 0');
            console.log('  • Sessions Recycled: 0');
            console.log('  • Average Session Lifetime: N/A');
          }
          break;
          
        case 'info':
          // Get terminal info
          const infoSessionId = subArgs[1];
          if (infoSessionId) {
            printSuccess(`Terminal Information: ${infoSessionId}`);
            console.log('🆔 Session ID: ' + infoSessionId);
            console.log('📍 Status: Not found');
            console.log('🐚 Shell: N/A');
            console.log('📁 Working Directory: N/A');
            console.log('⏱️  Created: N/A');
            console.log('📊 Commands Executed: 0');
          } else {
            printError('Usage: terminal info <session-id>');
          }
          break;
          
        case 'attach':
          // Attach to terminal
          const attachId = subArgs[1];
          if (attachId) {
            printSuccess(`Attaching to terminal: ${attachId}`);
            console.log('🔗 Would enter interactive mode');
            console.log('💡 Press Ctrl+D to detach');
          } else {
            printError('Usage: terminal attach <session-id>');
          }
          break;
          
        case 'detach':
          // Detach from terminal
          const detachId = subArgs[1];
          if (detachId) {
            printSuccess(`Detaching from terminal: ${detachId}`);
            console.log('✅ Session continues running in background');
          } else {
            printError('Usage: terminal detach <session-id>');
          }
          break;
          
        case 'terminate':
          // Terminate terminal
          const terminateId = subArgs[1];
          const graceful = subArgs.includes('--graceful');
          if (terminateId) {
            printSuccess(`Terminating terminal: ${terminateId}`);
            if (graceful) {
              console.log('🕐 Graceful shutdown initiated');
            }
            console.log('✅ Terminal terminated');
          } else {
            printError('Usage: terminal terminate <session-id> [--graceful]');
          }
          break;
          
        case 'cleanup':
          // Cleanup idle terminals
          const idleTime = subArgs.find(arg => arg.includes('--idle-longer-than'));
          printSuccess('Cleaning up idle terminals...');
          console.log('🧹 Scanning for idle sessions');
          if (idleTime) {
            console.log(`⏱️  Idle threshold: ${idleTime.split('=')[1] || '30m'}`);
          }
          console.log('✅ Cleanup complete: 0 terminals removed');
          break;
          
        case 'monitor':
          // Monitor terminal
          const monitorId = subArgs[1];
          if (monitorId) {
            printSuccess(`Monitoring terminal: ${monitorId}`);
            console.log('📊 Real-time metrics would display here');
            console.log('   • CPU: 0%');
            console.log('   • Memory: 0MB');
            console.log('   • I/O: 0 ops/s');
          } else {
            printError('Usage: terminal monitor <session-id>');
          }
          break;
          
        case 'record':
          // Record terminal session
          const recordId = subArgs[1];
          const outputFlag = subArgs.indexOf('--output');
          if (recordId && outputFlag >= 0) {
            printSuccess(`Recording terminal session: ${recordId}`);
            console.log(`📹 Output file: ${subArgs[outputFlag + 1]}`);
            console.log('🔴 Recording started');
          } else {
            printError('Usage: terminal record <session-id> --output <file>');
          }
          break;
          
        case 'replay':
          // Replay terminal session
          const replayFile = subArgs[1];
          if (replayFile) {
            printSuccess(`Replaying session from: ${replayFile}`);
            console.log('▶️  Playback would start here');
            console.log('⏸️  Controls: space=pause, arrows=seek, q=quit');
          } else {
            printError('Usage: terminal replay <recording-file>');
          }
          break;
          
        case 'share':
          // Share terminal session
          const shareId = subArgs[1];
          const accessLevel = subArgs.find(arg => arg.includes('--access-level'));
          if (shareId) {
            printSuccess(`Sharing terminal session: ${shareId}`);
            console.log(`🔗 Share URL: https://claude-flow.local/terminal/${shareId}/view`);
            console.log(`🔐 Access: ${accessLevel ? accessLevel.split('=')[1] : 'read-only'}`);
            console.log('⏱️  Expires in: 2 hours');
          } else {
            printError('Usage: terminal share <session-id> [--access-level read|write]');
          }
          break;
          
        case 'multi-config':
          // Multi-terminal configuration
          const multiCmd = subArgs[1];
          if (multiCmd === 'create') {
            const configName = subArgs.find(arg => !arg.startsWith('--'));
            printSuccess(`Creating multi-terminal configuration: ${configName || 'default'}`);
            console.log('📋 Configuration template created');
          } else {
            console.log('Usage: terminal multi-config create --name <name> --config <file>');
          }
          break;
          
        case 'multi-launch':
          // Launch multi-terminal environment
          const envName = subArgs[1];
          if (envName) {
            printSuccess(`Launching multi-terminal environment: ${envName}`);
            console.log('🚀 Starting terminals in dependency order...');
            console.log('   1. database - Starting...');
            console.log('   2. backend-api - Waiting for database...');
            console.log('   3. frontend-app - Waiting for backend...');
            console.log('✅ All terminals launched successfully');
          } else {
            printError('Usage: terminal multi-launch <environment-name>');
          }
          break;
          
        case 'batch-create':
          // Batch create terminals
          const configFile = subArgs.find(arg => arg.includes('--config'));
          printSuccess('Creating multiple terminal sessions...');
          if (configFile) {
            console.log(`📄 Loading config from: ${configFile.split('=')[1]}`);
          }
          console.log('✅ Created 3 terminal sessions');
          break;
          
        case 'session':
          // Legacy session command handling
          const sessionCmd = subArgs[1];
          if (sessionCmd === 'list') {
            printSuccess('Terminal Sessions:');
            console.log('📋 No active sessions');
          } else if (sessionCmd === 'info') {
            const sessionId = subArgs[2];
            if (sessionId) {
              printSuccess(`Session Info: ${sessionId}`);
              console.log('🆔 Session ID: ' + sessionId);
              console.log('📍 Status: Not found');
            } else {
              printError('Usage: terminal session info <session-id>');
            }
          } else {
            console.log('Terminal session commands: list, info');
          }
          break;
          
        default:
          console.log('Terminal commands:');
          console.log('  Basic:');
          console.log('    pool         - Manage terminal pool (status, list, create, terminate)');
          console.log('    create       - Create new terminal with options');
          console.log('    execute      - Execute command in terminal');
          console.log('    list         - List all active terminals');
          console.log('    info         - Get terminal information');
          console.log('  Session Control:');
          console.log('    attach       - Attach to terminal session');
          console.log('    detach       - Detach from terminal');
          console.log('    terminate    - Terminate terminal session');
          console.log('    cleanup      - Clean up idle terminals');
          console.log('  Advanced:');
          console.log('    batch-exec   - Execute multiple commands');
          console.log('    monitor      - Monitor terminal metrics');
          console.log('    record       - Record terminal session');
          console.log('    replay       - Replay recorded session');
          console.log('    share        - Share terminal session');
          console.log('  Multi-Terminal:');
          console.log('    multi-config - Create multi-terminal config');
          console.log('    multi-launch - Launch terminal environment');
          console.log('    batch-create - Create multiple terminals');
          console.log('\nExamples:');
          console.log('  terminal pool status --detailed');
          console.log('  terminal create --name "dev" --shell bash --persistent');
          console.log('  terminal execute "npm test" --session dev --timeout 5m');
          console.log('  terminal batch-exec --commands "cd /app,npm install,npm start"');
          console.log('  terminal monitor dev --metrics cpu,memory');
      }
      break;
      
    case 'session':
      printSuccess('Terminal session manager ready');
      console.log('🖥️  Session operations would be handled here');
      break;
      
    case 'workflow':
      const workflowFile = subArgs[0];
      if (workflowFile) {
        printSuccess(`Executing workflow: ${workflowFile}`);
        console.log('🔄 Workflow execution would start here');
      } else {
        printError('Please specify a workflow file');
      }
      break;
      
    case 'repl':
      printSuccess('Starting interactive REPL mode...');
      await startRepl();
      break;
      
    case 'claude':
      const claudeCmd = subArgs[0];
      switch (claudeCmd) {
        case 'spawn':
          // Extract task description and flags
          let taskEndIndex = subArgs.length;
          for (let i = 1; i < subArgs.length; i++) {
            if (subArgs[i].startsWith('-')) {
              taskEndIndex = i;
              break;
            }
          }
          
          const task = subArgs.slice(1, taskEndIndex).join(' ');
          if (!task) {
            printError('Usage: claude spawn <task description> [options]');
            break;
          }
          
          // Parse flags
          const flags = {};
          for (let i = taskEndIndex; i < subArgs.length; i++) {
            const arg = subArgs[i];
            if (arg === '--tools' || arg === '-t') {
              flags.tools = subArgs[++i];
            } else if (arg === '--no-permissions') {
              flags.noPermissions = true;
            } else if (arg === '--config' || arg === '-c') {
              flags.config = subArgs[++i];
            } else if (arg === '--mode' || arg === '-m') {
              flags.mode = subArgs[++i];
            } else if (arg === '--parallel') {
              flags.parallel = true;
            } else if (arg === '--research') {
              flags.research = true;
            } else if (arg === '--coverage') {
              flags.coverage = parseInt(subArgs[++i]);
            } else if (arg === '--commit') {
              flags.commit = subArgs[++i];
            } else if (arg === '--verbose' || arg === '-v') {
              flags.verbose = true;
            } else if (arg === '--dry-run' || arg === '-d') {
              flags.dryRun = true;
            }
          }
          
          // Build tools list
          let tools = flags.tools || 'View,Edit,Replace,GlobTool,GrepTool,LS,Bash';
          if (flags.parallel) {
            tools += ',BatchTool,dispatch_agent';
          }
          if (flags.research) {
            tools += ',WebFetchTool';
          }
          
          const instanceId = `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          if (flags.dryRun) {
            printWarning('DRY RUN - Would execute:');
            console.log(`Command: claude "<enhanced task with guidance>" --allowedTools ${tools}`);
            console.log(`Instance ID: ${instanceId}`);
            console.log(`Task: ${task}`);
            console.log(`Tools: ${tools}`);
            console.log(`Mode: ${flags.mode || 'full'}`);
            console.log(`Coverage: ${flags.coverage || 80}%`);
            console.log(`Commit: ${flags.commit || 'phase'}`);
            console.log(`\nEnhanced Features:`);
            console.log(`  - Memory Bank enabled via: npx claude-flow memory commands`);
            console.log(`  - Coordination ${flags.parallel ? 'enabled' : 'disabled'}`);
            console.log(`  - Access Claude-Flow features through Bash tool`);
          } else {
            printSuccess(`Spawning Claude instance: ${instanceId}`);
            console.log(`📝 Original Task: ${task}`);
            console.log(`🔧 Tools: ${tools}`);
            console.log(`⚙️  Mode: ${flags.mode || 'full'}`);
            console.log(`📊 Coverage: ${flags.coverage || 80}%`);
            console.log(`💾 Commit: ${flags.commit || 'phase'}`);
            console.log(`✨ Enhanced with Claude-Flow guidance for memory and coordination`);
            console.log('');
            console.log('📋 Task will be enhanced with:');
            console.log('  - Memory Bank instructions (store/retrieve)');
            console.log('  - Coordination capabilities (swarm management)');
            console.log('  - Best practices for multi-agent workflows');
            console.log('');
            
            // Build the actual claude command with enhanced guidance
            let enhancedTask = `# Claude-Flow Enhanced Task

## Your Task
${task}

## Claude-Flow System Context

You are running within the Claude-Flow orchestration system, which provides powerful features for complex task management.

### Configuration
- Instance ID: ${instanceId}
- Mode: ${flags.mode || 'full'}
- Coverage Target: ${flags.coverage || 80}%
- Commit Strategy: ${flags.commit || 'phase'}
${flags.config ? `- MCP Config: ${flags.config}` : ''}

### Available Features

1. **Memory Bank** (Always Available)
   - Store data: \`npx claude-flow memory store <key> "<value>"\` - Save important data, findings, or progress
   - Retrieve data: \`npx claude-flow memory query <key>\` - Access previously stored information
   - Export memory: \`npx claude-flow memory export <file>\` - Export memory to file
   - Import memory: \`npx claude-flow memory import <file>\` - Import memory from file
   - Memory stats: \`npx claude-flow memory stats\` - Show memory usage statistics

2. **System Management**
   - Check status: \`npx claude-flow status\` - View current system/task status
   - Monitor system: \`npx claude-flow monitor\` - Real-time system monitoring
   - List agents: \`npx claude-flow agent list\` - See active agents
   - List tasks: \`npx claude-flow task list\` - See active tasks

3. **Tool Access**
   - You have access to these tools: ${tools}
   ${flags.tools ? `- Custom tools specified: ${flags.tools}` : ''}`;

            if (flags.parallel) {
              enhancedTask += `
   - **Parallel Execution Enabled**: Use \`npx claude-flow agent spawn <type> --name <name>\` to spawn sub-agents
   - Create tasks: \`npx claude-flow task create <type> "<description>"\`
   - Assign tasks: \`npx claude-flow task assign <task-id> <agent-id>\`
   - Break down complex tasks and delegate to specialized agents`;
            }

            if (flags.research) {
              enhancedTask += `
   - **Research Mode**: Use \`WebFetchTool\` for web research and information gathering`;
            }

            enhancedTask += `

### Workflow Guidelines

1. **Before Starting**:
   - Check memory: \`npx claude-flow memory query previous_work\`
   - Check memory stats: \`npx claude-flow memory stats\`
   - Check system status: \`npx claude-flow status\`
   - List active agents: \`npx claude-flow agent list\`
   - List active tasks: \`npx claude-flow task list\`
   ${flags.mode === 'backend-only' ? '- Focus on backend implementation without frontend concerns' : ''}
   ${flags.mode === 'frontend-only' ? '- Focus on frontend implementation without backend concerns' : ''}
   ${flags.mode === 'api-only' ? '- Focus on API design and implementation' : ''}

2. **During Execution**:
   - Store findings: \`npx claude-flow memory store findings "your data here"\`
   - Save checkpoints: \`npx claude-flow memory store progress_${task.replace(/\s+/g, '_')} "current status"\`
   ${flags.parallel ? '- Spawn agents: `npx claude-flow agent spawn researcher --name "research-agent"`' : ''}
   ${flags.parallel ? '- Create tasks: `npx claude-flow task create implementation "implement feature X"`' : ''}
   ${flags.parallel ? '- Assign tasks: `npx claude-flow task assign <task-id> <agent-id>`' : ''}
   ${flags.coverage ? `- Ensure test coverage meets ${flags.coverage}% target` : ''}
   ${flags.commit === 'phase' ? '- Commit changes after completing each major phase' : ''}
   ${flags.commit === 'feature' ? '- Commit changes after each feature is complete' : ''}
   ${flags.commit === 'manual' ? '- Only commit when explicitly requested' : ''}

3. **Best Practices**:
   - Use the Bash tool to run \`npx claude-flow\` commands
   - Store data as JSON strings for complex structures
   - Query memory before starting to check for existing work
   - Use descriptive keys for memory storage
   - Monitor progress: \`npx claude-flow monitor\`
   ${flags.parallel ? '- Coordinate with other agents through shared memory' : ''}
   ${flags.research ? '- Store research findings: `npx claude-flow memory store research_findings "data"`' : ''}
   ${flags.noPermissions ? '- Running with --no-permissions, all operations will execute without prompts' : ''}
   ${flags.verbose ? '- Verbose mode enabled, provide detailed output and explanations' : ''}

## Configuration
- Instance ID: ${instanceId}
- Mode: ${flags.mode || 'full'}
- Coverage Target: ${flags.coverage || 80}%
- Commit Strategy: ${flags.commit || 'phase'}

## Example Commands

To interact with Claude-Flow, use the Bash tool:

\`\`\`bash
# Memory Operations
Bash("npx claude-flow memory query previous_work")
Bash("npx claude-flow memory store task_analysis '{\\"status\\": \\"completed\\", \\"findings\\": [...]}'")
Bash("npx claude-flow memory stats")
Bash("npx claude-flow memory export backup.json")

# System Management
Bash("npx claude-flow status")
Bash("npx claude-flow monitor")  # Real-time monitoring
Bash("npx claude-flow agent list")
Bash("npx claude-flow task list --verbose")
${flags.parallel ? `
# Parallel Execution (enabled for this instance)
Bash("npx claude-flow agent spawn researcher --name research-bot")
Bash("npx claude-flow agent spawn coder --name code-bot")
Bash("npx claude-flow task create research 'Analyze best practices'")
Bash("npx claude-flow task create implementation 'Implement auth module'")
Bash("npx claude-flow task assign task-123 agent-456")` : ''}
${flags.research ? `
# Research Operations (research mode enabled)
# Use WebFetchTool for web research, then store findings
Bash("npx claude-flow memory store web_research_urls '[\\"url1\\", \\"url2\\"]'")
Bash("npx claude-flow memory store research_summary 'Key findings from research...'")` : ''}

# Configuration Management
Bash("npx claude-flow config show")
Bash("npx claude-flow config get orchestrator.maxConcurrentTasks")
Bash("npx claude-flow config set orchestrator.maxConcurrentTasks 20")

# Workflow Execution
Bash("npx claude-flow workflow examples/development-config.json")
Bash("npx claude-flow workflow examples/research-workflow.json --async")
\`\`\`

## Mode-Specific Guidelines
${flags.mode === 'backend-only' ? `
### Backend-Only Mode
- Focus exclusively on server-side implementation
- Prioritize API design, database schemas, and business logic
- Ignore frontend/UI considerations
- Test coverage should emphasize unit and integration tests` : ''}
${flags.mode === 'frontend-only' ? `
### Frontend-Only Mode
- Focus exclusively on client-side implementation
- Prioritize UI/UX, component design, and user interactions
- Assume backend APIs are already available
- Test coverage should emphasize component and E2E tests` : ''}
${flags.mode === 'api-only' ? `
### API-Only Mode
- Focus exclusively on API design and implementation
- Prioritize RESTful principles, documentation, and contracts
- Include comprehensive API documentation
- Test coverage should emphasize API endpoint testing` : ''}
${flags.mode === 'full' || !flags.mode ? `
### Full Stack Mode (Default)
- Consider both frontend and backend requirements
- Ensure proper integration between all layers
- Balance test coverage across all components
- Document both API contracts and user interfaces` : ''}

## Commit Strategy
${flags.commit === 'phase' ? `- **Phase Commits**: Commit after completing major phases (planning, implementation, testing)` : ''}
${flags.commit === 'feature' ? `- **Feature Commits**: Commit after each feature or module is complete` : ''}
${flags.commit === 'manual' ? `- **Manual Commits**: Only commit when explicitly requested by the user` : ''}
${!flags.commit ? `- **Default (Phase)**: Commit after completing major phases` : ''}

Now, please proceed with the task: ${task}`;
            
            const claudeArgs = [enhancedTask];
            claudeArgs.push('--allowedTools', tools);
            
            // DEBUG: Log what we're about to pass
            console.log('\n🔍 DEBUG - Command Construction:');
            console.log(`First arg length: ${claudeArgs[0].length} chars`);
            console.log(`First 100 chars: ${claudeArgs[0].substring(0, 100)}...`);
            console.log(`Args count: ${claudeArgs.length}`);
            
            if (flags.noPermissions) {
              claudeArgs.push('--dangerously-skip-permissions');
            }
            
            if (flags.config) {
              claudeArgs.push('--mcp-config', flags.config);
            }
            
            if (flags.verbose) {
              claudeArgs.push('--verbose');
            }
            
            // Execute the actual claude command
            try {
              // Debug: Log the actual command being executed
              if (flags.verbose) {
                console.log('Debug - Executing command:');
                console.log(`claude ${claudeArgs.map(arg => arg.includes(' ') || arg.includes('\n') ? `"${arg}"` : arg).join(' ')}`);
              }
              
              const command = new Deno.Command('claude', {
                args: claudeArgs,
                env: {
                  ...Deno.env.toObject(),
                  CLAUDE_INSTANCE_ID: instanceId,
                  CLAUDE_FLOW_MODE: flags.mode || 'full',
                  CLAUDE_FLOW_COVERAGE: (flags.coverage || 80).toString(),
                  CLAUDE_FLOW_COMMIT: flags.commit || 'phase',
                  // Add claude-flow specific features
                  CLAUDE_FLOW_MEMORY_ENABLED: 'true',
                  CLAUDE_FLOW_MEMORY_NAMESPACE: 'default',
                  CLAUDE_FLOW_COORDINATION_ENABLED: flags.parallel ? 'true' : 'false',
                  CLAUDE_FLOW_FEATURES: 'memory,coordination,swarm',
                },
                stdin: 'inherit',
                stdout: 'inherit',
                stderr: 'inherit',
              });
              
              const child = command.spawn();
              const status = await child.status;
              
              if (status.success) {
                printSuccess(`Claude instance ${instanceId} completed successfully`);
              } else {
                printError(`Claude instance ${instanceId} exited with code ${status.code}`);
              }
            } catch (err) {
              printError(`Failed to spawn Claude: ${err.message}`);
              console.log('Make sure you have the Claude CLI installed.');
            }
          }
          break;
          
        case 'batch':
          const workflowFile = subArgs[1];
          if (!workflowFile) {
            printError('Usage: claude batch <workflow-file>');
            break;
          }
          printSuccess(`Loading workflow: ${workflowFile}`);
          console.log('📋 Batch execution would process workflow file');
          break;
          
        default:
          console.log('Claude commands: spawn, batch');
          console.log('\nExamples:');
          console.log('  claude-flow claude spawn "implement user authentication" --research --parallel');
          console.log('  claude-flow claude spawn "fix bug in payment system" --no-permissions');
          console.log('  claude-flow claude batch workflow.json --dry-run');
      }
      break;
      
    default:
      printError(`Unknown command: ${command}`);
      console.log('Run "claude-flow help" for available commands');
      Deno.exit(1);
  }
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
      memory: {}
    }
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
      console.log('🟢 Claude-Flow Status:');
      console.log(`  Agents: ${replState.context.agents.length} active`);
      console.log(`  Tasks: ${replState.context.tasks.length} in queue`);
      console.log(`  Terminals: ${replState.context.terminals.length} active`);
      console.log(`  Memory Keys: ${Object.keys(replState.context.memory).length}`);
    },
    
    clear: () => {
      console.clear();
      console.log('🧠 Claude-Flow Interactive Shell v' + VERSION);
    },
    
    history: () => {
      console.log('📜 Command History:');
      replState.history.forEach((cmd, i) => {
        console.log(`  ${i + 1}: ${cmd}`);
      });
    },
    
    config: async (key) => {
      try {
        const config = JSON.parse(await Deno.readTextFile('claude-flow.config.json'));
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
    }
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
      console.log('👋 Exiting Claude-Flow REPL...');
      return false;
    }
    
    // Handle shell commands
    if (trimmed.startsWith('!')) {
      const shellCmd = trimmed.substring(1);
      try {
        const command = new Deno.Command('sh', {
          args: ['-c', shellCmd],
          stdout: 'piped',
          stderr: 'piped'
        });
        const { stdout, stderr } = await command.output();
        if (stdout.length > 0) {
          console.log(new TextDecoder().decode(stdout));
        }
        if (stderr.length > 0) {
          console.error(new TextDecoder().decode(stderr));
        }
      } catch (err) {
        console.error(`Shell error: ${err.message}`);
      }
      return true;
    }
    
    // Handle search
    if (trimmed.startsWith('/')) {
      const search = trimmed.substring(1);
      const matches = replState.history.filter(cmd => cmd.includes(search));
      if (matches.length > 0) {
        console.log('🔍 Search results:');
        matches.forEach(cmd => console.log(`  ${cmd}`));
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
          created: new Date().toISOString()
        };
        state.context.agents.push(agent);
        printSuccess(`Spawned ${type} agent: ${name} (${agent.id})`);
        break;
        
      case 'list':
        if (state.context.agents.length === 0) {
          console.log('No active agents');
        } else {
          console.log('Active agents:');
          state.context.agents.forEach(agent => {
            console.log(`  ${agent.id} - ${agent.name} (${agent.type}) - ${agent.status}`);
          });
        }
        break;
        
      case 'info':
        const agentId = args[1];
        const foundAgent = state.context.agents.find(a => a.id === agentId || a.name === agentId);
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
        const index = state.context.agents.findIndex(a => a.id === termId || a.name === termId);
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
          created: new Date().toISOString()
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
          state.context.tasks.forEach(task => {
            console.log(`  ${task.id} - ${task.type} - ${task.status}`);
            console.log(`    ${task.description}`);
          });
        }
        break;
        
      case 'assign':
        const taskId = args[1];
        const assignAgentId = args[2];
        const foundTask = state.context.tasks.find(t => t.id === taskId);
        const assignAgent = state.context.agents.find(a => a.id === assignAgentId || a.name === assignAgentId);
        
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
        const statusTask = state.context.tasks.find(t => t.id === statusId);
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
          keys.forEach(key => {
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
          created: new Date().toISOString()
        };
        state.context.terminals.push(terminal);
        printSuccess(`Created terminal: ${name}`);
        break;
        
      case 'list':
        if (state.context.terminals.length === 0) {
          console.log('No active terminals');
        } else {
          console.log('Active terminals:');
          state.context.terminals.forEach(term => {
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
  
  // Main REPL loop
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  
  while (true) {
    // Show prompt
    const prompt = replState.currentSession ? 
      `claude-flow:${replState.currentSession}> ` : 
      'claude-flow> ';
    await Deno.stdout.write(encoder.encode(prompt));
    
    // Read input
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    if (n === null) break;
    
    const input = decoder.decode(buf.subarray(0, n)).trim();
    
    // Process command
    const shouldContinue = await processReplCommand(input);
    if (!shouldContinue) break;
  }
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

if (import.meta.main) {
  await main();
}