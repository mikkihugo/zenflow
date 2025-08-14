import { Logger } from '../core/logger.ts';
const logger = new Logger('src-knowledge-knowledge-storage');
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import SQLiteBackend from './knowledge-cache-backends/sqlite-backend.ts';
export class FACTStorageSystem extends EventEmitter {
    config;
    backend;
    memoryCache = new Map();
    cleanupTimer;
    stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        entriesCreated: 0,
        entriesDeleted: 0,
    };
    constructor(config = {}) {
        super();
        this.config = {
            backend: 'sqlite',
            maxMemoryCacheSize: 1000,
            defaultTTL: 24 * 60 * 60 * 1000,
            cleanupInterval: 60 * 60 * 1000,
            maxEntryAge: 7 * 24 * 60 * 60 * 1000,
            ...config,
        };
        this.backend = this.createBackend();
    }
    async initialize() {
        try {
            await this.backend.initialize();
            this.startCleanupTimer();
            this.emit('storageInitialized', {
                backend: this.config.backend,
                cacheSize: this.config.maxMemoryCacheSize,
            });
        }
        catch (error) {
            logger.error('❌ FACT Storage initialization failed:', error);
            throw error;
        }
    }
    async storeKnowledge(entry) {
        const id = this.generateEntryId(entry.query, entry.metadata['type']);
        const timestamp = Date.now();
        const knowledgeEntry = {
            id,
            timestamp,
            accessCount: 0,
            lastAccessed: timestamp,
            ...entry,
        };
        try {
            await this.storeInMemory(knowledgeEntry);
            await this.backend.store(knowledgeEntry);
            this.stats.entriesCreated++;
            this.emit('knowledgeStored', { id, type: entry.metadata['type'] });
            return id;
        }
        catch (error) {
            logger.error(`❌ Failed to store FACT knowledge: ${id}`, error);
            throw error;
        }
    }
    async getKnowledge(id) {
        const memoryEntry = this.memoryCache.get(id);
        if (memoryEntry && this.isEntryValid(memoryEntry)) {
            memoryEntry.accessCount++;
            memoryEntry.lastAccessed = Date.now();
            this.stats.hits++;
            return memoryEntry;
        }
        try {
            const backendEntry = await this.backend.get(id);
            if (backendEntry && this.isEntryValid(backendEntry)) {
                backendEntry.accessCount++;
                backendEntry.lastAccessed = Date.now();
                await this.storeInMemory(backendEntry);
                await this.backend.store(backendEntry);
                this.stats.hits++;
                return backendEntry;
            }
        }
        catch (error) {
            logger.error(`Failed to load FACT knowledge from backend: ${id}`, error);
        }
        this.stats.misses++;
        return null;
    }
    async searchKnowledge(query) {
        try {
            const results = await this.backend.search(query);
            for (const result of results?.slice(0, 10)) {
                if (!this.memoryCache.has(result?.id)) {
                    await this.storeInMemory(result);
                }
            }
            return results;
        }
        catch (error) {
            logger.error('FACT knowledge search failed:', error);
            return [];
        }
    }
    async getStorageStats() {
        const memoryEntries = this.memoryCache.size;
        const backendStats = await this.backend.getStats();
        let totalMemorySize = 0;
        for (const entry of this.memoryCache.values()) {
            totalMemorySize += JSON.stringify(entry).length;
        }
        const totalRequests = this.stats.hits + this.stats.misses;
        const cacheHitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
        const domainCounts = new Map();
        for (const entry of this.memoryCache.values()) {
            for (const domain of entry.metadata.domains) {
                domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
            }
        }
        const topDomains = Array.from(domainCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([domain]) => domain);
        let storageHealth = 'excellent';
        if (cacheHitRate < 0.5)
            storageHealth = 'poor';
        else if (cacheHitRate < 0.7)
            storageHealth = 'fair';
        else if (cacheHitRate < 0.85)
            storageHealth = 'good';
        return {
            memoryEntries,
            persistentEntries: backendStats.persistentEntries || 0,
            totalMemorySize,
            cacheHitRate,
            oldestEntry: backendStats.oldestEntry || 0,
            newestEntry: backendStats.newestEntry || Date.now(),
            topDomains,
            storageHealth,
        };
    }
    async cleanup() {
        const now = Date.now();
        let memoryEvictions = 0;
        for (const [id, entry] of this.memoryCache.entries()) {
            if (!this.isEntryValid(entry, now)) {
                this.memoryCache.delete(id);
                memoryEvictions++;
            }
        }
        const backendDeletions = await this.backend.cleanup(this.config.maxEntryAge);
        this.stats.evictions += memoryEvictions;
        this.stats.entriesDeleted += backendDeletions;
        this.emit('cleanupCompleted', { memoryEvictions, backendDeletions });
    }
    async clearAll() {
        this.memoryCache.clear();
        await this.backend.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            entriesCreated: 0,
            entriesDeleted: 0,
        };
        this.emit('storageCleared');
    }
    async deleteKnowledge(id) {
        const wasInMemory = this.memoryCache.delete(id);
        const wasInBackend = await this.backend.delete(id);
        if (wasInMemory || wasInBackend) {
            this.stats.entriesDeleted++;
            this.emit('knowledgeDeleted', { id });
            return true;
        }
        return false;
    }
    createBackend() {
        switch (this.config.backend) {
            case 'sqlite':
                return new SQLiteBackend(this.config.backendConfig);
            case 'jsonb':
                throw new Error('JSONB backend not yet implemented');
            case 'file':
                throw new Error('File backend not yet implemented');
            case 'memory':
                throw new Error('Memory-only backend not yet implemented');
            default:
                throw new Error(`Unknown FACT storage backend: ${this.config.backend}`);
        }
    }
    generateEntryId(query, type) {
        const hash = crypto.createHash('sha256');
        hash.update(`${query}-${type}-${Date.now()}`);
        return hash.digest('hex').substring(0, 16);
    }
    async storeInMemory(entry) {
        if (this.memoryCache.size >= this.config.maxMemoryCacheSize) {
            await this.evictLeastRecentlyUsed();
        }
        this.memoryCache.set(entry.id, entry);
    }
    isEntryValid(entry, now = Date.now()) {
        return now - entry.timestamp < entry.ttl;
    }
    async evictLeastRecentlyUsed() {
        let oldestEntry = null;
        let oldestId = '';
        for (const [id, entry] of this.memoryCache.entries()) {
            if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
                oldestEntry = entry;
                oldestId = id;
            }
        }
        if (oldestEntry) {
            this.memoryCache.delete(oldestId);
            this.stats.evictions++;
        }
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup().catch((error) => {
                logger.error('Scheduled cleanup failed:', error);
            });
        }, this.config.cleanupInterval);
    }
    async shutdown() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        await this.cleanup();
        await this.backend.shutdown();
        this.memoryCache.clear();
        this.emit('storageShutdown');
    }
}
export default FACTStorageSystem;
//# sourceMappingURL=knowledge-storage.js.map