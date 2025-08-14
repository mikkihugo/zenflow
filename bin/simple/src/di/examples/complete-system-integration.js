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
import { CORE_TOKENS, createContainerBuilder, inject, injectable, NEURAL_TOKENS, SWARM_TOKENS, } from '../index.ts';
class ProductionLogger {
    log(_message) { }
    info(message) {
        this.log(`INFO: ${message}`);
    }
    warn(message) {
        this.log(`WARN: ${message}`);
    }
    error(message) {
        this.log(`ERROR: ${message}`);
    }
    debug(message) {
        this.log(`DEBUG: ${message}`);
    }
}
class ConfigurationManager {
    settings = new Map();
    constructor() {
        this.settings.set('swarm.maxAgents', 50);
        this.settings.set('swarm.topology', 'mesh');
        this.settings.set('neural.learningRate', 0.001);
        this.settings.set('database.connectionPool', 10);
    }
    get(key) {
        return this.settings.get(key);
    }
    set(key, value) {
        this.settings.set(key, value);
    }
    has(key) {
        return this.settings.has(key);
    }
}
let EnhancedEventBus = class EnhancedEventBus {
    _logger;
    handlers = new Map();
    constructor(_logger) {
        this._logger = _logger;
    }
    publish(event, data) {
        this._logger.info(`Publishing event: ${event}`);
        const eventHandlers = this.handlers.get(event);
        if (eventHandlers) {
            for (const handler of eventHandlers) {
                try {
                    handler(data);
                }
                catch (error) {
                    this._logger.error(`Error in event handler for ${event}: ${error}`);
                }
            }
        }
    }
    subscribe(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)?.add(handler);
        this._logger.info(`Subscribed to event: ${event}`);
    }
    unsubscribe(event, handler) {
        const eventHandlers = this.handlers.get(event);
        if (eventHandlers) {
            eventHandlers.delete(handler);
        }
    }
    emit(event, data) {
        this.publish(event, data);
    }
    on(event, handler) {
        this.subscribe(event, handler);
    }
    off(event, handler) {
        this.unsubscribe(event, handler);
    }
};
EnhancedEventBus = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Object])
], EnhancedEventBus);
let SwarmDatabase = class SwarmDatabase {
    _logger;
    isInitialized = false;
    constructor(_logger) {
        this._logger = _logger;
    }
    async initialize() {
        this._logger.info('Initializing swarm database...');
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.isInitialized = true;
        this._logger.info('Swarm database initialized successfully');
    }
    async query(sql, _params) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        this._logger.info(`Executing query: ${sql}`);
        return [];
    }
    async close() {
        this._logger.info('Closing swarm database...');
        this.isInitialized = false;
    }
    async execute(sql, params) {
        return this.query(sql, params);
    }
    async transaction(fn) {
        return fn(this);
    }
    async createTask(task) {
        const taskId = `task_${Date.now()}`;
        this._logger.info(`Created task: ${taskId}`);
    }
    async getSwarmTasks(swarmId, status) {
        this._logger.info(`Getting tasks for swarm: ${swarmId}, status: ${status}`);
        return [];
    }
    async updateAgent(agentId, updates) {
        this._logger.info(`Updated agent: ${agentId}`);
    }
    async getMetrics(entityId, metricType) {
        this._logger.info(`Getting metrics for entity: ${entityId}, type: ${metricType}`);
        return [];
    }
    async updateTask(taskId, updates) {
        this._logger.info(`Updated task: ${taskId}`);
    }
};
SwarmDatabase = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Object])
], SwarmDatabase);
let AgentRegistry = class AgentRegistry {
    _logger;
    _eventBus;
    agents = new Map();
    constructor(_logger, _eventBus) {
        this._logger = _logger;
        this._eventBus = _eventBus;
    }
    async registerAgent(agent) {
        const id = `agent_${Date.now()}`;
        this.agents.set(id, agent);
        this._logger.info(`Agent registered: ${id}`);
        this._eventBus.emit('agent.registered', { id, agent });
    }
    async unregisterAgent(id) {
        const agent = this.agents.get(id);
        if (agent) {
            this.agents.delete(id);
            this._logger.info(`Agent unregistered: ${id}`);
            this._eventBus.emit('agent.unregistered', { id, agent });
        }
    }
    async getAgent(agentId) {
        return this.agents.get(agentId);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    async getActiveAgents() {
        return this.getAllAgents().filter((agent) => agent.status === 'active');
    }
    async findAvailableAgents(criteria) {
        return this.getAllAgents().filter((agent) => agent.status === 'available');
    }
};
AgentRegistry = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.EventBus)),
    __metadata("design:paramtypes", [Object, Object])
], AgentRegistry);
let SwarmCoordinatorImplementation = class SwarmCoordinatorImplementation {
    _logger;
    _config;
    _eventBus;
    _agentRegistry;
    isRunning = false;
    constructor(_logger, _config, _eventBus, _agentRegistry) {
        this._logger = _logger;
        this._config = _config;
        this._eventBus = _eventBus;
        this._agentRegistry = _agentRegistry;
    }
    async initializeSwarm(_options) {
        this._logger.info('Initializing swarm coordination...');
        const maxAgents = this._config.get('swarm.maxAgents') || 10;
        const topology = this._config.get('swarm.topology') || 'mesh';
        this._logger.info(`Swarm configuration: ${maxAgents} agents, ${topology} topology`);
        this._eventBus.on('agent.registered', (data) => {
            this._logger.info(`Swarm coordinator notified of new agent: ${data?.id}`);
        });
        this.isRunning = true;
        this._eventBus.emit('swarm.initialized', { maxAgents, topology });
    }
    async addAgent(agent) {
        const agentId = `agent_${Date.now()}`;
        await this._agentRegistry.registerAgent(agent);
        this._logger.info(`Added agent to swarm: ${agentId}`);
        return agentId;
    }
    async removeAgent(agentId) {
        await this._agentRegistry.unregisterAgent(agentId);
        this._logger.info(`Removed agent from swarm: ${agentId}`);
    }
    getSwarmStatus() {
        return {
            isRunning: this.isRunning,
            agentCount: this.getAllAgentCount(),
            timestamp: new Date().toISOString(),
        };
    }
    getAllAgentCount() {
        return this.getAllAgents().length;
    }
    getAllAgents() {
        return Array.from(this._agentRegistry.agents?.values() || []);
    }
    async assignTask(task) {
        const taskId = `task_${Date.now()}`;
        this._logger.info(`Assigning task ${taskId}`);
        return taskId;
    }
    getMetrics() {
        return {
            agentCount: this.getAllAgentCount(),
            isRunning: this.isRunning,
            uptime: Date.now(),
        };
    }
    async shutdown() {
        this.isRunning = false;
        this._logger.info('Swarm coordinator shutting down');
    }
};
SwarmCoordinatorImplementation = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.Config)),
    __param(2, inject(CORE_TOKENS.EventBus)),
    __param(3, inject(SWARM_TOKENS.AgentRegistry)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SwarmCoordinatorImplementation);
