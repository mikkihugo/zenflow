/**
 * Memory Backend Factory Pattern Implementation.
 *
 * Factory for creating and managing memory storage backends.
 * Supports multiple backend types with configuration-driven instantiation.
 */
/**
 * @file Memory management: factory.
 */
// Backend registry for dynamic loading
const backendRegistry = new Map();
/**
 * Memory Backend Factory Class.
 *
 * Provides centralized creation and management of memory storage backends.
 *
 * @example
 */
export class MemoryBackendFactory {
  static instance;
  backends = new Map();
  defaultConfig = {
    maxSize: 100 * 1024 * 1024, // 100MB
    ttl: 3600000, // 1 hour
    compression: false,
    encryption: false,
  };
  constructor() {
    this.registerDefaultBackends();
  }
  /**
   * Get singleton instance.
   */
  static getInstance() {
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
  async createBackend(type, config = {}, instanceId) {
    const fullConfig = this.mergeConfig(config);
    const id = instanceId || `${type}-${Date.now()}`;
    // Check if backend is already created
    if (this.backends.has(id)) {
      return this.backends.get(id);
    }
    // Get backend constructor
    const BackendClass = await this.getBackendClass(type);
    // Create backend instance
    const backend = new BackendClass(fullConfig);
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
  getBackend(instanceId) {
    return this.backends.get(instanceId) || null;
  }
  /**
   * List all active backend instances.
   */
  listBackends() {
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
  async closeBackend(instanceId) {
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
  async closeAllBackends() {
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
  async getBackendCapabilities(type) {
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
  registerBackend(type, loader) {
    backendRegistry.set(type, loader);
  }
  /**
   * Check if backend type is supported.
   *
   * @param type
   */
  isBackendSupported(type) {
    return backendRegistry.has(type);
  }
  /**
   * Get all supported backend types.
   */
  getSupportedBackends() {
    return Array.from(backendRegistry.keys());
  }
  /**
   * Create backend with auto-detection based on config.
   *
   * @param config
   */
  async createAutoBackend(config = {}) {
    const type = this.detectOptimalBackend(config);
    return this.createBackend(type, config);
  }
  /**
   * Static method for compatibility with existing code.
   *
   * @param type
   * @param config
   */
  static async createBackend(type, config = {}) {
    return MemoryBackendFactory.getInstance().createBackend(type, config);
  }
  /**
   * Health check all active backends.
   */
  async healthCheckAll() {
    const results = {};
    for (const [id, backend] of Array.from(this.backends.entries())) {
      try {
        results[id] = await backend.healthCheck();
      } catch (error) {
        results[id] = {
          healthy: false,
          error: error.message,
          backend: backend.constructor.name,
        };
      }
    }
    return results;
  }
  // Private methods
  registerDefaultBackends() {
    // Register built-in backends with lazy loading
    backendRegistry.set('memory', () => this.loadMemoryBackend());
    backendRegistry.set('file', () => this.loadFileBackend());
    backendRegistry.set('sqlite', () => this.loadSQLiteBackend());
    backendRegistry.set('jsonb', () => this.loadJSONBBackend());
  }
  async getBackendClass(type) {
    const loader = backendRegistry.get(type);
    if (!loader) {
      throw new Error(`Unsupported backend type: ${type}`);
    }
    try {
      return await loader();
    } catch (error) {
      throw new Error(`Failed to load backend '${type}': ${error.message}`);
    }
  }
  mergeConfig(config) {
    return {
      ...this.defaultConfig,
      ...config,
      type: config?.type || 'memory',
    };
  }
  detectOptimalBackend(config) {
    // Auto-detect optimal backend based on requirements
    const wantsPersistent =
      config?.type === 'sqlite' || config?.type === 'lancedb';
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
  async loadMemoryBackend() {
    const { FoundationMemoryBackend } = await import('./foundation-adapter');
    return class extends FoundationMemoryBackend {
      constructor(config) {
        super({
          ...config,
          storageType: 'kv',
          databaseType: 'sqlite',
        });
      }
    };
  }
  async loadFileBackend() {
    const { FoundationMemoryBackend } = await import('./foundation-adapter');
    return class extends FoundationMemoryBackend {
      constructor(config) {
        super({
          ...config,
          storageType: 'database',
          databaseType: 'sqlite',
        });
      }
    };
  }
  async loadSQLiteBackend() {
    const { FoundationMemoryBackend } = await import('./foundation-adapter');
    return class extends FoundationMemoryBackend {
      constructor(config) {
        super({
          ...config,
          storageType: 'database',
          databaseType: 'sqlite',
        });
      }
    };
  }
  async loadJSONBBackend() {
    // LanceDB backend using Foundation's database access (closest to JSONB)
    const { FoundationMemoryBackend } = await import('./foundation-adapter');
    return class extends FoundationMemoryBackend {
      constructor(config) {
        super({
          ...config,
          storageType: 'database',
          databaseType: 'lancedb',
        });
      }
    };
  }
}
// Export singleton instance
export const memoryBackendFactory = MemoryBackendFactory.getInstance();
// Export factory class for testing
export default MemoryBackendFactory;
