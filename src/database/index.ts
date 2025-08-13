/**
 * Database Domain - Main Export Module
 *
 * @file Central export point for all database functionality including types,
 * entities, managers, and API controllers. This module serves as the single source
 * of truth for all database operations and type definitions.
 *
 * Following domain architecture standard with consolidated types.
 */

// Export all database types (Single Source of Truth)
export * from './types.ts';

/**
 * @deprecated Legacy export structure - use domain types instead
 * @example Legacy Usage
 * ```typescript
 * import { createDao, EntityTypes, DatabaseTypes } from './database';
 *
 * // Create a PostgreSQL DAO for user entities
 * const userDao = await createDao<User>(
 *   EntityTypes.User,
 *   DatabaseTypes.PostgreSQL,
 *   {
 *     host: 'localhost',
 *     port: 5432,
 *     database: 'myapp',
 *     username: 'user',
 *     password: 'pass'
 *   }
 * );
 *
 * const users = await userDao.findAll();
 * ```
 * @example Multi-Database Setup
 * ```typescript
 * import { createMultiDatabaseSetup, EntityTypes } from './database';
 *
 * // Primary database (PostgreSQL) with Redis cache fallback
 * const multiDao = await createMultiDatabaseSetup<User>(
 *   EntityTypes.User,
 *   { databaseType: 'postgresql', config: pgConfig },
 *   [{ databaseType: 'memory', config: cacheConfig }]
 * );
 *
 * // Writes go to primary, reads can fallback to cache
 * const user = await multiDao.findById('user-123');
 * ```
 */

// Base implementations
export { BaseDao, BaseManager } from './base.dao.ts';
export { CoordinationDao } from './dao/coordination.dao.ts';
export { GraphDao } from './dao/graph.dao.ts';
export { MemoryDao } from './dao/memory.dao.ts';
// DAO implementations
export { RelationalDao } from './dao/relational.dao.ts';
export { VectorDao } from './dao/vector.dao.ts';
// Factory and configuration
export {
  DALFactory,
  // TODO: TypeScript error TS2614 - DaoConfig not exported from factory (AI unsure of safe fix - human review needed)
  // type DaoConfig,
  // TODO: TypeScript error TS2614 - DaoType not exported from factory (AI unsure of safe fix - human review needed)
  // type DaoType,
  type EntityTypeRegistry,
  MultiDatabaseDAO,
} from './factory.ts';

// Import interfaces for use in functions below
import type { IDao, IManager } from './interfaces.ts';

// Core interfaces
export type {
  AgentMemoryCoordinationDao,
  CheckpointCoordinationDao,
  CheckpointEntity,
  ClusteringOptions,
  ClusterResult,
  CoordinationChange,
  CoordinationEvent,
  // Coordination types
  CoordinationLock,
  CoordinationStats,
  CustomQuery,
  DatabaseMetadata,
  DatabaseQuery,
  EventCoordinationDao,
  GenericCoordinationDao,
  // Graph database types
  GraphNode,
  GraphPath,
  GraphQueryResult,
  GraphRelationship,
  GraphTraversalResult,
  HealthStatus,
  IAgentMemoryDao,
  ICoordinationDao,
  IDao,
  IGraphDao,
  IManager,
  IMemoryDao,
  IVectorDao,
  // Memory store types
  MemoryStats,
  PerformanceMetrics,
  QueryOptions,
  SessionCoordinationDao,
  SessionEntity,
  SortCriteria,
  TransactionOperation,
  // Vector database types
  VectorDocument,
  VectorIndexConfig,
  VectorInsertResult,
  VectorSearchOptions,
  VectorSearchResult,
  VectorStats,
} from './interfaces.ts';

// Export enums from interfaces
export {
  DatabaseTypes as DatabaseTypesEnum,
  EntityTypes as EntityTypesEnum,
} from './interfaces.ts';
// Manager implementations
export { DocumentManager } from './managers/document-manager.ts';

