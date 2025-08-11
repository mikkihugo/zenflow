/**
 * Memory Repository Implementation.
 *
 * In-memory repository with TTL support, caching capabilities,
 * and memory management for fast data access.
 */
/**
 * @file Database layer: memory.dao.
 */
import { BaseDao } from '../base.dao.ts';
import type { DatabaseAdapter, ILogger } from '../core/interfaces/base-interfaces';
import type { CustomQuery, IMemoryRepository, MemoryStats } from '../interfaces.ts';
/**
 * Memory repository implementation with caching and TTL support.
 *
 * @template T The entity type this repository manages.
 * @example
 */
export declare class MemoryDao<T> extends BaseDao<T> implements IMemoryRepository<T> {
    private memoryStore;
    private keyStore;
    private ttlTimers;
    private accessCount;
    private hitCount;
    private missCount;
    private evictionCount;
    private readonly maxSize;
    private readonly defaultTTL;
    private readonly cleanupInterval;
    private cleanupTimer?;
    constructor(adapter: DatabaseAdapter, logger: ILogger, tableName: string, entitySchema?: Record<string, any>, options?: {
        maxSize?: number;
        ttlDefault?: number;
        cleanupInterval?: number;
    });
    /**
     * Set TTL (time to live) for an entity.
     *
     * @param id
     * @param ttlSeconds
     */
    setTTL(id: string | number, ttlSeconds: number): Promise<void>;
    /**
     * Get TTL for an entity.
     *
     * @param id
     */
    getTTL(id: string | number): Promise<number | null>;
    /**
     * Cache entity with optional TTL.
     *
     * @param key
     * @param value
     * @param ttlSeconds
     */
    cache(key: string, value: T, ttlSeconds?: number): Promise<void>;
    /**
     * Get cached entity.
     *
     * @param key
     */
    getCached(key: string): Promise<T | null>;
    /**
     * Clear cache.
     *
     * @param pattern
     */
    clearCache(pattern?: string): Promise<number>;
    /**
     * Get memory usage statistics.
     */
    getMemoryStats(): Promise<MemoryStats>;
    /**
     * Override base repository methods for memory-specific implementations.
     */
    findById(id: string | number): Promise<T | null>;
    create(entity: Omit<T, 'id'>): Promise<T>;
    update(id: string | number, updates: Partial<T>): Promise<T>;
    delete(id: string | number): Promise<boolean>;
    protected mapRowToEntity(row: any): T;
    protected mapEntityToRow(entity: Partial<T>): Record<string, any>;
    /**
     * Execute custom query - override to handle memory-specific queries.
     *
     * @param customQuery
     */
    executeCustomQuery<R = any>(customQuery: CustomQuery): Promise<R>;
    /**
     * Private helper methods.
     */
    private getEntityKey;
    private storeInMemory;
    private ensureSpace;
    private evictLRU;
    private expireEntity;
    private expireKey;
    private startCleanupTimer;
    private performCleanup;
    private estimateMemoryUsage;
    /**
     * Cleanup method to be called on shutdown.
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=memory.dao.d.ts.map