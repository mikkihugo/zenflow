/**
 * SQLite Backend Implementation for Knowledge Cache.
 *
 * High-performance SQLite-based storage backend for FACT knowledge entries
 * with full-text search and vector similarity capabilities.
 */
/**
 * @file Sqlite-backend implementation.
 */
import type {
  FACTKnowledgeEntry,
  FACTSearchQuery,
  FACTStorageBackend,
  FACTStorageConfig,
  FACTStorageStats,
} from '../types/fact-types';
/**
 * SQLite-based FACT storage backend.
 *
 * Provides persistent storage with full-text search and metadata querying.
 *
 * @example
 */
export declare class SQLiteBackend implements FACTStorageBackend {
  private db;
  private stats;
  private isInitialized;
  private config;
  constructor(): void {
    supportsFullTextSearch: boolean;
    supportsVectorSearch: boolean;
    supportsMetadataSearch: boolean;
    maxEntrySize: number;
    concurrent: boolean;
  };
  private ensureInitialized;
  private updateStats;
  private calculateHitRate;
  private calculateStorageEfficiency;
}
export default SQLiteBackend;
//# sourceMappingURL=sqlite-backend.d.ts.map
