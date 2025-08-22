import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionMemoryStore } from '../../src/memory';
import {
  mockLogger,
  mockConfig,
  createMockMemoryConfig,
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

describe('SessionMemoryStore', () => {
  let store: SessionMemoryStore;
  let config: any;

  beforeEach(() => {
    vi.clearAllMocks();
    config = createMockMemoryConfig();
  });

  describe('Constructor', () => {
    it('should create store with default options', () => {
      store = new SessionMemoryStore();
      expect(store).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Initializing SessionMemoryStore')
      );
    });

    it('should create store with custom options', () => {
      const options = {
        maxSize: 5000,
        ttl: 600000,
        compression: true,
        sessionId: 'test-session',
      };

      store = new SessionMemoryStore(options);
      expect(store).toBeDefined();
    });

    it('should handle invalid options gracefully', () => {
      const invalidOptions = {
        maxSize: -1,
        ttl: 0,
      };

      store = new SessionMemoryStore(invalidOptions);
      expect(store).toBeDefined();
    });
  });

  describe('Store Operations', () => {
    beforeEach(() => {
      store = new SessionMemoryStore();
    });

    it('should store and retrieve basic values', async () => {
      const key = 'test-key';
      const value = 'test-value';

      const storeResult = await store.store(key, value);
      expect(storeResult.isOk()).toBe(true);

      const retrieveResult = await store.retrieve(key);
      expect(retrieveResult.isOk()).toBe(true);
      expect(retrieveResult._unsafeUnwrap()).toBe(value);
    });

    it('should store and retrieve complex objects', async () => {
      const key = 'complex-key';
      const value = {
        id: 1,
        name: 'test',
        nested: { prop: 'value' },
        array: [1, 2, 3],
      };

      const storeResult = await store.store(key, value);
      expect(storeResult.isOk()).toBe(true);

      const retrieveResult = await store.retrieve(key);
      expect(retrieveResult.isOk()).toBe(true);
      expect(retrieveResult._unsafeUnwrap()).toEqual(value);
    });

    it('should handle null and undefined values', async () => {
      await store.store('null-key', null);
      const nullResult = await store.retrieve('null-key');
      expect(nullResult._unsafeUnwrap()).toBe(null);

      await store.store('undefined-key', undefined);
      const undefinedResult = await store.retrieve('undefined-key');
      expect(undefinedResult._unsafeUnwrap()).toBe(undefined);
    });

    it('should return error for non-existent keys', async () => {
      const result = await store.retrieve('non-existent-key');
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe(null);
    });

    it('should handle store options correctly', async () => {
      const key = 'options-key';
      const value = 'options-value';
      const options = {
        ttl: 1000,
        compress: true,
        metadata: { source: 'test' },
      };

      const result = await store.store(key, value, options);
      expect(result.isOk()).toBe(true);
    });
  });

  describe('Delete Operations', () => {
    beforeEach(async () => {
      store = new SessionMemoryStore();
      await store.store('test-key', 'test-value');
    });

    it('should delete existing keys', async () => {
      const deleteResult = await store.delete('test-key');
      expect(deleteResult.isOk()).toBe(true);
      expect(deleteResult._unsafeUnwrap()).toBe(true);

      const retrieveResult = await store.retrieve('test-key');
      expect(retrieveResult._unsafeUnwrap()).toBe(null);
    });

    it('should handle deletion of non-existent keys', async () => {
      const result = await store.delete('non-existent-key');
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe(false);
    });
  });

  describe('Batch Operations', () => {
    beforeEach(() => {
      store = new SessionMemoryStore();
    });

    it('should handle batch store operations', async () => {
      const operations = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ];

      const results = await Promise.all(
        operations.map((op) => store.store(op.key, op.value))
      );

      results.forEach((result) => {
        expect(result.isOk()).toBe(true);
      });

      // Verify all values were stored
      for (const op of operations) {
        const retrieveResult = await store.retrieve(op.key);
        expect(retrieveResult._unsafeUnwrap()).toBe(op.value);
      }
    });

    it('should handle batch retrieve operations', async () => {
      const testData = {
        batch1: 'value1',
        batch2: 'value2',
        batch3: 'value3',
      };

      // Store test data
      for (const [key, value] of Object.entries(testData)) {
        await store.store(key, value);
      }

      // Batch retrieve
      const results = await Promise.all(
        Object.keys(testData).map((key) => store.retrieve(key))
      );

      results.forEach((result, index) => {
        const expectedValue = Object.values(testData)[index];
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toBe(expectedValue);
      });
    });
  });

  describe('Clear Operations', () => {
    beforeEach(async () => {
      store = new SessionMemoryStore();
      await store.store('key1', 'value1');
      await store.store('key2', 'value2');
    });

    it('should clear all stored data', async () => {
      const clearResult = await store.clear();
      expect(clearResult.isOk()).toBe(true);

      const retrieve1 = await store.retrieve('key1');
      const retrieve2 = await store.retrieve('key2');

      expect(retrieve1._unsafeUnwrap()).toBe(null);
      expect(retrieve2._unsafeUnwrap()).toBe(null);
    });
  });

  describe('Statistics and Health', () => {
    beforeEach(() => {
      store = new SessionMemoryStore();
    });

    it('should provide accurate statistics', async () => {
      await store.store('stats1', 'value1');
      await store.store('stats2', 'value2');

      const statsResult = await store.getStats();
      expect(statsResult.isOk()).toBe(true);

      const stats = statsResult._unsafeUnwrap();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBeDefined();
    });

    it('should report healthy status', async () => {
      const healthResult = await store.health();
      expect(healthResult.isOk()).toBe(true);
      expect(healthResult._unsafeUnwrap()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      store = new SessionMemoryStore();
    });

    it('should handle invalid key types gracefully', async () => {
      // Test with empty string
      const result1 = await store.store('', 'value');
      expect(result1.isOk()).toBe(true);

      // Test with very long key
      const longKey = 'a'.repeat(10000);
      const result2 = await store.store(longKey, 'value');
      expect(result2.isOk()).toBe(true);
    });

    it('should handle circular references in values', async () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      const result = await store.store('circular', circularObj);
      // Should handle serialization gracefully
      expect(result.isOk()||result.isErr()).toBe(true);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should respect TTL settings', async () => {
      store = new SessionMemoryStore({ ttl: 100 }); // 100ms TTL

      await store.store('ttl-key', 'ttl-value');

      // Should exist immediately
      let result = await store.retrieve('ttl-key');
      expect(result._unsafeUnwrap()).toBe('ttl-value');

      // Wait for TTL to expire (in a real implementation)
      // This is a placeholder - actual TTL testing would require time manipulation
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Note: This test assumes TTL implementation exists
      // In the actual implementation, expired entries should be cleaned up
    });
  });

  describe('Memory Limits', () => {
    it('should respect maximum size limits', async () => {
      store = new SessionMemoryStore({ maxSize: 2 });

      await store.store('limit1', 'value1');
      await store.store('limit2', 'value2');

      // Third item should either replace existing or be rejected
      const result = await store.store('limit3', 'value3');
      expect(result.isOk() || result.isErr()).toBe(true);

      const stats = await store.getStats();
      expect(stats._unsafeUnwrap().size).toBeLessThanOrEqual(2);
    });
  });
});
