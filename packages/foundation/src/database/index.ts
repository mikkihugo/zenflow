/**
 * @fileoverview Database System - Internal multi-database abstraction (integrated into foundation)
 * 
 * Previously @claude-zen/database package, now integrated directly into @claude-zen/foundation
 * for better architecture and to eliminate circular dependencies.
 */

// Re-export from main database entry point
export * from './main';
export * from './types';
export * from './interfaces';

// Specific adapter exports
export { SQLiteAdapter } from './adapters/sqlite-adapter';
export { LanceDBAdapter } from './adapters/lancedb-adapter';
export { KuzuAdapter } from './adapters/kuzu-adapter';

// DAO exports
export { RelationalDAO } from './dao/relational.dao';
export { VectorDAO } from './dao/vector.dao';
export { GraphDAO } from './dao/graph.dao';

// Factory functions
export { createDatabaseAdapter, DatabaseFactory } from './factory';

// Core functionality
export { DatabaseAdapter } from './core/index';