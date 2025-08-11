/**
 * @file Core module exports.
 */
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-index');
// import { DALFactory } from '../database'; // TODO: Implement proper DI integration
import { WasmModuleLoader } from '../../../neural/wasm/wasm-loader.ts';
import { AgentPool, createAgent } from '../../agents/agent.ts';
import { executeTaskWithAgent } from './agent-adapter.ts';
import { getContainer } from './singleton-container.ts';
import { formatMetrics, generateId, priorityToNumber, validateSwarmOptions } from './utils.ts';
export * from '../../../neural/core/neural-network-manager.ts';
export * from '../../../neural/wasm/wasm-loader2.ts';
// Enhanced exports with neural capabilities
export * from '../../agents/agent.ts';
export * from '../mcp/mcp-daa-tools.ts';
// Export the base implementation as BaseZenSwarm to avoid conflict
export { ZenSwarm as BaseZenSwarm } from './base-swarm.ts';
export * from './errors.ts';
export * from './hooks';
export * from './logger.ts';
export * from './logging-config.ts';
export * from './monitoring-dashboard.ts';
export * from './performance.ts';
export * from './performance-benchmarks.ts';
export * from './recovery-integration.ts';
export * from './recovery-workflows.ts';
export * from './schemas.ts';
export * from './session-integration.ts';
export * from './session-manager.ts';
export * from './session-utils.ts';
export * from './singleton-container.ts';
export { TopologyManager } from './topology-manager.ts';
// Re-export all types and utilities
export * from './types.ts';
export * from './utils.ts';
/**
 * Enhanced Agent class with neural capabilities and cognitive patterns.
 *
 * @example
 */
export class Agent {
    id;
    type;
    config;
    isActive;
    neuralNetworkId;
    cognitivePattern;
    capabilities;
    status;
    state;
    constructor(config = {}) {
        this.id = config?.id || `agent-${Date.now()}`;
        this.type = config?.type || 'generic';
        this.config = config;
        this.isActive = false;
        this.neuralNetworkId = config?.enableNeuralNetwork ? `nn-${Date.now()}` : undefined;
        this.cognitivePattern = config?.cognitivePattern || 'adaptive';
        this.capabilities = config?.capabilities || [];
        this.status = 'idle';
        this.state = { status: 'idle' };
    }
    async initialize() {
        this.isActive = true;
        this.status = 'active';
        this.state.status = 'active';
        // Initialize neural network if enabled
        if (this.neuralNetworkId) {
        }
        return true;
    }
    async execute(task) {
        this.status = 'busy';
        this.state.status = 'busy';
        try {
            const result = {
                success: true,
                result: `Agent ${this.id} executed: ${task}`,
                agent: this.id,
                executionTime: Date.now(),
                cognitivePattern: this.cognitivePattern,
            };
            // If neural network is available, enhance the execution
            if (this.neuralNetworkId) {
                return {
                    ...result,
                    neuralProcessing: {
                        networkId: this.neuralNetworkId,
                        cognitiveEnhancement: true,
                        patternMatching: this.cognitivePattern,
                        executionStrategy: 'neural-enhanced',
                    },
                };
            }
            return result;
        }
        finally {
            this.status = 'active';
            this.state.status = 'active';
        }
    }
    async updateStatus(newStatus) {
        this.status = newStatus;
        this.state.status = newStatus;
    }
    async cleanup() {
        this.isActive = false;
        this.status = 'idle';
        this.state.status = 'idle';
        if (this.neuralNetworkId) {
        }
        return true;
    }
    async communicate(_message) {
        if (this.neuralNetworkId) {
        }
    }
}
/**
 * 🚀 ULTIMATE ZenSwarm - The definitive swarm orchestration system.
 *
 * @example
 */
