/**
 * Complete System Integration Example
 * 
 * This demonstrates the "all done" DI integration requested by @mikkihugo.
 * Shows how all major coordinators and services work together with dependency injection.
 */

import { 
  DIContainer,
  createContainerBuilder,
  createToken,
  CORE_TOKENS,
  SWARM_TOKENS,
  NEURAL_TOKENS,
  injectable,
  inject,
  type ILogger,
  type IConfig,
  type IEventBus,
  type IDatabase,
  type ISwarmCoordinator,
  type IAgentRegistry,
  type INeuralNetworkTrainer
} from '../index.js';

// Real service implementations
class ProductionLogger implements ILogger {
  log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
  
  info(message: string): void {
    this.log(`INFO: ${message}`);
  }
  
  warn(message: string): void {
    this.log(`WARN: ${message}`);
  }
  
  error(message: string): void {
    this.log(`ERROR: ${message}`);
  }
}

class ConfigurationManager implements IConfig {
  private settings = new Map<string, any>();
  
  constructor() {
    // Load default configuration
    this.settings.set('swarm.maxAgents', 50);
    this.settings.set('swarm.topology', 'mesh');
    this.settings.set('neural.learningRate', 0.001);
    this.settings.set('database.connectionPool', 10);
  }
  
  get<T>(key: string): T | undefined {
    return this.settings.get(key);
  }
  
  set<T>(key: string, value: T): void {
    this.settings.set(key, value);
  }
  
  has(key: string): boolean {
    return this.settings.has(key);
  }
}

@injectable
class EnhancedEventBus implements IEventBus {
  private handlers = new Map<string, Set<Function>>();
  
  constructor(@inject(CORE_TOKENS.Logger) private logger: ILogger) {}
  
  publish(event: string, data: any): void {
    this.logger.info(`Publishing event: ${event}`);
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data);
        } catch (error) {
          this.logger.error(`Error in event handler for ${event}: ${error}`);
        }
      }
    }
  }
  
  subscribe(event: string, handler: (data: any) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    this.logger.info(`Subscribed to event: ${event}`);
  }
  
  unsubscribe(event: string, handler: (data: any) => void): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler);
    }
  }
}

@injectable
class SwarmDatabase implements IDatabase {
  private isInitialized = false;
  
  constructor(@inject(CORE_TOKENS.Logger) private logger: ILogger) {}
  
  async initialize(): Promise<void> {
    this.logger.info('Initializing swarm database...');
    // Simulate database initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    this.isInitialized = true;
    this.logger.info('Swarm database initialized successfully');
  }
  
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    this.logger.info(`Executing query: ${sql}`);
    // Simulate database query
    return [];
  }
  
  async close(): Promise<void> {
    this.logger.info('Closing swarm database...');
    this.isInitialized = false;
  }
}

@injectable
class AgentRegistry implements IAgentRegistry {
  private agents = new Map<string, any>();
  
  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.EventBus) private eventBus: IEventBus
  ) {}
  
  async registerAgent(id: string, agent: any): Promise<void> {
    this.agents.set(id, agent);
    this.logger.info(`Agent registered: ${id}`);
    this.eventBus.publish('agent.registered', { id, agent });
  }
  
  async unregisterAgent(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      this.agents.delete(id);
      this.logger.info(`Agent unregistered: ${id}`);
      this.eventBus.publish('agent.unregistered', { id, agent });
    }
  }
  
  getAgent(id: string): any | undefined {
    return this.agents.get(id);
  }
  
  getAllAgents(): any[] {
    return Array.from(this.agents.values());
  }
}

@injectable
class SwarmCoordinatorImplementation implements ISwarmCoordinator {
  private isRunning = false;
  
  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig,
    @inject(CORE_TOKENS.EventBus) private eventBus: IEventBus,
    @inject(SWARM_TOKENS.AgentRegistry) private agentRegistry: IAgentRegistry
  ) {}
  
  async initializeSwarm(options: any): Promise<void> {
    this.logger.info('Initializing swarm coordination...');
    
    const maxAgents = this.config.get<number>('swarm.maxAgents') || 10;
    const topology = this.config.get<string>('swarm.topology') || 'mesh';
    
    this.logger.info(`Swarm configuration: ${maxAgents} agents, ${topology} topology`);
    
    // Subscribe to agent events
    this.eventBus.subscribe('agent.registered', (data) => {
      this.logger.info(`Swarm coordinator notified of new agent: ${data.id}`);
    });
    
    this.isRunning = true;
    this.eventBus.publish('swarm.initialized', { maxAgents, topology });
  }
  
  async addAgent(agent: any): Promise<string> {
    const agentId = `agent_${Date.now()}`;
    await this.agentRegistry.registerAgent(agentId, agent);
    this.logger.info(`Added agent to swarm: ${agentId}`);
    return agentId;
  }
  
  async removeAgent(agentId: string): Promise<void> {
    await this.agentRegistry.unregisterAgent(agentId);
    this.logger.info(`Removed agent from swarm: ${agentId}`);
  }
  
  getSwarmStatus(): any {
    return {
      isRunning: this.isRunning,
      agentCount: this.agentRegistry.getAllAgents().length,
      timestamp: new Date().toISOString()
    };
  }
}

