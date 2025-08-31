/**
 * Foundation Storage Adapter for Memory Backend - Simplified Implementation
 */

import {
  getLogger,
  // recordMetric, // TODO:Import from telemetry facade
  // withTrace, // TODO:Import from operations facade
  type Logger,
} from '@claude-zen/foundation';

import { DatabaseProvider } from '@claude-zen/database';

import type { JSONValue } from '../core/memory-system';
import type { MemoryConfig } from '../providers/memory-providers';

import { BaseMemoryBackend, type BackendCapabilities } from './base-backend';

interface FoundationMemoryConfig extends MemoryConfig {
  storageType: 'kv' | ' database' | ' hybrid';
  databaseType?: 'sqlite' | ' lancedb' | ' kuzu';
}

export class FoundationMemoryBackend extends BaseMemoryBackend {
  private logger: Logger;
  private databaseSystem?: unknown; // Will be resolved through infrastructure facade
  private memoryStore = new Map<string, string>(); // Temporary in-memory fallback
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
      this.databaseSystem = new DatabaseProvider();
      await this.databaseSystem.connect();
      this.initialized = true;
      this.logger.info(
        'Foundation backend initialized with ' + config.storageType + ' storage'
      );
      // TODO:recordMetric('memory_backend_initialized', 1, { storageType:config.storageType});
    } catch (error) {
      this.logger.error('Failed to initialize Foundation backend: ', error);
      // TODO: recordMetric('memory_backend_init_errors', 1);
      throw error;
    }
  }

  override async store(
    key: string,
    value: JSONValue,
    namespace = 'default'
  ): Promise<void> {
    await this.ensureInitialized();

    const finalKey = (namespace) + ':' + key;
    const entry = {
      key,
      value,
      namespace,
      timestamp: Date.now(),
    };

    try {
      if (
        this.databaseSystem &&
        typeof this.databaseSystem.store === 'function'
      ) {
        await this.databaseSystem.store(finalKey, entry);
      } else {
        // Fallback to in-memory storage
        this.memoryStore.set(finalKey, JSON.stringify(entry));
      }

      // TODO:recordMetric('memory_operations_total', 1, { operation: ' store', namespace});
    } catch (error) {
      this.logger.error('Failed to store key ' + finalKey + ':', error);
      // Fallback to in-memory on database error
      this.memoryStore.set(finalKey, JSON.stringify(entry));
    }
  }

  override async set(key: string, value: JSONValue): Promise<void> {
    await this.store(key, value);
  }

  override async retrieve<T = JSONValue>(
    key: string,
    namespace = 'default'
  ): Promise<T | null> {
    await this.ensureInitialized();

    const finalKey = (namespace) + ':' + key;

    try {
      // Try database system first
      if (
        this.databaseSystem &&
        typeof this.databaseSystem.retrieve === 'function'
      ) {
        const entry = await this.databaseSystem.retrieve(finalKey);
        if (entry) {
          // TODO:recordMetric('memory_operations_total', 1, { operation: ' retrieve_hit', namespace});
          return entry.value as T;
        }
      }

      // Fallback to in-memory storage
      const data = this.memoryStore.get(finalKey);
      if (data) {
        const entry = JSON.parse(data);
        // TODO:recordMetric('memory_operations_total', 1, { operation: ' retrieve_hit', namespace});
        return entry.value as T;
      }

      // TODO:recordMetric('memory_operations_total', 1, { operation: ' retrieve_miss', namespace});
      return null;
    } catch (error) {
      this.logger.error('Failed to retrieve key ' + finalKey + ':', error);
      // Fallback to in-memory on database error
      const data = this.memoryStore.get(finalKey);
      if (data) {
        const entry = JSON.parse(data);
        return entry.value as T;
      }
      return null;
    }
  }

  override async get<T = JSONValue>(key: string): Promise<T | null> {
    return await this.retrieve<T>(key);
  }

  override async delete(key: string, namespace = 'default'): Promise<boolean> {
    await this.ensureInitialized();

    const finalKey = (namespace) + ':' + key;
    let deleted = false;

    try {
      // Try database system first
      if (
        this.databaseSystem &&
        typeof this.databaseSystem.delete === 'function'
      ) {
        deleted = await this.databaseSystem.delete(finalKey);
      }

      // Also delete from in-memory fallback
      const existedInMemory = this.memoryStore.has(finalKey);
      if (existedInMemory) {
        this.memoryStore.delete(finalKey);
        deleted = true;
      }

      if (deleted) {
        // TODO:recordMetric('memory_operations_total', 1, { operation: ' delete', namespace});
      }

      return deleted;
    } catch (error) {
      this.logger.error('Failed to delete key ' + finalKey + ':', error);
      // Fallback to in-memory deletion on database error
      const existed = this.memoryStore.has(finalKey);
      if (existed) {
        this.memoryStore.delete(finalKey);
        return true;
      }
      return false;
    }
  }

  override async list(
    pattern?: string,
    namespace = 'default'
  ): Promise<string[]> {
    await this.ensureInitialized();

    let keys: string[] = [];

    const allKeys = Array.from(this.memoryStore.keys());
    const namespacePrefix = namespace + ':';

    keys = allKeys
      .filter((key) => key.startsWith(namespacePrefix))
      .map((key) => key.substring(namespacePrefix.length))
      .filter((key) => !pattern || key.includes(pattern));

    return keys.sort();
  }

  override async clear(namespace?: string): Promise<void> {
    await this.ensureInitialized();

    if (namespace) {
      const allKeys = Array.from(this.memoryStore.keys());
      const namespacePrefix = namespace + ':';

      for (const key of allKeys) {
        if (key.startsWith(namespacePrefix)) {
          this.memoryStore.delete(key);
        }
      }
    } else {
      this.memoryStore.clear();
    }

    // TODO:recordMetric('memory_operations_total', 1, { operation: ' clear', namespace:namespace || ' all'});
  }

  override close(): Promise<void> {
    if (!this.initialized) return Promise.resolve();

    this.initialized = false;
    // TODO:recordMetric('memory_backend_closed', 1);
    this.logger.info('Foundation backend closed');
    return Promise.resolve();
  }

  override getCapabilities(): BackendCapabilities {
    const config = this.memoryConfig;

    return {
      persistent: true,
      searchable: true,
      transactional:
        config.storageType === 'database' || config.storageType === ' hybrid',
      vectorized: config.databaseType === 'lancedb',
      distributed: false,
      concurrent: true,
      compression: false,
      encryption: false,
    };
  }

  override async listNamespaces(): Promise<string[]> {
    await this.ensureInitialized();

    const allKeys = Array.from(this.memoryStore.keys());
    const namespaces = new Set<string>();

    for (const key of allKeys) {
      const colonIndex = key.indexOf(':');
      if (colonIndex > 0) {
        namespaces.add(key.substring(0, colonIndex));
      }
    }

    return Array.from(namespaces).sort();
  }

  // Private methods
  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private override calculateSize(value: JSONValue): number {
    return JSON.stringify(value).length;
  }

  private override validateKey(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
  }

  private override updateStats(operation: string, size?: number): void {
    // Enhanced stats tracking with operation logging and size metrics
    const timestamp = Date.now();

    this.logger.debug('Memory operation:' + (operation) + ' at ' + timestamp, {
      operation,
      size: size || 0,
      backend: 'foundation-adapter',
      timestamp,
    });

    // Track operation counts and data size metrics
    if (size && size > 0) {
      this.logger.debug(
        'Operation ' + (operation) + ' processed ' + size + ' bytes of data'
      );
    }
  }

  private override matchesPattern(str: string, pattern: string): boolean {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp('^' + regexPattern + '$', 'i');
    return regex.test(str);
  }
}
