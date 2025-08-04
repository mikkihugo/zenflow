/**
 * @fileoverview Performance and Load Testing for Hive Knowledge System
 * Tests system performance under various load conditions and measures key metrics
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { performance, PerformanceObserver } from 'perf_hooks';
import { EventEmitter } from 'node:events';
import { HiveKnowledgeBridge } from '../../coordination/hive-knowledge-bridge';
import { SwarmKnowledgeSync } from '../../coordination/swarm/knowledge-sync';

// Performance test configuration
const PERFORMANCE_CONFIG = {
  TIMEOUT: 30000, // 30 seconds timeout for performance tests
  CONCURRENT_REQUESTS: [10, 50, 100, 200],
  LOAD_TEST_DURATION: 10000, // 10 seconds
  EXPECTED_RESPONSE_TIME: 1000, // 1 second max response time
  EXPECTED_THROUGHPUT: 100, // requests per second
  MEMORY_THRESHOLD: 100 * 1024 * 1024, // 100MB memory threshold
};

// Performance metrics collector
class PerformanceMetrics {
  private measurements: Map<string, number[]> = new Map();
  private observer?: PerformanceObserver;

  start(): void {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!this.measurements.has(entry.name)) {
          this.measurements.set(entry.name, []);
        }
        this.measurements.get(entry.name)!.push(entry.duration);
      });
    });
    
    this.observer.observe({ entryTypes: ['measure'] });
  }

  stop(): void {
    this.observer?.disconnect();
  }

  mark(name: string): void {
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark: string): void {
    performance.measure(name, startMark, endMark);
  }

  getStats(name: string): { avg: number; min: number; max: number; p95: number; count: number } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      avg: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p95: sorted[Math.floor(count * 0.95)],
      count
    };
  }

  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }

  clear(): void {
    this.measurements.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// Mock implementations optimized for performance testing
class HighPerformanceMockHiveFACT extends EventEmitter {
  private facts = new Map<string, any>();
  private requestCount = 0;

  constructor() {
    super();
    this.seedLargeFacts();
  }

  private seedLargeFacts(): void {
    // Create a large number of facts for performance testing
    const domains = ['authentication', 'frontend', 'backend', 'database', 'security', 'performance'];
    const patterns = ['jwt', 'oauth', 'react', 'nodejs', 'mongodb', 'redis', 'encryption', 'caching'];
    
    for (let i = 0; i < 10000; i++) {
      const domain = domains[i % domains.length];
      const pattern = patterns[i % patterns.length];
      
      this.facts.set(`fact-${i}`, {
        id: `fact-${i}`,
        type: 'general',
        subject: `${pattern} in ${domain}`,
        content: {
          patterns: [pattern],
          bestPractices: [`Best practice for ${pattern}`],
          domain: domain
        },
        metadata: {
          source: 'hive-fact',
          timestamp: Date.now() - Math.random() * 86400000,
          confidence: 0.7 + Math.random() * 0.3
        },
        accessCount: Math.floor(Math.random() * 100),
        swarmAccess: new Set([`swarm-${i % 10}`])
      });
    }
  }

  async searchFacts(query: any): Promise<any[]> {
    this.requestCount++;
    
    // Simulate search with some processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    const results = Array.from(this.facts.values())
      .filter(fact => fact.subject.toLowerCase().includes(query.query.toLowerCase()))
      .slice(0, query.limit || 10);
      
    return results;
  }

  async getFact(type: string, subject: string, swarmId?: string): Promise<any> {
    this.requestCount++;
    
    // Simulate lookup time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
    
    const fact = Array.from(this.facts.values()).find(f => 
      f.type === type && f.subject.includes(subject)
    );
    
    if (fact && swarmId) {
      fact.accessCount++;
      fact.swarmAccess.add(swarmId);
    }
    
    return fact || null;
  }

  getStats() {
    return {
      memoryEntries: this.facts.size,
      persistentEntries: 0,
      totalMemorySize: this.facts.size * 1000, // Rough estimate
      cacheHitRate: 0.85,
      oldestEntry: Date.now() - 86400000,
      newestEntry: Date.now(),
      topDomains: ['hive-fact'],
      storageHealth: 'excellent' as const,
      requestCount: this.requestCount
    };
  }
}

class FastMockMemoryStore {
  private storage = new Map<string, any>();
  private operationCount = 0;

  async store(key: string, type: string, data: any): Promise<void> {
    this.operationCount++;
    // Simulate minimal storage time
    await new Promise(resolve => setTimeout(resolve, 1));
    this.storage.set(key, { type, data, timestamp: Date.now() });
  }

  async retrieve(key: string): Promise<any> {
    this.operationCount++;
    // Simulate minimal retrieval time
    await new Promise(resolve => setTimeout(resolve, 1));
    const entry = this.storage.get(key);
    return entry ? entry.data : null;
  }

  async clear(): Promise<void> {
    this.storage.clear();
    this.operationCount = 0;
  }

  getOperationCount(): number {
    return this.operationCount;
  }

  getSize(): number {
    return this.storage.size;
  }
}

describe('Hive Knowledge System - Performance Tests', () => {
  let metrics: PerformanceMetrics;
  let hiveFact: HighPerformanceMockHiveFACT;
  let memoryStore: FastMockMemoryStore;
  let hiveCoordinator: EventEmitter;
  let knowledgeBridge: HiveKnowledgeBridge;

  beforeAll(() => {
    metrics = new PerformanceMetrics();
    hiveFact = new HighPerformanceMockHiveFACT();
    memoryStore = new FastMockMemoryStore();
    hiveCoordinator = new EventEmitter();
  });

  beforeEach(async () => {
    metrics.clear();
    metrics.start();
    await memoryStore.clear();
    
    knowledgeBridge = new HiveKnowledgeBridge(hiveCoordinator as any, memoryStore as any);
    (knowledgeBridge as any).hiveFact = hiveFact;
    
    await knowledgeBridge.initialize();
  });

  afterEach(async () => {
    await knowledgeBridge.shutdown();
    metrics.stop();
  });

  afterAll(() => {
    metrics.stop();
  });

  describe('Response Time Performance', () => {
    test('should handle single knowledge queries within acceptable time', async () => {
      const swarm = new SwarmKnowledgeSync(
        { swarmId: 'perf-test-swarm', cacheSize: 1000 },
        memoryStore as any
      );
      await swarm.initialize();

      // Setup request handling
      setupPerformanceRequestHandler(knowledgeBridge, swarm);

      metrics.mark('query-start');
      const result = await swarm.queryKnowledge('authentication patterns', 'security');
      metrics.mark('query-end');
      metrics.measure('single-query', 'query-start', 'query-end');

      expect(result).toBeDefined();
      
      const stats = metrics.getStats('single-query');
      expect(stats).not.toBeNull();
      expect(stats!.avg).toBeLessThan(PERFORMANCE_CONFIG.EXPECTED_RESPONSE_TIME);
      
      await swarm.shutdown();
    }, PERFORMANCE_CONFIG.TIMEOUT);

    test('should maintain performance with cache hits', async () => {
      const swarm = new SwarmKnowledgeSync(
        { swarmId: 'cache-test-swarm', cacheSize: 1000 },
        memoryStore as any
      );
      await swarm.initialize();
      setupPerformanceRequestHandler(knowledgeBridge, swarm);

      // First query (cache miss)
      metrics.mark('first-query-start');
      await swarm.queryKnowledge('react patterns', 'frontend');
      metrics.mark('first-query-end');
      metrics.measure('cache-miss-query', 'first-query-start', 'first-query-end');

      // Second query (cache hit)
      metrics.mark('second-query-start');
      await swarm.queryKnowledge('react patterns', 'frontend');
      metrics.mark('second-query-end');
      metrics.measure('cache-hit-query', 'second-query-start', 'second-query-end');

      const missStats = metrics.getStats('cache-miss-query');
      const hitStats = metrics.getStats('cache-hit-query');

      expect(missStats).not.toBeNull();
      expect(hitStats).not.toBeNull();
      expect(hitStats!.avg).toBeLessThan(missStats!.avg);
      
      await swarm.shutdown();
    }, PERFORMANCE_CONFIG.TIMEOUT);
  });

  describe('Concurrent Request Handling', () => {
    test.each(PERFORMANCE_CONFIG.CONCURRENT_REQUESTS)(
      'should handle %d concurrent requests efficiently',
      async (requestCount) => {
        const swarms = Array.from({ length: Math.min(requestCount, 10) }, (_, i) => 
          new SwarmKnowledgeSync(
            { swarmId: `concurrent-swarm-${i}`, cacheSize: 100 },
            memoryStore as any
          )
        );

        await Promise.all(swarms.map(s => s.initialize()));
        swarms.forEach(s => setupPerformanceRequestHandler(knowledgeBridge, s));

        const queries = Array.from({ length: requestCount }, (_, i) => ({
          swarm: swarms[i % swarms.length],
          query: `test query ${i}`,
          domain: ['frontend', 'backend', 'security', 'database'][i % 4]
        }));

        metrics.mark(`concurrent-${requestCount}-start`);
        
        const promises = queries.map(async ({ swarm, query, domain }, index) => {
          metrics.mark(`request-${index}-start`);
          try {
            const result = await swarm.queryKnowledge(query, domain);
            metrics.mark(`request-${index}-end`);
            metrics.measure(`individual-request-${index}`, `request-${index}-start`, `request-${index}-end`);
            return result;
          } catch (error) {
            metrics.mark(`request-${index}-end`);
            metrics.measure(`individual-request-${index}`, `request-${index}-start`, `request-${index}-end`);
            throw error;
          }
        });

        const results = await Promise.allSettled(promises);
        
        metrics.mark(`concurrent-${requestCount}-end`);
        metrics.measure(`concurrent-${requestCount}`, `concurrent-${requestCount}-start`, `concurrent-${requestCount}-end`);

        // Analyze results
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        const concurrentStats = metrics.getStats(`concurrent-${requestCount}`);
        expect(concurrentStats).not.toBeNull();
        
        // At least 90% success rate
        expect(successful / requestCount).toBeGreaterThan(0.9);
        
        // Overall time should be reasonable
        expect(concurrentStats!.avg).toBeLessThan(PERFORMANCE_CONFIG.EXPECTED_RESPONSE_TIME * 2);

        console.log(`Concurrent ${requestCount}: ${successful} successful, ${failed} failed, ${concurrentStats!.avg.toFixed(2)}ms avg`);
        
        await Promise.all(swarms.map(s => s.shutdown()));
      },
      PERFORMANCE_CONFIG.TIMEOUT
    );
  });

  describe('Memory Usage and Leaks', () => {
    test('should maintain stable memory usage under load', async () => {
      const swarm = new SwarmKnowledgeSync(
        { swarmId: 'memory-test-swarm', cacheSize: 500 },
        memoryStore as any
      );
      await swarm.initialize();
      setupPerformanceRequestHandler(knowledgeBridge, swarm);

      const initialMemory = process.memoryUsage();
      
      // Perform many operations
      const operations = Array.from({ length: 1000 }, (_, i) => 
        swarm.queryKnowledge(`memory test ${i}`, 'performance')
      );

      await Promise.allSettled(operations);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_CONFIG.MEMORY_THRESHOLD);

      // Cache should respect size limits
      const stats = swarm.getStats();
      expect(stats.cacheSize).toBeLessThanOrEqual(500);

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      await swarm.shutdown();
    }, PERFORMANCE_CONFIG.TIMEOUT);

    test('should clean up resources properly', async () => {
      const swarms = Array.from({ length: 10 }, (_, i) => 
        new SwarmKnowledgeSync(
          { swarmId: `cleanup-swarm-${i}`, cacheSize: 100 },
          memoryStore as any
        )
      );

      await Promise.all(swarms.map(s => s.initialize()));
      swarms.forEach(s => setupPerformanceRequestHandler(knowledgeBridge, s));

      // Perform operations
      const operations = swarms.map(swarm => 
        swarm.queryKnowledge('cleanup test', 'performance')
      );
      await Promise.allSettled(operations);

      // Shutdown all swarms
      await Promise.all(swarms.map(s => s.shutdown()));

      // Verify cleanup
      const bridgeStats = knowledgeBridge.getStats();
      expect(bridgeStats.pendingRequests).toBe(0);

      // Memory store should have reasonable operation count
      const operationCount = memoryStore.getOperationCount();
      expect(operationCount).toBeGreaterThan(0); // Some operations occurred
      expect(operationCount).toBeLessThan(10000); // But not excessive
    }, PERFORMANCE_CONFIG.TIMEOUT);
  });

  describe('Throughput and Scalability', () => {
    test('should achieve target throughput under sustained load', async () => {
      const swarms = Array.from({ length: 5 }, (_, i) => 
        new SwarmKnowledgeSync(
          { swarmId: `throughput-swarm-${i}`, cacheSize: 200 },
          memoryStore as any
        )
      );

      await Promise.all(swarms.map(s => s.initialize()));
      swarms.forEach(s => setupPerformanceRequestHandler(knowledgeBridge, s));

      let requestCount = 0;
      const startTime = Date.now();
      const duration = PERFORMANCE_CONFIG.LOAD_TEST_DURATION;

      const loadTest = async () => {
        const endTime = startTime + duration;
        const promises: Promise<any>[] = [];

        while (Date.now() < endTime) {
          const swarm = swarms[requestCount % swarms.length];
          const promise = swarm.queryKnowledge(`load test ${requestCount}`, 'performance')
            .then(() => requestCount++)
            .catch(() => {/* ignore errors for throughput test */});
          
          promises.push(promise);
          
          // Small delay to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        await Promise.allSettled(promises);
      };

      await loadTest();

      const actualDuration = Date.now() - startTime;
      const throughput = (requestCount / actualDuration) * 1000; // requests per second

      console.log(`Throughput test: ${requestCount} requests in ${actualDuration}ms = ${throughput.toFixed(2)} req/sec`);

      // Should achieve reasonable throughput
      expect(throughput).toBeGreaterThan(10); // At least 10 req/sec
      
      await Promise.all(swarms.map(s => s.shutdown()));
    }, PERFORMANCE_CONFIG.TIMEOUT);
  });

  describe('System Health Under Stress', () => {
    test('should maintain system health metrics under stress', async () => {
      const swarm = new SwarmKnowledgeSync(
        { swarmId: 'stress-test-swarm', cacheSize: 1000 },
        memoryStore as any
      );
      await swarm.initialize();
      setupPerformanceRequestHandler(knowledgeBridge, swarm);

      // Generate stress load
      const stressOperations = [
        // Queries
        ...Array.from({ length: 200 }, (_, i) => 
          swarm.queryKnowledge(`stress query ${i}`, 'performance')
        ),
        // Contributions
        ...Array.from({ length: 50 }, (_, i) => 
          swarm.contributeKnowledge({
            type: 'optimization',
            domain: 'performance',
            context: {
              taskType: 'stress-test',
              agentTypes: ['stress-agent'],
              inputSize: i,
              complexity: 'high'
            },
            outcome: {
              success: true,
              duration: 1000 + Math.random() * 1000,
              quality: 0.8 + Math.random() * 0.2,
              efficiency: 0.7 + Math.random() * 0.3
            },
            insights: {
              whatWorked: [`optimization-${i}`],
              whatFailed: [],
              optimizations: [`technique-${i}`],
              bestPractices: [`practice-${i}`]
            },
            confidence: 0.8 + Math.random() * 0.2
          }, `stress-agent-${i}`)
        ),
        // Subscriptions
        ...Array.from({ length: 20 }, (_, i) => 
          swarm.subscribeToDomain(`stress-domain-${i}`)
        )
      ];

      const results = await Promise.allSettled(stressOperations);
      
      // Analyze system health
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const successRate = successful / results.length;

      console.log(`Stress test: ${successful}/${results.length} operations successful (${(successRate * 100).toFixed(1)}%)`);

      // Should maintain reasonable success rate under stress
      expect(successRate).toBeGreaterThan(0.8);

      // System should still be responsive
      const stats = swarm.getStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
      expect(stats.cacheSize).toBeLessThanOrEqual(1000);

      const bridgeStats = knowledgeBridge.getStats();
      expect(bridgeStats.registeredSwarms).toBeGreaterThan(0);

      await swarm.shutdown();
    }, PERFORMANCE_CONFIG.TIMEOUT * 2);
  });

  describe('Performance Regression Detection', () => {
    test('should detect performance regression in knowledge queries', async () => {
      const swarm = new SwarmKnowledgeSync(
        { swarmId: 'regression-test-swarm', cacheSize: 100 },
        memoryStore as any
      );
      await swarm.initialize();
      setupPerformanceRequestHandler(knowledgeBridge, swarm);

      // Baseline performance measurement
      const baselineQueries = Array.from({ length: 50 }, (_, i) => ({
        query: `baseline query ${i}`,
        domain: 'performance'
      }));

      metrics.mark('baseline-start');
      const baselinePromises = baselineQueries.map(({ query, domain }) => 
        swarm.queryKnowledge(query, domain)
      );
      await Promise.allSettled(baselinePromises);
      metrics.mark('baseline-end');
      metrics.measure('baseline-performance', 'baseline-start', 'baseline-end');

      // Simulate some system changes (cache filling)
      const cacheFillingQueries = Array.from({ length: 100 }, (_, i) => 
        swarm.queryKnowledge(`cache filler ${i}`, 'various')
      );
      await Promise.allSettled(cacheFillingQueries);

      // Performance measurement after changes
      metrics.mark('after-changes-start');
      const afterChangesPromises = baselineQueries.map(({ query, domain }) => 
        swarm.queryKnowledge(query, domain)
      );
      await Promise.allSettled(afterChangesPromises);
      metrics.mark('after-changes-end');
      metrics.measure('after-changes-performance', 'after-changes-start', 'after-changes-end');

      const baselineStats = metrics.getStats('baseline-performance');
      const afterChangesStats = metrics.getStats('after-changes-performance');

      expect(baselineStats).not.toBeNull();
      expect(afterChangesStats).not.toBeNull();

      const regressionRatio = afterChangesStats!.avg / baselineStats!.avg;
      
      console.log(`Performance regression test: ${baselineStats!.avg.toFixed(2)}ms -> ${afterChangesStats!.avg.toFixed(2)}ms (${regressionRatio.toFixed(2)}x)`);

      // Should not have significant performance regression
      // After cache warming, performance should actually improve
      expect(regressionRatio).toBeLessThan(2.0); // Allow up to 2x slowdown

      await swarm.shutdown();
    }, PERFORMANCE_CONFIG.TIMEOUT);
  });
});

// Helper function to setup performant request handling
function setupPerformanceRequestHandler(bridge: HiveKnowledgeBridge, swarm: SwarmKnowledgeSync): void {
  swarm.on('knowledge:request', async (request: any) => {
    try {
      const response = await bridge.processKnowledgeRequest(request);
      swarm.emit('knowledge:response', response);
    } catch (error) {
      const errorResponse = {
        requestId: request.requestId,
        swarmId: request.swarmId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          source: 'hive-fact',
          timestamp: Date.now(),
          confidence: 0,
          cacheHit: false
        }
      };
      swarm.emit('knowledge:response', errorResponse);
    }
  });
}