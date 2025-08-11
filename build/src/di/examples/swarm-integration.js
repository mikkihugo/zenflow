/**
 * Example integration of SwarmCoordinator with Dependency Injection.
 * Demonstrates how to migrate existing services to use DI patterns.
 */
/**
 * @file Swarm-integration implementation.
 */
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { CORE_TOKENS, DIContainer, injectable, SingletonProvider, SWARM_TOKENS, } from '../index.ts';
// Example integration with existing systems
/**
 * Enhanced SwarmCoordinator using dependency injection.
 * This shows how to refactor existing services to use DI.
 *
 * @example
 */
let EnhancedSwarmCoordinator = (() => {
    let _classDecorators = [injectable];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EnhancedSwarmCoordinator = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EnhancedSwarmCoordinator = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        _logger;
        _config;
        _agentRegistry;
        _messageBroker;
        isInitialized = false;
        agents = new Map();
        tasks = new Map();
        constructor(_logger, _config, _agentRegistry, _messageBroker) {
            this._logger = _logger;
            this._config = _config;
            this._agentRegistry = _agentRegistry;
            this._messageBroker = _messageBroker;
            this._logger.info('SwarmCoordinator created with DI');
        }
        async initializeSwarm(options) {
            this._logger.info('Initializing swarm', { options });
            const maxAgents = this._config.get('swarm.maxAgents', 10);
            const topology = this._config.get('swarm.topology', 'mesh');
            this._logger.debug('Swarm configuration', { maxAgents, topology });
            this.isInitialized = true;
            this._logger.info('Swarm initialized successfully');
        }
        async addAgent(config) {
            if (!this.isInitialized) {
                throw new Error('Swarm must be initialized before adding agents');
            }
            const agentId = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            this._logger.info('Adding agent', { agentId, config });
            // Register with agent registry
            await this._agentRegistry.registerAgent({ id: agentId, ...config });
            // Store locally
            this.agents.set(agentId, { id: agentId, ...config, status: 'idle' });
            // Announce to swarm
            await this._messageBroker.broadcast({
                type: 'agent_joined',
                agentId,
                timestamp: Date.now(),
            });
            this._logger.info('Agent added successfully', { agentId });
            return agentId;
        }
        async removeAgent(agentId) {
            this._logger.info('Removing agent', { agentId });
            if (!this.agents.has(agentId)) {
                throw new Error(`Agent ${agentId} not found`);
            }
            // Unregister from agent registry
            await this._agentRegistry.unregisterAgent(agentId);
            // Remove locally
            this.agents.delete(agentId);
            // Announce to swarm
            await this._messageBroker.broadcast({
                type: 'agent_left',
                agentId,
                timestamp: Date.now(),
            });
            this._logger.info('Agent removed successfully', { agentId });
        }
        async assignTask(task) {
            const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            this._logger.info('Assigning task', { taskId, task });
            // Find available agents
            const availableAgents = await this._agentRegistry.findAvailableAgents({
                status: 'idle',
                capabilities: task.requiredCapabilities || [],
            });
            if (availableAgents.length === 0) {
                throw new Error('No available agents for task assignment');
            }
            // Select best agent (simplified logic)
            const selectedAgent = availableAgents[0];
            // Store task
            this.tasks.set(taskId, {
                id: taskId,
                ...task,
                assignedAgentId: selectedAgent?.id,
                status: 'assigned',
                timestamp: Date.now(),
            });
            // Notify agent via message broker
            await this._messageBroker.publish(`agent.${selectedAgent?.id}`, {
                type: 'task_assignment',
                taskId,
                task,
                timestamp: Date.now(),
            });
            this._logger.info('Task assigned successfully', { taskId, agentId: selectedAgent?.id });
            return taskId;
        }
        getMetrics() {
            const totalAgents = this.agents.size;
            const totalTasks = this.tasks.size;
            const completedTasks = Array.from(this.tasks.values()).filter((t) => t.status === 'completed').length;
            const failedTasks = Array.from(this.tasks.values()).filter((t) => t.status === 'failed').length;
            const metrics = {
                totalAgents,
                totalTasks,
                completedTasks,
                failedTasks,
                successRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
                timestamp: Date.now(),
            };
            this._logger.debug('Retrieved swarm metrics', metrics);
            return metrics;
        }
        async shutdown() {
            this._logger.info('Shutting down swarm');
            // Remove all agents
            const agentIds = Array.from(this.agents.keys());
            for (const agentId of agentIds) {
                await this.removeAgent(agentId);
            }
            // Clear tasks
            this.tasks.clear();
            this.isInitialized = false;
            this._logger.info('Swarm shutdown complete');
        }
    };
    return EnhancedSwarmCoordinator = _classThis;
})();
export { EnhancedSwarmCoordinator };
/**
 * Mock implementations for testing and development.
 *
 * @example
 */
