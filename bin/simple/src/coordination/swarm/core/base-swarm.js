import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-base-swarm');
import { EventEmitter } from 'node:events';
import { WasmModuleLoader } from '../../../wasm-loader.cjs';
import { AgentPool } from '../../agents/agent.ts';
import { getContainer } from './singleton-container.ts';
import { generateId, validateSwarmOptions } from './utils.ts';
export class ZenSwarm extends EventEmitter {
    swarmId;
    agents = new Map();
    state = 'initializing';
    agentPool;
    wasmLoader;
    options;
    isRunning = false;
    coordinationDao;
    neuralProcessor;
    metrics;
    constructor(options = {}) {
        super();
        const errors = validateSwarmOptions(options);
        if (errors.length > 0) {
            throw new Error(`Invalid swarm options: ${errors.join(', ')}`);
        }
        this.options = {
            topology: 'mesh',
            maxAgents: 10,
            connectionDensity: 0.5,
            syncInterval: 5000,
            wasmPath: './neural_fann_bg.wasm',
            ...options,
            persistence: {
                enabled: false,
                dbPath: './swarm-state.db',
                checkpointInterval: 30000,
                compressionEnabled: true,
            },
            pooling: {
                enabled: false,
                maxPoolSize: 10,
                minPoolSize: 2,
                idleTimeout: 300000,
            },
        };
        this.swarmId = generateId('swarm');
        this.wasmLoader =
            getContainer().get('WasmModuleLoader') ||
                new WasmModuleLoader();
        this.isRunning = false;
        this.agentPool = null;
        this.metrics = {
            tasksCreated: 0,
            tasksCompleted: 0,
            tasksFailed: 0,
            messagesProcessed: 0,
            cognitiveLoad: 0,
            averageResponseTime: 0,
            neuralNetworkAccuracy: 0,
            swarmEfficiency: 0,
            timestamp: Date.now(),
        };
    }
    async initialize() {
        this.emit('swarm:initializing', { swarmId: this.swarmId });
        if (this.options.persistence.enabled) {
            this.coordinationDao = {
                query: async (_sql, _params) => [],
                execute: async (_sql, _params) => ({
                    affectedRows: 1,
                }),
            };
        }
        try {
            await this.wasmLoader.loadModule();
            this.neuralProcessor = this.wasmLoader;
        }
        catch (error) {
            logger.warn('Failed to load WASM module, falling back to JS implementation:', error);
        }
        if (this.options.pooling?.enabled) {
            this.agentPool = new AgentPool();
        }
        else {
            this.agentPool = null;
        }
        this.state = 'active';
        this.emit('swarm:initialized', { swarmId: this.swarmId });
    }
    getSwarmId() {
        return this.swarmId;
    }
    getState() {
        return this.state;
    }
    async shutdown() {
        this.isRunning = false;
        this.state = 'terminated';
        for (const agent of this.agents.values()) {
            await agent.shutdown();
        }
        this.agents.clear();
        if (this.agentPool) {
            this.agentPool = null;
        }
        this.emit('swarm:shutdown', { swarmId: this.swarmId });
    }
    emit(eventName, ...args) {
        return super.emit(eventName, ...args);
    }
}
export default ZenSwarm;
//# sourceMappingURL=base-swarm.js.map