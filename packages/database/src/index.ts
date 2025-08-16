/**
 * @fileoverview Database Package - Pure Infrastructure Components
 * 
 * This package contains pure database infrastructure that can be reused
 * across different applications. Application-specific entities, services,
 * and controllers remain in the main application.
 */

// Core database infrastructure
export * from './adapters/kuzu-adapter.js';
export * from './adapters/lancedb-adapter.js';
export * from './adapters/sqlite-adapter.js';

// DAO layer
export * from './dao/relational.dao.js';
export * from './dao/vector.dao.js';
export * from './dao/graph.dao.js';
export * from './dao/memory.dao.js';
export * from './dao/coordination.dao.js';

// Core abstractions
export * from './core/dao-factory.js';
export * from './base.dao.js';
export * from './factory.js';

// Types and interfaces (selective exports to avoid conflicts)
export type {
  BaseEntity,
  VectorDocument,
  VectorSearchOptions,
  GraphNode,
  GraphRelationship,
  GraphPath,
  HealthStatus,
  PerformanceMetrics,
  DatabaseConfig,
  EntityType
} from './types.js';

export type {
  DatabaseAdapter,
  Repository,
  DataAccessObject,
  CustomQuery,
  QueryOptions,
  TransactionOperation
} from './interfaces.js';

// Providers (with selective exports to avoid conflicts)
export { 
  DatabaseProviderFactory,
  type GraphDatabaseAdapter,
  type VectorDatabaseAdapter
} from './providers/database-providers.js';