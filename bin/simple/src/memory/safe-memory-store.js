import { getLogger } from '../core/logger.ts';
const logger = getLogger('src-memory-safe-memory-store');
import { EventEmitter } from 'node:events';
import { isMemoryError, isMemoryNotFound, isMemorySuccess, } from '../utils/type-guards.ts';
export class SafeMemoryStore extends EventEmitter {
    store = new Map();
    metadata = new Map();
    ttlTimers = new Map();
    options;
    initialized = false;
    constructor(options = {}) {
        super();
        this.options = {
            namespace: options?.namespace ?? 'default',
            enableTTL: options?.enableTTL ?? true,
            defaultTTL: options?.defaultTTL ?? 3600000,
            maxSize: options?.maxSize ?? 10000,
            enableCompression: options?.enableCompression ?? false,
        };
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            this.startCleanupInterval();
            this.initialized = true;
            this.emit('initialized');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
            throw new Error(`Failed to initialize SafeMemoryStore: ${errorMessage}`);
        }
    }
    async storeData(key, data, ttl) {
        try {
            if (!this.initialized) {
                return this.createMemoryError(key, 'STORE_NOT_INITIALIZED', 'Memory store not initialized');
            }
            if (this.store.size >= this.options.maxSize) {
                return this.createMemoryError(key, 'STORE_FULL', 'Memory store has reached maximum capacity');
            }
            const fullKey = this.createKey(key);
            const now = new Date();
            this.store.set(fullKey, data);
            const existingMetadata = this.metadata.get(fullKey);
            const newMetadata = {
                created: existingMetadata?.created ?? now,
                updated: now,
                accessed: now,
                accessCount: (existingMetadata?.accessCount ?? 0) + 1,
                size: this.calculateSize(data),
                ttl: ttl ?? this.options.defaultTTL,
                tags: existingMetadata?.tags,
                compressed: this.options.enableCompression,
            };
            this.metadata.set(fullKey, newMetadata);
            if (this.options.enableTTL && newMetadata?.ttl) {
                this.setTTL(fullKey, newMetadata?.ttl);
            }
            this.emit('stored', { key: fullKey, size: newMetadata.size });
            return {
                found: true,
                data: undefined,
                key: fullKey,
                timestamp: now,
                ttl: newMetadata?.ttl,
                metadata: { operation: 'store', success: true },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
            return this.createMemoryError(key, 'STORE_FAILED', errorMessage);
        }
    }
    async retrieve(key) {
        try {
            if (!this.initialized) {
                return this.createMemoryError(key, 'STORE_NOT_INITIALIZED', 'Memory store not initialized');
            }
            const fullKey = this.createKey(key);
            if (!this.store.has(fullKey)) {
                return {
                    found: false,
                    key: fullKey,
                    reason: 'not_found',
                };
            }
            const data = this.store.get(fullKey);
            const metadata = this.metadata.get(fullKey);
            if (!metadata) {
                return this.createMemoryError(key, 'METADATA_MISSING', 'Metadata not found for key');
            }
            const now = new Date();
            metadata.accessed = now;
            metadata.accessCount++;
            this.metadata.set(fullKey, metadata);
            this.emit('accessed', {
                key: fullKey,
                accessCount: metadata?.accessCount,
            });
            return {
                found: true,
                data,
                key: fullKey,
                timestamp: metadata?.updated,
                ttl: metadata?.ttl,
                metadata: {
                    created: metadata?.created,
                    accessed: metadata?.accessed,
                    accessCount: metadata?.accessCount,
                    size: metadata.size,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown retrieval error';
            return this.createMemoryError(key, 'RETRIEVE_FAILED', errorMessage);
        }
    }
    async delete(key) {
        try {
            if (!this.initialized) {
                return this.createMemoryError(key, 'STORE_NOT_INITIALIZED', 'Memory store not initialized');
            }
            const fullKey = this.createKey(key);
            if (!this.store.has(fullKey)) {
                return {
                    found: false,
                    key: fullKey,
                    reason: 'not_found',
                };
            }
            const timer = this.ttlTimers.get(fullKey);
            if (timer) {
                clearTimeout(timer);
                this.ttlTimers.delete(fullKey);
            }
            const deleted = this.store.delete(fullKey);
            this.metadata.delete(fullKey);
            this.emit('deleted', { key: fullKey });
            return {
                found: true,
                data: deleted,
                key: fullKey,
                timestamp: new Date(),
                metadata: { operation: 'delete', success: true },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown deletion error';
            return this.createMemoryError(key, 'DELETE_FAILED', errorMessage);
        }
    }
    async exists(key) {
        try {
            const fullKey = this.createKey(key);
            const exists = this.store.has(fullKey);
            if (exists) {
                return {
                    found: true,
                    data: true,
                    key: fullKey,
                    timestamp: new Date(),
                    metadata: { operation: 'exists', result: true },
                };
            }
            return {
                found: false,
                key: fullKey,
                reason: 'not_found',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown existence check error';
            return this.createMemoryError(key, 'EXISTS_CHECK_FAILED', errorMessage);
        }
    }
    async getStats() {
        try {
            const entries = this.store.size;
            let totalSize = 0;
            let oldestEntry = null;
            let newestEntry = null;
            for (const metadata of this.metadata.values()) {
                totalSize += metadata.size;
                if (!oldestEntry || metadata?.created < oldestEntry) {
                    oldestEntry = metadata?.created;
                }
                if (!newestEntry || metadata?.created > newestEntry) {
                    newestEntry = metadata?.created;
                }
            }
            const stats = {
                entries,
                totalSize,
                averageSize: entries > 0 ? totalSize / entries : 0,
                oldestEntry,
                newestEntry,
            };
            return {
                found: true,
                data: stats,
                key: 'stats',
                timestamp: new Date(),
                metadata: { operation: 'stats' },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown stats error';
            return this.createMemoryError('stats', 'STATS_FAILED', errorMessage);
        }
    }
    async clear() {
        for (const timer of this.ttlTimers.values()) {
            clearTimeout(timer);
        }
        this.store.clear();
        this.metadata.clear();
        this.ttlTimers.clear();
        this.emit('cleared');
    }
    async shutdown() {
        await this.clear();
        this.initialized = false;
        this.emit('shutdown');
    }
    createKey(key) {
        return `${this.options.namespace}:${key}`;
    }
    createMemoryError(key, code, message) {
        return {
            found: false,
            error: {
                code,
                message,
                key: this.createKey(key),
            },
        };
    }
    calculateSize(data) {
        try {
            return JSON.stringify(data).length;
        }
        catch {
            return 0;
        }
    }
    setTTL(key, ttl) {
        const existingTimer = this.ttlTimers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const timer = setTimeout(() => {
            this.store.delete(key);
            this.metadata.delete(key);
            this.ttlTimers.delete(key);
            this.emit('expired', { key });
        }, ttl);
        this.ttlTimers.set(key, timer);
    }
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupExpiredEntries();
        }, 300000);
    }
    cleanupExpiredEntries() {
        const now = Date.now();
        for (const [key, metadata] of this.metadata.entries()) {
            if (metadata?.ttl && metadata?.updated?.getTime() + metadata?.ttl < now) {
                this.store.delete(key);
                this.metadata.delete(key);
                const timer = this.ttlTimers.get(key);
                if (timer) {
                    clearTimeout(timer);
                    this.ttlTimers.delete(key);
                }
                this.emit('expired', { key });
            }
        }
    }
}
export async function safeMemoryUsageExample() {
    const store = new SafeMemoryStore({ namespace: 'example' });
    await store.initialize();
    const storeResult = await store.storeData('user:123', {
        name: 'Alice',
        age: 30,
    });
    if (isMemorySuccess(storeResult)) {
    }
    else if (isMemoryError(storeResult)) {
        logger.error('❌ Storage failed:', storeResult?.error?.message);
    }
    const retrieveResult = await store.retrieve('user:123');
    if (isMemorySuccess(retrieveResult)) {
    }
    else if (isMemoryNotFound(retrieveResult)) {
    }
    else if (isMemoryError(retrieveResult)) {
        logger.error('Error retrieving user:', retrieveResult?.error?.message);
    }
    const existsResult = await store.exists('user:456');
    if (isMemorySuccess(existsResult)) {
    }
    else if (isMemoryNotFound(existsResult)) {
    }
    await store.shutdown();
}
//# sourceMappingURL=safe-memory-store.js.map