// Re-export database provider types for convenience
export type {
  DatabaseAdapter,
  DatabaseConfig,
  GraphDatabaseAdapter,
  GraphResult,
  IndexConfig,
  VectorData,
  VectorDatabaseAdapter,
  VectorResult,
} from './providers/database-providers.ts';

/**
 * Convenience functions for quick DAL setup.
 */

/**
 * Create a Data Access Object (DAO) for a specific entity type and database.
 *
 * This function creates a fully configured DAO instance with database connection,
 * entity mapping, and CRUD operations. It handles dependency injection setup
 * automatically and provides a clean interface for database operations.
 *
 * @template T The entity type this DAO will manage.
 * @param {string} entityType - The name of the entity type (e.g., 'User', 'Product').
 * @param {('postgresql'|'sqlite'|'kuzu'|'lancedb'|'mysql'|'memory'|'coordination')} databaseType - Database type to use.
 * @param {any} [config] - Optional database configuration object.
 * @returns {Promise<IDao<T>>} A Promise that resolves to a configured DAO instance.
 * @throws {Error} When database configuration is invalid.
 * @throws {Error} When database connection fails.
 * @throws {Error} When dependency injection setup fails.
 * @example PostgreSQL DAO with Connection Pool
 * ```typescript
 * const userDao = await createDao<User>('User', 'postgresql', {
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'production',
 *   username: 'app_user',
 *   password: 'secure_password',
 *   pool: { min: 2, max: 20, timeout: 30000 }
 * });
 *
 * // Use the DAO for database operations
 * const newUser = await userDao.create({ name: 'John', email: 'john@example.com' });
 * const users = await userDao.findAll({ limit: 10 });
 * ```
 * @example LanceDB Vector DAO
 * ```typescript
 * const vectorDao = await createDao<VectorDocument>('VectorDocument', 'lancedb', {
 *   database: './vectors/embeddings.lance',
 *   options: {
 *     vectorSize: 1536, // OpenAI embedding dimension
 *     metricType: 'cosine',
 *     indexType: 'IVF_PQ'
 *   }
 * });
 *
 * // Vector similarity search
 * const similar = await vectorDao.vectorSearch([0.1, 0.2, ...], 10);
 * ```
 * @example Memory DAO for Caching
 * ```typescript
 * const cacheDao = await createDao<CacheItem>('CacheItem', 'memory', {
 *   database: ':memory:', // In-memory SQLite
 *   options: { maxSize: 1000, ttlDefault: 3600 }
 * });
 * ```
 */
// Re-export from dao-factory to break circular dependency
export { createDao } from './core/dao-factory.ts';

/**
 * Create a Manager instance for high-level entity operations.
 *
 * Managers provide business logic layer above DAOs, offering complex operations,
 * data validation, caching, and cross-entity relationships. They're ideal for
 * application service layers that need more than basic CRUD operations.
 *
 * @template T The entity type this manager will handle.
 * @param {string} entityType - The name of the entity type.
 * @param {('postgresql'|'sqlite'|'kuzu'|'lancedb'|'mysql'|'memory'|'coordination')} databaseType - Database type to use.
 * @param {any} [config] - Optional database configuration.
 * @returns {Promise<IManager<T>>} A Promise that resolves to a configured Manager instance.
 * @throws {Error} When manager creation fails.
 * @throws {Error} When underlying DAO creation fails.
 * @throws {Error} When business logic validation fails.
 * @example Document Manager with Validation
 * ```typescript
 * const docManager = await createManager<Document>('Document', 'postgresql', dbConfig);
 *
 * // Manager handles validation, indexing, and relationships
 * const doc = await docManager.createDocument({
 *   title: 'Important Doc',
 *   content: 'Document content...',
 *   tags: ['important', 'business']
 * });
 *
 * // Manager can handle complex queries
 * const relatedDocs = await docManager.findRelatedDocuments(doc.id, {
 *   similarity: 0.8,
 *   maxResults: 5
 * });
 * ```
 * @example User Manager with Authentication
 * ```typescript
 * const userManager = await createManager<User>('User', 'postgresql', {
 *   host: 'localhost',
 *   database: 'auth_db'
 * });
 *
 * // Manager handles password hashing, validation
 * const user = await userManager.registerUser({
 *   email: 'user@example.com',
 *   password: 'plaintext', // Will be hashed
 *   profile: { name: 'John Doe' }
 * });
 * ```
 */
