/**
 * SQLite Backend Implementation for Knowledge Cache.
 *
 * High-performance SQLite-based storage backend for FACT knowledge entries
 * with full-text search and vector similarity capabilities.
 */
/**
 * @file Sqlite-backend implementation.
 */
import type { FACTKnowledgeEntry, FACTSearchQuery, FACTStorageBackend, FACTStorageConfig, FACTStorageStats } from '../types/fact-types.ts';
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
    constructor(config: FACTStorageConfig);
    /**
     * Initialize SQLite database and create required tables.
     */
    initialize(): Promise<void>;
    /**
     * Store a knowledge entry in SQLite database.
     *
     * @param entry
     */
    store(entry: FACTKnowledgeEntry): Promise<void>;
    /**
     * Retrieve a knowledge entry by ID.
     *
     * @param id
     */
    get(id: string): Promise<FACTKnowledgeEntry | null>;
    /**
     * Search knowledge entries with various criteria.
     *
     * @param _query
     */
    search(_query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
    /**
     * Delete a knowledge entry by ID.
     *
     * @param id
     */
    delete(id: string): Promise<boolean>;
    /**
     * Get storage statistics.
     */
    getStats(): Promise<Partial<FACTStorageStats>>;
    /**
     * Clean up old entries beyond maxAge.
     */
    cleanup(maxAge: number): Promise<number>;
    /**
     * Clear all knowledge entries.
     */
    clear(): Promise<void>;
    /**
     * Close database connection.
     */
    shutdown(): Promise<void>;
    /**
     * Get backend capabilities.
     */
    getCapabilities(): {
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