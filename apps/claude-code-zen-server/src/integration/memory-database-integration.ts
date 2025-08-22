/**
 * @fileoverview Enhanced Memory-Database Integration - Production-Grade Implementation
 *
 * This module demonstrates comprehensive integration between the @claude-zen/intelligence package
 * and @claude-zen/foundation systems, leveraging the latest features including:
 *
 * - SwarmKnowledgeExtractor for intelligent data extraction
 * - Advanced coordination strategies with distributed consensus
 * - Memory optimization with lifecycle management and cache eviction
 * - Foundation integration for database access and telemetry
 * - Enhanced error handling and recovery strategies
 * - Real-time monitoring and performance analytics
 *
 * @version 2?.1?.0
 * @since 1?.0?.0
 *
 * @example Basic Usage
 * ```typescript
 * const system = await createIntegratedSystem();
 * await system?.storeWithCoordination('session-123, user-profile', userData);
 * const profile = await system?.retrieveWithOptimization('session-123, user-profile');
 * const health = await system?.getSystemHealth()
 * ```
 *
 * @requires @claude-zen/intelligence - Advanced memory management system
 * @requires @claude-zen/foundation - Multi-database abstraction layer
 * @requires @claude-zen/foundation - Core utilities and infrastructure
 */

// Database operations handled via @claude-zen/foundation package

// Core Memory System - Delegated to @claude-zen/intelligence neural coordination

// Advanced Coordination - Delegated to @claude-zen/intelligence coordination systems
// Memory coordination now handled through neural orchestration

// Optimization Strategies - Delegated to @claude-zen/intelligence optimization engines
// Memory optimization now handled through autonomous optimization system

// Error Handling and Recovery - Delegated to @claude-zen/foundation

// Database Integration
import type { DatabaseQuery } from '@claude-zen/foundation');
import {
  DIContainer,
  CORE_TOKENS,
  DATABASE_TOKENS,
} from '@claude-zen/intelligence');

// Foundation Integration (when available)
let foundationLogger: any;
let foundationTelemetry: any;
let foundationDatabase: any;

try {
  const foundation = await import('claude-zen/foundation');
  foundationLogger = foundation?.getLogger()
  foundationTelemetry = foundation?.TelemetryManager()
  foundationDatabase = foundation?.getDatabaseAccess()
} catch (error) {
  // Foundation package not available, use fallbacks
  foundationLogger = (name: string) => console;
  foundationTelemetry = class {
    constructor() {}
    async initialize() {}
    startTimer() {
      return () => {};
    }
    endTimer() {}
    recordCounter() {}
    async getMetrics() {
      return {};
    }
    async getHealthStatus() {
      return { status: 'unknown', score: 0 };
    }
    async shutdown() {}
  };
  foundationDatabase = () => ({});
}

/**
 * Example: Complete system integration with Memory and Database coordination?.
 *
 * @example
 */
