/**
 * @fileoverview Database Infrastructure Module Exports
 *
 * Backend-agnostic database access through foundation types.
 * Provides unified interfaces that can be implemented by concrete database adapters.
 */
export { databaseFacade, createDatabaseAdapter, createKeyValueStore, createVectorStore, createGraphStore, getDatabaseCapability, } from './database-facade.js';
export type { DatabaseType, StorageType, QueryParams, DatabaseConfig, PoolConfig, RetryPolicy, HealthCheckConfig, DatabaseConnection, TransactionConnection, DatabaseAdapter, KeyValueStorage as KeyValueStore, VectorStorage as VectorStore, GraphStorage as GraphStore, SqlStorage, HealthStatus, QueryResult, ConnectionStats, SchemaInfo, TableSchema, ColumnSchema, ViewSchema, IndexSchema, ConstraintSchema, ForeignKeySchema, Migration, MigrationResult, VectorSearchOptions, VectorResult, GraphNode, GraphEdge, GraphResult, TransactionContext, IsolationLevel, DatabaseError, ConnectionError, QueryError, TransactionError, DatabaseErrorOptions, QueryErrorOptions, DatabaseFactory, DatabaseProvider, DatabaseAccess, CreateDatabaseFunction, CreateKeyValueStorageFunction, CreateDatabaseAccessFunction, } from './types.js';
//# sourceMappingURL=index.d.ts.map