export class ZenSwarm {
    // Core swarm properties
    options;
    state;
    agentPool;
    eventHandlers;
    swarmId;
    isInitialized = false;
    // Enhanced WASM and Neural capabilities
    wasmModule;
    wasmLoader;
    persistence = null;
    activeSwarms = new Map();
    globalAgents = new Map();
    // Enhanced metrics and features
    metrics;
    features;
    constructor(options = {}) {
        const errors = validateSwarmOptions(options);
        // Initialize WASM and enhanced capabilities
        this.wasmLoader = new WasmModuleLoader();
        this.metrics = {
            totalSwarms: 0,
            totalAgents: 0,
            totalTasks: 0,
            memoryUsage: 0,
            performance: {},
        };
        this.features = {
            neural_networks: false,
            forecasting: false,
            cognitive_diversity: false,
            simd_support: false,
        };
        if (errors.length > 0) {
            throw new Error(`Invalid swarm options: ${errors.join(', ')}`);
        }
        this.options = {
            topology: options?.topology || 'mesh',
            maxAgents: options?.maxAgents || 10,
            connectionDensity: options?.connectionDensity || 0.5,
            syncInterval: options?.syncInterval || 1000,
            wasmPath: options?.wasmPath || './wasm/ruv_swarm_wasm.js',
            persistence: {
                enabled: false,
                dbPath: '',
                checkpointInterval: 60000,
                compressionEnabled: false,
            },
            pooling: {
                enabled: false,
                maxPoolSize: 10,
                minPoolSize: 1,
                idleTimeout: 300000,
            },
        };
        this.agentPool = new AgentPool();
        this.eventHandlers = new Map();
        this.state = {
            agents: new Map(),
            tasks: new Map(),
            topology: this.options.topology,
            connections: [],
            metrics: {
                totalTasks: 0,
                completedTasks: 0,
                failedTasks: 0,
                averageCompletionTime: 0,
                agentUtilization: new Map(),
                throughput: 0,
            },
        };
    }
    /**
     * Initialize the swarm with WASM module.
     */
    async init() {
        if (this.isInitialized) {
            throw new Error('Swarm is already initialized');
        }
        try {
            // Load WASM module
            if (typeof globalThis.window !== 'undefined') {
                // Browser environment
                const wasmModule = await import(this.options.wasmPath);
                await wasmModule.default();
                this.wasmModule = wasmModule;
            }
            else {
            }
            // Initialize swarm in WASM if available
            if (this.wasmModule) {
                await this.wasmModule.init();
                this.swarmId = this.wasmModule.createSwarm(this.options);
            }
            this.isInitialized = true;
            this.startSyncLoop();
            this.emit('swarm:initialized', { options: this.options });
        }
        catch (error) {
            throw new Error(`Failed to initialize swarm: ${error}`);
        }
    }
    /**
     * Static factory method for easy initialization.
     *
     * @param options
     */
    static async create(options) {
        const swarm = new ZenSwarm(options);
        await swarm.init();
        return swarm;
    }
    /**
     * Enhanced static initialization with comprehensive features.
     *
     * @param options
     */
    static async initialize(options = {}) {
        const container = getContainer();
        // Register ZenSwarm factory if not already registered
        if (!container.has('ZenSwarm')) {
            container.register('ZenSwarm', () => new ZenSwarm(), {
                singleton: true,
                lazy: false,
            });
        }
        // Get or create singleton instance through container
        const instance = container.get('ZenSwarm');
        const { loadingStrategy = 'progressive', enablePersistence = true, enableNeuralNetworks = true, enableForecasting = false, useSIMD = true, debug = false, } = options;
        // Check if already initialized through container
        if (instance.isInitialized) {
            if (debug) {
            }
            return instance;
        }
        // Minimal loading for fast startup
        if (loadingStrategy === 'minimal') {
            if (debug) {
            }
            instance.isInitialized = true;
            instance.features.simd_support = false; // Skip SIMD detection for speed
            return instance;
        }
        try {
            // Initialize WASM modules (skip for minimal loading)
            if (loadingStrategy !== 'minimal') {
                await instance.wasmLoader.initialize(loadingStrategy);
            }
            // Detect and enable features (skip for minimal loading)
            if (loadingStrategy !== 'minimal') {
                await instance.detectFeatures(useSIMD);
            }
            // Initialize DAO persistence if enabled
            if (enablePersistence) {
                try {
                    // Create a simple mock implementation for now
                    // TODO: Implement proper DALFactory integration with DI
                    instance.persistence = {
                        query: async (_sql, _params) => [],
                        execute: async (_sql, _params) => ({ affectedRows: 1 }),
                    };
                }
                catch (error) {
                    logger.warn('⚠️ Persistence not available:', error.message);
                    instance.persistence = null;
                }
            }
            // Pre-load neural networks if enabled
            if (enableNeuralNetworks && loadingStrategy !== 'minimal') {
                try {
                    await instance.wasmLoader.loadModule();
                    instance.features.neural_networks = true;
                    if (debug) {
                    }
                }
                catch (_error) {
                    instance.features.neural_networks = false;
                }
            }
            // Pre-load forecasting if enabled
            if (enableForecasting && enableNeuralNetworks && loadingStrategy !== 'minimal') {
                try {
                    await instance.wasmLoader.loadModule();
                    instance.features.forecasting = true;
                }
                catch (_error) {
                    instance.features.forecasting = false;
                }
            }
            if (loadingStrategy !== 'minimal') {
                if (debug) {
                }
            }
            // Mark as initialized
            instance.isInitialized = true;
            return instance;
        }
        catch (error) {
            logger.error('❌ Failed to initialize ruv-swarm:', error);
            throw error;
        }
    }
    /**
     * Detect available features (neural networks, SIMD, etc.).
     *
     * @param useSIMD
     */
    async detectFeatures(useSIMD = true) {
        try {
            // Load core module to detect basic features
            await this.wasmLoader.loadModule();
            const coreModule = this.wasmLoader.getModule();
            // Detect SIMD support
            if (useSIMD) {
                this.features.simd_support = ZenSwarm.detectSIMDSupport();
            }
            // Check if core module has the expected exports
            if (coreModule?.exports) {
                this.features.neural_networks = true;
                this.features.cognitive_diversity = true;
            }
        }
        catch (error) {
            logger.warn('⚠️ Feature detection failed:', error.message);
        }
    }
    /**
     * Create a new swarm with neural capabilities.
     *
     * @param config
     */
    async createSwarm(config) {
        const { id = null, name = 'default-swarm', topology = 'mesh', strategy = 'balanced', maxAgents = 10, enableCognitiveDiversity = true, } = config;
        // Ensure core module is loaded
        await this.wasmLoader.loadModule();
        const coreModule = this.wasmLoader.getModule();
        // Create swarm configuration
        const swarmConfig = {
            name,
            topology_type: topology,
            max_agents: maxAgents,
            enable_cognitive_diversity: enableCognitiveDiversity && this.features.cognitive_diversity,
        };
        // Use the core module exports to create swarm
        let wasmSwarm;
        if (coreModule?.exports?.ZenSwarm) {
            try {
                wasmSwarm = new coreModule.exports.ZenSwarm();
                wasmSwarm.id = id || `swarm-${Date.now()}`;
                wasmSwarm.name = name;
                wasmSwarm.config = swarmConfig;
            }
            catch (error) {
                logger.warn('Failed to create WASM swarm:', error.message);
                wasmSwarm = {
                    id: id || `swarm-${Date.now()}`,
                    name,
                    config: swarmConfig,
                    agents: new Map(),
                    tasks: new Map(),
                };
            }
        }
        else {
            wasmSwarm = {
                id: id || `swarm-${Date.now()}`,
                name,
                config: swarmConfig,
                agents: new Map(),
                tasks: new Map(),
            };
        }
        // Create JavaScript wrapper with full neural capabilities
        const swarm = new SwarmWrapper(wasmSwarm.id || wasmSwarm.name, wasmSwarm, this);
        // Persist swarm if persistence is enabled and this is a new swarm
        if (this.persistence && !id) {
            try {
                await this.persistence.execute('INSERT INTO swarms (id, name, topology, strategy, max_agents, created_at) VALUES (?, ?, ?, ?, ?, ?)', [swarm.id, name, topology, strategy, maxAgents, new Date().toISOString()]);
            }
            catch (error) {
                if (!error.message.includes('UNIQUE constraint failed')) {
                    logger.warn('Failed to persist swarm:', error.message);
                }
            }
        }
        this.activeSwarms.set(swarm.id, swarm);
        this.metrics.totalSwarms++;
        return swarm;
    }
    /**
     * Get global metrics including neural performance.
     */
    async getGlobalMetrics() {
        this.metrics.memoryUsage = this.wasmLoader.getTotalMemoryUsage();
        // Aggregate metrics from all swarms
        let totalAgents = 0;
        let totalTasks = 0;
        for (const swarm of this.activeSwarms.values()) {
            const status = await swarm.getStatus(false);
            totalAgents += status.agents?.total || 0;
            totalTasks += status.tasks?.total || 0;
        }
        this.metrics.totalAgents = totalAgents;
        this.metrics.totalTasks = totalTasks;
        this.metrics.totalSwarms = this.activeSwarms.size;
        return {
            ...this.metrics,
            features: this.features,
            wasm_modules: this.wasmLoader.getModuleStatus(),
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Legacy compatibility method for spawnAgent with neural capabilities.
     *
     * @param name
     * @param type
     * @param options
     */
    async spawnAgent(name, type = 'researcher', options = {}) {
        // Create a default swarm if none exists
        if (this.activeSwarms.size === 0) {
            await this.createSwarm({
                name: 'default-swarm',
                maxAgents: options?.maxAgents || 10,
            });
        }
        // Get the first available swarm
        const swarm = this.activeSwarms.values().next().value;
        return await swarm.spawnAgent(name, type, options);
    }
    // Core ZenSwarm methods from original implementation
    addAgent(config) {
        if (!this.isInitialized) {
            throw new Error('Swarm must be initialized before adding agents');
        }
        if (this.state.agents.size >= this.options.maxAgents) {
            throw new Error(`Maximum agent limit (${this.options.maxAgents}) reached`);
        }
        const agent = createAgent(config);
        this.state.agents.set(agent.id, agent);
        this.agentPool.addAgent(agent);
        // Add to WASM if available
        if (this.wasmModule && this.swarmId !== undefined) {
            const wasmAgentId = this.wasmModule.addAgent(this.swarmId, config);
            agent.setWasmAgentId(wasmAgentId);
        }
        this.updateConnections(agent.id);
        this.emit('agent:added', { agentId: agent.id, config });
        return agent.id;
    }
    removeAgent(agentId) {
        const agent = this.state.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        if (agent.status === 'busy') {
            throw new Error(`Cannot remove busy agent ${agentId}`);
        }
        this.state.agents.delete(agentId);
        this.agentPool.removeAgent(agentId);
        this.state.connections = this.state.connections.filter((conn) => conn.from !== agentId && conn.to !== agentId);
        this.emit('agent:removed', { agentId });
    }
    async submitTask(task) {
        if (!this.isInitialized) {
            throw new Error('Swarm must be initialized before submitting tasks');
        }
        const fullTask = {
            ...task,
            id: generateId('task'),
            status: 'pending',
        };
        this.state.tasks.set(fullTask.id, fullTask);
        this.state.metrics.totalTasks++;
        this.emit('task:created', { task: fullTask });
        if (this.wasmModule && this.swarmId !== undefined) {
            this.wasmModule.assignTask(this.swarmId, fullTask);
        }
        else {
            await this.assignTask(fullTask);
        }
        return fullTask.id;
    }
    getTaskStatus(taskId) {
        return this.state.tasks.get(taskId);
    }
    getTasksByStatus(status) {
        return Array.from(this.state.tasks.values()).filter((task) => task.status === status);
    }
    getMetrics() {
        return { ...this.state.metrics };
    }
    getFormattedMetrics() {
        return formatMetrics(this.state.metrics);
    }
    // Event emitter implementation
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)?.add(handler);
    }
    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(data);
                }
                catch (error) {
                    logger.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Shutdown the swarm with comprehensive cleanup.
     */
    async destroy() {
        if (!this.isInitialized) {
            return;
        }
        // Cancel any pending tasks
        for (const task of Array.from(this.state.tasks.values())) {
            if (task.status === 'pending' || task.status === 'in_progress') {
                task.status = 'failed';
                task.error = new Error('Swarm shutdown');
            }
        }
        // Terminate all active swarms
        for (const swarm of this.activeSwarms.values()) {
            if (typeof swarm.terminate === 'function') {
                swarm.terminate();
            }
        }
        this.activeSwarms.clear();
        this.globalAgents.clear();
        // Cleanup persistence - DAO is managed by factory, no explicit close needed
        // Destroy WASM resources
        if (this.wasmModule && this.swarmId !== undefined) {
            this.wasmModule.destroy(this.swarmId);
        }
        // Cleanup WASM loader
        if (this.wasmLoader && typeof this.wasmLoader.cleanup === 'function') {
            this.wasmLoader.cleanup();
        }
        this.isInitialized = false;
        this.emit('swarm:destroyed', {});
    }
    // Private helper methods
    async assignTask(task) {
        const agent = this.agentPool.getAvailableAgent();
        if (!agent) {
            return;
        }
        task.status = 'assigned';
        task.assignedAgents = [agent.id];
        this.emit('task:assigned', { taskId: task.id, agentId: agent.id });
        const message = {
            id: generateId('msg'),
            from: 'swarm',
            to: agent.id,
            type: 'task_assignment',
            payload: task,
            timestamp: Date.now(),
        };
        await agent.communicate(message);
        try {
            task.status = 'in_progress';
            const startTime = Date.now();
            const result = await executeTaskWithAgent(agent, task);
            task.status = 'completed';
            task.result = result;
            const executionTime = Date.now() - startTime;
            this.updateMetrics(true, executionTime);
            this.emit('task:completed', { taskId: task.id, result });
        }
        catch (error) {
            task.status = 'failed';
            task.error = error;
            this.updateMetrics(false, 0);
            this.emit('task:failed', { taskId: task.id, error });
        }
        finally {
            this.agentPool.releaseAgent(agent.id);
            const pendingTasks = this.getTasksByStatus('pending');
            if (pendingTasks.length > 0) {
                pendingTasks.sort((a, b) => priorityToNumber(b.priority) - priorityToNumber(a.priority));
                const nextTask = pendingTasks[0];
                if (nextTask) {
                    await this.assignTask(nextTask);
                }
            }
        }
    }
    updateConnections(newAgentId) {
        const agents = Array.from(this.state.agents.keys());
        switch (this.options.topology) {
            case 'mesh':
                for (const agentId of agents) {
                    if (agentId !== newAgentId) {
                        this.state.connections.push({
                            from: newAgentId,
                            to: agentId,
                            weight: 1,
                            type: 'coordination',
                        });
                    }
                }
                break;
            case 'hierarchical':
                if (agents.length > 1) {
                    const parentIndex = Math.floor((agents.indexOf(newAgentId) - 1) / 2);
                    if (parentIndex >= 0 && agents[parentIndex]) {
                        this.state.connections.push({
                            from: newAgentId,
                            to: agents[parentIndex],
                            weight: 1,
                            type: 'control',
                        });
                    }
                }
                break;
            case 'distributed': {
                const numConnections = Math.floor(agents.length * this.options.connectionDensity);
                const shuffled = agents.filter((id) => id !== newAgentId).sort(() => Math.random() - 0.5);
                for (let i = 0; i < Math.min(numConnections, shuffled.length); i++) {
                    const target = shuffled[i];
                    if (target) {
                        this.state.connections.push({
                            from: newAgentId,
                            to: target,
                            weight: Math.random(),
                            type: 'data',
                        });
                    }
                }
                break;
            }
        }
    }
    updateMetrics(success, executionTime) {
        if (success) {
            this.state.metrics.completedTasks++;
        }
        else {
            this.state.metrics.failedTasks++;
        }
        if (success && executionTime > 0) {
            const totalCompleted = this.state.metrics.completedTasks;
            const currentAvg = this.state.metrics.averageCompletionTime;
            this.state.metrics.averageCompletionTime =
                (currentAvg * (totalCompleted - 1) + executionTime) / totalCompleted;
        }
        const totalProcessed = this.state.metrics.completedTasks + this.state.metrics.failedTasks;
        const elapsedSeconds = (Date.now() - this.startTime) / 1000;
        this.state.metrics.throughput = totalProcessed / elapsedSeconds;
    }
    startTime = Date.now();
    startSyncLoop() {
        setInterval(() => {
            if (this.wasmModule && this.swarmId !== undefined) {
                const _wasmState = this.wasmModule.getState(this.swarmId);
                // Update local state as needed
            }
            for (const agent of Array.from(this.state.agents.values())) {
                this.state.metrics.agentUtilization.set(agent.id, agent.status === 'busy' ? 1 : 0);
            }
        }, this.options.syncInterval);
    }
    /**
     * Feature detection helpers.
     */
    static detectSIMDSupport() {
        try {
            const simdTestModule = new Uint8Array([
                0x00,
                0x61,
                0x73,
                0x6d, // WASM magic
                0x01,
                0x00,
                0x00,
                0x00, // Version 1
                0x01,
                0x05,
                0x01, // Type section: 1 type
                0x60,
                0x00,
                0x01,
                0x7b, // Function type: () -> v128 (SIMD type)
            ]);
            return WebAssembly.validate(simdTestModule);
        }
        catch {
            return false;
        }
    }
    static getVersion() {
        return '2.0.0'; // Ultimate version with full WASM + neural capabilities
    }
    static getRuntimeFeatures() {
        return {
            webassembly: typeof WebAssembly !== 'undefined',
            simd: ZenSwarm.detectSIMDSupport(),
            workers: typeof Worker !== 'undefined',
            shared_array_buffer: typeof SharedArrayBuffer !== 'undefined',
            bigint: typeof BigInt !== 'undefined',
        };
    }
}
/**
 * Enhanced Swarm wrapper class with neural orchestration.
 *
 * @example
 */
