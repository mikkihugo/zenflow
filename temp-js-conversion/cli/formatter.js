"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = formatError;
exports.formatAgent = formatAgent;
exports.formatTask = formatTask;
exports.formatMemoryEntry = formatMemoryEntry;
exports.formatHealthStatus = formatHealthStatus;
exports.createAgentTable = createAgentTable;
exports.createTaskTable = createTaskTable;
exports.formatDuration = formatDuration;
exports.displayBanner = displayBanner;
exports.displayVersion = displayVersion;
exports.formatProgressBar = formatProgressBar;
exports.formatStatusIndicator = formatStatusIndicator;
exports.formatSuccess = formatSuccess;
exports.formatInfo = formatInfo;
exports.formatWarning = formatWarning;
exports.formatSpinner = formatSpinner;
/**
 * Output formatting utilities for CLI
 */
const chalk_1 = require("chalk");
const cli_table3_1 = require("cli-table3");
const process = require("process");
/**
 * Formats an error for display
 */
function formatError(error) {
    if (error instanceof Error) {
        let message = (error instanceof Error ? error.message : String(error));
        if ('code' in error) {
            message = `[${error.code}] ${message}`;
        }
        if ('details' in error && error.details) {
            message += '\n' + chalk_1.default.gray('Details: ' + JSON.stringify(error.details, null, 2));
        }
        return message;
    }
    return String(error);
}
/**
 * Formats an agent profile for display
 */
function formatAgent(agent) {
    const lines = [
        chalk_1.default.cyan.bold(`Agent: ${agent.name}`),
        chalk_1.default.gray(`ID: ${agent.id}`),
        chalk_1.default.gray(`Type: ${agent.type}`),
        chalk_1.default.gray(`Priority: ${agent.priority}`),
        chalk_1.default.gray(`Max Tasks: ${agent.maxConcurrentTasks}`),
        chalk_1.default.gray(`Capabilities: ${agent.capabilities.join(', ')}`),
    ];
    return lines.join('\n');
}
/**
 * Formats a task for display
 */
function formatTask(task) {
    const statusColor = {
        pending: chalk_1.default.gray,
        queued: chalk_1.default.yellow,
        assigned: chalk_1.default.blue,
        running: chalk_1.default.cyan,
        completed: chalk_1.default.green,
        failed: chalk_1.default.red,
        cancelled: chalk_1.default.magenta,
    }[task.status] || chalk_1.default.white;
    const lines = [
        chalk_1.default.yellow.bold(`Task: ${task.description}`),
        chalk_1.default.gray(`ID: ${task.id}`),
        chalk_1.default.gray(`Type: ${task.type}`),
        statusColor(`Status: ${task.status}`),
        chalk_1.default.gray(`Priority: ${task.priority}`),
    ];
    if (task.assignedAgent) {
        lines.push(chalk_1.default.gray(`Assigned to: ${task.assignedAgent}`));
    }
    if (task.dependencies.length > 0) {
        lines.push(chalk_1.default.gray(`Dependencies: ${task.dependencies.join(', ')}`));
    }
    if (task.error) {
        lines.push(chalk_1.default.red(`Error: ${task.error}`));
    }
    return lines.join('\n');
}
/**
 * Formats a memory entry for display
 */
function formatMemoryEntry(entry) {
    const lines = [
        chalk_1.default.magenta.bold(`Memory Entry: ${entry.type}`),
        chalk_1.default.gray(`ID: ${entry.id}`),
        chalk_1.default.gray(`Agent: ${entry.agentId}`),
        chalk_1.default.gray(`Session: ${entry.sessionId}`),
        chalk_1.default.gray(`Timestamp: ${entry.timestamp.toISOString()}`),
        chalk_1.default.gray(`Version: ${entry.version}`),
    ];
    if (entry.tags.length > 0) {
        lines.push(chalk_1.default.gray(`Tags: ${entry.tags.join(', ')}`));
    }
    lines.push('', chalk_1.default.white('Content:'), entry.content);
    return lines.join('\n');
}
/**
 * Formats health status for display
 */
function formatHealthStatus(health) {
    const statusColor = {
        healthy: chalk_1.default.green,
        degraded: chalk_1.default.yellow,
        unhealthy: chalk_1.default.red,
    }[health.status];
    const lines = [
        statusColor.bold(`System Status: ${health.status.toUpperCase()}`),
        chalk_1.default.gray(`Checked at: ${health.timestamp.toISOString()}`),
        '',
        chalk_1.default.cyan.bold('Components:'),
    ];
    for (const [name, component] of Object.entries(health.components)) {
        const compColor = {
            healthy: chalk_1.default.green,
            degraded: chalk_1.default.yellow,
            unhealthy: chalk_1.default.red,
        }[component.status];
        lines.push(compColor(`  ${name}: ${component.status}`));
        if (component.error) {
            lines.push(chalk_1.default.red(`    Error: ${component.error}`));
        }
        if (component.metrics) {
            for (const [metric, value] of Object.entries(component.metrics)) {
                lines.push(chalk_1.default.gray(`    ${metric}: ${value}`));
            }
        }
    }
    return lines.join('\n');
}
/**
 * Creates a table for agent listing
 */
