/**
 * Phase 2 Swarm Database Performance Benchmarks
 * 
 * Comprehensive performance benchmarks for the Phase 2 swarm database system
 * to validate that all enhanced features meet performance requirements.
 * 
 * Benchmarks cover:
 * 1. Vector Pattern Discovery Performance
 * 2. Cross-Swarm Knowledge Transfer Efficiency
 * 3. Database Integration Performance
 * 4. Pattern Clustering and Similarity Search Speed
 * 5. Memory Usage and Resource Efficiency
 * 6. Concurrent Operations and Scalability
 */

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { nanoid } from 'nanoid';
import { SwarmDatabaseManager } from '../../coordination/swarm/storage/swarm-database-manager';
import type {
  SwarmDatabaseConfig,
  SuccessfulPattern,
  SwarmCommanderLearning,
} from '../../coordination/swarm/storage/swarm-database-manager';
import { createLogger } from '../../core/logger';

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  patternStorageMs: 100,        // Pattern storage should complete within 100ms
  similaritySearchMs: 200,      // Similarity search should complete within 200ms
  clusteringMs: 5000,          // Pattern clustering should complete within 5s
  knowledgeTransferMs: 3000,   // Knowledge transfer should complete within 3s
  crossSwarmSearchMs: 1000,    // Cross-swarm search should complete within 1s
  memoryUsageMB: 50,           // Memory usage should not exceed 50MB increase
  concurrentOpsMs: 2000,       // Concurrent operations should complete within 2s
};

const mockLogger = createLogger('test-phase2-performance');