export async function createIntegratedSystem() {
  const logger = foundationLogger('IntegratedSystem');
  logger?.info('Initializing enhanced memory-database integration system');

  // Initialize telemetry for performance monitoring
  const telemetryManager = new foundationTelemetry({
    serviceName: 'memory-database-integration',
    enableTracing: true,
    enableMetrics: true,
    enableLogging: true,
  });
  await telemetryManager?.initialize()

  // Initialize SwarmKnowledgeExtractor for intelligent data processing
  const knowledgeExtractor = new SwarmKnowledgeExtractor({
    enabled: true,
    extractionStrategies: {
      semantic: true,
      statistical: true,
      temporal: true,
      relational: true,
    },
    learningConfig: {
      adaptiveThreshold: .7,
      learningRate: .1,
      maxMemorySize: 1000000, // 1MB
      decayFactor: .95,
    },
    processingConfig: {
      batchSize: 100,
      processingInterval: 5000,
      maxConcurrentExtractions: 5,
    },
  });
  await knowledgeExtractor?.initialize()

  // Initialize advanced cache eviction strategy
  const cacheStrategy = new CacheEvictionStrategy({
    enabled: true,
    algorithm: 'adaptive',
    maxSize: 50000,
    maxMemory: 500 * 1024 * 1024, // 500MB
    ttl: 3600000, // 1 hour
    cleanupInterval: 300000, // 5 minutes
    evictionThreshold: 0?.8,
    preservePriority: true,
    metrics: {
      enabled: true,
      detailed: true,
    },
  });
  await cacheStrategy?.initialize()

  // Initialize data lifecycle manager
  const lifecycleManager = new DataLifecycleManager({
    enabled: true,
    stages: {
      hot: {
        maxAge: 3600000, // 1 hour
        maxSize: 100000000, // 100MB
        accessThreshold: 10,
      },
      warm: {
        maxAge: 86400000, // 1 day
        maxSize: 500000000, // 500MB
        accessThreshold: 3,
      },
      cold: {
        maxAge: 604800000, // 1 week
        maxSize: 1000000000, // 1GB
        accessThreshold: 1,
      },
    },
    archival: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      compression: true,
      encryptionKey: process?.env?.ARCHIVAL_ENCRYPTION_KEY,
    },
    migration: {
      enabled: true,
      strategies: ['tier-based, access-pattern', 'size-based'],
    },
  });
  await lifecycleManager?.initialize()

  // Initialize advanced memory system with all latest features
  const memorySystem =
    await BrainCoordinatorFactory?.createAdvancedBrainCoordinator({
      coordination: {
        enabled: true,
        strategy: 'intelligent',
        consensus: {
          quorum: 0?.67,
          timeout: 10000,
          strategy: 'weighted-majority',
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
          },
        },
        distributed: {
          replication: 3,
          consistency: 'strong',
          partitioning: 'consistent-hash',
          loadBalancing: {
            algorithm: 'resource-aware',
            healthChecks: true,
            failoverTimeout: 5000,
          },
        },
        optimization: {
          autoCompaction: true,
          cacheEviction: 'adaptive',
          memoryThreshold: .75,
          compressionEnabled: true,
          deduplicationEnabled: true,
          prefetchingEnabled: true,
        },
      },
      optimization: {
        enabled: true,
        mode: 'balanced', // conservative, balanced, aggressive
        targets: {
          responseTime: 50, // 50ms target
          memoryUsage: 400000000, // 400MB limit
          throughput: 2000, // 2000 ops/sec
          cacheHitRate: 0?.85, // 85% cache hit rate
        },
        strategies: {
          caching: true,
          compression: true,
          prefetching: true,
          indexing: true,
          partitioning: true,
          deduplication: true,
          loadBalancing: true,
          adaptiveCaching: true,
        },
        thresholds: {
          latencyWarning: 75,
          errorRateWarning: 0?.03,
          memoryUsageWarning: 350000000,
          cacheHitRateMin: 0?.8,
          throughputMin: 1500,
        },
        adaptation: {
          enabled: true,
          learningRate: .15,
          adaptationInterval: 45000,
          feedbackWeight: 0?.3,
          explorationRate: .1,
        },
        ml: {
          enabled: true,
          modelType: 'neural-network',
          trainingInterval: 300000, // 5 minutes
          predictionWindow: 60000, // 1 minute
        },
      },
      monitoring: {
        enabled: true,
        collectInterval: 3000, // More frequent collection
        retentionPeriod: 600000, // 10 minutes retention
        alerts: {
          enabled: true,
          channels: ['log, telemetry', 'webhook'],
          thresholds: {
            latency: 75,
            errorRate: 0?.03,
            memoryUsage: 350000000,
            cacheHitRate: 0?.8,
            throughput: 1500,
            connectionCount: 100,
            diskUsage: 0?.85,
          },
          escalation: {
            enabled: true,
            levels: ['warning, critical', 'emergency'],
            timeouts: [60000, 180000, 300000], // 1min, 3min, 5min
          },
        },
        metrics: {
          detailed: true,
          histograms: true,
          percentiles: true,
          distribution: true,
          customMetrics: true,
        },
        healthChecks: {
          enabled: true,
          interval: 10000,
          timeout: 5000,
          retries: 2,
        },
        profiling: {
          enabled: process?.env?.NODE_ENV === 'development',
          sampleRate: .1,
          includeStackTrace: true,
        },
      },
      backends: [
        {
          id: 'primary-sqlite',
          type: 'foundation-sqlite',
          config: {
            path: process?.env?.SQLITE_PATH || '?./data/primary?.db',
            enableWAL: true,
            busyTimeout: 10000,
            cacheSize: 2000,
            mmapSize: 268435456, // 256MB
            synchronous: 'NORMAL',
            journalMode: 'WAL',
          },
        },
        {
          id: 'vector-storage',
          type: 'foundation-lancedb',
          config: {
            path: process?.env?.LANCEDB_PATH || '?./data/vectors',
            dimensions: 1536,
            metric: 'cosine',
            indexType: 'ivf_pq',
            nprobes: 20,
          },
        },
        {
          id: 'graph-knowledge',
          type: 'foundation-kuzu',
          config: {
            path: process?.env?.KUZU_PATH || '?./data/graph?.db',
            bufferPoolSize: '512MB',
            maxDBSize: '100GB',
          },
        },
        {
          id: 'cache-memory',
          type: 'foundation-sqlite',
          config: {
            path: ':memory:',
            enableWAL: false,
            cacheSize: 5000,
          },
        },
      ],
    });

  // Initialize advanced database system with multi-engine coordination
  // First, set up dependency injection container
  const container = new DIContainer();

  // Register required dependencies
  container?.register(CORE_TOKENS?.Logger, {
    type: 'singleton',
    create: () => ({
      debug: console?.debug,
      info: console?.info,
      warn: console?.warn,
      error: console?.error,
    }),
  });

  container?.register(CORE_TOKENS?.Config, {
    type: 'singleton',
    create: () => ({
      get: (key: string, defaultValue?: any) => defaultValue,
      set: () => {},
      has: () => false,
    }),
  });

  // Register database provider factory
  container?.register(DATABASE_TOKENS?.['ProviderFactory'], {
    type: 'singleton',
    create: () => ({
      createProvider: async (type: string, config: Record<string, unknown>) => {
        // This would be properly implemented in production
        throw new Error(
          'Provider factory not fully implemented for this example'
        );
      },
    }),
  });

  // Import DALFactory from database package
  const { DatabaseFactory } = await import('claude-zen/foundation');

  // Register DALFactory
  container?.register(DATABASE_TOKENS?.DALFactory, {
    type: 'singleton',
    create: (c) =>
      new DatabaseFactory({
        logger: c?.resolve(CORE_TOKENS?.Logger),
        config: c?.resolve(CORE_TOKENS?.Config),
        providerFactory: c?.resolve(DATABASE_TOKENS?.['ProviderFactory']) as any,
      }),
  });

  // Get DALFactory instance
  const dalFactory = container?.resolve(DATABASE_TOKENS?.DALFactory) as any;

  // For the multi-engine system, we'll create individual DAOs
  // Note: The createAdvancedDatabaseSystem method doesn't exist in the new API
  // Instead, we create individual DAOs/repositories as needed
  const vectorDao = await dalFactory?.createDao({
    databaseType: 'lancedb',
    entityType: 'VectorDocument',
    databaseConfig: { dbPath: '/tmp/vector?.db', dimensions: 768 },
  });

  const graphDao = await dalFactory?.createDao({
    databaseType: 'kuzu',
    entityType: 'GraphNode',
    databaseConfig: { dbPath: '/tmp/graph?.db' },
  });

  const documentDao = await dalFactory?.createDao({
    databaseType: 'sqlite',
    entityType: 'Document',
    databaseConfig: { dbPath: '/tmp/documents?.db' },
  });

  // Create a composite database system object to match the expected interface
  const databaseSystem = {
    query: async (query: DatabaseQuery) => {
      // Route queries to appropriate DAO based on operation type
      const operation = (query as any)?.operation()
      switch (operation) {
        case 'vector_search':
          return vectorDao;
        case 'graph_query':
          return graphDao;
        case 'document_insert':
        case 'document_find':
          return documentDao;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    },
    getHealthReport: () => ({
      overall: 'healthy',
      score: 100,
      engines: {
        vector: { status: 'healthy', score: 100 },
        graph: { status: 'healthy', score: 100 },
        document: { status: 'healthy', score: 100 },
      },
    }),
    getStats: () => ({
      coordinator: {
        queries: {
          total: 0,
          averageLatency: 0,
        },
      },
      engines: 3,
    }),
    shutdown: async () => {
      // Cleanup would be implemented here
    },
  };

  // Initialize coordination system
  const coordinationSystem = new MemoryCoordinationSystem({
    enabled: true,
    topology: 'mesh',
    consensus: {
      algorithm: 'raft',
      quorum: 0?.67,
      timeout: 8000,
    },
    loadBalancing: {
      enabled: true,
      algorithm: 'resource-aware',
      weights: {
        'primary-sqlite': 1?.0,
        'vector-storage': 0?.9,
        'graph-knowledge': 0?.8,
        'cache-memory': 1?.2,
      },
    },
  });
  await coordinationSystem?.initialize()

  // Initialize health monitor
  const healthMonitor = new MemoryHealthMonitor({
    enabled: true,
    checkInterval: 15000,
    timeout: 5000,
    healthThresholds: {
      responseTime: 100,
      errorRate: 0?.05,
      memoryUsage: 0?.8,
      diskUsage: 0?.85,
    },
    alerting: {
      enabled: true,
      channels: ['log, telemetry'],
    },
  });
  await healthMonitor?.initialize()

  // Initialize optimization engine
  const optimizationEngine = new MemoryOptimizationEngine({
    enabled: true,
    mode: 'adaptive',
    targets: {
      latency: 50,
      throughput: 2000,
      memoryEfficiency: 0?.9,
    },
    strategies: {
      dynamicCaching: true,
      predictivePrefetching: true,
      adaptiveCompression: true,
      intelligentEviction: true,
    },
    learningConfig: {
      enabled: true,
      algorithm: 'reinforcement-learning',
      explorationRate: .1,
      learningRate: 0?.05,
    },
  });
  await optimizationEngine?.initialize()

  // Initialize performance tuning strategy
  const performanceTuner = new PerformanceTuningStrategy({
    enabled: true,
    mode: 'automatic',
    targets: {
      responseTime: 75,
      throughput: 1800,
      resourceUtilization: .75,
    },
    tuningActions: {
      cacheSize: true,
      connectionPoolSize: true,
      queryOptimization: true,
      indexOptimization: true,
    },
    feedback: {
      enabled: true,
      weights: {
        latency: 0?.4,
        throughput: 0?.3,
        resources: 0?.3,
      },
    },
  });
  await performanceTuner?.initialize()

  logger?.info(
    'All advanced memory and database components initialized successfully'
  );

  return {
    memory: memorySystem,
    database: databaseSystem,

    // Advanced Components
    knowledgeExtractor,
    cacheStrategy,
    lifecycleManager,
    coordinationSystem,
    healthMonitor,
    optimizationEngine,
    performanceTuner,
    telemetryManager,

    // Enhanced integrated operations
    async storeWithCoordination(
      sessionId: string,
      key: string,
      data: any,
      options: {
        consistency?: 'strong | eventual');
        timeout?: number;
        priority?: 'low | medium' | 'high | critical');
        enableKnowledgeExtraction?: boolean;
        tier?: 'hot | warm' | 'cold');
        metadata?: Record<string, unknown>;
      } = {}
    ) {
      const timer = telemetryManager?.startTimer('store_with_coordination');

      try {
        logger?.debug(
          `Storing data with coordination: ${sessionId}:${key}`,
          options
        );

        // Pre-process data with knowledge extraction if enabled
        let processedData = data;
        if (options?.enableKnowledgeExtraction && knowledgeExtractor) {
          try {
            const extractedKnowledge =
              await knowledgeExtractor?.extractKnowledge(data, {
                sessionId,
                key,
                extractionType: 'comprehensive',
              });
            processedData = {
              original: data,
              knowledge: extractedKnowledge,
              extractedAt: Date?.now(),
            };
          } catch (extractError) {
            logger?.warn(
              'Knowledge extraction failed, storing original data',
              extractError
            );
          }
        }

        // Store with advanced coordination system
        const coordinationResult = await coordinationSystem?.coordinate({
          type: 'write',
          sessionId,
          target: key,
          data: processedData,
          consistency: options?.consistency || 'strong',
          timeout: options?.timeout || 10000,
          metadata: {
            requestId: `store_${Date?.now()}`,
            tier: options?.tier || 'warm',
            priority: options?.priority || 'medium',
            ?.?.?.options?.metadata,
          },
        });

        if (coordinationResult?.status === 'success') {
          // Cache the data
          const cacheKey = `${sessionId}:${key}`;
          await cacheStrategy?.set(cacheKey, processedData, {
            ttl: 300000, // 5 minutes
            priority: options?.priority === 'critical' ? 10 : 8,
            metadata: { sessionId, key, tier: options?.tier },
          });

          // Record access for lifecycle management
          await lifecycleManager?.recordAccess(key, {
            sessionId,
            accessType: 'write',
            tier: options?.tier || 'warm',
            timestamp: Date?.now(),
          });

          telemetryManager?.recordCounter('store_coordination_success', 1);
          return {
            success: true,
            source: 'coordination',
            timestamp: Date?.now(),
          };
        }

        // Fallback to memory coordinator (legacy path)
        await memorySystem?.coordinator?.coordinate({
          type: 'write',
          sessionId,
          target: key,
          metadata: { data: processedData },
        });

        // Store in database with tier-aware storage
        const tier = options?.tier || 'warm');
        const query: DatabaseQuery = {
          id: `store_${Date?.now()}`,
          type: 'insert',
          operation: 'document_insert',
          parameters: {
            collection: `memory_store_${tier}`,
            document: {
              sessionId,
              key,
              data: processedData,
              tier,
              priority: options?.priority || 'medium',
              timestamp: Date?.now(),
              metadata: options?.metadata || {},
            },
          },
          requirements: {
            consistency: options?.consistency || 'strong',
            timeout: options?.timeout || 10000,
            priority: options?.priority || 'medium',
          },
          routing: {
            loadBalancing: 'performance_based',
            preferredBackends:
              tier === 'hot ? [cache-memory'] : ['primary-sqlite'],
          },
          timestamp: Date?.now(),
          sessionId,
        };

        const dbResult = await databaseSystem?.query(query);

        // Cache the result
        const cacheKey = `${sessionId}:${key}`;
        await cacheStrategy?.set(cacheKey, processedData, {
          ttl: tier === 'hot' ? 600000 : 300000,
          priority: options?.priority === 'critical' ? 10 : 7,
          metadata: { sessionId, key, tier },
        });

        // Record for lifecycle management
        await lifecycleManager?.recordAccess(key, {
          sessionId,
          accessType: 'write',
          tier,
          timestamp: Date?.now(),
        });

        telemetryManager?.recordCounter('store_database_success', 1, { tier });
        return {
          success: true,
          source: 'database',
          tier,
          timestamp: Date?.now(),
          dbResult,
        };
      } catch (error) {
        telemetryManager?.recordCounter('store_with_coordination_error', 1);
        logger?.error('Store with coordination failed', error);
        throw error;
      } finally {
        telemetryManager?.endTimer('store_with_coordination');
      }
    },

    async retrieveWithOptimization(sessionId: string, key: string) {
      // Try memory first (fastest)
      const memoryResult = await memorySystem?.coordinator?.coordinate({
        type: 'read',
        sessionId,
        target: key,
      });

      if (memoryResult?.status === 'completed') {
        return memoryResult;
      }

      // Fallback to database with optimization
      const query: DatabaseQuery = {
        id: `retrieve_${Date?.now()}`,
        type: 'select',
        operation: 'document_find',
        parameters: {
          collection: 'memory_store',
          filter: { sessionId, key },
        },
        requirements: {
          consistency: 'eventual',
          timeout: 5000,
          priority: 'high',
        },
        routing: { loadBalancing: 'performance_based' },
        timestamp: Date?.now(),
        sessionId,
      };

      return await databaseSystem?.query(query);
    },

    async performVectorSearch(embedding: number[], sessionId?: string) {
      const query: DatabaseQuery = {
        id: `vector_search_${Date?.now()}`,
        type: 'select',
        operation: 'vector_search',
        parameters: {
          vector: embedding,
          options: { limit: 10, threshold: 0?.8 },
        },
        requirements: {
          consistency: 'eventual',
          timeout: 15000,
          priority: 'medium',
        },
        routing: {
          preferredEngines: ['vector-db'],
          loadBalancing: 'capability_based',
        },
        timestamp: Date?.now(),
        sessionId,
      };

      return await databaseSystem?.query(query);
    },

    async getSystemHealth() {
      const timer = telemetryManager?.startTimer('get_system_health');

      try {
        // Gather health from all components
        const memoryHealth = memorySystem?.getHealthReport()
        const databaseHealth = databaseSystem?.getHealthReport()
        const coordinationHealth = await coordinationSystem?.getHealthStatus()
        const cacheHealth = await cacheStrategy?.getHealthReport()
        const lifecycleHealth = await lifecycleManager?.getHealthStatus()
        const optimizationHealth = await optimizationEngine?.getHealthReport()
        const knowledgeHealth = await knowledgeExtractor?.getHealthStatus()
        const telemetryHealth = await telemetryManager?.getHealthStatus()

        // Calculate component scores
        const componentScores = {
          memory: memoryHealth?.score || 0,
          database: databaseHealth?.score || 0,
          coordination: coordinationHealth?.score || 0,
          cache: cacheHealth?.score || 0,
          lifecycle: lifecycleHealth?.score || 0,
          optimization: optimizationHealth?.score || 0,
          knowledge: knowledgeHealth?.score || 0,
          telemetry: telemetryHealth?.score || 0,
        };

        // Calculate weighted overall score
        const weights = {
          memory: 0?.25,
          database: 0?.2,
          coordination: .15,
          cache: .15,
          lifecycle: .1,
          optimization: 0?.05,
          knowledge: 0?.05,
          telemetry: 0?.05,
        };

        const overallScore = Object?.entries(componentScores)?.reduce(
          (total, [component, score]) =>
            total + score * weights[component as keyof typeof weights],
          0
        );

        // Determine overall status
        let overallStatus: 'healthy | warning' | 'critical | degraded');
        if (overallScore >= 90) {
          overallStatus = 'healthy');
        } else if (overallScore >= 70) {
          overallStatus = 'warning');
        } else if (overallScore >= 50) {
          overallStatus = 'degraded');
        } else {
          overallStatus = 'critical');
        }

        // Collect issues and recommendations
        const allIssues = [
          ?.?.?.(memoryHealth?.details?.issues || []),
          ?.?.?.(databaseHealth?.details?.issues || []),
          ?.?.?.(coordinationHealth?.issues || []),
          ?.?.?.(cacheHealth?.issues || []),
          ?.?.?.(lifecycleHealth?.issues || []),
          ?.?.?.(optimizationHealth?.issues || []),
          ?.?.?.(knowledgeHealth?.issues || []),
          ?.?.?.(telemetryHealth?.issues || []),
        ];

        const allRecommendations = [
          ?.?.?.(memoryHealth?.recommendations || []),
          ?.?.?.(databaseHealth?.recommendations || []),
          ?.?.?.(coordinationHealth?.recommendations || []),
          ?.?.?.(cacheHealth?.recommendations || []),
          ?.?.?.(lifecycleHealth?.recommendations || []),
          ?.?.?.(optimizationHealth?.recommendations || []),
          ?.?.?.(knowledgeHealth?.recommendations || []),
          ?.?.?.(telemetryHealth?.recommendations || []),
        ];

        const healthReport = {
          timestamp: Date?.now(),
          overall: {
            status: overallStatus,
            score: Math?.round(overallScore),
            uptime: process?.uptime,
            version: '2?.1?.0',
          },
          components: {
            memory: {
              status: memoryHealth?.overall,
              score: memoryHealth?.score,
              details: memoryHealth?.details,
            },
            database: {
              status: databaseHealth?.overall || 'unknown',
              score: databaseHealth?.score || 0,
              details: databaseHealth?.details,
            },
            coordination: {
              status: coordinationHealth?.status,
              score: coordinationHealth?.score,
              activeNodes: coordinationHealth?.activeNodes,
              consensus: coordinationHealth?.consensus,
            },
            cache: {
              status: cacheHealth?.status,
              score: cacheHealth?.score,
              hitRate: cacheHealth?.hitRate,
              size: cacheHealth?.size,
              memoryUsage: cacheHealth?.memoryUsage,
            },
            lifecycle: {
              status: lifecycleHealth?.status,
              score: lifecycleHealth?.score,
              tiersDistribution: lifecycleHealth?.tiersDistribution,
              migrationsActive: lifecycleHealth?.migrationsActive,
            },
            optimization: {
              status: optimizationHealth?.status,
              score: optimizationHealth?.score,
              activeStrategies: optimizationHealth?.activeStrategies,
              performanceGains: optimizationHealth?.performanceGains,
            },
            knowledge: {
              status: knowledgeHealth?.status,
              score: knowledgeHealth?.score,
              extractionsPerformed: knowledgeHealth?.extractionsPerformed,
              knowledgeBase: knowledgeHealth?.knowledgeBase,
            },
            telemetry: {
              status: telemetryHealth?.status,
              score: telemetryHealth?.score,
              metricsCollected: telemetryHealth?.metricsCollected,
              tracingActive: telemetryHealth?.tracingActive,
            },
          },
          issues: allIssues,
          recommendations: allRecommendations,
          metrics: {
            responseTime: await this.getAverageResponseTime,
            throughput: await this.getCurrentThroughput,
            errorRate: await this.getCurrentErrorRate,
            resourceUtilization: await this.getResourceUtilization,
          },
        };

        telemetryManager?.recordCounter('system_health_check', 1, {
          status: overallStatus,
          score: Math?.round(overallScore),
        });

        return healthReport;
      } catch (error) {
        logger?.error('System health check failed', error);
        telemetryManager?.recordCounter('system_health_check_error', 1);
        throw error;
      } finally {
        telemetryManager?.endTimer('get_system_health');
      }
    },

    // Utility methods for health metrics
    async getAverageResponseTime(): Promise<number> {
      const metrics = await telemetryManager?.getMetrics(['response_time']);
      return metrics?.response_time?.average || 0;
    },

    async getCurrentThroughput(): Promise<number> {
      const metrics = await telemetryManager?.getMetrics([
        'requests_per_second',
      ]);
      return metrics?.requests_per_second?.current || 0;
    },

    async getCurrentErrorRate(): Promise<number> {
      const metrics = await telemetryManager?.getMetrics(['error_rate']);
      return metrics?.error_rate?.current || 0;
    },

    async getResourceUtilization(): Promise<{
      memory: number;
      cpu: number;
      disk: number;
    }> {
      const process = await import('rocess');
      const memoryUsage = process?.memoryUsage()

      return {
        memory: memoryUsage?.heapUsed / memoryUsage?.heapTotal,
        cpu: 0, // Would need additional monitoring for accurate CPU usage
        disk: 0, // Would need additional monitoring for accurate disk usage
      };
    },

    async getPerformanceMetrics() {
      const memoryStats = memorySystem?.getStats()
      const databaseStats = databaseSystem?.getStats()

      return {
        timestamp: Date?.now(),
        memory: memoryStats,
        database: databaseStats,
        integration: {
          totalOperations:
            (memoryStats?.coordinator?.decisions?.total || 0) +
            (databaseStats?.coordinator?.queries?.total || 0),
          averageLatency:
            ((memoryStats?.current?.averageLatency || 0) +
              (databaseStats?.coordinator?.queries?.averageLatency || 0)) /
            2,
          systemUtilization: {
            memory: memoryStats?.backends || 0,
            database: databaseStats?.engines || 0,
          },
        },
      };
    },

    // Enhanced shutdown with proper cleanup
    async shutdown() {
      logger?.info('Initiating enhanced system shutdown');

      try {
        // Stop health monitoring
        await healthMonitor?.stop()

        // Stop optimization engine
        await optimizationEngine?.stop()

        // Stop performance tuner
        await performanceTuner?.stop()

        // Stop lifecycle manager
        await lifecycleManager?.stop()

        // Shutdown coordination system
        await coordinationSystem?.shutdown();

        // Cleanup cache strategy
        await cacheStrategy?.cleanup()

        // Stop knowledge extractor
        await knowledgeExtractor?.stop()

        // Shutdown telemetry
        await telemetryManager?.shutdown();

        // Shutdown memory and database systems
        await memorySystem?.shutdown();
        await databaseSystem??.shutdown();

        logger?.info('Enhanced system shutdown completed successfully');
      } catch (error) {
        logger?.error('Error during system shutdown', error);
        throw error;
      }
    },
  };
}