export class MockLogger {
    debug(_message, _meta) { }
    info(_message, _meta) { }
    warn(message, meta) {
        console.warn(`[WARN] ${message}`, meta || '');
    }
    error(message, meta) {
        console.error(`[ERROR] ${message}`, meta || '');
    }
}
export class MockConfig {
    data = new Map();
    constructor(initialConfig = {}) {
        Object.entries(initialConfig).forEach(([key, value]) => {
            this.data.set(key, value);
        });
    }
    get(key, defaultValue) {
        return this.data.has(key) ? this.data.get(key) : defaultValue;
    }
    set(key, value) {
        this.data.set(key, value);
    }
    has(key) {
        return this.data.has(key);
    }
}
export class MockAgentRegistry {
    agents = new Map();
    async registerAgent(agent) {
        this.agents.set(agent.id, agent);
    }
    async unregisterAgent(agentId) {
        this.agents.delete(agentId);
    }
    async getAgent(agentId) {
        return this.agents.get(agentId);
    }
    async getActiveAgents() {
        return Array.from(this.agents.values()).filter((agent) => agent.status !== 'offline');
    }
    async findAvailableAgents(criteria) {
        return Array.from(this.agents.values()).filter((agent) => {
            if (criteria.status && agent.status !== criteria.status)
                return false;
            if (criteria.capabilities &&
                !criteria.capabilities.every((cap) => agent.capabilities?.includes(cap)))
                return false;
            return true;
        });
    }
}
export class MockMessageBroker {
    subscribers = new Map();
    async publish(topic, message) {
        const handlers = this.subscribers.get(topic);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(message);
                }
                catch (error) {
                    console.error('Error in message handler:', error);
                }
            });
        }
    }
    async subscribe(topic, handler) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        this.subscribers.get(topic)?.add(handler);
    }
    async unsubscribe(topic, handler) {
        const handlers = this.subscribers.get(topic);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    async broadcast(message) {
        // Broadcast to all subscribers
        for (const handlers of this.subscribers.values()) {
            handlers.forEach((handler) => {
                try {
                    handler(message);
                }
                catch (error) {
                    console.error('Error in broadcast handler:', error);
                }
            });
        }
    }
}
/**
 * Factory function to set up a complete DI container with swarm services.
 *
 * @param config
 * @example
 */
export function createSwarmContainer(config = {}) {
    const container = new DIContainer();
    // Register core services
    container.register(CORE_TOKENS.Logger, new SingletonProvider(() => new MockLogger()));
    container.register(CORE_TOKENS.Config, new SingletonProvider(() => new MockConfig(config)));
    // Register swarm services
    container.register(SWARM_TOKENS.AgentRegistry, new SingletonProvider(() => new MockAgentRegistry()));
    container.register(SWARM_TOKENS.MessageBroker, new SingletonProvider(() => new MockMessageBroker()));
    // Register enhanced swarm coordinator
    container.register(SWARM_TOKENS.SwarmCoordinator, new SingletonProvider((c) => new EnhancedSwarmCoordinator(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.Config), c.resolve(SWARM_TOKENS.AgentRegistry), c.resolve(SWARM_TOKENS.MessageBroker))));
    return container;
}
/**
 * Example usage demonstrating the complete workflow.
 *
 * @example
 */
export async function demonstrateSwarmDI() {
    // Create container with configuration
    const container = createSwarmContainer({
        'swarm.maxAgents': 20,
        'swarm.topology': 'hierarchical',
    });
    try {
        // Resolve the swarm coordinator
        const coordinator = container.resolve(SWARM_TOKENS.SwarmCoordinator);
        // Initialize swarm
        await coordinator.initializeSwarm({
            name: 'demo-swarm',
            topology: 'hierarchical',
        });
        // Add some agents
        const agent1Id = await coordinator.addAgent({
            type: 'worker',
            capabilities: ['data-processing', 'file-operations'],
        });
        const agent2Id = await coordinator.addAgent({
            type: 'coordinator',
            capabilities: ['task-management', 'coordination'],
        });
        // Assign a task
        const _taskId = await coordinator.assignTask({
            type: 'data-processing',
            description: 'Process large dataset',
            requiredCapabilities: ['data-processing'],
            priority: 'high',
        });
        // Get metrics
        const _metrics = coordinator.getMetrics();
        // Cleanup
        await coordinator.removeAgent(agent1Id);
        await coordinator.removeAgent(agent2Id);
        await coordinator.shutdown();
    }
    finally {
        // Dispose container
        await container.dispose();
    }
}
// EnhancedSwarmCoordinator is already exported above with export class
