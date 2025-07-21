"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startREPL = startREPL;
const node_fs_1 = require("node:fs");
/**
 * Enhanced Interactive REPL for Claude-Flow
 */
const inquirer_1 = require("inquirer");
const chalk_1 = require("chalk");
const cli_table3_1 = require("cli-table3");
const helpers_js_1 = require("../utils/helpers.js");
const formatter_js_1 = require("./formatter.js");
class CommandHistory {
    constructor(historyFile) {
        this.history = [];
        this.maxSize = 1000;
        this.historyFile = historyFile || '.claude-flow-history';
        this.loadHistory();
    }
    add(command) {
        if (command.trim() && command !== this.history[this.history.length - 1]) {
            this.history.push(command);
            if (this.history.length > this.maxSize) {
                this.history = this.history.slice(-this.maxSize);
            }
            this.saveHistory();
        }
    }
    get() {
        return [...this.history];
    }
    search(query) {
        return this.history.filter(cmd => cmd.includes(query));
    }
    async loadHistory() {
        try {
            const content = await node_fs_1.promises.readFile(this.historyFile, 'utf-8');
            this.history = content.split('\n').filter((line) => line.trim());
        }
        catch {
            // History file doesn't exist yet
        }
    }
    async saveHistory() {
        try {
            await node_fs_1.promises.writeFile(this.historyFile, this.history.join('\n'));
        }
        catch {
            // Ignore save errors
        }
    }
}
class CommandCompleter {
    constructor() {
        this.commands = new Map();
    }
    setCommands(commands) {
        this.commands.clear();
        for (const cmd of commands) {
            this.commands.set(cmd.name, cmd);
            if (cmd.aliases) {
                for (const alias of cmd.aliases) {
                    this.commands.set(alias, cmd);
                }
            }
        }
    }
    complete(input) {
        const parts = input.trim().split(/\s+/);
        if (parts.length === 1) {
            // Complete command names
            const prefix = parts[0];
            return Array.from(this.commands.keys())
                .filter(name => name.startsWith(prefix))
                .sort();
        }
        // Complete subcommands and arguments
        const commandName = parts[0];
        const command = this.commands.get(commandName);
        if (command) {
            return this.completeForCommand(command, parts.slice(1));
        }
        return [];
    }
    completeForCommand(command, args) {
        // Basic completion for known commands
        switch (command.name) {
            case 'agent':
                if (args.length === 1) {
                    return ['spawn', 'list', 'terminate', 'info'].filter(sub => sub.startsWith(args[0]));
                }
                if (args[0] === 'spawn' && args.length === 2) {
                    return ['coordinator', 'researcher', 'implementer', 'analyst', 'custom']
                        .filter(type => type.startsWith(args[1]));
                }
                break;
            case 'task':
                if (args.length === 1) {
                    return ['create', 'list', 'status', 'cancel', 'workflow'].filter(sub => sub.startsWith(args[0]));
                }
                if (args[0] === 'create' && args.length === 2) {
                    return ['research', 'implementation', 'analysis', 'coordination']
                        .filter(type => type.startsWith(args[1]));
                }
                break;
            case 'session':
                if (args.length === 1) {
                    return ['list', 'save', 'restore', 'delete', 'export', 'import']
                        .filter(sub => sub.startsWith(args[0]));
                }
                break;
            case 'workflow':
                if (args.length === 1) {
                    return ['run', 'validate', 'list', 'status', 'stop', 'template']
                        .filter(sub => sub.startsWith(args[0]));
                }
                break;
        }
        return [];
    }
}
/**
 * Start the enhanced interactive REPL
 */
