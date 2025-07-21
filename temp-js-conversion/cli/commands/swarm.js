"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swarmAction = swarmAction;
/**
 * Claude Swarm Mode - Self-orchestrating agent swarms using claude-flow
 */
const helpers_js_1 = require("../../utils/helpers.js");
const node_fs_1 = require("node:fs");
const cli_core_js_1 = require("../cli-core.js");
const background_executor_js_1 = require("../../coordination/background-executor.js");
const swarm_coordinator_js_1 = require("../../coordination/swarm-coordinator.js");
const swarm_memory_js_1 = require("../../memory/swarm-memory.js");
async function swarmAction(ctx) {
    // First check if help is requested
    if (ctx.flags.help || ctx.flags.h) {
        // Show help is handled by the CLI framework
        return;
    }
    // The objective should be all the non-flag arguments joined together
    const objective = ctx.args.join(' ').trim();
    if (!objective) {
        (0, cli_core_js_1.error)("Usage: swarm <objective>");
        console.log("\nExamples:");
        console.log('  claude-flow swarm "Build a REST API"');
        console.log('  claude-flow swarm "Research cloud architecture"');
        console.log("\nOptions:");
        console.log('  --dry-run              Show configuration without executing');
        console.log('  --strategy <type>      Strategy: auto, research, development, analysis');
        console.log('  --max-agents <n>       Maximum number of agents (default: 5)');
        console.log('  --timeout <minutes>    Timeout in minutes (default: 60)');
        console.log('  --research             Enable research capabilities');
        console.log('  --parallel             Enable parallel execution');
        console.log('  --review               Enable peer review between agents');
        console.log('  --monitor              Enable real-time monitoring');
        console.log('  --ui                   Use blessed terminal UI (requires node.js)');
        console.log('  --background           Run swarm in background mode');
        console.log('  --distributed          Enable distributed coordination');
        console.log('  --memory-namespace     Memory namespace for swarm (default: swarm)');
        console.log('  --persistence          Enable task persistence (default: true)');
        return;
    }
    const options = {
        strategy: ctx.flags.strategy || 'auto',
        maxAgents: ctx.flags.maxAgents || ctx.flags['max-agents'] || 5,
        maxDepth: ctx.flags.maxDepth || ctx.flags['max-depth'] || 3,
        research: ctx.flags.research || false,
        parallel: ctx.flags.parallel || false,
        memoryNamespace: ctx.flags.memoryNamespace || ctx.flags['memory-namespace'] || 'swarm',
        timeout: ctx.flags.timeout || 60,
        review: ctx.flags.review || false,
        coordinator: ctx.flags.coordinator || false,
        config: ctx.flags.config || ctx.flags.c,
        verbose: ctx.flags.verbose || ctx.flags.v || false,
        dryRun: ctx.flags.dryRun || ctx.flags['dry-run'] || ctx.flags.d || false,
        monitor: ctx.flags.monitor || false,
        ui: ctx.flags.ui || false,
        background: ctx.flags.background || false,
        persistence: ctx.flags.persistence || true,
        distributed: ctx.flags.distributed || false,
    };
    const swarmId = (0, helpers_js_1.generateId)('swarm');
    if (options.dryRun) {
        (0, cli_core_js_1.warning)('DRY RUN - Swarm Configuration:');
        console.log(`Swarm ID: ${swarmId}`);
        console.log(`Objective: ${objective}`);
        console.log(`Strategy: ${options.strategy}`);
        console.log(`Max Agents: ${options.maxAgents}`);
        console.log(`Max Depth: ${options.maxDepth}`);
        console.log(`Research: ${options.research}`);
        console.log(`Parallel: ${options.parallel}`);
        console.log(`Review Mode: ${options.review}`);
        console.log(`Coordinator: ${options.coordinator}`);
        console.log(`Memory Namespace: ${options.memoryNamespace}`);
        console.log(`Timeout: ${options.timeout} minutes`);
        return;
    }
    // If UI mode is requested, use the blessed UI version
    if (options.ui) {
        try {
            const scriptPath = new URL(import.meta.url).pathname;
            const projectRoot = scriptPath.substring(0, scriptPath.indexOf('/src/'));
            const uiScriptPath = `${projectRoot}/src/cli/simple-commands/swarm-ui.js`;
            // Check if the UI script exists
            try {
                await node_fs_1.promises.stat(uiScriptPath);
            }
            catch {
                (0, cli_core_js_1.warning)('Swarm UI script not found. Falling back to standard mode.');
                options.ui = false;
            }
            if (options.ui) {
                const command = new Deno.Command('node', {
                    args: [uiScriptPath],
                    stdin: 'inherit',
                    stdout: 'inherit',
                    stderr: 'inherit',
                });
                const process = command.spawn();
                const { code } = await process.status;
                if (code !== 0) {
                    (0, cli_core_js_1.error)(`Swarm UI exited with code ${code}`);
                }
                return;
            }
        }
        catch (err) {
            (0, cli_core_js_1.warning)(`Failed to launch blessed UI: ${err.message}`);
            console.log('Falling back to standard mode...');
            options.ui = false;
        }
    }
    (0, cli_core_js_1.success)(`🐝 Initializing Claude Swarm: ${swarmId}`);
    console.log(`📋 Objective: ${objective}`);
    console.log(`🎯 Strategy: ${options.strategy}`);
    try {
        // Initialize swarm coordination system
        const coordinator = new swarm_coordinator_js_1.SwarmCoordinator({
            maxAgents: options.maxAgents,
            maxConcurrentTasks: options.parallel ? options.maxAgents : 1,
            taskTimeout: options.timeout * 60 * 1000, // Convert minutes to milliseconds
            enableMonitoring: options.monitor,
            enableWorkStealing: options.parallel,
            enableCircuitBreaker: true,
            memoryNamespace: options.memoryNamespace,
            coordinationStrategy: options.distributed ? 'distributed' : 'centralized'
        });
        // Initialize background executor
        const executor = new background_executor_js_1.BackgroundExecutor({
            maxConcurrentTasks: options.maxAgents,
            defaultTimeout: options.timeout * 60 * 1000,
            logPath: `./swarm-runs/${swarmId}/background-tasks`,
            enablePersistence: options.persistence
        });
        // Initialize swarm memory
        const memory = new swarm_memory_js_1.SwarmMemoryManager({
            namespace: options.memoryNamespace,
            enableDistribution: options.distributed,
            enableKnowledgeBase: true,
            persistencePath: `./swarm-runs/${swarmId}/memory`
        });
        // Start all systems
        await coordinator.start();
        await executor.start();
        await memory.initialize();
        // Create swarm tracking directory
        const swarmDir = `./swarm-runs/${swarmId}`;
        await Deno.mkdir(swarmDir, { recursive: true });
        // Create objective in coordinator
        const objectiveId = await coordinator.createObjective(`Swarm Task ${Date.now()}`, objective, options.strategy || 'auto');
        console.log(`\n📝 Objective created with ID: ${objectiveId}`);
        // Register agents based on strategy
        const agentTypes = getAgentTypesForStrategy(options.strategy);
        const agents = [];
        for (let i = 0; i < Math.min(options.maxAgents, agentTypes.length); i++) {
            const agentType = agentTypes[i % agentTypes.length];
            const agentId = await coordinator.registerAgent(`${agentType}-${i + 1}`, agentType, getCapabilitiesForType(agentType));
            agents.push(agentId);
            console.log(`  🤖 Registered ${agentType} agent: ${agentId}`);
        }
        // Write swarm configuration
        await node_fs_1.promises.writeFile(`${swarmDir}/config.json`, JSON.stringify({
            swarmId,
            objectiveId,
            objective,
            options,
            agents,
            startTime: new Date().toISOString()
        }, null, 2));
        // Start objective execution
        await coordinator.executeObjective(objectiveId);
        console.log(`\n🚀 Swarm execution started...`);
        if (options.background) {
            console.log(`Running in background mode. Check status with: claude-flow swarm status ${swarmId}`);
            // Save coordinator state and exit
            await node_fs_1.promises.writeFile(`${swarmDir}/coordinator.json`, JSON.stringify({
                coordinatorRunning: true,
                pid: Deno.pid,
                startTime: new Date().toISOString()
            }, null, 2));
        }
        else {
            // Wait for completion in foreground
            await waitForObjectiveCompletion(coordinator, objectiveId, options);
            // Write completion status
            await node_fs_1.promises.writeFile(`${swarmDir}/status.json`, JSON.stringify({
                status: 'completed',
                endTime: new Date().toISOString()
            }, null, 2));
            // Show summary
            const swarmStatus = coordinator.getSwarmStatus();
            console.log(`\n📊 Swarm Summary:`);
            console.log(`  - Objectives: ${swarmStatus.objectives}`);
            console.log(`  - Tasks Completed: ${swarmStatus.tasks.completed}`);
            console.log(`  - Tasks Failed: ${swarmStatus.tasks.failed}`);
            console.log(`  - Agents Used: ${swarmStatus.agents.total}`);
            console.log(`  - Results saved to: ${swarmDir}`);
            (0, cli_core_js_1.success)(`\n✅ Swarm ${swarmId} completed successfully`);
        }
        // Cleanup
        if (!options.background) {
            await coordinator.stop();
            await executor.stop();
            await memory.shutdown();
        }
    }
    catch (err) {
        (0, cli_core_js_1.error)(`Failed to execute swarm: ${err.message}`);
    }
}
/**
 * Decompose objective into subtasks based on strategy
 */
