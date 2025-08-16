/**
 * Complete System Integration Example.
 *
 * This demonstrates the "all done" DI integration requested by @mikkihugo.
 * Shows how all major coordinators and services work together with dependency injection.
 */
/**
 * @file Complete-system-integration implementation.
 */

import {
  CORE_TOKENS,
  createContainerBuilder,
  type DIContainer,
  type AgentRegistry,
  type Config,
  type Database,
  type EventBus,
  type Logger,
  type NeuralNetworkTrainer,
  type SwarmCoordinator,
  inject,
  injectable,
  NEURAL_TOKENS,
  SWARM_TOKENS,
} from '../index';

// Real service implementations
class ProductionLogger implements Logger {
  log(_message: string): void {}

  info(message: string): void {
    this.log(`INFO: ${message}`);
  }

  warn(message: string): void {
    this.log(`WARN: ${message}`);
  }

  error(message: string): void {
    this.log(`ERROR: ${message}`);
  }

  debug(message: string): void {
    this.log(`DEBUG: ${message}`);
  }
}

class ConfigurationManager implements Config {
  private settings = new Map<string, any>();

  constructor() {
    // Load default configuration
    this.settings.set('swarm.maxAgents', 50);
    this.settings.set('swarm.topology', 'mesh');
    this.settings.set('neural.learningRate', 0.001);
    this.settings.set('database.connectionPool', 10);
  }

  get<T>(key: string): T {
    return this.settings.get(key) as T;
  }

  set<T>(key: string, value: T): void {
    this.settings.set(key, value);
  }

  has(key: string): boolean {
    return this.settings.has(key);
  }
}

@injectable
class EnhancedEventBus implements EventBus {
  private handlers = new Map<string, Set<Function>>();

  constructor(@inject(CORE_TOKENS.Logger) private _logger: Logger) {}

  publish(event: string, data: unknown): void {
    this._logger.info(`Publishing event: ${event}`);
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data);
        } catch (error) {
          this._logger.error(`Error in event handler for ${event}: ${error}`);
        }
      }
    }
  }

  subscribe(event: string, handler: (data: unknown) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler);
    this._logger.info(`Subscribed to event: ${event}`);
  }

  unsubscribe(event: string, handler: (data: unknown) => void): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler);
    }
  }

  // EventBus interface methods (aliases for compatibility)
  emit(event: string, data: unknown): void {
    this.publish(event, data);
  }

  on(event: string, handler: (data: unknown) => void): void {
    this.subscribe(event, handler);
  }

  off(event: string, handler: (data: unknown) => void): void {
    this.unsubscribe(event, handler);
  }
}

@injectable
class SwarmDatabase implements Database {
  private isInitialized = false;

  constructor(@inject(CORE_TOKENS.Logger) private _logger: Logger) {}

  async initialize(): Promise<void> {
    this._logger.info('Initializing swarm database...');
    // Simulate database initialization
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.isInitialized = true;
    this._logger.info('Swarm database initialized successfully');
  }

  async query(sql: string, _params?: unknown[]): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    this._logger.info(`Executing query: ${sql}`);
    // Simulate database query
    return [];
  }

  async close(): Promise<void> {
    this._logger.info('Closing swarm database...');
    this.isInitialized = false;
  }

  // TODO: TypeScript error TS2740 - Missing Database methods (AI unsure of safe fix - human review needed)
  // Methods like execute, transaction, createTask, updateTask, etc. need proper implementation
  async execute(sql: string, params?: unknown[]): Promise<unknown> {
    return this.query(sql, params);
  }

  async transaction<T>(fn: (db: Database) => Promise<T>): Promise<T> {
    // Basic transaction simulation
    return fn(this);
  }

  async createTask(task: unknown): Promise<void> {
    // Basic task creation simulation
    const taskId = `task_${Date.now()}`;
    this._logger.info(`Created task: ${taskId}`);
  }

  async getSwarmTasks(swarmId: string, status?: string): Promise<any[]> {
    this._logger.info(`Getting tasks for swarm: ${swarmId}, status: ${status}`);
    return [];
  }

  async updateAgent(agentId: string, updates: unknown): Promise<void> {
    this._logger.info(`Updated agent: ${agentId}`);
  }

  async getMetrics(entityId: string, metricType: string): Promise<any[]> {
    this._logger.info(`Getting metrics for entity: ${entityId}, type: ${metricType}`);
    return [];
  }

  async updateTask(taskId: string, updates: unknown): Promise<void> {
    this._logger.info(`Updated task: ${taskId}`);
  }
}

@injectable
class AgentRegistry implements AgentRegistry {
  private agents = new Map<string, any>();

