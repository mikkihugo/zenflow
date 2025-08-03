/**
 * Database Domain - Enhanced Index
 * Exports for advanced database interfaces, coordination, and management systems
 * Provides unified access to vector, graph, relational, and multi-engine coordination
 */

// Legacy database interfaces
export type {
  GraphEdge,
  GraphNode,
  KuzuConfig,
  QueryResult,
} from './kuzu-advanced-interface';
export { KuzuAdvancedInterface } from './kuzu-advanced-interface';

export type {
  ClusteringOptions,
  ClusterResult,
  LanceDBConfig,
  LanceDBStats,
  SearchResult,
  VectorDocument,
} from './lancedb-interface';
export { LanceDBInterface } from './lancedb-interface';

export type {
  SwarmDatabaseConfig,
  SwarmQuery,
  SwarmRecord,
} from './swarm-database';
export { SwarmDatabase } from './swarm-database';

// Advanced coordination and optimization
export {
  DatabaseCoordinator,
  type DatabaseEngine,
  type DatabaseQuery,
  type QueryExecution,
  type CoordinationStrategy,
} from './core/database-coordinator';

export {
  QueryOptimizer,
  type QueryPattern,
  type OptimizationRule,
  type QueryCache,
  type OptimizationMetrics,
} from './optimization/query-optimizer';

// MCP Tools
export {
  databaseTools,
  databaseInitTool,
  databaseQueryTool,
  databaseOptimizeTool,
  databaseMonitorTool,
  databaseHealthCheckTool,
} from './mcp/database-tools';

// Error handling
export {
  DatabaseError,
  DatabaseErrorCode,
  DatabaseCoordinationError,
  DatabaseEngineError,
  DatabaseQueryError,
  DatabaseTransactionError,
  DatabaseErrorClassifier,
  type DatabaseErrorContext,
} from './error-handling/database-errors';

// Enhanced Database utilities and helpers
export const DatabaseUtils = {
  /**
   * Get the appropriate database interface based on type
   */
  getDatabaseInterface: (type: 'lancedb' | 'kuzu' | 'swarm', config: any) => {
    switch (type) {
      case 'lancedb':
        return new LanceDBInterface(config);
      case 'kuzu':
        return new KuzuAdvancedInterface(config);
      case 'swarm':
        return new SwarmDatabase(config);
      default:
        throw new Error(`Unknown database type: ${type}`);
    }
  },

  /**
   * Validate database configuration
   */
  validateConfig: (type: string, config: any): boolean => {
    if (!type || !config) return false;

    switch (type) {
      case 'lancedb':
        return Boolean(config.dbPath || config.dbName);
      case 'kuzu':
        return Boolean(config.dbPath);
      case 'swarm':
        return Boolean(config.storage);
      default:
        return false;
    }
  },

  /**
   * Get database capabilities by type
   */
  getCapabilities: (type: string) => {
    const capabilities = {
      lancedb: ['vector_search', 'similarity', 'clustering', 'indexing'],
      kuzu: ['graph_queries', 'relationships', 'traversal', 'analytics'],
      swarm: ['distributed', 'coordination', 'consensus', 'replication'],
    };

    return capabilities[type as keyof typeof capabilities] || [];
  },

  /**
   * Create a database engine descriptor
   */
  createEngine: (id: string, type: 'vector' | 'graph' | 'document' | 'relational' | 'timeseries', config: any): DatabaseEngine => {
    const interface_ = DatabaseUtils.getDatabaseInterface(type as any, config);
    const capabilities = DatabaseUtils.getCapabilities(type);

    return {
      id,
      type,
      interface: interface_,
      capabilities,
      status: 'active',
      lastHealthCheck: Date.now(),
      performance: {
        averageLatency: 0,
        throughput: 0,
        errorRate: 0,
        capacity: 1000,
        utilization: 0,
      },
      config,
    };
  },
};

// Enhanced Database factory for creating instances
export class DatabaseFactory {
  private static instances = new Map<string, any>();
  private static coordinator: DatabaseCoordinator | null = null;
  private static optimizer: QueryOptimizer | null = null;

