"use strict";
/**
 * @fileoverview JavaScript bindings for ruv-swarm neural coordination engine
 * @module ruv-swarm-js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuvSwarm = exports.RuvSwarmBridge = void 0;
exports.createServiceSwarm = createServiceSwarm;
exports.orchestrateAcrossServices = orchestrateAcrossServices;
const ruv_swarm_1 = require("ruv-swarm");
Object.defineProperty(exports, "RuvSwarm", { enumerable: true, get: function () { return ruv_swarm_1.RuvSwarm; } });
const utils_1 = require("@shared/utils");
class RuvSwarmBridge {
    ruvSwarm;
    swarms = new Map();
    logger;
    constructor(config = {}) {
        this.logger = new utils_1.Logger('RuvSwarmBridge');
        this.initializeRuvSwarm(config);
    }
    /**
     * Initialize the ruv-swarm engine
     */
    async initializeRuvSwarm(config) {
        try {
            this.ruvSwarm = await ruv_swarm_1.RuvSwarm.initialize();
            this.logger.info('✅ ruv-swarm engine initialized');
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize ruv-swarm:', error);
            throw error;
        }
    }
    /**
     * Create a new swarm for service coordination
     */
    async createSwarm(serviceName, config = {}) {
        try {
            const swarmConfig = {
                name: serviceName,
                maxAgents: config.maxAgents || 8,
                topology: config.topology || 'hierarchical',
                cognitive_diversity: config.cognitive_diversity !== false,
                neural_networks: config.neural_networks !== false,
                persistence: {
                    enabled: true,
                    database: `./swarms/${serviceName}.db`,
                    type: 'sqlite'
                },
                ...config
            };
            const swarm = await this.ruvSwarm.createSwarm(swarmConfig);
            const swarmId = `swarm-${serviceName}-${Date.now()}`;
            this.swarms.set(swarmId, swarm);
            this.logger.info(`🐝 Created swarm: ${swarmId} for service: ${serviceName}`);
            return swarmId;
        }
        catch (error) {
            this.logger.error(`❌ Failed to create swarm for ${serviceName}:`, error);
            throw error;
        }
    }
    /**
     * Spawn an agent in a swarm
     */
    async spawnAgent(swarmId, agentConfig) {
        const swarm = this.swarms.get(swarmId);
        if (!swarm) {
            throw new Error(`Swarm not found: ${swarmId}`);
        }
        try {
            const agent = await swarm.spawn(agentConfig.type, {
                name: agentConfig.name || `${agentConfig.type}-agent`,
                capabilities: agentConfig.capabilities || [],
                cognitive_pattern: agentConfig.cognitive_pattern || 'adaptive'
            });
            const agentId = `agent-${agentConfig.name || agentConfig.type}-${Date.now()}`;
            this.logger.info(`🤖 Spawned agent: ${agentId} in swarm: ${swarmId}`);
            return agentId;
        }
        catch (error) {
            this.logger.error(`❌ Failed to spawn agent in ${swarmId}:`, error);
            throw error;
        }
    }
    /**
     * Orchestrate a task across a swarm
     */
    async orchestrateTask(swarmId, task) {
        const swarm = this.swarms.get(swarmId);
        if (!swarm) {
            throw new Error(`Swarm not found: ${swarmId}`);
        }
        try {
            this.logger.info(`🎯 Orchestrating task: ${task.description} in swarm: ${swarmId}`);
            const result = await swarm.orchestrate({
                task: task.description,
                strategy: task.strategy || 'parallel',
                priority: task.priority || 'medium',
                maxAgents: task.maxAgents || 5,
                timeout: task.timeout || 300000 // 5 minutes
            });
            this.logger.info(`✅ Task orchestrated: ${result.taskId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Task orchestration failed:`, error);
            throw error;
        }
    }
    /**
     * Get swarm status and metrics
     */
    async getSwarmStatus(swarmId) {
        const swarm = this.swarms.get(swarmId);
        if (!swarm) {
            throw new Error(`Swarm not found: ${swarmId}`);
        }
        try {
            const status = await swarm.getStatus();
            return {
                id: swarmId,
                name: status.name,
                topology: status.topology,
                agents: status.agents || [],
                tasks: status.tasks || {},
                performance: status.performance || {},
                neural_status: status.neural_status || {},
                memory_usage: status.memory_usage || {},
                last_updated: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to get swarm status:`, error);
            throw error;
        }
    }
    /**
     * Enable inter-swarm communication
     */
    async connectSwarms(swarmId1, swarmId2) {
        const swarm1 = this.swarms.get(swarmId1);
        const swarm2 = this.swarms.get(swarmId2);
        if (!swarm1 || !swarm2) {
            throw new Error('One or both swarms not found');
        }
        try {
            // Enable inter-swarm communication via ruv-swarm's built-in networking
            await swarm1.connect(swarm2);
            this.logger.info(`🔗 Connected swarms: ${swarmId1} ↔ ${swarmId2}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to connect swarms:`, error);
            throw error;
        }
    }
    /**
     * Train neural patterns from swarm data
     */
    async trainNeuralPatterns(swarmId, options = {}) {
        const swarm = this.swarms.get(swarmId);
        if (!swarm) {
            throw new Error(`Swarm not found: ${swarmId}`);
        }
        try {
            this.logger.info(`🧠 Training neural patterns for swarm: ${swarmId}`);
            const result = await swarm.neural.train({
                iterations: options.iterations || 10,
                data: options.data || 'recent',
                learning_rate: options.learning_rate || 0.01
            });
            this.logger.info(`✅ Neural training completed: ${result.improvement}% improvement`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Neural training failed:`, error);
            throw error;
        }
    }
    /**
     * Get performance benchmarks
     */
    async benchmark(swarmId, options = {}) {
        const swarm = this.swarms.get(swarmId);
        if (!swarm) {
            throw new Error(`Swarm not found: ${swarmId}`);
        }
        try {
            this.logger.info(`📊 Running benchmark for swarm: ${swarmId}`);
            const benchmark = await swarm.benchmark({
                type: options.type || 'coordination',
                iterations: options.iterations || 10,
                metrics: options.metrics || ['latency', 'throughput', 'accuracy']
            });
            this.logger.info(`✅ Benchmark completed: ${benchmark.score} score`);
            return benchmark;
        }
        catch (error) {
            this.logger.error(`❌ Benchmark failed:`, error);
            throw error;
        }
    }
    /**
     * List all active swarms
     */
    listSwarms() {
        return Array.from(this.swarms.entries()).map(([id, swarm]) => ({
            id,
            name: swarm.getName ? swarm.getName() : id
        }));
    }
    /**
     * Cleanup and close all swarms
     */
    async cleanup() {
        this.logger.info('🧹 Cleaning up ruv-swarm bridge...');
        for (const [swarmId, swarm] of this.swarms) {
            try {
                if (swarm.close) {
                    await swarm.close();
                }
            }
            catch (error) {
                this.logger.warn(`⚠️ Error closing swarm ${swarmId}:`, error);
            }
        }
        this.swarms.clear();
        this.logger.info('✅ ruv-swarm bridge cleanup completed');
    }
}
exports.RuvSwarmBridge = RuvSwarmBridge;
// Export the main bridge class and re-export ruv-swarm types
exports.default = RuvSwarmBridge;
// Export convenience functions
async function createServiceSwarm(serviceName, config) {
    const bridge = new RuvSwarmBridge(config);
    await bridge.createSwarm(serviceName, config);
    return bridge;
}
async function orchestrateAcrossServices(services, task, config) {
    const bridge = new RuvSwarmBridge(config);
    const results = [];
    for (const service of services) {
        const swarmId = await bridge.createSwarm(service, config);
        const result = await bridge.orchestrateTask(swarmId, {
            description: task,
            strategy: 'parallel'
        });
        results.push({ service, swarmId, result });
    }
    return results;
}
//# sourceMappingURL=index.js.map