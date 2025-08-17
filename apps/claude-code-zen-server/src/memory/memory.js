/**
 * @file Session-based memory storage with pluggable backends.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('Memory');
import { EventEmitter } from 'node:events';
import { MemoryBackendFactory as BackendFactory } from './backends/factory';
export class SessionMemoryStore extends EventEmitter {
    backend = null;
    initialized = false;
    sessions = new Map();
    options;
    cache = new Map();
    cacheKeys = [];
    // TODO: Use dependency injection for backend creation
    // Instead of using BackendFactory.create(), inject the backend via constructor
    // Example:
    // constructor(
    //   @inject(MEMORY_TOKENS.Backend) private backend: BackendInterface,
    //   @inject(MEMORY_TOKENS.Config) options: SessionMemoryStoreOptions
    // ) {
    constructor(options) {
        super();
        this.options = {
            backendConfig: options?.['backendConfig'],
            enableCache: options?.['enableCache'] ?? true,
            cacheSize: options?.['cacheSize'] ?? 1000,
            cacheTTL: options?.['cacheTTL'] ?? 300000, // 5 minutes
            enableVectorStorage: options?.['enableVectorStorage'] ?? false,
            vectorDimensions: options?.['vectorDimensions'] ?? 512,
        };
        // Backend will be created during initialization
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Create backend instance
            this.backend = await BackendFactory.createBackend(this.options.backendConfig.type, this.options.backendConfig);
            await this.backend.initialize();
            await this.loadFromBackend();
            this.initialized = true;
            this.emit('initialized');
        }
        catch (error) {
            logger.error('❌ Session memory store initialization failed:', error);
            throw error;
        }
    }
    async store(sessionIdOrKey, keyOrData, dataOrOptions, options) {
        // Handle both overloads: (sessionId, key, data, options) and (key, data, options)
        let sessionId;
        let key;
        let data;
        let storeOptions;
        if (typeof keyOrData === 'string') {
            // (sessionId, key, data, options) overload
            sessionId = sessionIdOrKey;
            key = keyOrData;
            data = dataOrOptions;
            storeOptions = options;
        }
        else {
            // (key, data, options) overload - use default session
            sessionId = 'default';
            key = sessionIdOrKey;
            data = keyOrData;
            storeOptions = dataOrOptions;
        }
        this.ensureInitialized();
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = {
                sessionId,
                data: {},
                metadata: {
                    created: Date.now(),
                    updated: Date.now(),
                    accessed: Date.now(),
                    size: 0,
                    tags: storeOptions?.tags || [],
                    priority: storeOptions?.priority || 'medium',
                    ttl: storeOptions?.ttl,
                },
                vectors: new Map(),
            };
            this.sessions.set(sessionId, session);
        }
        session.data[key] = data;
        session.metadata.updated = Date.now();
        session.metadata.accessed = Date.now();
        if (storeOptions?.vector && this.options.enableVectorStorage) {
            session.vectors?.set(key, storeOptions?.vector);
        }
        await this.backend?.store(sessionId, session, 'session');
        if (this.options.enableCache) {
            this.updateCache(sessionId, key, data);
        }
    }
    async retrieve(sessionIdOrKey, key) {
        // Handle both overloads
        const actualSessionId = key ? sessionIdOrKey : 'default';
        const actualKey = key || sessionIdOrKey;
        this.ensureInitialized();
        if (this.options.enableCache) {
            const cached = this.getCachedData(actualSessionId, actualKey);
            if (cached !== null) {
                return cached;
            }
        }
        const session = await this.retrieveSession(actualSessionId);
        return session?.data[actualKey] ?? null;
    }
    async retrieveSession(sessionId) {
        this.ensureInitialized();
        if (this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }
        const sessionData = await this.backend?.retrieve(sessionId, 'session');
        if (sessionData) {
            const session = sessionData;
            this.sessions.set(sessionId, session);
            return session;
        }
        return null;
    }
    async delete(sessionIdOrKey, key) {
        // Handle both overloads
        const actualSessionId = key ? sessionIdOrKey : 'default';
        const actualKey = key || sessionIdOrKey;
        this.ensureInitialized();
        const session = this.sessions.get(actualSessionId);
        if (!(session && actualKey in session.data)) {
            return false;
        }
        delete session.data[actualKey];
        session.vectors?.delete(actualKey);
        session.metadata.updated = Date.now();
        // Update backend
        await this.backend?.store(actualSessionId, session, 'session');
        // Remove from cache
        const cacheKey = `${actualSessionId}:${actualKey}`;
        this.cache.delete(cacheKey);
        return true;
    }
    async getStats() {
        this.ensureInitialized();
        let totalEntries = 0;
        let totalSize = 0;
        let lastModified = 0;
        for (const session of this.sessions.values()) {
            totalEntries += Object.keys(session.data).length;
            totalSize += JSON.stringify(session.data).length;
            lastModified = Math.max(lastModified, session.metadata.updated);
        }
        return {
            entries: totalEntries,
            size: totalSize,
            lastModified,
            namespaces: this.sessions.size,
        };
    }
    async shutdown() {
        if (this.initialized) {
            await this.saveToBackend();
            this.initialized = false;
            this.emit('shutdown');
        }
    }
    async loadFromBackend() {
        const namespaces = await this.backend?.listNamespaces();
        for (const namespace of namespaces) {
            if (namespace === 'session') {
                const sessionKeys = await this.backend?.search('*', 'session');
                for (const key in sessionKeys) {
                    const sessionData = await this.backend?.retrieve(key, 'session');
                    if (sessionData) {
                        this.sessions.set(key, sessionData);
                    }
                }
            }
        }
    }
    async saveToBackend() {
        for (const [sessionId, session] of this.sessions.entries()) {
            await this.backend?.store(sessionId, session, 'session');
        }
    }
    updateCache(sessionId, key, data) {
        const cacheKey = `${sessionId}:${key}`;
        if (this.cache.size >= this.options.cacheSize) {
            const oldestKey = this.cacheKeys.shift();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        this.cache.set(cacheKey, { key: cacheKey, data, timestamp: Date.now() });
        this.cacheKeys.push(cacheKey);
    }
    getCachedData(sessionId, key) {
        const cacheKey = `${sessionId}:${key}`;
        const entry = this.cache.get(cacheKey);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > this.options.cacheTTL) {
            this.cache.delete(cacheKey);
            return null;
        }
        return entry.data;
    }
    ensureInitialized() {
        if (!(this.initialized && this.backend)) {
            throw new Error('Session memory store not initialized. Call initialize() first.');
        }
    }
}
export class MemoryManager {
    store;
    constructor(options) {
        this.store = new SessionMemoryStore(options);
    }
    async initialize() {
        await this.store.initialize();
    }
    async storeData(key, data) {
        return this.store.store('default', key, data);
    }
    async retrieve(key) {
        return this.store.retrieve('default', key);
    }
    async shutdown() {
        await this.store.shutdown();
    }
}
//# sourceMappingURL=memory.js.map