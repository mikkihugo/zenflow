/**
 * FACT Storage Interface.
 *
 * Backend-agnostic storage interface for FACT external knowledge system.
 * Allows pluggable storage backends (SQLite, JSONB, File-based, etc.).
 */
/**
 * @file Storage-interface implementation.
 */
export interface FACTKnowledgeEntry {
    id: string;
    query: string;
    response: string;
    metadata: {
        source: string;
        agentId?: string;
        specialization?: string;
        domains: string[];
        type: string;
        confidence: number;
        toolsUsed: string[];
        executionTime: number;
        cacheHit: boolean;
        externalSources: string[];
    };
    timestamp: number;
    ttl: number;
    accessCount: number;
    lastAccessed: number;
}
export interface FACTSearchQuery {
    query?: string;
    domains?: string[];
    type?: string;
    source?: string;
    maxAge?: number;
    minConfidence?: number;
    limit?: number;
    timeout?: number;
    sortBy?: 'relevance' | 'timestamp' | 'access_count';
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
 * Backend-agnostic FACT storage interface.
 *
 * @example
 */
export interface FACTStorageBackend {
    /**
     * Initialize the storage backend.
     */
    initialize(): Promise<void>;
    /**
     * Store a knowledge entry.
     */
    store(entry: FACTKnowledgeEntry): Promise<void>;
    /**
     * Retrieve a knowledge entry by ID.
     */
    get(id: string): Promise<FACTKnowledgeEntry | null>;
    /**
     * Search knowledge entries.
     */
    search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
    /**
     * Delete a knowledge entry.
     */
    delete(id: string): Promise<boolean>;
    /**
     * Clean up expired entries.
     */
    cleanup(maxAge: number): Promise<number>;
    /**
     * Get storage statistics.
     */
    getStats(): Promise<Partial<FACTStorageStats>>;
    /**
     * Clear all storage.
     */
    clear(): Promise<void>;
    /**
     * Shutdown the storage backend.
     */
    shutdown(): Promise<void>;
    /**
     * Clear entries by quality threshold.
     */
    clearByQuality(minQuality: number): Promise<number>;
    /**
     * Clear entries older than specified age.
     */
    clearByAge(maxAgeMs: number): Promise<number>;
    /**
     * Clear memory cache only.
     */
    clearMemoryCache(): Promise<number>;
    /**
     * Clear all entries.
     */
    clearAll(): Promise<number>;
    /**
     * Optimize storage performance.
     */
    optimize(strategy?: 'aggressive' | 'balanced' | 'conservative'): Promise<{
        optimized: boolean;
        details: string;
    }>;
    /**
     * Get storage statistics.
     */
    getStorageStats(): Promise<FACTStorageStats>;
}
/**
 * FACT storage configuration.
 *
 * @example
 */
export interface FACTStorageConfig {
    backend: 'sqlite' | 'jsonb' | 'file' | 'memory';
    backendConfig?: any;
    maxMemoryCacheSize: number;
    defaultTTL: number;
    cleanupInterval: number;
    maxEntryAge: number;
}
//# sourceMappingURL=storage-interface.d.ts.map