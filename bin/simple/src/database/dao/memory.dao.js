import { BaseDao } from '../base.dao.ts';
export class MemoryDao extends BaseDao {
    memoryStore = new Map();
    keyStore = new Map();
    ttlTimers = new Map();
    accessCount = 0;
    hitCount = 0;
    missCount = 0;
    evictionCount = 0;
    maxSize;
    defaultTTL;
    cleanupInterval;
    cleanupTimer;
    constructor(adapter, logger, tableName, entitySchema, options) {
        super(adapter, logger, tableName, entitySchema);
        this.maxSize = options?.maxSize || 1000;
        this.defaultTTL = options?.ttlDefault || 3600;
        this.cleanupInterval = options?.cleanupInterval || 60000;
        this.startCleanupTimer();
    }
    async setTTL(id, ttlSeconds) {
        this.logger.debug(`Setting TTL for entity ${id}: ${ttlSeconds} seconds`);
        const key = this.getEntityKey(id);
        const entry = this.memoryStore.get(key);
        if (!entry) {
            throw new Error(`Entity with ID ${id} not found in memory`);
        }
        const oldTimer = this.ttlTimers.get(key);
        if (oldTimer) {
            clearTimeout(oldTimer);
        }
        entry.ttl = ttlSeconds;
        entry.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        const timer = setTimeout(() => {
            this.expireEntity(key);
        }, ttlSeconds * 1000);
        this.ttlTimers.set(key, timer);
        this.logger.debug(`TTL set for entity ${id}, expires at: ${entry.expiresAt}`);
    }
    async getTTL(id) {
        const key = this.getEntityKey(id);
        const entry = this.memoryStore.get(key);
        if (!(entry && entry.expiresAt)) {
            return null;
        }
        const remainingMs = entry.expiresAt.getTime() - Date.now();
        return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
    }
    async cache(key, value, ttlSeconds) {
        this.logger.debug(`Caching value with key: ${key}`, { ttlSeconds });
        await this.ensureSpace();
        const entry = {
            value,
            createdAt: new Date(),
            accessedAt: new Date(),
            ...(ttlSeconds !== undefined && { ttl: ttlSeconds }),
            ...(ttlSeconds && {
                expiresAt: new Date(Date.now() + ttlSeconds * 1000),
            }),
        };
        this.keyStore.set(key, entry);
        if (ttlSeconds) {
            const timer = setTimeout(() => {
                this.expireKey(key);
            }, ttlSeconds * 1000);
            this.ttlTimers.set(key, timer);
        }
        this.logger.debug(`Cached value with key: ${key}`);
    }
    async getCached(key) {
        this.accessCount++;
        const entry = this.keyStore.get(key);
        if (!entry) {
            this.missCount++;
            return null;
        }
        if (entry.expiresAt && entry.expiresAt <= new Date()) {
            this.expireKey(key);
            this.missCount++;
            return null;
        }
        entry.accessedAt = new Date();
        this.hitCount++;
        this.logger.debug(`Cache hit for key: ${key}`);
        return entry.value;
    }
    async clearCache(pattern) {
        let clearedCount = 0;
        if (pattern) {
            const regex = new RegExp(pattern);
            const keysToDelete = [];
            for (const key of this.keyStore.keys()) {
                if (regex.test(key)) {
                    keysToDelete.push(key);
                }
            }
            for (const key of keysToDelete) {
                this.keyStore.delete(key);
                const timer = this.ttlTimers.get(key);
                if (timer) {
                    clearTimeout(timer);
                    this.ttlTimers.delete(key);
                }
                clearedCount++;
            }
            this.logger.debug(`Cleared cache with pattern '${pattern}': ${clearedCount} entries`);
        }
        else {
            clearedCount = this.keyStore.size;
            this.keyStore.clear();
            for (const timer of this.ttlTimers.values()) {
                clearTimeout(timer);
            }
            this.ttlTimers.clear();
            this.logger.debug(`Cleared entire cache: ${clearedCount} entries`);
        }
        return clearedCount;
    }
    async getMemoryStats() {
        const totalEntries = this.memoryStore.size + this.keyStore.size;
        const estimatedMemoryUsage = this.estimateMemoryUsage();
        return {
            totalMemory: estimatedMemoryUsage,
            usedMemory: estimatedMemoryUsage,
            freeMemory: Math.max(0, this.maxSize - totalEntries) * 1024,
            hitRate: this.accessCount > 0 ? (this.hitCount / this.accessCount) * 100 : 0,
            missRate: this.accessCount > 0 ? (this.missCount / this.accessCount) * 100 : 0,
            evictions: this.evictionCount,
        };
    }
    async findById(id) {
        this.accessCount++;
        const key = this.getEntityKey(id);
        const entry = this.memoryStore.get(key);
        if (!entry) {
            this.missCount++;
            const result = await super.findById(id);
            if (result) {
                await this.storeInMemory(id, result);
            }
            return result;
        }
        if (entry.expiresAt && entry.expiresAt <= new Date()) {
            this.expireEntity(key);
            this.missCount++;
            const result = await super.findById(id);
            if (result) {
                await this.storeInMemory(id, result);
            }
            return result;
        }
        entry.accessedAt = new Date();
        this.hitCount++;
        this.logger.debug(`Memory hit for entity: ${id}`);
        return entry.value;
    }
    async create(entity) {
        const created = await super.create(entity);
        await this.storeInMemory(created.id, created, this.defaultTTL);
        return created;
    }
    async update(id, updates) {
        const updated = await super.update(id, updates);
        await this.storeInMemory(id, updated, this.defaultTTL);
        return updated;
    }
    async delete(id) {
        const deleted = await super.delete(id);
        if (deleted) {
            const key = this.getEntityKey(id);
            this.memoryStore.delete(key);
            const timer = this.ttlTimers.get(key);
            if (timer) {
                clearTimeout(timer);
                this.ttlTimers.delete(key);
            }
        }
        return deleted;
    }
    mapRowToEntity(row) {
        return row;
    }
    mapEntityToRow(entity) {
        return entity;
    }
    async executeCustomQuery(customQuery) {
        if (customQuery.type === 'memory') {
            const query = customQuery.query;
            if (query.operation === 'get_stats') {
                const stats = await this.getMemoryStats();
                return stats;
            }
            if (query.operation === 'clear_cache') {
                const cleared = await this.clearCache(query.pattern);
                return { cleared };
            }
            if (query.operation === 'set_ttl') {
                await this.setTTL(query.id, query.ttl);
                return { success: true };
            }
        }
        return super.executeCustomQuery(customQuery);
    }
    getEntityKey(id) {
        return `entity:${this.tableName}:${id}`;
    }
    async storeInMemory(id, entity, ttlSeconds) {
        await this.ensureSpace();
        const key = this.getEntityKey(id);
        const ttl = ttlSeconds || this.defaultTTL;
        const entry = {
            value: entity,
            createdAt: new Date(),
            accessedAt: new Date(),
            ttl,
            expiresAt: new Date(Date.now() + ttl * 1000),
        };
        this.memoryStore.set(key, entry);
        const timer = setTimeout(() => {
            this.expireEntity(key);
        }, ttl * 1000);
        this.ttlTimers.set(key, timer);
    }
    async ensureSpace() {
        const totalEntries = this.memoryStore.size + this.keyStore.size;
        if (totalEntries >= this.maxSize) {
            await this.evictLRU();
        }
    }
    async evictLRU() {
        const allEntries = [];
        for (const [key, entry] of this.memoryStore.entries()) {
            allEntries.push({ key, entry, store: 'memory' });
        }
        for (const [key, entry] of this.keyStore.entries()) {
            allEntries.push({ key, entry, store: 'key' });
        }
        allEntries.sort((a, b) => a.entry.accessedAt.getTime() - b.entry.accessedAt.getTime());
        const evictCount = Math.ceil(allEntries.length * 0.25);
        for (let i = 0; i < evictCount && i < allEntries.length; i++) {
            const entry = allEntries[i];
            if (!entry)
                continue;
            const { key, store } = entry;
            if (store === 'memory') {
                this.memoryStore.delete(key);
            }
            else {
                this.keyStore.delete(key);
            }
            const timer = this.ttlTimers.get(key);
            if (timer) {
                clearTimeout(timer);
                this.ttlTimers.delete(key);
            }
            this.evictionCount++;
        }
        this.logger.debug(`Evicted ${evictCount} LRU entries`);
    }
    expireEntity(key) {
        this.memoryStore.delete(key);
        const timer = this.ttlTimers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.ttlTimers.delete(key);
        }
        this.logger.debug(`Expired entity: ${key}`);
    }
    expireKey(key) {
        this.keyStore.delete(key);
        const timer = this.ttlTimers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.ttlTimers.delete(key);
        }
        this.logger.debug(`Expired cache key: ${key}`);
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.performCleanup();
        }, this.cleanupInterval);
    }
    performCleanup() {
        const now = new Date();
        const expiredKeys = [];
        for (const [key, entry] of this.memoryStore.entries()) {
            if (entry.expiresAt && entry.expiresAt <= now) {
                expiredKeys.push(key);
            }
        }
        for (const [key, entry] of this.keyStore.entries()) {
            if (entry.expiresAt && entry.expiresAt <= now) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.memoryStore.delete(key);
            this.keyStore.delete(key);
            const timer = this.ttlTimers.get(key);
            if (timer) {
                clearTimeout(timer);
                this.ttlTimers.delete(key);
            }
        }
        if (expiredKeys.length > 0) {
            this.logger.debug(`Cleaned up ${expiredKeys.length} expired entries`);
        }
    }
    estimateMemoryUsage() {
        let totalSize = 0;
        for (const entry of this.memoryStore.values()) {
            totalSize += JSON.stringify(entry.value).length * 2;
            totalSize += 200;
        }
        for (const entry of this.keyStore.values()) {
            totalSize += JSON.stringify(entry.value).length * 2;
            totalSize += 200;
        }
        return totalSize;
    }
    async shutdown() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        for (const timer of this.ttlTimers.values()) {
            clearTimeout(timer);
        }
        this.memoryStore.clear();
        this.keyStore.clear();
        this.ttlTimers.clear();
        this.logger.debug('Memory repository shutdown completed');
    }
}
//# sourceMappingURL=memory.dao.js.map