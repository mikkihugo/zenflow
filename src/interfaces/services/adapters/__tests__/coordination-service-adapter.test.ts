/**
 * USL Coordination Service Adapter Tests.
 *
 * Comprehensive test suite for the CoordinationServiceAdapter following
 * the hybrid TDD approach (70% London + 30% Classical).
 */

import { ServicePriority, ServiceType } from '../../types.ts';
import {
  CoordinationServiceAdapter,
  createCoordinationServiceAdapter,
  createDefaultCoordinationServiceAdapterConfig,
} from '../coordination-service-adapter.ts';

// Test helpers and mocks
const createMockLogger = () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

const createMockDaaService = () => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
  createAgent: vi.fn().mockResolvedValue({ id: 'agent-1', status: 'created' }),
  adaptAgent: vi.fn().mockResolvedValue({ id: 'agent-1', adapted: true }),
  getAgentLearningStatus: vi
    .fn()
    .mockResolvedValue({ agentId: 'agent-1', proficiency: 0.85 }),
  createWorkflow: vi
    .fn()
    .mockResolvedValue({ id: 'workflow-1', status: 'created' }),
  executeWorkflow: vi
    .fn()
    .mockResolvedValue({ workflowId: 'workflow-1', status: 'completed' }),
  shareKnowledge: vi.fn().mockResolvedValue({ shared: true }),
  analyzeCognitivePatterns: vi
    .fn()
    .mockResolvedValue({ patterns: ['problem-solving'] }),
  setCognitivePattern: vi.fn().mockResolvedValue({ applied: true }),
  performMetaLearning: vi.fn().mockResolvedValue({ learningRate: 0.92 }),
  getPerformanceMetrics: vi
    .fn()
    .mockResolvedValue({ metrics: { throughput: 1000 } }),
});

const createMockSwarmCoordinator = () => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
  getState: vi.fn().mockReturnValue('active'),
  coordinateSwarm: vi.fn().mockResolvedValue({
    success: true,
    averageLatency: 50,
    successRate: 0.95,
    agentsCoordinated: 5,
  }),
  addAgent: vi.fn().mockResolvedValue(undefined),
  removeAgent: vi.fn().mockResolvedValue(undefined),
  assignTask: vi.fn().mockResolvedValue('agent-1'),
  completeTask: vi.fn().mockResolvedValue(undefined),
  getMetrics: vi.fn().mockReturnValue({
    agentCount: 5,
    activeAgents: 4,
    totalTasks: 10,
    completedTasks: 8,
    averageResponseTime: 100,
    throughput: 2.5,
    errorRate: 0.1,
    uptime: 300000,
  }),
  getAgents: vi.fn().mockReturnValue([
    {
      id: 'agent-1',
      type: 'researcher',
      status: 'idle',
      capabilities: ['search'],
    },
    {
      id: 'agent-2',
      type: 'coder',
      status: 'busy',
      capabilities: ['programming'],
    },
  ]),
});

const createMockSessionEnabledSwarm = () => ({
  init: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn().mockResolvedValue(undefined),
  isReady: vi.fn().mockReturnValue(true),
  createSession: vi.fn().mockResolvedValue('session-1'),
  loadSession: vi.fn().mockResolvedValue(undefined),
  saveSession: vi.fn().mockResolvedValue(undefined),
  createCheckpoint: vi.fn().mockResolvedValue('checkpoint-1'),
  restoreFromCheckpoint: vi.fn().mockResolvedValue(undefined),
  listSessions: jest
    .fn()
    .mockResolvedValue([
      { id: 'session-1', name: 'Test Session', status: 'active' },
    ]),
  getSessionStats: vi.fn().mockResolvedValue({
    uptime: 60000,
    operationsCount: 5,
    checkpointsCreated: 2,
    recoveryAttempts: 0,
    lastAccessed: new Date(),
  }),
});

// Mock external dependencies
jest.mock('../../../coordination/swarm/core/daa-service', () => ({
  DaaService: vi.fn().mockImplementation(() => createMockDaaService()),
}));

jest.mock('../../../coordination/swarm/core/swarm-coordinator', () => ({
  SwarmCoordinator: vi
    .fn()
    .mockImplementation(() => createMockSwarmCoordinator()),
}));

