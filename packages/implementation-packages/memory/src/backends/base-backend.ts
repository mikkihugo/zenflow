/**
 * Base Backend Abstract Class for Memory Storage.
 *
 * Abstract base class defining the interface for all memory storage backends.
 * Supports multiple backend types: sqlite, jsonb, file, memory.
 */
/**
 * @file Memory management: base-backend.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type { MemoryConfig } from '../types';
import type { JSONValue } from '../core/memory-system';

// Define BackendCapabilities here to avoid circular dependency
export interface BackendCapabilities {
  persistent: boolean;
  searchable: boolean;
  transactional: boolean;
  vectorized: boolean;
  distributed: boolean;
  concurrent: boolean;
  compression: boolean;
  encryption: boolean;
}

// Additional types needed for base backend
export interface MemoryEntry {
  key: string;
  value: unknown;
  metadata: Record<string, unknown>;
  timestamp: number;
  size: number;
  type: string;
}

export interface MemoryQueryOptions {
  pattern?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc''' | '''desc';
}

export interface MemorySearchResult {
  key: string;
  value: unknown;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryStats {
  totalEntries: number;
  totalSize: number;
  cacheHits: number;
  cacheMisses: number;
  lastAccessed: number;
  created: number;
  modified: number;
}

export abstract class BaseMemoryBackend extends TypedEventBase {
  protected memoryConfig: MemoryConfig;
  protected isInitialized: boolean = false;
  protected stats: MemoryStats;

  constructor(config: MemoryConfig) {
    super();
    this.memoryConfig = config;
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastAccessed: 0,
      created: Date.now(),
      modified: Date.now(),
    };
  }

  // Abstract methods that must be implemented by concrete backends
  abstract initialize(): Promise<void>;
  abstract store(
    key: string,
    value: unknown,
    namespace?: string
  ): Promise<void>;
  abstract retrieve<T = unknown>(key: string): Promise<T'' | ''null>;
  abstract delete(key: string): Promise<boolean>;
  abstract list(pattern?: string): Promise<string[]>;
  abstract clear(): Promise<void>;
  abstract close(): Promise<void>;
  abstract getCapabilities(): BackendCapabilities;

  // Additional methods for BackendInterface compatibility
  abstract get<T = unknown>(key: string): Promise<T'' | ''null>;
  abstract set(key: string, value: unknown): Promise<void>;
  abstract listNamespaces(): Promise<string[]>;

  // Common utility methods available to all backends
  protected async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
      this.isInitialized = true;
      this.emit('initialized', { timestamp: new Date() });
    }
  }

  public async getStats(): Promise<MemoryStats> {
    return { ...this.stats };
  }

  // Synchronous version for compatibility
  public getStatsSync(): MemoryStats {
    return { ...this.stats };
  }

  public getConfig(): MemoryConfig {
    return { ...this.memoryConfig };
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  // Protected utility methods for subclasses
  protected updateStats(
    operation: 'read | write' | 'delete',
    size?: number
  ): void {
    this.stats.lastAccessed = Date.now();
    this.stats.modified = Date.now();

    if (operation === 'write') {
      this.stats.totalEntries++;
      if (size) {
        this.stats.totalSize += size;
      }
    } else if (operation === 'delete') {
      this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
      if (size) {
        this.stats.totalSize = Math.max(0, this.stats.totalSize - size);
      }
    } else if (operation === 'read') {
      this.stats.cacheHits++;
    }
  }

  protected createMemoryEntry(
    key: string,
    value: unknown,
    metadata?: Record<string, unknown>
  ): MemoryEntry {
    return {
      key,
      value,
      metadata: metadata'' | '''' | ''{},
      timestamp: Date.now(),
      size: this.calculateSize(value),
      type: this.detectType(value),
    };
  }

  protected calculateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  protected detectType(value: unknown): string {
    if (value === null) return'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (value instanceof Buffer) return 'buffer';
    return typeof value;
  }

  protected validateKey(key: string): void {
    if (!key'' | '''' | ''typeof key !=='string') {
      throw new Error('Key must be a non-empty string');
    }
    if (key.length > 255) {
      throw new Error('Key cannot exceed 255 characters');
    }
  }

  protected matchesPattern(key: string, pattern?: string): boolean {
    if (!pattern) return true;

    // Simple glob pattern matching
    const regex = new RegExp(
      pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
        .replace(/\[([^\]]*)\]/g, '[$1]')
    );

    return regex.test(key);
  }

  protected emitError(error: Error, operation: string): void {
    this.emit('error', {
      error,
      operation,
      timestamp: Date.now(),
      backend: this.constructor.name,
    });
  }

  protected emitOperation(
    operation: string,
    key: string,
    success: boolean
  ): void {
    this.emit('operation', {
      operation,
      key,
      success,
      timestamp: Date.now(),
      backend: this.constructor.name,
    });
  }

  // Health check method
  public async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    capabilities: BackendCapabilities;
    stats: MemoryStats;
  }> {
    const start = Date.now();
    let healthy = false;

    try {
      await this.ensureInitialized();
      // Test basic operations
      const testKey = `__health_check_${Date.now()}`;
      await this.store(testKey, { test: true });
      const retrieved = await this.retrieve(testKey);
      await this.delete(testKey);

      healthy = retrieved !== null && (retrieved as any)?.test === true;
    } catch (error) {
      healthy = false;
      this.emitError(error as Error, 'healthCheck');
    }

    return {
      healthy,
      latency: Date.now() - start,
      capabilities: this.getCapabilities(),
      stats: await this.getStats(),
    };
  }

  // Batch operations support
  public async batchStore(
    entries: Array<{
      key: string;
      value: unknown;
      metadata?: Record<string, unknown>;
    }>
  ): Promise<void> {
    for (const entry of entries) {
      await this.store(entry.key, entry.value);
    }
  }

  public async batchRetrieve<T = unknown>(
    keys: string[]
  ): Promise<Record<string, T'' | ''null>> {
    const results: Record<string, T'' | ''null> = {};
    for (const key of keys) {
      results[key] = await this.retrieve<T>(key);
    }
    return results;
  }

  public async batchDelete(keys: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const key of keys) {
      results[key] = await this.delete(key);
    }
    return results;
  }

  // Utility method for serialization
  protected serialize(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new Error(`Failed to serialize value: ${(error as Error).message}`);
    }
  }

  // Utility method for deserialization
  protected deserialize<T = unknown>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new Error(
        `Failed to deserialize value: ${(error as Error).message}`
      );
    }
  }

  // Additional methods for MemoryBackend interface compatibility

  /**
   * Concrete implementation of search for BackendInterface compatibility.
   *
   * @param pattern - Search pattern to match keys
   * @param _namespace - Optional namespace (unused in base implementation)
   */
  public async search(
    pattern: string,
    _namespace?: string
  ): Promise<Record<string, JSONValue>> {
    // Base implementation - override in subclasses.
    const results = await this.list(pattern);
    const resultMap: Record<string, JSONValue> = {};
    for (const key of results) {
      const value = await this.retrieve<unknown>(key);
      if (value !== null) {
        resultMap[key] = value as JSONValue;
      }
    }
    return resultMap;
  }

  /** Get size for MemoryBackend interface compatibility */
  public async size(): Promise<number> {
    return this.stats.totalEntries;
  }

  /** Get health status for MemoryBackend interface compatibility */
  public async health(): Promise<boolean> {
    try {
      const healthStatus = await this.healthCheck();
      return healthStatus.healthy;
    } catch (error) {
      this.emitError(
        error instanceof Error ? error : new Error(String(error)),'health'
      );
      return false;
    }
  }

  // Memory cleanup utility
  protected async cleanup(): Promise<void> {
    // Override in subclasses for specific cleanup logic
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

export default BaseMemoryBackend;
