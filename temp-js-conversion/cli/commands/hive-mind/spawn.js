#!/usr/bin/env node
"use strict";
/**
 * Hive Mind Agent Spawn Command
 *
 * Spawns specialized agents into the Hive Mind swarm
 * with automatic capability assignment and coordination.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const ora_1 = require("ora");
const inquirer_1 = require("inquirer");
const HiveMind_js_1 = require("../../../hive-mind/core/HiveMind.js");
const formatter_js_1 = require("../../formatter.js");
const AGENT_TYPES = [
    'coordinator', 'researcher', 'coder', 'analyst', 'architect',
    'tester', 'reviewer', 'optimizer', 'documenter', 'monitor', 'specialist'
];
const CAPABILITY_MAP = {
    coordinator: ['task_management', 'resource_allocation', 'consensus_building'],
    researcher: ['information_gathering', 'pattern_recognition', 'knowledge_synthesis'],
    coder: ['code_generation', 'refactoring', 'debugging'],
    analyst: ['data_analysis', 'performance_metrics', 'bottleneck_detection'],
    architect: ['system_design', 'architecture_patterns', 'integration_planning'],
    tester: ['test_generation', 'quality_assurance', 'edge_case_detection'],
    reviewer: ['code_review', 'standards_enforcement', 'best_practices'],
    optimizer: ['performance_optimization', 'resource_optimization', 'algorithm_improvement'],
    documenter: ['documentation_generation', 'api_docs', 'user_guides'],
    monitor: ['system_monitoring', 'health_checks', 'alerting'],
    specialist: ['domain_expertise', 'custom_capabilities', 'problem_solving']
};
exports.spawnCommand = new commander_1.Command('spawn')
    .description('Spawn specialized agents into the Hive Mind')
    .argument('[type]', 'Agent type to spawn')
    .option('-n, --name <string>', 'Custom agent name')
    .option('-c, --capabilities <items>', 'Additional capabilities (comma-separated)')
    .option('-s, --swarm-id <id>', 'Target swarm ID')
    .option('-i, --interactive', 'Interactive spawn mode', false)
    .option('-b, --batch <number>', 'Spawn multiple agents of same type', '1')
    .option('--auto-assign', 'Automatically assign to available tasks', false)
    .action(async (type, options) => {
    const spinner = (0, ora_1.default)('Spawning agent...').start();
    try {
        // Get or prompt for swarm ID
        const swarmId = options.swarmId || await getActiveSwarmId();
        if (!swarmId) {
            throw new Error('No active swarm found. Initialize a Hive Mind first.');
        }
        // Interactive mode
        if (options.interactive || !type) {
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'type',
                    message: 'Select agent type:',
                    choices: AGENT_TYPES,
                    when: !type
                },
                {
                    type: 'checkbox',
                    name: 'additionalCapabilities',
                    message: 'Select additional capabilities:',
                    choices: getAllCapabilities(),
                    when: (answers) => {
                        const agentType = type || answers.type;
                        return agentType === 'specialist';
                    }
                },
                {
                    type: 'input',
                    name: 'customName',
                    message: 'Enter custom agent name (optional):',
                    when: !options.name
                }
            ]);
            type = type || answers.type;
            options.name = options.name || answers.customName;
            if (answers.additionalCapabilities) {
                options.capabilities = answers.additionalCapabilities.join(',');
            }
        }
        // Validate agent type
        if (!AGENT_TYPES.includes(type)) {
            throw new Error(`Invalid agent type: ${type}`);
        }
        // Load Hive Mind
        const hiveMind = await HiveMind_js_1.HiveMind.load(swarmId);
        // Determine capabilities
        const baseCapabilities = CAPABILITY_MAP[type] || [];
        const additionalCapabilities = options.capabilities
            ? options.capabilities.split(',').map((c) => c.trim())
            : [];
        const capabilities = [...baseCapabilities, ...additionalCapabilities];
        // Spawn agents
        const batchSize = parseInt(options.batch, 10);
        const spawnedAgents = [];
        for (let i = 0; i < batchSize; i++) {
            const agentName = options.name || `${type}-${Date.now()}-${i}`;
            const agent = await hiveMind.spawnAgent({
                type: type,
                name: agentName,
                capabilities,
                autoAssign: options.autoAssign
            });
            spawnedAgents.push(agent);
            if (batchSize > 1) {
                spinner.text = `Spawning agents... (${i + 1}/${batchSize})`;
            }
        }
        spinner.succeed((0, formatter_js_1.formatSuccess)(`Successfully spawned ${batchSize} ${type} agent(s)!`));
        // Display spawned agents
        console.log('\n' + chalk_1.default.bold('🤖 Spawned Agents:'));
        spawnedAgents.forEach((agent) => {
            console.log((0, formatter_js_1.formatInfo)(`${agent.name} (${agent.id})`));
            console.log(chalk_1.default.gray(`  Capabilities: ${agent.capabilities.join(', ')}`));
            if (agent.currentTask) {
                console.log(chalk_1.default.yellow(`  Assigned to: ${agent.currentTask}`));
            }
        });
        // Show swarm stats
        const stats = await hiveMind.getStats();
        console.log('\n' + chalk_1.default.bold('📊 Swarm Statistics:'));
        console.log((0, formatter_js_1.formatInfo)(`Total Agents: ${stats.totalAgents}`));
        console.log((0, formatter_js_1.formatInfo)(`Active Agents: ${stats.activeAgents}`));
        console.log((0, formatter_js_1.formatInfo)(`Available Capacity: ${stats.availableCapacity}%`));
        if (options.autoAssign && stats.pendingTasks > 0) {
            console.log((0, formatter_js_1.formatWarning)(`Auto-assigned to ${stats.pendingTasks} pending task(s)`));
        }
    }
    catch (error) {
        spinner.fail((0, formatter_js_1.formatError)('Failed to spawn agent'));
        console.error((0, formatter_js_1.formatError)(error.message));
        process.exit(1);
    }
});
async function getActiveSwarmId() {
    const { DatabaseManager } = await Promise.resolve().then(() => require('../../../hive-mind/core/DatabaseManager.js'));
    const db = await DatabaseManager.getInstance();
    return db.getActiveSwarmId();
}
function getAllCapabilities() {
    const allCapabilities = new Set();
    Object.values(CAPABILITY_MAP).forEach(caps => {
        caps.forEach(cap => allCapabilities.add(cap));
    });
    return Array.from(allCapabilities);
}
