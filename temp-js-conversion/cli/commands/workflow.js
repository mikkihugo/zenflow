"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowCommand = void 0;
const error_handler_js_1 = require("../../utils/error-handler.js");
/**
 * Workflow execution commands for Claude-Flow
 */
const commander_1 = require("commander");
const node_fs_1 = require("node:fs");
const chalk_1 = require("chalk");
const inquirer_1 = require("inquirer");
const Table = require("cli-table3");
const helpers_js_1 = require("../../utils/helpers.js");
const formatter_js_1 = require("../formatter.js");
exports.workflowCommand = new commander_1.Command()
    .name('workflow')
    .description('Execute and manage workflows')
    .action(() => {
    exports.workflowCommand.outputHelp();
})
    .command('run')
    .description('Execute a workflow from file')
    .argument('<workflow-file>', 'Workflow file path')
    .option('-d, --dry-run', 'Validate workflow without executing')
    .option('-v, --variables <vars>', 'Override variables (JSON format)')
    .option('-w, --watch', 'Watch workflow execution progress')
    .option('--parallel', 'Allow parallel execution where possible')
    .option('--fail-fast', 'Stop on first task failure')
    .action(async (workflowFile, options) => {
    await runWorkflow(workflowFile, options);
})
    .command('validate')
    .description('Validate a workflow file')
    .argument('<workflow-file>', 'Workflow file path')
    .option('--strict', 'Use strict validation mode')
    .action(async (workflowFile, options) => {
    await validateWorkflow(workflowFile, options);
})
    .command('list')
    .description('List running workflows')
    .option('--all', 'Include completed workflows')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .action(async (options) => {
    await listWorkflows(options);
})
    .command('status')
    .description('Show workflow execution status')
    .argument('<workflow-id>', 'Workflow ID')
    .option('-w, --watch', 'Watch workflow progress')
    .action(async (workflowId, options) => {
    await showWorkflowStatus(workflowId, options);
})
    .command('stop')
    .description('Stop a running workflow')
    .argument('<workflow-id>', 'Workflow ID')
    .option('-f, --force', 'Force stop without cleanup')
    .action(async (workflowId, options) => {
    await stopWorkflow(workflowId, options);
})
    .command('template')
    .description('Generate workflow templates')
    .argument('<template-type>', 'Template type')
    .option('-o, --output <file>', 'Output file path')
    .option('--format <format>', 'Template format (json, yaml)', 'json')
    .action(async (templateType, options) => {
    await generateTemplate(templateType, options);
});
async function runWorkflow(workflowFile, options) {
    try {
        // Load and validate workflow
        const workflow = await loadWorkflow(workflowFile);
        if (options.dryRun) {
            await validateWorkflowDefinition(workflow, true);
            console.log(chalk_1.default.green('✓ Workflow validation passed'));
            return;
        }
        // Override variables if provided
        if (options.variables) {
            try {
                const vars = JSON.parse(options.variables);
                workflow.variables = { ...workflow.variables, ...vars };
            }
            catch (error) {
                throw new Error(`Invalid variables JSON: ${error.message}`);
            }
        }
        // Create execution plan
        const execution = await createExecution(workflow);
        console.log(chalk_1.default.cyan.bold('Starting workflow execution'));
        console.log(`${chalk_1.default.white('Workflow:')} ${workflow.name}`);
        console.log(`${chalk_1.default.white('ID:')} ${execution.id}`);
        console.log(`${chalk_1.default.white('Tasks:')} ${execution.tasks.length}`);
        console.log();
        // Execute workflow
        if (options.watch) {
            await executeWorkflowWithWatch(execution, workflow, options);
        }
        else {
            await executeWorkflow(execution, workflow, options);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Workflow execution failed:'), error.message);
        process.exit(1);
    }
}
async function validateWorkflow(workflowFile, options) {
    try {
        const workflow = await loadWorkflow(workflowFile);
        await validateWorkflowDefinition(workflow, options.strict);
        console.log(chalk_1.default.green('✓ Workflow validation passed'));
        console.log(`${chalk_1.default.white('Name:')} ${workflow.name}`);
        console.log(`${chalk_1.default.white('Tasks:')} ${workflow.tasks.length}`);
        console.log(`${chalk_1.default.white('Agents:')} ${workflow.agents?.length || 0}`);
        if (workflow.dependencies) {
            const depCount = Object.values(workflow.dependencies).flat().length;
            console.log(`${chalk_1.default.white('Dependencies:')} ${depCount}`);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('✗ Workflow validation failed:'), error.message);
        process.exit(1);
    }
}
async function listWorkflows(options) {
    try {
        // Mock workflow list - in production, this would query the orchestrator
        const workflows = await getRunningWorkflows(options.all);
        if (options.format === 'json') {
            console.log(JSON.stringify(workflows, null, 2));
            return;
        }
        if (workflows.length === 0) {
            console.log(chalk_1.default.gray('No workflows found'));
            return;
        }
        console.log(chalk_1.default.cyan.bold(`Workflows (${workflows.length})`));
        console.log('─'.repeat(60));
        const table = new Table.default({
            head: ['ID', 'Name', 'Status', 'Progress', 'Started', 'Duration']
        });
        for (const workflow of workflows) {
            const statusIcon = (0, formatter_js_1.formatStatusIndicator)(workflow.status);
            const progress = `${workflow.progress.completed}/${workflow.progress.total}`;
            const progressBar = (0, formatter_js_1.formatProgressBar)(workflow.progress.completed, workflow.progress.total, 10);
            const duration = workflow.completedAt
                ? (0, formatter_js_1.formatDuration)(workflow.completedAt.getTime() - workflow.startedAt.getTime())
                : (0, formatter_js_1.formatDuration)(Date.now() - workflow.startedAt.getTime());
            table.push([
                chalk_1.default.gray(workflow.id.substring(0, 8) + '...'),
                chalk_1.default.white(workflow.workflowName),
                `${statusIcon} ${workflow.status}`,
                `${progressBar} ${progress}`,
                workflow.startedAt.toLocaleTimeString(),
                duration
            ]);
        }
        console.log(table.toString());
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to list workflows:'), error.message);
    }
}
async function showWorkflowStatus(workflowId, options) {
    try {
        if (options.watch) {
            await watchWorkflowStatus(workflowId);
        }
        else {
            const execution = await getWorkflowExecution(workflowId);
            displayWorkflowStatus(execution);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to get workflow status:'), error.message);
    }
}
async function stopWorkflow(workflowId, options) {
    try {
        const execution = await getWorkflowExecution(workflowId);
        if (execution.status !== 'running') {
            console.log(chalk_1.default.yellow(`Workflow is not running (status: ${execution.status})`));
            return;
        }
        if (!options.force) {
            const { confirmed } = await inquirer_1.default.prompt([{
                    type: 'confirm',
                    name: 'confirmed',
                    message: `Stop workflow "${execution.workflowName}"?`,
                    default: false,
                }]);
            if (!confirmed) {
                console.log(chalk_1.default.gray('Stop cancelled'));
                return;
            }
        }
        console.log(chalk_1.default.yellow('Stopping workflow...'));
        // Mock stopping - in production, this would call the orchestrator
        if (options.force) {
            console.log(chalk_1.default.red('• Force stopping all tasks'));
        }
        else {
            console.log(chalk_1.default.blue('• Gracefully stopping tasks'));
            console.log(chalk_1.default.blue('• Cleaning up resources'));
        }
        console.log(chalk_1.default.green('✓ Workflow stopped'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to stop workflow:'), error.message);
    }
}
async function generateTemplate(templateType, options) {
    const templates = {
        'research': {
            name: 'Research Workflow',
            description: 'Multi-stage research and analysis workflow',
            variables: {
                'topic': 'quantum computing',
                'depth': 'comprehensive'
            },
            agents: [
                { id: 'researcher', type: 'researcher', name: 'Research Agent' },
                { id: 'analyst', type: 'analyst', name: 'Analysis Agent' }
            ],
            tasks: [
                {
                    id: 'research-task',
                    type: 'research',
                    description: 'Research the given topic',
                    assignTo: 'researcher',
                    input: { topic: '${topic}', depth: '${depth}' }
                },
                {
                    id: 'analyze-task',
                    type: 'analysis',
                    description: 'Analyze research findings',
                    assignTo: 'analyst',
                    depends: ['research-task'],
                    input: { data: '${research-task.output}' }
                }
            ],
            settings: {
                maxConcurrency: 2,
                timeout: 300000,
                failurePolicy: 'fail-fast'
            }
        },
        'implementation': {
            name: 'Implementation Workflow',
            description: 'Code implementation and testing workflow',
            agents: [
                { id: 'implementer', type: 'implementer', name: 'Implementation Agent' },
                { id: 'tester', type: 'implementer', name: 'Testing Agent' }
            ],
            tasks: [
                {
                    id: 'implement',
                    type: 'implementation',
                    description: 'Implement the solution',
                    assignTo: 'implementer'
                },
                {
                    id: 'test',
                    type: 'testing',
                    description: 'Test the implementation',
                    assignTo: 'tester',
                    depends: ['implement']
                }
            ]
        },
        'coordination': {
            name: 'Multi-Agent Coordination',
            description: 'Complex multi-agent coordination workflow',
            agents: [
                { id: 'coordinator', type: 'coordinator', name: 'Coordinator Agent' },
                { id: 'worker1', type: 'implementer', name: 'Worker Agent 1' },
                { id: 'worker2', type: 'implementer', name: 'Worker Agent 2' }
            ],
            tasks: [
                {
                    id: 'plan',
                    type: 'planning',
                    description: 'Create execution plan',
                    assignTo: 'coordinator'
                },
                {
                    id: 'work1',
                    type: 'implementation',
                    description: 'Execute part 1',
                    assignTo: 'worker1',
                    depends: ['plan']
                },
                {
                    id: 'work2',
                    type: 'implementation',
                    description: 'Execute part 2',
                    assignTo: 'worker2',
                    depends: ['plan']
                },
                {
                    id: 'integrate',
                    type: 'integration',
                    description: 'Integrate results',
                    assignTo: 'coordinator',
                    depends: ['work1', 'work2']
                }
            ],
            settings: {
                maxConcurrency: 3,
                failurePolicy: 'continue'
            }
        }
    };
    const template = templates[templateType];
    if (!template) {
        console.error(chalk_1.default.red(`Unknown template type: ${templateType}`));
        console.log(chalk_1.default.gray('Available templates:'), Object.keys(templates).join(', '));
        return;
    }
    const outputFile = options.output || `${templateType}-workflow.${options.format}`;
    let content;
    if (options.format === 'yaml') {
        // In production, use a proper YAML library
        console.log(chalk_1.default.yellow('YAML format not implemented, using JSON'));
        content = JSON.stringify(template, null, 2);
    }
    else {
        content = JSON.stringify(template, null, 2);
    }
    await node_fs_1.promises.writeFile(outputFile, content);
    console.log(chalk_1.default.green('✓ Workflow template generated'));
    console.log(`${chalk_1.default.white('Template:')} ${templateType}`);
    console.log(`${chalk_1.default.white('File:')} ${outputFile}`);
    console.log(`${chalk_1.default.white('Tasks:')} ${template.tasks.length}`);
    console.log(`${chalk_1.default.white('Agents:')} ${template.agents?.length || 0}`);
}
async function loadWorkflow(workflowFile) {
    try {
        const content = await node_fs_1.promises.readFile(workflowFile, 'utf-8');
        if (workflowFile.endsWith('.yaml') || workflowFile.endsWith('.yml')) {
            // In production, use a proper YAML parser
            throw new Error('YAML workflows not yet supported');
        }
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to load workflow file: ${(0, error_handler_js_1.getErrorMessage)(error)}`);
    }
}
async function validateWorkflowDefinition(workflow, strict = false) {
    const errors = [];
    // Basic validation
    if (!workflow.name)
        errors.push('Workflow name is required');
    if (!workflow.tasks || workflow.tasks.length === 0)
        errors.push('At least one task is required');
    // Task validation
    const taskIds = new Set();
    for (const task of workflow.tasks || []) {
        if (!task.id)
            errors.push('Task ID is required');
        if (taskIds.has(task.id))
            errors.push(`Duplicate task ID: ${task.id}`);
        taskIds.add(task.id);
        if (!task.type)
            errors.push(`Task ${task.id}: type is required`);
        if (!task.description)
            errors.push(`Task ${task.id}: description is required`);
        // Validate dependencies
        if (task.depends) {
            for (const dep of task.depends) {
                if (!taskIds.has(dep)) {
                    // Check if dependency exists in previous tasks
                    const taskIndex = workflow.tasks.indexOf(task);
                    const depExists = workflow.tasks.slice(0, taskIndex).some(t => t.id === dep);
                    if (!depExists) {
                        errors.push(`Task ${task.id}: unknown dependency ${dep}`);
                    }
                }
            }
        }
    }
    // Agent validation
    if (workflow.agents) {
        const agentIds = new Set();
        for (const agent of workflow.agents) {
            if (!agent.id)
                errors.push('Agent ID is required');
            if (agentIds.has(agent.id))
                errors.push(`Duplicate agent ID: ${agent.id}`);
            agentIds.add(agent.id);
            if (!agent.type)
                errors.push(`Agent ${agent.id}: type is required`);
        }
        // Validate task assignments
        for (const task of workflow.tasks) {
            if (task.assignTo && !agentIds.has(task.assignTo)) {
                errors.push(`Task ${task.id}: assigned to unknown agent ${task.assignTo}`);
            }
        }
    }
    // Strict validation
    if (strict) {
        // Check for circular dependencies
        const graph = new Map();
        for (const task of workflow.tasks) {
            graph.set(task.id, task.depends || []);
        }
        if (hasCircularDependencies(graph)) {
            errors.push('Circular dependencies detected');
        }
    }
    if (errors.length > 0) {
        throw new Error('Workflow validation failed:\n• ' + errors.join('\n• '));
    }
}
async function createExecution(workflow) {
    const tasks = workflow.tasks.map(task => ({
        id: (0, helpers_js_1.generateId)('task-exec'),
        taskId: task.id,
        status: 'pending'
    }));
    return {
        id: (0, helpers_js_1.generateId)('workflow-exec'),
        workflowName: workflow.name,
        status: 'pending',
        startedAt: new Date(),
        progress: {
            total: tasks.length,
            completed: 0,
            failed: 0
        },
        tasks
    };
}
async function executeWorkflow(execution, workflow, options) {
    execution.status = 'running';
    console.log(chalk_1.default.blue('Executing workflow...'));
    console.log();
    // Mock execution - in production, this would use the orchestrator
    for (let i = 0; i < execution.tasks.length; i++) {
        const taskExec = execution.tasks[i];
        const taskDef = workflow.tasks.find(t => t.id === taskExec.taskId);
        console.log(`${chalk_1.default.cyan('→')} Starting task: ${taskDef.description}`);
        taskExec.status = 'running';
        taskExec.startedAt = new Date();
        // Simulate task execution
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        // Random success/failure for demo
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
            taskExec.status = 'completed';
            taskExec.completedAt = new Date();
            execution.progress.completed++;
            console.log(`${chalk_1.default.green('✓')} Completed: ${taskDef.description}`);
        }
        else {
            taskExec.status = 'failed';
            taskExec.completedAt = new Date();
            taskExec.error = 'Simulated task failure';
            execution.progress.failed++;
            console.log(`${chalk_1.default.red('✗')} Failed: ${taskDef.description}`);
            if (options.failFast || workflow.settings?.failurePolicy === 'fail-fast') {
                execution.status = 'failed';
                console.log(chalk_1.default.red('\nWorkflow failed (fail-fast mode)'));
                return;
            }
        }
        console.log();
    }
    execution.status = execution.progress.failed > 0 ? 'failed' : 'completed';
    execution.completedAt = new Date();
    const duration = (0, formatter_js_1.formatDuration)(execution.completedAt.getTime() - execution.startedAt.getTime());
    if (execution.status === 'completed') {
        console.log(chalk_1.default.green.bold('✓ Workflow completed successfully'));
    }
    else {
        console.log(chalk_1.default.red.bold('✗ Workflow completed with failures'));
    }
    console.log(`${chalk_1.default.white('Duration:')} ${duration}`);
    console.log(`${chalk_1.default.white('Tasks:')} ${execution.progress.completed}/${execution.progress.total} completed`);
    if (execution.progress.failed > 0) {
        console.log(`${chalk_1.default.white('Failed:')} ${execution.progress.failed}`);
    }
}
async function executeWorkflowWithWatch(execution, workflow, options) {
    console.log(chalk_1.default.yellow('Starting workflow execution in watch mode...'));
    console.log(chalk_1.default.gray('Press Ctrl+C to stop\n'));
    // Start execution in background and watch progress
    const executionPromise = executeWorkflow(execution, workflow, options);
    // Watch loop
    const watchInterval = setInterval(() => {
        displayWorkflowProgress(execution);
    }, 1000);
    try {
        await executionPromise;
    }
    finally {
        clearInterval(watchInterval);
        displayWorkflowProgress(execution);
    }
}
async function watchWorkflowStatus(workflowId) {
    console.log(chalk_1.default.cyan('Watching workflow status...'));
    console.log(chalk_1.default.gray('Press Ctrl+C to stop\n'));
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            console.clear();
            const execution = await getWorkflowExecution(workflowId);
            displayWorkflowStatus(execution);
            if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'stopped') {
                console.log('\n' + chalk_1.default.gray('Workflow finished. Exiting watch mode.'));
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        catch (error) {
            console.error(chalk_1.default.red('Error watching workflow:'), error.message);
            break;
        }
    }
}
function displayWorkflowStatus(execution) {
    console.log(chalk_1.default.cyan.bold('Workflow Status'));
    console.log('─'.repeat(50));
    const statusIcon = (0, formatter_js_1.formatStatusIndicator)(execution.status);
    const duration = execution.completedAt
        ? (0, formatter_js_1.formatDuration)(execution.completedAt.getTime() - execution.startedAt.getTime())
        : (0, formatter_js_1.formatDuration)(Date.now() - execution.startedAt.getTime());
    console.log(`${chalk_1.default.white('Name:')} ${execution.workflowName}`);
    console.log(`${chalk_1.default.white('ID:')} ${execution.id}`);
    console.log(`${chalk_1.default.white('Status:')} ${statusIcon} ${execution.status}`);
    console.log(`${chalk_1.default.white('Started:')} ${execution.startedAt.toLocaleString()}`);
    console.log(`${chalk_1.default.white('Duration:')} ${duration}`);
    const progressBar = (0, formatter_js_1.formatProgressBar)(execution.progress.completed, execution.progress.total, 40, 'Progress');
    console.log(`${progressBar} ${execution.progress.completed}/${execution.progress.total}`);
    if (execution.progress.failed > 0) {
        console.log(`${chalk_1.default.white('Failed Tasks:')} ${chalk_1.default.red(execution.progress.failed.toString())}`);
    }
    console.log();
    // Task details
    console.log(chalk_1.default.cyan.bold('Tasks'));
    console.log('─'.repeat(50));
    const table = new Table.default({
        head: ['Task', 'Status', 'Duration', 'Agent']
    });
    for (const taskExec of execution.tasks) {
        const statusIcon = (0, formatter_js_1.formatStatusIndicator)(taskExec.status);
        const duration = taskExec.completedAt && taskExec.startedAt
            ? (0, formatter_js_1.formatDuration)(taskExec.completedAt.getTime() - taskExec.startedAt.getTime())
            : taskExec.startedAt
                ? (0, formatter_js_1.formatDuration)(Date.now() - taskExec.startedAt.getTime())
                : '-';
        table.push([
            chalk_1.default.white(taskExec.taskId),
            `${statusIcon} ${taskExec.status}`,
            duration,
            taskExec.assignedAgent || '-'
        ]);
    }
    console.log(table.toString());
}
function displayWorkflowProgress(execution) {
    const progress = `${execution.progress.completed}/${execution.progress.total}`;
    const progressBar = (0, formatter_js_1.formatProgressBar)(execution.progress.completed, execution.progress.total, 30);
    console.log(`\r${progressBar} ${progress} tasks completed`);
}
async function getRunningWorkflows(includeAll = false) {
    // Mock workflow list - in production, this would query the orchestrator
    return [
        {
            id: 'workflow-001',
            workflowName: 'Research Workflow',
            status: 'running',
            startedAt: new Date(Date.now() - 120000), // 2 minutes ago
            progress: { total: 5, completed: 3, failed: 0 },
            tasks: []
        },
        {
            id: 'workflow-002',
            workflowName: 'Implementation Workflow',
            status: 'completed',
            startedAt: new Date(Date.now() - 300000), // 5 minutes ago
            completedAt: new Date(Date.now() - 60000), // 1 minute ago
            progress: { total: 3, completed: 3, failed: 0 },
            tasks: []
        }
    ].filter(w => includeAll || w.status === 'running');
}
async function getWorkflowExecution(workflowId) {
    const workflows = await getRunningWorkflows(true);
    const workflow = workflows.find(w => w.id === workflowId || w.id.startsWith(workflowId));
    if (!workflow) {
        throw new Error(`Workflow '${workflowId}' not found`);
    }
    return workflow;
}
function hasCircularDependencies(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    function hasCycle(node) {
        if (recursionStack.has(node))
            return true;
        if (visited.has(node))
            return false;
        visited.add(node);
        recursionStack.add(node);
        const dependencies = graph.get(node) || [];
        for (const dep of dependencies) {
            if (hasCycle(dep))
                return true;
        }
        recursionStack.delete(node);
        return false;
    }
    for (const node of graph.keys()) {
        if (hasCycle(node))
            return true;
    }
    return false;
}
