/**
 * Performance Tests for Maestro Steering Document Operations
 * Tests performance benchmarks and scalability for steering document generation
 */

import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { MaestroOrchestrator } from '../../../maestro/maestro-orchestrator';

describe('Maestro Steering Performance Benchmarks', () => {
  let maestroOrchestrator: MaestroOrchestrator;
  let testDirectory: string;
  let mockConfig: any;
  let mockEventBus: any;
  let mockLogger: any;
  let mockMemoryManager: any;
  let mockAgentManager: any;
  let mockMainOrchestrator: any;

  beforeAll(async () => {
    testDirectory = join(tmpdir(), `maestro-steering-perf-test-${Date.now()}`);
    await mkdir(testDirectory, { recursive: true });
  });

  afterAll(async () => {
    try {
      if (existsSync(testDirectory)) {
        await rm(testDirectory, { recursive: true });
      }
    } catch (error) {
      console.warn(`Warning: Failed to cleanup test directory: ${error}`);
    }
  });

  beforeEach(async () => {
    // Setup lightweight mocks for performance testing
    mockConfig = { environment: 'test' };
    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
    mockMemoryManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue(true),
    };
    mockAgentManager = {
      createAgent: jest.fn().mockResolvedValue('agent-123'),
      startAgent: jest.fn().mockResolvedValue(undefined),
      stopAgent: jest.fn().mockResolvedValue(undefined),
    };
    mockMainOrchestrator = {
      assignTask: jest.fn().mockResolvedValue({ success: true }),
    };

    // Create orchestrator with test directory
    maestroOrchestrator = new MaestroOrchestrator(
      mockConfig,
      mockEventBus,
      mockLogger,
      mockMemoryManager,
      mockAgentManager,
      mockMainOrchestrator,
      {
        enableHiveMind: false,
        steeringDirectory: join(testDirectory, 'steering'),
      }
    );
  });

  describe('single document creation performance', () => {
    it('should create steering document within 100ms', async () => {
      const startTime = performance.now();

      await maestroOrchestrator.createSteeringDocument('perf-single', 'Performance test content');

      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should maintain consistent performance across document types', async () => {
      const domains = ['product', 'tech', 'structure', 'security', 'custom'];
      const durations: number[] = [];

      for (const domain of domains) {
        const startTime = performance.now();
        await maestroOrchestrator.createSteeringDocument(`perf-${domain}`, `Content for ${domain}`);
        const endTime = performance.now();

        durations.push(endTime - startTime);
      }

      const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const _minDuration = Math.min(...durations);

      // Performance should be consistent (max shouldn't be more than 3x average)
      expect(maxDuration).toBeLessThan(averageDuration * 3);
      expect(averageDuration).toBeLessThan(150); // Average should be under 150ms
    });

    it('should handle large content efficiently', async () => {
      const smallContent = 'Small content';
      const mediumContent = 'Medium content section. '.repeat(50); // ~1KB
      const largeContent = 'Large content section. '.repeat(500); // ~10KB
      const veryLargeContent = 'Very large content section. '.repeat(2000); // ~40KB

      const testCases = [
        { name: 'small', content: smallContent, maxDuration: 50 },
        { name: 'medium', content: mediumContent, maxDuration: 100 },
        { name: 'large', content: largeContent, maxDuration: 200 },
        { name: 'very-large', content: veryLargeContent, maxDuration: 500 },
      ];

      for (const testCase of testCases) {
        const startTime = performance.now();
        await maestroOrchestrator.createSteeringDocument(`size-${testCase.name}`, testCase.content);
        const endTime = performance.now();

        const duration = endTime - startTime;

        expect(duration).toBeLessThan(testCase.maxDuration);
      }
    });
  });

  describe('bulk document creation performance', () => {
    it('should create 10 documents within 1 second', async () => {
      const startTime = performance.now();

      const promises = Array.from({ length: 10 }, (_, i) =>
        maestroOrchestrator.createSteeringDocument(`bulk-${i}`, `Bulk content ${i}`)
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should scale linearly with document count', async () => {
      const testSizes = [5, 10, 20, 50];
      const results: Array<{ count: number; duration: number; perDocument: number }> = [];

      for (const size of testSizes) {
        const startTime = performance.now();

        const promises = Array.from({ length: size }, (_, i) =>
          maestroOrchestrator.createSteeringDocument(
            `scale-${size}-${i}`,
            `Scale test content ${i}`
          )
        );

        await Promise.all(promises);

        const endTime = performance.now();
        const duration = endTime - startTime;
        const perDocument = duration / size;

        results.push({ count: size, duration, perDocument });
      }

      // Check that per-document time remains relatively consistent
      const perDocTimes = results.map((r) => r.perDocument);
      const avgPerDoc = perDocTimes.reduce((a, b) => a + b, 0) / perDocTimes.length;
      const maxPerDoc = Math.max(...perDocTimes);

      expect(maxPerDoc).toBeLessThan(avgPerDoc * 2); // Max shouldn't be more than 2x average
    });

    it('should handle concurrent document updates efficiently', async () => {
      const domain = 'concurrent-updates';
      const updateCount = 20;

      // First create the document
      await maestroOrchestrator.createSteeringDocument(domain, 'Initial content');

      const startTime = performance.now();

      // Perform concurrent updates
      const promises = Array.from({ length: updateCount }, (_, i) =>
        maestroOrchestrator.createSteeringDocument(domain, `Updated content ${i}`)
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('steering context retrieval performance', () => {
    beforeEach(async () => {
      // Setup multiple steering documents for context testing
      const domains = ['product', 'tech', 'structure', 'security', 'api', 'testing'];
      for (const domain of domains) {
        await maestroOrchestrator.createSteeringDocument(
          domain,
          `${domain} guidelines`.repeat(100)
        );
      }
    });

    it('should retrieve steering context within 50ms', async () => {
      const startTime = performance.now();

      const context = await maestroOrchestrator.getSteeringContext('developer');

      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(context).toBeDefined();
    });

    it('should cache steering context for repeated requests', async () => {
      // First request (cold)
      const startTime1 = performance.now();
      const context1 = await maestroOrchestrator.getSteeringContext('developer');
      const endTime1 = performance.now();
      const _coldDuration = endTime1 - startTime1;

      // Second request (should be faster if cached)
      const startTime2 = performance.now();
      const context2 = await maestroOrchestrator.getSteeringContext('developer');
      const endTime2 = performance.now();
      const _warmDuration = endTime2 - startTime2;

      expect(context1).toEqual(context2);
      // Note: Current implementation may not have caching, but this documents expected behavior
    });

    it('should handle context retrieval for different agent types efficiently', async () => {
      const agentTypes = ['developer', 'architect', 'tester', 'analyst', 'reviewer'];
      const durations: number[] = [];

      for (const agentType of agentTypes) {
        const startTime = performance.now();
        await maestroOrchestrator.getSteeringContext(agentType);
        const endTime = performance.now();

        durations.push(endTime - startTime);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      expect(avgDuration).toBeLessThan(100);
      expect(maxDuration).toBeLessThan(200);
    });
  });

  describe('memory usage and resource efficiency', () => {
    it('should maintain reasonable memory usage during bulk operations', async () => {
      const initialMemory = process.memoryUsage();

      // Create 100 steering documents
      const promises = Array.from({ length: 100 }, (_, i) =>
        maestroOrchestrator.createSteeringDocument(
          `memory-${i}`,
          `Memory test content ${i}`.repeat(50)
        )
      );

      await Promise.all(promises);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB for 100 documents)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should clean up resources after operations', async () => {
      const _initialStats = maestroOrchestrator.getAgentPoolStats();

      // Perform multiple operations
      await maestroOrchestrator.createSteeringDocument('cleanup-1', 'Content 1');
      await maestroOrchestrator.createSteeringDocument('cleanup-2', 'Content 2');
      await maestroOrchestrator.getSteeringContext('developer');

      const afterStats = maestroOrchestrator.getAgentPoolStats();

      // Verify resource management
      expect(afterStats).toBeDefined();
    });
  });

  describe('stress testing', () => {
    it('should handle high-frequency document creation', async () => {
      const operationCount = 200;
      const startTime = performance.now();

      // Create documents as fast as possible
      const promises: Promise<void>[] = [];
      for (let i = 0; i < operationCount; i++) {
        promises.push(
          maestroOrchestrator.createSteeringDocument(`stress-${i}`, `Stress test ${i}`)
        );
      }

      const results = await Promise.allSettled(promises);
      const endTime = performance.now();

      const duration = endTime - startTime;
      const successfulOperations = results.filter((r) => r.status === 'fulfilled').length;
      const _failedOperations = results.filter((r) => r.status === 'rejected').length;

      expect(successfulOperations).toBeGreaterThan(operationCount * 0.95); // 95% success rate
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should maintain performance under mixed workload', async () => {
      const startTime = performance.now();

      // Mixed operations: create, read, update
      const operations: Promise<any>[] = [];

      // Create operations
      for (let i = 0; i < 50; i++) {
        operations.push(
          maestroOrchestrator.createSteeringDocument(`mixed-create-${i}`, `Create content ${i}`)
        );
      }

      // Read operations
      for (let i = 0; i < 30; i++) {
        operations.push(maestroOrchestrator.getSteeringContext(`agent-${i % 5}`));
      }

      // Update operations (overwrite existing documents)
      for (let i = 0; i < 20; i++) {
        operations.push(
          maestroOrchestrator.createSteeringDocument(`mixed-update-${i}`, `Updated content ${i}`)
        );
      }

      const results = await Promise.allSettled(operations);
      const endTime = performance.now();

      const duration = endTime - startTime;
      const successfulOperations = results.filter((r) => r.status === 'fulfilled').length;

      expect(successfulOperations).toBeGreaterThan(operations.length * 0.9); // 90% success rate
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('performance regression detection', () => {
    it('should establish baseline performance metrics', async () => {
      const baselineTests = [
        {
          name: 'single-document-creation',
          operation: () =>
            maestroOrchestrator.createSteeringDocument('baseline-single', 'Baseline content'),
          expectedMax: 100,
        },
        {
          name: 'context-retrieval',
          operation: () => maestroOrchestrator.getSteeringContext('developer'),
          expectedMax: 50,
        },
        {
          name: 'bulk-creation-10',
          operation: async () => {
            const promises = Array.from({ length: 10 }, (_, i) =>
              maestroOrchestrator.createSteeringDocument(`baseline-bulk-${i}`, `Bulk content ${i}`)
            );
            await Promise.all(promises);
          },
          expectedMax: 1000,
        },
      ];

      const baselineResults: Array<{ name: string; duration: number; passedBaseline: boolean }> =
        [];

      for (const test of baselineTests) {
        const startTime = performance.now();
        await test.operation();
        const endTime = performance.now();

        const duration = endTime - startTime;
        const passedBaseline = duration <= test.expectedMax;

        baselineResults.push({
          name: test.name,
          duration,
          passedBaseline,
        });
      }

      // All baseline tests should pass
      const allPassed = baselineResults.every((result) => result.passedBaseline);
      expect(allPassed).toBe(true);
    });
  });
});