async function decomposeObjective(objective, options) {
    const subtasks = [];
    switch (options.strategy) {
        case 'research':
            subtasks.push({ type: 'research', description: `Research background information on: ${objective}` }, { type: 'analysis', description: `Analyze findings and identify key patterns` }, { type: 'synthesis', description: `Synthesize research into actionable insights` });
            break;
        case 'development':
            subtasks.push({ type: 'planning', description: `Plan architecture and design for: ${objective}` }, { type: 'implementation', description: `Implement core functionality` }, { type: 'testing', description: `Test and validate implementation` }, { type: 'documentation', description: `Document the solution` });
            break;
        case 'analysis':
            subtasks.push({ type: 'data-gathering', description: `Gather relevant data for: ${objective}` }, { type: 'analysis', description: `Perform detailed analysis` }, { type: 'visualization', description: `Create visualizations and reports` });
            break;
        default: // auto
            // Analyze objective to determine best approach
            if (objective.toLowerCase().includes('build') || objective.toLowerCase().includes('create')) {
                subtasks.push({ type: 'planning', description: `Plan solution for: ${objective}` }, { type: 'implementation', description: `Implement the solution` }, { type: 'testing', description: `Test and validate` });
            }
            else if (objective.toLowerCase().includes('research') || objective.toLowerCase().includes('analyze')) {
                subtasks.push({ type: 'research', description: `Research: ${objective}` }, { type: 'analysis', description: `Analyze findings` }, { type: 'report', description: `Generate report` });
            }
            else {
                subtasks.push({ type: 'exploration', description: `Explore requirements for: ${objective}` }, { type: 'execution', description: `Execute main tasks` }, { type: 'validation', description: `Validate results` });
            }
    }
    return subtasks;
}
/**
 * Execute tasks in parallel
 */
