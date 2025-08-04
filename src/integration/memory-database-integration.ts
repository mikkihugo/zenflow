/**
 * @fileoverview Integration Example: Enhanced Memory and Database Systems
 * Demonstrates how to use the advanced Memory and Database domain features together
 */

import type { DatabaseQuery } from '../database/core/database-coordinator';
import { DatabaseFactory } from '../database/index';
import { MemorySystemFactory } from '../memory/index';

/**
 * Example: Complete system integration with Memory and Database coordination
 */
export async function createIntegratedSystem() {
  // Initialize advanced memory system with coordination
  const memorySystem = await MemorySystemFactory.createAdvancedMemorySystem({
    coordination: {
      enabled: true,
      consensus: { quorum: 0.67, timeout: 5000, strategy: 'majority' },
      distributed: { replication: 2, consistency: 'eventual', partitioning: 'hash' },
      optimization: { autoCompaction: true, cacheEviction: 'adaptive', memoryThreshold: 0.8 },
    },
    optimization: {
      enabled: true,
      strategies: {
        caching: true,
        compression: true,
        prefetching: true,
        indexing: true,
        partitioning: true,
      },
      thresholds: {
        latencyWarning: 100,
        errorRateWarning: 0.05,
        memoryUsageWarning: 200,
        cacheHitRateMin: 0.7,
      },
      adaptation: { enabled: true, learningRate: 0.1, adaptationInterval: 60000 },
    },
    monitoring: {
      enabled: true,
      collectInterval: 5000,
      retentionPeriod: 300000,
      alerts: {
        enabled: true,
        thresholds: { latency: 100, errorRate: 0.05, memoryUsage: 200, cacheHitRate: 0.7 },
      },
      metrics: { detailed: true, histograms: true, percentiles: true },
    },
    backends: [
      { id: 'main-sqlite', type: 'sqlite', config: { dbPath: ':memory:' } },
      { id: 'cache-memory', type: 'json', config: { path: '/tmp/cache' } },
    ],
  });

  // Initialize advanced database system with multi-engine coordination
  const databaseSystem = await DatabaseFactory.createAdvancedDatabaseSystem({
    engines: [
      {
        id: 'vector-db',
        type: 'vector',
        config: { dbPath: '/tmp/vector.db', dimensions: 768 },
      },
      {
        id: 'graph-db',
        type: 'graph',
        config: { dbPath: '/tmp/graph.db' },
      },
      {
        id: 'document-db',
        type: 'document',
        config: { dbPath: '/tmp/documents.db' },
      },
    ],
    optimization: {
      enabled: true,
      caching: { enabled: true, maxSize: 1000, defaultTTL: 300000 },
      aggressiveness: 'medium',
    },
    coordination: {
      healthCheckInterval: 30000,
      defaultTimeout: 30000,
      loadBalancing: 'performance_based',
    },
  });

  return {
    memory: memorySystem,
    database: databaseSystem,

    // Integrated operations
    async storeWithCoordination(sessionId: string, key: string, data: any) {
      // Store in memory system with distributed coordination
      await memorySystem.coordinator?.coordinate({
        type: 'write',
        sessionId,
        target: key,
        metadata: { data },
      });

      // Also store in database for persistence
      const query: DatabaseQuery = {
        id: `store_${Date.now()}`,
        type: 'write',
        operation: 'document_insert',
        parameters: {
          collection: 'memory_store',
          document: { sessionId, key, data, timestamp: Date.now() },
        },
        requirements: { consistency: 'strong', timeout: 10000, priority: 'medium' },
        routing: { loadBalancing: 'performance_based' },
        timestamp: Date.now(),
        sessionId,
      };

      return await databaseSystem.query(query);
    },

    async retrieveWithOptimization(sessionId: string, key: string) {
      // Try memory first (fastest)
      const memoryResult = await memorySystem.coordinator?.coordinate({
        type: 'read',
        sessionId,
        target: key,
      });

      if (memoryResult?.status === 'completed') {
        return memoryResult;
      }

      // Fallback to database with optimization
      const query: DatabaseQuery = {
        id: `retrieve_${Date.now()}`,
        type: 'read',
        operation: 'document_find',
        parameters: {
          collection: 'memory_store',
          filter: { sessionId, key },
        },
        requirements: { consistency: 'eventual', timeout: 5000, priority: 'high' },
        routing: { loadBalancing: 'performance_based' },
        timestamp: Date.now(),
        sessionId,
      };

      return await databaseSystem.query(query);
    },

    async performVectorSearch(embedding: number[], sessionId?: string) {
      const query: DatabaseQuery = {
        id: `vector_search_${Date.now()}`,
        type: 'read',
        operation: 'vector_search',
        parameters: {
          vector: embedding,
          options: { limit: 10, threshold: 0.8 },
        },
        requirements: { consistency: 'eventual', timeout: 15000, priority: 'medium' },
        routing: { preferredEngines: ['vector-db'], loadBalancing: 'capability_based' },
        timestamp: Date.now(),
        sessionId,
      };

      return await databaseSystem.query(query);
    },

    async getSystemHealth() {
      const memoryHealth = memorySystem.getHealthReport();
      const databaseHealth = databaseSystem.getHealthReport();

      return {
        memory: memoryHealth,
        database: databaseHealth,
        overall: {
          status:
            memoryHealth.overall === 'healthy' && databaseHealth.overall === 'healthy'
              ? 'healthy'
              : memoryHealth.overall === 'critical' || databaseHealth.overall === 'critical'
                ? 'critical'
                : 'warning',
          score: Math.round((memoryHealth.score + databaseHealth.score) / 2),
          components: {
            memory: memoryHealth.score,
            database: databaseHealth.score,
          },
        },
      };
    },

    async getPerformanceMetrics() {
      const memoryStats = memorySystem.getStats();
      const databaseStats = databaseSystem.getStats();

      return {
        timestamp: Date.now(),
        memory: memoryStats,
        database: databaseStats,
        integration: {
          totalOperations:
            memoryStats.coordinator?.decisions.total + databaseStats.coordinator?.queries.total,
          averageLatency:
            ((memoryStats.monitor?.metrics?.averageLatency || 0) +
              (databaseStats.coordinator?.queries.averageLatency || 0)) /
            2,
          systemUtilization: {
            memory: memoryStats.backends || 0,
            database: databaseStats.engines || 0,
          },
        },
      };
    },

    async shutdown() {
      await memorySystem.shutdown();
      await databaseSystem.shutdown();
    },
  };
}

