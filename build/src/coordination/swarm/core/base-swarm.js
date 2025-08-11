/**
 * @file Coordination system: base-swarm.
 */
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-base-swarm');
/**
 * Base ZenSwarm Class - Core implementation without circular dependencies.
 *
 * This file contains the core ZenSwarm implementation to avoid circular.
 * Dependencies with session-integration.ts.
 */
import { EventEmitter } from 'node:events';
// import { DALFactory } from '../database'; // TODO: Implement proper DI integration
import { WasmModuleLoader } from '../../../wasm-loader.cjs';
import { AgentPool } from '../../agents/agent.ts';
import { getContainer } from './singleton-container.ts';
import { generateId, validateSwarmOptions } from './utils.ts';
/**
 * Core ZenSwarm implementation with all base functionality.
 *
 * @example
 */
export class ZenSwarm extends EventEmitter {
    swarmId;
    agents = new Map();
    state = 'initializing';
    agentPool;
    wasmLoader;
    options;
    // Properties referenced in the class methods
    isRunning = false;
    coordinationDao; // SessionCoordinationDao when persistence is enabled
    neuralProcessor; // WASM neural processor when available
    metrics;
    constructor(options = {}) {
        super();
        // Validate options and merge with defaults
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
            getContainer().get('WasmModuleLoader') || new WasmModuleLoader();
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
    // All the ZenSwarm methods would go here...
    // (Moving the entire class implementation from index.ts)
    async initialize() {
        this.emit('swarm:initializing', { swarmId: this.swarmId });
        // Initialize persistence if enabled
        if (this.options.persistence.enabled) {
            // Create a simple mock implementation for now
            // TODO: Implement proper DALFactory integration with DI
            this.coordinationDao = {
                query: async (_sql, _params) => [],
                execute: async (_sql, _params) => ({ affectedRows: 1 }),
            };
        }
        // Initialize WASM neural processor
        try {
            await this.wasmLoader.loadModule();
            this.neuralProcessor = this.wasmLoader;
        }
        catch (error) {
            logger.warn('Failed to load WASM module, falling back to JS implementation:', error);
        }
        // Initialize agent pool
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
        // Clean up agents
        for (const agent of this.agents.values()) {
            await agent.shutdown();
        }
        this.agents.clear();
        // Clean up coordination DAO - no explicit close needed for factory-managed DAOs
        // Clean up agent pool
        if (this.agentPool) {
            // AgentPool doesn't have a shutdown method yet
            this.agentPool = null;
        }
        this.emit('swarm:shutdown', { swarmId: this.swarmId });
    }
    // Type guard to satisfy TypeScript's event typing
    emit(eventName, ...args) {
        return super.emit(eventName, ...args);
    }
}
export default ZenSwarm;