async function executeParallelTasks(tasks, options, swarmId, swarmDir) {
    const promises = tasks.map(async (task, index) => {
        const agentId = (0, helpers_js_1.generateId)('agent');
        console.log(`  🤖 Spawning agent ${agentId} for: ${task.type}`);
        // Create agent directory
        const agentDir = `${swarmDir}/agents/${agentId}`;
        await Deno.mkdir(agentDir, { recursive: true });
        // Write agent task
        await node_fs_1.promises.writeFile(`${agentDir}/task.json`, JSON.stringify({
            agentId,
            swarmId,
            task,
            status: 'active',
            startTime: new Date().toISOString()
        }, null, 2));
        // Execute agent task
        await executeAgentTask(agentId, task, options, agentDir);
        // Update status
        await node_fs_1.promises.writeFile(`${agentDir}/status.json`, JSON.stringify({
            status: 'completed',
            endTime: new Date().toISOString()
        }, null, 2));
        console.log(`  ✅ Agent ${agentId} completed: ${task.type}`);
    });
    await Promise.all(promises);
}
/**
 * Execute tasks sequentially
 */
async function executeSequentialTasks(tasks, options, swarmId, swarmDir) {
    for (const [index, task] of tasks.entries()) {
        const agentId = (0, helpers_js_1.generateId)('agent');
        console.log(`  🤖 Spawning agent ${agentId} for: ${task.type}`);
        // Create agent directory
        const agentDir = `${swarmDir}/agents/${agentId}`;
        await Deno.mkdir(agentDir, { recursive: true });
        // Write agent task
        await node_fs_1.promises.writeFile(`${agentDir}/task.json`, JSON.stringify({
            agentId,
            swarmId,
            task,
            status: 'active',
            startTime: new Date().toISOString()
        }, null, 2));
        // Execute agent task
        await executeAgentTask(agentId, task, options, agentDir);
        // Update status
        await node_fs_1.promises.writeFile(`${agentDir}/status.json`, JSON.stringify({
            status: 'completed',
            endTime: new Date().toISOString()
        }, null, 2));
        console.log(`  ✅ Agent ${agentId} completed: ${task.type}`);
    }
}
/**
 * Execute a single agent task using claude
 */
