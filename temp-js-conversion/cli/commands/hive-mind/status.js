#!/usr/bin/env node
"use strict";
/**
 * Hive Mind Status Command
 *
 * Displays comprehensive status of the Hive Mind swarm
 * including agents, tasks, memory, and performance metrics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const cli_table3_1 = require("cli-table3");
const HiveMind_js_1 = require("../../../hive-mind/core/HiveMind.js");
const formatter_js_1 = require("../../formatter.js");
const DatabaseManager_js_1 = require("../../../hive-mind/core/DatabaseManager.js");
exports.statusCommand = new commander_1.Command('status')
    .description('Display Hive Mind swarm status and metrics')
    .option('-s, --swarm-id <id>', 'Specific swarm ID to check')
    .option('-d, --detailed', 'Show detailed agent information', false)
    .option('-m, --memory', 'Show memory usage statistics', false)
    .option('-t, --tasks', 'Show task queue details', false)
    .option('-p, --performance', 'Show performance metrics', false)
    .option('-w, --watch', 'Watch status in real-time', false)
    .option('-j, --json', 'Output as JSON', false)
    .action(async (options) => {
    try {
        // Get swarm ID
        const swarmId = options.swarmId || await getActiveSwarmId();
        if (!swarmId) {
            throw new Error('No active swarm found. Initialize a Hive Mind first.');
        }
        // Load Hive Mind
        const hiveMind = await HiveMind_js_1.HiveMind.load(swarmId);
        const status = await hiveMind.getFullStatus();
        if (options.json) {
            console.log(JSON.stringify(status, null, 2));
            return;
        }
        // Display swarm header
        console.log('\n' + chalk_1.default.bold.yellow('🐝 Hive Mind Status'));
        console.log(chalk_1.default.gray('━'.repeat(60)));
        // Basic info
        console.log((0, formatter_js_1.formatInfo)(`Swarm ID: ${status.swarmId}`));
        console.log((0, formatter_js_1.formatInfo)(`Name: ${status.name}`));
        console.log((0, formatter_js_1.formatInfo)(`Topology: ${status.topology}`));
        console.log((0, formatter_js_1.formatInfo)(`Queen Mode: ${status.queenMode}`));
        console.log((0, formatter_js_1.formatInfo)(`Status: ${getStatusEmoji(status.health)} ${status.health}`));
        console.log((0, formatter_js_1.formatInfo)(`Uptime: ${formatUptime(status.uptime)}`));
        // Agent summary
        console.log('\n' + chalk_1.default.bold('👥 Agent Summary'));
        const agentTable = new cli_table3_1.default({
            head: ['Type', 'Total', 'Active', 'Idle', 'Busy'],
            style: { head: ['cyan'] }
        });
        Object.entries(status.agentsByType).forEach(([type, count]) => {
            const active = status.agents.filter(a => a.type === type && a.status === 'active').length;
            const idle = status.agents.filter(a => a.type === type && a.status === 'idle').length;
            const busy = status.agents.filter(a => a.type === type && a.status === 'busy').length;
            agentTable.push([type, count, active, idle, busy]);
        });
        console.log(agentTable.toString());
        // Detailed agent info
        if (options.detailed) {
            console.log('\n' + chalk_1.default.bold('🤖 Agent Details'));
            const detailTable = new cli_table3_1.default({
                head: ['Name', 'Type', 'Status', 'Task', 'Messages', 'Uptime'],
                style: { head: ['cyan'] }
            });
            status.agents.forEach(agent => {
                detailTable.push([
                    agent.name,
                    agent.type,
                    getAgentStatusBadge(agent.status),
                    agent.currentTask || '-',
                    agent.messageCount,
                    formatUptime(Date.now() - agent.createdAt)
                ]);
            });
            console.log(detailTable.toString());
        }
        // Task queue
        if (options.tasks || status.tasks.length > 0) {
            console.log('\n' + chalk_1.default.bold('📋 Task Queue'));
            const taskTable = new cli_table3_1.default({
                head: ['ID', 'Description', 'Status', 'Assigned To', 'Progress'],
                style: { head: ['cyan'] }
            });
            status.tasks.forEach(task => {
                taskTable.push([
                    task.id.substring(0, 8),
                    task.description.substring(0, 40) + (task.description.length > 40 ? '...' : ''),
                    getTaskStatusBadge(task.status),
                    task.assignedAgent || '-',
                    `${task.progress}%`
                ]);
            });
            console.log(taskTable.toString());
            console.log((0, formatter_js_1.formatInfo)(`Total Tasks: ${status.taskStats.total}`));
            console.log((0, formatter_js_1.formatInfo)(`Completed: ${status.taskStats.completed} | In Progress: ${status.taskStats.inProgress} | Pending: ${status.taskStats.pending}`));
        }
        // Memory statistics
        if (options.memory) {
            console.log('\n' + chalk_1.default.bold('💾 Memory Statistics'));
            const memTable = new cli_table3_1.default({
                head: ['Namespace', 'Entries', 'Size', 'Avg TTL'],
                style: { head: ['cyan'] }
            });
            Object.entries(status.memoryStats.byNamespace).forEach(([ns, stats]) => {
                memTable.push([
                    ns,
                    stats.entries,
                    formatBytes(stats.size),
                    `${stats.avgTTL}s`
                ]);
            });
            console.log(memTable.toString());
            console.log((0, formatter_js_1.formatInfo)(`Total Memory Usage: ${formatBytes(status.memoryStats.totalSize)}`));
            console.log((0, formatter_js_1.formatInfo)(`Total Entries: ${status.memoryStats.totalEntries}`));
        }
        // Performance metrics
        if (options.performance) {
            console.log('\n' + chalk_1.default.bold('📊 Performance Metrics'));
            console.log((0, formatter_js_1.formatInfo)(`Avg Task Completion: ${status.performance.avgTaskCompletion}ms`));
            console.log((0, formatter_js_1.formatInfo)(`Message Throughput: ${status.performance.messageThroughput}/min`));
            console.log((0, formatter_js_1.formatInfo)(`Consensus Success Rate: ${status.performance.consensusSuccessRate}%`));
            console.log((0, formatter_js_1.formatInfo)(`Memory Hit Rate: ${status.performance.memoryHitRate}%`));
            console.log((0, formatter_js_1.formatInfo)(`Agent Utilization: ${status.performance.agentUtilization}%`));
        }
        // Communications
        console.log('\n' + chalk_1.default.bold('📡 Recent Communications'));
        console.log((0, formatter_js_1.formatInfo)(`Total Messages: ${status.communicationStats.totalMessages}`));
        console.log((0, formatter_js_1.formatInfo)(`Avg Latency: ${status.communicationStats.avgLatency}ms`));
        console.log((0, formatter_js_1.formatInfo)(`Active Channels: ${status.communicationStats.activeChannels}`));
        // Health warnings
        if (status.warnings.length > 0) {
            console.log('\n' + chalk_1.default.bold.yellow('⚠️  Warnings'));
            status.warnings.forEach(warning => {
                console.log((0, formatter_js_1.formatWarning)(warning));
            });
        }
        // Watch mode
        if (options.watch) {
            console.log('\n' + chalk_1.default.gray('Refreshing every 2 seconds... (Ctrl+C to exit)'));
            setInterval(async () => {
                console.clear();
                await exports.statusCommand.parseAsync([...process.argv.slice(0, 2), ...process.argv.slice(3)]);
            }, 2000);
        }
    }
    catch (error) {
        console.error((0, formatter_js_1.formatError)('Failed to get swarm status'));
        console.error((0, formatter_js_1.formatError)(error.message));
        process.exit(1);
    }
});
async function getActiveSwarmId() {
    const db = await DatabaseManager_js_1.DatabaseManager.getInstance();
    return db.getActiveSwarmId();
}
function getStatusEmoji(health) {
    const emojis = {
        healthy: '🟢',
        degraded: '🟡',
        critical: '🔴',
        unknown: '⚪'
    };
    return emojis[health] || '⚪';
}
function getAgentStatusBadge(status) {
    const badges = {
        active: chalk_1.default.green('● Active'),
        idle: chalk_1.default.yellow('● Idle'),
        busy: chalk_1.default.blue('● Busy'),
        error: chalk_1.default.red('● Error')
    };
    return badges[status] || chalk_1.default.gray('● Unknown');
}
function getTaskStatusBadge(status) {
    const badges = {
        pending: chalk_1.default.gray('⏳ Pending'),
        assigned: chalk_1.default.yellow('🔄 Assigned'),
        in_progress: chalk_1.default.blue('▶️  In Progress'),
        completed: chalk_1.default.green('✅ Completed'),
        failed: chalk_1.default.red('❌ Failed')
    };
    return badges[status] || chalk_1.default.gray('❓ Unknown');
}
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}d ${hours % 24}h`;
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size > 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
