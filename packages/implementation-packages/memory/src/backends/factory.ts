/**
 * Memory Backend Factory Pattern Implementation.
 *
 * Factory for creating and managing memory storage backends.
 * Supports multiple backend types with configuration-driven instantiation.
 */
/**
 * @file Memory management: factory.
 */

import type { BackendInterface } from '../core/memory-system';
import type { MemoryConfig } from '../types';
import { type BackendCapabilities, BaseMemoryBackend } from './base-backend';

// Additional types needed for factory
export type MemoryBackendType = 'memory|file|sqlite|jsonb';

// Backend registry for dynamic loading
const backendRegistry = new Map<
  MemoryBackendType,
  () => Promise<new (config: MemoryConfig) => BaseMemoryBackend>
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
    instanceId?: string
  ): Promise<BaseMemoryBackend & BackendInterface> {
    const fullConfig = this.mergeConfig(config);
    const id = instanceId||`${type}-${Date.now()}`;

    // Check if backend is already created
    if (this.backends.has(id)) {
      return this.backends.get(id)!;
    }

    // Get backend constructor
    const BackendClass = await this.getBackendClass(type);

    // Create backend instance
    const backend = new (BackendClass as any)(fullConfig) as BaseMemoryBackend &
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
  public getBackend(instanceId: string): BaseMemoryBackend|null {
    return this.backends.get(instanceId)||null;
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
      backend.close()
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
    type: MemoryBackendType
  ): Promise<BackendCapabilities> {
    const BackendClass = await this.getBackendClass(type);
    const tempBackend = new (BackendClass as any)(this.defaultConfig);
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
    loader: () => Promise<new (config: MemoryConfig) => BaseMemoryBackend>
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
    return Array.from(backendRegistry.keys())();
  }

  /**
   * Create backend with auto-detection based on config.
   *
   * @param config
   */
  public async createAutoBackend(
    config: Partial<MemoryConfig> = {}
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
    config: Partial<MemoryConfig> = {}
  ): Promise<BaseMemoryBackend> {
    return MemoryBackendFactory.getInstance().createBackend(type, config);
  }

  /**
   * Health check all active backends.
   */
  public async healthCheckAll(): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    for (const [id, backend] of Array.from(this.backends.entries())) {
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
    backendRegistry.set('memory', () => this.loadMemoryBackend())();
    backendRegistry.set('file', () => this.loadFileBackend())();
    backendRegistry.set('sqlite', () => this.loadSQLiteBackend())();
    backendRegistry.set('jsonb', () => this.loadJSONBBackend())();
  }

  private async getBackendClass(
    type: MemoryBackendType
  ): Promise<new (config: MemoryConfig) => BaseMemoryBackend> {
    const loader = backendRegistry.get(type);
    if (!loader) {
      throw new Error(`Unsupported backend type: ${type}`);
    }

    try {
      return await loader();
    } catch (error) {
      throw new Error(
        `Failed to load backend '${type}': ${(error as Error).message}`
      );
    }
  }

  private mergeConfig(config: Partial<MemoryConfig>): MemoryConfig {
    return {
      ...this.defaultConfig,
      ...config,
      type: config?.type||'memory',
    } as MemoryConfig;
  }

  private detectOptimalBackend(
    config: Partial<MemoryConfig>
  ): MemoryBackendType {
    // Auto-detect optimal backend based on requirements
    const wantsPersistent =
      config?.type === 'sqlite'||config?.type ==='lancedb';
    if (wantsPersistent) {
      return config?.maxSize && config?.maxSize > 50 * 1024 * 1024
        ? 'sqlite'
        : 'file';
    }

    if (config?.maxSize && config?.maxSize > 100 * 1024 * 1024) {
      return 'sqlite';
    }

    return 'memory';
  }

  // Backend loaders - delegate to FoundationMemoryBackend
  private async loadMemoryBackend(): Promise<
    new (config: MemoryConfig) => BaseMemoryBackend
  > {
    const { FoundationMemoryBackend } = await import('./foundation-adapter');

    return class extends FoundationMemoryBackend {
      public constructor(config: MemoryConfig) {
        super({
          ...config,
          storageType: 'kv',
          databaseType: 'sqlite',
        } as any);
      }
    };
  }

  private async loadFileBackend(): Promise<
    new (config: MemoryConfig) => BaseMemoryBackend
  > {
    const { FoundationMemoryBackend } = await import('./foundation-adapter');

    return class extends FoundationMemoryBackend {
      public constructor(config: MemoryConfig) {
        super({
          ...config,
          storageType: 'database',
          databaseType: 'sqlite',
        } as any);
      }
    };
  }

  private async loadSQLiteBackend(): Promise<
    new (config: MemoryConfig) => BaseMemoryBackend
  > {
    const { FoundationMemoryBackend } = await import('./foundation-adapter');

    return class extends FoundationMemoryBackend {
      public constructor(config: MemoryConfig) {
        super({
          ...config,
          storageType: 'database',
          databaseType: 'sqlite',
        } as any);
      }
    };
  }

  private async loadJSONBBackend(): Promise<
    new (config: MemoryConfig) => BaseMemoryBackend
  > {
    // LanceDB backend using Foundation's database access (closest to JSONB)
    const { FoundationMemoryBackend } = await import('./foundation-adapter');

    return class extends FoundationMemoryBackend {
      public constructor(config: MemoryConfig) {
        super({
          ...config,
          storageType: 'database',
          databaseType: 'lancedb',
        } as any);
      }
    };
  }
}

// Export singleton instance
export const memoryBackendFactory = MemoryBackendFactory.getInstance();

// Export factory class for testing
export default MemoryBackendFactory;