async function executeAgentTask(agentId, task, options, agentDir) {
    console.log(`    → Executing: ${task.type} task`);
    try {
        // Check if claude CLI is available and not in simulation mode
        const checkClaude = new Deno.Command('which', { args: ['claude'] });
        const checkResult = await checkClaude.output();
        if (checkResult.success && options.simulate !== true) {
            // Write prompt to a file for claude to read
            const promptFile = `${agentDir}/prompt.txt`;
            const prompt = `You are an AI agent with ID: ${agentId}

Your task type is: ${task.type}
Your specific task is: ${task.description}

Please execute this task and provide a detailed response.
${task.type === 'research' ? 'Use web search and research tools as needed.' : ''}
${task.type === 'implementation' ? 'Write clean, well-documented code.' : ''}
${task.type === 'testing' ? 'Create comprehensive tests.' : ''}

Provide your output in a structured format.

When you're done, please end with "TASK COMPLETED" on its own line.`;
            await node_fs_1.promises.writeFile(promptFile, prompt);
            // Build claude command using bash to pipe the prompt
            let tools = 'View,GlobTool,GrepTool,LS';
            if (task.type === 'research' || options.research) {
                tools = 'WebFetchTool,WebSearch';
            }
            else if (task.type === 'implementation') {
                tools = 'View,Edit,Replace,GlobTool,GrepTool,LS,Bash';
            }
            // Build claude command arguments for non-interactive mode
            const claudeArgs = [
                '-p', // Non-interactive print mode
                task.description, // The prompt
                '--dangerously-skip-permissions',
                '--allowedTools', tools
            ];
            // Write command to file for tracking
            await node_fs_1.promises.writeFile(`${agentDir}/command.txt`, `claude ${claudeArgs.join(' ')}`);
            console.log(`    → Running: ${task.description}`);
            // For real-time output, we need to capture it differently
            // First run with piped to capture for file, then run with inherit for display
            // Create a wrapper script that will tee the output
            const wrapperScript = `#!/bin/bash
claude ${claudeArgs.map(arg => `"${arg}"`).join(' ')} | tee "${agentDir}/output.txt"
exit \${PIPESTATUS[0]}`;
            const wrapperPath = `${agentDir}/wrapper.sh`;
            await node_fs_1.promises.writeFile(wrapperPath, wrapperScript);
            await Deno.chmod(wrapperPath, 0o755);
            console.log(`    ┌─ Claude Output ─────────────────────────────`);
            const command = new Deno.Command('bash', {
                args: [wrapperPath],
                stdout: 'inherit', // This allows real-time streaming to console
                stderr: 'inherit',
            });
            try {
                const process = command.spawn();
                const { code, success } = await process.status;
                console.log(`    └─────────────────────────────────────────────`);
                if (!success) {
                    throw new Error(`Claude exited with code ${code}`);
                }
                console.log(`    ✓ Task completed`);
            }
            catch (err) {
                throw err;
            }
        }
        else {
            // Simulate execution if claude CLI not available
            console.log(`    → Simulating: ${task.type} (claude CLI not available)`);
            // For now, let's use the claude-flow claude spawn command instead
            const claudeFlowArgs = ['claude', 'spawn', task.description];
            if (task.type === 'research' || options.research) {
                claudeFlowArgs.push('--research');
            }
            if (options.parallel) {
                claudeFlowArgs.push('--parallel');
            }
            console.log(`    → Using: claude-flow ${claudeFlowArgs.join(' ')}`);
            // Get the path to claude-flow binary
            const claudeFlowPath = new URL(import.meta.url).pathname;
            const projectRoot = claudeFlowPath.substring(0, claudeFlowPath.indexOf('/src/'));
            const claudeFlowBin = `${projectRoot}/bin/claude-flow`;
            // Execute claude-flow command
            const command = new Deno.Command(claudeFlowBin, {
                args: claudeFlowArgs,
                stdout: 'piped',
                stderr: 'piped',
            });
            const { code, stdout, stderr } = await command.output();
            // Save output
            await node_fs_1.promises.writeFile(`${agentDir}/output.txt`, new TextDecoder().decode(stdout));
            if (stderr.length > 0) {
                await node_fs_1.promises.writeFile(`${agentDir}/error.txt`, new TextDecoder().decode(stderr));
            }
            if (code !== 0) {
                console.log(`    ⚠️  Command exited with code ${code}`);
            }
        }
    }
    catch (err) {
        // Log error but continue
        console.log(`    ⚠️  Error executing task: ${err.message}`);
        await node_fs_1.promises.writeFile(`${agentDir}/error.txt`, err.message);
    }
}
function getAgentTypesForStrategy(strategy) {
    switch (strategy) {
        case 'research':
            return ['researcher', 'analyst', 'coordinator'];
        case 'development':
            return ['coder', 'analyst', 'reviewer', 'coordinator'];
        case 'analysis':
            return ['analyst', 'researcher', 'coordinator'];
        default: // auto
            return ['coordinator', 'researcher', 'coder', 'analyst'];
    }
}
function getCapabilitiesForType(type) {
    switch (type) {
        case 'researcher':
            return ['web-search', 'data-collection', 'analysis', 'documentation'];
        case 'coder':
            return ['coding', 'testing', 'debugging', 'architecture'];
        case 'analyst':
            return ['data-analysis', 'visualization', 'reporting', 'insights'];
        case 'reviewer':
            return ['code-review', 'quality-assurance', 'validation', 'testing'];
        case 'coordinator':
            return ['planning', 'coordination', 'task-management', 'communication'];
        default:
            return ['general'];
    }
}
async function waitForObjectiveCompletion(coordinator, objectiveId, options) {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const objective = coordinator.getObjectiveStatus(objectiveId);
            if (!objective) {
                clearInterval(checkInterval);
                resolve();
                return;
            }
            if (objective.status === 'completed' || objective.status === 'failed') {
                clearInterval(checkInterval);
                resolve();
                return;
            }
            // Show progress if verbose
            if (options.verbose) {
                const swarmStatus = coordinator.getSwarmStatus();
                console.log(`Progress: ${swarmStatus.tasks.completed}/${swarmStatus.tasks.total} tasks completed`);
            }
        }, 5000); // Check every 5 seconds
        // Timeout after the specified time
        setTimeout(() => {
            clearInterval(checkInterval);
            console.log('⚠️  Swarm execution timed out');
            resolve();
        }, options.timeout * 60 * 1000);
    });
}
