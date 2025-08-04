/**
 * Complete DI Integration Example
 * Shows how to integrate the DI system with existing Claude Code Zen components
 */

// Mock existing SwarmCoordinator interface to show integration
interface ExistingSwarmOptions {
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  maxAgents: number;
  connectionDensity: number;
  syncInterval: number;
  wasmPath: string;
}

interface ExistingAgentConfig {
  id?: string;
  type: string;
  capabilities: string[];
  wasmAgentId?: number;
}

interface ExistingTask {
  id?: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  requiredCapabilities?: string[];
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedAgents?: string[];
  result?: any;
  error?: Error;
}

// 1. Simple token-based approach (no decorators needed initially)
const createSimpleEnhancedSystem: () => any = () => {
  // Define service contracts
  interface Logger {
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
  }

  interface Config {
    get<T>(key: string, defaultValue?: T): T;
  }

  interface AgentRegistry {
    register(agent: ExistingAgentConfig): Promise<string>;
    unregister(agentId: string): Promise<void>;
    findAvailable(criteria: any): Promise<ExistingAgentConfig[]>;
  }

  interface MessageBroker {
    publish(topic: string, message: any): Promise<void>;
    broadcast(message: any): Promise<void>;
  }

  // Enhanced SwarmCoordinator that accepts dependencies via constructor
  class DIEnhancedSwarmCoordinator {
    private agents = new Map<string, ExistingAgentConfig>();
    private tasks = new Map<string, ExistingTask>();
    private isInitialized = false;

    constructor(
      private logger: Logger,
      private config: Config,
      private agentRegistry: AgentRegistry,
      private messageBroker: MessageBroker
    ) {
      this.logger.info('DI-Enhanced SwarmCoordinator created');
    }

    async initializeSwarm(options: Partial<ExistingSwarmOptions>): Promise<void> {
      this.logger.info('Initializing swarm with DI', options);

      const defaultMaxAgents = this.config.get('swarm.maxAgents', 10);
      const topology = this.config.get('swarm.topology', 'mesh');

      this.logger.debug('Using configuration', { defaultMaxAgents, topology });
      this.isInitialized = true;
    }

    async addAgent(config: ExistingAgentConfig): Promise<string> {
      if (!this.isInitialized) {
        throw new Error('Swarm must be initialized first');
      }

      const agentId = await this.agentRegistry.register(config);
      this.agents.set(agentId, { ...config, id: agentId });

      await this.messageBroker.broadcast({
        type: 'agent_added',
        agentId,
        timestamp: Date.now(),
      });

      this.logger.info('Agent added successfully', { agentId });
      return agentId;
    }

    async assignTask(task: ExistingTask): Promise<string> {
      const taskId = `task-${Date.now()}`;
      const availableAgents = await this.agentRegistry.findAvailable({
        capabilities: task.requiredCapabilities || [],
      });

      if (availableAgents.length === 0) {
        throw new Error('No available agents for task');
      }

      const selectedAgent = availableAgents[0];
      const fullTask: ExistingTask = {
        ...task,
        id: taskId,
        status: 'assigned',
        assignedAgents: [selectedAgent.id!],
      };

      this.tasks.set(taskId, fullTask);

      await this.messageBroker.publish(`agent.${selectedAgent.id}`, {
        type: 'task_assignment',
        taskId,
        task: fullTask,
      });

      this.logger.info('Task assigned', { taskId, agentId: selectedAgent.id });
      return taskId;
    }

    getMetrics() {
      return {
        totalAgents: this.agents.size,
        totalTasks: this.tasks.size,
        completedTasks: Array.from(this.tasks.values()).filter((t) => t.status === 'completed')
          .length,
        timestamp: Date.now(),
      };
    }
  }

  // Simple implementations
  class SimpleLogger implements Logger {
    info(_message: string, _meta?: any): void {}
    debug(_message: string, _meta?: any): void {}
    error(_message: string, _meta?: any): void {}
  }

  class SimpleConfig implements Config {
    private data = new Map([
      ['swarm.maxAgents', 15],
      ['swarm.topology', 'hierarchical'],
      ['app.environment', 'development'],
    ]);

    get<T>(key: string, defaultValue?: T): T {
      return this.data.has(key) ? this.data.get(key) : defaultValue;
    }
  }

  class SimpleAgentRegistry implements AgentRegistry {
    private agents = new Map<string, ExistingAgentConfig>();

    async register(agent: ExistingAgentConfig): Promise<string> {
      const agentId = agent.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      this.agents.set(agentId, { ...agent, id: agentId });
      return agentId;
    }

    async unregister(agentId: string): Promise<void> {
      this.agents.delete(agentId);
    }

    async findAvailable(criteria: any): Promise<ExistingAgentConfig[]> {
      return Array.from(this.agents.values()).filter((agent) => {
        if (criteria.capabilities) {
          return criteria.capabilities.every((cap: string) => agent.capabilities.includes(cap));
        }
        return true;
      });
    }
  }

  class SimpleMessageBroker implements MessageBroker {
    async publish(_topic: string, _message: any): Promise<void> {}

    async broadcast(_message: any): Promise<void> {}
  }

  // Manual DI container setup
  const services = {
    logger: new SimpleLogger(),
    config: new SimpleConfig(),
    agentRegistry: new SimpleAgentRegistry(),
    messageBroker: new SimpleMessageBroker(),
  };

  const coordinator = new DIEnhancedSwarmCoordinator(
    services.logger,
    services.config,
    services.agentRegistry,
    services.messageBroker
  );

  return { coordinator, services };
};

// 2. Demonstrate the enhanced system
const demonstrateSimpleSystem = async () => {
  const { coordinator } = createSimpleEnhancedSystem();

  try {
    // Initialize swarm
    await coordinator.initializeSwarm({
      topology: 'hierarchical',
      maxAgents: 20,
    });

    // Add agents
    const _agent1Id = await coordinator.addAgent({
      type: 'worker',
      capabilities: ['data-processing', 'file-io'],
    });

    const _agent2Id = await coordinator.addAgent({
      type: 'coordinator',
      capabilities: ['task-management', 'coordination'],
    });

    // Assign a task
    const _taskId = await coordinator.assignTask({
      type: 'data-processing',
      description: 'Process dataset',
      priority: 'high',
      requiredCapabilities: ['data-processing'],
    });

    // Get metrics
    const _metrics = coordinator.getMetrics();
  } catch (error) {
    console.error('❌ Error in demonstration:', error);
  }
};

// 3. Show how this integrates with the full DI system
const demonstrateFullDIIntegration = () => {};

// 4. Performance demonstration
const demonstratePerformance = () => {
  const { coordinator, services } = createSimpleEnhancedSystem();

  // Test resolution performance
  const iterations = 1000;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    // Simulate service resolution
    const _testCoordinator = new (coordinator.constructor as any)(
      services.logger,
      services.config,
      services.agentRegistry,
      services.messageBroker
    );
  }

  const endTime = Date.now();
  const _duration = endTime - startTime;
};

// 5. Testing strategy demonstration
const demonstrateTestingStrategy = () => {};

// Run all demonstrations
async function runCompleteDemo() {
  try {
    await demonstrateSimpleSystem();
    demonstrateFullDIIntegration();
    demonstratePerformance();
    demonstrateTestingStrategy();
  } catch (error) {
    console.error('💥 Demo failed:', error);
    process.exit(1);
  }
}

// Export for testing
export { createSimpleEnhancedSystem, demonstrateSimpleSystem, runCompleteDemo };

// Run if called directly (ES module check)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runCompleteDemo();
}