/**
 * Example: Using MCP tools for system management
 */
export async function demonstrateMCPIntegration() {
  // Import MCP tools
  const { memoryTools } = await import('../memory/mcp/memory-tools');
  const { databaseTools } = await import('../database/mcp/database-tools');

  // Example: Initialize memory system via MCP
  const memoryInitResult = await memoryTools[0].handler({
    coordination: {
      enabled: true,
      consensus: { quorum: 0.67, timeout: 5000, strategy: 'majority' },
      distributed: { replication: 2, consistency: 'eventual', partitioning: 'hash' },
    },
    optimization: {
      enabled: true,
      strategies: { caching: true, compression: true, prefetching: true },
      adaptation: { enabled: true, learningRate: 0.1 },
    },
    backends: [{ id: 'main', type: 'sqlite', config: { dbPath: ':memory:' } }],
  });

  // Example: Initialize database system via MCP
  const databaseInitResult = await databaseTools[0].handler({
    engines: [
      {
        id: 'main-vector',
        type: 'vector',
        capabilities: ['vector_search', 'similarity'],
        config: {},
      },
      { id: 'main-graph', type: 'graph', capabilities: ['graph_queries', 'traversal'], config: {} },
    ],
    optimization: { enabled: true, aggressiveness: 'medium' },
    coordination: { healthCheckInterval: 30000, loadBalancing: 'performance_based' },
  });

  // Example: Execute optimized query via MCP
  const queryResult = await databaseTools[1].handler({
    operation: 'vector_search',
    parameters: { vector: [0.1, 0.2, 0.3], options: { limit: 5 } },
    requirements: { consistency: 'eventual', timeout: 10000, priority: 'medium' },
    routing: { loadBalancing: 'performance_based' },
    optimization: { enabled: true, caching: true },
    sessionId: 'demo_session',
  });

  // Example: Monitor system performance via MCP
  const monitoringResult = await Promise.all([
    memoryTools[2].handler({ duration: 30000, metrics: ['latency', 'memory', 'cache'] }),
    databaseTools[3].handler({
      duration: 30000,
      metrics: ['performance', 'utilization', 'queries'],
    }),
  ]);

  return {
    memoryInit: memoryInitResult,
    databaseInit: databaseInitResult,
    queryExecution: queryResult,
    monitoring: monitoringResult,
  };
}

/**
 * Example: Advanced error handling and recovery
 */
export async function demonstrateErrorHandling() {
  const system = await createIntegratedSystem();

  try {
    // Simulate some operations that might fail
    await system.storeWithCoordination('test_session', 'test_key', { data: 'test' });

    // This might trigger error handling
    await system.performVectorSearch(new Array(768).fill(0.1));
  } catch (error) {
    // Import error handling classes
    const { MemoryError, MemoryErrorClassifier } = await import(
      '../memory/error-handling/memory-errors'
    );
    const { DatabaseError, DatabaseErrorClassifier } = await import(
      '../database/error-handling/database-errors'
    );

    if (error instanceof MemoryError) {
      const classification = MemoryErrorClassifier.classify(error);

      // Handle based on classification
      if (classification.actionRequired) {
      }
    }

    if (error instanceof DatabaseError) {
      const classification = DatabaseErrorClassifier.classify(error);

      // Handle retry strategy
      if (error.retryable && classification.retryStrategy !== 'none') {
      }
    }
  } finally {
    await system.shutdown();
  }
}

/**
 * Example: Performance optimization workflow
 */
export async function demonstrateOptimization() {
  const system = await createIntegratedSystem();

  // Run some operations to generate data
  for (let i = 0; i < 100; i++) {
    await system.storeWithCoordination(`session_${i % 10}`, `key_${i}`, { value: i });
  }

  // Get performance metrics
  const _metrics = await system.getPerformanceMetrics();

  // Optimize memory system
  if (system.memory.optimizer) {
    const memoryRecommendations = system.memory.optimizer.getRecommendations();
    if (memoryRecommendations.length > 0) {
      memoryRecommendations.forEach((_rec, _i) => {});
    }
  }

  // Optimize database system
  const databaseRecommendations = system.database.optimizer?.getRecommendations();
  if (databaseRecommendations && databaseRecommendations.length > 0) {
    databaseRecommendations.forEach((_rec, _i) => {});
  }

  // Get health report
  const _health = await system.getSystemHealth();

  await system.shutdown();
}

// Export demonstration functions
export const integrationExamples = {
  createIntegratedSystem,
  demonstrateMCPIntegration,
  demonstrateErrorHandling,
  demonstrateOptimization,
};