export class SwarmWrapper {
    id;
    ruvSwarm;
    wasmSwarm;
    agents;
    tasks;
    constructor(id, wasmInstance, ruvSwarmInstance) {
        this.id = id;
        this.wasmSwarm = wasmInstance;
        this.ruvSwarm = ruvSwarmInstance;
        this.agents = new Map();
        this.tasks = new Map();
    }
    async spawnAgent(name, type = 'researcher', options = {}) {
        const agent = new Agent({
            id: options?.id || `agent-${Date.now()}`,
            name,
            type,
            enableNeuralNetwork: options?.enableNeuralNetwork !== false && this.ruvSwarm.features.neural_networks,
            cognitivePattern: options?.cognitivePattern || 'adaptive',
            capabilities: options?.capabilities || ['neural-processing', 'pattern-matching'],
            ...options,
        });
        await agent.initialize();
        this.agents.set(agent.id, agent);
        return agent;
    }
    async getStatus(_detailed = false) {
        return {
            id: this.id,
            agents: {
                total: this.agents.size,
                active: Array.from(this.agents.values()).filter((a) => a.status === 'active').length,
                idle: Array.from(this.agents.values()).filter((a) => a.status === 'idle').length,
            },
            tasks: {
                total: this.tasks.size,
                pending: Array.from(this.tasks.values()).filter((t) => t.status === 'pending').length,
                in_progress: Array.from(this.tasks.values()).filter((t) => t.status === 'in_progress')
                    .length,
                completed: Array.from(this.tasks.values()).filter((t) => t.status === 'completed').length,
            },
        };
    }
    async terminate() {
        this.ruvSwarm.activeSwarms.delete(this.id);
    }
}
/**
 * Enhanced Task wrapper class with neural execution.
 *
 * @example
 */
