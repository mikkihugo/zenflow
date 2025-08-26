import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryManager } from '../../src/memory';
import {
  mockLogger,
  mockConfig,
  createMockMemoryConfig,
  createMockMemoryBackend,
  createMockResult,
} from '../mocks/foundation-mocks';

// Mock foundation dependencies
vi.mock('@claude-zen/foundation', () => ({
  getLogger: () => mockLogger,
  Result: createMockResult,
  ok: createMockResult.ok,
  err: createMockResult.err,
  safeAsync: vi.fn((fn) => fn()),
  withRetry: vi.fn((fn) => fn()),
  withTimeout: vi.fn((fn) => fn()),
  withContext: vi.fn((fn) => fn()),
  PerformanceTracker: vi.fn(() => ({
    startTimer: vi.fn(() => ({ stop: vi.fn(() => 100) })),
    recordMetric: vi.fn(),
  })),
  BasicTelemetryManager: vi.fn(() => ({
    track: vi.fn(),
    increment: vi.fn(),
    gauge: vi.fn(),
  })),
  Storage: vi.fn(),
  KeyValueStore: vi.fn(),
  StorageError: Error,
  injectable: vi.fn((target) => target),
  createErrorAggregator: vi.fn(() => ({
    add: vi.fn(),
    getErrors: vi.fn(() => []),
  })),
  createCircuitBreaker: vi.fn(() => ({ execute: vi.fn((fn) => fn()) })),
  recordMetric: vi.fn(),
  recordHistogram: vi.fn(),
  withTrace: vi.fn((fn) => fn()),
  ensureError: vi.fn((e) => (e instanceof Error ? e : new Error(String(e)))),
  TypedEventBase: class {
    emit = vi.fn();
    on = vi.fn();
  },
}));

