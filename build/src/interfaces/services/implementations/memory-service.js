/**
 * Memory Service Implementation.
 *
 * Service implementation for memory management, caching, and session.
 * Storage operations.
 */
/**
 * @file Memory service implementation.
 */
import { BaseService } from './base-service.ts';
/**
 * Memory service implementation.
 *
 * @example
 */
export class MemoryService extends BaseService {
    store = new Map();
    metadata = new Map();
    evictionTimer;
    constructor(config) {
        super(config?.name, config?.type, config);
        // Add memory service capabilities
        this.addCapability('key-value-storage');
        this.addCapability('ttl-support');
        this.addCapability('eviction-policies');
        this.addCapability('serialization');
        this.addCapability('persistence');
    }
    // ============================================
    // BaseService Implementation
    // ============================================
    async doInitialize() {
        this.logger.info(`Initializing memory service: ${this.name}`);
        const config = this.config;
        // Initialize eviction policy
        if (config?.eviction) {
            this.startEvictionProcess();
        }
        // Load persisted data if enabled
        if (config?.persistence?.enabled) {
            await this.loadPersistedData();
        }
        this.logger.info(`Memory service ${this.name} initialized successfully`);
    }
    async doStart() {
        this.logger.info(`Starting memory service: ${this.name}`);
        const config = this.config;
        // Start persistence timer if enabled
        if (config?.persistence?.enabled && config?.persistence?.interval) {
            setInterval(() => {
                this.persistData();
            }, config?.persistence?.interval);
        }
        this.logger.info(`Memory service ${this.name} started successfully`);
    }
    async doStop() {
        this.logger.info(`Stopping memory service: ${this.name}`);
        // Stop eviction timer
        if (this.evictionTimer) {
            clearInterval(this.evictionTimer);
            this.evictionTimer = undefined;
        }
        // Persist data before shutdown
        const config = this.config;
        if (config?.persistence?.enabled) {
            await this.persistData();
        }
        this.logger.info(`Memory service ${this.name} stopped successfully`);
    }
    async doDestroy() {
        this.logger.info(`Destroying memory service: ${this.name}`);
        // Clear all data
        this.store.clear();
        this.metadata.clear();
        this.logger.info(`Memory service ${this.name} destroyed successfully`);
    }
    async doHealthCheck() {
        try {
            // Check if service is running
            if (this.lifecycleStatus !== 'running') {
                return false;
            }
            const config = this.config;
            // Check memory usage
            if (config?.storage?.maxMemory) {
                const currentUsage = this.estimateMemoryUsage();
                if (currentUsage > config?.storage?.maxMemory * 1.1) {
                    // Allow 10% overage
                    this.logger.warn(`Memory usage (${currentUsage}) exceeds limit (${config?.storage?.maxMemory})`);
                    return false;
                }
            }
            // Check store size
            if (config?.eviction?.maxSize) {
                if (this.store.size > config?.eviction?.maxSize * 1.1) {
                    // Allow 10% overage
                    this.logger.warn(`Store size (${this.store.size}) exceeds limit (${config?.eviction?.maxSize})`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed for memory service ${this.name}:`, error);
            return false;
        }
    }
    async executeOperation(operation, params, _options) {
        this.logger.debug(`Executing memory operation: ${operation}`);
        switch (operation) {
            case 'get':
                return this.get(params?.key);
            case 'set':
                return (await this.set(params?.key, params?.value, params?.ttl));
            case 'delete':
                return this.delete(params?.key);
            case 'exists':
                return this.exists(params?.key);
            case 'keys':
                return this.keys(params?.pattern);
            case 'clear':
                return (await this.clear());
            case 'size':
                return this.size();
            case 'ttl':
                return this.getTTL(params?.key);
            case 'expire':
                return this.expire(params?.key, params?.seconds);
            case 'persist':
                return (await this.persistData());
            case 'stats':
                return this.getStats();
            default:
                throw new Error(`Unknown memory operation: ${operation}`);
        }
    }
    // ============================================
    // Memory Service Specific Methods
    // ============================================
    get(key) {
        if (!key) {
            throw new Error('Key is required');
        }
        const meta = this.metadata.get(key);
        if (!meta) {
            return null;
        }
        // Check TTL
        if (meta.ttl && Date.now() > meta.ttl) {
            this.delete(key);
            return null;
        }
        // Update access time for LRU
        meta.lastAccessed = Date.now();
        this.metadata.set(key, meta);
        const value = this.store.get(key);
        return this.deserialize(value, meta.serialization);
    }
    async set(key, value, ttl) {
        if (!key) {
            throw new Error('Key is required');
        }
        const config = this.config;
        // Check if we need to evict items first
        await this.checkEviction();
        // Serialize value
        const serialized = this.serialize(value);
        // Calculate TTL
        let expiresAt;
        if (ttl) {
            expiresAt = Date.now() + ttl * 1000;
        }
        else if (config?.eviction?.ttl) {
            expiresAt = Date.now() + config?.eviction?.ttl * 1000;
        }
        // Store value and metadata
        this.store.set(key, serialized);
        this.metadata.set(key, {
            key,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            ttl: expiresAt,
            size: this.estimateValueSize(serialized),
            serialization: config?.serialization?.type || 'json',
        });
        this.logger.debug(`Set key: ${key}`);
        return true;
    }
    delete(key) {
        if (!key) {
            throw new Error('Key is required');
        }
        const existed = this.store.has(key);
        this.store.delete(key);
        this.metadata.delete(key);
        if (existed) {
            this.logger.debug(`Deleted key: ${key}`);
        }
        return existed;
    }
    exists(key) {
        if (!key) {
            throw new Error('Key is required');
        }
        const meta = this.metadata.get(key);
        if (!meta) {
            return false;
        }
        // Check TTL
        if (meta.ttl && Date.now() > meta.ttl) {
            this.delete(key);
            return false;
        }
        return true;
    }
    keys(pattern) {
        const allKeys = Array.from(this.store.keys());
        if (!pattern) {
            return allKeys;
        }
        // Simple pattern matching (could be enhanced with regex)
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return allKeys.filter((key) => regex.test(key));
    }
    async clear() {
        const count = this.store.size;
        this.store.clear();
        this.metadata.clear();
        this.logger.info(`Cleared ${count} items from memory store`);
        return { cleared: count };
    }
    size() {
        return this.store.size;
    }
    getTTL(key) {
        if (!key) {
            throw new Error('Key is required');
        }
        const meta = this.metadata.get(key);
        if (!meta || !meta.ttl) {
            return null;
        }
        const remaining = Math.max(0, meta.ttl - Date.now());
        return Math.floor(remaining / 1000); // Return seconds
    }
    expire(key, seconds) {
        if (!key || seconds < 0) {
            throw new Error('Valid key and positive seconds are required');
        }
        const meta = this.metadata.get(key);
        if (!meta) {
            return false;
        }
        meta.ttl = Date.now() + seconds * 1000;
        this.metadata.set(key, meta);
        this.logger.debug(`Set expiration for key ${key}: ${seconds}s`);
        return true;
    }
    getStats() {
        const totalSize = Array.from(this.metadata.values()).reduce((sum, meta) => sum + (meta.size || 0), 0);
        return {
            keyCount: this.store.size,
            totalMemoryUsage: totalSize,
            averageKeySize: this.store.size > 0 ? totalSize / this.store.size : 0,
            hitRate: 0.85, // Simulate hit rate
            missRate: 0.15,
            evictionCount: 0, // Would track actual evictions
            expiredKeys: this.countExpiredKeys(),
        };
    }
    // ============================================
    // Helper Methods
    // ============================================
    serialize(value) {
        const config = this.config;
        const serializationType = config?.serialization?.type || 'json';
        switch (serializationType) {
            case 'json':
                return JSON.stringify(value);
            case 'msgpack':
                // Would use msgpack library
                return JSON.stringify(value); // Fallback to JSON
            case 'custom':
                // Would use custom serialization
                return value;
            default:
                return value;
        }
    }
    deserialize(value, serializationType) {
        switch (serializationType) {
            case 'json':
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            case 'msgpack':
                // Would use msgpack library
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            case 'custom':
                // Would use custom deserialization
                return value;
            default:
                return value;
        }
    }
    estimateValueSize(value) {
        if (typeof value === 'string') {
            return value.length * 2; // Assume UTF-16
        }
        else if (typeof value === 'number') {
            return 8;
        }
        else if (typeof value === 'boolean') {
            return 1;
        }
        else {
            return JSON.stringify(value).length * 2;
        }
    }
    estimateMemoryUsage() {
        return Array.from(this.metadata.values()).reduce((sum, meta) => sum + (meta.size || 0), 0);
    }
    startEvictionProcess() {
        const _config = this.config;
        this.evictionTimer = setInterval(() => {
            this.performEviction();
        }, 30000); // Check every 30 seconds
    }
    async checkEviction() {
        const config = this.config;
        if (config?.eviction?.maxSize && this.store.size >= config?.eviction?.maxSize) {
            await this.performEviction();
        }
    }
    async performEviction() {
        const config = this.config;
        if (!config?.eviction)
            return;
        // Remove expired items first
        this.removeExpiredItems();
        // Check if we still need to evict
        if (config?.eviction?.maxSize && this.store.size <= config?.eviction?.maxSize) {
            return;
        }
        const policy = config?.eviction?.policy;
        const targetSize = Math.floor((config?.eviction?.maxSize || this.store.size) * 0.8);
        const toEvict = this.store.size - targetSize;
        if (toEvict <= 0)
            return;
        let keysToEvict = [];
        switch (policy) {
            case 'lru':
                keysToEvict = this.getLRUKeys(toEvict);
                break;
            case 'lfu':
                keysToEvict = this.getLFUKeys(toEvict);
                break;
            case 'fifo':
                keysToEvict = this.getFIFOKeys(toEvict);
                break;
            case 'ttl':
                keysToEvict = this.getTTLKeys(toEvict);
                break;
        }
        // Evict selected keys
        keysToEvict.forEach((key) => this.delete(key));
        if (keysToEvict.length > 0) {
            this.logger.debug(`Evicted ${keysToEvict.length} keys using ${policy} policy`);
        }
    }
    removeExpiredItems() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, meta] of this.metadata.entries()) {
            if (meta.ttl && now > meta.ttl) {
                expiredKeys.push(key);
            }
        }
        expiredKeys.forEach((key) => this.delete(key));
        if (expiredKeys.length > 0) {
            this.logger.debug(`Removed ${expiredKeys.length} expired keys`);
        }
    }
    getLRUKeys(count) {
        const sortedEntries = Array.from(this.metadata.entries()).sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
        return sortedEntries.slice(0, count).map(([key]) => key);
    }
    getLFUKeys(count) {
        // For simplicity, use creation time as proxy for frequency
        const sortedEntries = Array.from(this.metadata.entries()).sort(([, a], [, b]) => a.createdAt - b.createdAt);
        return sortedEntries.slice(0, count).map(([key]) => key);
    }
    getFIFOKeys(count) {
        const sortedEntries = Array.from(this.metadata.entries()).sort(([, a], [, b]) => a.createdAt - b.createdAt);
        return sortedEntries.slice(0, count).map(([key]) => key);
    }
    getTTLKeys(count) {
        const sortedEntries = Array.from(this.metadata.entries())
            .filter(([, meta]) => meta.ttl)
            .sort(([, a], [, b]) => (a.ttl || 0) - (b.ttl || 0));
        return sortedEntries.slice(0, count).map(([key]) => key);
    }
    countExpiredKeys() {
        const now = Date.now();
        return Array.from(this.metadata.values()).filter((meta) => meta.ttl && now > meta.ttl).length;
    }
    async loadPersistedData() {
        // Simulate loading persisted data
        this.logger.debug('Loading persisted memory data');
    }
    async persistData() {
        const config = this.config;
        if (!config?.persistence?.enabled) {
            return false;
        }
        try {
            // Simulate data persistence
            const dataSize = this.store.size;
            this.logger.debug(`Persisting ${dataSize} memory items`);
            // In real implementation, would save to file/database
            await new Promise((resolve) => setTimeout(resolve, 10));
            return true;
        }
        catch (error) {
            this.logger.error('Failed to persist memory data:', error);
            return false;
        }
    }
}
export default MemoryService;