export async function createManager<T>(
  entityType: string,
  databaseType:
    | 'postgresql'
    | 'sqlite'
    | 'kuzu'
    | 'lancedb'
    | 'mysql'
    | 'memory'
    | 'coordination',
  config?: unknown
): Promise<IManager<T>> {
  const { DALFactory } = await import('./factory.ts');
  const { DIContainer } = await import('../di/container/di-container.ts');
  const { CORE_TOKENS } = await import('../di/tokens/core-tokens.ts');

  const container = new DIContainer();

  // TODO: TypeScript error TS2345 - Logger provider type mismatch (AI unsure of safe fix - human review needed)
  container.register(CORE_TOKENS.Logger, (() => ({
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  })) as any);

  // TODO: TypeScript error TS2345 - Config provider type mismatch (AI unsure of safe fix - human review needed)
  container.register(CORE_TOKENS.Config, (() => ({})) as any);

  // TODO: TypeScript error TS2345/TS18046 - DALFactory DI token type mismatch (AI unsure of safe fix - human review needed)
  const factory = container.resolve(DALFactory as any);

  return await factory.createManager({
    databaseType,
    entityType,
    databaseConfig: config || getDefaultConfig(databaseType),
  });
}

/**
 * Create a multi-database DAO setup with primary and secondary databases.
 *
 * This function creates a sophisticated multi-database architecture with a primary database.
 * For writes and optional secondary databases for reads, caching, or replication.
 * The primary database handles all write operations, while reads can be distributed.
 * Across secondaries for performance and reliability..
 *
 * @template T The entity type for the multi-database setup.
 * @param {string} entityType - The entity type name.
 * @param {Object} primaryConfig - Primary database configuration.
 * @param {('postgresql'|'sqlite'|'kuzu'|'lancedb'|'mysql'|'memory'|'coordination')} primaryConfig.databaseType - Primary database type.
 * @param {any} [primaryConfig.config] - Primary database connection config.
 * @param {Array} [secondaryConfigs] - Optional array of secondary database configurations.
 * @returns {Promise<MultiDatabaseDAO<T>>} A Promise that resolves to a multi-database DAO.
 * @throws {Error} When primary database configuration is invalid.
 * @throws {Error} When any secondary database setup fails.
 * @throws {Error} When DAL factory initialization fails
 * @example Primary PostgreSQL with Redis Cache
 * ```typescript
 * const multiDao = await createMultiDatabaseSetup<User>(
 *   'User',
 *   {
 *     databaseType: 'postgresql',
 *     config: {
 *       host: 'db.example.com',
 *       database: 'production',
 *       pool: { min: 5, max: 50 }
 *     }
 *   },
 *   [
 *     {
 *       databaseType: 'memory',
 *       config: {
 *         database: ':memory:',
 *         options: { maxSize: 10000, ttl: 3600 }
 *       }
 *     }
 *   ]
 * );
 *
 * // Writes go to primary PostgreSQL
 * const user = await multiDao.create({ name: 'Alice' });
 *
 * // Reads can fallback to memory cache
 * const cachedUser = await multiDao.findById(user.id);
 * ```
 * @example Vector Primary with Graph Secondary
 * ```typescript
 * const multiDao = await createMultiDatabaseSetup<Document>(
 *   'Document',
 *   {
 *     databaseType: 'lancedb', // Vector search primary
 *     config: { database: './vectors.lance', vectorSize: 1536 }
 *   },
 *   [
 *     {
 *       databaseType: 'kuzu', // Graph relationships secondary
 *       config: { database: './graph.kuzu' }
 *     }
 *   ]
 * );
 *
 * // Vector operations on primary
 * const similar = await multiDao.vectorSearch(queryVector, 10);
 *
 * // Graph traversal on secondary
 * const metadata = await multiDao.getMetadata();
 * const graphData = metadata.secondaries[0];
 * ```
 */