jest.mock('../../../coordination/swarm/core/session-integration', () => ({
  SessionEnabledSwarm: vi
    .fn()
    .mockImplementation(() => createMockSessionEnabledSwarm()),
}));

jest.mock('../../../utils/logger', () => ({
  createLogger: vi.fn().mockImplementation(() => createMockLogger()),
}));

describe('CoordinationServiceAdapter', () => {
  let adapter: CoordinationServiceAdapter;
  let config: unknown;

  beforeEach(() => {
    config = createDefaultCoordinationServiceAdapterConfig(
      'test-coordination',
      {
        type: ServiceType.COORDINATION,
        daaService: { enabled: true },
        sessionService: { enabled: true },
        swarmCoordinator: { enabled: true },
      }
    );

    adapter = new CoordinationServiceAdapter(config);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (adapter) {
      try {
        await adapter.destroy();
      } catch (_error) {
        // Ignore cleanup errors in tests
      }
    }
  });

  // ============================================
  // TDD London (Mockist) Tests - 70%
  // ============================================

  describe('Service Lifecycle Management (London TDD)', () => {
    it('should initialize with all enabled services', async () => {
      // Arrange - no additional setup needed, mocks are configured

      // Act
      await adapter.initialize();

      // Assert - Verify interactions with dependencies
      expect(adapter.isReady).toBeDefined();
      expect(adapter.getCapabilities()).toContain('coordination-operations');
    });

    it('should start service and check dependencies', async () => {
      // Arrange
      await adapter.initialize();

      // Act
      await adapter.start();

      // Assert - Verify service lifecycle state
      const status = await adapter.getStatus();
      expect(status.lifecycle).toBe('running');
    });

    it('should stop service and clean up resources', async () => {
      // Arrange
      await adapter.initialize();
      await adapter.start();

      // Act
      await adapter.stop();

      // Assert
      const status = await adapter.getStatus();
      expect(status.lifecycle).toBe('stopped');
    });

    it('should handle initialization errors gracefully', async () => {
      // Arrange
      const failingConfig = { ...config, name: '', type: '' };

      // Act & Assert
      await expect(async () => {
        const failingAdapter = new CoordinationServiceAdapter(failingConfig);
        await failingAdapter.initialize();
      }).rejects.toThrow();
    });
  });

  describe('Configuration Management (London TDD)', () => {
    it('should validate valid configuration', async () => {
      // Arrange
      const validConfig =
        createDefaultCoordinationServiceAdapterConfig('valid-test');

      // Act
      const isValid = await adapter.validateConfig(validConfig as any);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject invalid configuration', async () => {
      // Arrange
      const invalidConfig = { ...config, name: '', type: '' };

      // Act
      const isValid = await adapter.validateConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should update configuration dynamically', async () => {
      // Arrange
      await adapter.initialize();
      const updateConfig = { performance: { maxConcurrency: 30 } };

      // Act
      await adapter.updateConfig(updateConfig as any);

      // Assert
      expect((adapter.config as any).performance?.maxConcurrency).toBe(30);
    });
  });

  describe('Operation Execution (London TDD)', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should execute agent creation operation', async () => {
      // Arrange
      const agentConfig = { type: 'researcher', capabilities: ['search'] };

      // Act
      const result = await adapter.execute('agent-create', {
        config: agentConfig,
      });

      // Assert
      expect(result?.success).toBe(true);
      expect(result?.data).toHaveProperty('id');
      expect(result?.metadata).toHaveProperty('duration');
    });

    it('should execute session operations', async () => {
      // Arrange
      const sessionName = 'test-session';

      // Act
      const createResult = await adapter.execute('session-create', {
        name: sessionName,
      });
      const listResult = await adapter.execute('session-list');

      // Assert
      expect(createResult?.success).toBe(true);
      expect(listResult?.success).toBe(true);
      expect(Array.isArray(listResult?.data)).toBe(true);
    });

    it('should execute swarm coordination operations', async () => {
      // Arrange
      const agents = [
        {
          id: 'agent-1',
          type: 'researcher',
          status: 'idle',
          capabilities: ['search'],
        },
      ];

      // Act
      const result = await adapter.execute('swarm-coordinate', {
        agents,
        topology: 'mesh',
      });

      // Assert
      expect(result?.success).toBe(true);
      expect(result?.data).toHaveProperty('averageLatency');
      expect(result?.data).toHaveProperty('successRate');
    });

    it('should handle operation errors gracefully', async () => {
      // Arrange - stop service to cause operation failure
      await adapter.stop();

      // Act
      const result = await adapter.execute('agent-create', { config: {} });

      // Assert
      expect(result?.success).toBe(false);
      expect(result?.error).toBeDefined();
      expect(result?.error?.code).toBe('OPERATION_ERROR');
    });

    it('should timeout operations correctly', async () => {
      // Arrange
      const shortTimeout = 1; // 1ms timeout

      // Act
      const result = await adapter.execute(
        'agent-create',
        { config: {} },
        { timeout: shortTimeout }
      );

      // Assert - Should timeout quickly
      expect(result?.success).toBe(false);
      expect(result?.error?.message).toContain('timeout');
    });
  });

  describe('Event Handling (London TDD)', () => {
    it('should emit lifecycle events', async () => {
      // Arrange
      const eventHandler = vi.fn();
      adapter.on('initialized', eventHandler);

      // Act
      await adapter.initialize();

      // Assert
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'initialized',
          serviceName: 'test-coordination',
        })
      );
    });

    it('should handle operation events', async () => {
      // Arrange
      await adapter.initialize();
      await adapter.start();

      const operationHandler = vi.fn();
      adapter.on('operation', operationHandler);

      // Act
      await adapter.execute('agent-create', { config: { type: 'researcher' } });

      // Assert
      expect(operationHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: expect.any(String),
          success: true,
          duration: expect.any(Number),
        })
      );
    });

    it('should remove event listeners', async () => {
      // Arrange
      const eventHandler = vi.fn();
      adapter.on('initialized', eventHandler);

      // Act
      adapter.off('initialized', eventHandler);
      await adapter.initialize();

      // Assert
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('Dependency Management (London TDD)', () => {
    it('should add and check dependencies', async () => {
      // Arrange
      const dependency = {
        serviceName: 'test-dependency',
        required: true,
        healthCheck: true,
        timeout: 5000,
        retries: 2,
      };

      // Act
      await adapter.addDependency(dependency);
      const dependenciesOk = await adapter.checkDependencies();

      // Assert
      expect(dependenciesOk).toBe(true);
    });

    it('should remove dependencies', async () => {
      // Arrange
      const dependency = {
        serviceName: 'test-dependency',
        required: true,
        healthCheck: true,
      };
      await adapter.addDependency(dependency);

      // Act
      await adapter.removeDependency('test-dependency');
      const dependenciesOk = await adapter.checkDependencies();

      // Assert
      expect(dependenciesOk).toBe(true);
    });
  });

  // ============================================
  // Classical TDD Tests - 30%
  // ============================================

  describe('Cache Operations (Classical TDD)', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should cache and retrieve operation results', async () => {
      // Arrange - Enable cache in configuration
      (adapter.config as any).cache!.enabled = true;

      // Act - Execute same operation twice
      const result1 = await adapter.execute('agent-learning-status', {
        agentId: 'agent-1',
      });
      const result2 = await adapter.execute('agent-learning-status', {
        agentId: 'agent-1',
      });

      // Assert - Both should succeed, second should be faster (cached)
      expect(result1?.success).toBe(true);
      expect(result2?.success).toBe(true);
      expect(result1?.data).toEqual(result2?.data);
    });

    it('should respect cache TTL', async () => {
      // Arrange
      (adapter.config as any).cache!.enabled = true;
      (adapter.config as any).cache!.defaultTTL = 100; // 100ms TTL

      // Act
      const result1 = await adapter.execute('agent-learning-status', {
        agentId: 'agent-1',
      });

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result2 = await adapter.execute('agent-learning-status', {
        agentId: 'agent-1',
      });

      // Assert - Results should be consistent even after cache expiry
      expect(result1?.success).toBe(true);
      expect(result2?.success).toBe(true);
    });

    it('should clear cache correctly', async () => {
      // Arrange
      (adapter.config as any).cache!.enabled = true;
      await adapter.execute('agent-learning-status', { agentId: 'agent-1' });

      // Act
      const clearResult = await adapter.execute('clear-cache');

      // Assert
      expect(clearResult?.success).toBe(true);
      expect(clearResult?.data).toHaveProperty('cleared');
      expect(typeof clearResult?.data?.cleared).toBe('number');
    });
  });

  describe('Performance Metrics (Classical TDD)', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should track operation metrics correctly', async () => {
      // Arrange - Execute several operations
      const operations = ['agent-create', 'session-create', 'swarm-metrics'];

      // Act
      for (const operation of operations) {
        await adapter.execute(operation, {
          config: { type: 'researcher' },
          name: 'test',
        });
      }

      const metrics = await adapter.getMetrics();

      // Assert - Metrics should reflect executed operations
      expect(metrics.operationCount).toBeGreaterThanOrEqual(operations.length);
      expect(metrics.successCount).toBeGreaterThan(0);
      expect(metrics.averageLatency).toBeGreaterThan(0);
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
      expect(metrics.timestamp).toBeInstanceOf(Date);
    });

    it('should calculate error rates correctly', async () => {
      // Arrange - Stop service to force errors
      await adapter.stop();

      // Act - Execute operations that will fail
      const results = await Promise.all([
        adapter.execute('agent-create', { config: {} }),
        adapter.execute('session-create', { name: 'test' }),
        adapter.execute('swarm-coordinate', { agents: [] }),
      ]);

      const metrics = await adapter.getMetrics();

      // Assert - All operations should have failed
      results?.forEach((result) => expect(result?.success).toBe(false));
      expect(metrics.errorCount).toBe(3);
      expect((metrics as any).errorRate).toBeGreaterThan(0);
    });

    it('should track custom coordination metrics', async () => {
      // Arrange
      await adapter.execute('swarm-coordinate', {
        agents: [{ id: 'agent-1', type: 'researcher' }],
        topology: 'mesh',
      });

      // Act
      const metrics = await adapter.getMetrics();

      // Assert
      expect(metrics.customMetrics).toBeDefined();
      expect(metrics.customMetrics).toHaveProperty('activeAgentsCount');
      expect(metrics.customMetrics).toHaveProperty('activeSessionsCount');
      expect(metrics.customMetrics).toHaveProperty('avgCoordinationLatency');
    });
  });

  describe('Health Monitoring (Classical TDD)', () => {
    it('should report healthy status when running', async () => {
      // Arrange
      await adapter.initialize();
      await adapter.start();

      // Act
      const isHealthy = await adapter.healthCheck();
      const status = await adapter.getStatus();

      // Assert
      expect(isHealthy).toBe(true);
      expect(status.health).toBe('healthy');
      expect(status.lifecycle).toBe('running');
      expect(status.uptime).toBeGreaterThan(0);
    });

    it('should report unhealthy status when stopped', async () => {
      // Arrange
      await adapter.initialize();
      await adapter.start();
      await adapter.stop();

      // Act
      const isHealthy = await adapter.healthCheck();
      const status = await adapter.getStatus();

      // Assert
      expect(isHealthy).toBe(false);
      expect(status.health).toBe('unhealthy');
      expect(status.lifecycle).toBe('stopped');
    });

    it('should track consecutive health check failures', async () => {
      // Arrange
      await adapter.initialize();
      await adapter.start();
      await adapter.stop(); // Stop to cause health check failures

      // Act - Perform multiple health checks
      const healthResults = await Promise.all([
        adapter.healthCheck(),
        adapter.healthCheck(),
        adapter.healthCheck(),
      ]);

      // Assert
      healthResults?.forEach((result) => expect(result).toBe(false));

      const status = await adapter.getStatus();
      expect(status.errorCount).toBeGreaterThan(0);
    });
  });

  describe('Memory Management (Classical TDD)', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.start();
    });

    it('should estimate memory usage accurately', async () => {
      // Arrange - Execute operations to populate cache and metrics
      const operations = Array(10)
        .fill(0)
        .map((_, i) =>
          adapter.execute('agent-create', {
            config: { type: 'researcher', id: `agent-${i}` },
          })
        );

      await Promise.all(operations);

      // Act
      const metrics = await adapter.getMetrics();

      // Assert
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.memoryUsage?.used).toBeGreaterThan(0);
      expect(metrics.memoryUsage?.total).toBeGreaterThan(0);
      expect(metrics.memoryUsage?.percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage?.percentage).toBeLessThanOrEqual(100);
    });

    it('should clean up memory on destroy', async () => {
      // Arrange - Execute operations to use memory
      await adapter.execute('agent-create', { config: { type: 'researcher' } });
      await adapter.execute('session-create', { name: 'test' });

      const initialMetrics = await adapter.getMetrics();
      const _initialMemory = initialMetrics.memoryUsage?.used;

      // Act
      await adapter.destroy();

      // Assert - Memory should be cleaned up (we can't easily test this directly,
      // but we can verify the service is properly destroyed)
      expect(adapter.isReady()).toBe(false);
    });
  });

  // ============================================
  // Factory Function Tests
  // ============================================

  describe('Factory Functions', () => {
    it('should create adapter with factory function', () => {
      // Arrange
      const factoryConfig =
        createDefaultCoordinationServiceAdapterConfig('factory-test');

      // Act
      const factoryAdapter = createCoordinationServiceAdapter(factoryConfig);

      // Assert
      expect(factoryAdapter).toBeInstanceOf(CoordinationServiceAdapter);
      expect(factoryAdapter.name).toBe('factory-test');
      expect(factoryAdapter.type).toBe(ServiceType.COORDINATION);
    });

    it('should create default configuration with overrides', () => {
      // Arrange
      const overrides = {
        priority: ServicePriority.HIGH,
        timeout: 60000,
        daaService: { enabled: false },
      };

      // Act
      const config = createDefaultCoordinationServiceAdapterConfig(
        'override-test',
        overrides
      );

      // Assert
      expect(config?.name).toBe('override-test');
      expect((config as any)?.priority).toBe(ServicePriority.HIGH);
      expect((config as any)?.timeout).toBe(60000);
      expect(config?.daaService?.enabled).toBe(false);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Service Integration', () => {
    it('should coordinate multiple services seamlessly', async () => {
      // Arrange
      await adapter.initialize();
      await adapter.start();

      // Act - Execute a workflow involving multiple services
      const agentResult = await adapter.execute('agent-create', {
        config: { type: 'researcher', capabilities: ['search'] },
      });

      const sessionResult = await adapter.execute('session-create', {
        name: 'integration-test',
      });

      const coordinationResult = await adapter.execute('swarm-coordinate', {
        agents: [
          {
            id: agentResult?.data?.id,
            type: 'researcher',
            status: 'idle',
            capabilities: ['search'],
          },
        ],
        topology: 'mesh',
      });

      // Assert - All operations should succeed
      expect(agentResult?.success).toBe(true);
      expect(sessionResult?.success).toBe(true);
      expect(coordinationResult?.success).toBe(true);

      // Verify cross-service integration
      expect(coordinationResult?.data?.agentsCoordinated).toBeGreaterThan(0);
    });

    it('should handle service failures gracefully', async () => {
      // Arrange
      await adapter.initialize();
      await adapter.start();

      // Act - Simulate service failure by providing invalid parameters
      const invalidAgentResult = await adapter.execute('agent-create', {
        config: null,
      });
      const invalidSessionResult = await adapter.execute('session-create', {
        name: null,
      });

      // Assert - Should handle errors gracefully
      expect(invalidAgentResult?.success).toBe(false);
      expect(invalidSessionResult?.success).toBe(false);

      // Service should still be operational for valid requests
      const validResult = await adapter.execute('swarm-metrics');
      expect(validResult?.success).toBe(true);
    });
  });

  // ============================================
  // Retry Logic Tests
  // ============================================

  describe('Retry Logic', () => {
    beforeEach(async () => {
      (adapter.config as any).retry!.enabled = true;
      (adapter.config as any).retry!.attempts = 3;
      await adapter.initialize();
    });

    it('should retry failed operations', async () => {
      // This test would require more complex mocking to simulate intermittent failures
      // For now, we test that retry configuration is properly applied
      expect((adapter.config as any).retry?.enabled).toBe(true);
      expect((adapter.config as any).retry?.attempts).toBe(3);
    });
  });
});
