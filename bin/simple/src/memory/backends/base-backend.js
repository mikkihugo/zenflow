import { EventEmitter } from 'node:events';
export class BaseMemoryBackend extends EventEmitter {
    config;
    isInitialized = false;
    stats;
    constructor(config) {
        super();
        this.config = config;
        this.stats = {
            totalEntries: 0,
            totalSize: 0,
            cacheHits: 0,
            cacheMisses: 0,
            lastAccessed: 0,
            created: Date.now(),
            modified: Date.now(),
        };
    }
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
            this.isInitialized = true;
            this.emit('initialized');
        }
    }
    async getStats() {
        return { ...this.stats };
    }
    getStatsSync() {
        return { ...this.stats };
    }
    getConfig() {
        return { ...this.config };
    }
    isReady() {
        return this.isInitialized;
    }
    updateStats(operation, size) {
        this.stats.lastAccessed = Date.now();
        this.stats.modified = Date.now();
        if (operation === 'write') {
            this.stats.totalEntries++;
            if (size) {
                this.stats.totalSize += size;
            }
        }
        else if (operation === 'delete') {
            this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
            if (size) {
                this.stats.totalSize = Math.max(0, this.stats.totalSize - size);
            }
        }
        else if (operation === 'read') {
            this.stats.cacheHits++;
        }
    }
    createMemoryEntry(key, value, metadata) {
        return {
            key,
            value,
            metadata: metadata || {},
            timestamp: Date.now(),
            size: this.calculateSize(value),
            type: this.detectType(value),
        };
    }
    calculateSize(value) {
        try {
            return JSON.stringify(value).length;
        }
        catch {
            return 0;
        }
    }
    detectType(value) {
        if (value === null)
            return 'null';
        if (Array.isArray(value))
            return 'array';
        if (value instanceof Date)
            return 'date';
        if (value instanceof Buffer)
            return 'buffer';
        return typeof value;
    }
    validateKey(key) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (key.length > 255) {
            throw new Error('Key cannot exceed 255 characters');
        }
    }
    matchesPattern(key, pattern) {
        if (!pattern)
            return true;
        const regex = new RegExp(pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')
            .replace(/\[([^\]]*)\]/g, '[$1]'));
        return regex.test(key);
    }
    emitError(error, operation) {
        this.emit('error', {
            error,
            operation,
            timestamp: Date.now(),
            backend: this.constructor.name,
        });
    }
    emitOperation(operation, key, success) {
        this.emit('operation', {
            operation,
            key,
            success,
            timestamp: Date.now(),
            backend: this.constructor.name,
        });
    }
    async healthCheck() {
        const start = Date.now();
        let healthy = false;
        try {
            await this.ensureInitialized();
            const testKey = `__health_check_${Date.now()}`;
            await this.store(testKey, { test: true });
            const retrieved = await this.retrieve(testKey);
            await this.delete(testKey);
            healthy = retrieved !== null && retrieved.test === true;
        }
        catch (error) {
            healthy = false;
            this.emitError(error, 'healthCheck');
        }
        return {
            healthy,
            latency: Date.now() - start,
            capabilities: this.getCapabilities(),
            stats: await this.getStats(),
        };
    }
    async batchStore(entries) {
        for (const entry of entries) {
            await this.store(entry.key, entry.value);
        }
    }
    async batchRetrieve(keys) {
        const results = {};
        for (const key of keys) {
            results?.[key] = await this.retrieve(key);
        }
        return results;
    }
    async batchDelete(keys) {
        const results = {};
        for (const key of keys) {
            results?.[key] = await this.delete(key);
        }
        return results;
    }
    serialize(value) {
        try {
            return JSON.stringify(value);
        }
        catch (error) {
            throw new Error(`Failed to serialize value: ${error.message}`);
        }
    }
    deserialize(value) {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            throw new Error(`Failed to deserialize value: ${error.message}`);
        }
    }
    async search(pattern, _namespace) {
        const results = await this.list(pattern);
        const resultMap = {};
        for (const key of results) {
            const value = await this.retrieve(key);
            if (value !== null) {
                resultMap[key] = value;
            }
        }
        return resultMap;
    }
    async size() {
        return this.stats.totalEntries;
    }
    async health() {
        try {
            const healthStatus = await this.healthCheck();
            return healthStatus.healthy;
        }
        catch (error) {
            this.emitError(error instanceof Error ? error : new Error(String(error)), 'health');
            return false;
        }
    }
    async cleanup() {
        this.removeAllListeners();
        this.isInitialized = false;
    }
}
export default BaseMemoryBackend;
//# sourceMappingURL=base-backend.js.map