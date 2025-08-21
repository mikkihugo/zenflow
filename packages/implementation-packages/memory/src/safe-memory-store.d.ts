/**
 * @file Memory management: safe-memory-store
 */
/**
 * Enhanced Memory Provider with Union Type Safety.
 *
 * Provides type-safe memory operations using discriminated unions.
 * for proper error handling and result discrimination.
 */
import { EventEmitter } from 'eventemitter3';
import { type MemoryResult } from '../utils/type-guards';
export interface SafeMemoryStoreOptions {
    namespace?: string;
    enableTTL?: boolean;
    defaultTTL?: number;
    maxSize?: number;
    enableCompression?: boolean;
}
export interface MemoryMetadata {
    created: Date;
    updated: Date;
    accessed: Date;
    accessCount: number;
    size: number;
    ttl?: number;
    tags?: string[];
    compressed?: boolean;
}
/**
 * Type-safe memory store with union type results.
 *
 * @example
 */
export declare class SafeMemoryStore extends EventEmitter {
    private store;
    private metadata;
    private ttlTimers;
    private options;
    private initialized;
    constructor(options?: SafeMemoryStoreOptions);
    initialize(): Promise<void>;
    /**
     * Store data with type-safe error handling.
     *
     * @param key
     * @param data
     * @param ttl
     */
    storeData<T>(key: string, data: T, ttl?: number): Promise<MemoryResult<void>>;
    /**
     * Retrieve data with type-safe result discrimination.
     *
     * @param key
     */
    retrieve<T>(key: string): Promise<MemoryResult<T>>;
    /**
     * Delete data with type-safe result.
     *
     * @param key
     */
    delete(key: string): Promise<MemoryResult<boolean>>;
    /**
     * Check if key exists with type-safe result.
     *
     * @param key
     */
    exists(key: string): Promise<MemoryResult<boolean>>;
    /**
     * Get store statistics.
     */
    getStats(): Promise<MemoryResult<{
        entries: number;
        totalSize: number;
        averageSize: number;
        oldestEntry: Date | null;
        newestEntry: Date | null;
    }>>;
    /**
     * Clear all data.
     */
    clear(): Promise<void>;
    /**
     * Shutdown the store gracefully.
     */
    shutdown(): Promise<void>;
    private createKey;
    private createMemoryError;
    private calculateSize;
    private setTTL;
    private startCleanupInterval;
    private cleanupExpiredEntries;
}
/**
 * Example function showing safe property access patterns.
 */
export declare function safeMemoryUsageExample(): Promise<void>;
//# sourceMappingURL=safe-memory-store.d.ts.map