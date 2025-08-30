/**
 * @fileoverview Database Infrastructure Module Exports
 *
 * Direct re-exports from @claude-zen/database package.
 * No facade pattern - direct access to database functionality.
 */

// Re-export database package directly - no facade
export {
  createDatabase,
  createKeyValueStorage,
  createDatabaseAccess,
  DatabaseProvider,
  DatabaseEventCoordinator,
  SQLiteAdapter,
} from '@claude-zen/database';

// Also re-export types for consumers through foundation layer
export type {
  DatabaseConfig,
  DatabaseConnection,
  // Provide legacy-friendly aliases expected by foundation consumers
  KeyValueStorage as KeyValueStore,
  VectorStorage as VectorStore,
  GraphStorage as GraphStore,
} from '@claude-zen/database';
