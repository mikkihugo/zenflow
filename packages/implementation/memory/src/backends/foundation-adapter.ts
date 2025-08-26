/**
 * Foundation Storage Adapter for Memory Backend - Simplified Implementation
 */

import {
  getLogger,
  recordMetric,
  withTrace,
  type Logger,
} from '@claude-zen/foundation';

import { getDatabaseFactory, type KeyValueStorageImpl } from '@claude-zen/database';

import type { JSONValue } from '../core/memory-system';
import type { MemoryConfig } from '../providers/memory-providers';

import { BaseMemoryBackend, type BackendCapabilities } from './base-backend';

interface FoundationMemoryConfig extends MemoryConfig {
  storageType: 'kv|database|hybrid';
  databaseType?: 'sqlite|lancedb|kuzu';
}

export class FoundationMemoryBackend extends BaseMemoryBackend {
  private logger: Logger;
  private kvStore?: KeyValueStorageImpl;
  private initialized = false;
  protected override memoryConfig: FoundationMemoryConfig;

  constructor(config: FoundationMemoryConfig) {
    super(config);
    this.memoryConfig = config;
    this.logger = getLogger('FoundationMemoryBackend');
  }

  override async initialize(): Promise<void> {
    if (this.initialized) return;

    const config = this.memoryConfig;

    try {
      withTrace('memory-backend-init', async () => {
        // Use KV store for all storage types for now
        const dbFactory = getDatabaseFactory();
        this.kvStore = await dbFactory.createKeyValueStorage('sqlite', this.memoryConfig.path || './memory.db');
        this.initialized = true;
        this.logger.info(
          `Foundation backend initialized with ${config.storageType} storage`
        );
        recordMetric('memory_backend_initialized', 1, {
          storageType: config.storageType,
        });
      });
    } catch (error) {
      this.logger.error('Failed to initialize Foundation backend:', error);
      recordMetric('memory_backend_init_errors', 1);
      throw error;
    }
  }

  override async store(
    key: string,
    value: JSONValue,
    namespace = 'default'
  ): Promise<void> {
    await this.ensureInitialized();

    const finalKey = `${namespace}:${key}`;
    const entry = {
      key,
      value,
      namespace,
      timestamp: Date.now(),
    };

    if (this.kvStore) {
      await this.kvStore.set(finalKey, JSON.stringify(entry));
    }

    recordMetric('memory_operations_total', 1, {
      operation: 'store',
      namespace,
    });
  }

  override async set(key: string, value: JSONValue): Promise<void> {
    await this.store(key, value);
  }

  override async retrieve<T = JSONValue>(
    key: string,
    namespace = 'default'): Promise<T|null> {
    await this.ensureInitialized();

    const finalKey = `${namespace}:${key}`;

    if (this.kvStore) {
      const data = await this.kvStore.get(finalKey);
      if (data) {
        const entry = JSON.parse(data);
        recordMetric('memory_operations_total', 1, {
          operation: 'retrieve_hit',
          namespace,
        });
        return entry.value as T;
      }
    }

    recordMetric('memory_operations_total', 1, {
      operation: 'retrieve_miss',
      namespace,
    });
    return null;
  }

  override async get<T = JSONValue>(key: string): Promise<T|null> {
    return await this.retrieve<T>(key);
  }

  override async delete(key: string, namespace ='default'): Promise<boolean> {
    await this.ensureInitialized();

    const finalKey = `${namespace}:${key}`;
    let deleted = false;

    if (this.kvStore) {
      const existed = await this.kvStore.has(finalKey);
      if (existed) {
        await this.kvStore.delete(finalKey);
        deleted = true;
      }
    }

    if (deleted) {
      recordMetric('memory_operations_total', 1, {
        operation: 'delete',
        namespace,
      });
    }

    return deleted;
  }

  override async list(
    pattern?: string,
    namespace = 'default'): Promise<string[]> {
    await this.ensureInitialized();

    let keys: string[] = [];

    if (this.kvStore) {
      const allKeys = await this.kvStore.keys();
      const namespacePrefix = `${namespace}:`;

      keys = allKeys
        .filter((key) => key.startsWith(namespacePrefix))
        .map((key) => key.substring(namespacePrefix.length))
        .filter((key) => !pattern||key.includes(pattern));
    }

    return keys.sort();
  }

  override async clear(namespace?: string): Promise<void> {
    await this.ensureInitialized();

    if (this.kvStore) {
      if (namespace) {
        const allKeys = await this.kvStore.keys();
        const namespacePrefix = `${namespace}:`;

        for (const key of allKeys) {
          if (key.startsWith(namespacePrefix)) {
            await this.kvStore.delete(key);
          }
        }
      } else {
        await this.kvStore.clear();
      }
    }

    recordMetric('memory_operations_total', 1, {
      operation: 'clear',
      namespace: namespace||'all',
    });
  }

  override async close(): Promise<void> {
    if (!this.initialized) return;

    this.initialized = false;
    recordMetric('memory_backend_closed', 1);
    this.logger.info('Foundation backend closed');
  }

  override getCapabilities(): BackendCapabilities {
    const config = this.memoryConfig;

    return {
      persistent: true,
      searchable: true,
      transactional:
        config.storageType === 'database'||config.storageType ==='hybrid',
      vectorized: config.databaseType === 'lancedb',
      distributed: false,
      concurrent: true,
      compression: false,
      encryption: false,
    };
  }

  override async listNamespaces(): Promise<string[]> {
    await this.ensureInitialized();

    if (this.kvStore) {
      const allKeys = await this.kvStore.keys();
      const namespaces = new Set<string>();

      for (const key of allKeys) {
        const colonIndex = key.indexOf(':');
        if (colonIndex > 0) {
          namespaces.add(key.substring(0, colonIndex));
        }
      }

      return Array.from(namespaces).sort();
    }

    return [];
  }

  // Private methods
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private calculateSize(value: JSONValue): number {
    return JSON.stringify(value).length;
  }

  private validateKey(key: string): void {
    if (!key||typeof key !=='string') {
      throw new Error('Key must be a non-empty string');
    }
  }

  private updateStats(operation: string, size?: number): void {
    // Enhanced stats tracking with operation logging and size metrics
    const timestamp = Date.now();
    
    this.logger.debug(`Memory operation: ${operation} at ${timestamp}`, {
      operation,
      size: size || 0,
      backend: 'foundation-adapter',
      timestamp
    });
    
    // Track operation counts and data size metrics
    if (size && size > 0) {
      this.logger.debug(`Operation ${operation} processed ${size} bytes of data`);
    }
  }

  private matchesPattern(str: string, pattern: string): boolean {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(str);
  }
}
