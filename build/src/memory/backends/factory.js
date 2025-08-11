/**
 * Memory Backend Factory Pattern Implementation.
 *
 * Factory for creating and managing memory storage backends.
 * Supports multiple backend types with configuration-driven instantiation.
 */
/**
 * @file Memory management: factory.
 */
import { BaseMemoryBackend } from './base-backend.ts';
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
        const closePromises = Array.from(this.backends.values()).map((backend) => backend.close());
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
        for (const [id, backend] of this.backends.entries()) {
            try {
                results[id] = await backend.healthCheck();
            }
            catch (error) {
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
        }
        catch (error) {
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
        if (config?.persistent) {
            return config?.maxSize && config?.maxSize > 50 * 1024 * 1024 ? 'sqlite' : 'file';
        }
        if (config?.maxSize && config?.maxSize > 100 * 1024 * 1024) {
            return 'sqlite';
        }
        return 'memory';
    }
    // Backend loaders (stub implementations for now)
    async loadMemoryBackend() {
        // In-memory backend implementation (stub)
        class MemoryBackend extends BaseMemoryBackend {
            dataStore = new Map();
            async initialize() {
                // No initialization needed for memory backend
            }
            async store(key, value, namespace) {
                this.validateKey(key);
                const finalKey = namespace ? `${namespace}:${key}` : key;
                this.dataStore.set(finalKey, this.createMemoryEntry(finalKey, value));
                this.updateStats('write', this.calculateSize(value));
            }
            async set(key, value) {
                return this.store(key, value);
            }
            async get(key) {
                return this.retrieve(key);
            }
            async retrieve(key) {
                this.validateKey(key);
                const entry = this.dataStore.get(key);
                this.updateStats('read');
                return entry ? entry.value : null;
            }
            async delete(key) {
                this.validateKey(key);
                const existed = this.dataStore.has(key);
                if (existed) {
                    const entry = this.dataStore.get(key);
                    this.dataStore.delete(key);
                    this.updateStats('delete', entry ? this.calculateSize(entry.value) : 0);
                }
                return existed;
            }
            async list(pattern) {
                return Array.from(this.dataStore.keys()).filter((key) => this.matchesPattern(key, pattern));
            }
            async search() {
                // Basic search implementation
                return Array.from(this.dataStore.values());
            }
            async clear() {
                this.dataStore.clear();
                this.stats.totalEntries = 0;
                this.stats.totalSize = 0;
            }
            async close() {
                await this.clear();
                await this.cleanup();
            }
            getCapabilities() {
                return {
                    persistent: false,
                    searchable: false,
                    transactional: false,
                    concurrent: true,
                    compression: false,
                    encryption: false,
                };
            }
            async listNamespaces() {
                // Simple implementation - could be enhanced
                const namespaces = new Set();
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
    async loadFileBackend() {
        // File-based backend implementation (stub)
        class FileBackend extends BaseMemoryBackend {
            async initialize() {
                // File backend initialization
            }
            async store(_key, _value, _namespace) {
                throw new Error('FileBackend not implemented');
            }
            async set(key, value) {
                return this.store(key, value);
            }
            async get(key) {
                return this.retrieve(key);
            }
            async retrieve(_key) {
                throw new Error('FileBackend not implemented');
            }
            async delete(_key) {
                throw new Error('FileBackend not implemented');
            }
            async list() {
                throw new Error('FileBackend not implemented');
            }
            async search() {
                throw new Error('FileBackend not implemented');
            }
            async clear() {
                throw new Error('FileBackend not implemented');
            }
            async close() {
                throw new Error('FileBackend not implemented');
            }
            getCapabilities() {
                return {
                    persistent: true,
                    searchable: false,
                    transactional: false,
                    concurrent: false,
                    compression: true,
                    encryption: true,
                };
            }
            async listNamespaces() {
                // Simple implementation for file backend - return default namespace
                // In a full implementation, this could scan the file directory structure
                return ['default'];
            }
        }
        return FileBackend;
    }
    async loadSQLiteBackend() {
        // SQLite backend implementation (stub)
        class SQLiteBackend extends BaseMemoryBackend {
            async initialize() {
                // SQLite backend initialization
            }
            async store(_key, _value, _namespace) {
                throw new Error('SQLiteBackend not implemented');
            }
            async set(key, value) {
                return this.store(key, value);
            }
            async get(key) {
                return this.retrieve(key);
            }
            async retrieve() {
                throw new Error('SQLiteBackend not implemented');
            }
            async delete() {
                throw new Error('SQLiteBackend not implemented');
            }
            async list() {
                throw new Error('SQLiteBackend not implemented');
            }
            async search() {
                throw new Error('SQLiteBackend not implemented');
            }
            async clear() {
                throw new Error('SQLiteBackend not implemented');
            }
            async close() {
                throw new Error('SQLiteBackend not implemented');
            }
            getCapabilities() {
                return {
                    persistent: true,
                    searchable: true,
                    transactional: true,
                    concurrent: true,
                    compression: false,
                    encryption: false,
                };
            }
            async listNamespaces() {
                // Simple implementation for SQLite backend - return default namespace
                // In a full implementation, this could query the database for distinct namespaces
                return ['default'];
            }
        }
        return SQLiteBackend;
    }
    async loadJSONBBackend() {
        // JSONB backend implementation (stub)
        class JSONBBackend extends BaseMemoryBackend {
            async initialize() {
                // JSONB backend initialization
            }
            async store(_key, _value, _namespace) {
                throw new Error('JSONBBackend not implemented');
            }
            async set(key, value) {
                return this.store(key, value);
            }
            async get(key) {
                return this.retrieve(key);
            }
            async retrieve() {
                throw new Error('JSONBBackend not implemented');
            }
            async delete() {
                throw new Error('JSONBBackend not implemented');
            }
            async list() {
                throw new Error('JSONBBackend not implemented');
            }
            async search() {
                throw new Error('JSONBBackend not implemented');
            }
            async clear() {
                throw new Error('JSONBBackend not implemented');
            }
            async close() {
                throw new Error('JSONBBackend not implemented');
            }
            getCapabilities() {
                return {
                    persistent: true,
                    searchable: true,
                    transactional: true,
                    concurrent: true,
                    compression: false,
                    encryption: false,
                };
            }
            async listNamespaces() {
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
