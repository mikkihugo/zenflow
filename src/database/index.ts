/**
 * Unified Data Access Layer (DAL) - Main Export
 * 
 * Central export point for the unified DAL providing standardized access
 * to all database types through a consistent interface architecture.
 */

// Core interfaces
export type {
  IDao,
  IManager,
  IGraphDao,
  IVectorDao,
  IMemoryDao,
  ICoordinationDao,
  QueryOptions,
  CustomQuery,
  TransactionOperation,
  DatabaseMetadata,
  HealthStatus,
  PerformanceMetrics,
  SortCriteria,
  
  // Graph database types
  GraphNode,
  GraphRelationship,
  GraphTraversalResult,
  GraphQueryResult,
  GraphPath,
  
  // Vector database types
  VectorDocument,
  VectorSearchOptions,
  VectorSearchResult,
  VectorInsertResult,
  VectorIndexConfig,
  VectorStats,
  ClusteringOptions,
  ClusterResult,
  
  // Memory store types
  MemoryStats,
  
  // Coordination types
  CoordinationLock,
  CoordinationChange,
  CoordinationEvent,
  CoordinationStats
} from './interfaces';

// Base implementations
export { BaseDao, BaseManager } from './base.dao';

// DAO implementations
export { RelationalDao } from './dao/relational.dao';
export { GraphDao } from './dao/graph.dao';
export { VectorDao } from './dao/vector.dao';
export { MemoryDao } from './dao/memory.dao';
export { CoordinationDao } from './dao/coordination.dao';

// Manager implementations
export { DocumentManager } from './managers/document-manager';

// Factory and configuration
export { 
  DALFactory, 
  MultiDatabaseDAO,
  type DaoConfig,
  type DaoType,
  type EntityTypeRegistry
} from './factory';

// Re-export database provider types for convenience
export type {
  DatabaseAdapter,
  GraphDatabaseAdapter,
  VectorDatabaseAdapter,
  DatabaseConfig,
  GraphResult,
  VectorResult,
  VectorData,
  IndexConfig
} from './providers/database-providers';

/**
 * Convenience functions for quick DAL setup
 */

/**
 * Create a simple DAO for a given entity type and database
 */
export async function createDao<T>(
  entityType: string,
  databaseType: 'postgresql' | 'sqlite' | 'kuzu' | 'lancedb' | 'mysql' | 'memory' | 'coordination',
  config?: any
): Promise<IDao<T>> {
  const { DALFactory } = await import('./factory');
  const { DIContainer } = await import('../../di/container/di-container');
  const { CORE_TOKENS } = await import('../../di/tokens/core-tokens');
  
  // Create basic DI container for factory dependencies
  const container = new DIContainer();
  
  // Register basic logger and config (would be properly configured in real app)
  container.register(CORE_TOKENS.Logger, () => ({
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  }));
  
  container.register(CORE_TOKENS.Config, () => ({}));
  
  const factory = container.resolve(DALFactory);
  
  return await factory.createDao<T>({
    databaseType,
    entityType,
    databaseConfig: config || getDefaultConfig(databaseType)
  });
}

/**
 * Create a Manager for a given entity type and database
 */
export async function createManager<T>(
  entityType: string,
  databaseType: 'postgresql' | 'sqlite' | 'kuzu' | 'lancedb' | 'mysql' | 'memory' | 'coordination',
  config?: any
): Promise<IManager<T>> {
  const { DALFactory } = await import('./factory');
  const { DIContainer } = await import('../../di/container/di-container');
  const { CORE_TOKENS } = await import('../../di/tokens/core-tokens');
  
  const container = new DIContainer();
  
  container.register(CORE_TOKENS.Logger, () => ({
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  }));
  
  container.register(CORE_TOKENS.Config, () => ({}));
  
  const factory = container.resolve(DALFactory);
  
  return await factory.createManager<T>({
    databaseType,
    entityType,
    databaseConfig: config || getDefaultConfig(databaseType)
  });
}

/**
 * Create a multi-database setup with primary and secondary databases
 */