async function startREPL(options = {}) {
    const context = {
        options,
        history: [],
        workingDirectory: process.cwd(),
        connectionStatus: 'disconnected',
        lastActivity: new Date(),
    };
    const history = new CommandHistory(options.historyFile);
    const completer = new CommandCompleter();
    const commands = [
        {
            name: 'help',
            aliases: ['h', '?'],
            description: 'Show available commands or help for a specific command',
            usage: 'help [command]',
            examples: ['help', 'help agent', 'help task create'],
            handler: async (args) => {
                if (args.length === 0) {
                    showHelp(commands);
                }
                else {
                    showCommandHelp(commands, args[0]);
                }
            },
        },
        {
            name: 'status',
            aliases: ['st'],
            description: 'Show system status and connection info',
            usage: 'status [component]',
            examples: ['status', 'status orchestrator'],
            handler: async (args, ctx) => {
                await showSystemStatus(ctx, args[0]);
            },
        },
        {
            name: 'connect',
            aliases: ['conn'],
            description: 'Connect to Claude-Flow orchestrator',
            usage: 'connect [host:port]',
            examples: ['connect', 'connect localhost:3000'],
            handler: async (args, ctx) => {
                await connectToOrchestrator(ctx, args[0]);
            },
        },
        {
            name: 'agent',
            description: 'Agent management (spawn, list, terminate, info)',
            usage: 'agent <subcommand> [options]',
            examples: [
                'agent list',
                'agent spawn researcher --name "Research Agent"',
                'agent info agent-001',
                'agent terminate agent-001'
            ],
            handler: async (args, ctx) => {
                await handleAgentCommand(args, ctx);
            },
        },
        {
            name: 'task',
            description: 'Task management (create, list, status, cancel)',
            usage: 'task <subcommand> [options]',
            examples: [
                'task list',
                'task create research "Find quantum computing papers"',
                'task status task-001',
                'task cancel task-001'
            ],
            handler: async (args, ctx) => {
                await handleTaskCommand(args, ctx);
            },
        },
        {
            name: 'memory',
            description: 'Memory operations (query, stats, export)',
            usage: 'memory <subcommand> [options]',
            examples: [
                'memory stats',
                'memory query --agent agent-001',
                'memory export memory.json'
            ],
            handler: async (args, ctx) => {
                await handleMemoryCommand(args, ctx);
            },
        },
        {
            name: 'session',
            description: 'Session management (save, restore, list)',
            usage: 'session <subcommand> [options]',
            examples: [
                'session list',
                'session save "Development Session"',
                'session restore session-001'
            ],
            handler: async (args, ctx) => {
                await handleSessionCommand(args, ctx);
            },
        },
        {
            name: 'workflow',
            description: 'Workflow operations (run, list, status)',
            usage: 'workflow <subcommand> [options]',
            examples: [
                'workflow list',
                'workflow run workflow.json',
                'workflow status workflow-001'
            ],
            handler: async (args, ctx) => {
                await handleWorkflowCommand(args, ctx);
            },
        },
        {
            name: 'monitor',
            aliases: ['mon'],
            description: 'Start monitoring mode',
            usage: 'monitor [--interval seconds]',
            examples: ['monitor', 'monitor --interval 5'],
            handler: async (args) => {
                console.log(chalk_1.default.cyan('Starting monitor mode...'));
                console.log(chalk_1.default.gray('(This would start the live dashboard)'));
            },
        },
        {
            name: 'history',
            aliases: ['hist'],
            description: 'Show command history',
            usage: 'history [--search query]',
            examples: ['history', 'history --search agent'],
            handler: async (args) => {
                const searchQuery = args.indexOf('--search') >= 0 ? args[args.indexOf('--search') + 1] : null;
                const historyItems = searchQuery ? history.search(searchQuery) : history.get();
                console.log(chalk_1.default.cyan.bold(`Command History${searchQuery ? ` (search: ${searchQuery})` : ''}`));
                console.log('─'.repeat(50));
                if (historyItems.length === 0) {
                    console.log(chalk_1.default.gray('No commands in history'));
                    return;
                }
                const recent = historyItems.slice(-20); // Show last 20
                recent.forEach((cmd, i) => {
                    const lineNumber = historyItems.length - recent.length + i + 1;
                    console.log(`${chalk_1.default.gray(lineNumber.toString().padStart(3))} ${cmd}`);
                });
            },
        },
        {
            name: 'clear',
            aliases: ['cls'],
            description: 'Clear the screen',
            handler: async () => {
                console.clear();
            },
        },
        {
            name: 'cd',
            description: 'Change working directory',
            usage: 'cd <directory>',
            examples: ['cd /path/to/project', 'cd ..'],
            handler: async (args, ctx) => {
                if (args.length === 0) {
                    console.log(ctx.workingDirectory);
                    return;
                }
                try {
                    const newDir = args[0] === '~' ? process.env['HOME'] || '/' : args[0];
                    process.chdir(newDir);
                    ctx.workingDirectory = process.cwd();
                    console.log(chalk_1.default.gray(`Changed to: ${ctx.workingDirectory}`));
                }
                catch (error) {
                    console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : String(error));
                }
            },
        },
        {
            name: 'pwd',
            description: 'Print working directory',
            handler: async (_, ctx) => {
                console.log(ctx.workingDirectory);
            },
        },
        {
            name: 'echo',
            description: 'Echo arguments',
            usage: 'echo <text>',
            examples: ['echo "Hello, world!"'],
            handler: async (args) => {
                console.log(args.join(' '));
            },
        },
        {
            name: 'exit',
            aliases: ['quit', 'q'],
            description: 'Exit the REPL',
            handler: async () => {
                console.log(chalk_1.default.gray('Goodbye!'));
                process.exit(0);
            },
        },
    ];
    // Set up command completion
    completer.setCommands(commands);
    // Show initial status
    if (!options.quiet) {
        await showSystemStatus(context);
        console.log(chalk_1.default.gray('Type "help" for available commands or "exit" to quit.\n'));
    }
    // Main REPL loop
    while (true) {
        try {
            const prompt = createPrompt(context);
            const input = await prompt.prompt({
                message: prompt,
                suggestions: (input) => completer.complete(input),
            });
            if (!input.trim()) {
                continue;
            }
            // Add to history
            history.add(input);
            context.history.push(input);
            context.lastActivity = new Date();
            // Parse command
            const args = parseCommand(input);
            const [commandName, ...commandArgs] = args;
            // Find and execute command
            const command = commands.find(c => c.name === commandName ||
                (c.aliases && c.aliases.includes(commandName)));
            if (command) {
                try {
                    await command.handler(commandArgs, context);
                }
                catch (error) {
                    console.error(chalk_1.default.red('Command failed:'), error instanceof Error ? error.message : String(error));
                }
            }
            else {
                console.log(chalk_1.default.red(`Unknown command: ${commandName}`));
                console.log(chalk_1.default.gray('Type "help" for available commands'));
                // Suggest similar commands
                const suggestions = findSimilarCommands(commandName, commands);
                if (suggestions.length > 0) {
                    console.log(chalk_1.default.gray('Did you mean:'), suggestions.map(s => chalk_1.default.cyan(s)).join(', '));
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('EOF') || errorMessage.includes('interrupted')) {
                // Ctrl+D or Ctrl+C pressed
                console.log('\n' + chalk_1.default.gray('Goodbye!'));
                break;
            }
            console.error(chalk_1.default.red('REPL Error:'), errorMessage);
        }
    }
}
function createPrompt(context) {
    const statusIcon = getConnectionStatusIcon(context.connectionStatus);
    const dir = context.workingDirectory.split('/').pop() || '/';
    return `${statusIcon} ${chalk_1.default.cyan('claude-flow')}:${chalk_1.default.yellow(dir)}${chalk_1.default.white('>')} `;
}
function getConnectionStatusIcon(status) {
    switch (status) {
        case 'connected': return chalk_1.default.green('●');
        case 'connecting': return chalk_1.default.yellow('◐');
        case 'disconnected': return chalk_1.default.red('○');
        default: return chalk_1.default.gray('?');
    }
}
function parseCommand(input) {
    // Simple command parsing - handle quoted strings
    const args = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (inQuotes) {
            if (char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
            }
            else {
                current += char;
            }
        }
        else {
            if (char === '"' || char === "'") {
                inQuotes = true;
                quoteChar = char;
            }
            else if (char === ' ' || char === '\t') {
                if (current.trim()) {
                    args.push(current.trim());
                    current = '';
                }
            }
            else {
                current += char;
            }
        }
    }
    if (current.trim()) {
        args.push(current.trim());
    }
    return args;
}
function showHelp(commands) {
    console.log(chalk_1.default.cyan.bold('Claude-Flow Interactive REPL'));
    console.log('─'.repeat(50));
    console.log();
    console.log(chalk_1.default.white.bold('Available Commands:'));
    console.log();
    const table = new cli_table3_1.default({
        head: ['Command', 'Aliases', 'Description'],
        style: { 'padding-left': 0, 'padding-right': 1, border: [] }
    });
    for (const cmd of commands) {
        table.push([
            chalk_1.default.cyan(cmd.name),
            cmd.aliases ? chalk_1.default.gray(cmd.aliases.join(', ')) : '',
            cmd.description
        ]);
    }
    console.log(table.toString());
    console.log();
    console.log(chalk_1.default.gray('Tips:'));
    console.log(chalk_1.default.gray('• Use TAB for command completion'));
    console.log(chalk_1.default.gray('• Use "help <command>" for detailed help'));
    console.log(chalk_1.default.gray('• Use UP/DOWN arrows for command history'));
    console.log(chalk_1.default.gray('• Use Ctrl+C or "exit" to quit'));
}
function showCommandHelp(commands, commandName) {
    const command = commands.find(c => c.name === commandName ||
        (c.aliases && c.aliases.includes(commandName)));
    if (!command) {
        console.log(chalk_1.default.red(`Unknown command: ${commandName}`));
        return;
    }
    console.log(chalk_1.default.cyan.bold(`Command: ${command.name}`));
    console.log('─'.repeat(30));
    console.log(`${chalk_1.default.white('Description:')} ${command.description}`);
    if (command.aliases) {
        console.log(`${chalk_1.default.white('Aliases:')} ${command.aliases.join(', ')}`);
    }
    if (command.usage) {
        console.log(`${chalk_1.default.white('Usage:')} ${command.usage}`);
    }
    if (command.examples) {
        console.log();
        console.log(chalk_1.default.white.bold('Examples:'));
        for (const example of command.examples) {
            console.log(`  ${chalk_1.default.gray('$')} ${chalk_1.default.cyan(example)}`);
        }
    }
}
async function showSystemStatus(context, component) {
    console.log(chalk_1.default.cyan.bold('System Status'));
    console.log('─'.repeat(30));
    const statusIcon = (0, formatter_js_1.formatStatusIndicator)(context.connectionStatus === 'connected' ? 'success' : 'error');
    console.log(`${statusIcon} Connection: ${context.connectionStatus}`);
    console.log(`${chalk_1.default.white('Working Directory:')} ${context.workingDirectory}`);
    console.log(`${chalk_1.default.white('Last Activity:')} ${context.lastActivity.toLocaleTimeString()}`);
    if (context.currentSession) {
        console.log(`${chalk_1.default.white('Current Session:')} ${context.currentSession}`);
    }
    console.log(`${chalk_1.default.white('Commands in History:')} ${context.history.length}`);
    if (context.connectionStatus === 'disconnected') {
        console.log();
        console.log(chalk_1.default.yellow('⚠ Not connected to orchestrator'));
        console.log(chalk_1.default.gray('Use "connect" command to establish connection'));
    }
}
async function connectToOrchestrator(context, target) {
    const host = target || 'localhost:3000';
    console.log(chalk_1.default.yellow(`Connecting to ${host}...`));
    context.connectionStatus = 'connecting';
    // Mock connection attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate connection result
    const success = Math.random() > 0.3; // 70% success rate
    if (success) {
        context.connectionStatus = 'connected';
        console.log(chalk_1.default.green('✓ Connected successfully'));
    }
    else {
        context.connectionStatus = 'disconnected';
        console.log(chalk_1.default.red('✗ Connection failed'));
        console.log(chalk_1.default.gray('Make sure Claude-Flow is running with: claude-flow start'));
    }
}
async function handleAgentCommand(args, context) {
    if (context.connectionStatus !== 'connected') {
        console.log(chalk_1.default.yellow('⚠ Not connected to orchestrator'));
        console.log(chalk_1.default.gray('Use "connect" to establish connection first'));
        return;
    }
    if (args.length === 0) {
        console.log(chalk_1.default.gray('Usage: agent <spawn|list|terminate|info> [options]'));
        return;
    }
    const subcommand = args[0];
    switch (subcommand) {
        case 'list':
            await showAgentList();
            break;
        case 'spawn':
            await handleAgentSpawn(args.slice(1));
            break;
        case 'terminate':
            if (args.length < 2) {
                console.log(chalk_1.default.red('Please specify agent ID'));
            }
            else {
                await handleAgentTerminate(args[1]);
            }
            break;
        case 'info':
            if (args.length < 2) {
                console.log(chalk_1.default.red('Please specify agent ID'));
            }
            else {
                await showAgentInfo(args[1]);
            }
            break;
        default:
            console.log(chalk_1.default.red(`Unknown agent subcommand: ${subcommand}`));
    }
}
async function showAgentList() {
    // Mock agent data
    const agents = [
        { id: 'agent-001', name: 'Coordinator', type: 'coordinator', status: 'active', tasks: 2 },
        { id: 'agent-002', name: 'Researcher', type: 'researcher', status: 'active', tasks: 5 },
        { id: 'agent-003', name: 'Implementer', type: 'implementer', status: 'idle', tasks: 0 },
    ];
    console.log(chalk_1.default.cyan.bold(`Active Agents (${agents.length})`));
    console.log('─'.repeat(50));
    const table = new cli_table3_1.default({
        head: ['ID', 'Name', 'Type', 'Status', 'Tasks']
    });
    for (const agent of agents) {
        const statusIcon = (0, formatter_js_1.formatStatusIndicator)(agent.status);
        table.push([
            chalk_1.default.gray(agent.id),
            chalk_1.default.white(agent.name),
            chalk_1.default.cyan(agent.type),
            `${statusIcon} ${agent.status}`,
            agent.tasks.toString()
        ]);
    }
    console.log(table.toString());
}
async function handleAgentSpawn(args) {
    if (args.length === 0) {
        console.log(chalk_1.default.gray('Usage: agent spawn <type> [name]'));
        console.log(chalk_1.default.gray('Types: coordinator, researcher, implementer, analyst, custom'));
        return;
    }
    const type = args[0];
    const name = args[1] || await prompt.prompt({
        message: 'Agent name:',
        default: `${type}-agent`,
    });
    console.log(chalk_1.default.yellow('Spawning agent...'));
    // Mock spawning
    await new Promise(resolve => setTimeout(resolve, 1000));
    const agentId = (0, helpers_js_1.generateId)('agent');
    console.log(chalk_1.default.green('✓ Agent spawned successfully'));
    console.log(`${chalk_1.default.white('ID:')} ${agentId}`);
    console.log(`${chalk_1.default.white('Name:')} ${name}`);
    console.log(`${chalk_1.default.white('Type:')} ${type}`);
}
async function handleAgentTerminate(agentId) {
    const { confirmed } = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'confirmed',
            message: `Terminate agent ${agentId}?`,
            default: false,
        }]);
    if (!confirmed) {
        console.log(chalk_1.default.gray('Termination cancelled'));
        return;
    }
    console.log(chalk_1.default.yellow('Terminating agent...'));
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(chalk_1.default.green('✓ Agent terminated'));
}
async function showAgentInfo(agentId) {
    // Mock agent info
    console.log(chalk_1.default.cyan.bold('Agent Information'));
    console.log('─'.repeat(30));
    console.log(`${chalk_1.default.white('ID:')} ${agentId}`);
    console.log(`${chalk_1.default.white('Name:')} Research Agent`);
    console.log(`${chalk_1.default.white('Type:')} researcher`);
    console.log(`${chalk_1.default.white('Status:')} ${(0, formatter_js_1.formatStatusIndicator)('success')} active`);
    console.log(`${chalk_1.default.white('Uptime:')} ${(0, formatter_js_1.formatDuration)(3600000)}`);
    console.log(`${chalk_1.default.white('Active Tasks:')} 3`);
    console.log(`${chalk_1.default.white('Completed Tasks:')} 12`);
}
async function handleTaskCommand(args, context) {
    if (context.connectionStatus !== 'connected') {
        console.log(chalk_1.default.yellow('⚠ Not connected to orchestrator'));
        return;
    }
    if (args.length === 0) {
        console.log(chalk_1.default.gray('Usage: task <create|list|status|cancel> [options]'));
        return;
    }
    const subcommand = args[0];
    switch (subcommand) {
        case 'list':
            await showTaskList();
            break;
        case 'create':
            await handleTaskCreate(args.slice(1));
            break;
        case 'status':
            if (args.length < 2) {
                console.log(chalk_1.default.red('Please specify task ID'));
            }
            else {
                await showTaskStatus(args[1]);
            }
            break;
        case 'cancel':
            if (args.length < 2) {
                console.log(chalk_1.default.red('Please specify task ID'));
            }
            else {
                await handleTaskCancel(args[1]);
            }
            break;
        default:
            console.log(chalk_1.default.red(`Unknown task subcommand: ${subcommand}`));
    }
}
async function showTaskList() {
    // Mock task data
    const tasks = [
        { id: 'task-001', type: 'research', description: 'Research quantum computing', status: 'running', agent: 'agent-002' },
        { id: 'task-002', type: 'analysis', description: 'Analyze research results', status: 'pending', agent: null },
        { id: 'task-003', type: 'implementation', description: 'Implement solution', status: 'completed', agent: 'agent-003' },
    ];
    console.log(chalk_1.default.cyan.bold(`Tasks (${tasks.length})`));
    console.log('─'.repeat(60));
    const table = new cli_table3_1.default({
        head: ['ID', 'Type', 'Description', 'Status', 'Agent']
    });
    for (const task of tasks) {
        const statusIcon = (0, formatter_js_1.formatStatusIndicator)(task.status);
        table.push([
            chalk_1.default.gray(task.id),
            chalk_1.default.white(task.type),
            task.description.substring(0, 30) + (task.description.length > 30 ? '...' : ''),
            `${statusIcon} ${task.status}`,
            task.agent ? chalk_1.default.cyan(task.agent) : '-'
        ]);
    }
    console.log(table.toString());
}
async function handleTaskCreate(args) {
    if (args.length < 2) {
        console.log(chalk_1.default.gray('Usage: task create <type> <description>'));
        return;
    }
    const type = args[0];
    const description = args.slice(1).join(' ');
    console.log(chalk_1.default.yellow('Creating task...'));
    await new Promise(resolve => setTimeout(resolve, 500));
    const taskId = (0, helpers_js_1.generateId)('task');
    console.log(chalk_1.default.green('✓ Task created successfully'));
    console.log(`${chalk_1.default.white('ID:')} ${taskId}`);
    console.log(`${chalk_1.default.white('Type:')} ${type}`);
    console.log(`${chalk_1.default.white('Description:')} ${description}`);
}
async function showTaskStatus(taskId) {
    console.log(chalk_1.default.cyan.bold('Task Status'));
    console.log('─'.repeat(30));
    console.log(`${chalk_1.default.white('ID:')} ${taskId}`);
    console.log(`${chalk_1.default.white('Type:')} research`);
    console.log(`${chalk_1.default.white('Status:')} ${(0, formatter_js_1.formatStatusIndicator)('running')} running`);
    console.log(`${chalk_1.default.white('Progress:')} ${(0, formatter_js_1.formatProgressBar)(65, 100, 20)} 65%`);
    console.log(`${chalk_1.default.white('Agent:')} agent-002`);
    console.log(`${chalk_1.default.white('Started:')} ${new Date().toLocaleTimeString()}`);
}
async function handleTaskCancel(taskId) {
    const confirmed = await confirm.prompt({
        message: `Cancel task ${taskId}?`,
        default: false,
    });
    if (!confirmed) {
        console.log(chalk_1.default.gray('Cancellation cancelled'));
        return;
    }
    console.log(chalk_1.default.yellow('Cancelling task...'));
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(chalk_1.default.green('✓ Task cancelled'));
}
async function handleMemoryCommand(args, context) {
    if (context.connectionStatus !== 'connected') {
        console.log(chalk_1.default.yellow('⚠ Not connected to orchestrator'));
        return;
    }
    if (args.length === 0) {
        console.log(chalk_1.default.gray('Usage: memory <query|stats|export> [options]'));
        return;
    }
    const subcommand = args[0];
    switch (subcommand) {
        case 'stats':
            await showMemoryStats();
            break;
        case 'query':
            console.log(chalk_1.default.yellow('Memory query functionality not yet implemented in REPL'));
            break;
        case 'export':
            console.log(chalk_1.default.yellow('Memory export functionality not yet implemented in REPL'));
            break;
        default:
            console.log(chalk_1.default.red(`Unknown memory subcommand: ${subcommand}`));
    }
}
async function showMemoryStats() {
    console.log(chalk_1.default.cyan.bold('Memory Statistics'));
    console.log('─'.repeat(30));
    console.log(`${chalk_1.default.white('Total Entries:')} 1,247`);
    console.log(`${chalk_1.default.white('Cache Size:')} 95 MB`);
    console.log(`${chalk_1.default.white('Hit Rate:')} 94.2%`);
    console.log(`${chalk_1.default.white('Backend:')} SQLite + Markdown`);
}
async function handleSessionCommand(args, context) {
    if (args.length === 0) {
        console.log(chalk_1.default.gray('Usage: session <list|save|restore> [options]'));
        return;
    }
    const subcommand = args[0];
    switch (subcommand) {
        case 'list':
            await showSessionList();
            break;
        case 'save':
            await handleSessionSave(args.slice(1));
            break;
        case 'restore':
            if (args.length < 2) {
                console.log(chalk_1.default.red('Please specify session ID'));
            }
            else {
                await handleSessionRestore(args[1]);
            }
            break;
        default:
            console.log(chalk_1.default.red(`Unknown session subcommand: ${subcommand}`));
    }
}
async function showSessionList() {
    // Mock session data
    const sessions = [
        { id: 'session-001', name: 'Research Project', date: '2024-01-15', agents: 3, tasks: 8 },
        { id: 'session-002', name: 'Development', date: '2024-01-14', agents: 2, tasks: 5 },
    ];
    console.log(chalk_1.default.cyan.bold(`Saved Sessions (${sessions.length})`));
    console.log('─'.repeat(50));
    const table = new cli_table3_1.default({
        head: ['ID', 'Name', 'Date', 'Agents', 'Tasks']
    });
    for (const session of sessions) {
        table.push([
            chalk_1.default.gray(session.id),
            chalk_1.default.white(session.name),
            session.date,
            session.agents.toString(),
            session.tasks.toString()
        ]);
    }
    console.log(table.toString());
}
async function handleSessionSave(args) {
    const name = args.length > 0 ? args.join(' ') : await prompt.prompt({
        message: 'Session name:',
        default: `session-${new Date().toISOString().split('T')[0]}`,
    });
    console.log(chalk_1.default.yellow('Saving session...'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    const sessionId = (0, helpers_js_1.generateId)('session');
    console.log(chalk_1.default.green('✓ Session saved successfully'));
    console.log(`${chalk_1.default.white('ID:')} ${sessionId}`);
    console.log(`${chalk_1.default.white('Name:')} ${name}`);
}
async function handleSessionRestore(sessionId) {
    const confirmed = await confirm.prompt({
        message: `Restore session ${sessionId}?`,
        default: false,
    });
    if (!confirmed) {
        console.log(chalk_1.default.gray('Restore cancelled'));
        return;
    }
    console.log(chalk_1.default.yellow('Restoring session...'));
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(chalk_1.default.green('✓ Session restored successfully'));
}
async function handleWorkflowCommand(args, context) {
    if (context.connectionStatus !== 'connected') {
        console.log(chalk_1.default.yellow('⚠ Not connected to orchestrator'));
        return;
    }
    if (args.length === 0) {
        console.log(chalk_1.default.gray('Usage: workflow <list|run|status> [options]'));
        return;
    }
    const subcommand = args[0];
    switch (subcommand) {
        case 'list':
            await showWorkflowList();
            break;
        case 'run':
            if (args.length < 2) {
                console.log(chalk_1.default.red('Please specify workflow file'));
            }
            else {
                await handleWorkflowRun(args[1]);
            }
            break;
        case 'status':
            if (args.length < 2) {
                console.log(chalk_1.default.red('Please specify workflow ID'));
            }
            else {
                await showWorkflowStatus(args[1]);
            }
            break;
        default:
            console.log(chalk_1.default.red(`Unknown workflow subcommand: ${subcommand}`));
    }
}
async function showWorkflowList() {
    // Mock workflow data
    const workflows = [
        { id: 'workflow-001', name: 'Research Pipeline', status: 'running', progress: 60 },
        { id: 'workflow-002', name: 'Data Analysis', status: 'completed', progress: 100 },
    ];
    console.log(chalk_1.default.cyan.bold(`Workflows (${workflows.length})`));
    console.log('─'.repeat(50));
    const table = new cli_table3_1.default()
        .header(['ID', 'Name', 'Status', 'Progress'])
        .border(true);
    for (const workflow of workflows) {
        const statusIcon = (0, formatter_js_1.formatStatusIndicator)(workflow.status);
        const progressBar = (0, formatter_js_1.formatProgressBar)(workflow.progress, 100, 15);
        table.push([
            chalk_1.default.gray(workflow.id),
            chalk_1.default.white(workflow.name),
            `${statusIcon} ${workflow.status}`,
            `${progressBar} ${workflow.progress}%`
        ]);
    }
    console.log(table.toString());
}
async function handleWorkflowRun(filename) {
    try {
        await node_fs_1.promises.stat(filename);
        console.log(chalk_1.default.yellow(`Running workflow: ${filename}`));
        await new Promise(resolve => setTimeout(resolve, 1000));
        const workflowId = (0, helpers_js_1.generateId)('workflow');
        console.log(chalk_1.default.green('✓ Workflow started successfully'));
        console.log(`${chalk_1.default.white('ID:')} ${workflowId}`);
    }
    catch {
        console.log(chalk_1.default.red(`Workflow file not found: ${filename}`));
    }
}
async function showWorkflowStatus(workflowId) {
    console.log(chalk_1.default.cyan.bold('Workflow Status'));
    console.log('─'.repeat(30));
    console.log(`${chalk_1.default.white('ID:')} ${workflowId}`);
    console.log(`${chalk_1.default.white('Name:')} Research Pipeline`);
    console.log(`${chalk_1.default.white('Status:')} ${(0, formatter_js_1.formatStatusIndicator)('running')} running`);
    console.log(`${chalk_1.default.white('Progress:')} ${(0, formatter_js_1.formatProgressBar)(75, 100, 20)} 75%`);
    console.log(`${chalk_1.default.white('Tasks:')} 6/8 completed`);
    console.log(`${chalk_1.default.white('Started:')} ${new Date().toLocaleTimeString()}`);
}
function findSimilarCommands(input, commands) {
    const allNames = commands.flatMap(c => [c.name, ...(c.aliases || [])]);
    return allNames
        .filter(name => {
        // Simple similarity check - could use Levenshtein distance
        const commonChars = input.split('').filter(char => name.includes(char)).length;
        return commonChars >= Math.min(2, input.length / 2);
    })
        .slice(0, 3); // Top 3 suggestions
}
