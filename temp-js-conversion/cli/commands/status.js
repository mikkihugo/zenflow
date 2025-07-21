"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = void 0;
/**
 * Status command for Claude-Flow
 */
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const cli_table3_1 = require("cli-table3");
const formatter_js_1 = require("../formatter.js");
exports.statusCommand = new commander_1.Command()
    .name('status')
    .description('Show Claude-Flow system status')
    .option('-w, --watch', 'Watch mode - continuously update status')
    .option('-i, --interval <seconds>', 'Update interval in seconds', '5')
    .option('-c, --component <name>', 'Show status for specific component')
    .option('--json', 'Output in JSON format')
    .action(async (options) => {
    if (options.watch) {
        await watchStatus(options);
    }
    else {
        await showStatus(options);
    }
});
async function showStatus(options) {
    try {
        // In a real implementation, this would connect to the running orchestrator
        const status = await getSystemStatus();
        if (options.json) {
            console.log(JSON.stringify(status, null, 2));
            return;
        }
        if (options.component) {
            showComponentStatus(status, options.component);
        }
        else {
            showFullStatus(status);
        }
    }
    catch (error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connection refused')) {
            console.error(chalk_1.default.red('✗ Claude-Flow is not running'));
            console.log(chalk_1.default.gray('Start it with: claude-flow start'));
        }
        else {
            console.error(chalk_1.default.red('Error getting status:'), error.message);
        }
    }
}
async function watchStatus(options) {
    const interval = parseInt(options.interval) * 1000;
    console.log(chalk_1.default.cyan('Watching Claude-Flow status...'));
    console.log(chalk_1.default.gray(`Update interval: ${options.interval}s`));
    console.log(chalk_1.default.gray('Press Ctrl+C to stop\n'));
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // Clear screen and show status
        console.clear();
        console.log(chalk_1.default.cyan.bold('Claude-Flow Status Monitor'));
        console.log(chalk_1.default.gray(`Last updated: ${new Date().toLocaleTimeString()}\n`));
        try {
            await showStatus({ ...options, json: false });
        }
        catch (error) {
            console.error(chalk_1.default.red('Status update failed:'), error.message);
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
}
function showFullStatus(status) {
    // System overview
    console.log(chalk_1.default.cyan.bold('System Overview'));
    console.log('─'.repeat(50));
    const statusIcon = (0, formatter_js_1.formatStatusIndicator)(status.overall);
    console.log(`${statusIcon} Overall Status: ${getStatusColor(status.overall)(status.overall.toUpperCase())}`);
    console.log(`${chalk_1.default.white('Uptime:')} ${(0, formatter_js_1.formatDuration)(status.uptime)}`);
    console.log(`${chalk_1.default.white('Version:')} ${status.version}`);
    console.log(`${chalk_1.default.white('Started:')} ${new Date(status.startTime).toLocaleString()}`);
    console.log();
    // Components status
    console.log(chalk_1.default.cyan.bold('Components'));
    console.log('─'.repeat(50));
    const componentRows = [];
    for (const [name, component] of Object.entries(status.components)) {
        const comp = component;
        const statusIcon = (0, formatter_js_1.formatStatusIndicator)(comp.status);
        const statusText = getStatusColor(comp.status)(comp.status.toUpperCase());
        componentRows.push([
            chalk_1.default.white(name),
            `${statusIcon} ${statusText}`,
            (0, formatter_js_1.formatDuration)(comp.uptime || 0),
            comp.details || '-'
        ]);
    }
    const componentTable = new cli_table3_1.default({
        head: ['Component', 'Status', 'Uptime', 'Details']
    });
    componentTable.push(...componentRows);
    console.log(componentTable.toString());
    console.log();
    // Resource usage
    if (status.resources) {
        console.log(chalk_1.default.cyan.bold('Resource Usage'));
        console.log('─'.repeat(50));
        const resourceRows = [];
        for (const [name, resource] of Object.entries(status.resources)) {
            const res = resource;
            const percentage = ((res.used / res.total) * 100).toFixed(1);
            const color = getResourceColor(parseFloat(percentage));
            resourceRows.push([
                chalk_1.default.white(name),
                res.used.toString(),
                res.total.toString(),
                color(`${percentage}%`)
            ]);
        }
        const resourceTable = new cli_table3_1.default({
            head: ['Resource', 'Used', 'Total', 'Percentage']
        });
        resourceTable.push(...resourceRows);
        console.log(resourceTable.toString());
        console.log();
    }
    // Active agents
    if (status.agents) {
        console.log(chalk_1.default.cyan.bold(`Active Agents (${status.agents.length})`));
        console.log('─'.repeat(50));
        if (status.agents.length > 0) {
            const agentRows = [];
            for (const agent of status.agents) {
                const statusIcon = (0, formatter_js_1.formatStatusIndicator)(agent.status);
                const statusText = getStatusColor(agent.status)(agent.status);
                agentRows.push([
                    chalk_1.default.gray(agent.id.slice(0, 8)),
                    chalk_1.default.white(agent.name),
                    agent.type,
                    `${statusIcon} ${statusText}`,
                    agent.activeTasks.toString()
                ]);
            }
            const agentTable = new cli_table3_1.default({
                head: ['ID', 'Name', 'Type', 'Status', 'Tasks']
            });
            agentTable.push(...agentRows);
            console.log(agentTable.toString());
        }
        else {
            console.log(chalk_1.default.gray('No active agents'));
        }
        console.log();
    }
    // Recent tasks
    if (status.recentTasks) {
        console.log(chalk_1.default.cyan.bold('Recent Tasks'));
        console.log('─'.repeat(50));
        if (status.recentTasks.length > 0) {
            const taskRows = [];
            for (const task of status.recentTasks.slice(0, 10)) {
                const statusIcon = (0, formatter_js_1.formatStatusIndicator)(task.status);
                const statusText = getStatusColor(task.status)(task.status);
                taskRows.push([
                    chalk_1.default.gray(task.id.slice(0, 8)),
                    task.type,
                    `${statusIcon} ${statusText}`,
                    (0, formatter_js_1.formatDuration)(Date.now() - new Date(task.startTime).getTime()),
                    task.assignedTo ? chalk_1.default.gray(task.assignedTo.slice(0, 8)) : '-'
                ]);
            }
            const taskTable = new cli_table3_1.default({
                head: ['ID', 'Type', 'Status', 'Duration', 'Agent']
            });
            taskTable.push(...taskRows);
            console.log(taskTable.toString());
        }
        else {
            console.log(chalk_1.default.gray('No recent tasks'));
        }
    }
}
function showComponentStatus(status, componentName) {
    const component = status.components[componentName];
    if (!component) {
        console.error(chalk_1.default.red(`Component '${componentName}' not found`));
        console.log(chalk_1.default.gray(`Available components: ${Object.keys(status.components).join(', ')}`));
        return;
    }
    console.log(chalk_1.default.cyan.bold(`Component: ${componentName}`));
    console.log('─'.repeat(50));
    const statusIcon = (0, formatter_js_1.formatStatusIndicator)(component.status);
    console.log(`${statusIcon} Status: ${getStatusColor(component.status)(component.status.toUpperCase())}`);
    console.log(`${chalk_1.default.white('Uptime:')} ${(0, formatter_js_1.formatDuration)(component.uptime || 0)}`);
    if (component.details) {
        console.log(`${chalk_1.default.white('Details:')} ${component.details}`);
    }
    if (component.metrics) {
        console.log();
        console.log(chalk_1.default.cyan('Metrics:'));
        const metricRows = [];
        for (const [name, value] of Object.entries(component.metrics)) {
            metricRows.push([
                chalk_1.default.white(name),
                value.toString()
            ]);
        }
        const metricsTable = new cli_table3_1.default({
            head: ['Metric', 'Value']
        });
        metricsTable.push(...metricRows);
        console.log(metricsTable.toString());
    }
    if (component.errors && component.errors.length > 0) {
        console.log();
        console.log(chalk_1.default.red('Recent Errors:'));
        const errorRows = [];
        for (const error of component.errors.slice(0, 5)) {
            errorRows.push([
                new Date(error.timestamp).toLocaleTimeString(),
                error.message
            ]);
        }
        const errorTable = new cli_table3_1.default({
            head: ['Time', 'Error']
        });
        errorTable.push(...errorRows);
        console.log(errorTable.toString());
    }
}
async function getSystemStatus() {
    // In a real implementation, this would connect to the orchestrator
    // For now, return mock data
    return {
        overall: 'healthy',
        version: '1.0.0',
        uptime: 3600000,
        startTime: Date.now() - 3600000,
        components: {
            orchestrator: {
                status: 'healthy',
                uptime: 3600000,
                details: 'Running smoothly'
            },
            agents: {
                status: 'healthy',
                uptime: 3600000,
                details: '5 active agents'
            },
            memory: {
                status: 'healthy',
                uptime: 3600000,
                details: 'Using 128MB of 512MB'
            }
        },
        resources: {
            memory: {
                used: 128,
                total: 512
            },
            cpu: {
                used: 25,
                total: 100
            }
        },
        agents: [
            {
                id: 'agent-001',
                name: 'Research Agent',
                type: 'research',
                status: 'active',
                activeTasks: 2
            },
            {
                id: 'agent-002',
                name: 'Code Agent',
                type: 'coding',
                status: 'idle',
                activeTasks: 0
            }
        ],
        recentTasks: [
            {
                id: 'task-001',
                type: 'research',
                status: 'completed',
                startTime: Date.now() - 300000,
                assignedTo: 'agent-001'
            }
        ]
    };
}
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'healthy':
        case 'active':
        case 'completed':
            return chalk_1.default.green;
        case 'warning':
        case 'idle':
        case 'pending':
            return chalk_1.default.yellow;
        case 'error':
        case 'failed':
            return chalk_1.default.red;
        default:
            return chalk_1.default.gray;
    }
}
function getResourceColor(percentage) {
    if (percentage < 50)
        return chalk_1.default.green;
    if (percentage < 80)
        return chalk_1.default.yellow;
    return chalk_1.default.red;
}
