/**
 * Foundation Storage Adapter for Memory Backend - Simplified Implementation
 */
import {
  getKVStore,
  getLogger,
  recordMetric,
  withTrace,
} from '@claude-zen/foundation';
import { BaseMemoryBackend } from './base-backend';
export class FoundationMemoryBackend extends BaseMemoryBackend {
  logger;
  kvStore;
  initialized = false;
  memoryConfig;
  constructor(config) {
    super(config);
    this.memoryConfig = config;
    this.logger = getLogger('FoundationMemoryBackend');
  }
  async initialize() {
    if (this.initialized) return;
    const config = this.memoryConfig;
    try {
      withTrace('memory-backend-init', async () => {
        // Use KV store for all storage types for now
        this.kvStore = await getKVStore('sqlite');
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
  async store(key, value, namespace = 'default') {
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
  async set(key, value) {
    return this.store(key, value);
  }
  async retrieve(key, namespace = 'default') {
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
        return entry.value;
      }
    }
    recordMetric('memory_operations_total', 1, {
      operation: 'retrieve_miss',
      namespace,
    });
    return null;
  }
  async get(key) {
    return this.retrieve(key);
  }
  async delete(key, namespace = 'default') {
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
  async list(pattern, namespace = 'default') {
    await this.ensureInitialized();
    let keys = [];
    if (this.kvStore) {
      const allKeys = await this.kvStore.keys();
      const namespacePrefix = `${namespace}:`;
      keys = allKeys
        .filter((key) => key.startsWith(namespacePrefix))
        .map((key) => key.substring(namespacePrefix.length))
        .filter((key) => !pattern || key.includes(pattern));
    }
    return keys.sort();
  }
  async clear(namespace) {
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
      namespace: namespace || 'all',
    });
  }
  async close() {
    if (!this.initialized) return;
    this.initialized = false;
    recordMetric('memory_backend_closed', 1);
    this.logger.info('Foundation backend closed');
  }
  getCapabilities() {
    const config = this.memoryConfig;
    return {
      persistent: true,
      searchable: true,
      transactional:
        config.storageType === 'database' || config.storageType === 'hybrid',
      vectorized: config.databaseType === 'lancedb',
      distributed: false,
      concurrent: true,
      compression: false,
      encryption: false,
    };
  }
  async listNamespaces() {
    await this.ensureInitialized();
    if (this.kvStore) {
      const allKeys = await this.kvStore.keys();
      const namespaces = new Set();
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
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }
  calculateSize(value) {
    return JSON.stringify(value).length;
  }
  validateKey(key) {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
  }
  updateStats(operation, size) {
    // Placeholder for stats updates
  }
  matchesPattern(str, pattern) {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(str);
  }
}
