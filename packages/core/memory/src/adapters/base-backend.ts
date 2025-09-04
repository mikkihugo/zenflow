/**
 * Golden Event-Driven Base Backend for Memory Storage
 * 
 * This is the golden foundation for all memory backends with:
 * - Event-driven architecture using EventBus
 * - Result pattern for error handling
 * - Database package integration
 * - Production-ready monitoring
 */

import { Result, err, EventBus, getLogger } from '@claude-zen/foundation';
import type { MemoryConfig } from '../types/index';
import type { JSONValue } from '../core/memory-system';

const logger = getLogger('memory:base-backend');
const eventBus = EventBus.getInstance();

// Golden backend capabilities with database integration
export interface BackendCapabilities {
  persistent: boolean;
  searchable: boolean;
  transactional: boolean;
  vectorized: boolean;
  distributed: boolean;
  concurrent: boolean;
  compression: boolean;
  encryption: boolean;
  supportsEvents: boolean;
  databaseIntegration: boolean;
}

export interface MemoryEntry {
  key: string;
  value: JSONValue;
  metadata: Record<string, unknown>;
  timestamp: number;
  size: number;
  type: string;
  ttl?: number;
}

export interface MemoryStats {
  totalKeys: number;
  totalSize: number;
  averageKeySize: number;
  averageValueSize: number;
  uptime: number;
  operations: {
    reads: number;
    writes: number;
    deletes: number;
  };
  performance: {
    averageReadTime: number;
    averageWriteTime: number;
    averageDeleteTime: number;
  };
}

export interface MemoryQueryOptions {
  pattern?: string;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
  sortBy?: 'key' | 'timestamp' | 'size';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Golden Event-Driven Base Memory Backend
 * 
 * All memory backends extend this class to get:
 * - Automatic event emission for all operations
 * - Result pattern for consistent error handling
 * - Integration with database package
 * - Production monitoring capabilities
 */
export abstract class BaseMemoryBackend {
  protected memoryConfig: MemoryConfig;
  protected backendId: string;
  protected initialized = false;
  protected stats: MemoryStats;

  constructor(config: MemoryConfig) {
    this.memoryConfig = config;
    this.backendId = `memory-${config.type}-${Date.now()}`;
    
    this.stats = {
      totalKeys: 0,
      totalSize: 0,
      averageKeySize: 0,
      averageValueSize: 0,
      uptime: Date.now(),
      operations: { reads: 0, writes: 0, deletes: 0 },
      performance: { averageReadTime: 0, averageWriteTime: 0, averageDeleteTime: 0 }
    };

    logger.info('Memory backend initializing', { 
      backendId: this.backendId, 
      type: config.type 
    });

    eventBus.emit('memory:backend:initializing', {
      backendId: this.backendId,
      type: config.type,
      config
    });
  }

  // Core CRUD operations with Result pattern and events
  abstract get(key: string): Promise<Result<MemoryEntry | null, Error>>;
  abstract set(key: string, value: JSONValue, options?: { ttl?: number; metadata?: Record<string, unknown> }): Promise<Result<void, Error>>;
  abstract delete(key: string): Promise<Result<boolean, Error>>;
  abstract clear(): Promise<Result<void, Error>>;
  
  // Query and management operations
  abstract size(): Promise<Result<number, Error>>;
  abstract list(options?: MemoryQueryOptions): Promise<Result<string[], Error>>;
  abstract listNamespaces(): Promise<Result<string[], Error>>;
  abstract getStats(): Promise<Result<MemoryStats, Error>>;

  // Health and lifecycle management
  abstract health(): Promise<Result<boolean, Error>>;
  abstract close(): Promise<Result<void, Error>>;
  abstract initialize(): Promise<Result<void, Error>>;
  
  // BackendInterface compatibility methods - converting Result pattern to Promise/throw
  async store(key: string, value: JSONValue, namespace?: string): Promise<void> {
    const namespacedKey = namespace ? `${namespace}:${key}` : key;
    const result = await this.set(namespacedKey, value);
    if (result.isErr()) {
      throw result.error;
    }
  }
  
  async retrieve<T = JSONValue>(key: string): Promise<T | null> {
    const result = await this.get(key);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value?.value as T | null;
  }
  
  async search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>> {
    const searchPattern = namespace ? `${namespace}:${pattern}` : pattern;
    const listResult = await this.list({ pattern: searchPattern });
    if (listResult.isErr()) {
      throw listResult.error;
    }
    
    // Fetch all values in parallel for better performance
    const getPromises = listResult.value.map(async (key) => {
      const getResult = await this.get(key);
      return { key, result: getResult };
    });

    const getResults = await Promise.allSettled(getPromises);
    
    const results: Record<string, JSONValue> = {};
    for (const promiseResult of getResults) {
      if (promiseResult.status === 'fulfilled') {
        const { key, result } = promiseResult.value;
        if (result.isOk() && result.value) {
          results[key] = result.value.value;
        }
      }
    }
    return results;
  }

  // Golden package standard methods
  getCapabilities(): BackendCapabilities {
    return {
      persistent: true,
      searchable: true,
      transactional: false,
      vectorized: false,
      distributed: false,
      concurrent: true,
      compression: false,
      encryption: false,
      supportsEvents: true,
      databaseIntegration: true
    };
  }

  getConfig(): MemoryConfig {
    return { ...this.memoryConfig };
  }

  getBackendId(): string {
    return this.backendId;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Event-driven operation wrapper for consistent monitoring
  protected async emitOperation<T>(
    operation: string, 
    key: string, 
    action: () => Promise<Result<T, Error>>
  ): Promise<Result<T, Error>> {
    const startTime = Date.now();
    
    eventBus.emit('memory:operation:start', {
      backendId: this.backendId,
      operation,
      key,
      timestamp: startTime
    });

    try {
      const result = await action();
      const duration = Date.now() - startTime;
      
      // Update stats
      this.updateOperationStats(operation, duration);
      
      eventBus.emit('memory:operation:complete', {
        backendId: this.backendId,
        operation,
        key,
        success: result.isOk(),
        duration,
        timestamp: Date.now()
      });

      if (result.isErr()) {
        logger.warn('Memory operation failed', {
          backendId: this.backendId,
          operation,
          key,
          error: result.error.message
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      eventBus.emit('memory:operation:error', {
        backendId: this.backendId,
        operation,
        key,
        error: error instanceof Error ? error.message : String(error),
        duration,
        timestamp: Date.now()
      });

      logger.error('Memory operation exception', {
        backendId: this.backendId,
        operation,
        key,
        error
      });

      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  protected updateOperationStats(operation: string, duration: number): void {
    switch (operation) {
      case 'get':
        this.stats.operations.reads++;
        this.stats.performance.averageReadTime = 
          (this.stats.performance.averageReadTime + duration) / 2;
        break;
      case 'set':
        this.stats.operations.writes++;
        this.stats.performance.averageWriteTime = 
          (this.stats.performance.averageWriteTime + duration) / 2;
        break;
      case 'delete':
        this.stats.operations.deletes++;
        this.stats.performance.averageDeleteTime = 
          (this.stats.performance.averageDeleteTime + duration) / 2;
        break;
    }
  }

  protected setInitialized(initialized: boolean): void {
    this.initialized = initialized;
    
    eventBus.emit('memory:backend:initialized', {
      backendId: this.backendId,
      type: this.memoryConfig.type,
      initialized,
      timestamp: Date.now()
    });
  }
}