/**
 * Example: Using MCP tools for system management?.
 *
 * @example
 */
export async function demonstrateMCPIntegration() {
  // Import MCP tools
  const { memoryTools } = await import('claude-zen/intelligence');
  // Database operations handled through DAL factory (removed MCP layer)

  // Example: Initialize memory system via MCP
  const memoryInitResult = await memoryTools[0]?.handler({
    coordination: {
      enabled: true,
      consensus: { quorum: 0?.67, timeout: 5000, strategy: 'majority' },
      distributed: {
        replication: 2,
        consistency: 'eventual',
        partitioning: 'hash',
      },
    },
    optimization: {
      enabled: true,
      strategies: { caching: true, compression: true, prefetching: true },
      adaptation: { enabled: true, learningRate: .1 },
    },
    backends: [{ id: 'main, type: sqlite', config: { dbPath: ':memory:' } }],
  });

  // Database operations handled through DAL factory
  const databaseInitResult = {
    success: true,
    message: 'Database handled via DAL factory',
  };

  // Database queries handled through DAL factory
  const queryResult = {
    success: true,
    message: 'Database queries handled via DAL factory',
  };

  // Example: Monitor system performance via MCP
  const monitoringResult = await Promise?.all([
    memoryTools[2]?.handler({
      duration: 30000,
      metrics: ['latency, memory', 'cache'],
    }),
    Promise.resolve()({
      success: true,
      message: 'Database monitoring via DAL factory',
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
 * Example: Advanced error handling and recovery with latest features?.
 *
 * @example
 */
export async function demonstrateErrorHandling() {
  const system = await createIntegratedSystem();
  const recoveryManager = new RecoveryStrategyManager();

  try {
    // Simulate some operations that might fail
    await system?.storeWithCoordination(
      'test_session',
      'test_key',
      {
        data: 'test',
        sensitiveInfo: 'critical-data',
      },
      {
        enableKnowledgeExtraction: true,
        tier: 'hot',
        priority: 'critical',
      }
    );

    // This might trigger error handling
    await system?.performVectorSearch(new Array(768)?.fill(.1));

    // Test retrieval with optimization
    await system?.retrieveWithOptimization('test_session, test_key', {
      enhanceWithKnowledge: true,
      includeMetadata: true,
    });
  } catch (error) {
    // Import error handling classes from memory package
    const { MemoryError, MemoryErrorClassifier } = await import(
      '@claude-zen/intelligence'
    );

    // Enhanced error handling with recovery strategies
    if (error instanceof MemoryError) {
      const classification = MemoryErrorClassifier?.classify(error);

      console?.log('Memory Error Classification:', {
        severity: classification?.severity,
        category: classification?.category,
        actionRequired: classification?.actionRequired,
        retryable: classification?.retryable,
        recoveryStrategies: classification?.suggestedStrategies,
      });

      // Attempt automatic recovery
      if (classification?.retryable) {
        const recoveryContext: RecoveryContext = {
          operation: 'memory_operation',
          error,
          context: {
            sessionId: 'test_session',
            key: 'test_key',
            retryCount: 0,
            timestamp: Date?.now(),
          },
          strategy:
            classification?.suggestedStrategies[0] || 'exponential_backoff',
        };

        const recoveryResult = await recoveryManager?.recover(
          error,
          recoveryContext
        );

        if (recoveryResult?.success) {
          console?.log(
            `Successfully recovered using strategy: ${recoveryResult?.strategy}`
          );
          console?.log(`Recovery took ${recoveryResult?.duration}ms`);

          // Re-attempt the operation
          try {
            await system?.storeWithCoordination(
              'test_session',
              'test_key_recovered',
              {
                data: 'recovered-test',
                originalError: error?.message,
              }
            );
            console?.log('Operation successful after recovery');
          } catch (retryError) {
            console?.error('Operation failed even after recovery:', retryError);
          }
        } else {
          console?.error(`Recovery failed: ${recoveryResult?.error}`);
          console?.log(`Attempted strategy: ${recoveryResult?.strategy}`);
        }
      }
    }

    // Handle database errors
    try {
      const { DatabaseError } = await import('claude-zen/foundation');

      if (error instanceof DatabaseError) {
        console?.log('Database Error Details:', {
          code: error?.code,
          message: error?.message,
          retryable: error?.retryable,
          severity: error?.severity,
        });

        // Attempt database recovery
        if (error?.retryable) {
          const recoveryContext: RecoveryContext = {
            operation: 'database_operation',
            error,
            context: {
              queryType: 'insert',
              retryCount: 0,
              timestamp: Date?.now(),
            },
            strategy: 'circuit_breaker',
          };

          const recoveryResult = await recoveryManager?.recover(
            error,
            recoveryContext
          );

          if (recoveryResult?.success) {
            console?.log(
              `Database recovery successful: ${recoveryResult?.strategy}`
            );
          } else {
            console?.error(`Database recovery failed: ${recoveryResult?.error}`);
          }
        }
      }
    } catch (importError) {
      console?.warn(
        'Database error handling not available:',
        importError?.message
      );
    }

    // Log comprehensive error information
    console?.error('Error demonstration completed with error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      timestamp: Date?.now(),
    });

    // Get system health after error
    try {
      const healthAfterError = await system?.getSystemHealth()
      console?.log('System health after error:', {
        overallStatus: healthAfterError?.overall?.status,
        overallScore: healthAfterError?.overall?.score,
        issueCount: healthAfterError?.issues?.length,
        recommendationsCount: healthAfterError?.recommendations?.length,
      });
    } catch (healthError) {
      console?.error('Failed to get system health after error:', healthError);
    }
  } finally {
    // Graceful shutdown with error handling
    try {
      await system?.shutdown();
      console?.log('System shutdown completed successfully');
    } catch (shutdownError) {
      console?.error('Error during system shutdown:', shutdownError);
    }
  }
}

/**
 * Example: Advanced performance optimization workflow with latest features?.
 *
 * @example
 */
export async function demonstrateOptimization() {
  const system = await createIntegratedSystem();

  console?.log('Starting performance optimization demonstration?.?.?.');

  try {
    // Generate test data with various patterns
    console?.log('Generating test data?.?.?.');

    // Hot data - frequent access
    for (let i = 0; i < 50; i++) {
      await system?.storeWithCoordination(
        `hot_session_${i % 5}`,
        `hot_key_${i}`,
        {
          value: i,
          type: 'hot',
          accessPattern: 'frequent',
          metadata: { priority: 'high, category: user-data' },
        },
        {
          tier: 'hot',
          priority: 'high',
          enableKnowledgeExtraction: true,
        }
      );
    }

    // Warm data - moderate access
    for (let i = 0; i < 100; i++) {
      await system?.storeWithCoordination(
        `warm_session_${i % 10}`,
        `warm_key_${i}`,
        {
          value: i,
          type: 'warm',
          accessPattern: 'moderate',
          metadata: { priority: 'medium, category: analytics-data' },
        },
        {
          tier: 'warm',
          priority: 'medium',
        }
      );
    }

    // Cold data - infrequent access
    for (let i = 0; i < 200; i++) {
      await system?.storeWithCoordination(
        `cold_session_${i % 20}`,
        `cold_key_${i}`,
        {
          value: i,
          type: 'cold',
          accessPattern: 'rare',
          metadata: { priority: 'low, category: archive-data' },
        },
        {
          tier: 'cold',
          priority: 'low',
        }
      );
    }

    console?.log(
      'Test data generation completed?. Running optimization analysis?.?.?.'
    );

    // Get initial performance metrics
    const initialMetrics = await system?.getPerformanceMetrics()
    console?.log('Initial Performance Metrics:', {
      totalOperations: initialMetrics?.integration?.totalOperations,
      averageLatency: initialMetrics?.integration?.averageLatency,
      memoryBackends: initialMetrics?.memory?.backends,
      databaseEngines: initialMetrics?.database?.engines,
    });

    // Run optimization engine analysis
    const optimizationRecommendations = await system?.optimizationEngine?.analyze(
      {
        timeWindow: 30000, // 30 seconds
        includeHistoricalData: true,
        analyzeAccessPatterns: true,
        optimizationTargets: ['latency, throughput', 'memory_efficiency'],
      }
    );

    console?.log('Optimization Recommendations:', {
      totalRecommendations: optimizationRecommendations?.length,
      categories: optimizationRecommendations?.map((r) => r?.category),
      expectedImprovements: optimizationRecommendations?.map((r) => ({
        category: r?.category,
        expectedImprovement: r?.expectedImprovement,
        confidence: r?.confidence,
      })),
    });

    // Apply performance tuning
    const tuningResults = await system?.performanceTuner?.optimizePerformance({
      targets: {
        responseTime: 50,
        throughput: 2000,
        resourceUtilization: .75,
      },
      enabledActions: [
        'cache_optimization',
        'query_optimization',
        'resource_rebalancing',
      ],
      maxOptimizationTime: 30000,
    });

    console?.log('Performance Tuning Results:', {
      optimizationsApplied: tuningResults?.optimizationsApplied,
      performanceGains: tuningResults?.performanceGains,
      resourceSavings: tuningResults?.resourceSavings,
    });

    // Test cache effectiveness
    console?.log('Testing cache effectiveness?.?.?.');
    const cacheTestStart = Date?.now();

    // Access hot data multiple times to test cache performance
    for (let i = 0; i < 20; i++) {
      await system?.retrieveWithOptimization(
        `hot_session_${i % 5}`,
        `hot_key_${i}`,
        {
          preferCached: true,
          enhanceWithKnowledge: false,
        }
      );
    }

    const cacheTestDuration = Date?.now() - cacheTestStart;
    const cacheStats = await system?.cacheStrategy?.getStats()

    console?.log('Cache Performance Test:', {
      testDuration: cacheTestDuration,
      hitRate: cacheStats?.hitRate,
      totalHits: cacheStats?.metrics?.totalHits,
      totalMisses: cacheStats?.metrics?.totalMisses,
      cacheSize: cacheStats?.size,
      memoryUsage: cacheStats?.memoryUsage,
    });

    // Test lifecycle management
    console?.log('Testing lifecycle management?.?.?.');
    const lifecycleStats = await system?.lifecycleManager?.getStats()
    console?.log('Lifecycle Management Stats:', {
      tiersDistribution: lifecycleStats?.tiersDistribution,
      migrationsCompleted: lifecycleStats?.migrationsCompleted,
      archivedItems: lifecycleStats?.archivedItems,
      totalManaged: lifecycleStats?.totalManagedItems,
    });

    // Knowledge extraction analysis
    console?.log('Testing knowledge extraction?.?.?.');
    const knowledgeStats = await system?.knowledgeExtractor?.getStats()
    console?.log('Knowledge Extraction Stats:', {
      extractionsPerformed: knowledgeStats?.extractionsPerformed,
      knowledgeItemsStored: knowledgeStats?.knowledgeItemsStored,
      averageExtractionTime: knowledgeStats?.averageExtractionTime,
      successRate: knowledgeStats?.successRate,
    });

    // Get final performance metrics
    const finalMetrics = await system?.getPerformanceMetrics()
    const performanceImprovement = {
      latencyImprovement:
        ((initialMetrics?.integration?.averageLatency -
          finalMetrics?.integration?.averageLatency) /
          initialMetrics?.integration?.averageLatency) *
        100,
      operationsIncrease:
        finalMetrics?.integration?.totalOperations -
        initialMetrics?.integration?.totalOperations,
    };

    console?.log('Performance Improvement:', {
      latencyReduction: `${performanceImprovement?.latencyImprovement?.toFixed(2)}%`,
      additionalOperations: performanceImprovement?.operationsIncrease,
      finalAverageLatency: finalMetrics?.integration?.averageLatency,
    });

    // Get comprehensive health report
    const health = await system?.getSystemHealth()
    console?.log('Final System Health:', {
      overallStatus: health?.overall?.status,
      overallScore: health?.overall?.score,
      componentHealth: Object?.entries(health?.components)?.map(
        ([component, data]) => ({
          component,
          status: data?.status,
          score: data?.score,
        })
      ),
      activeIssues: health?.issues?.length,
      recommendations: health?.recommendations?.length,
    });

    // Generate optimization report
    const optimizationReport = {
      timestamp: Date?.now(),
      testDuration: Date?.now() - cacheTestStart,
      dataGenerated: {
        hot: 50,
        warm: 100,
        cold: 200,
        total: 350,
      },
      performanceGains: performanceImprovement,
      cacheEffectiveness: {
        hitRate: cacheStats?.hitRate,
        memoryEfficiency: cacheStats?.memoryUsage / cacheStats?.maxMemory,
      },
      systemHealth: {
        status: health?.overall?.status,
        score: health?.overall?.score,
      },
      recommendations: optimizationRecommendations?.slice(0, 5), // Top 5 recommendations
      nextSteps: [
        'Monitor cache hit rates over extended period',
        'Implement automated tier migration based on access patterns',
        'Fine-tune knowledge extraction for better performance',
        'Set up proactive health monitoring alerts',
      ],
    };

    console?.log('Optimization Report Generated:', optimizationReport);
    return optimizationReport;
  } catch (error) {
    console?.error('Optimization demonstration failed:', error);
    throw error;
  } finally {
    await system?.shutdown();
    console?.log('Optimization demonstration completed and system shutdown?.');
  }
}

// Export demonstration functions
export const integrationExamples = {
  createIntegratedSystem,
  demonstrateMCPIntegration,
  demonstrateErrorHandling,
  demonstrateOptimization,
};
