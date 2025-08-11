/**
 * Memory Backend Factory Pattern Implementation.
 *
 * Factory for creating and managing memory storage backends.
 * Supports multiple backend types with configuration-driven instantiation.
 */
/**
 * @file Memory management: factory.
 */

import type { BackendInterface } from '../core/memory-system.ts';
import type { MemoryConfig } from '../providers/memory-providers.ts';
import { BaseMemoryBackend, type BackendCapabilities } from './base-backend.ts';

// Additional types needed for factory
export type MemoryBackendType = 'memory' | 'file' | 'sqlite' | 'jsonb';

// Backend registry for dynamic loading
const backendRegistry = new Map<
  MemoryBackendType,
  () => Promise<typeof BaseMemoryBackend>
>();

/**
 * Memory Backend Factory Class.
 *
 * Provides centralized creation and management of memory storage backends.
 *
 * @example
 */
export class MemoryBackendFactory {
  private static instance: MemoryBackendFactory;
  private backends = new Map<string, BaseMemoryBackend>();
  private defaultConfig: Partial<MemoryConfig> = {
    maxSize: 100 * 1024 * 1024, // 100MB
    ttl: 3600000, // 1 hour
    compression: false,
    encryption: false,
  };

  private constructor() {
    this.registerDefaultBackends();
  }

  /**
   * Get singleton instance.
   */
  public static getInstance(): MemoryBackendFactory {
    if (!MemoryBackendFactory.instance) {
      MemoryBackendFactory.instance = new MemoryBackendFactory();
    }
    return MemoryBackendFactory.instance;
  }

  /**
   * Create a memory backend instance.
   *
   * @param type
   * @param config
   * @param instanceId
   */
  public async createBackend(
    type: MemoryBackendType,
    config: Partial<MemoryConfig> = {},
    instanceId?: string,
  ): Promise<BaseMemoryBackend & BackendInterface> {
    const fullConfig = this.mergeConfig(config);
    const id = instanceId || `${type}-${Date.now()}`;

    // Check if backend is already created
    if (this.backends.has(id)) {
      return this.backends.get(id)!;
    }

    // Get backend constructor
    const BackendClass = await this.getBackendClass(type);

    // Create backend instance
    const backend = new BackendClass(fullConfig) as BaseMemoryBackend &
      BackendInterface;

    // Initialize backend
    await backend.initialize();

    // Store in registry
    this.backends.set(id, backend);

    // Setup cleanup on close
    backend.once('close', () => {
      this.backends.delete(id);
    });

    return backend;
  }

  /**
   * Get existing backend instance.
   *
   * @param instanceId
   */
  public getBackend(instanceId: string): BaseMemoryBackend | null {
    return this.backends.get(instanceId) || null;
  }

  /**
   * List all active backend instances.
   */
  public listBackends(): Array<{
    id: string;
    type: string;
    config: MemoryConfig;
  }> {
    return Array.from(this.backends.entries()).map(([id, backend]) => ({
      id,
      type: backend.constructor.name,
      config: backend.getConfig(),
    }));
  }

  /**
   * Close and cleanup a backend instance.
   *
   * @param instanceId
   */
  public async closeBackend(instanceId: string): Promise<boolean> {
    const backend = this.backends.get(instanceId);
    if (backend) {
      await backend.close();
      this.backends.delete(instanceId);
      return true;
    }
    return false;
  }

  /**
   * Close all backend instances.
   */
  public async closeAllBackends(): Promise<void> {
    const closePromises = Array.from(this.backends.values()).map((backend) =>
      backend.close(),
    );
    await Promise.all(closePromises);
    this.backends.clear();
  }

  /**
   * Get backend capabilities.
   *
   * @param type
   */
  public async getBackendCapabilities(
    type: MemoryBackendType,
  ): Promise<BackendCapabilities> {
    const BackendClass = await this.getBackendClass(type);
    const tempBackend = new BackendClass(this.defaultConfig);
    return tempBackend.getCapabilities();
  }

  /**
   * Register a custom backend type.
   *
   * @param type
   * @param loader
   */
  public registerBackend(
    type: MemoryBackendType,
    loader: () => Promise<typeof BaseMemoryBackend>,
  ): void {
    backendRegistry.set(type, loader);
  }

  /**
   * Check if backend type is supported.
   *
   * @param type
   */
  public isBackendSupported(type: MemoryBackendType): boolean {
    return backendRegistry.has(type);
  }

  /**
   * Get all supported backend types.
   */
  public getSupportedBackends(): MemoryBackendType[] {
    return Array.from(backendRegistry.keys());
  }

  /**
   * Create backend with auto-detection based on config.
   *
   * @param config
   */
  public async createAutoBackend(
    config: Partial<MemoryConfig> = {},
  ): Promise<BaseMemoryBackend> {
    const type = this.detectOptimalBackend(config);
    return this.createBackend(type, config);
  }

