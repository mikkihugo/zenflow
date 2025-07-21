#!/usr/bin/env node
"use strict";
/**
 * Hive Mind Initialization Command
 *
 * Initializes a new Hive Mind swarm with Queen coordination
 * and collective intelligence capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const ora_1 = require("ora");
const HiveMind_js_1 = require("../../../hive-mind/core/HiveMind.js");
const DatabaseManager_js_1 = require("../../../hive-mind/core/DatabaseManager.js");
const formatter_js_1 = require("../../formatter.js");
exports.initCommand = new commander_1.Command('init')
    .description('Initialize a new Hive Mind swarm')
    .option('-t, --topology <type>', 'Swarm topology (mesh, hierarchical, ring, star)', 'hierarchical')
    .option('-m, --max-agents <number>', 'Maximum agents in swarm', '8')
    .option('-n, --name <string>', 'Swarm name', 'hive-mind-' + Date.now())
    .option('-q, --queen-mode <mode>', 'Queen coordination mode (centralized, distributed)', 'centralized')
    .option('--memory-ttl <seconds>', 'Default memory TTL in seconds', '86400')
    .option('--consensus-threshold <percent>', 'Consensus threshold percentage', '0.66')
    .option('--auto-spawn', 'Automatically spawn initial agents', false)
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Initializing Hive Mind...').start();
    try {
        // Initialize database
        const db = await DatabaseManager_js_1.DatabaseManager.getInstance();
        await db.initialize();
        // Create Hive Mind configuration
        const config = {
            name: options.name,
            topology: options.topology,
            maxAgents: parseInt(options.maxAgents, 10),
            queenMode: options.queenMode,
            memoryTTL: parseInt(options.memoryTtl, 10),
            consensusThreshold: parseFloat(options.consensusThreshold),
            autoSpawn: options.autoSpawn,
            createdAt: new Date(),
        };
        // Initialize Hive Mind
        const hiveMind = new HiveMind_js_1.HiveMind(config);
        const swarmId = await hiveMind.initialize();
        spinner.succeed((0, formatter_js_1.formatSuccess)('Hive Mind initialized successfully!'));
        console.log('\n' + chalk_1.default.bold('🐝 Hive Mind Details:'));
        console.log((0, formatter_js_1.formatInfo)(`Swarm ID: ${swarmId}`));
        console.log((0, formatter_js_1.formatInfo)(`Name: ${config.name}`));
        console.log((0, formatter_js_1.formatInfo)(`Topology: ${config.topology}`));
        console.log((0, formatter_js_1.formatInfo)(`Queen Mode: ${config.queenMode}`));
        console.log((0, formatter_js_1.formatInfo)(`Max Agents: ${config.maxAgents}`));
        console.log((0, formatter_js_1.formatInfo)(`Consensus Threshold: ${config.consensusThreshold * 100}%`));
        if (options.autoSpawn) {
            console.log('\n' + chalk_1.default.bold('🚀 Auto-spawning initial agents...'));
            await hiveMind.autoSpawnAgents();
            console.log((0, formatter_js_1.formatSuccess)('Initial agents spawned successfully!'));
        }
        console.log('\n' + chalk_1.default.bold('📝 Next Steps:'));
        console.log((0, formatter_js_1.formatInfo)('1. Spawn agents: ruv-swarm hive-mind spawn <type>'));
        console.log((0, formatter_js_1.formatInfo)('2. Submit task: ruv-swarm hive-mind task "Your task"'));
        console.log((0, formatter_js_1.formatInfo)('3. Check status: ruv-swarm hive-mind status'));
        console.log((0, formatter_js_1.formatInfo)('4. Interactive: ruv-swarm hive-mind wizard'));
    }
    catch (error) {
        spinner.fail((0, formatter_js_1.formatError)('Failed to initialize Hive Mind'));
        console.error((0, formatter_js_1.formatError)(error.message));
        process.exit(1);
    }
});
