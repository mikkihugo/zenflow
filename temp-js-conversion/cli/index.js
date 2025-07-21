#!/usr/bin/env -S deno run --allow-all
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Claude-Flow CLI entry point
 * This redirects to simple-cli.ts for remote execution compatibility
 */
// Import and run the simple CLI which doesn't have external dependencies
require("./simple-cli.ts");
// Spinner import removed - not available in current cliffy version
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const logger_js_1 = require("../core/logger.js");
const config_js_1 = require("../core/config.js");
const start_js_1 = require("./commands/start.js");
const agent_js_1 = require("./commands/agent.js");
const task_js_1 = require("./commands/task.js");
const memory_js_1 = require("./commands/memory.js");
const config_js_2 = require("./commands/config.js");
const status_js_1 = require("./commands/status.js");
const monitor_js_1 = require("./commands/monitor.js");
const session_js_1 = require("./commands/session.js");
const workflow_js_1 = require("./commands/workflow.js");
const help_js_1 = require("./commands/help.js");
const mcp_js_1 = require("./commands/mcp.js");
const formatter_js_1 = require("./formatter.js");
const repl_js_1 = require("./repl.js");
const completion_js_1 = require("./completion.js");
// Version information
const VERSION = '1.0.71';
const BUILD_DATE = new Date().toISOString().split('T')[0];
// Main CLI command
const cli = new commander_1.Command()
    .name('claude-flow')
    .version(VERSION)
    .description('Claude-Flow: Advanced AI agent orchestration system for multi-agent coordination')
    // .meta() commented out - not available
    // .meta() commented out - not available
    .option('-c, --config <path>', 'Path to configuration file', './claude-flow.config.json')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--log-level <level>', 'Set log level (debug, info, warn, error)', 'info')
    .option('--no-color', 'Disable colored output')
    .option('--json', 'Output in JSON format where applicable')
    .option('--profile <profile>', 'Use named configuration profile')
    .action(async (options) => {
    // If no subcommand, show banner and start REPL
    await setupLogging(options);
    if (!options.quiet) {
        (0, formatter_js_1.displayBanner)(VERSION);
        console.log(chalk_1.default.gray('Type "help" for available commands or "exit" to quit.\n'));
    }
    await (0, repl_js_1.startREPL)(options);
});
// Add subcommands
cli
    .addCommand(start_js_1.startCommand)
    .addCommand(agent_js_1.agentCommand)
    .addCommand(task_js_1.taskCommand)
    .addCommand(memory_js_1.memoryCommand)
    .addCommand(config_js_2.configCommand)
    .addCommand(status_js_1.statusCommand)
    .addCommand(monitor_js_1.monitorCommand)
    .addCommand(session_js_1.sessionCommand)
    .addCommand(workflow_js_1.workflowCommand)
    .addCommand(mcp_js_1.mcpCommand)
    .addCommand(help_js_1.helpCommand)
    .command('repl', new commander_1.Command()
    .description('Start interactive REPL mode with command completion')
    .option('--no-banner', 'Skip welcome banner')
    .option('--history-file <path:string>', 'Custom history file path')
    .action(async (options) => {
    await setupLogging(options);
    if (options.banner !== false) {
        (0, formatter_js_1.displayBanner)(VERSION);
    }
    await (0, repl_js_1.startREPL)(options);
}))
    .command('version', new commander_1.Command()
    .description('Show detailed version information')
    .option('--short', 'Show version number only')
    .action(async (options) => {
    if (options.short) {
        console.log(VERSION);
    }
    else {
        (0, formatter_js_1.displayVersion)(VERSION, BUILD_DATE);
    }
}))
    .command('completion', new commander_1.Command()
    .description('Generate shell completion scripts')
    .arguments('[shell:string]')
    .option('--install', 'Install completion script automatically')
    .action(async (options, shell) => {
    const generator = new completion_js_1.CompletionGenerator();
    await generator.generate(shell || 'detect', options.install === true);
}));
// Global error handler
async function handleError(error, options) {
    const formatted = (0, formatter_js_1.formatError)(error);
    if (options?.json) {
        console.error(JSON.stringify({
            error: true,
            message: formatted,
            timestamp: new Date().toISOString(),
        }));
    }
    else {
        console.error(chalk_1.default.red(chalk_1.default.bold('✗ Error:')), formatted);
    }
    // Show stack trace in debug mode or verbose
    if (process.env['CLAUDE_FLOW_DEBUG'] === 'true' || options?.verbose) {
        console.error(chalk_1.default.gray('\nStack trace:'));
        console.error(error);
    }
    // Suggest helpful actions
    if (!options?.quiet) {
        console.error(chalk_1.default.gray('\nTry running with --verbose for more details'));
        console.error(chalk_1.default.gray('Or use "claude-flow help" to see available commands'));
    }
    process.exit(1);
}
// Setup logging and configuration based on CLI options
async function setupLogging(options) {
    // Determine log level
    let logLevel = options.logLevel;
    if (options.verbose)
        logLevel = 'debug';
    if (options.quiet)
        logLevel = 'warn';
    // Configure logger
    await logger_js_1.logger.configure({
        level: logLevel,
        format: options.json ? 'json' : 'text',
        destination: 'console',
    });
    // Load configuration
    try {
        if (options.config) {
            await config_js_1.configManager.load(options.config);
        }
        else {
            // Try to load default config file if it exists
            try {
                await config_js_1.configManager.load('./claude-flow.config.json');
            }
            catch {
                // Use default config if no file found
                config_js_1.configManager.loadDefault();
            }
        }
        // Apply profile if specified
        if (options.profile) {
            await config_js_1.configManager.applyProfile(options.profile);
        }
    }
    catch (error) {
        logger_js_1.logger.warn('Failed to load configuration:', error.message);
        config_js_1.configManager.loadDefault();
    }
}
// Signal handlers for graceful shutdown
function setupSignalHandlers() {
    const gracefulShutdown = () => {
        console.log('\n' + chalk_1.default.gray('Gracefully shutting down...'));
        process.exit(0);
    };
    Deno.addSignalListener('SIGINT', gracefulShutdown);
    Deno.addSignalListener('SIGTERM', gracefulShutdown);
}
// Main entry point
if (false) { // import.meta.main not available
    let globalOptions = {};
    try {
        // Setup signal handlers
        setupSignalHandlers();
        // Pre-parse global options for error handling
        const args = Deno.args;
        globalOptions = {
            verbose: args.includes('-v') || args.includes('--verbose'),
            quiet: args.includes('-q') || args.includes('--quiet'),
            json: args.includes('--json'),
            noColor: args.includes('--no-color'),
        };
        // Configure colors based on options
        if (globalOptions.noColor) {
            // colors.setColorEnabled(false);
        }
        await cli.parse(args);
    }
    catch (error) {
        await handleError(error, globalOptions);
    }
}
