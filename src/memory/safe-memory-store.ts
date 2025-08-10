/**
 * @file Memory management: safe-memory-store
 */

import { getLogger } from '../core/logger';

const logger = getLogger('src-memory-safe-memory-store');

/**
 * Enhanced Memory Provider with Union Type Safety.
 *
 * Provides type-safe memory operations using discriminated unions.
 * for proper error handling and result discrimination.
 */

import { EventEmitter } from 'node:events';
import {
  isMemoryError,
  isMemoryNotFound,
  isMemorySuccess,
  type MemoryError,
  type MemoryNotFound,
  type MemoryResult,
  type MemorySuccess,
} from '../utils/type-guards';

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
export class SafeMemoryStore extends EventEmitter {
  private store = new Map<string, unknown>();
  private metadata = new Map<string, MemoryMetadata>();
  private ttlTimers = new Map<string, NodeJS.Timeout>();
  private options: Required<SafeMemoryStoreOptions>;
  private initialized = false;

  constructor(options: SafeMemoryStoreOptions = {}) {
    super();

    this.options = {
      namespace: options?.namespace ?? 'default',
      enableTTL: options?.enableTTL ?? true,
      defaultTTL: options?.defaultTTL ?? 3600000, // 1 hour
      maxSize: options?.maxSize ?? 10000,
      enableCompression: options?.enableCompression ?? false,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize any required resources
      this.startCleanupInterval();
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      throw new Error(`Failed to initialize SafeMemoryStore: ${errorMessage}`);
    }
  }

  /**
   * Store data with type-safe error handling.
   *
   * @param key
   * @param data
   * @param ttl
   */
  async storeData<T>(key: string, data: T, ttl?: number): Promise<MemoryResult<void>> {
    try {
      if (!this.initialized) {
        return this.createMemoryError(key, 'STORE_NOT_INITIALIZED', 'Memory store not initialized');
      }

      if (this.store.size >= this.options.maxSize) {
        return this.createMemoryError(
          key,
          'STORE_FULL',
          'Memory store has reached maximum capacity'
        );
      }

      const fullKey = this.createKey(key);
      const now = new Date();

      // Store the data
      this.store.set(fullKey, data);

      // Create or update metadata
      const existingMetadata = this.metadata.get(fullKey);
      const newMetadata: MemoryMetadata = {
        created: existingMetadata?.created ?? now,
        updated: now,
        accessed: now,
        accessCount: (existingMetadata?.accessCount ?? 0) + 1,
        size: this.calculateSize(data),
        ttl: ttl ?? this.options.defaultTTL,
        tags: existingMetadata?.tags,
        compressed: this.options.enableCompression,
      };

      this.metadata.set(fullKey, newMetadata);

      // Set up TTL if enabled
      if (this.options.enableTTL && newMetadata?.ttl) {
        this.setTTL(fullKey, newMetadata?.ttl);
      }

      this.emit('stored', { key: fullKey, size: newMetadata.size });

      return {
        found: true,
        data: undefined as undefined,
        key: fullKey,
        timestamp: now,
        ttl: newMetadata?.ttl,
        metadata: { operation: 'store', success: true },
      } as MemorySuccess<void>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      return this.createMemoryError(key, 'STORE_FAILED', errorMessage);
    }
  }

  /**
   * Retrieve data with type-safe result discrimination.
   *
   * @param key
   */
  async retrieve<T>(key: string): Promise<MemoryResult<T>> {
    try {
      if (!this.initialized) {
        return this.createMemoryError(key, 'STORE_NOT_INITIALIZED', 'Memory store not initialized');
      }

      const fullKey = this.createKey(key);

      if (!this.store.has(fullKey)) {
        return {
          found: false,
          key: fullKey,
          reason: 'not_found',
        } as MemoryNotFound;
      }

      const data = this.store.get(fullKey) as T;
      const metadata = this.metadata.get(fullKey);

      if (!metadata) {
        return this.createMemoryError(key, 'METADATA_MISSING', 'Metadata not found for key');
      }

      // Update access information
      const now = new Date();
      metadata.accessed = now;
      metadata?.accessCount++;
      this.metadata.set(fullKey, metadata);

      this.emit('accessed', { key: fullKey, accessCount: metadata?.accessCount });

      return {
        found: true,
        data,
        key: fullKey,
        timestamp: metadata?.updated,
        ttl: metadata?.ttl,
        metadata: {
          created: metadata?.created,
          accessed: metadata?.accessed,
          accessCount: metadata?.accessCount,
          size: metadata.size,
        },
      } as MemorySuccess<T>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown retrieval error';
      return this.createMemoryError(key, 'RETRIEVE_FAILED', errorMessage);
    }
  }