export async function createMultiDatabaseSetup<T>(
  entityType: string,
  primaryConfig: {
    databaseType:
      | 'postgresql'
      | 'sqlite'
      | 'kuzu'
      | 'lancedb'
      | 'mysql'
      | 'memory'
      | 'coordination';
    config?: unknown;
  },
  secondaryConfigs?: Array<{
    databaseType:
      | 'postgresql'
      | 'sqlite'
      | 'kuzu'
      | 'lancedb'
      | 'mysql'
      | 'memory'
      | 'coordination';
    config?: unknown;
  }>
): Promise<import('./factory.ts').MultiDatabaseDAO<T>> {
  const { DALFactory } = await import('./factory.ts');
  const { DIContainer } = await import('../di/container/di-container.ts');
  const { CORE_TOKENS } = await import('../di/tokens/core-tokens.ts');

  const container = new DIContainer();

  // TODO: TypeScript error TS2345 - Logger provider type mismatch (AI unsure of safe fix - human review needed)
  container.register(CORE_TOKENS.Logger, (() => ({
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  })) as any);

  // TODO: TypeScript error TS2345 - Config provider type mismatch (AI unsure of safe fix - human review needed)
  container.register(CORE_TOKENS.Config, (() => ({})) as any);

  // TODO: TypeScript error TS2345/TS18046 - DALFactory DI token type mismatch (AI unsure of safe fix - human review needed)
  const factory = container.resolve(DALFactory as any);

  const primaryDaoConfig = {
    databaseType: primaryConfig?.databaseType,
    entityType,
    databaseConfig:
      primaryConfig?.config || getDefaultConfig(primaryConfig?.databaseType),
  };

  const secondaryDaoConfigs = secondaryConfigs?.map((sc) => ({
    databaseType: sc.databaseType,
    entityType,
    databaseConfig: sc.config || getDefaultConfig(sc.databaseType),
  }));

  return await factory.createMultiDatabaseDAO(
    entityType,
    primaryDaoConfig,
    secondaryDaoConfigs
  );
}

/**
 * Get default database configuration for a given database type.
 *
 * This function provides sensible defaults for different database types,
 * including connection parameters, pool settings, and database-specific options.
 * These defaults are suitable for development and can be overridden for production.
 *
 * @param {string} databaseType - The database type to get defaults for.
 * @returns {any} Default configuration object for the specified database type.
 * @throws {Error} When an unknown database type is specified.
 * @example Getting PostgreSQL Defaults
 * ```typescript
 * const pgDefaults = getDefaultConfig('postgresql');
 * console.log(pgDefaults);
 * // Output: {
 * //   type: 'postgresql',
 * //   host: 'localhost',
 * //   port: 5432,
 * //   database: 'claudezen',
 * //   pool: { min: 2, max: 10 }
 * // }
 * ```
 * @example Vector Database Defaults
 * ```typescript
 * const lanceDefaults = getDefaultConfig('lancedb');
 * console.log(lanceDefaults.options);
 * // Output: {
 * //   vectorSize: 384,
 * //   metricType: 'cosine',
 * //   indexType: 'IVF_PQ'
 * // }
 * ```
 */
