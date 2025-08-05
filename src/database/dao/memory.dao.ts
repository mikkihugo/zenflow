/**
 * Memory Repository Implementation
 * 
 * In-memory repository with TTL support, caching capabilities,
 * and memory management for fast data access.
 */

import { BaseRepository } from '../base-repository';
import type {
  IMemoryRepository,
  MemoryStats,
  CustomQuery
} from '../interfaces';
import type { DatabaseAdapter, ILogger } from '../../../core/interfaces/base-interfaces';

/**
 * In-memory cache entry
 */
interface CacheEntry<T> {
  value: T;
  createdAt: Date;
  accessedAt: Date;
  ttl?: number;
  expiresAt?: Date;
}

/**
 * Memory repository implementation with caching and TTL support
 * @template T The entity type this repository manages
 */
export class MemoryDao<T> extends BaseDao<T> implements IMemoryDao<T> {
  private memoryStore = new Map<string, CacheEntry<T>>();
  private keyStore = new Map<string, CacheEntry<any>>();
  private ttlTimers = new Map<string, NodeJS.Timeout>();
  private accessCount = 0;
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;

  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly cleanupInterval: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    adapter: DatabaseAdapter,
    logger: ILogger,
    tableName: string,
    entitySchema?: Record<string, any>,
    options?: {
      maxSize?: number;
      ttlDefault?: number;
      cleanupInterval?: number;
    }
  ) {
    super(adapter, logger, tableName, entitySchema);

    this.maxSize = options?.maxSize || 1000;
    this.defaultTTL = options?.ttlDefault || 3600; // 1 hour
    this.cleanupInterval = options?.cleanupInterval || 60000; // 1 minute

    this.startCleanupTimer();
  }

  /**
   * Set TTL (time to live) for an entity
   */
  async setTTL(id: string | number, ttlSeconds: number): Promise<void> {
    this.logger.debug(`Setting TTL for entity ${id}: ${ttlSeconds} seconds`);

    const key = this.getEntityKey(id);
    const entry = this.memoryStore.get(key);

    if (!entry) {
      throw new Error(`Entity with ID ${id} not found in memory`);
    }

    const oldTimer = this.ttlTimers.get(key);
    if (oldTimer) {
      clearTimeout(oldTimer);
    }

    entry.ttl = ttlSeconds;
    entry.expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.expireEntity(key);
    }, ttlSeconds * 1000);

    this.ttlTimers.set(key, timer);
    this.logger.debug(`TTL set for entity ${id}, expires at: ${entry.expiresAt}`);
  }

  /**
   * Get TTL for an entity
   */
  async getTTL(id: string | number): Promise<number | null> {
    const key = this.getEntityKey(id);
    const entry = this.memoryStore.get(key);

    if (!entry || !entry.expiresAt) {
      return null;
    }

    const remainingMs = entry.expiresAt.getTime() - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  }

  /**
   * Cache entity with optional TTL
   */
  async cache(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.logger.debug(`Caching value with key: ${key}`, { ttlSeconds });

    // Check if we need to evict entries to make space
    await this.ensureSpace();

    const entry: CacheEntry<T> = {
      value,
      createdAt: new Date(),
      accessedAt: new Date(),
      ttl: ttlSeconds,
      expiresAt: ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : undefined
    };

    this.keyStore.set(key, entry);

    // Set expiration timer if TTL is specified
    if (ttlSeconds) {
      const timer = setTimeout(() => {
        this.expireKey(key);
      }, ttlSeconds * 1000);

      this.ttlTimers.set(key, timer);
    }

    this.logger.debug(`Cached value with key: ${key}`);
  }

  /**
   * Get cached entity
   */
  async getCached(key: string): Promise<T | null> {
    this.accessCount++;
    
    const entry = this.keyStore.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if entry has expired
    if (entry.expiresAt && entry.expiresAt <= new Date()) {
      this.expireKey(key);
      this.missCount++;
      return null;
    }

    // Update access time
    entry.accessedAt = new Date();
    this.hitCount++;

    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.value;
  }

  /**
   * Clear cache
   */
  async clearCache(pattern?: string): Promise<number> {
    let clearedCount = 0;

    if (!pattern) {
      // Clear all cache entries
      clearedCount = this.keyStore.size;
      this.keyStore.clear();
      
      // Clear all TTL timers
      for (const timer of this.ttlTimers.values()) {
        clearTimeout(timer);
      }
      this.ttlTimers.clear();
      
      this.logger.debug(`Cleared entire cache: ${clearedCount} entries`);
    } else {
      // Clear entries matching pattern
      const regex = new RegExp(pattern);
      const keysToDelete: string[] = [];

      for (const key of this.keyStore.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.keyStore.delete(key);
        const timer = this.ttlTimers.get(key);
        if (timer) {
          clearTimeout(timer);
          this.ttlTimers.delete(key);
        }
        clearedCount++;
      }

      this.logger.debug(`Cleared cache with pattern '${pattern}': ${clearedCount} entries`);
    }

    return clearedCount;
  }

  /**
   * Get memory usage statistics
   */
  async getMemoryStats(): Promise<MemoryStats> {
    const totalEntries = this.memoryStore.size + this.keyStore.size;
    const estimatedMemoryUsage = this.estimateMemoryUsage();
    
    return {
      totalMemory: estimatedMemoryUsage,
      usedMemory: estimatedMemoryUsage,
      freeMemory: Math.max(0, this.maxSize - totalEntries) * 1024, // Rough estimate
      hitRate: this.accessCount > 0 ? (this.hitCount / this.accessCount) * 100 : 0,
      missRate: this.accessCount > 0 ? (this.missCount / this.accessCount) * 100 : 0,
      evictions: this.evictionCount
    };
  }

  /**
   * Override base repository methods for memory-specific implementations
   */

  async findById(id: string | number): Promise<T | null> {
    this.accessCount++;
    
    const key = this.getEntityKey(id);
    const entry = this.memoryStore.get(key);

    if (!entry) {
      this.missCount++;
      // Fallback to adapter if not in memory
      const result = await super.findById(id);
      if (result) {
        await this.storeInMemory(id, result);
      }
      return result;
    }

    // Check if entry has expired
    if (entry.expiresAt && entry.expiresAt <= new Date()) {
      this.expireEntity(key);
      this.missCount++;
      // Fallback to adapter
      const result = await super.findById(id);
      if (result) {
        await this.storeInMemory(id, result);
      }
      return result;
    }

    // Update access time
    entry.accessedAt = new Date();
    this.hitCount++;

    this.logger.debug(`Memory hit for entity: ${id}`);
    return entry.value;
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    // Create in underlying storage first
    const created = await super.create(entity);
    
    // Store in memory with default TTL
    await this.storeInMemory((created as any).id, created, this.defaultTTL);
    
    return created;
  }

  async update(id: string | number, updates: Partial<T>): Promise<T> {
    // Update in underlying storage first
    const updated = await super.update(id, updates);
    
    // Update memory cache
    await this.storeInMemory(id, updated, this.defaultTTL);
    
    return updated;
  }

  async delete(id: string | number): Promise<boolean> {
    // Delete from underlying storage first
    const deleted = await super.delete(id);
    
    if (deleted) {
      // Remove from memory
      const key = this.getEntityKey(id);
      this.memoryStore.delete(key);
      
      const timer = this.ttlTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.ttlTimers.delete(key);
      }
    }
    
    return deleted;
  }

  protected mapRowToEntity(row: any): T {
    return row as T;
  }

  protected mapEntityToRow(entity: Partial<T>): Record<string, any> {
    return entity as Record<string, any>;
  }

  /**
   * Execute custom query - override to handle memory-specific queries
   */
  async executeCustomQuery<R = any>(customQuery: CustomQuery): Promise<R> {
    if (customQuery.type === 'memory') {
      const query = customQuery.query as any;
      
      if (query.operation === 'get_stats') {
        const stats = await this.getMemoryStats();
        return stats as R;
      }
      
      if (query.operation === 'clear_cache') {
        const cleared = await this.clearCache(query.pattern);
        return { cleared } as R;
      }
      
      if (query.operation === 'set_ttl') {
        await this.setTTL(query.id, query.ttl);
        return { success: true } as R;
      }
    }

    return super.executeCustomQuery<R>(customQuery);
  }

  /**
   * Private helper methods
   */

  private getEntityKey(id: string | number): string {
    return `entity:${this.tableName}:${id}`;
  }

  private async storeInMemory(id: string | number, entity: T, ttlSeconds?: number): Promise<void> {
    await this.ensureSpace();

    const key = this.getEntityKey(id);
    const ttl = ttlSeconds || this.defaultTTL;
    
    const entry: CacheEntry<T> = {
      value: entity,
      createdAt: new Date(),
      accessedAt: new Date(),
      ttl,
      expiresAt: new Date(Date.now() + ttl * 1000)
    };

    this.memoryStore.set(key, entry);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.expireEntity(key);
    }, ttl * 1000);

    this.ttlTimers.set(key, timer);
  }

  private async ensureSpace(): Promise<void> {
    const totalEntries = this.memoryStore.size + this.keyStore.size;
    
    if (totalEntries >= this.maxSize) {
      // Evict least recently used entries
      await this.evictLRU();
    }
  }

  private async evictLRU(): Promise<void> {
    const allEntries: Array<{ key: string; entry: CacheEntry<any>; store: 'memory' | 'key' }> = [];

    // Collect all entries with their access times
    for (const [key, entry] of this.memoryStore.entries()) {
      allEntries.push({ key, entry, store: 'memory' });
    }

    for (const [key, entry] of this.keyStore.entries()) {
      allEntries.push({ key, entry, store: 'key' });
    }

    // Sort by access time (oldest first)
    allEntries.sort((a, b) => a.entry.accessedAt.getTime() - b.entry.accessedAt.getTime());

    // Evict 25% of entries
    const evictCount = Math.ceil(allEntries.length * 0.25);

    for (let i = 0; i < evictCount && i < allEntries.length; i++) {
      const { key, store } = allEntries[i];
      
      if (store === 'memory') {
        this.memoryStore.delete(key);
      } else {
        this.keyStore.delete(key);
      }

      const timer = this.ttlTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.ttlTimers.delete(key);
      }

      this.evictionCount++;
    }

    this.logger.debug(`Evicted ${evictCount} LRU entries`);
  }

  private expireEntity(key: string): void {
    this.memoryStore.delete(key);
    const timer = this.ttlTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.ttlTimers.delete(key);
    }
    this.logger.debug(`Expired entity: ${key}`);
  }

  private expireKey(key: string): void {
    this.keyStore.delete(key);
    const timer = this.ttlTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.ttlTimers.delete(key);
    }
    this.logger.debug(`Expired cache key: ${key}`);
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
  }

  private performCleanup(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    // Check memory store for expired entries
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        expiredKeys.push(key);
      }
    }

    // Check key store for expired entries
    for (const [key, entry] of this.keyStore.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    for (const key of expiredKeys) {
      this.memoryStore.delete(key);
      this.keyStore.delete(key);
      
      const timer = this.ttlTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.ttlTimers.delete(key);
      }
    }

    if (expiredKeys.length > 0) {
      this.logger.debug(`Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let totalSize = 0;

    for (const entry of this.memoryStore.values()) {
      totalSize += JSON.stringify(entry.value).length * 2; // UTF-16 encoding
      totalSize += 200; // Overhead for dates and metadata
    }

    for (const entry of this.keyStore.values()) {
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 200;
    }

    return totalSize;
  }

  /**
   * Cleanup method to be called on shutdown
   */
  async shutdown(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Clear all TTL timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }

    this.memoryStore.clear();
    this.keyStore.clear();
    this.ttlTimers.clear();

    this.logger.debug('Memory repository shutdown completed');
  }
}