  /**
   * Create or get a database instance
   */
  static getInstance<T>(
    type: 'lancedb' | 'kuzu' | 'swarm',
    config: any,
    instanceKey = 'default'
  ): T {
    const key = `${type}:${instanceKey}`;

    if (!DatabaseFactory.instances.has(key)) {
      const instance = DatabaseUtils.getDatabaseInterface(type, config);
      DatabaseFactory.instances.set(key, instance);
    }

    return DatabaseFactory.instances.get(key);
  }

  /**
   * Create a complete database system with coordination and optimization
   */
  static async createAdvancedDatabaseSystem(config: {
    engines: Array<{ id: string; type: 'vector' | 'graph' | 'document' | 'relational' | 'timeseries'; config: any }>;
    optimization?: {
      enabled?: boolean;
      caching?: any;
      aggressiveness?: 'low' | 'medium' | 'high';
    };
    coordination?: {
      healthCheckInterval?: number;
      defaultTimeout?: number;
      loadBalancing?: string;
    };
  }) {
    // Initialize coordinator and optimizer
    DatabaseFactory.coordinator = new DatabaseCoordinator();
    DatabaseFactory.optimizer = new QueryOptimizer();

    const engines = new Map<string, DatabaseEngine>();

    // Register engines
    for (const engineConfig of config.engines) {
      try {
        const engine = DatabaseUtils.createEngine(engineConfig.id, engineConfig.type, engineConfig.config);
        await DatabaseFactory.coordinator.registerEngine(engine);
        engines.set(engine.id, engine);
      } catch (error) {
        console.error(`Failed to register engine ${engineConfig.id}:`, error);
      }
    }

    return {
      coordinator: DatabaseFactory.coordinator,
      optimizer: DatabaseFactory.optimizer,
      engines,

      // Convenience methods
      async query(query: DatabaseQuery) {
        if (!DatabaseFactory.coordinator || !DatabaseFactory.optimizer) {
          throw new Error('Database system not initialized');
        }

        const optimizedQuery = await DatabaseFactory.optimizer.optimizeQuery(query, engines);
        const execution = await DatabaseFactory.coordinator.executeQuery(optimizedQuery);
        DatabaseFactory.optimizer.recordExecution(execution);
        return execution;
      },

      async shutdown() {
        if (DatabaseFactory.coordinator) {
          await DatabaseFactory.coordinator.shutdown();
        }
        DatabaseFactory.coordinator = null;
        DatabaseFactory.optimizer = null;
      },

      getStats() {
        return {
          coordinator: DatabaseFactory.coordinator?.getStats(),
          optimizer: DatabaseFactory.optimizer?.getStats(),
          engines: engines.size,
        };
      },

      getHealthReport() {
        const stats = this.getStats();
        const coordinatorStats = stats.coordinator;
        
        if (!coordinatorStats) {
          return { overall: 'critical', score: 0, details: {}, recommendations: [] };
        }

        const healthScore = (coordinatorStats.engines.active / Math.max(coordinatorStats.engines.total, 1)) * 100;
        
        return {
          overall: healthScore > 80 ? 'healthy' : healthScore > 50 ? 'warning' : 'critical',
          score: Math.round(healthScore),
          details: stats,
          recommendations: DatabaseFactory.optimizer?.getRecommendations() || [],
        };
      },
    };
  }

  /**
   * Create a basic database system with single engine
   */
  static async createBasicDatabaseSystem(
    type: 'lancedb' | 'kuzu' | 'swarm',
    config: any,
    engineId = 'default'
  ) {
    const engines = [{
      id: engineId,
      type: type as any,
      config,
    }];

    return this.createAdvancedDatabaseSystem({
      engines,
      optimization: { enabled: true, aggressiveness: 'medium' },
      coordination: { healthCheckInterval: 30000, defaultTimeout: 30000 },
    });
  }

  /**
   * Clear all cached instances
   */
  static clearInstances(): void {
    DatabaseFactory.instances.clear();
  }

  /**
   * Get all active instances
   */
  static getActiveInstances(): string[] {
    return Array.from(DatabaseFactory.instances.keys());
  }
}

// Default export is the enhanced factory
export default DatabaseFactory;