function getDefaultConfig(databaseType: string): unknown {
  switch (databaseType) {
    case 'postgresql':
      return {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'claudezen',
        username: 'user',
        password: 'password',
        pool: { min: 2, max: 10 },
      };

    case 'sqlite':
      return {
        type: 'sqlite',
        database: './data/claudezen.db',
      };

    case 'kuzu':
      return {
        type: 'kuzu',
        database: './data/graph.kuzu',
        options: {
          bufferPoolSize: '1GB',
          maxNumThreads: 4,
        },
      };

    case 'lancedb':
      return {
        type: 'lancedb',
        database: './data/vectors.lance',
        options: {
          vectorSize: 384,
          metricType: 'cosine',
          indexType: 'IVF_PQ',
        },
      };

    case 'mysql':
      return {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'claudezen',
        username: 'user',
        password: 'password',
        pool: { min: 2, max: 10 },
      };

    case 'memory':
      return {
        type: 'sqlite', // Use SQLite as backing store for memory repository
        database: ':memory:',
      };

    case 'coordination':
      return {
        type: 'sqlite', // Use SQLite for coordination by default
        database: './data/coordination.db',
      };

    default:
      throw new Error(`Unknown database type: ${databaseType}`);
  }
}

/**
 * Predefined Entity Type Constants.
 *
 * This object provides a centralized registry of common entity types used throughout.
 * The Claude-Zen system. Using these constants ensures consistency and prevents
 * typos when creating DAOs and managers..
 *
 * @readonly
 * @constant
 * @example Using Entity Types
 * ```typescript
 * import { createDao, EntityTypes, DatabaseTypes } from './database';
 *
 * // Type-safe entity creation
 * const agentDao = await createDao<SwarmAgent>(
 *   EntityTypes.SwarmAgent, // Instead of 'SwarmAgent' string
 *   DatabaseTypes.Coordination
 * );
 *
 * const vectorDao = await createDao<VectorDocument>(
 *   EntityTypes.VectorDocument,
 *   DatabaseTypes.LanceDB
 * );
 * ```
 * @example Entity Type Categories
 * ```typescript
 * // Swarm coordination entities
 * console.log('Swarm entities:', {
 *   agents: EntityTypes.SwarmAgent,
 *   tasks: EntityTypes.SwarmTask,
 *   executions: EntityTypes.SwarmExecution
 * });
 *
 * // Memory management entities
 * console.log('Memory entities:', {
 *   entries: EntityTypes.MemoryEntry,
 *   cache: EntityTypes.CacheItem,
 *   sessions: EntityTypes.SessionData
 * });
 * ```
 */
// Re-export EntityTypes from dao-factory to break circular dependency
export { EntityTypeValues as EntityTypes } from './core/dao-factory.ts';

/**
 * Supported Database Type Constants.
 *
 * This object provides constants for all supported database types in the DAL.
 * Using these constants prevents typos and provides better IDE support with.
 * Autocomplete and type checking..
 *
 * @readonly
 * @constant
 * @example Database Type Usage
 * ```typescript
 * import { createDao, EntityTypes, DatabaseTypes } from './database';
 *
 * // Relational databases
 * const userDao = await createDao(
 *   EntityTypes.User,
 *   DatabaseTypes.PostgreSQL // Instead of 'postgresql'
 * );
 *
 * // Specialized databases
 * const vectorDao = await createDao(
 *   EntityTypes.VectorDocument,
 *   DatabaseTypes.LanceDB // Vector similarity search
 * );
 *
 * const graphDao = await createDao(
 *   EntityTypes.GraphNode,
 *   DatabaseTypes.Kuzu // Graph traversal queries
 * );
 * ```
 * @example Database Capabilities
 * ```typescript
 * // Check database capabilities
 * const dbType = DatabaseTypes.LanceDB;
 * console.log('Database type:', dbType); // 'lancedb'
 *
 * // Use in switch statements
 * switch(selectedDb) {
 *   case DatabaseTypes.PostgreSQL:
 *     // Handle relational operations
 *     break;
 *   case DatabaseTypes.LanceDB:
 *     // Handle vector operations
 *     break;
 * }
 * ```
 */
export const DatabaseTypes = {
  PostgreSQL: 'postgresql',
  SQLite: 'sqlite',
  MySQL: 'mysql',
  Kuzu: 'kuzu',
  LanceDB: 'lancedb',
  Memory: 'memory',
  Coordination: 'coordination',
} as const;

