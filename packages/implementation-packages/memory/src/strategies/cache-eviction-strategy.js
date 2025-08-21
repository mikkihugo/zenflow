/**
 * Cache Eviction Strategy - Advanced Cache Management
 *
 * Provides sophisticated cache eviction algorithms including LRU, LFU, adaptive
 * strategies with intelligent priority management and performance optimization.
 */
import { EventEmitter } from 'eventemitter3';
import { getLogger, recordMetric, TelemetryManager } from '@claude-zen/foundation';
export class CacheEvictionStrategy extends EventEmitter {
    logger;
    config;
    cache = new Map();
    accessOrder = new Map(); // LRU tracking
    frequencyMap = new Map(); // LFU tracking
    cleanupTimer;
    telemetry;
    metrics;
    accessCounter = 0;
    constructor(config) {
        super();
        this.config = config;
        this.logger = getLogger('CacheEvictionStrategy');
        this.telemetry = new TelemetryManager({
            serviceName: 'cache-eviction',
            enableTracing: true,
            enableMetrics: true
        });
        this.metrics = {
            totalEvictions: 0,
            evictionsByReason: {
                size_limit: 0,
                memory_limit: 0,
                ttl_expired: 0,
                lru_eviction: 0,
                lfu_eviction: 0,
                manual_eviction: 0,
                priority_eviction: 0
            },
            averageEvictionTime: 0,
            memoryReclaimed: 0
        };
        if (config.enabled && config.cleanupInterval > 0) {
            this.startPeriodicCleanup();
        }
    }
    async initialize() {
        try {
            await this.telemetry.initialize();
            this.logger.info('Cache eviction strategy initialized', {
                algorithm: this.config.algorithm,
                maxSize: this.config.maxSize,
                maxMemory: this.config.maxMemory
            });
            recordMetric('cache_eviction_initialized', 1);
        }
        catch (error) {
            this.logger.error('Failed to initialize cache eviction strategy:', error);
            throw error;
        }
    }
    set(key, value, options = {}) {
        if (!this.config.enabled) {
            return false;
        }
        const now = Date.now();
        const size = options.size || this.estimateSize(value);
        const priority = options.priority || 1;
        const ttl = options.ttl || this.config.ttl;
        // Check if we need to evict before adding
        if (!this.canAccommodate(size)) {
            this.performEviction(size);
        }
        // Create cache entry
        const entry = {
            key,
            value,
            size,
            accessCount: 1,
            frequency: 1,
            lastAccessed: now,
            createdAt: now,
            expiresAt: ttl > 0 ? now + ttl : undefined,
            priority,
            metadata: options.metadata || {}
        };
        // Update tracking structures
        this.cache.set(key, entry);
        this.accessOrder.set(key, ++this.accessCounter);
        this.frequencyMap.set(key, 1);
        this.emit('entryAdded', { key, entry });
        recordMetric('cache_entry_added', 1, { algorithm: this.config.algorithm });
        return true;
    }
    get(key) {
        if (!this.config.enabled) {
            return undefined;
        }
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }
        // Check TTL expiration
        if (this.isExpired(entry)) {
            this.evictEntry(key, 'ttl_expired');
            return undefined;
        }
        // Update access tracking
        this.updateAccessTracking(entry);
        recordMetric('cache_hit', 1, { algorithm: this.config.algorithm });
        return entry.value;
    }
    delete(key) {
        if (!this.config.enabled) {
            return false;
        }
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        this.evictEntry(key, 'manual_eviction');
        return true;
    }
    has(key) {
        if (!this.config.enabled) {
            return false;
        }
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        // Check TTL expiration
        if (this.isExpired(entry)) {
            this.evictEntry(key, 'ttl_expired');
            return false;
        }
        return true;
    }
    clear() {
        if (!this.config.enabled) {
            return;
        }
        const clearedCount = this.cache.size;
        this.cache.clear();
        this.accessOrder.clear();
        this.frequencyMap.clear();
        this.emit('cacheCleared', { clearedCount });
        recordMetric('cache_cleared', clearedCount);
        this.logger.info(`Cache cleared, removed ${clearedCount} entries`);
    }
    canAccommodate(size) {
        // Check size limit
        if (this.cache.size >= this.config.maxSize) {
            return false;
        }
        // Check memory limit
        const currentMemory = this.getCurrentMemoryUsage();
        if (currentMemory + size > this.config.maxMemory) {
            return false;
        }
        return true;
    }
    performEviction(requiredSpace) {
        const startTime = Date.now();
        let evicted = 0;
        let spaceReclaimed = 0;
        // First, remove expired entries
        const expiredKeys = this.findExpiredEntries();
        for (const key of expiredKeys) {
            const entry = this.cache.get(key);
            if (entry) {
                spaceReclaimed += entry.size;
                this.evictEntry(key, 'ttl_expired');
                evicted++;
            }
        }
        // If we still need space, use the configured algorithm
        if (spaceReclaimed < requiredSpace) {
            const keysToEvict = this.selectEvictionCandidates(requiredSpace - spaceReclaimed);
            for (const key of keysToEvict) {
                const entry = this.cache.get(key);
                if (entry) {
                    spaceReclaimed += entry.size;
                    this.evictEntry(key, this.getEvictionReason());
                    evicted++;
                    if (spaceReclaimed >= requiredSpace) {
                        break;
                    }
                }
            }
        }
        const evictionTime = Date.now() - startTime;
        this.metrics.averageEvictionTime = (this.metrics.averageEvictionTime + evictionTime) / 2;
        this.metrics.memoryReclaimed += spaceReclaimed;
        this.emit('evictionCompleted', {
            evicted,
            spaceReclaimed,
            evictionTime
        });
        recordMetric('cache_eviction_completed', evicted, {
            algorithm: this.config.algorithm,
            spaceReclaimed,
            evictionTime
        });
        this.logger.debug(`Eviction completed: ${evicted} entries, ${spaceReclaimed} bytes reclaimed`);
    }
    selectEvictionCandidates(requiredSpace) {
        const candidates = [];
        let estimatedSpace = 0;
        switch (this.config.algorithm) {
            case 'lru':
                candidates.push(...this.selectLRUCandidates());
                break;
            case 'lfu':
                candidates.push(...this.selectLFUCandidates());
                break;
            case 'fifo':
                candidates.push(...this.selectFIFOCandidates());
                break;
            case 'ttl':
                candidates.push(...this.selectTTLCandidates());
                break;
            case 'random':
                candidates.push(...this.selectRandomCandidates());
                break;
            case 'adaptive':
                candidates.push(...this.selectAdaptiveCandidates());
                break;
        }
        // Filter candidates to get enough space, considering priority
        const prioritizedCandidates = this.prioritizeEvictionCandidates(candidates);
        const finalCandidates = [];
        for (const key of prioritizedCandidates) {
            const entry = this.cache.get(key);
            if (entry && !this.config.preservePriority || entry.priority <= 1) {
                finalCandidates.push(key);
                estimatedSpace += entry.size;
                if (estimatedSpace >= requiredSpace) {
                    break;
                }
            }
        }
        return finalCandidates.slice(0, this.config.batchSize);
    }
    selectLRUCandidates() {
        return Array.from(this.accessOrder.entries())
            .sort(([, a], [, b]) => a - b) // Sort by access order (oldest first)
            .map(([key]) => key);
    }
    selectLFUCandidates() {
        return Array.from(this.frequencyMap.entries())
            .sort(([, a], [, b]) => a - b) // Sort by frequency (least frequent first)
            .map(([key]) => key);
    }
    selectFIFOCandidates() {
        return Array.from(this.cache.values())
            .sort((a, b) => a.createdAt - b.createdAt) // Sort by creation time (oldest first)
            .map(entry => entry.key);
    }
    selectTTLCandidates() {
        const now = Date.now();
        return Array.from(this.cache.values())
            .filter(entry => entry.expiresAt)
            .sort((a, b) => (a.expiresAt - now) - (b.expiresAt - now)) // Sort by time to expiration
            .map(entry => entry.key);
    }
    selectRandomCandidates() {
        const keys = Array.from(this.cache.keys());
        return keys.sort(() => Math.random() - 0.5); // Random shuffle
    }
    selectAdaptiveCandidates() {
        // Adaptive algorithm combines multiple factors
        const now = Date.now();
        const entries = Array.from(this.cache.values());
        return entries
            .map(entry => ({
            key: entry.key,
            score: this.calculateAdaptiveScore(entry, now)
        }))
            .sort((a, b) => a.score - b.score) // Lower score = better eviction candidate
            .map(item => item.key);
    }
    calculateAdaptiveScore(entry, now) {
        let score = 0;
        // Factor 1: Recency (LRU component)
        const timeSinceAccess = now - entry.lastAccessed;
        score += timeSinceAccess / 1000; // Convert to seconds
        // Factor 2: Frequency (LFU component)
        score += 1000 / (entry.frequency + 1); // Inverse frequency
        // Factor 3: Size (prefer evicting larger items)
        score += entry.size / 1000; // Size in KB
        // Factor 4: Priority (prefer keeping high priority items)
        score += 1000 / (entry.priority + 1); // Inverse priority
        // Factor 5: TTL proximity (if applicable)
        if (entry.expiresAt) {
            const timeToExpiry = entry.expiresAt - now;
            score += Math.max(0, 1000 - timeToExpiry / 1000); // Prefer items close to expiry
        }
        return score;
    }
    prioritizeEvictionCandidates(candidates) {
        if (!this.config.preservePriority) {
            return candidates;
        }
        return candidates.sort((a, b) => {
            const entryA = this.cache.get(a);
            const entryB = this.cache.get(b);
            if (!entryA || !entryB)
                return 0;
            // Lower priority gets evicted first
            return entryA.priority - entryB.priority;
        });
    }
    findExpiredEntries() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry, now)) {
                expiredKeys.push(key);
            }
        }
        return expiredKeys;
    }
    isExpired(entry, now = Date.now()) {
        return entry.expiresAt ? now > entry.expiresAt : false;
    }
    evictEntry(key, reason) {
        const entry = this.cache.get(key);
        if (!entry)
            return;
        // Remove from all tracking structures
        this.cache.delete(key);
        this.accessOrder.delete(key);
        this.frequencyMap.delete(key);
        // Update metrics
        this.metrics.totalEvictions++;
        this.metrics.evictionsByReason[reason]++;
        this.emit('entryEvicted', { key, entry, reason });
        recordMetric('cache_entry_evicted', 1, {
            reason,
            algorithm: this.config.algorithm
        });
    }
    updateAccessTracking(entry) {
        const now = Date.now();
        // Update entry
        entry.lastAccessed = now;
        entry.accessCount++;
        // Update LRU tracking
        this.accessOrder.set(entry.key, ++this.accessCounter);
        // Update LFU tracking
        const currentFreq = this.frequencyMap.get(entry.key) || 0;
        entry.frequency = currentFreq + 1;
        this.frequencyMap.set(entry.key, entry.frequency);
    }
    getCurrentMemoryUsage() {
        let totalSize = 0;
        for (const entry of this.cache.values()) {
            totalSize += entry.size;
        }
        return totalSize;
    }
    estimateSize(value) {
        try {
            return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
        }
        catch {
            return 1000; // Default size for unstringifiable values
        }
    }
    getEvictionReason() {
        if (this.cache.size >= this.config.maxSize) {
            return 'size_limit';
        }
        if (this.getCurrentMemoryUsage() >= this.config.maxMemory) {
            return 'memory_limit';
        }
        switch (this.config.algorithm) {
            case 'lru': return 'lru_eviction';
            case 'lfu': return 'lfu_eviction';
            default: return 'size_limit';
        }
    }
    startPeriodicCleanup() {
        this.cleanupTimer = setInterval(() => {
            this.performCleanup();
        }, this.config.cleanupInterval);
    }
    performCleanup() {
        const expiredKeys = this.findExpiredEntries();
        if (expiredKeys.length > 0) {
            for (const key of expiredKeys) {
                this.evictEntry(key, 'ttl_expired');
            }
            this.logger.debug(`Periodic cleanup: removed ${expiredKeys.length} expired entries`);
            recordMetric('cache_periodic_cleanup', expiredKeys.length);
        }
    }
    // Public methods
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            memoryUsage: this.getCurrentMemoryUsage(),
            maxMemory: this.config.maxMemory,
            algorithm: this.config.algorithm,
            metrics: { ...this.metrics }
        };
    }
    getKeys() {
        return Array.from(this.cache.keys());
    }
    getEntries() {
        return Array.from(this.cache.values());
    }
    forceEviction(count = 1) {
        if (!this.config.enabled) {
            return 0;
        }
        const candidates = this.selectEvictionCandidates(0).slice(0, count);
        for (const key of candidates) {
            this.evictEntry(key, 'manual_eviction');
        }
        return candidates.length;
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Restart cleanup timer if interval changed
        if (newConfig.cleanupInterval !== undefined) {
            if (this.cleanupTimer) {
                clearInterval(this.cleanupTimer);
            }
            if (this.config.enabled && this.config.cleanupInterval > 0) {
                this.startPeriodicCleanup();
            }
        }
        this.logger.info('Cache eviction configuration updated', newConfig);
    }
    async shutdown() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.clear();
        this.logger.info('Cache eviction strategy shut down');
    }
}
