#!/usr/bin/env node
"use strict";
/**
 * Hive Mind Task Command
 *
 * Submit tasks to the Hive Mind for collective processing
 * with automatic agent assignment and consensus coordination.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const ora_1 = require("ora");
const inquirer_1 = require("inquirer");
const HiveMind_js_1 = require("../../../hive-mind/core/HiveMind.js");
const formatter_js_1 = require("../../formatter.js");
const DatabaseManager_js_1 = require("../../../hive-mind/core/DatabaseManager.js");
exports.taskCommand = new commander_1.Command('task')
    .description('Submit and manage tasks in the Hive Mind')
    .argument('[description]', 'Task description')
    .option('-s, --swarm-id <id>', 'Target swarm ID')
    .option('-p, --priority <level>', 'Task priority (low, medium, high, critical)', 'medium')
    .option('-t, --strategy <type>', 'Execution strategy (parallel, sequential, adaptive, consensus)', 'adaptive')
    .option('-d, --dependencies <ids>', 'Comma-separated list of dependent task IDs')
    .option('-a, --assign-to <agent>', 'Assign to specific agent')
    .option('-r, --require-consensus', 'Require consensus for this task', false)
    .option('-m, --max-agents <number>', 'Maximum agents to assign', '3')
    .option('-i, --interactive', 'Interactive task creation', false)
    .option('-w, --watch', 'Watch task progress', false)
    .option('-l, --list', 'List all tasks', false)
    .option('--cancel <id>', 'Cancel a specific task')
    .option('--retry <id>', 'Retry a failed task')
    .action(async (description, options) => {
    try {
        // Get swarm ID
        const swarmId = options.swarmId || await getActiveSwarmId();
        if (!swarmId) {
            throw new Error('No active swarm found. Initialize a Hive Mind first.');
        }
        // Load Hive Mind
        const hiveMind = await HiveMind_js_1.HiveMind.load(swarmId);
        // Handle special operations
        if (options.list) {
            await listTasks(hiveMind);
            return;
        }
        if (options.cancel) {
            await cancelTask(hiveMind, options.cancel);
            return;
        }
        if (options.retry) {
            await retryTask(hiveMind, options.retry);
            return;
        }
        // Interactive mode
        if (options.interactive || !description) {
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'description',
                    message: 'Enter task description:',
                    when: !description,
                    validate: (input) => input.length > 0 || 'Task description is required'
                },
                {
                    type: 'list',
                    name: 'priority',
                    message: 'Select task priority:',
                    choices: ['low', 'medium', 'high', 'critical'],
                    default: options.priority
                },
                {
                    type: 'list',
                    name: 'strategy',
                    message: 'Select execution strategy:',
                    choices: [
                        { name: 'Adaptive (AI-optimized)', value: 'adaptive' },
                        { name: 'Parallel (Fast, multiple agents)', value: 'parallel' },
                        { name: 'Sequential (Step-by-step)', value: 'sequential' },
                        { name: 'Consensus (Requires agreement)', value: 'consensus' }
                    ],
                    default: options.strategy
                },
                {
                    type: 'confirm',
                    name: 'requireConsensus',
                    message: 'Require consensus for critical decisions?',
                    default: options.requireConsensus,
                    when: (answers) => answers.strategy !== 'consensus'
                },
                {
                    type: 'number',
                    name: 'maxAgents',
                    message: 'Maximum agents to assign:',
                    default: parseInt(options.maxAgents, 10),
                    validate: (input) => input > 0 && input <= 10 || 'Must be between 1 and 10'
                },
                {
                    type: 'checkbox',
                    name: 'capabilities',
                    message: 'Required agent capabilities:',
                    choices: [
                        'code_generation', 'research', 'analysis', 'testing',
                        'optimization', 'documentation', 'architecture', 'review'
                    ]
                }
            ]);
            description = description || answers.description;
            options.priority = answers.priority || options.priority;
            options.strategy = answers.strategy || options.strategy;
            options.requireConsensus = answers.requireConsensus || options.requireConsensus;
            options.maxAgents = answers.maxAgents || options.maxAgents;
            options.requiredCapabilities = answers.capabilities;
        }
        const spinner = (0, ora_1.default)('Submitting task to Hive Mind...').start();
        // Parse dependencies
        const dependencies = options.dependencies
            ? options.dependencies.split(',').map((id) => id.trim())
            : [];
        // Submit task
        const task = await hiveMind.submitTask({
            description,
            priority: options.priority,
            strategy: options.strategy,
            dependencies,
            assignTo: options.assignTo,
            requireConsensus: options.requireConsensus,
            maxAgents: parseInt(options.maxAgents, 10),
            requiredCapabilities: options.requiredCapabilities || [],
            metadata: {
                submittedBy: 'cli',
                submittedAt: new Date()
            }
        });
        spinner.succeed((0, formatter_js_1.formatSuccess)('Task submitted successfully!'));
        // Display task details
        console.log('\n' + chalk_1.default.bold('📋 Task Details:'));
        console.log((0, formatter_js_1.formatInfo)(`Task ID: ${task.id}`));
        console.log((0, formatter_js_1.formatInfo)(`Description: ${task.description}`));
        console.log((0, formatter_js_1.formatInfo)(`Priority: ${getPriorityBadge(task.priority)} ${task.priority}`));
        console.log((0, formatter_js_1.formatInfo)(`Strategy: ${task.strategy}`));
        console.log((0, formatter_js_1.formatInfo)(`Status: ${task.status}`));
        if (task.assignedAgents.length > 0) {
            console.log((0, formatter_js_1.formatInfo)(`Assigned to: ${task.assignedAgents.join(', ')}`));
        }
        // Watch mode
        if (options.watch) {
            console.log('\n' + chalk_1.default.bold('👀 Watching task progress...'));
            await watchTaskProgress(hiveMind, task.id);
        }
        else {
            console.log('\n' + chalk_1.default.gray(`Track progress: ruv-swarm hive-mind task --watch ${task.id}`));
        }
    }
    catch (error) {
        console.error((0, formatter_js_1.formatError)('Failed to submit task'));
        console.error((0, formatter_js_1.formatError)(error.message));
        process.exit(1);
    }
});
async function getActiveSwarmId() {
    const db = await DatabaseManager_js_1.DatabaseManager.getInstance();
    return db.getActiveSwarmId();
}
async function listTasks(hiveMind) {
    const tasks = await hiveMind.getTasks();
    if (tasks.length === 0) {
        console.log((0, formatter_js_1.formatInfo)('No tasks found.'));
        return;
    }
    console.log('\n' + chalk_1.default.bold('📋 Task List:'));
    const Table = require('cli-table3');
    const table = new Table({
        head: ['ID', 'Description', 'Priority', 'Status', 'Progress', 'Agents'],
        style: { head: ['cyan'] }
    });
    tasks.forEach(task => {
        table.push([
            task.id.substring(0, 8),
            task.description.substring(0, 40) + (task.description.length > 40 ? '...' : ''),
            getPriorityBadge(task.priority),
            getTaskStatusBadge(task.status),
            `${task.progress}%`,
            task.assignedAgents.length
        ]);
    });
    console.log(table.toString());
}
async function cancelTask(hiveMind, taskId) {
    const spinner = (0, ora_1.default)('Cancelling task...').start();
    try {
        await hiveMind.cancelTask(taskId);
        spinner.succeed((0, formatter_js_1.formatSuccess)('Task cancelled successfully!'));
    }
    catch (error) {
        spinner.fail((0, formatter_js_1.formatError)('Failed to cancel task'));
        throw error;
    }
}
async function retryTask(hiveMind, taskId) {
    const spinner = (0, ora_1.default)('Retrying task...').start();
    try {
        const newTask = await hiveMind.retryTask(taskId);
        spinner.succeed((0, formatter_js_1.formatSuccess)('Task retry submitted!'));
        console.log((0, formatter_js_1.formatInfo)(`New Task ID: ${newTask.id}`));
    }
    catch (error) {
        spinner.fail((0, formatter_js_1.formatError)('Failed to retry task'));
        throw error;
    }
}
async function watchTaskProgress(hiveMind, taskId) {
    let lastProgress = -1;
    let completed = false;
    const progressBar = require('cli-progress');
    const bar = new progressBar.SingleBar({
        format: 'Progress |' + chalk_1.default.cyan('{bar}') + '| {percentage}% | {status}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    bar.start(100, 0, { status: 'Initializing...' });
    const interval = setInterval(async () => {
        try {
            const task = await hiveMind.getTask(taskId);
            if (task.progress !== lastProgress) {
                lastProgress = task.progress;
                bar.update(task.progress, { status: task.status });
            }
            if (task.status === 'completed' || task.status === 'failed') {
                completed = true;
                bar.stop();
                clearInterval(interval);
                console.log('\n' + chalk_1.default.bold('📊 Task Result:'));
                console.log((0, formatter_js_1.formatInfo)(`Status: ${task.status}`));
                console.log((0, formatter_js_1.formatInfo)(`Duration: ${formatDuration(task.completedAt - task.createdAt)}`));
                if (task.result) {
                    console.log((0, formatter_js_1.formatInfo)('Result:'));
                    console.log(chalk_1.default.gray(JSON.stringify(task.result, null, 2)));
                }
                if (task.error) {
                    console.log((0, formatter_js_1.formatError)(`Error: ${task.error}`));
                }
            }
        }
        catch (error) {
            clearInterval(interval);
            bar.stop();
            console.error((0, formatter_js_1.formatError)('Error watching task: ' + error.message));
        }
    }, 1000);
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        if (!completed) {
            clearInterval(interval);
            bar.stop();
            console.log('\n' + (0, formatter_js_1.formatWarning)('Task watch cancelled. Task continues in background.'));
            process.exit(0);
        }
    });
}
function getPriorityBadge(priority) {
    const badges = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        critical: '🔴'
    };
    return badges[priority] || '⚪';
}
function getTaskStatusBadge(status) {
    const badges = {
        pending: chalk_1.default.gray('⏳'),
        assigned: chalk_1.default.yellow('🔄'),
        in_progress: chalk_1.default.blue('▶️'),
        completed: chalk_1.default.green('✅'),
        failed: chalk_1.default.red('❌')
    };
    return badges[status] || chalk_1.default.gray('❓');
}
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
