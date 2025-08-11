/**
 * @file Knowledge-storage implementation.
 */
import { EventEmitter } from 'node:events';
export interface FACTStorageConfig {
    backend: 'sqlite' | 'jsonb' | 'file' | 'memory';
    maxMemoryCacheSize: number;
    defaultTTL: number;
    cleanupInterval: number;
    maxEntryAge: number;
    backendConfig?: any;
}
export interface FACTStorageBackend {
    initialize(): Promise<void>;
    store(entry: FACTKnowledgeEntry): Promise<void>;
    get(id: string): Promise<FACTKnowledgeEntry | null>;
    search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
    delete(id: string): Promise<boolean>;
    clear(): Promise<void>;
    cleanup(maxAge: number): Promise<number>;
    getStats(): Promise<{
        persistentEntries?: number;
        oldestEntry?: number;
        newestEntry?: number;
    }>;
    shutdown(): Promise<void>;
}
export interface FACTKnowledgeEntry {
    id: string;
    content: string;
    query: string;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
    ttl: number;
    metadata: {
        type: string;
        domains: string[];
        [key: string]: any;
    };
}
export interface FACTSearchQuery {
    query?: string;
    type?: string;
    domains?: string[];
    limit?: number;
    minScore?: number;
}
export interface FACTStorageStats {
    memoryEntries: number;
    persistentEntries: number;
    totalMemorySize: number;
    cacheHitRate: number;
    oldestEntry: number;
    newestEntry: number;
    topDomains: string[];
    storageHealth: 'excellent' | 'good' | 'fair' | 'poor';
}
/**
 * Independent FACT Storage System with pluggable backends.
 *
 * @example
 */
export declare class FACTStorageSystem extends EventEmitter {
    private config;
    private backend;
    private memoryCache;
    private cleanupTimer?;
    private stats;
    constructor(config?: Partial<FACTStorageConfig>);
    /**
     * Initialize the FACT storage system.
     */
    initialize(): Promise<void>;
    /**
     * Store FACT knowledge entry.
     *
     * @param entry
     */
    storeKnowledge(entry: Omit<FACTKnowledgeEntry, 'id' | 'timestamp' | 'accessCount' | 'lastAccessed'>): Promise<string>;
    /**
     * Retrieve FACT knowledge by ID.
     *
     * @param id
     */
    getKnowledge(id: string): Promise<FACTKnowledgeEntry | null>;
    /**
     * Search FACT knowledge entries.
     *
     * @param query
     */
    searchKnowledge(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
    /**
     * Get comprehensive storage statistics.
     */
    getStorageStats(): Promise<FACTStorageStats>;
    /**
     * Clean up expired entries from both memory and backend.
     */
    cleanup(): Promise<void>;
    /**
     * Clear all storage (memory and backend).
     */
    clearAll(): Promise<void>;
    /**
     * Delete specific knowledge entry.
     *
     * @param id
     */
    deleteKnowledge(id: string): Promise<boolean>;
    /**
     * Private helper methods.
     */
    private createBackend;
    private generateEntryId;
    private storeInMemory;
    private isEntryValid;
    private evictLeastRecentlyUsed;
    private startCleanupTimer;
    /**
     * Shutdown storage system.
     */
    shutdown(): Promise<void>;
}
export default FACTStorageSystem;
//# sourceMappingURL=knowledge-storage.d.ts.map