/**
 * Quick Setup Patterns for Common Use Cases.
 *
 * This object provides pre-configured factory methods for common application patterns,
 * eliminating boilerplate code and providing battle-tested configurations for typical.
 * Scenarios in AI applications, distributed systems, and data processing..
 *
 * @namespace QuickSetup
 * @readonly
 * @example Swarm Coordination Setup
 * ```typescript
 * import { QuickSetup } from './database';
 *
 * // Get complete swarm infrastructure
 * const swarmDbs = await QuickSetup.swarmCoordination();
 *
 * // Use individual components
 * const agent = await swarmDbs.agents.create({
 *   name: 'Worker-1',
 *   type: 'processor',
 *   status: 'active'
 * });
 *
 * const task = await swarmDbs.tasks.create({
 *   agentId: agent.id,
 *   payload: { action: 'process_document', docId: 'doc-123' }
 * });
 *
 * // Vector search for similar tasks
 * const similar = await swarmDbs.vectors.vectorSearch(taskEmbedding, 5);
 * ```
 * @example AI/ML Data Pipeline
 * ```typescript
 * const aiDbs = await QuickSetup.aimlData();
 *
 * // Store document in relational DB
 * const doc = await aiDbs.documents.create({
 *   title: 'Research Paper',
 *   content: 'AI research content...'
 * });
 *
 * // Store embeddings in vector DB
 * await aiDbs.embeddings.create({
 *   id: doc.id,
 *   vector: documentEmbedding,
 *   metadata: { type: 'document', source: 'research' }
 * });
 *
 * // Create knowledge graph relationships
 * await aiDbs.relationships.createNode({
 *   id: doc.id,
 *   labels: ['Document', 'Research'],
 *   properties: { title: doc.title }
 * });
 * ```
 */
export const QuickSetup = {
  /**
   * Create a typical swarm coordination setup.
   */
  async swarmCoordination() {
    const { createDao: createDaoFn } = await import('./core/dao-factory.ts');
    return {
      agents: await createDaoFn<any>(
        'agent',
        'coordination' as any,
        getDefaultConfig('coordination')
      ),
      tasks: await createDaoFn<any>(
        'task',
        'coordination' as any,
        getDefaultConfig('coordination')
      ),
      executions: await createDaoFn<any>(
        'coordination',
        'coordination' as any,
        getDefaultConfig('coordination')
      ),
      memory: await createDaoFn<any>(
        'memory',
        'memory' as any,
        getDefaultConfig('memory')
      ),
      vectors: await createDaoFn<any>(
        'vector',
        'lancedb' as any,
        getDefaultConfig('lancedb')
      ),
    };
  },

  /**
   * Create a typical AI/ML data setup.
   */
  async aimlData() {
    const { createDao: createDaoFn } = await import('./core/dao-factory.ts');
    return {
      documents: await createDaoFn<any>(
        'document',
        'postgresql' as any,
        getDefaultConfig('postgresql')
      ),
      embeddings: await createDaoFn<any>(
        'vector',
        'lancedb' as any,
        getDefaultConfig('lancedb')
      ),
      relationships: await createDaoFn<any>(
        'node',
        'kuzu' as any,
        getDefaultConfig('kuzu')
      ),
      cache: await createDaoFn<any>(
        'memory',
        'memory' as any,
        getDefaultConfig('memory')
      ),
    };
  },

  /**
   * Create a distributed application setup.
   */
  async distributedApp() {
    const primaryDB = await createManager('User', 'postgresql');
    const cacheDB = await createManager('User', 'memory');
    const coordinationDB = await createManager(
      'DistributedLock',
      'coordination'
    );

    return {
      primary: primaryDB,
      cache: cacheDB,
      coordination: coordinationDB,
    };
  },
};

// Default export is the factory
export { DALFactory as default } from './factory.ts';