@injectable
class NeuralNetworkTrainer implements INeuralNetworkTrainer {
  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig
  ) {}
  
  async trainModel(data: any[], options: any): Promise<any> {
    const learningRate = this.config.get<number>('neural.learningRate') || 0.001;
    this.logger.info(`Training neural network with learning rate: ${learningRate}`);
    
    // Simulate training
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const model = {
      id: `model_${Date.now()}`,
      accuracy: 0.95,
      epochs: options.epochs || 100,
      learningRate
    };
    
    this.logger.info(`Neural network training completed: ${model.id}`);
    return model;
  }
  
  async evaluateModel(model: any, testData: any[]): Promise<any> {
    this.logger.info(`Evaluating model: ${model.id}`);
    
    // Simulate evaluation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const results = {
      accuracy: 0.92,
      precision: 0.94,
      recall: 0.91,
      f1Score: 0.925
    };
    
    this.logger.info(`Model evaluation completed: ${JSON.stringify(results)}`);
    return results;
  }
}

/**
 * Complete system integration demonstration
 */
export class CompleteSystemIntegration {
  private container: DIContainer;
  
  constructor() {
    this.container = this.createContainer();
  }
  
  private createContainer(): DIContainer {
    return createContainerBuilder()
      // Core services
      .singleton(CORE_TOKENS.Logger, () => new ProductionLogger())
      .singleton(CORE_TOKENS.Config, () => new ConfigurationManager())
      .singleton(CORE_TOKENS.EventBus, c => new EnhancedEventBus(c.resolve(CORE_TOKENS.Logger)))
      .singleton(CORE_TOKENS.Database, c => new SwarmDatabase(c.resolve(CORE_TOKENS.Logger)))
      
      // Swarm services
      .singleton(SWARM_TOKENS.AgentRegistry, c => new AgentRegistry(
        c.resolve(CORE_TOKENS.Logger),
        c.resolve(CORE_TOKENS.EventBus)
      ))
      .singleton(SWARM_TOKENS.SwarmCoordinator, c => new SwarmCoordinatorImplementation(
        c.resolve(CORE_TOKENS.Logger),
        c.resolve(CORE_TOKENS.Config),
        c.resolve(CORE_TOKENS.EventBus),
        c.resolve(SWARM_TOKENS.AgentRegistry)
      ))
      
      // Neural services
      .singleton(NEURAL_TOKENS.NetworkTrainer, c => new NeuralNetworkTrainer(
        c.resolve(CORE_TOKENS.Logger),
        c.resolve(CORE_TOKENS.Config)
      ))
      
      .build();
  }
  
  /**
   * Demonstrate complete system integration with all services working together
   */
  async demonstrateIntegration(): Promise<void> {
    const logger = this.container.resolve(CORE_TOKENS.Logger);
    
    logger.info('🚀 Starting complete system integration demonstration...');
    
    try {
      // Initialize database
      const database = this.container.resolve(CORE_TOKENS.Database);
      await database.initialize();
      
      // Initialize swarm coordinator
      const swarmCoordinator = this.container.resolve(SWARM_TOKENS.SwarmCoordinator);
      await swarmCoordinator.initializeSwarm({
        name: 'integration-demo-swarm'
      });
      
      // Add some agents
      const agent1Id = await swarmCoordinator.addAgent({
        type: 'worker',
        capabilities: ['data-processing', 'analysis']
      });
      
      const agent2Id = await swarmCoordinator.addAgent({
        type: 'coordinator',
        capabilities: ['task-distribution', 'monitoring']
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
        { input: [1, 1], output: [0] }
      ];
      
      const model = await neuralTrainer.trainModel(trainingData, { epochs: 100 });
      const evaluation = await neuralTrainer.evaluateModel(model, trainingData);
      
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
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    const logger = this.container.resolve(CORE_TOKENS.Logger);
    logger.info('🧹 Cleaning up integration demonstration...');
    
    await this.container.dispose();
    logger.info('✅ Cleanup completed');
  }
}

/**
 * Run the complete integration demonstration
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