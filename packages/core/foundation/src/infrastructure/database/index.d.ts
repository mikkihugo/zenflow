/**
 * @fileoverview Database Infrastructure Module Exports
 *
 * Direct re-exports from @claude-zen/database package.
 * No facade pattern - direct access to database functionality.
 */
export { createDatabase, createKeyValueStorage, createDatabaseAccess, DatabaseProvider, DatabaseEventCoordinator, SQLiteAdapter, } from '@claude-zen/database';
export type { DatabaseConfig, DatabaseConnection, KeyValueStorage as KeyValueStore, VectorStorage as VectorStore, GraphStorage as GraphStore, } from '@claude-zen/database';
//# sourceMappingURL=index.d.ts.map