function createAgentTable(agents) {
    const table = new cli_table3_1.default({
        head: ['ID', 'Name', 'Type', 'Priority', 'Max Tasks']
    });
    for (const agent of agents) {
        table.push([
            agent.id,
            agent.name,
            agent.type,
            agent.priority.toString(),
            agent.maxConcurrentTasks.toString(),
        ]);
    }
    return table;
}
/**
 * Creates a table for task listing
 */
function createTaskTable(tasks) {
    const table = new cli_table3_1.default({
        head: ['ID', 'Type', 'Description', 'Status', 'Agent']
    });
    for (const task of tasks) {
        const statusCell = {
            pending: chalk_1.default.gray(task.status),
            queued: chalk_1.default.yellow(task.status),
            assigned: chalk_1.default.blue(task.status),
            running: chalk_1.default.cyan(task.status),
            completed: chalk_1.default.green(task.status),
            failed: chalk_1.default.red(task.status),
            cancelled: chalk_1.default.magenta(task.status),
        }[task.status] || task.status;
        table.push([
            task.id,
            task.type,
            task.description.substring(0, 40) + (task.description.length > 40 ? '...' : ''),
            statusCell,
            task.assignedAgent || '-',
        ]);
    }
    return table;
}
/**
 * Formats duration in human-readable form
 */
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}
/**
 * Displays the Claude-Flow banner
 */
function displayBanner(version) {
    const banner = `
${chalk_1.default.cyan.bold('╔══════════════════════════════════════════════════════════════╗')}
${chalk_1.default.cyan.bold('║')}             ${chalk_1.default.white.bold('🧠 Claude-Flow')} ${chalk_1.default.gray('v' + version)}                        ${chalk_1.default.cyan.bold('║')}
${chalk_1.default.cyan.bold('║')}          ${chalk_1.default.gray('Advanced AI Agent Orchestration')}               ${chalk_1.default.cyan.bold('║')}
${chalk_1.default.cyan.bold('╚══════════════════════════════════════════════════════════════╝')}
`;
    console.log(banner);
}
/**
 * Displays detailed version information
 */
function displayVersion(version, buildDate) {
    const info = [
        chalk_1.default.cyan.bold('Claude-Flow Version Information'),
        '',
        chalk_1.default.white('Version:    ') + chalk_1.default.yellow(version),
        chalk_1.default.white('Build Date: ') + chalk_1.default.yellow(buildDate),
        chalk_1.default.white('Runtime:    ') + chalk_1.default.yellow('Node.js ' + process.version),
        chalk_1.default.white('Platform:   ') + chalk_1.default.yellow(process.platform),
        chalk_1.default.white('Arch:       ') + chalk_1.default.yellow(process.arch),
        '',
        chalk_1.default.gray('Components:'),
        chalk_1.default.white('  • Multi-Agent Orchestration'),
        chalk_1.default.white('  • Memory Management'),
        chalk_1.default.white('  • Terminal Integration'),
        chalk_1.default.white('  • MCP Server'),
        chalk_1.default.white('  • Task Coordination'),
        '',
        chalk_1.default.blue('Homepage: ') + chalk_1.default.underline('https://github.com/ruvnet/claude-flow'),
    ];
    console.log(info.join('\n'));
}
/**
 * Formats a progress bar
 */
function formatProgressBar(current, total, width = 40, label) {
    const percentage = Math.min(100, (current / total) * 100);
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    const bar = chalk_1.default.green('█'.repeat(filled)) + chalk_1.default.gray('░'.repeat(empty));
    const percent = percentage.toFixed(1).padStart(5) + '%';
    let result = `[${bar}] ${percent}`;
    if (label) {
        result = `${label}: ${result}`;
    }
    return result;
}
/**
 * Creates a status indicator
 */
function formatStatusIndicator(status) {
    const indicators = {
        success: chalk_1.default.green('✓'),
        error: chalk_1.default.red('✗'),
        warning: chalk_1.default.yellow('⚠'),
        info: chalk_1.default.blue('ℹ'),
        running: chalk_1.default.cyan('⟳'),
        pending: chalk_1.default.gray('○'),
    };
    return indicators[status] || status;
}
/**
 * Formats a success message
 */
function formatSuccess(message) {
    return chalk_1.default.green('✓') + ' ' + chalk_1.default.white(message);
}
/**
 * Formats an info message
 */
function formatInfo(message) {
    return chalk_1.default.blue('ℹ') + ' ' + chalk_1.default.white(message);
}
/**
 * Formats a warning message
 */
function formatWarning(message) {
    return chalk_1.default.yellow('⚠') + ' ' + chalk_1.default.white(message);
}
/**
 * Formats a spinner with message
 */
function formatSpinner(message, frame = 0) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const spinner = chalk_1.default.cyan(frames[frame % frames.length]);
    return `${spinner} ${message}`;
}