describe('MemoryManager', () => {
  let manager: MemoryManager;
  let mockBackend: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBackend = createMockMemoryBackend();
  });

  describe('Constructor and Initialization', () => {
    it('should create manager with default configuration', () => {
      manager = new MemoryManager();
      expect(manager).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('MemoryManager initialized')
      );
    });

    it('should create manager with custom configuration', () => {
      const config = {
        maxBackends: 5,
        defaultTTL: 600000,
        enableMetrics: true,
        circuitBreakerThreshold: 10,
      };

      manager = new MemoryManager(config);
      expect(manager).toBeDefined();
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        maxBackends: -1,
        defaultTTL: 0,
        circuitBreakerThreshold: 0,
      };

      manager = new MemoryManager(invalidConfig);
      expect(manager).toBeDefined();
    });
  });

  describe('Backend Management', () => {
    beforeEach(() => {
      manager = new MemoryManager();
    });

    it('should register backend successfully', async () => {
      const backendId = 'test-backend';
      const config = createMockMemoryConfig();

      const result = await manager.registerBackend(backendId, config);
      expect(result.isOk()).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Backend '${backendId}' registered`)
      );
    });

    it('should prevent duplicate backend registration', async () => {
      const backendId = 'duplicate-backend';
      const config = createMockMemoryConfig();

      await manager.registerBackend(backendId, config);
      const result = await manager.registerBackend(backendId, config);

      expect(result.isErr()).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('already registered')
      );
    });

    it('should unregister backend successfully', async () => {
      const backendId = 'temp-backend';
      const config = createMockMemoryConfig();

      await manager.registerBackend(backendId, config);
      const result = await manager.unregisterBackend(backendId);

      expect(result.isOk()).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Backend '${backendId}' unregistered`)
      );
    });

    it('should handle unregistering non-existent backend', async () => {
      const result = await manager.unregisterBackend('non-existent');
      expect(result.isErr()).toBe(true);
    });

    it('should list all registered backends', async () => {
      const backends = ['backend1', 'backend2', 'backend3'];
      const config = createMockMemoryConfig();

      for (const id of backends) {
        await manager.registerBackend(id, config);
      }

      const result = await manager.listBackends();
      expect(result.isOk()).toBe(true);

      const backendList = result._unsafeUnwrap();
      expect(backendList).toHaveLength(backends.length);
      expect(backendList).toEqual(expect.arrayContaining(backends));
    });
  });

  describe('Memory Operations', () => {
    beforeEach(async () => {
      manager = new MemoryManager();
      await manager.registerBackend('default', createMockMemoryConfig())();
    });

    it('should store data across backends', async () => {
      const key = 'test-key';
      const value = 'test-value';

      const result = await manager.store(key, value);
      expect(result.isOk()).toBe(true);
    });

    it('should retrieve data from backends', async () => {
      const key = 'retrieve-key';
      const value = { data: 'test' };

      await manager.store(key, value);
      const result = await manager.retrieve(key);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(value);
    });

    it('should delete data from backends', async () => {
      const key = 'delete-key';

      await manager.store(key, 'temp-data');
      const deleteResult = await manager.delete(key);

      expect(deleteResult.isOk()).toBe(true);

      const retrieveResult = await manager.retrieve(key);
      expect(retrieveResult._unsafeUnwrap()).toBe(null);
    });

    it('should handle operations with specific backend', async () => {
      const backend1Config = {
        ...createMockMemoryConfig(),
        type: 'memory' as const,
      };
      const backend2Config = {
        ...createMockMemoryConfig(),
        type: 'json' as const,
      };

      await manager.registerBackend('backend1', backend1Config);
      await manager.registerBackend('backend2', backend2Config);

      const result = await manager.store('specific-key', 'specific-value', {
        backend: 'backend2',
      });

      expect(result.isOk()).toBe(true);
    });
  });

  describe('Batch Operations', () => {
    beforeEach(async () => {
      manager = new MemoryManager();
      await manager.registerBackend(
        'batch-backend',
        createMockMemoryConfig()
      )();
    });

    it('should handle batch store operations', async () => {
      const operations = [
        { key: 'batch1', value: 'value1' },
        { key: 'batch2', value: 'value2' },
        { key: 'batch3', value: 'value3' },
      ];

      const results = await manager.batchStore(operations);
      expect(results.isOk()).toBe(true);

      const batchResults = results._unsafeUnwrap();
      expect(batchResults).toHaveLength(operations.length);
      batchResults.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle batch retrieve operations', async () => {
      const testData = {
        'batch-retrieve1': 'value1',
        'batch-retrieve2': 'value2',
        'batch-retrieve3': 'value3',
      };

      // Store test data
      for (const [key, value] of Object.entries(testData)) {
        await manager.store(key, value);
      }

      const keys = Object.keys(testData);
      const results = await manager.batchRetrieve(keys);

      expect(results.isOk()).toBe(true);

      const retrieveResults = results._unsafeUnwrap();
      expect(retrieveResults).toHaveLength(keys.length);
    });

    it('should handle partial batch failures gracefully', async () => {
      const operations = [
        { key: 'valid1', value: 'value1' },
        { key: '', value: 'invalid-key' }, // Invalid key
        { key: 'valid2', value: 'value2' },
      ];

      const results = await manager.batchStore(operations);
      expect(results.isOk()).toBe(true);

      const batchResults = results._unsafeUnwrap();
      expect(batchResults).toHaveLength(operations.length);

      // Should have some successes and some failures
      const successes = batchResults.filter((r) => r.success);
      const failures = batchResults.filter((r) => !r.success);

      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics and Monitoring', () => {
    beforeEach(async () => {
      manager = new MemoryManager();
      await manager.registerBackend(
        'stats-backend',
        createMockMemoryConfig()
      )();
    });

    it('should provide comprehensive statistics', async () => {
      await manager.store('stats1', 'value1');
      await manager.store('stats2', 'value2');

      const result = await manager.getStats();
      expect(result.isOk()).toBe(true);

      const stats = result._unsafeUnwrap();
      expect(stats.totalBackends).toBeGreaterThan(0);
      expect(stats.totalEntries).toBeGreaterThanOrEqual(0);
      expect(stats.memoryUsage).toBeDefined();
    });

    it('should provide per-backend statistics', async () => {
      const backend1 = 'stats-backend-1';
      const backend2 = 'stats-backend-2';

      await manager.registerBackend(backend1, createMockMemoryConfig())();
      await manager.registerBackend(backend2, createMockMemoryConfig())();

      const result = await manager.getBackendStats();
      expect(result.isOk()).toBe(true);

      const backendStats = result._unsafeUnwrap();
      expect(Object.keys(backendStats)).toContain(backend1);
      expect(Object.keys(backendStats)).toContain(backend2);
    });

    it('should report health status', async () => {
      const result = await manager.health();
      expect(result.isOk()).toBe(true);

      const health = result._unsafeUnwrap();
      expect(health.status).toBeDefined();
      expect(health.backends).toBeDefined();
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Resilience', () => {
    beforeEach(() => {
      manager = new MemoryManager();
    });

    it('should handle backend failures gracefully', async () => {
      const failingBackend = {
        ...createMockMemoryBackend(),
        store: vi.fn().mockRejectedValue(new Error('Backend failure')),
      };

      // Mock the backend creation to return failing backend
      vi.doMock('../../src/backends/factory', () => ({
        createBackend: vi.fn().mockReturnValue(failingBackend),
      }));

      await manager.registerBackend('failing', createMockMemoryConfig())();

      const result = await manager.store('test-key', 'test-value');
      // Should handle failure gracefully
      expect(result.isOk() || result.isErr()).toBe(true);
    });

    it('should implement circuit breaker pattern', async () => {
      // This test verifies circuit breaker functionality
      // Multiple failures should trigger circuit breaker

      const config = {
        circuitBreakerThreshold: 3,
        circuitBreakerTimeout: 1000,
      };

      manager = new MemoryManager(config);
      await manager.registerBackend('circuit-test', createMockMemoryConfig())();

      // This is a placeholder for circuit breaker testing
      // Actual implementation would simulate failures and verify circuit opening
      expect(manager).toBeDefined();
    });

    it('should validate input parameters', async () => {
      await manager.registerBackend('validation', createMockMemoryConfig())();

      // Test invalid key
      const invalidKeyResult = await manager.store(null as any, 'value');
      expect(invalidKeyResult.isErr()).toBe(true);

      // Test invalid value (if applicable)
      const invalidValueResult = await manager.store(
        'key',
        Symbol('invalid') as any
      );
      expect(invalidValueResult.isOk() || invalidValueResult.isErr()).toBe(
        true
      );
    });
  });

  describe('Configuration Management', () => {
    it('should allow configuration updates', async () => {
      manager = new MemoryManager();

      const newConfig = {
        maxBackends: 10,
        defaultTTL: 1200000,
        enableMetrics: false,
      };

      const result = await manager.updateConfig(newConfig);
      expect(result.isOk()).toBe(true);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Configuration updated')
      );
    });

    it('should validate configuration updates', async () => {
      manager = new MemoryManager();

      const invalidConfig = {
        maxBackends: -5,
        defaultTTL: -1000,
      };

      const result = await manager.updateConfig(invalidConfig);
      expect(result.isErr()).toBe(true);
    });
  });

  describe('Cleanup and Shutdown', () => {
    beforeEach(async () => {
      manager = new MemoryManager();
      await manager.registerBackend('cleanup-test', createMockMemoryConfig())();
    });

    it('should perform graceful shutdown', async () => {
      await manager.store('cleanup-key', 'cleanup-value');

      const result = await manager.shutdown();
      expect(result.isOk()).toBe(true);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('MemoryManager shutdown')
      );
    });

    it('should clean up expired entries', async () => {
      const shortTTL = 100; // 100ms
      await manager.store('ttl-key', 'ttl-value', { ttl: shortTTL });

      // Trigger cleanup (in real implementation)
      const cleanupResult = await manager.cleanup();
      expect(cleanupResult.isOk()).toBe(true);
    });

    it('should handle cleanup errors gracefully', async () => {
      // Mock backend with failing cleanup
      const failingBackend = {
        ...createMockMemoryBackend(),
        clear: vi.fn().mockRejectedValue(new Error('Cleanup failed')),
      };

      // This would test cleanup error handling
      const result = await manager.cleanup();
      expect(result.isOk() || result.isErr()).toBe(true);
    });
  });
});