  /**
   * Delete data with type-safe result.
   *
   * @param key
   */
  async delete(key: string): Promise<MemoryResult<boolean>> {
    try {
      if (!this.initialized) {
        return this.createMemoryError(key, 'STORE_NOT_INITIALIZED', 'Memory store not initialized');
      }

      const fullKey = this.createKey(key);

      if (!this.store.has(fullKey)) {
        return {
          found: false,
          key: fullKey,
          reason: 'not_found',
        } as MemoryNotFound;
      }

      // Clear TTL timer if exists
      const timer = this.ttlTimers.get(fullKey);
      if (timer) {
        clearTimeout(timer);
        this.ttlTimers.delete(fullKey);
      }

      // Remove data and metadata
      const deleted = this.store.delete(fullKey);
      this.metadata.delete(fullKey);

      this.emit('deleted', { key: fullKey });

      return {
        found: true,
        data: deleted,
        key: fullKey,
        timestamp: new Date(),
        metadata: { operation: 'delete', success: true },
      } as MemorySuccess<boolean>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown deletion error';
      return this.createMemoryError(key, 'DELETE_FAILED', errorMessage);
    }
  }

  /**
   * Check if key exists with type-safe result.
   *
   * @param key
   */
  async exists(key: string): Promise<MemoryResult<boolean>> {
    try {
      const fullKey = this.createKey(key);
      const exists = this.store.has(fullKey);

      if (exists) {
        return {
          found: true,
          data: true,
          key: fullKey,
          timestamp: new Date(),
          metadata: { operation: 'exists', result: true },
        } as MemorySuccess<boolean>;
      } else {
        return {
          found: false,
          key: fullKey,
          reason: 'not_found',
        } as MemoryNotFound;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown existence check error';
      return this.createMemoryError(key, 'EXISTS_CHECK_FAILED', errorMessage);
    }
  }

  /**
   * Get store statistics.
   */
  async getStats(): Promise<
    MemoryResult<{
      entries: number;
      totalSize: number;
      averageSize: number;
      oldestEntry: Date | null;
      newestEntry: Date | null;
    }>
  > {
    try {
      const entries = this.store.size;
      let totalSize = 0;
      let oldestEntry: Date | null = null;
      let newestEntry: Date | null = null;

      for (const metadata of this.metadata.values()) {
        totalSize += metadata.size;

        if (!oldestEntry || metadata?.created < oldestEntry) {
          oldestEntry = metadata?.created;
        }

        if (!newestEntry || metadata?.created > newestEntry) {
          newestEntry = metadata?.created;
        }
      }

      const stats = {
        entries,
        totalSize,
        averageSize: entries > 0 ? totalSize / entries : 0,
        oldestEntry,
        newestEntry,
      };

      return {
        found: true,
        data: stats,
        key: 'stats',
        timestamp: new Date(),
        metadata: { operation: 'stats' },
      } as MemorySuccess<typeof stats>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown stats error';
      return this.createMemoryError('stats', 'STATS_FAILED', errorMessage);
    }
  }

  /**
   * Clear all data.
   */
  async clear(): Promise<void> {
    // Clear all TTL timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }

    this.store.clear();
    this.metadata.clear();
    this.ttlTimers.clear();

    this.emit('cleared');
  }

  /**
   * Shutdown the store gracefully.
   */
  async shutdown(): Promise<void> {
    await this.clear();
    this.initialized = false;
    this.emit('shutdown');
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private createKey(key: string): string {
    return `${this.options.namespace}:${key}`;
  }

  private createMemoryError(key: string, code: string, message: string): MemoryError {
    return {
      found: false,
      error: {
        code,
        message,
        key: this.createKey(key),
      },
    };
  }

  private calculateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private setTTL(key: string, ttl: number): void {
    // Clear existing timer
    const existingTimer = this.ttlTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.store.delete(key);
      this.metadata.delete(key);
      this.ttlTimers.delete(key);
      this.emit('expired', { key });
    }, ttl);

    this.ttlTimers.set(key, timer);
  }

  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 300000);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();

    for (const [key, metadata] of this.metadata.entries()) {
      if (metadata?.ttl && metadata?.updated?.getTime() + metadata?.ttl < now) {
        this.store.delete(key);
        this.metadata.delete(key);

        const timer = this.ttlTimers.get(key);
        if (timer) {
          clearTimeout(timer);
          this.ttlTimers.delete(key);
        }

        this.emit('expired', { key });
      }
    }
  }
}

// ============================================
// Usage Examples for Safe Property Access
// ============================================

/**
 * Example function showing safe property access patterns.
 */
export async function safeMemoryUsageExample(): Promise<void> {
  const store = new SafeMemoryStore({ namespace: 'example' });
  await store.initialize();

  // Store some data
  const storeResult = await store.storeData('user:123', { name: 'Alice', age: 30 });

  // Safe property access using type guards
  if (isMemorySuccess(storeResult)) {
  } else if (isMemoryError(storeResult)) {
    logger.error('❌ Storage failed:', storeResult?.error?.message);
  }

  // Retrieve data with safe access
  const retrieveResult = await store.retrieve<{ name: string; age: number }>('user:123');

  if (isMemorySuccess(retrieveResult)) {
  } else if (isMemoryNotFound(retrieveResult)) {
  } else if (isMemoryError(retrieveResult)) {
    logger.error('Error retrieving user:', retrieveResult?.error?.message);
  }

  // Check existence safely
  const existsResult = await store.exists('user:456');

  if (isMemorySuccess(existsResult)) {
  } else if (isMemoryNotFound(existsResult)) {
  }

  await store.shutdown();
}
