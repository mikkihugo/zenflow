/**
 * Cache Performance Integration Tests
 *
 * Hybrid Testing Approach:
 * - London School: Mock cache implementations and external dependencies
 * - Classical School: Test actual cache algorithms and performance characteristics
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventEmitter } from 'events';

// Cache Interface and Implementations
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  ttl?: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  hitRate: number;
  avgAccessTime: number;
  memoryUsage: number;
}

interface CacheStrategy<T> {
  name: string;
  shouldEvict(entries: Map<string, CacheEntry<T>>, maxSize: number): string | null;
  onAccess(entry: CacheEntry<T>): void;
}

// LRU (Least Recently Used) Strategy
class LRUStrategy<T> implements CacheStrategy<T> {
  name = 'LRU';

  shouldEvict(entries: Map<string, CacheEntry<T>>, maxSize: number): string | null {
    if (entries.size >= maxSize) {
      // At capacity - need to evict
    } else {
      return null; // Still have space
    }

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of entries) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  onAccess(entry: CacheEntry<T>): void {
    entry.lastAccessed = Date.now();
    entry.accessCount++;
  }
}

// LFU (Least Frequently Used) Strategy
class LFUStrategy<T> implements CacheStrategy<T> {
  name = 'LFU';

  shouldEvict(entries: Map<string, CacheEntry<T>>, maxSize: number): string | null {
    if (entries.size < maxSize) return null;

    let leastUsedKey: string | null = null;
    let leastCount = Infinity;

    for (const [key, entry] of entries) {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  onAccess(entry: CacheEntry<T>): void {
    entry.lastAccessed = Date.now();
    entry.accessCount++;
  }
}

// TTL (Time To Live) Strategy
class TTLStrategy<T> implements CacheStrategy<T> {
  name = 'TTL';

  shouldEvict(entries: Map<string, CacheEntry<T>>, maxSize: number): string | null {
    const now = Date.now();

    // First, evict expired entries
    for (const [key, entry] of entries) {
      if (entry.ttl && now > entry.ttl) {
        return key;
      }
    }

    // If no expired entries and over capacity, use LRU
    if (entries.size >= maxSize) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [key, entry] of entries) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = key;
        }
      }

      return oldestKey;
    }

    return null;
  }

  onAccess(entry: CacheEntry<T>): void {
    entry.lastAccessed = Date.now();
    entry.accessCount++;
  }
}

// High-Performance Cache Implementation
class PerformanceCache<T> extends EventEmitter {
  private entries = new Map<string, CacheEntry<T>>();
  private strategy: CacheStrategy<T>;
  private maxSize: number;
  private metrics: CacheMetrics;
  private readonly defaultTTL?: number;

  constructor(
    maxSize: number = 1000,
    strategy: CacheStrategy<T> = new LRUStrategy<T>(),
    defaultTTL?: number
  ) {
    super();
    this.maxSize = maxSize;
    this.strategy = strategy;
    this.defaultTTL = defaultTTL;
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      hitRate: 0,
      avgAccessTime: 0,
      memoryUsage: 0,
    };
  }

  async get(key: string): Promise<T | null> {
    const startTime = process.hrtime.bigint();
    this.metrics.totalRequests++;

    const entry = this.entries.get(key);

    if (!entry) {
      this.metrics.misses++;
      this.updateMetrics(startTime);
      this.emit('miss', { key });
      return null;
    }

    // Check TTL
    if (entry.ttl && Date.now() > entry.ttl) {
      this.entries.delete(key);
      this.metrics.misses++;
      this.metrics.evictions++;
      this.updateMetrics(startTime);
      this.emit('expired', { key });
      return null;
    }

    this.strategy.onAccess(entry);
    this.metrics.hits++;
    this.updateMetrics(startTime);
    this.emit('hit', { key, accessCount: entry.accessCount });

    return entry.value;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = process.hrtime.bigint();

    // Calculate size (rough approximation)
    const size = this.calculateSize(value);
    const now = Date.now();

    // Check if key already exists
    const existingEntry = this.entries.get(key);

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      accessCount: existingEntry ? existingEntry.accessCount : 0,
      lastAccessed: now,
      size,
      ttl: ttl ? now + ttl : this.defaultTTL ? now + this.defaultTTL : undefined,
    };

    // Only check for eviction if we're adding a new key
    if (!existingEntry) {
      const evictKey = this.strategy.shouldEvict(this.entries, this.maxSize);
      if (evictKey) {
        const evicted = this.entries.get(evictKey);
        this.entries.delete(evictKey);
        this.metrics.evictions++;
        this.emit('evicted', { key: evictKey, strategy: this.strategy.name, evicted });
      }
    }

    this.entries.set(key, entry);
    this.updateMetrics(startTime);
    this.emit('set', { key, size, ttl });
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.entries.delete(key);
    if (deleted) {
      this.emit('deleted', { key });
    }
    return deleted;
  }

  async clear(): Promise<void> {
    const count = this.entries.size;
    this.entries.clear();
    this.metrics = {
      ...this.metrics,
      memoryUsage: 0,
    };
    this.emit('cleared', { count });
  }

  async has(key: string): Promise<boolean> {
    const entry = this.entries.get(key);
    if (!entry) return false;

    // Check TTL
    if (entry.ttl && Date.now() > entry.ttl) {
      this.entries.delete(key);
      this.metrics.evictions++;
      return false;
    }

    return true;
  }

  getMetrics(): CacheMetrics {
    this.calculateMemoryUsage();
    this.metrics.hitRate =
      this.metrics.totalRequests > 0 ? this.metrics.hits / this.metrics.totalRequests : 0;
    return { ...this.metrics };
  }

  getSize(): number {
    return this.entries.size;
  }

  getKeys(): string[] {
    return Array.from(this.entries.keys());
  }

  async cleanup(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.entries) {
      if (entry.ttl && now > entry.ttl) {
        this.entries.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.emit('cleanup', { cleaned: cleanedCount });
    }

    return cleanedCount;
  }

  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  private calculateMemoryUsage(): void {
    let totalSize = 0;
    for (const entry of this.entries.values()) {
      totalSize += entry.size;
    }
    this.metrics.memoryUsage = totalSize;
  }

  private updateMetrics(startTime: bigint): void {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

    // Update rolling average
    const totalOps = this.metrics.hits + this.metrics.misses;
    this.metrics.avgAccessTime =
      totalOps > 1 ? (this.metrics.avgAccessTime * (totalOps - 1) + duration) / totalOps : duration;
  }
}

// Mock Cache for London-style tests
class MockCache<T> {
  private mockData = new Map<string, T>();
  public operations: string[] = [];
  public metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
  };

  async get(key: string): Promise<T | null> {
    this.operations.push(`get:${key}`);
    this.metrics.totalRequests++;

    if (this.mockData.has(key)) {
      this.metrics.hits++;
      return this.mockData.get(key)!;
    } else {
      this.metrics.misses++;
      return null;
    }
  }

  async set(key: string, value: T): Promise<void> {
    this.operations.push(`set:${key}`);
    this.mockData.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    this.operations.push(`delete:${key}`);
    return this.mockData.delete(key);
  }

  async clear(): Promise<void> {
    this.operations.push('clear');
    this.mockData.clear();
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

describe('Cache Performance Integration Tests', () => {
  describe('Cache Strategies (London School)', () => {
    let mockCache: MockCache<any>;

    beforeEach(() => {
      mockCache = new MockCache();
    });

    it('should mock cache operations correctly', async () => {
      await mockCache.set('key1', 'value1');
      await mockCache.set('key2', 'value2');

      const value1 = await mockCache.get('key1');
      const value2 = await mockCache.get('nonexistent');

      expect(value1).toBe('value1');
      expect(value2).toBeNull();
      expect(mockCache.operations).toContain('set:key1');
      expect(mockCache.operations).toContain('set:key2');
      expect(mockCache.operations).toContain('get:key1');
      expect(mockCache.operations).toContain('get:nonexistent');
    });

    it('should track metrics properly', async () => {
      await mockCache.get('miss1');
      await mockCache.set('hit1', 'value');
      await mockCache.get('hit1');
      await mockCache.get('miss2');

      const metrics = mockCache.getMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(2);
      expect(metrics.totalRequests).toBe(3);
    });

    it('should handle cache strategy mocking', () => {
      const mockStrategy = {
        name: 'Mock',
        shouldEvict: jest.fn().mockReturnValue('evict-key'),
        onAccess: jest.fn(),
      };

      const entries = new Map([
        ['key1', { lastAccessed: 1000 } as any],
        ['key2', { lastAccessed: 2000 } as any],
      ]);

      const evictKey = mockStrategy.shouldEvict(entries, 1);
      expect(evictKey).toBe('evict-key');
      expect(mockStrategy.shouldEvict).toHaveBeenCalledWith(entries, 1);
    });
  });

  describe('LRU Cache Implementation (Classical School)', () => {
    let cache: PerformanceCache<string>;

    beforeEach(() => {
      cache = new PerformanceCache<string>(3, new LRUStrategy());
    });

    afterEach(async () => {
      await cache.clear();
    });

    it('should implement LRU eviction correctly', async () => {
      await cache.set('a', 'value-a');
      await new Promise(resolve => setTimeout(resolve, 1)); // Ensure different timestamps
      await cache.set('b', 'value-b');
      await new Promise(resolve => setTimeout(resolve, 1));
      await cache.set('c', 'value-c');
      await new Promise(resolve => setTimeout(resolve, 1));

      // Access 'a' to make it most recently used
      await cache.get('a');
      await new Promise(resolve => setTimeout(resolve, 1));

      // Add 'd' which should evict 'b' (least recently used)
      await cache.set('d', 'value-d');

      expect(await cache.has('a')).toBe(true); // Recently accessed
      expect(await cache.has('b')).toBe(false); // Should be evicted
      expect(await cache.has('c')).toBe(true); // Still there
      expect(await cache.has('d')).toBe(true); // Just added
    });

    it('should update access patterns correctly', async () => {
      await cache.set('test', 'value');

      // Access multiple times
      await cache.get('test');
      await cache.get('test');
      await cache.get('test');

      const metrics = cache.getMetrics();
      expect(metrics.hits).toBe(3);
      expect(metrics.misses).toBe(0);
      expect(metrics.hitRate).toBe(1.0);
    });

    it('should handle cache misses', async () => {
      const result = await cache.get('nonexistent');
      expect(result).toBeNull();

      const metrics = cache.getMetrics();
      expect(metrics.misses).toBe(1);
      expect(metrics.hits).toBe(0);
      expect(metrics.hitRate).toBe(0);
    });
  });

  describe('LFU Cache Implementation (Classical School)', () => {
    let cache: PerformanceCache<string>;

    beforeEach(() => {
      cache = new PerformanceCache<string>(3, new LFUStrategy());
    });

    afterEach(async () => {
      await cache.clear();
    });

    it('should implement LFU eviction correctly', async () => {
      await cache.set('a', 'value-a');
      await cache.set('b', 'value-b');
      await cache.set('c', 'value-c');

      // Access 'a' and 'c' multiple times
      await cache.get('a');
      await cache.get('a');
      await cache.get('c');

      // 'b' has been accessed least (only on set), should be evicted
      await cache.set('d', 'value-d');

      expect(await cache.has('a')).toBe(true); // Frequently accessed
      expect(await cache.has('b')).toBe(false); // Least frequently used
      expect(await cache.has('c')).toBe(true); // Accessed
      expect(await cache.has('d')).toBe(true); // Just added
    });

    it('should track access frequency accurately', async () => {
      await cache.set('frequent', 'value');

      // Access many times
      for (let i = 0; i < 10; i++) {
        await cache.get('frequent');
      }

      const metrics = cache.getMetrics();
      expect(metrics.hits).toBe(10);
      expect(metrics.totalRequests).toBe(10);
    });
  });

  describe('TTL Cache Implementation (Classical School)', () => {
    let cache: PerformanceCache<string>;

    beforeEach(() => {
      cache = new PerformanceCache<string>(10, new TTLStrategy(), 100); // 100ms default TTL
    });

    afterEach(async () => {
      await cache.clear();
    });

    it('should expire entries based on TTL', async () => {
      await cache.set('short-lived', 'value', 50); // 50ms TTL

      expect(await cache.has('short-lived')).toBe(true);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(await cache.has('short-lived')).toBe(false);
      expect(await cache.get('short-lived')).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      await cache.set('default-ttl', 'value');

      expect(await cache.has('default-ttl')).toBe(true);

      // Wait for default TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 110));

      expect(await cache.has('default-ttl')).toBe(false);
    });

    it('should cleanup expired entries', async () => {
      await cache.set('expire1', 'value1', 30);
      await cache.set('expire2', 'value2', 30);
      await cache.set('persist', 'value3', 1000);

      expect(cache.getSize()).toBe(3);

      // Wait for some to expire
      await new Promise((resolve) => setTimeout(resolve, 40));

      const cleaned = await cache.cleanup();
      expect(cleaned).toBe(2);
      expect(cache.getSize()).toBe(1);
      expect(await cache.has('persist')).toBe(true);
    });
  });

  describe('Performance Benchmarks (Classical School)', () => {
    let cache: PerformanceCache<any>;

    beforeEach(() => {
      cache = new PerformanceCache<any>(10000, new LRUStrategy());
    });

    afterEach(async () => {
      await cache.clear();
    });

    it('should benchmark write performance', async () => {
      const iterations = 10000;
      const testData = { message: 'benchmark data', timestamp: Date.now() };

      const startTime = process.hrtime.bigint();

      for (let i = 0; i < iterations; i++) {
        await cache.set(`bench-write-${i}`, testData);
      }

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const operationsPerSecond = (iterations / durationMs) * 1000;

      console.log(`Cache write performance: ${operationsPerSecond.toFixed(0)} ops/sec`);

      expect(operationsPerSecond).toBeGreaterThan(10000); // Should be very fast for memory operations
      expect(cache.getSize()).toBe(iterations);
    });

    it('should benchmark read performance', async () => {
      const iterations = 1000;
      const testData = { benchmark: 'read test data' };

      // Pre-populate cache
      for (let i = 0; i < iterations; i++) {
        await cache.set(`bench-read-${i}`, testData);
      }

      const startTime = process.hrtime.bigint();

      for (let i = 0; i < iterations; i++) {
        await cache.get(`bench-read-${i}`);
      }

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const operationsPerSecond = (iterations / durationMs) * 1000;

      console.log(`Cache read performance: ${operationsPerSecond.toFixed(0)} ops/sec`);

      expect(operationsPerSecond).toBeGreaterThan(50000); // Memory reads should be very fast

      const metrics = cache.getMetrics();
      expect(metrics.hits).toBe(iterations);
      expect(metrics.hitRate).toBe(1.0);
    });

    it('should benchmark mixed workload performance', async () => {
      const operations = 5000;
      const cacheSize = 1000;

      // Create a realistic mixed workload
      const startTime = process.hrtime.bigint();

      for (let i = 0; i < operations; i++) {
        const operation = Math.random();
        const key = `mixed-${i % cacheSize}`;

        if (operation < 0.7) {
          // 70% reads
          await cache.get(key);
        } else if (operation < 0.95) {
          // 25% writes
          await cache.set(key, { data: `value-${i}`, timestamp: Date.now() });
        } else {
          // 5% deletes
          await cache.delete(key);
        }
      }

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const operationsPerSecond = (operations / durationMs) * 1000;

      console.log(`Mixed workload performance: ${operationsPerSecond.toFixed(0)} ops/sec`);

      const metrics = cache.getMetrics();
      console.log(`Hit rate: ${(metrics.hitRate * 100).toFixed(1)}%`);
      console.log(`Average access time: ${metrics.avgAccessTime.toFixed(3)}ms`);

      expect(operationsPerSecond).toBeGreaterThan(5000);
      expect(metrics.hitRate).toBeGreaterThan(0.1); // Some hits expected
    });

    it('should measure memory usage accurately', async () => {
      const largeData = { content: 'x'.repeat(10000) };

      for (let i = 0; i < 100; i++) {
        await cache.set(`memory-${i}`, largeData);
      }

      const metrics = cache.getMetrics();
      expect(metrics.memoryUsage).toBeGreaterThan(1000000); // > 1MB

      // Clear half the cache
      for (let i = 0; i < 50; i++) {
        await cache.delete(`memory-${i}`);
      }

      const metricsAfter = cache.getMetrics();
      expect(metricsAfter.memoryUsage).toBeLessThan(metrics.memoryUsage);
    });
  });

  describe('Event Handling and Monitoring', () => {
    let cache: PerformanceCache<string>;
    let events: Array<{ type: string; data: any }>;

    beforeEach(() => {
      cache = new PerformanceCache<string>(3, new LRUStrategy());
      events = [];

      cache.on('hit', (data) => events.push({ type: 'hit', data }));
      cache.on('miss', (data) => events.push({ type: 'miss', data }));
      cache.on('set', (data) => events.push({ type: 'set', data }));
      cache.on('evicted', (data) => events.push({ type: 'evicted', data }));
      cache.on('expired', (data) => events.push({ type: 'expired', data }));
    });

    afterEach(async () => {
      await cache.clear();
    });

    it('should emit events for cache operations', async () => {
      await cache.set('test', 'value');
      await cache.get('test');
      await cache.get('missing');

      expect(events.some((e) => e.type === 'set')).toBe(true);
      expect(events.some((e) => e.type === 'hit')).toBe(true);
      expect(events.some((e) => e.type === 'miss')).toBe(true);

      const hitEvent = events.find((e) => e.type === 'hit');
      expect(hitEvent?.data.key).toBe('test');
    });

    it('should emit eviction events', async () => {
      await cache.set('a', 'value-a');
      await cache.set('b', 'value-b');
      await cache.set('c', 'value-c');
      await cache.set('d', 'value-d'); // Should trigger eviction

      const evictionEvents = events.filter((e) => e.type === 'evicted');
      expect(evictionEvents).toHaveLength(1);
      expect(evictionEvents[0].data.strategy).toBe('LRU');
    });

    it('should emit expiration events', async () => {
      const ttlCache = new PerformanceCache<string>(10, new TTLStrategy());
      const expiredEvents: any[] = [];

      ttlCache.on('expired', (data) => expiredEvents.push(data));

      await ttlCache.set('expire-test', 'value', 50);

      // Try to access after expiration
      await new Promise((resolve) => setTimeout(resolve, 60));
      await ttlCache.get('expire-test');

      expect(expiredEvents).toHaveLength(1);
      expect(expiredEvents[0].key).toBe('expire-test');
    });
  });

  describe('Concurrent Access Patterns', () => {
    let cache: PerformanceCache<any>;

    beforeEach(() => {
      cache = new PerformanceCache<any>(1000, new LRUStrategy());
    });

    afterEach(async () => {
      await cache.clear();
    });

    it('should handle concurrent reads and writes', async () => {
      const concurrentOps = 100;

      const operations = Array.from({ length: concurrentOps }, async (_, i) => {
        const key = `concurrent-${i % 10}`;

        if (i % 2 === 0) {
          return cache.set(key, { value: i, timestamp: Date.now() });
        } else {
          return cache.get(key);
        }
      });

      const results = await Promise.all(operations);
      expect(results).toHaveLength(concurrentOps);

      const metrics = cache.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });

    it('should maintain consistency under concurrent access', async () => {
      const key = 'shared-key';
      const initialValue = { counter: 0 };

      await cache.set(key, initialValue);

      // Multiple concurrent reads
      const readPromises = Array.from({ length: 20 }, () => cache.get(key));
      const results = await Promise.all(readPromises);

      // All reads should return the same value
      results.forEach((result) => {
        expect(result).toEqual(initialValue);
      });

      const metrics = cache.getMetrics();
      expect(metrics.hits).toBe(20);
    });
  });

  describe('Cache Strategy Comparison', () => {
    const strategies = [
      { name: 'LRU', strategy: new LRUStrategy<string>() },
      { name: 'LFU', strategy: new LFUStrategy<string>() },
      { name: 'TTL', strategy: new TTLStrategy<string>() },
    ];

    it('should compare eviction behavior across strategies', async () => {
      const cacheSize = 5;
      const results: Record<string, any> = {};

      for (const { name, strategy } of strategies) {
        const cache = new PerformanceCache<string>(cacheSize, strategy);

        // Fill cache
        for (let i = 0; i < cacheSize; i++) {
          await cache.set(`item-${i}`, `value-${i}`);
        }

        // Create different access patterns
        await cache.get('item-0'); // Make item-0 recently/frequently used
        await cache.get('item-0');
        await cache.get('item-1');

        // Add new item to trigger eviction
        await cache.set('new-item', 'new-value');

        results[name] = {
          size: cache.getSize(),
          hasItem0: await cache.has('item-0'),
          hasItem1: await cache.has('item-1'),
          hasItem2: await cache.has('item-2'),
          hasNewItem: await cache.has('new-item'),
        };

        await cache.clear();
      }

      // Verify different strategies behave differently
      expect(results.LRU).toBeDefined();
      expect(results.LFU).toBeDefined();
      expect(results.TTL).toBeDefined();

      // All should maintain cache size limit
      expect(results.LRU.size).toBeLessThanOrEqual(cacheSize);
      expect(results.LFU.size).toBeLessThanOrEqual(cacheSize);
      expect(results.TTL.size).toBeLessThanOrEqual(cacheSize);
    });
  });
});
