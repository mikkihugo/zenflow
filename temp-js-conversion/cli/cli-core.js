#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = exports.VERSION = void 0;
exports.success = success;
exports.error = error;
exports.warning = warning;
exports.info = info;
/**
 * Claude-Flow CLI - Core implementation using Node.js
 */
const chalk_1 = require("chalk");
const fs_extra_1 = require("fs-extra");
exports.VERSION = "1.0.45";
class CLI {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.commands = new Map();
        this.globalOptions = [
            {
                name: "help",
                short: "h",
                description: "Show help",
                type: "boolean",
            },
            {
                name: "version",
                short: "v",
                description: "Show version",
                type: "boolean",
            },
            {
                name: "config",
                short: "c",
                description: "Path to configuration file",
                type: "string",
            },
            {
                name: "verbose",
                description: "Enable verbose logging",
                type: "boolean",
            },
            {
                name: "log-level",
                description: "Set log level (debug, info, warn, error)",
                type: "string",
                default: "info",
            },
        ];
    }
    command(cmd) {
        // Handle both our Command interface and Commander.js Command objects
        const cmdName = typeof cmd.name === 'function' ? cmd.name() : (cmd.name || 'unknown');
        this.commands.set(cmdName, cmd);
        if (cmd.aliases && typeof cmd.aliases[Symbol.iterator] === 'function') {
            for (const alias of cmd.aliases) {
                this.commands.set(alias, cmd);
            }
        }
        return this;
    }
    async run(args = process.argv.slice(2)) {
        // Parse arguments manually since we're replacing the Deno parse function
        const flags = this.parseArgs(args);
        if (flags.version || flags.v) {
            console.log(`${this.name} v${exports.VERSION}`);
            return;
        }
        const commandName = flags._[0]?.toString() || "";
        if (!commandName || flags.help || flags.h) {
            this.showHelp();
            return;
        }
        const command = this.commands.get(commandName);
        if (!command) {
            console.error(chalk_1.default.red(`Unknown command: ${commandName}`));
            console.log(`Run "${this.name} help" for available commands`);
            process.exit(1);
        }
        const ctx = {
            args: flags._.slice(1).map(String),
            flags: flags,
            config: await this.loadConfig(flags.config),
        };
        try {
            if (command.action) {
                await command.action(ctx);
            }
            else {
                console.log(chalk_1.default.yellow(`Command '${commandName}' has no action defined`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`Error executing command '${commandName}':`), error.message);
            if (flags.verbose) {
                console.error(error);
            }
            process.exit(1);
        }
    }
    parseArgs(args) {
        const result = { _: [] };
        let i = 0;
        while (i < args.length) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                    result[key] = args[i + 1];
                    i += 2;
                }
                else {
                    result[key] = true;
                    i++;
                }
            }
            else if (arg.startsWith('-')) {
                const key = arg.slice(1);
                if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                    result[key] = args[i + 1];
                    i += 2;
                }
                else {
                    result[key] = true;
                    i++;
                }
            }
            else {
                result._.push(arg);
                i++;
            }
        }
        return result;
    }
    async loadConfig(configPath) {
        const configFile = configPath || "claude-flow.config.json";
        try {
            const content = await fs_extra_1.default.readFile(configFile, 'utf8');
            return JSON.parse(content);
        }
        catch {
            return undefined;
        }
    }
    getBooleanFlags() {
        const flags = [];
        for (const opt of [...this.globalOptions, ...this.getAllOptions()]) {
            if (opt.type === "boolean") {
                flags.push(opt.name);
                if (opt.short)
                    flags.push(opt.short);
            }
        }
        return flags;
    }
    getStringFlags() {
        const flags = [];
        for (const opt of [...this.globalOptions, ...this.getAllOptions()]) {
            if (opt.type === "string" || opt.type === "number") {
                flags.push(opt.name);
                if (opt.short)
                    flags.push(opt.short);
            }
        }
        return flags;
    }
    getAliases() {
        const aliases = {};
        for (const opt of [...this.globalOptions, ...this.getAllOptions()]) {
            if (opt.short) {
                aliases[opt.short] = opt.name;
            }
        }
        return aliases;
    }
    getDefaults() {
        const defaults = {};
        for (const opt of [...this.globalOptions, ...this.getAllOptions()]) {
            if (opt.default !== undefined) {
                defaults[opt.name] = opt.default;
            }
        }
        return defaults;
    }
    getAllOptions() {
        const options = [];
        for (const cmd of this.commands.values()) {
            if (cmd.options) {
                options.push(...cmd.options);
            }
        }
        return options;
    }
    showHelp() {
        console.log(`
${chalk_1.default.bold(chalk_1.default.blue(`🧠 ${this.name} v${exports.VERSION}`))} - ${this.description}

${chalk_1.default.bold("USAGE:")}
  ${this.name} [COMMAND] [OPTIONS]

${chalk_1.default.bold("COMMANDS:")}
${this.formatCommands()}

${chalk_1.default.bold("GLOBAL OPTIONS:")}
${this.formatOptions(this.globalOptions)}

${chalk_1.default.bold("EXAMPLES:")}
  ${this.name} start                                    # Start orchestrator
  ${this.name} agent spawn researcher --name "Bot"     # Spawn research agent
  ${this.name} task create research "Analyze data"     # Create task
  ${this.name} config init                             # Initialize config
  ${this.name} status                                  # Show system status

For more detailed help on specific commands, use:
  ${this.name} [COMMAND] --help

Documentation: https://github.com/ruvnet/claude-code-flow
Issues: https://github.com/ruvnet/claude-code-flow/issues

Created by rUv - Built with ❤️ for the Claude community
`);
    }
    formatCommands() {
        const commands = Array.from(new Set(this.commands.values()));
        return commands
            .filter(cmd => cmd && cmd.name) // Filter out invalid commands
            .map(cmd => `  ${String(cmd.name).padEnd(20)} ${cmd.description || ''}`)
            .join("\n");
    }
    formatOptions(options) {
        return options
            .map(opt => {
            const flags = opt.short ? `-${opt.short}, --${opt.name}` : `    --${opt.name}`;
            return `  ${flags.padEnd(25)} ${opt.description}`;
        })
            .join("\n");
    }
}
exports.CLI = CLI;
// Helper functions
function success(message) {
    console.log(chalk_1.default.green(`✅ ${message}`));
}
function error(message) {
    console.error(chalk_1.default.red(`❌ ${message}`));
}
function warning(message) {
    console.warn(chalk_1.default.yellow(`⚠️  ${message}`));
}
function info(message) {
    console.log(chalk_1.default.blue(`ℹ️  ${message}`));
}
// Main CLI setup if running directly
async function main() {
    if (process.argv[1] && (process.argv[1].endsWith('cli-core.js') || process.argv[1].endsWith('cli-core.ts'))) {
        const cli = new CLI("claude-flow", "Advanced AI Agent Orchestration System");
        // Import and register all commands
        const { setupCommands } = await Promise.resolve().then(() => require("./commands/index.js"));
        setupCommands(cli);
        // Run the CLI
        await cli.run();
    }
}
// Execute main if this is the entry point
main().catch(console.error);