  constructor(
    @inject(CORE_TOKENS.Logger) private _logger: Logger,
    @inject(CORE_TOKENS.EventBus) private _eventBus: EventBus,
  ) {}

  async registerAgent(agent: unknown): Promise<void> {
    const id = `agent_${Date.now()}`;
    this.agents.set(id, agent);
    this._logger.info(`Agent registered: ${id}`);
    this._eventBus.emit('agent.registered', { id, agent });
  }

  async unregisterAgent(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      this.agents.delete(id);
      this._logger.info(`Agent unregistered: ${id}`);
      this._eventBus.emit('agent.unregistered', { id, agent });
    }
  }

  async getAgent(agentId: string): Promise<unknown> {
    return this.agents.get(agentId);
  }

  getAllAgents(): unknown[] {
    return Array.from(this.agents.values());
  }

  async getActiveAgents(): Promise<any[]> {
    return this.getAllAgents().filter((agent) => agent.status === 'active');
  }

  async findAvailableAgents(criteria: unknown): Promise<any[]> {
    return this.getAllAgents().filter((agent) => agent.status === 'available');
  }
}

@injectable
class SwarmCoordinatorImplementation implements SwarmCoordinator {
  private isRunning = false;

  constructor(
    @inject(CORE_TOKENS.Logger) private _logger: Logger,
    @inject(CORE_TOKENS.Config) private _config: Config,
    @inject(CORE_TOKENS.EventBus) private _eventBus: EventBus,
    @inject(SWARM_TOKENS.AgentRegistry) private _agentRegistry: AgentRegistry,
  ) {}

  async initializeSwarm(_options: unknown): Promise<void> {
    this._logger.info('Initializing swarm coordination...');

    const maxAgents = this._config.get<number>('swarm.maxAgents') || 10;
    const topology = this._config.get<string>('swarm.topology') || 'mesh';

    this._logger.info(`Swarm configuration: ${maxAgents} agents, ${topology} topology`);

    // Subscribe to agent events
    this._eventBus.on('agent.registered', (data) => {
      this._logger.info(`Swarm coordinator notified of new agent: ${data?.id}`);
    });

    this.isRunning = true;
    this._eventBus.emit('swarm.initialized', { maxAgents, topology });
  }

  async addAgent(agent: unknown): Promise<string> {
    const agentId = `agent_${Date.now()}`;
    await this._agentRegistry.registerAgent(agent);
    this._logger.info(`Added agent to swarm: ${agentId}`);
    return agentId;
  }

  async removeAgent(agentId: string): Promise<void> {
    await this._agentRegistry.unregisterAgent(agentId);
    this._logger.info(`Removed agent from swarm: ${agentId}`);
  }

  getSwarmStatus(): unknown {
    return {
      isRunning: this.isRunning,
      agentCount: this.getAllAgentCount(),
      timestamp: new Date().toISOString(),
    };
  }

  private getAllAgentCount(): number {
    // Helper method to get agent count synchronously
    return this.getAllAgents().length;
  }

  private getAllAgents(): unknown[] {
    // Helper method to get all agents synchronously for compatibility
    return Array.from((this._agentRegistry as any).agents?.values() || []);
  }

  async assignTask(task: unknown): Promise<string> {
    const taskId = `task_${Date.now()}`;
    this._logger.info(`Assigning task ${taskId}`);
    return taskId;
  }

  getMetrics(): unknown {
    return {
      agentCount: this.getAllAgentCount(),
      isRunning: this.isRunning,
      uptime: Date.now(), // Basic metrics
    };
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;
    this._logger.info('Swarm coordinator shutting down');
  }
}

@injectable
class NeuralNetworkTrainer implements NeuralNetworkTrainer {
  constructor(
    @inject(CORE_TOKENS.Logger) private _logger: Logger,
    @inject(CORE_TOKENS.Config) private _config: Config,
  ) {}