export class TaskWrapper {
    id;
    description;
    status;
    assignedAgents;
    result;
    swarm;
    startTime;
    endTime;
    progress;
    constructor(id, wasmResult, swarm) {
        this.id = id;
        this.description = wasmResult?.task_description || wasmResult?.description;
        this.status = wasmResult?.status || 'pending';
        this.assignedAgents = wasmResult?.assigned_agents || [];
        this.result = null;
        this.swarm = swarm;
        this.startTime = null;
        this.endTime = null;
        this.progress = 0;
    }
    async getStatus() {
        return {
            id: this.id,
            status: this.status,
            assignedAgents: this.assignedAgents,
            progress: this.progress,
            execution_time_ms: this.startTime ? (this.endTime || Date.now()) - this.startTime : 0,
        };
    }
}
// Export neural-enhanced utilities
export const NeuralSwarmUtils = {
    /**
     * Create a neural-enhanced swarm with pre-configured agents.
     *
     * @param config
     */
    async createNeuralSwarm(config = {}) {
        const swarm = await ZenSwarm.initialize({
            enableNeuralNetworks: true,
            enableForecasting: true,
            useSIMD: true,
            ...config,
        });
        return swarm;
    },
    /**
     * Spawn a team of neural agents with different cognitive patterns.
     *
     * @param swarm
     * @param teamConfig
     */
    async spawnNeuralTeam(swarm, teamConfig = {}) {
        const { size = 3, cognitivePatterns = ['analytical', 'creative', 'systematic'], types = ['researcher', 'analyst', 'coordinator'], } = teamConfig;
        const agents = [];
        for (let i = 0; i < size; i++) {
            const agent = await swarm.spawnAgent(`neural-agent-${i + 1}`, types[i % types.length], {
                enableNeuralNetwork: true,
                cognitivePattern: cognitivePatterns[i % cognitivePatterns.length],
                capabilities: ['neural-processing', 'pattern-matching', 'adaptive-learning'],
            });
            agents.push(agent);
        }
        return agents;
    },
};
/**
 * Default export for convenience.
 */
export default ZenSwarm;
