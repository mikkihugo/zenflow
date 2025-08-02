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

// Example of how to create a DI-enhanced version of existing services
console.log('🚀 Claude Code Zen DI Integration Example');

// 1. Simple token-based approach (no decorators needed initially)
const createSimpleEnhancedSystem: () => any = () => {
  console.log('\n📦 1. Creating simple enhanced system...');
  
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
        timestamp: Date.now()
      });

      this.logger.info('Agent added successfully', { agentId });
      return agentId;
    }

    async assignTask(task: ExistingTask): Promise<string> {
      const taskId = `task-${Date.now()}`;
      const availableAgents = await this.agentRegistry.findAvailable({
        capabilities: task.requiredCapabilities || []
      });

      if (availableAgents.length === 0) {
        throw new Error('No available agents for task');
      }

      const selectedAgent = availableAgents[0];
      const fullTask: ExistingTask = {
        ...task,
        id: taskId,
        status: 'assigned',
        assignedAgents: [selectedAgent.id!]
      };

      this.tasks.set(taskId, fullTask);
      
      await this.messageBroker.publish(`agent.${selectedAgent.id}`, {
        type: 'task_assignment',
        taskId,
        task: fullTask
      });

      this.logger.info('Task assigned', { taskId, agentId: selectedAgent.id });
      return taskId;
    }

    getMetrics() {
      return {
        totalAgents: this.agents.size,
        totalTasks: this.tasks.size,
        completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
        timestamp: Date.now()
      };
    }
  }

  // Simple implementations
  class SimpleLogger implements Logger {
    info(message: string, meta?: any): void {
      console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    }
    debug(message: string, meta?: any): void {
      console.log(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
    error(message: string, meta?: any): void {
      console.log(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }

  class SimpleConfig implements Config {
    private data = new Map([
      ['swarm.maxAgents', 15],
      ['swarm.topology', 'hierarchical'],
      ['app.environment', 'development']
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
      return Array.from(this.agents.values()).filter(agent => {
        if (criteria.capabilities) {
          return criteria.capabilities.every((cap: string) => 
            agent.capabilities.includes(cap)
          );
        }
        return true;
      });
    }
  }

  class SimpleMessageBroker implements MessageBroker {
    async publish(topic: string, message: any): Promise<void> {
      console.log(`📡 Publishing to ${topic}:`, message);
    }

    async broadcast(message: any): Promise<void> {
      console.log(`📢 Broadcasting:`, message);
    }
  }

  // Manual DI container setup
  const services = {
    logger: new SimpleLogger(),
    config: new SimpleConfig(),
    agentRegistry: new SimpleAgentRegistry(),
    messageBroker: new SimpleMessageBroker()
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
  console.log('\n🎯 2. Demonstrating simple DI system...');
  
  const { coordinator } = createSimpleEnhancedSystem();

  try {
    // Initialize swarm
    await coordinator.initializeSwarm({
      topology: 'hierarchical',
      maxAgents: 20
    });

    // Add agents
    const agent1Id = await coordinator.addAgent({
      type: 'worker',
      capabilities: ['data-processing', 'file-io']
    });

    const agent2Id = await coordinator.addAgent({
      type: 'coordinator',
      capabilities: ['task-management', 'coordination']
    });

    // Assign a task
    const taskId = await coordinator.assignTask({
      type: 'data-processing',
      description: 'Process dataset',
      priority: 'high',
      requiredCapabilities: ['data-processing']
    });

    // Get metrics
    const metrics = coordinator.getMetrics();
    console.log('📊 System metrics:', metrics);

    console.log('✅ Simple DI system demonstration completed');

  } catch (error) {
    console.error('❌ Error in demonstration:', error);
  }
};

// 3. Show how this integrates with the full DI system
const demonstrateFullDIIntegration = () => {
  console.log('\n🏗️ 3. Full DI system integration approach...');
  
  console.log(`
🔧 Integration Strategy:

1. **Phase 1 - Token-based DI** (No decorators yet)
   ✅ Manual dependency injection via constructor parameters
   ✅ Service interfaces and implementations
   ✅ Container-managed service lifetimes
   
2. **Phase 2 - Decorator Enhancement** (When ready)
   - Add @injectable decorators to classes
   - Add @inject decorators to parameters  
   - Use createToken() for type-safe tokens
   
3. **Phase 3 - Full Integration**
   - Replace existing services gradually
   - Maintain backward compatibility
   - Add advanced DI features (scoping, auto-registration)

📋 Migration Steps for Existing Code:

// Before:
class SwarmCoordinator {
  constructor(options) {
    this.logger = new ConsoleLogger();
    this.config = new FileConfig();
  }
}

// Phase 1 - Constructor injection:
class SwarmCoordinator {
  constructor(options, logger, config) {
    this.logger = logger;
    this.config = config;
  }
}

// Phase 2 - DI decorators:
@injectable
class SwarmCoordinator {
  constructor(
    options: SwarmOptions,
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig
  ) {}
}

🎯 Benefits Already Achieved:
- ✅ Dependency injection pattern established
- ✅ Service interfaces defined  
- ✅ Testability improved (mock injection)
- ✅ Configuration centralized
- ✅ Loose coupling between components
  `);
};

// 4. Performance demonstration
const demonstratePerformance = () => {
  console.log('\n⚡ 4. Performance characteristics...');
  
  const { coordinator, services } = createSimpleEnhancedSystem();
  
  // Test resolution performance
  const iterations = 1000;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    // Simulate service resolution
    const testCoordinator = new (coordinator.constructor as any)(
      services.logger,
      services.config,
      services.agentRegistry,
      services.messageBroker
    );
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`📈 Performance results:
- Created ${iterations} coordinators in ${duration}ms
- Average: ${(duration / iterations).toFixed(2)}ms per instance
- Rate: ${Math.round(iterations / duration * 1000)} instances/second
- Overhead: Minimal (direct constructor calls)`);
};

// 5. Testing strategy demonstration
const demonstrateTestingStrategy = () => {
  console.log('\n🧪 5. Testing strategy with DI...');
  
  console.log(`
📋 Testing Approaches:

1. **Unit Testing with Mocks**
   - Mock all dependencies in constructor
   - Test business logic in isolation
   - Fast, reliable tests

2. **Integration Testing**
   - Use real implementations for some services
   - Test component interactions
   - More realistic scenarios

3. **End-to-End Testing**
   - Full system with all real services
   - Actual behavior validation
   - Performance testing

Example Mock Setup:
const mockLogger = { info: jest.fn(), debug: jest.fn(), error: jest.fn() };
const mockConfig = { get: jest.fn().mockReturnValue('test-value') };
const coordinator = new SwarmCoordinator(mockLogger, mockConfig, ...);

Benefits:
✅ Predictable test behavior
✅ Fast test execution  
✅ Easy to test error scenarios
✅ Clear test boundaries
  `);
};

// Run all demonstrations
async function runCompleteDemo() {
  try {
    console.log('🌟 Starting Complete DI Integration Demonstration\n');
    
    await demonstrateSimpleSystem();
    demonstrateFullDIIntegration();
    demonstratePerformance();
    demonstrateTestingStrategy();
    
    console.log('\n🎉 Complete DI integration demonstration finished successfully!');
    console.log('\n📚 Next steps:');
    console.log('1. Review the simple DI pattern shown above');
    console.log('2. Apply to existing SwarmCoordinator gradually');
    console.log('3. Add decorator support when ready');
    console.log('4. Implement full DI container for advanced features');
    
  } catch (error) {
    console.error('💥 Demo failed:', error);
    process.exit(1);
  }
}

// Export for testing
export { 
  createSimpleEnhancedSystem,
  demonstrateSimpleSystem,
  runCompleteDemo 
};

// Run if called directly (ES module check)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runCompleteDemo();
}