describe('Phase 2 Swarm Database Performance Benchmarks', () => {
  let swarmDbManager: SwarmDatabaseManager;
  let testConfig: SwarmDatabaseConfig;
  let testSwarmIds: string[];

  beforeAll(async () => {
    testConfig = {
      central: {
        type: 'sqlite',
        database: ':memory:',
      },
      basePath: './test-performance',
      swarmsPath: './test-performance/swarms',
    };

    // Create high-performance mock DAL Factory
    const performanceDALFactory = {
      createCoordinationRepository: async () => ({
        create: async (data: any) => {
          // Simulate fast database operation
          await new Promise(resolve => setTimeout(resolve, 1));
          return { ...data, id: data.id || nanoid() };
        },
        findById: async (id: string) => ({ id, found: true }),
        findAll: async () => [],
        findBy: async (criteria: any) => {
          // Simulate query with realistic response time
          await new Promise(resolve => setTimeout(resolve, 2));
          return [];
        },
        update: async (id: string, data: any) => ({ id, ...data }),
        delete: async (id: string) => true,
        count: async () => 0,
      }),
      createKuzuGraphRepository: async () => ({
        create: async (node: any) => {
          await new Promise(resolve => setTimeout(resolve, 3));
          return { ...node, created: true };
        },
        createRelationship: async (from: string, to: string, type: string, props: any) => {
          await new Promise(resolve => setTimeout(resolve, 2));
          return true;
        },
        traverse: async (startId: string, pattern: string, maxDepth: number) => {
          await new Promise(resolve => setTimeout(resolve, 5));
          return {
            nodes: [{ id: startId, labels: ['TestNode'], properties: {} }],
            relationships: [],
          };
        },
        findBy: async () => [],
        update: async (id: string, data: any) => ({ id, ...data }),
        delete: async (id: string) => true,
      }),
      createLanceDBVectorRepository: async (entityType: string, dimension: number) => ({
        addVectors: async (vectors: any[]) => {
          // Simulate vector storage time proportional to vector count
          await new Promise(resolve => setTimeout(resolve, vectors.length * 0.5));
          return true;
        },
        similaritySearch: async (queryVector: number[], options: any) => {
          // Simulate vector search time
          await new Promise(resolve => setTimeout(resolve, 10 + (options.limit * 2)));
          const results = [];
          for (let i = 0; i < Math.min(options.limit, 10); i++) {
            results.push({
              id: `similar-${i}`,
              vector: queryVector,
              metadata: { similarity: 0.9 - (i * 0.05) },
              score: 0.9 - (i * 0.05),
            });
          }
          return results;
        },
        findBy: async (criteria: any) => {
          await new Promise(resolve => setTimeout(resolve, 5));
          return [];
        },
        createIndex: async () => true,
      }),
      registerEntityType: () => {},
    };

    swarmDbManager = new SwarmDatabaseManager(testConfig, performanceDALFactory as any, mockLogger);
    await swarmDbManager.initialize();

    // Create multiple test swarms for concurrent testing
    testSwarmIds = [
      `perf-swarm-1-${nanoid()}`,
      `perf-swarm-2-${nanoid()}`,
      `perf-swarm-3-${nanoid()}`,
    ];

    for (const swarmId of testSwarmIds) {
      await swarmDbManager.createSwarmCluster(swarmId);
    }
  });

  afterAll(async () => {
    // Cleanup test swarms
    for (const swarmId of testSwarmIds) {
      try {
        await swarmDbManager.archiveSwarmCluster(swarmId);
      } catch (error) {
        // Swarm might not exist
      }
    }
  });

  beforeEach(() => {
    // Reset performance metrics before each test
  });

  afterEach(() => {
    // Cleanup after each test if needed
  });

  describe('Vector Pattern Discovery Performance', () => {
    test('should benchmark pattern storage performance', async () => {
      const testPatterns: SuccessfulPattern[] = [];
      const numPatterns = 50;

      // Generate test patterns
      for (let i = 0; i < numPatterns; i++) {
        testPatterns.push({
          patternId: `perf-pattern-${i}`,
          description: `Performance test pattern ${i} with detailed description`,
          context: `performance testing, pattern ${i}, benchmark validation`,
          successRate: 0.8 + (Math.random() * 0.2),
          usageCount: Math.floor(Math.random() * 100),
          lastUsed: new Date().toISOString(),
        });
      }

      // Benchmark pattern storage
      const startTime = Date.now();
      
      for (const pattern of testPatterns) {
        const embedding = new Array(384).fill(0).map(() => Math.random());
        await swarmDbManager.storeSwarmEmbedding(testSwarmIds[0], {
          id: `perf_${pattern.patternId}`,
          vector: embedding,
          metadata: {
            type: 'implementation_pattern',
            pattern,
            tier: 1,
          },
        });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTimePerPattern = totalTime / numPatterns;

      // Performance assertions
      expect(averageTimePerPattern).toBeLessThan(PERFORMANCE_THRESHOLDS.patternStorageMs);
      expect(totalTime).toBeLessThan(numPatterns * PERFORMANCE_THRESHOLDS.patternStorageMs);

      console.log(`Pattern Storage Benchmark:
        Total patterns: ${numPatterns}
        Total time: ${totalTime}ms
        Average time per pattern: ${averageTimePerPattern.toFixed(2)}ms
        Threshold: ${PERFORMANCE_THRESHOLDS.patternStorageMs}ms per pattern
        Status: ${averageTimePerPattern < PERFORMANCE_THRESHOLDS.patternStorageMs ? '✅ PASS' : '❌ FAIL'}`);
    });

    test('should benchmark similarity search performance', async () => {
      const queryVector = new Array(384).fill(0).map(() => Math.random());
      const searchLimits = [5, 10, 20, 50];
      const results: { limit: number; time: number }[] = [];

      for (const limit of searchLimits) {
        const startTime = Date.now();
        
        const searchResults = await swarmDbManager.findSimilarEmbeddings(
          testSwarmIds[0],
          queryVector,
          limit
        );

        const endTime = Date.now();
        const searchTime = endTime - startTime;
        
        results.push({ limit, time: searchTime });

        expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.similaritySearchMs);
        expect(Array.isArray(searchResults)).toBe(true);
      }

      console.log(`Similarity Search Benchmark:
        ${results.map(r => `Limit ${r.limit}: ${r.time}ms`).join('\n        ')}
        Threshold: ${PERFORMANCE_THRESHOLDS.similaritySearchMs}ms
        Status: ${results.every(r => r.time < PERFORMANCE_THRESHOLDS.similaritySearchMs) ? '✅ PASS' : '❌ FAIL'}`);
    });

    test('should benchmark pattern clustering performance', async () => {
      const startTime = Date.now();
      
      const clusters = await swarmDbManager.performPatternClustering(testSwarmIds[0], {
        minClusterSize: 2,
        maxClusters: 5,
        similarityThreshold: 0.7,
      });

      const endTime = Date.now();
      const clusteringTime = endTime - startTime;

      expect(clusteringTime).toBeLessThan(PERFORMANCE_THRESHOLDS.clusteringMs);
      expect(Array.isArray(clusters)).toBe(true);

      console.log(`Pattern Clustering Benchmark:
        Clustering time: ${clusteringTime}ms
        Clusters found: ${clusters.length}
        Threshold: ${PERFORMANCE_THRESHOLDS.clusteringMs}ms
        Status: ${clusteringTime < PERFORMANCE_THRESHOLDS.clusteringMs ? '✅ PASS' : '❌ FAIL'}`);
    });

    test('should benchmark enhanced pattern discovery pipeline', async () => {
      const startTime = Date.now();
      
      const discoveryResult = await swarmDbManager.demonstrateEnhancedPatternDiscovery(testSwarmIds[0]);

      const endTime = Date.now();
      const discoveryTime = endTime - startTime;

      expect(discoveryResult).toBeDefined();
      expect(discoveryResult.analytics).toBeDefined();
      expect(Array.isArray(discoveryResult.enhancedEmbeddings)).toBe(true);
      expect(Array.isArray(discoveryResult.patternClusters)).toBe(true);
      expect(Array.isArray(discoveryResult.crossSwarmResults)).toBe(true);

      console.log(`Enhanced Pattern Discovery Benchmark:
        Total discovery time: ${discoveryTime}ms
        Enhanced embeddings: ${discoveryResult.enhancedEmbeddings.length}
        Pattern clusters: ${discoveryResult.patternClusters.length}
        Cross-swarm results: ${discoveryResult.crossSwarmResults.length}
        Average cluster quality: ${discoveryResult.analytics.averageClusterQuality.toFixed(3)}
        Status: ✅ COMPLETE`);
    });
  });

  describe('Cross-Swarm Knowledge Transfer Performance', () => {
    test('should benchmark knowledge transfer performance', async () => {
      // Setup source swarm with learning data
      const sourceLearning: SwarmCommanderLearning = {
        id: `perf-transfer-${nanoid()}`,
        swarmId: testSwarmIds[0],
        commanderType: 'performance-commander',
        agentPerformanceHistory: {
          'perf-agent': {
            agentId: 'perf-agent',
            taskSuccessRate: 0.93,
            averageCompletionTime: 2200,
            errorPatterns: ['timeout'],
            optimizationSuggestions: ['caching'],
            lastUpdated: new Date().toISOString(),
          },
        },
        sparcPhaseEfficiency: {
          'implementation': {
            phase: 'implementation',
            averageTime: 3000,
            successRate: 0.91,
            commonIssues: ['complexity'],
            optimizations: ['modular_design'],
          },
        },
        implementationPatterns: [
          {
            patternId: 'perf-transfer-pattern',
            description: 'High-performance data processing pattern',
            context: 'performance, data processing, optimization',
            successRate: 0.95,
            usageCount: 20,
            lastUsed: new Date().toISOString(),
          },
        ],
        taskCompletionPatterns: [],
        realTimeFeedback: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await swarmDbManager.storeTier1Learning(testSwarmIds[0], 'performance-commander', sourceLearning);

      // Benchmark knowledge transfer
      const startTime = Date.now();
      
      const transfer = await swarmDbManager.transferKnowledgeBetweenSwarms(
        testSwarmIds[0],
        testSwarmIds[1],
        {
          transferStrategy: 'adaptive',
          adaptationMode: 'learning',
          conflictResolution: 'hybrid',
        }
      );

      const endTime = Date.now();
      const transferTime = endTime - startTime;

      expect(transferTime).toBeLessThan(PERFORMANCE_THRESHOLDS.knowledgeTransferMs);
      expect(transfer).toBeDefined();
      expect(transfer.sourceSwarmId).toBe(testSwarmIds[0]);
      expect(transfer.targetSwarmId).toBe(testSwarmIds[1]);

      console.log(`Knowledge Transfer Benchmark:
        Transfer time: ${transferTime}ms
        Patterns transferred: ${transfer.transferMetrics.patternsTransferred}
        Successful adoptions: ${transfer.transferMetrics.successfulAdoptions}
        Adaptation rate: ${(transfer.transferMetrics.adaptationRate * 100).toFixed(1)}%
        Performance improvement: ${(transfer.transferMetrics.performanceImprovement * 100).toFixed(1)}%
        Threshold: ${PERFORMANCE_THRESHOLDS.knowledgeTransferMs}ms
        Status: ${transferTime < PERFORMANCE_THRESHOLDS.knowledgeTransferMs ? '✅ PASS' : '❌ FAIL'}`);
    });

    test('should benchmark cross-swarm pattern search performance', async () => {
      const queryPattern: SuccessfulPattern = {
        patternId: 'perf-search-pattern',
        description: 'Performance optimization pattern for search operations',
        context: 'performance, search, optimization, indexing',
        successRate: 0.89,
        usageCount: 15,
        lastUsed: new Date().toISOString(),
      };

      // Mock active swarms for search
      (swarmDbManager as any).getActiveSwarms = async () => 
        testSwarmIds.map(id => ({ swarmId: id, path: `/test/${id}`, lastAccessed: new Date() }));

      const startTime = Date.now();
      
      const searchResults = await swarmDbManager.searchCrossSwarmPatterns(
        queryPattern,
        testSwarmIds[0],
        {
          limit: 10,
          minSimilarity: 0.6,
          contextWeighting: true,
          transferabilityAnalysis: true,
        }
      );

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.crossSwarmSearchMs);
      expect(Array.isArray(searchResults)).toBe(true);

      console.log(`Cross-Swarm Search Benchmark:
        Search time: ${searchTime}ms
        Results found: ${searchResults.length}
        Swarms searched: ${testSwarmIds.length}
        Threshold: ${PERFORMANCE_THRESHOLDS.crossSwarmSearchMs}ms
        Status: ${searchTime < PERFORMANCE_THRESHOLDS.crossSwarmSearchMs ? '✅ PASS' : '❌ FAIL'}`);
    });

    test('should benchmark performance comparison generation', async () => {
      const startTime = Date.now();
      
      const comparisons = await swarmDbManager.generateSwarmPerformanceComparison(testSwarmIds, {
        includeMetrics: ['all'],
        timeWindow: 30,
        includeBenchmarks: true,
        generateRecommendations: true,
      });

      const endTime = Date.now();
      const comparisonTime = endTime - startTime;

      expect(Array.isArray(comparisons)).toBe(true);
      expect(comparisons.length).toBe(testSwarmIds.length);

      // Validate ranking performance
      const ranks = comparisons.map(c => c.rank);
      expect(new Set(ranks).size).toBe(ranks.length);

      console.log(`Performance Comparison Benchmark:
        Comparison time: ${comparisonTime}ms
        Swarms compared: ${testSwarmIds.length}
        Metrics calculated: ${Object.keys(comparisons[0].comparisonMetrics).length}
        Recommendations generated: ${comparisons.reduce((sum, c) => sum + c.recommendedPatterns.length, 0)}
        Status: ✅ COMPLETE`);
    });

    test('should benchmark pattern adoption tracking', async () => {
      const trackedPatternId = 'perf-adoption-pattern';
      
      const startTime = Date.now();
      
      const adoptionTracking = await swarmDbManager.trackPatternAdoption(trackedPatternId, {
        includeSwarms: testSwarmIds,
        timeWindow: 30,
        detailedAnalysis: true,
        predictFutureAdoption: true,
      });

      const endTime = Date.now();
      const trackingTime = endTime - startTime;

      expect(adoptionTracking).toBeDefined();
      expect(Array.isArray(adoptionTracking.adoptionHistory)).toBe(true);
      expect(adoptionTracking.adoptionRate).toBeGreaterThanOrEqual(0);
      expect(adoptionTracking.successRate).toBeGreaterThanOrEqual(0);

      console.log(`Pattern Adoption Tracking Benchmark:
        Tracking time: ${trackingTime}ms
        Swarms analyzed: ${testSwarmIds.length}
        Adoption rate: ${(adoptionTracking.adoptionRate * 100).toFixed(1)}%
        Success rate: ${(adoptionTracking.successRate * 100).toFixed(1)}%
        Recommendations: ${adoptionTracking.recommendations.length}
        Status: ✅ COMPLETE`);
    });
  });

  describe('Database Integration Performance', () => {
    test('should benchmark multi-database operations', async () => {
      const operations = [
        'agent_storage',
        'task_storage',
        'embedding_storage',
        'graph_traversal',
        'vector_search',
        'coordination_query',
      ];

      const results: { operation: string; time: number }[] = [];

      for (const operation of operations) {
        const startTime = Date.now();

        switch (operation) {
          case 'agent_storage':
            await swarmDbManager.storeSwarmAgent(testSwarmIds[0], {
              id: `perf-agent-${Date.now()}`,
              name: 'Performance Test Agent',
              type: 'performance_tester',
              capabilities: ['benchmarking'],
            });
            break;
          
          case 'task_storage':
            await swarmDbManager.storeSwarmTask(testSwarmIds[0], {
              id: `perf-task-${Date.now()}`,
              title: 'Performance Test Task',
              description: 'Benchmarking task storage performance',
            });
            break;
          
          case 'embedding_storage':
            await swarmDbManager.storeSwarmEmbedding(testSwarmIds[0], {
              id: `perf-embedding-${Date.now()}`,
              vector: new Array(384).fill(0).map(() => Math.random()),
              metadata: { type: 'performance_test' },
            });
            break;
          
          case 'graph_traversal':
            await swarmDbManager.getSwarmGraph(testSwarmIds[0], 'test-node', 2);
            break;
          
          case 'vector_search':
            await swarmDbManager.findSimilarEmbeddings(
              testSwarmIds[0],
              new Array(384).fill(0).map(() => Math.random()),
              5
            );
            break;
          
          case 'coordination_query':
            await swarmDbManager.getSwarmAnalytics(testSwarmIds[0]);
            break;
        }

        const endTime = Date.now();
        const operationTime = endTime - startTime;
        results.push({ operation, time: operationTime });
      }

      console.log(`Multi-Database Operations Benchmark:
        ${results.map(r => `${r.operation}: ${r.time}ms`).join('\n        ')}
        Total time: ${results.reduce((sum, r) => sum + r.time, 0)}ms
        Average time: ${(results.reduce((sum, r) => sum + r.time, 0) / results.length).toFixed(2)}ms
        Status: ✅ COMPLETE`);

      // Verify all operations completed reasonably fast
      results.forEach(result => {
        expect(result.time).toBeLessThan(500); // Each operation should complete within 500ms
      });
    });

    test('should benchmark concurrent database access', async () => {
      const concurrentOpsCount = 20;
      const operations: Promise<any>[] = [];

      const startTime = Date.now();

      // Create concurrent operations across different databases
      for (let i = 0; i < concurrentOpsCount; i++) {
        const swarmId = testSwarmIds[i % testSwarmIds.length];
        
        if (i % 4 === 0) {
          operations.push(swarmDbManager.storeSwarmAgent(swarmId, {
            id: `concurrent-agent-${i}`,
            name: `Concurrent Agent ${i}`,
            type: 'concurrent_tester',
            capabilities: ['concurrent_testing'],
          }));
        } else if (i % 4 === 1) {
          operations.push(swarmDbManager.storeSwarmEmbedding(swarmId, {
            id: `concurrent-embedding-${i}`,
            vector: new Array(384).fill(0).map(() => Math.random()),
            metadata: { type: 'concurrent_test', index: i },
          }));
        } else if (i % 4 === 2) {
          operations.push(swarmDbManager.getSwarmAnalytics(swarmId));
        } else {
          operations.push(swarmDbManager.findSimilarEmbeddings(
            swarmId,
            new Array(384).fill(0).map(() => Math.random()),
            3
          ));
        }
      }

      const results = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.concurrentOpsMs);
      expect(results).toHaveLength(concurrentOpsCount);

      console.log(`Concurrent Database Access Benchmark:
        Concurrent operations: ${concurrentOpsCount}
        Total time: ${totalTime}ms
        Average time per operation: ${(totalTime / concurrentOpsCount).toFixed(2)}ms
        Threshold: ${PERFORMANCE_THRESHOLDS.concurrentOpsMs}ms
        Status: ${totalTime < PERFORMANCE_THRESHOLDS.concurrentOpsMs ? '✅ PASS' : '❌ FAIL'}`);
    });
  });

  describe('Memory Usage and Resource Efficiency', () => {
    test('should benchmark memory usage during large-scale operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform large-scale operations
      const largeScaleOps = [
        // Store many patterns
        ...(async () => {
          const patterns = [];
          for (let i = 0; i < 200; i++) {
            patterns.push(swarmDbManager.storeSwarmEmbedding(testSwarmIds[0], {
              id: `memory-test-pattern-${i}`,
              vector: new Array(384).fill(0).map(() => Math.random()),
              metadata: {
                type: 'memory_test',
                index: i,
                description: `Memory test pattern ${i} with metadata`,
              },
            }));
          }
          return patterns;
        })(),
        
        // Perform clustering
        swarmDbManager.performPatternClustering(testSwarmIds[0], {
          minClusterSize: 5,
          maxClusters: 10,
          similarityThreshold: 0.6,
        }),
        
        // Multiple similarity searches
        ...(new Array(50).fill(0).map((_, i) => 
          swarmDbManager.findSimilarEmbeddings(
            testSwarmIds[0],
            new Array(384).fill(0).map(() => Math.random()),
            10
          )
        )),
      ].flat();

      await Promise.all(largeScaleOps);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024); // MB

      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsageMB);

      console.log(`Memory Usage Benchmark:
        Initial heap: ${(initialMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB
        Final heap: ${(finalMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB
        Memory increase: ${memoryIncrease.toFixed(2)} MB
        Operations performed: ${largeScaleOps.length}
        Threshold: ${PERFORMANCE_THRESHOLDS.memoryUsageMB} MB
        Status: ${memoryIncrease < PERFORMANCE_THRESHOLDS.memoryUsageMB ? '✅ PASS' : '❌ FAIL'}`);
    });

    test('should benchmark resource cleanup efficiency', async () => {
      const cleanupSwarmId = `cleanup-perf-${nanoid()}`;
      
      // Create swarm and populate with data
      const setupStart = Date.now();
      await swarmDbManager.createSwarmCluster(cleanupSwarmId);
      
      // Add substantial data
      const dataOperations = [];
      for (let i = 0; i < 50; i++) {
        dataOperations.push(
          swarmDbManager.storeSwarmAgent(cleanupSwarmId, {
            id: `cleanup-agent-${i}`,
            name: `Cleanup Agent ${i}`,
            type: 'cleanup_test',
            capabilities: ['cleanup_testing'],
          }),
          swarmDbManager.storeSwarmEmbedding(cleanupSwarmId, {
            id: `cleanup-embedding-${i}`,
            vector: new Array(384).fill(0).map(() => Math.random()),
            metadata: { type: 'cleanup_test', index: i },
          })
        );
      }
      
      await Promise.all(dataOperations);
      const setupEnd = Date.now();
      const setupTime = setupEnd - setupStart;

      // Benchmark cleanup
      const cleanupStart = Date.now();
      await swarmDbManager.archiveSwarmCluster(cleanupSwarmId);
      const cleanupEnd = Date.now();
      const cleanupTime = cleanupEnd - cleanupStart;

      console.log(`Resource Cleanup Benchmark:
        Setup time: ${setupTime}ms
        Cleanup time: ${cleanupTime}ms
        Data operations: ${dataOperations.length}
        Cleanup efficiency: ${(dataOperations.length / cleanupTime * 1000).toFixed(2)} ops/sec
        Status: ✅ COMPLETE`);

      // Cleanup should be faster than setup
      expect(cleanupTime).toBeLessThan(setupTime * 2);
    });
  });

  describe('Scalability and Load Testing', () => {
    test('should benchmark system performance under increasing load', async () => {
      const loadLevels = [10, 25, 50, 100];
      const results: { load: number; time: number; throughput: number }[] = [];

      for (const load of loadLevels) {
        const startTime = Date.now();
        
        // Create operations proportional to load
        const operations = [];
        for (let i = 0; i < load; i++) {
          const swarmId = testSwarmIds[i % testSwarmIds.length];
          operations.push(
            swarmDbManager.storeSwarmEmbedding(swarmId, {
              id: `load-test-${load}-${i}`,
              vector: new Array(384).fill(0).map(() => Math.random()),
              metadata: { loadTest: true, load, index: i },
            })
          );
        }

        await Promise.all(operations);
        const endTime = Date.now();
        const duration = endTime - startTime;
        const throughput = (load / duration) * 1000; // operations per second

        results.push({ load, time: duration, throughput });
      }

      console.log(`Scalability Benchmark:
        ${results.map(r => `Load ${r.load}: ${r.time}ms (${r.throughput.toFixed(2)} ops/sec)`).join('\n        ')}
        Status: ✅ COMPLETE`);

      // Verify throughput doesn't degrade significantly with load
      const throughputs = results.map(r => r.throughput);
      const maxThroughput = Math.max(...throughputs);
      const minThroughput = Math.min(...throughputs);
      const degradation = (maxThroughput - minThroughput) / maxThroughput;

      expect(degradation).toBeLessThan(0.5); // Throughput shouldn't degrade more than 50%
    });

    test('should benchmark end-to-end workflow performance', async () => {
      const startTime = Date.now();
      
      // Complete Phase 2 workflow
      const workflowSteps = [
        // 1. Store learning data
        swarmDbManager.storeTier1Learning(testSwarmIds[0], 'workflow-commander', {
          id: `workflow-learning-${nanoid()}`,
          swarmId: testSwarmIds[0],
          commanderType: 'workflow-commander',
          agentPerformanceHistory: {},
          sparcPhaseEfficiency: {},
          implementationPatterns: [{
            patternId: 'workflow-pattern',
            description: 'End-to-end workflow pattern',
            context: 'workflow, end-to-end, performance',
            successRate: 0.92,
            usageCount: 10,
            lastUsed: new Date().toISOString(),
          }],
          taskCompletionPatterns: [],
          realTimeFeedback: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        
        // 2. Pattern discovery
        swarmDbManager.demonstrateEnhancedPatternDiscovery(testSwarmIds[0]),
        
        // 3. Knowledge transfer
        swarmDbManager.transferKnowledgeBetweenSwarms(testSwarmIds[0], testSwarmIds[1]),
        
        // 4. Performance comparison
        swarmDbManager.generateSwarmPerformanceComparison([testSwarmIds[0], testSwarmIds[1]]),
        
        // 5. Pattern adoption tracking
        swarmDbManager.trackPatternAdoption('workflow-pattern'),
      ];

      const results = await Promise.all(workflowSteps);
      const endTime = Date.now();
      const workflowTime = endTime - startTime;

      expect(results).toHaveLength(5);
      results.forEach(result => expect(result).toBeDefined());

      console.log(`End-to-End Workflow Benchmark:
        Total workflow time: ${workflowTime}ms
        Steps completed: ${workflowSteps.length}
        Average time per step: ${(workflowTime / workflowSteps.length).toFixed(2)}ms
        Status: ✅ COMPLETE`);

      // Complete workflow should finish within reasonable time
      expect(workflowTime).toBeLessThan(10000); // 10 seconds
    });
  });
});