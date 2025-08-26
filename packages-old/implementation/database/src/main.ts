/**
 * Database Package Main Entry Point
 *
 * Exports all production database types, interfaces, adapters, storage implementations,
 * and factory functions for enterprise-grade multi-database applications.
 */

export { KuzuAdapter } from './adapters/kuzu-adapter.js';
export { LanceDBAdapter } from './adapters/lancedb-adapter.js';
// Adapters
export { SQLiteAdapter } from './adapters/sqlite-adapter.js';
// Database Factory
export {
  createDatabaseConnection,
  createOptimalStorageConfig,
  createStorage,
  DatabaseFactoryImpl,
  getDatabaseFactory,
} from './factory/database-factory.js';
export { GraphStorageImpl } from './storage/graph-storage.js';
// Storage Implementations
export { KeyValueStorageImpl } from './storage/key-value-storage.js';
export { SQLStorageImpl } from './storage/sql-storage.js';
export { VectorStorageImpl } from './storage/vector-storage.js';
// Core Types and Interfaces
export type {
  ColumnSchema,
  ConnectionError,
  ConnectionStats,
  ConstraintSchema,
  DatabaseConfig,
  // Connection Interfaces
  DatabaseConnection,
  // Error Types
  DatabaseError,
  // Factory Interface
  DatabaseFactory,
  // Database Types
  DatabaseType,
  ForeignKeySchema,
  GraphEdge,
  // Graph Types
  GraphNode,
  GraphResult,
  GraphStorage,
  HealthCheckConfig,
  // Results and Status
  HealthStatus,
  IndexSchema,
  IsolationLevel,
  // Storage Interfaces
  KeyValueStorage,
  // Migration Types
  Migration,
  MigrationResult,
  PoolConfig,
  QueryError,
  QueryParams,
  QueryResult,
  RetryPolicy,
  SchemaInfo,
  SqlStorage,
  StorageType,
  TableSchema,
  TransactionConnection,
  TransactionContext,
  TransactionError,
  VectorResult,
  // Vector Types
  VectorSearchOptions,
  VectorStorage,
  ViewSchema,
} from './types/index.js';

// Error Classes and Enums for direct instantiation (no duplicates)
export {
  ConnectionError as ConnectionErrorClass,
  DatabaseError as DatabaseErrorClass,
  QueryError as QueryErrorClass,
  TransactionError as TransactionErrorClass,
} from './types/index.js';

/**
 * Quick start helper - creates a database connection with optimal defaults
 */
export function quickStart(
  type: 'sqlite' | 'lancedb' | 'kuzu',
  database: string,
  options?: Record<string, unknown>
) {
  const { createDatabaseConnection } = require('./factory/database-factory.js');
  return createDatabaseConnection({
    type,
    database,
    options,
  });
}

/**
 * Creates multiple storage types with optimal backends
 */
export function createMultiStorage(database: string) {
  const { createStorage } = require('./factory/database-factory.js');
  return {
    keyValue: createStorage('keyValue', database),
    sql: createStorage('sql', database),
    vector: createStorage('vector', database),
    graph: createStorage('graph', database),
  };
}

/**
 * Package version and metadata
 */
export const version = '1.0.0';
export const packageName = '@claude-zen/database';
export const description =
  'Multi-database abstraction layer for claude-code-zen';

/**
 * Default configurations for different use cases
 */
export const defaultConfigs = {
  development: {
    sqlite: {
      type: 'sqlite' as const,
      database: './dev.db',
      pool: { min: 1, max: 5 },
      retryPolicy: {
        maxRetries: 2,
        initialDelayMs: 100,
        maxDelayMs: 1000,
        backoffFactor: 2,
        retryableErrors: [],
      },
    },
    lancedb: {
      type: 'lancedb' as const,
      database: './dev_vectors',
      retryPolicy: {
        maxRetries: 2,
        initialDelayMs: 100,
        maxDelayMs: 1000,
        backoffFactor: 2,
        retryableErrors: [],
      },
    },
    kuzu: {
      type: 'kuzu' as const,
      database: './dev_graph',
      retryPolicy: {
        maxRetries: 2,
        initialDelayMs: 100,
        maxDelayMs: 1000,
        backoffFactor: 2,
        retryableErrors: [],
      },
    },
  },

  production: {
    sqlite: {
      type: 'sqlite' as const,
      database: './prod.db',
      pool: { min: 5, max: 50 },
      retryPolicy: {
        maxRetries: 5,
        initialDelayMs: 200,
        maxDelayMs: 10000,
        backoffFactor: 2,
        retryableErrors: ['SQLITE_BUSY', 'SQLITE_LOCKED'],
      },
      healthCheck: {
        enabled: true,
        intervalMs: 30000,
        timeoutMs: 5000,
        retries: 3,
      },
    },
    lancedb: {
      type: 'lancedb' as const,
      database: './prod_vectors',
      retryPolicy: {
        maxRetries: 5,
        initialDelayMs: 200,
        maxDelayMs: 10000,
        backoffFactor: 2,
        retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR'],
      },
      healthCheck: {
        enabled: true,
        intervalMs: 60000,
        timeoutMs: 10000,
        retries: 3,
      },
    },
    kuzu: {
      type: 'kuzu' as const,
      database: './prod_graph',
      options: { bufferPoolSize: 4 * 1024 * 1024 * 1024, maxNumThreads: 16 },
      retryPolicy: {
        maxRetries: 5,
        initialDelayMs: 200,
        maxDelayMs: 10000,
        backoffFactor: 2,
        retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR'],
      },
      healthCheck: {
        enabled: true,
        intervalMs: 60000,
        timeoutMs: 10000,
        retries: 3,
      },
    },
  },
};

/**
 * Utility function to validate database configurations
 */
export function validateConfig(config: unknown): boolean {
  const typedConfig = config as { type?: string; database?: string };

  // Basic validation - factory will do comprehensive validation
  return Boolean(typedConfig.type && typedConfig.database);
}