  /**
   * Static method for compatibility with existing code.
   *
   * @param type
   * @param config
   */
  public static async createBackend(
    type: MemoryBackendType,
    config: Partial<MemoryConfig> = {},
  ): Promise<BaseMemoryBackend> {
    return MemoryBackendFactory.getInstance().createBackend(type, config);
  }

  /**
   * Health check all active backends.
   */
  public async healthCheckAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const [id, backend] of this.backends.entries()) {
      try {
        results[id] = await backend.healthCheck();
      } catch (error) {
        results[id] = {
          healthy: false,
          error: (error as Error).message,
          backend: backend.constructor.name,
        };
      }
    }

    return results;
  }

  // Private methods

  private registerDefaultBackends(): void {
    // Register built-in backends with lazy loading
    backendRegistry.set('memory', () => this.loadMemoryBackend());
    backendRegistry.set('file', () => this.loadFileBackend());
    backendRegistry.set('sqlite', () => this.loadSQLiteBackend());
    backendRegistry.set('jsonb', () => this.loadJSONBBackend());
  }

  private async getBackendClass(
    type: MemoryBackendType,
  ): Promise<typeof BaseMemoryBackend> {
    const loader = backendRegistry.get(type);
    if (!loader) {
      throw new Error(`Unsupported backend type: ${type}`);
    }

    try {
      return await loader();
    } catch (error) {
      throw new Error(
        `Failed to load backend '${type}': ${(error as Error).message}`,
      );
    }
  }

  private mergeConfig(config: Partial<MemoryConfig>): MemoryConfig {
    return {
      ...this.defaultConfig,
      ...config,
      type: config?.type || 'memory',
    } as MemoryConfig;
  }

  private detectOptimalBackend(
    config: Partial<MemoryConfig>,
  ): MemoryBackendType {
    // Auto-detect optimal backend based on requirements
    if (config?.persistent) {
      return config?.maxSize && config?.maxSize > 50 * 1024 * 1024
        ? 'sqlite'
        : 'file';
    }

    if (config?.maxSize && config?.maxSize > 100 * 1024 * 1024) {
      return 'sqlite';
    }

    return 'memory';
  }

  // Backend loaders (stub implementations for now)
  private async loadMemoryBackend(): Promise<typeof BaseMemoryBackend> {
    // In-memory backend implementation (stub)
    class MemoryBackend extends BaseMemoryBackend {
      private dataStore = new Map<string, any>();

      override async initialize(): Promise<void> {
        // No initialization needed for memory backend
      }

      override async store(
        key: string,
        value: any,
        namespace?: string,
      ): Promise<void> {
        this.validateKey(key);
        const finalKey = namespace ? `${namespace}:${key}` : key;
        this.dataStore.set(finalKey, this.createMemoryEntry(finalKey, value));
        this.updateStats('write', this.calculateSize(value));
      }

      override async set(key: string, value: any): Promise<void> {
        return this.store(key, value);
      }

      override async get<T = any>(key: string): Promise<T | null> {
        return this.retrieve<T>(key);
      }

      override async retrieve<T = any>(key: string): Promise<T | null> {
        this.validateKey(key);
        const entry = this.dataStore.get(key);
        this.updateStats('read');
        return entry ? entry.value : null;
      }

      override async delete(key: string): Promise<boolean> {
        this.validateKey(key);
        const existed = this.dataStore.has(key);
        if (existed) {
          const entry = this.dataStore.get(key);
          this.dataStore.delete(key);
          this.updateStats(
            'delete',
            entry ? this.calculateSize(entry.value) : 0,
          );
        }
        return existed;
      }

      override async list(pattern?: string): Promise<string[]> {
        return Array.from(this.dataStore.keys()).filter((key) =>
          this.matchesPattern(key, pattern),
        );
      }

      async search(): Promise<any[]> {
        // Basic search implementation
        return Array.from(this.dataStore.values());
      }

      override async clear(): Promise<void> {
        this.dataStore.clear();
        this.stats.totalEntries = 0;
        this.stats.totalSize = 0;
      }

      override async close(): Promise<void> {
        await this.clear();
        await this.cleanup();
      }

      override getCapabilities(): BackendCapabilities {
        return {
          persistent: false,
          searchable: false,
          transactional: false,
          concurrent: true,
          compression: false,
          encryption: false,
        };
      }

      override async listNamespaces(): Promise<string[]> {
        // Simple implementation - could be enhanced
        const namespaces = new Set<string>();
        for (const key of this.dataStore.keys()) {
          const colonIndex = key.indexOf(':');
          if (colonIndex > 0) {
            namespaces.add(key.substring(0, colonIndex));
          }
        }
        return Array.from(namespaces);
      }
    }

    return MemoryBackend;
  }

  private async loadFileBackend(): Promise<typeof BaseMemoryBackend> {
    // File-based backend implementation (stub)
    class FileBackend extends BaseMemoryBackend {
      override async initialize(): Promise<void> {
        // File backend initialization
      }

      override async store(
        _key: string,
        _value: any,
        _namespace?: string,
      ): Promise<void> {
        throw new Error('FileBackend not implemented');
      }

      override async set(key: string, value: any): Promise<void> {
        return this.store(key, value);
      }

      override async get<T = any>(key: string): Promise<T | null> {
        return this.retrieve<T>(key);
      }

      override async retrieve<T = any>(_key: string): Promise<T | null> {
        throw new Error('FileBackend not implemented');
      }

      override async delete(_key: string): Promise<boolean> {
        throw new Error('FileBackend not implemented');
      }

      override async list(): Promise<string[]> {
        throw new Error('FileBackend not implemented');
      }

      async search(): Promise<any[]> {
        throw new Error('FileBackend not implemented');
      }

      override async clear(): Promise<void> {
        throw new Error('FileBackend not implemented');
      }

      override async close(): Promise<void> {
        throw new Error('FileBackend not implemented');
      }

      override getCapabilities(): BackendCapabilities {
        return {
          persistent: true,
          searchable: false,
          transactional: false,
          concurrent: false,
          compression: true,
          encryption: true,
        };
      }

      override async listNamespaces(): Promise<string[]> {
        // Simple implementation for file backend - return default namespace
        // In a full implementation, this could scan the file directory structure
        return ['default'];
      }
    }

    return FileBackend;
  }

  private async loadSQLiteBackend(): Promise<typeof BaseMemoryBackend> {
    // SQLite backend implementation (stub)
    class SQLiteBackend extends BaseMemoryBackend {
      override async initialize(): Promise<void> {
        // SQLite backend initialization
      }

      override async store(
        _key: string,
        _value: any,
        _namespace?: string,
      ): Promise<void> {
        throw new Error('SQLiteBackend not implemented');
      }

      override async set(key: string, value: any): Promise<void> {
        return this.store(key, value);
      }

      override async get<T = any>(key: string): Promise<T | null> {
        return this.retrieve<T>(key);
      }

      override async retrieve(): Promise<any> {
        throw new Error('SQLiteBackend not implemented');
      }

      override async delete(): Promise<boolean> {
        throw new Error('SQLiteBackend not implemented');
      }

      override async list(): Promise<string[]> {
        throw new Error('SQLiteBackend not implemented');
      }

      async search(): Promise<any[]> {
        throw new Error('SQLiteBackend not implemented');
      }

      override async clear(): Promise<void> {
        throw new Error('SQLiteBackend not implemented');
      }

      override async close(): Promise<void> {
        throw new Error('SQLiteBackend not implemented');
      }

      override getCapabilities(): BackendCapabilities {
        return {
          persistent: true,
          searchable: true,
          transactional: true,
          concurrent: true,
          compression: false,
          encryption: false,
        };
      }

      override async listNamespaces(): Promise<string[]> {
        // Simple implementation for SQLite backend - return default namespace
        // In a full implementation, this could query the database for distinct namespaces
        return ['default'];
      }
    }

    return SQLiteBackend;
  }

  private async loadJSONBBackend(): Promise<typeof BaseMemoryBackend> {
    // JSONB backend implementation (stub)
    class JSONBBackend extends BaseMemoryBackend {
      override async initialize(): Promise<void> {
        // JSONB backend initialization
      }

      override async store(
        _key: string,
        _value: any,
        _namespace?: string,
      ): Promise<void> {
        throw new Error('JSONBBackend not implemented');
      }

      override async set(key: string, value: any): Promise<void> {
        return this.store(key, value);
      }

      override async get<T = any>(key: string): Promise<T | null> {
        return this.retrieve<T>(key);
      }

      override async retrieve(): Promise<any> {
        throw new Error('JSONBBackend not implemented');
      }

      override async delete(): Promise<boolean> {
        throw new Error('JSONBBackend not implemented');
      }

      override async list(): Promise<string[]> {
        throw new Error('JSONBBackend not implemented');
      }

      async search(): Promise<any[]> {
        throw new Error('JSONBBackend not implemented');
      }

      override async clear(): Promise<void> {
        throw new Error('JSONBBackend not implemented');
      }

      override async close(): Promise<void> {
        throw new Error('JSONBBackend not implemented');
      }

      override getCapabilities(): BackendCapabilities {
        return {
          persistent: true,
          searchable: true,
          transactional: true,
          concurrent: true,
          compression: false,
          encryption: false,
        };
      }

      override async listNamespaces(): Promise<string[]> {
        // Simple implementation for JSONB backend - return default namespace
        // In a full implementation, this could query PostgreSQL for distinct namespaces
        return ['default'];
      }
    }

    return JSONBBackend;
  }
}

// Export singleton instance
export const memoryBackendFactory = MemoryBackendFactory.getInstance();

// Export factory class for testing
export default MemoryBackendFactory;
