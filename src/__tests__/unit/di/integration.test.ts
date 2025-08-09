/**
 * Integration tests for the complete DI system
 * Tests real-world usage scenarios and performance
 */

import {
  createSwarmContainer,
  demonstrateSwarmDI,
  EnhancedSwarmCoordinator,
  MockAgentRegistry,
  MockConfig,
  MockLogger,
  MockMessageBroker,
} from '../../../di/examples/swarm-integration';
import {
  CORE_TOKENS,
  clearGlobalContainer,
  createContainerBuilder,
  DIContainer,
  getGlobalContainer,
  SWARM_TOKENS,
  setGlobalContainer,
} from '../../../di/index';

describe('DI System Integration Tests', () => {
  beforeEach(() => {
    clearGlobalContainer();
  });

  afterEach(() => {
    clearGlobalContainer();
  });

  describe('Container Builder Pattern', () => {
    it('should create a container using builder pattern', () => {
      const container = createContainerBuilder()
        .singleton(CORE_TOKENS.Logger, () => new MockLogger())
        .singleton(CORE_TOKENS.Config, () => new MockConfig({ env: 'test' }))
        .transient(SWARM_TOKENS["MessageBroker"], () => new MockMessageBroker())
        .build();

      const logger = container.resolve(CORE_TOKENS.Logger);
      const config = container.resolve(CORE_TOKENS.Config);
      const broker1 = container.resolve(SWARM_TOKENS["MessageBroker"]);
      const broker2 = container.resolve(SWARM_TOKENS["MessageBroker"]);

      expect(logger).toBeInstanceOf(MockLogger);
      expect(config).toBeInstanceOf(MockConfig);
      expect(config?.["get"]('env')).toBe('test');
      expect(broker1).toBeInstanceOf(MockMessageBroker);
      expect(broker2).toBeInstanceOf(MockMessageBroker);
      expect(broker1).not.toBe(broker2); // Different instances (transient)
    });
  });

  describe('Global Container Management', () => {
    it('should manage global container instance', () => {
      // Initially no global container
      expect(() => getGlobalContainer()).not.toThrow();

      // Set custom global container
      const customContainer = new DIContainer();
      setGlobalContainer(customContainer);

      expect(getGlobalContainer()).toBe(customContainer);

      // Clear global container
      clearGlobalContainer();

      // Getting again should create new instance
      const newContainer = getGlobalContainer();
      expect(newContainer).not.toBe(customContainer);
    });
  });

  describe('Complete Swarm Integration', () => {
    let container: DIContainer;

    beforeEach(() => {
      container = createSwarmContainer({
        'swarm.maxAgents': 5,
        'swarm.topology': 'mesh',
        'test.mode': true,
      });
    });

    afterEach(async () => {
      await container.dispose();
    });

    it('should create a fully functional swarm system', async () => {
      const coordinator = container.resolve(SWARM_TOKENS["SwarmCoordinator"]);

      expect(coordinator).toBeInstanceOf(EnhancedSwarmCoordinator);

      // Initialize swarm
      await coordinator.initializeSwarm({ name: 'test-swarm' });

      // Add agents
      const agent1Id = await coordinator.addAgent({
        type: 'worker',
        capabilities: ['processing'],
      });

      const agent2Id = await coordinator.addAgent({
        type: 'coordinator',
        capabilities: ['management'],
      });

      expect(typeof agent1Id).toBe('string');
      expect(typeof agent2Id).toBe('string');
      expect(agent1Id).not.toBe(agent2Id);

      // Assign task
      const taskId = await coordinator.assignTask({
        type: 'test-task',
        requiredCapabilities: ['processing'],
      });

      expect(typeof taskId).toBe('string');

      // Get metrics
      const metrics = coordinator.getMetrics();
      expect(metrics.totalAgents).toBe(2);
      expect(metrics.totalTasks).toBe(1);

      // Cleanup
      await coordinator.removeAgent(agent1Id);
      await coordinator.removeAgent(agent2Id);
      await coordinator.shutdown();

      // Verify cleanup
      const finalMetrics = coordinator.getMetrics();
      expect(finalMetrics.totalAgents).toBe(0);
    });

    it('should handle dependency chain resolution', () => {
      // Verify the entire dependency chain is resolved correctly
      const coordinator = container.resolve(SWARM_TOKENS["SwarmCoordinator"]);
      const logger = container.resolve(CORE_TOKENS.Logger);
      const config = container.resolve(CORE_TOKENS.Config);
      const agentRegistry = container.resolve(SWARM_TOKENS["AgentRegistry"]);
      const messageBroker = container.resolve(SWARM_TOKENS["MessageBroker"]);

      expect(coordinator).toBeInstanceOf(EnhancedSwarmCoordinator);
      expect(logger).toBeInstanceOf(MockLogger);
      expect(config).toBeInstanceOf(MockConfig);
      expect(agentRegistry).toBeInstanceOf(MockAgentRegistry);
      expect(messageBroker).toBeInstanceOf(MockMessageBroker);

      // Verify singletons are the same instance
      const logger2 = container.resolve(CORE_TOKENS.Logger);
      expect(logger).toBe(logger2);
    });

    it('should maintain service isolation between different containers', () => {
      const container2 = createSwarmContainer({
        'swarm.maxAgents': 10,
        'test.mode': false,
      });

      const config1 = container.resolve(CORE_TOKENS.Config);
      const config2 = container2.resolve(CORE_TOKENS.Config);

      expect(config1).not.toBe(config2);
      expect(config1?.get('swarm.maxAgents')).toBe(5);
      expect(config2?.get('swarm.maxAgents')).toBe(10);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle service registration conflicts gracefully', () => {
      const container = new DIContainer();
      const originalLogger = new MockLogger();
      const replacementLogger = new MockLogger();

      // Spy on console.warn to capture overwrite warning
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation();

      container.register(CORE_TOKENS.Logger, {
        type: 'singleton',
        create: () => originalLogger,
      });

      container.register(CORE_TOKENS.Logger, {
        type: 'singleton',
        create: () => replacementLogger,
      });

      const resolvedLogger = container.resolve(CORE_TOKENS.Logger);

      expect(resolvedLogger).toBe(replacementLogger);
      expect(warnSpy).toHaveBeenCalledWith("Provider for token 'Logger' is being overwritten");

      warnSpy.mockRestore();
    });

    it('should handle complex scoping scenarios', () => {
      const container = new DIContainer();
      let instanceCounter = 0;

      const testToken = { symbol: Symbol('TestService'), name: 'TestService' };
      container.register(testToken, {
        type: 'scoped',
        create: () => ({ id: ++instanceCounter }),
      });

      const scope1 = container.createScope();
      const scope2 = container.createScope();
      const childScope1 = scope1.createChild();

      const instance1a = scope1.resolve(testToken);
      const instance1b = scope1.resolve(testToken);
      const instance2 = scope2.resolve(testToken);
      const instanceChild1 = childScope1?.resolve(testToken);

      expect(instance1a).toBe(instance1b); // Same in scope
      expect(instance1a).not.toBe(instance2); // Different scopes
      expect(instance1a).not.toBe(instanceChild1); // Different scopes (child)
    });
  });

  describe('Performance Tests', () => {
    it('should resolve services efficiently at scale', () => {
      const container = createSwarmContainer();

      const iterations = 10000;
      const startTime = Date.now();

      // Resolve services many times
      for (let i = 0; i < iterations; i++) {
        container.resolve(CORE_TOKENS.Logger);
        container.resolve(CORE_TOKENS.Config);
        container.resolve(SWARM_TOKENS["SwarmCoordinator"]);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 30k resolutions in less than 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent resolutions safely', async () => {
      const container = createSwarmContainer();

      // Create multiple concurrent resolution promises
      const promises = Array.from({ length: 100 }, () =>
        Promise.resolve().then(() => container.resolve(SWARM_TOKENS["SwarmCoordinator"]))
      );

      const coordinators = await Promise.all(promises);

      // All should be the same instance (singleton)
      coordinators.forEach((coordinator) => {
        expect(coordinator).toBe(coordinators[0]);
      });
    });
  });

  describe('Real-world Usage Demonstration', () => {
    it('should run the complete demonstration successfully', async () => {
      // Capture console output
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      try {
        await demonstrateSwarmDI();

        // Verify key log messages were output
        expect(logs.some((log) => log.includes('SwarmCoordinator DI Integration Demo'))).toBe(true);
        expect(logs.some((log) => log.includes('Demo completed successfully'))).toBe(true);
        expect(logs.some((log) => log.includes('Swarm metrics:'))).toBe(true);
      } finally {
        console.log = originalLog;
      }
    }, 10000); // Longer timeout for full demonstration

    it('should demonstrate proper resource cleanup', async () => {
      const container = createSwarmContainer();
      const coordinator = container.resolve(SWARM_TOKENS["SwarmCoordinator"]);

      // Use the coordinator
      await coordinator.initializeSwarm({ name: 'cleanup-test' });
      const agentId = await coordinator.addAgent({ type: 'test' });

      // Verify resources exist
      const beforeMetrics = coordinator.getMetrics();
      expect(beforeMetrics.totalAgents).toBe(1);

      // Dispose container
      await container.dispose();

      // Additional verification could go here if needed
      // The important thing is that no errors are thrown during disposal
    });
  });
});