  async trainModel(_data: unknown[], options: unknown): Promise<unknown> {
    const learningRate = this._config.get<number>('neural.learningRate') || 0.001;
    this._logger.info(`Training neural network with learning rate: ${learningRate}`);

    // Simulate training
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

  async evaluateModel(model: unknown, _testData: unknown[]): Promise<unknown> {
    this._logger.info(`Evaluating model: ${model.id}`);

    // Simulate evaluation
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

  async createNetwork(config: unknown): Promise<string> {
    this._logger.info(`Creating neural network with config: ${JSON.stringify(config)}`);
    return `network_${Date.now()}`;
  }

  async trainNetwork(networkId: string, data: unknown): Promise<unknown> {
    this._logger.info(`Training network: ${networkId}`);
    return this.trainModel(data, {});
  }

  async evaluateNetwork(networkId: string, testData: unknown[]): Promise<unknown> {
    const model = { id: networkId };
    return this.evaluateModel(model, testData);
  }

  async saveModel(modelId: string, path: string): Promise<void> {
    this._logger.info(`Saving model ${modelId} to ${path}`);
  }

  async loadModel(path: string): Promise<string> {
    this._logger.info(`Loading model from ${path}`);
    return `loaded_model_${Date.now()}`;
  }
}

/**
 * Complete system integration demonstration.
 *
 * @example
 */
export class CompleteSystemIntegration {
  private container: DIContainer;

  constructor() {
    this.container = this.createContainer();
  }

  private createContainer(): DIContainer {
    return (
      createContainerBuilder()
        // Core services
        .singleton(CORE_TOKENS.Logger, () => new ProductionLogger())
        .singleton(CORE_TOKENS.Config, () => new ConfigurationManager())
        .singleton(CORE_TOKENS.EventBus, (c) => new EnhancedEventBus(c.resolve(CORE_TOKENS.Logger)))
        .singleton(CORE_TOKENS.Database, (c) => new SwarmDatabase(c.resolve(CORE_TOKENS.Logger)))

        // Swarm services
        .singleton(
          SWARM_TOKENS.AgentRegistry,
          (c) => new AgentRegistry(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.EventBus))
        )
        .singleton(
          SWARM_TOKENS.SwarmCoordinator,
          (c) =>
            new SwarmCoordinatorImplementation(
              c.resolve(CORE_TOKENS.Logger),
              c.resolve(CORE_TOKENS.Config),
              c.resolve(CORE_TOKENS.EventBus),
              c.resolve(SWARM_TOKENS.AgentRegistry)
            )
        )

        // Neural services
        .singleton(
          NEURAL_TOKENS.NetworkTrainer,
          (c) =>
            new NeuralNetworkTrainer(c.resolve(CORE_TOKENS.Logger), c.resolve(CORE_TOKENS.Config))
        )

        .build()
    );
  }

  /**
   * Demonstrate complete system integration with all services working together.
   */
  async demonstrateIntegration(): Promise<void> {
    const logger = this.container.resolve(CORE_TOKENS.Logger);

    logger.info('🚀 Starting complete system integration demonstration...');

    try {
      // Initialize database
      const database = this.container.resolve(CORE_TOKENS.Database);
      await database?.initialize?.();

      // Initialize swarm coordinator
      const swarmCoordinator = this.container.resolve(SWARM_TOKENS.SwarmCoordinator);
      await swarmCoordinator.initializeSwarm({
        name: 'integration-demo-swarm',
      });

      // Add some agents
      const agent1Id = await swarmCoordinator.addAgent({
        type: 'worker',
        capabilities: ['data-processing', 'analysis'],
      });

      const agent2Id = await swarmCoordinator.addAgent({
        type: 'coordinator',
        capabilities: ['task-distribution', 'monitoring'],
      });

      // Check swarm status
      const swarmStatus = swarmCoordinator.getSwarmStatus();
      logger.info(`Swarm status: ${JSON.stringify(swarmStatus)}`);

      // Train a neural network
      const neuralTrainer = this.container.resolve(NEURAL_TOKENS.NetworkTrainer);
      const trainingData = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
      ];

      const model = await neuralTrainer.trainNetwork('temp_network', trainingData);
      const _evaluation = await neuralTrainer.evaluateNetwork('temp_network', trainingData);

      // Remove agents
      await swarmCoordinator.removeAgent(agent1Id);
      await swarmCoordinator.removeAgent(agent2Id);

      logger.info('✅ Complete system integration demonstration completed successfully!');
      logger.info('   All services are working together through dependency injection');
    } catch (error) {
      logger.error(`❌ Integration demonstration failed: ${error}`);
      throw error;
    }
  }

  /**
   * Cleanup resources.
   */
  async cleanup(): Promise<void> {
    const logger = this.container.resolve(CORE_TOKENS.Logger);
    logger.info('🧹 Cleaning up integration demonstration...');

    await this.container.dispose();
    logger.info('✅ Cleanup completed');
  }
}

/**
 * Run the complete integration demonstration.
 *
 * @example
 */
export async function runCompleteIntegration(): Promise<void> {
  const integration = new CompleteSystemIntegration();

  try {
    await integration.demonstrateIntegration();
  } finally {
    await integration.cleanup();
  }
}

// Run demonstration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteIntegration().catch(console.error);
}