let NeuralNetworkTrainer = class NeuralNetworkTrainer {
    _logger;
    _config;
    constructor(_logger, _config) {
        this._logger = _logger;
        this._config = _config;
    }
    async trainModel(_data, options) {
        const learningRate = this._config.get('neural.learningRate') || 0.001;
        this._logger.info(`Training neural network with learning rate: ${learningRate}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const model = {
            id: `model_${Date.now()}`,
            accuracy: 0.95,
            epochs: options?.epochs || 100,
            learningRate,
        };
        this._logger.info(`Neural network training completed: ${model.id}`);
        return model;
    }
    async evaluateModel(model, _testData) {
        this._logger.info(`Evaluating model: ${model.id}`);
        await new Promise((resolve) => setTimeout(resolve, 200));
        const results = {
            accuracy: 0.92,
            precision: 0.94,
            recall: 0.91,
            f1Score: 0.925,
        };
        this._logger.info(`Model evaluation completed: ${JSON.stringify(results)}`);
        return results;
    }
    async createNetwork(config) {
        this._logger.info(`Creating neural network with config: ${JSON.stringify(config)}`);
        return `network_${Date.now()}`;
    }
    async trainNetwork(networkId, data) {
        this._logger.info(`Training network: ${networkId}`);
        return this.trainModel(data, {});
    }
    async evaluateNetwork(networkId, testData) {
        const model = { id: networkId };
        return this.evaluateModel(model, testData);
    }
    async saveModel(modelId, path) {
        this._logger.info(`Saving model ${modelId} to ${path}`);
    }
    async loadModel(path) {
        this._logger.info(`Loading model from ${path}`);
        return `loaded_model_${Date.now()}`;
    }
};
NeuralNetworkTrainer = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.Config)),
    __metadata("design:paramtypes", [Object, Object])
], NeuralNetworkTrainer);
export class CompleteSystemIntegration {
    container;
    constructor() {
        this.container = this.createContainer();
    }
    createContainer() {
        return (createContainerBuilder()
            .singleton(CORE_TOKENS.Logger, () => new ProductionLogger())
            .singleton(CORE_TOKENS.Config, () => new ConfigurationManager())
            .singleton(CORE_TOKENS.EventBus, (c) => new EnhancedEventBus(c.resolve(CORE_TOKENS.Logger)))
            .singleton(CORE_TOKENS.Database, (c) => new SwarmDatabase(c.resolve(CORE_TOKENS.Logger)))
            .singleton(SWARM_TOKENS.AgentRegistry, (c) => new AgentRegistry(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.EventBus)))
            .singleton(SWARM_TOKENS.SwarmCoordinator, (c) => new SwarmCoordinatorImplementation(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.Config), c.resolve(CORE_TOKENS.EventBus), c.resolve(SWARM_TOKENS.AgentRegistry)))
            .singleton(NEURAL_TOKENS.NetworkTrainer, (c) => new NeuralNetworkTrainer(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.Config)))
            .build());
    }
    async demonstrateIntegration() {
        const logger = this.container.resolve(CORE_TOKENS.Logger);
        logger.info('🚀 Starting complete system integration demonstration...');
        try {
            const database = this.container.resolve(CORE_TOKENS.Database);
            await database?.initialize?.();
            const swarmCoordinator = this.container.resolve(SWARM_TOKENS.SwarmCoordinator);
            await swarmCoordinator.initializeSwarm({
                name: 'integration-demo-swarm',
            });
            const agent1Id = await swarmCoordinator.addAgent({
                type: 'worker',
                capabilities: ['data-processing', 'analysis'],
            });
            const agent2Id = await swarmCoordinator.addAgent({
                type: 'coordinator',
                capabilities: ['task-distribution', 'monitoring'],
            });
            const swarmStatus = swarmCoordinator.getSwarmStatus();
            logger.info(`Swarm status: ${JSON.stringify(swarmStatus)}`);
            const neuralTrainer = this.container.resolve(NEURAL_TOKENS.NetworkTrainer);
            const trainingData = [
                { input: [0, 0], output: [0] },
                { input: [0, 1], output: [1] },
                { input: [1, 0], output: [1] },
                { input: [1, 1], output: [0] },
            ];
            const model = await neuralTrainer.trainNetwork('temp_network', trainingData);
            const _evaluation = await neuralTrainer.evaluateNetwork('temp_network', trainingData);
            await swarmCoordinator.removeAgent(agent1Id);
            await swarmCoordinator.removeAgent(agent2Id);
            logger.info('✅ Complete system integration demonstration completed successfully!');
            logger.info('   All services are working together through dependency injection');
        }
        catch (error) {
            logger.error(`❌ Integration demonstration failed: ${error}`);
            throw error;
        }
    }
    async cleanup() {
        const logger = this.container.resolve(CORE_TOKENS.Logger);
        logger.info('🧹 Cleaning up integration demonstration...');
        await this.container.dispose();
        logger.info('✅ Cleanup completed');
    }
}
export async function runCompleteIntegration() {
    const integration = new CompleteSystemIntegration();
    try {
        await integration.demonstrateIntegration();
    }
    finally {
        await integration.cleanup();
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    runCompleteIntegration().catch(console.error);
}
//# sourceMappingURL=complete-system-integration.js.map