/**
 * @fileoverview Database Infrastructure Module Exports
 *
 * Backend-agnostic database access through foundation types.
 * Provides unified interfaces that can be implemented by concrete database adapters.
 */

// Export the unified facade interface
export {
  databaseFacade,
  createDatabaseAdapter,
  createKeyValueStore,
  createVectorStore,
  createGraphStore,
  getDatabaseCapability,
} from './database-facade.js';

// Export all backend-agnostic types for consumers  
export type {
  // Core types
  DatabaseType,
  StorageType,
  QueryParams,
  
  // Configuration
  DatabaseConfig,
  PoolConfig,
  RetryPolicy,
  HealthCheckConfig,
  
  // Connection and adapter interfaces
  DatabaseConnection,
  TransactionConnection,
  DatabaseAdapter,
  
  // Storage interfaces (using foundation names)
  KeyValueStorage as KeyValueStore,
  VectorStorage as VectorStore,
  GraphStorage as GraphStore,
  SqlStorage,
  
  // Health and monitoring
  HealthStatus,
  QueryResult,
  ConnectionStats,
  
  // Schema and migration
  SchemaInfo,
  TableSchema,
  ColumnSchema,
  ViewSchema,
  IndexSchema,
  ConstraintSchema,
  ForeignKeySchema,
  Migration,
  MigrationResult,
  
  // Vector types
  VectorSearchOptions,
  VectorResult,
  
  // Graph types
  GraphNode,
  GraphEdge,
  GraphResult,
  
  // Transaction types
  TransactionContext,
  IsolationLevel,
  
  // Error types
  DatabaseError,
  ConnectionError,
  QueryError,
  TransactionError,
  DatabaseErrorOptions,
  QueryErrorOptions,
  
  // Factory interfaces
  DatabaseFactory,
  DatabaseProvider,
  DatabaseAccess,
  
  // Function signatures
  CreateDatabaseFunction,
  CreateKeyValueStorageFunction,
  CreateDatabaseAccessFunction,
} from './types.js';
