import { BaseMemoryBackend } from './base-backend.ts';
const backendRegistry = new Map();
export class MemoryBackendFactory {
    static instance;
    backends = new Map();
    defaultConfig = {
        maxSize: 100 * 1024 * 1024,
        ttl: 3600000,
        compression: false,
        encryption: false,
    };
    constructor() {
        this.registerDefaultBackends();
    }
    static getInstance() {
        if (!MemoryBackendFactory.instance) {
            MemoryBackendFactory.instance = new MemoryBackendFactory();
        }
        return MemoryBackendFactory.instance;
    }
    async createBackend(type, config = {}, instanceId) {
        const fullConfig = this.mergeConfig(config);
        const id = instanceId || `${type}-${Date.now()}`;
        if (this.backends.has(id)) {
            return this.backends.get(id);
        }
        const BackendClass = await this.getBackendClass(type);
        const backend = new BackendClass(fullConfig);
        await backend.initialize();
        this.backends.set(id, backend);
        backend.once('close', () => {
            this.backends.delete(id);
        });
        return backend;
    }
    getBackend(instanceId) {
        return this.backends.get(instanceId) || null;
    }
    listBackends() {
        return Array.from(this.backends.entries()).map(([id, backend]) => ({
            id,
            type: backend.constructor.name,
            config: backend.getConfig(),
        }));
    }
    async closeBackend(instanceId) {
        const backend = this.backends.get(instanceId);
        if (backend) {
            await backend.close();
            this.backends.delete(instanceId);
            return true;
        }
        return false;
    }
    async closeAllBackends() {
        const closePromises = Array.from(this.backends.values()).map((backend) => backend.close());
        await Promise.all(closePromises);
        this.backends.clear();
    }
    async getBackendCapabilities(type) {
        const BackendClass = await this.getBackendClass(type);
        const tempBackend = new BackendClass(this.defaultConfig);
        return tempBackend.getCapabilities();
    }
    registerBackend(type, loader) {
        backendRegistry.set(type, loader);
    }
    isBackendSupported(type) {
        return backendRegistry.has(type);
    }
    getSupportedBackends() {
        return Array.from(backendRegistry.keys());
    }
    async createAutoBackend(config = {}) {
        const type = this.detectOptimalBackend(config);
        return this.createBackend(type, config);
    }
    static async createBackend(type, config = {}) {
        return MemoryBackendFactory.getInstance().createBackend(type, config);
    }
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
    registerDefaultBackends() {
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
    async loadMemoryBackend() {
        class MemoryBackend extends BaseMemoryBackend {
            dataStore = new Map();
            async initialize() {
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
        class FileBackend extends BaseMemoryBackend {
            async initialize() {
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
                return ['default'];
            }
        }
        return FileBackend;
    }
    async loadSQLiteBackend() {
        class SQLiteBackend extends BaseMemoryBackend {
            async initialize() {
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
                return ['default'];
            }
        }
        return SQLiteBackend;
    }
    async loadJSONBBackend() {
        class JSONBBackend extends BaseMemoryBackend {
            async initialize() {
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
                return ['default'];
            }
        }
        return JSONBBackend;
    }
}
export const memoryBackendFactory = MemoryBackendFactory.getInstance();
export default MemoryBackendFactory;
//# sourceMappingURL=factory.js.map