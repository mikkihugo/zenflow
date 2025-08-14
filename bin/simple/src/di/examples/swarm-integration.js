var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { CORE_TOKENS, DIContainer, inject, injectable, SingletonProvider, SWARM_TOKENS, } from '../index.ts';
let EnhancedSwarmCoordinator = class EnhancedSwarmCoordinator {
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
        await this._agentRegistry.registerAgent({ id: agentId, ...config });
        this.agents.set(agentId, { id: agentId, ...config, status: 'idle' });
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
        await this._agentRegistry.unregisterAgent(agentId);
        this.agents.delete(agentId);
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
        const availableAgents = await this._agentRegistry.findAvailableAgents({
            status: 'idle',
            capabilities: task.requiredCapabilities || [],
        });
        if (availableAgents.length === 0) {
            throw new Error('No available agents for task assignment');
        }
        const selectedAgent = availableAgents[0];
        this.tasks.set(taskId, {
            id: taskId,
            ...task,
            assignedAgentId: selectedAgent?.id,
            status: 'assigned',
            timestamp: Date.now(),
        });
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
        const agentIds = Array.from(this.agents.keys());
        for (const agentId of agentIds) {
            await this.removeAgent(agentId);
        }
        this.tasks.clear();
        this.isInitialized = false;
        this._logger.info('Swarm shutdown complete');
    }
};
EnhancedSwarmCoordinator = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.Config)),
    __param(2, inject(SWARM_TOKENS.AgentRegistry)),
    __param(3, inject(SWARM_TOKENS.MessageBroker)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], EnhancedSwarmCoordinator);
export { EnhancedSwarmCoordinator };
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
export function createSwarmContainer(config = {}) {
    const container = new DIContainer();
    container.register(CORE_TOKENS.Logger, new SingletonProvider(() => new MockLogger()));
    container.register(CORE_TOKENS.Config, new SingletonProvider(() => new MockConfig(config)));
    container.register(SWARM_TOKENS.AgentRegistry, new SingletonProvider(() => new MockAgentRegistry()));
    container.register(SWARM_TOKENS.MessageBroker, new SingletonProvider(() => new MockMessageBroker()));
    container.register(SWARM_TOKENS.SwarmCoordinator, new SingletonProvider((c) => new EnhancedSwarmCoordinator(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.Config), c.resolve(SWARM_TOKENS.AgentRegistry), c.resolve(SWARM_TOKENS.MessageBroker))));
    return container;
}
export async function demonstrateSwarmDI() {
    const container = createSwarmContainer({
        'swarm.maxAgents': 20,
        'swarm.topology': 'hierarchical',
    });
    try {
        const coordinator = container.resolve(SWARM_TOKENS.SwarmCoordinator);
        await coordinator.initializeSwarm({
            name: 'demo-swarm',
            topology: 'hierarchical',
        });
        const agent1Id = await coordinator.addAgent({
            type: 'worker',
            capabilities: ['data-processing', 'file-operations'],
        });
        const agent2Id = await coordinator.addAgent({
            type: 'coordinator',
            capabilities: ['task-management', 'coordination'],
        });
        const _taskId = await coordinator.assignTask({
            type: 'data-processing',
            description: 'Process large dataset',
            requiredCapabilities: ['data-processing'],
            priority: 'high',
        });
        const _metrics = coordinator.getMetrics();
        await coordinator.removeAgent(agent1Id);
        await coordinator.removeAgent(agent2Id);
        await coordinator.shutdown();
    }
    finally {
        await container.dispose();
    }
}
//# sourceMappingURL=swarm-integration.js.map