export async function createMultiDatabaseSetup<T>(
  entityType: string,
  primaryConfig: {
    databaseType: 'postgresql' | 'sqlite' | 'kuzu' | 'lancedb' | 'mysql' | 'memory' | 'coordination';
    config?: any;
  },
  secondaryConfigs?: Array<{
    databaseType: 'postgresql' | 'sqlite' | 'kuzu' | 'lancedb' | 'mysql' | 'memory' | 'coordination';
    config?: any;
  }>
): Promise<MultiDatabaseDAO<T>> {
  const { DALFactory } = await import('./factory');
  const { DIContainer } = await import('../../di/container/di-container');
  const { CORE_TOKENS } = await import('../../di/tokens/core-tokens');
  
  const container = new DIContainer();
  
  container.register(CORE_TOKENS.Logger, () => ({
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  }));
  
  container.register(CORE_TOKENS.Config, () => ({}));
  
  const factory = container.resolve(DALFactory);
  
  const primaryDaoConfig = {
    databaseType: primaryConfig.databaseType,
    entityType,
    databaseConfig: primaryConfig.config || getDefaultConfig(primaryConfig.databaseType)
  };
  
  const secondaryDaoConfigs = secondaryConfigs?.map(sc => ({
    databaseType: sc.databaseType,
    entityType,
    databaseConfig: sc.config || getDefaultConfig(sc.databaseType)
  }));
  
  return await factory.createMultiDatabaseDAO<T>(
    entityType,
    primaryDaoConfig,
    secondaryDaoConfigs
  );
}

/**
 * Get default configuration for database types
 */
function getDefaultConfig(databaseType: string): any {
  switch (databaseType) {
    case 'postgresql':
      return {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'claudezen',
        username: 'user',
        password: 'password',
        pool: { min: 2, max: 10 }
      };
      
    case 'sqlite':
      return {
        type: 'sqlite',
        database: './data/claudezen.db'
      };
      
    case 'kuzu':
      return {
        type: 'kuzu',
        database: './data/graph.kuzu',
        options: {
          bufferPoolSize: '1GB',
          maxNumThreads: 4
        }
      };
      
    case 'lancedb':
      return {
        type: 'lancedb',
        database: './data/vectors.lance',
        options: {
          vectorSize: 384,
          metricType: 'cosine',
          indexType: 'IVF_PQ'
        }
      };
      
    case 'mysql':
      return {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'claudezen',
        username: 'user',
        password: 'password',
        pool: { min: 2, max: 10 }
      };
      
    case 'memory':
      return {
        type: 'sqlite', // Use SQLite as backing store for memory repository
        database: ':memory:'
      };
      
    case 'coordination':
      return {
        type: 'sqlite', // Use SQLite for coordination by default
        database: './data/coordination.db'
      };
      
    default:
      throw new Error(`Unknown database type: ${databaseType}`);
  }
}

/**
 * Entity type helpers for common use cases
 */
export const EntityTypes = {
  // Swarm coordination entities
  SwarmAgent: 'SwarmAgent',
  SwarmTask: 'SwarmTask',
  SwarmExecution: 'SwarmExecution',
  
  // Memory entities
  MemoryEntry: 'MemoryEntry',
  CacheItem: 'CacheItem',
  SessionData: 'SessionData',
  
  // Vector entities
  VectorDocument: 'VectorDocument',
  Embedding: 'Embedding',
  Similarity: 'Similarity',
  
  // Graph entities
  GraphNode: 'GraphNode',
  GraphRelationship: 'GraphRelationship',
  GraphPath: 'GraphPath',
  
  // Coordination entities
  DistributedLock: 'DistributedLock',
  CoordinationEvent: 'CoordinationEvent',
  WorkflowStep: 'WorkflowStep',
  
  // Generic entities
  User: 'User',
  Document: 'Document',
  Configuration: 'Configuration'
} as const;

/**
 * Database type helpers
 */
export const DatabaseTypes = {
  PostgreSQL: 'postgresql',
  SQLite: 'sqlite',
  MySQL: 'mysql',
  Kuzu: 'kuzu',
  LanceDB: 'lancedb',
  Memory: 'memory',
  Coordination: 'coordination'
} as const;

/**
 * Quick setup for common patterns
 */
export const QuickSetup = {
  /**
   * Create a typical swarm coordination setup
   */
  async swarmCoordination() {
    return {
      agents: await createDao('SwarmAgent', 'coordination'),
      tasks: await createDao('SwarmTask', 'coordination'),
      executions: await createDao('SwarmExecution', 'coordination'),
      memory: await createDao('MemoryEntry', 'memory'),
      vectors: await createDao('VectorDocument', 'lancedb')
    };
  },

  /**
   * Create a typical AI/ML data setup
   */
  async aimlData() {
    return {
      documents: await createDao('Document', 'postgresql'),
      embeddings: await createDao('VectorDocument', 'lancedb'),
      relationships: await createDao('GraphNode', 'kuzu'),
      cache: await createDao('CacheItem', 'memory')
    };
  },

  /**
   * Create a distributed application setup
   */
  async distributedApp() {
    const primaryDB = await createManager('User', 'postgresql');
    const cacheDB = await createManager('User', 'memory');
    const coordinationDB = await createManager('DistributedLock', 'coordination');
    
    return {
      primary: primaryDB,
      cache: cacheDB,
      coordination: coordinationDB
    };
  }
};

// Default export is the factory
export { DALFactory as default } from './factory';
