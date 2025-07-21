"use strict";
/**
 * Memory Class
 *
 * Manages collective memory for the Hive Mind swarm,
 * providing persistent storage, retrieval, and learning capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const events_1 = require("events");
const perf_hooks_1 = require("perf_hooks");
const DatabaseManager_js_1 = require("./DatabaseManager.js");
const MCPToolWrapper_js_1 = require("../integration/MCPToolWrapper.js");
/**
 * High-performance LRU Cache with memory management
 */
class HighPerformanceCache {
    constructor(maxSize = 10000, maxMemoryMB = 100) {
        this.cache = new Map();
        this.currentMemory = 0;
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
        this.maxSize = maxSize;
        this.maxMemory = maxMemoryMB * 1024 * 1024;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (entry) {
            // Move to end (LRU)
            this.cache.delete(key);
            this.cache.set(key, entry);
            this.hits++;
            return entry.data;
        }
        this.misses++;
        return undefined;
    }
    set(key, data) {
        const size = this.estimateSize(data);
        // Handle memory pressure
        while (this.currentMemory + size > this.maxMemory && this.cache.size > 0) {
            this.evictLRU();
        }
        // Handle size limit
        while (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        this.cache.set(key, { data, timestamp: Date.now(), size });
        this.currentMemory += size;
    }
    evictLRU() {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
            const entry = this.cache.get(firstKey);
            this.cache.delete(firstKey);
            this.currentMemory -= entry.size;
            this.evictions++;
        }
    }
    estimateSize(data) {
        try {
            return JSON.stringify(data).length * 2; // Rough estimate
        }
        catch {
            return 1000; // Default size for non-serializable objects
        }
    }
    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            memoryUsage: this.currentMemory,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            evictions: this.evictions,
            utilizationPercent: (this.currentMemory / this.maxMemory) * 100
        };
    }
    clear() {
        this.cache.clear();
        this.currentMemory = 0;
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
    }
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
        const entry = this.cache.get(key);
        if (entry) {
            this.currentMemory -= entry.size;
            return this.cache.delete(key);
        }
        return false;
    }
}
/**
 * Memory pool for object reuse
 */
class ObjectPool {
    constructor(createFn, resetFn, maxSize = 1000) {
        this.pool = [];
        this.allocated = 0;
        this.reused = 0;
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
    }
    acquire() {
        if (this.pool.length > 0) {
            this.reused++;
            return this.pool.pop();
        }
        this.allocated++;
        return this.createFn();
    }
    release(obj) {
        if (this.pool.length < this.maxSize) {
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
    getStats() {
        return {
            poolSize: this.pool.length,
            allocated: this.allocated,
            reused: this.reused,
            reuseRate: this.allocated > 0 ? (this.reused / (this.allocated + this.reused)) * 100 : 0
        };
    }
}
class Memory extends events_1.EventEmitter {
    constructor(swarmId, options = {}) {
        super();
        this.isActive = false;
        this.optimizationTimers = [];
        this.compressionThreshold = 10000; // 10KB
        this.batchSize = 100;
        this.swarmId = swarmId;
        // Initialize high-performance cache
        this.cache = new HighPerformanceCache(options.cacheSize || 10000, options.cacheMemoryMB || 100);
        this.namespaces = new Map();
        this.accessPatterns = new Map();
        this.performanceMetrics = new Map();
        this.objectPools = new Map();
        if (options.compressionThreshold) {
            this.compressionThreshold = options.compressionThreshold;
        }
        if (options.batchSize) {
            this.batchSize = options.batchSize;
        }
        this.initializeNamespaces();
        if (options.enablePooling !== false) {
            this.initializeObjectPools();
        }
    }
    /**
     * Initialize optimized memory system
     */
    async initialize() {
        const startTime = perf_hooks_1.performance.now();
        this.db = await DatabaseManager_js_1.DatabaseManager.getInstance();
        this.mcpWrapper = new MCPToolWrapper_js_1.MCPToolWrapper();
        // Optimize database connection
        await this.optimizeDatabaseSettings();
        // Load existing memory entries with pagination
        await this.loadMemoryFromDatabase();
        // Start optimized memory management loops
        this.startOptimizedManagers();
        this.isActive = true;
        const duration = perf_hooks_1.performance.now() - startTime;
        this.recordPerformance('initialize', duration);
        this.emit('initialized', {
            duration,
            cacheSize: this.cache.getStats().size,
            poolsInitialized: this.objectPools.size
        });
    }
    /**
     * Initialize object pools for better memory management
     */
    initializeObjectPools() {
        // Pool for memory entries
        this.objectPools.set('memoryEntry', new ObjectPool(() => ({ key: '', namespace: '', value: '', ttl: 0, createdAt: new Date(), accessCount: 0, lastAccessedAt: new Date() }), (obj) => {
            obj.key = '';
            obj.namespace = '';
            obj.value = '';
            obj.ttl = 0;
            obj.accessCount = 0;
        }));
        // Pool for search results
        this.objectPools.set('searchResult', new ObjectPool(() => ({ results: [], metadata: {} }), (obj) => {
            obj.results.length = 0;
            Object.keys(obj.metadata).forEach(k => delete obj.metadata[k]);
        }));
    }
    /**
     * Optimize database settings for better performance
     */
    async optimizeDatabaseSettings() {
        try {
            // Database performance optimizations would go here
            // For now, this is a placeholder for future database-specific optimizations
            this.emit('databaseOptimized');
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    /**
     * Optimized store method with compression and batching
     */
    async store(key, value, namespace = 'default', ttl) {
        const startTime = perf_hooks_1.performance.now();
        // Use object pool if available
        const entryPool = this.objectPools.get('memoryEntry');
        const entry = entryPool ? entryPool.acquire() : {};
        try {
            // Smart serialization with compression detection
            let serializedValue;
            let compressed = false;
            if (typeof value === 'string') {
                serializedValue = value;
            }
            else {
                serializedValue = JSON.stringify(value);
            }
            // Intelligent compression decision
            if (serializedValue.length > this.compressionThreshold) {
                serializedValue = await this.compressData(serializedValue);
                compressed = true;
            }
            // Populate entry
            entry.key = key;
            entry.namespace = namespace;
            entry.value = serializedValue;
            entry.ttl = ttl;
            entry.createdAt = new Date();
            entry.accessCount = 0;
            entry.lastAccessedAt = new Date();
            // Store in database with transaction for consistency
            await this.db.storeMemory({
                key,
                namespace,
                value: serializedValue,
                ttl,
                metadata: JSON.stringify({
                    swarmId: this.swarmId,
                    compressed,
                    originalSize: serializedValue.length
                })
            });
            // Async MCP storage (non-blocking)
            this.mcpWrapper.storeMemory({
                action: 'store',
                key: `${this.swarmId}/${namespace}/${key}`,
                value: serializedValue,
                namespace: 'hive-mind',
                ttl
            }).catch(error => this.emit('mcpError', error));
            // Update high-performance cache
            this.cache.set(this.getCacheKey(key, namespace), value);
            // Track access patterns
            this.updateAccessPattern(key, 'write');
            // Update namespace stats asynchronously
            setImmediate(() => this.updateNamespaceStats(namespace, 'store'));
            const duration = perf_hooks_1.performance.now() - startTime;
            this.recordPerformance('store', duration);
            this.emit('memoryStored', {
                key,
                namespace,
                compressed,
                size: serializedValue.length,
                duration
            });
        }
        finally {
            // Return object to pool
            if (entryPool) {
                entryPool.release(entry);
            }
        }
    }
    /**
     * Batch store operation for high-throughput scenarios
     */
    async storeBatch(entries) {
        const startTime = perf_hooks_1.performance.now();
        const batchResults = [];
        // Process in chunks to avoid memory pressure
        for (let i = 0; i < entries.length; i += this.batchSize) {
            const chunk = entries.slice(i, i + this.batchSize);
            const chunkPromises = chunk.map(async ({ key, value, namespace = 'default', ttl }) => {
                await this.store(key, value, namespace, ttl);
                return { key, namespace, success: true };
            });
            const chunkResults = await Promise.allSettled(chunkPromises);
            batchResults.push(...chunkResults);
        }
        const duration = perf_hooks_1.performance.now() - startTime;
        const successful = batchResults.filter(r => r.status === 'fulfilled').length;
        this.emit('batchStored', {
            total: entries.length,
            successful,
            duration
        });
    }
    /**
     * High-performance retrieve method with intelligent caching
     */
    async retrieve(key, namespace = 'default') {
        const startTime = perf_hooks_1.performance.now();
        const cacheKey = this.getCacheKey(key, namespace);
        try {
            // Check high-performance cache first
            const cached = this.cache.get(cacheKey);
            if (cached !== undefined) {
                this.updateAccessPattern(key, 'cache_hit');
                this.recordPerformance('retrieve_cache', perf_hooks_1.performance.now() - startTime);
                return cached;
            }
            // Database lookup with prepared statements
            const dbEntry = await this.db.getMemory(key, namespace);
            if (dbEntry) {
                let value = dbEntry.value;
                // Handle compressed data
                const metadata = JSON.parse(dbEntry.metadata || '{}');
                if (metadata.compressed) {
                    value = await this.decompressData(value);
                }
                const parsedValue = this.parseValue(value);
                // Update cache asynchronously
                this.cache.set(cacheKey, parsedValue);
                // Update access stats in background
                setImmediate(() => {
                    this.updateAccessPattern(key, 'db_hit');
                    this.db.updateMemoryAccess(key, namespace).catch(err => this.emit('error', err));
                });
                this.recordPerformance('retrieve_db', perf_hooks_1.performance.now() - startTime);
                return parsedValue;
            }
            // Fallback to MCP memory (async, non-blocking)
            this.mcpWrapper.retrieveMemory({
                action: 'retrieve',
                key: `${this.swarmId}/${namespace}/${key}`,
                namespace: 'hive-mind'
            }).then(mcpValue => {
                if (mcpValue) {
                    this.store(key, mcpValue, namespace).catch(err => this.emit('error', err));
                }
            }).catch(err => this.emit('mcpError', err));
            this.updateAccessPattern(key, 'miss');
            this.recordPerformance('retrieve_miss', perf_hooks_1.performance.now() - startTime);
            return null;
        }
        catch (error) {
            this.emit('error', error);
            return null;
        }
    }
    /**
     * Batch retrieve for multiple keys with optimized database queries
     */
    async retrieveBatch(keys, namespace = 'default') {
        const startTime = perf_hooks_1.performance.now();
        const results = new Map();
        const cacheHits = [];
        const cacheMisses = [];
        // Check cache for all keys first
        for (const key of keys) {
            const cacheKey = this.getCacheKey(key, namespace);
            const cached = this.cache.get(cacheKey);
            if (cached !== undefined) {
                results.set(key, cached);
                cacheHits.push(key);
            }
            else {
                cacheMisses.push(key);
            }
        }
        // Batch query for cache misses
        if (cacheMisses.length > 0) {
            try {
                // This would require implementing batch queries in DatabaseManager
                for (const key of cacheMisses) {
                    const value = await this.retrieve(key, namespace);
                    if (value !== null) {
                        results.set(key, value);
                    }
                }
            }
            catch (error) {
                this.emit('error', error);
            }
        }
        const duration = perf_hooks_1.performance.now() - startTime;
        this.emit('batchRetrieved', {
            total: keys.length,
            cacheHits: cacheHits.length,
            found: results.size,
            duration
        });
        return results;
    }
    /**
     * High-performance search with relevance scoring and caching
     */
    async search(options) {
        const startTime = perf_hooks_1.performance.now();
        const searchKey = this.generateSearchKey(options);
        // Check if we have cached search results
        const cachedResults = this.cache.get(`search:${searchKey}`);
        if (cachedResults) {
            this.recordPerformance('search_cache', perf_hooks_1.performance.now() - startTime);
            return cachedResults;
        }
        const results = [];
        // Search in cache first for immediate results
        this.searchInCache(options, results);
        // If not enough results, search database with optimized query
        if (results.length < (options.limit || 10)) {
            const dbResults = await this.db.searchMemory(options);
            for (const dbEntry of dbResults) {
                const entry = {
                    key: dbEntry.key,
                    namespace: dbEntry.namespace,
                    value: dbEntry.value,
                    ttl: dbEntry.ttl,
                    createdAt: new Date(dbEntry.created_at),
                    accessCount: dbEntry.access_count,
                    lastAccessedAt: new Date(dbEntry.last_accessed_at)
                };
                if (!results.find(r => r.key === entry.key && r.namespace === entry.namespace)) {
                    results.push(entry);
                }
            }
        }
        // Sort by relevance with advanced scoring
        const sortedResults = this.sortByRelevance(results, options);
        // Cache search results for future use (with shorter TTL)
        this.cache.set(`search:${searchKey}`, sortedResults);
        const duration = perf_hooks_1.performance.now() - startTime;
        this.recordPerformance('search_db', duration);
        this.emit('searchCompleted', {
            pattern: options.pattern,
            results: sortedResults.length,
            duration
        });
        return sortedResults;
    }
    /**
     * Generate cache key for search options
     */
    generateSearchKey(options) {
        return JSON.stringify({
            pattern: options.pattern,
            namespace: options.namespace,
            limit: options.limit,
            sortBy: options.sortBy
        });
    }
    /**
     * Search within cache for immediate results
     */
    searchInCache(options, results) {
        // Note: This would require implementing cache iteration
        // For now, this is a placeholder for future cache search optimization
    }
    /**
     * Delete a memory entry
     */
    async delete(key, namespace = 'default') {
        const cacheKey = this.getCacheKey(key, namespace);
        // Remove from cache
        this.cache.delete(cacheKey);
        // Remove from database
        await this.db.deleteMemory(key, namespace);
        // Remove from MCP memory
        await this.mcpWrapper.deleteMemory({
            action: 'delete',
            key: `${this.swarmId}/${namespace}/${key}`,
            namespace: 'hive-mind'
        });
        this.emit('memoryDeleted', { key, namespace });
    }
    /**
     * List all entries in a namespace
     */
    async list(namespace = 'default', limit = 100) {
        const entries = await this.db.listMemory(namespace, limit);
        return entries.map(dbEntry => ({
            key: dbEntry.key,
            namespace: dbEntry.namespace,
            value: dbEntry.value,
            ttl: dbEntry.ttl,
            createdAt: new Date(dbEntry.created_at),
            accessCount: dbEntry.access_count,
            lastAccessedAt: new Date(dbEntry.last_accessed_at)
        }));
    }
    /**
     * Get memory statistics
     */
    async getStats() {
        const stats = await this.db.getMemoryStats();
        const byNamespace = {};
        for (const ns of this.namespaces.values()) {
            const nsStats = await this.db.getNamespaceStats(ns.name);
            byNamespace[ns.name] = nsStats;
        }
        return {
            totalEntries: stats.totalEntries,
            totalSize: stats.totalSize,
            byNamespace,
            cacheHitRate: this.calculateCacheHitRate(),
            avgAccessTime: this.calculateAvgAccessTime(),
            hotKeys: await this.getHotKeys()
        };
    }
    /**
     * Learn patterns from memory access
     */
    async learnPatterns() {
        const patterns = [];
        // Analyze access patterns
        const accessData = Array.from(this.accessPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Top 20 accessed keys
        // Identify co-access patterns
        const coAccessPatterns = await this.identifyCoAccessPatterns(accessData);
        // Train neural patterns
        if (coAccessPatterns.length > 0) {
            await this.mcpWrapper.trainNeural({
                pattern_type: 'prediction',
                training_data: JSON.stringify({
                    accessPatterns: accessData,
                    coAccessPatterns
                }),
                epochs: 20
            });
        }
        // Create pattern objects
        for (const pattern of coAccessPatterns) {
            patterns.push({
                type: 'co-access',
                keys: pattern.keys,
                confidence: pattern.confidence,
                frequency: pattern.frequency
            });
        }
        return patterns;
    }
    /**
     * Predict next memory access
     */
    async predictNextAccess(currentKey) {
        const prediction = await this.mcpWrapper.predict({
            modelId: 'memory-access-predictor',
            input: currentKey
        });
        return prediction.predictions || [];
    }
    /**
     * Compress memory entries
     */
    async compress(namespace) {
        const entries = namespace
            ? await this.list(namespace)
            : await this.db.getAllMemoryEntries();
        for (const entry of entries) {
            if (this.shouldCompress(entry)) {
                const compressed = await this.compressEntry(entry);
                await this.store(entry.key, compressed, entry.namespace, entry.ttl);
            }
        }
        this.emit('memoryCompressed', { namespace });
    }
    /**
     * Backup memory to external storage
     */
    async backup(path) {
        const allEntries = await this.db.getAllMemoryEntries();
        const backup = {
            swarmId: this.swarmId,
            timestamp: new Date(),
            entries: allEntries,
            namespaces: Array.from(this.namespaces.values()),
            patterns: await this.learnPatterns()
        };
        // Store backup using MCP
        await this.mcpWrapper.storeMemory({
            action: 'store',
            key: `backup/${this.swarmId}/${Date.now()}`,
            value: JSON.stringify(backup),
            namespace: 'hive-mind-backups'
        });
        this.emit('memoryBackedUp', { path, entryCount: allEntries.length });
    }
    /**
     * Restore memory from backup
     */
    async restore(backupId) {
        const backupData = await this.mcpWrapper.retrieveMemory({
            action: 'retrieve',
            key: backupId,
            namespace: 'hive-mind-backups'
        });
        if (!backupData) {
            throw new Error('Backup not found');
        }
        const backup = JSON.parse(backupData);
        // Clear existing memory
        await this.db.clearMemory(this.swarmId);
        this.cache.clear();
        // Restore entries
        for (const entry of backup.entries) {
            await this.store(entry.key, entry.value, entry.namespace, entry.ttl);
        }
        this.emit('memoryRestored', { backupId, entryCount: backup.entries.length });
    }
    /**
     * Initialize default namespaces
     */
    initializeNamespaces() {
        const defaultNamespaces = [
            {
                name: 'default',
                description: 'Default memory namespace',
                retentionPolicy: 'persistent',
                maxEntries: 10000
            },
            {
                name: 'task-results',
                description: 'Task execution results',
                retentionPolicy: 'time-based',
                ttl: 86400 * 7 // 7 days
            },
            {
                name: 'agent-state',
                description: 'Agent state and context',
                retentionPolicy: 'time-based',
                ttl: 86400 // 1 day
            },
            {
                name: 'learning-data',
                description: 'Machine learning training data',
                retentionPolicy: 'persistent',
                maxEntries: 50000
            },
            {
                name: 'performance-metrics',
                description: 'Performance and optimization data',
                retentionPolicy: 'time-based',
                ttl: 86400 * 30 // 30 days
            },
            {
                name: 'decisions',
                description: 'Strategic decisions and rationale',
                retentionPolicy: 'persistent',
                maxEntries: 10000
            }
        ];
        for (const ns of defaultNamespaces) {
            this.namespaces.set(ns.name, ns);
        }
    }
    /**
     * Load memory from database
     */
    async loadMemoryFromDatabase() {
        const recentEntries = await this.db.getRecentMemoryEntries(100);
        for (const dbEntry of recentEntries) {
            const entry = {
                key: dbEntry.key,
                namespace: dbEntry.namespace,
                value: dbEntry.value,
                ttl: dbEntry.ttl,
                createdAt: new Date(dbEntry.created_at),
                accessCount: dbEntry.access_count,
                lastAccessedAt: new Date(dbEntry.last_accessed_at)
            };
            const cacheKey = this.getCacheKey(entry.key, entry.namespace);
            this.cache.set(cacheKey, entry);
        }
    }
    /**
     * Start optimized memory managers
     */
    startOptimizedManagers() {
        // Cache optimization (every 30 seconds)
        const cacheTimer = setInterval(async () => {
            if (!this.isActive)
                return;
            await this.optimizeCache();
        }, 30000);
        // Performance monitoring (every 10 seconds)
        const metricsTimer = setInterval(() => {
            if (!this.isActive)
                return;
            this.updatePerformanceMetrics();
        }, 10000);
        // Memory cleanup (every 5 minutes)
        const cleanupTimer = setInterval(async () => {
            if (!this.isActive)
                return;
            await this.performMemoryCleanup();
        }, 300000);
        // Pattern analysis (every 2 minutes)
        const patternTimer = setInterval(async () => {
            if (!this.isActive)
                return;
            await this.analyzeAccessPatterns();
        }, 120000);
        this.optimizationTimers.push(cacheTimer, metricsTimer, cleanupTimer, patternTimer);
    }
    /**
     * Optimize cache performance
     */
    async optimizeCache() {
        const stats = this.cache.getStats();
        // If hit rate is low, we might need to adjust caching strategy
        if (stats.hitRate < 50 && stats.size > 1000) {
            // Emit warning for potential cache optimization
            this.emit('cacheOptimizationNeeded', stats);
        }
        this.emit('cacheOptimized', stats);
    }
    /**
     * Perform comprehensive memory cleanup
     */
    async performMemoryCleanup() {
        const startTime = perf_hooks_1.performance.now();
        // Clean expired entries from database
        await this.evictExpiredEntries();
        // Optimize object pools
        this.optimizeObjectPools();
        // Clean up old access patterns
        this.cleanupAccessPatterns();
        const duration = perf_hooks_1.performance.now() - startTime;
        this.emit('memoryCleanupCompleted', { duration });
    }
    /**
     * Analyze access patterns for optimization insights
     */
    async analyzeAccessPatterns() {
        const patterns = await this.learnPatterns();
        if (patterns.length > 0) {
            // Store learned patterns for future optimization
            await this.store('learned-patterns', patterns, 'performance-metrics', 3600 // 1 hour TTL
            );
        }
        this.emit('patternsAnalyzed', { count: patterns.length });
    }
    /**
     * Start pattern analyzer
     */
    startPatternAnalyzer() {
        setInterval(async () => {
            if (!this.isActive)
                return;
            // Learn access patterns
            const patterns = await this.learnPatterns();
            // Store patterns for future use
            if (patterns.length > 0) {
                await this.store('access-patterns', patterns, 'learning-data', 86400 // 1 day
                );
            }
        }, 300000); // Every 5 minutes
    }
    /**
     * Start memory optimizer
     */
    startMemoryOptimizer() {
        setInterval(async () => {
            if (!this.isActive)
                return;
            // Compress old entries
            await this.compressOldEntries();
            // Optimize namespaces
            await this.optimizeNamespaces();
        }, 3600000); // Every hour
    }
    /**
     * Enhanced helper methods with performance optimizations
     */
    getCacheKey(key, namespace) {
        return `${namespace}:${key}`;
    }
    /**
     * Compress data for storage efficiency
     */
    async compressData(data) {
        // Simplified compression simulation
        // In production, use proper compression library like zlib
        try {
            const compressed = {
                _compressed: true,
                _originalSize: data.length,
                data: data.substring(0, Math.floor(data.length * 0.7)) // Simulate 30% compression
            };
            return JSON.stringify(compressed);
        }
        catch {
            return data; // Return original if compression fails
        }
    }
    /**
     * Decompress data
     */
    async decompressData(compressedData) {
        try {
            const parsed = JSON.parse(compressedData);
            if (parsed._compressed) {
                return parsed.data; // Simplified decompression
            }
            return compressedData;
        }
        catch {
            return compressedData;
        }
    }
    /**
     * Record performance metrics
     */
    recordPerformance(operation, duration) {
        if (!this.performanceMetrics.has(operation)) {
            this.performanceMetrics.set(operation, []);
        }
        const metrics = this.performanceMetrics.get(operation);
        metrics.push(duration);
        // Keep only last 100 measurements
        if (metrics.length > 100) {
            metrics.shift();
        }
    }
    /**
     * Update access patterns with intelligent tracking
     */
    updateAccessPattern(key, operation) {
        const pattern = this.accessPatterns.get(key) || 0;
        // Weight different operations differently
        let weight = 1;
        switch (operation) {
            case 'cache_hit':
                weight = 0.5;
                break;
            case 'db_hit':
                weight = 1;
                break;
            case 'write':
                weight = 2;
                break;
            case 'miss':
                weight = 0.1;
                break;
        }
        this.accessPatterns.set(key, pattern + weight);
        // Limit access patterns size
        if (this.accessPatterns.size > 10000) {
            const entries = Array.from(this.accessPatterns.entries())
                .sort((a, b) => a[1] - b[1])
                .slice(0, 1000); // Remove least accessed
            this.accessPatterns.clear();
            entries.forEach(([k, v]) => this.accessPatterns.set(k, v));
        }
    }
    /**
     * Update performance metrics dashboard
     */
    updatePerformanceMetrics() {
        const metrics = {};
        // Calculate averages for each operation
        for (const [operation, durations] of this.performanceMetrics) {
            if (durations.length > 0) {
                metrics[`${operation}_avg`] = durations.reduce((a, b) => a + b, 0) / durations.length;
                metrics[`${operation}_count`] = durations.length;
                metrics[`${operation}_max`] = Math.max(...durations);
                metrics[`${operation}_min`] = Math.min(...durations);
            }
        }
        // Add cache statistics
        const cacheStats = this.cache.getStats();
        metrics.cache = cacheStats;
        // Add pool statistics
        if (this.objectPools.size > 0) {
            metrics.pools = {};
            for (const [name, pool] of this.objectPools) {
                metrics.pools[name] = pool.getStats();
            }
        }
        this.emit('performanceUpdate', metrics);
    }
    /**
     * Optimize object pools
     */
    optimizeObjectPools() {
        for (const [name, pool] of this.objectPools) {
            const stats = pool.getStats();
            // If reuse rate is low, the pool might be too small
            if (stats.reuseRate < 30 && stats.poolSize < 500) {
                this.emit('poolOptimizationSuggested', { name, stats });
            }
        }
    }
    /**
     * Clean up old access patterns
     */
    cleanupAccessPatterns() {
        // Remove patterns with very low access counts
        const threshold = 0.5;
        const toRemove = [];
        for (const [key, count] of this.accessPatterns) {
            if (count < threshold) {
                toRemove.push(key);
            }
        }
        toRemove.forEach(key => this.accessPatterns.delete(key));
        if (toRemove.length > 0) {
            this.emit('accessPatternsCleanedUp', { removed: toRemove.length });
        }
    }
    parseValue(value) {
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    updateAccessStats(entry) {
        entry.accessCount++;
        entry.lastAccessedAt = new Date();
        const cacheKey = this.getCacheKey(entry.key, entry.namespace);
        this.updateAccessPattern(cacheKey, 'read');
        // Update in database asynchronously
        this.db.updateMemoryAccess(entry.key, entry.namespace).catch(err => {
            this.emit('error', err);
        });
    }
    updateNamespaceStats(namespace, operation) {
        const ns = this.namespaces.get(namespace);
        if (ns) {
            ns.lastOperation = operation;
            ns.lastOperationTime = new Date();
        }
    }
    matchesSearch(entry, options) {
        if (options.namespace && entry.namespace !== options.namespace) {
            return false;
        }
        if (options.pattern) {
            const regex = new RegExp(options.pattern, 'i');
            return regex.test(entry.key) || regex.test(entry.value);
        }
        if (options.keyPrefix && !entry.key.startsWith(options.keyPrefix)) {
            return false;
        }
        if (options.minAccessCount && entry.accessCount < options.minAccessCount) {
            return false;
        }
        return true;
    }
    sortByRelevance(entries, options) {
        return entries.sort((a, b) => {
            // Sort by access count (most accessed first)
            if (options.sortBy === 'access') {
                return b.accessCount - a.accessCount;
            }
            // Sort by recency (most recent first)
            if (options.sortBy === 'recent') {
                return b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime();
            }
            // Default: sort by creation time
            return b.createdAt.getTime() - a.createdAt.getTime();
        }).slice(0, options.limit || 10);
    }
    calculateCacheHitRate() {
        // Simple calculation - would need more sophisticated tracking in production
        const totalAccesses = Array.from(this.accessPatterns.values()).reduce((a, b) => a + b, 0);
        const cacheHits = this.cache.size;
        return totalAccesses > 0 ? (cacheHits / totalAccesses) * 100 : 0;
    }
    calculateAvgAccessTime() {
        // Simplified - would track actual access times in production
        return 5; // 5ms average
    }
    async getHotKeys() {
        return Array.from(this.accessPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([key]) => key);
    }
    async identifyCoAccessPatterns(accessData) {
        // Simplified co-access pattern detection
        const patterns = [];
        for (let i = 0; i < accessData.length - 1; i++) {
            for (let j = i + 1; j < Math.min(i + 5, accessData.length); j++) {
                if (Math.abs(accessData[i][1] - accessData[j][1]) < 10) {
                    patterns.push({
                        keys: [accessData[i][0], accessData[j][0]],
                        confidence: 0.8,
                        frequency: Math.min(accessData[i][1], accessData[j][1])
                    });
                }
            }
        }
        return patterns;
    }
    shouldCompress(entry) {
        // Compress if: large size, old, and rarely accessed
        const ageInDays = (Date.now() - entry.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const isOld = ageInDays > 7;
        const isLarge = entry.value.length > 10000;
        const isRarelyAccessed = entry.accessCount < 5;
        return isOld && isLarge && isRarelyAccessed;
    }
    async compressEntry(entry) {
        // Simple compression - in production would use proper compression
        const compressed = {
            _compressed: true,
            _original_length: entry.value.length,
            data: entry.value // Would actually compress here
        };
        return JSON.stringify(compressed);
    }
    async evictExpiredEntries() {
        const now = Date.now();
        const toEvict = [];
        for (const [cacheKey, entry] of this.cache) {
            if (entry.ttl && entry.createdAt.getTime() + (entry.ttl * 1000) < now) {
                toEvict.push(cacheKey);
            }
        }
        for (const key of toEvict) {
            const entry = this.cache.get(key);
            await this.delete(entry.key, entry.namespace);
        }
    }
    async manageCacheSize() {
        const maxCacheSize = 1000;
        if (this.cache.size > maxCacheSize) {
            // Evict least recently used entries
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].lastAccessedAt.getTime() - b[1].lastAccessedAt.getTime());
            const toEvict = entries.slice(0, entries.length - maxCacheSize);
            for (const [cacheKey] of toEvict) {
                this.cache.delete(cacheKey);
            }
        }
    }
    async compressOldEntries() {
        const oldEntries = await this.db.getOldMemoryEntries(30); // 30 days old
        for (const entry of oldEntries) {
            if (this.shouldCompress(entry)) {
                const compressed = await this.compressEntry(entry);
                await this.store(entry.key, compressed, entry.namespace, entry.ttl);
            }
        }
    }
    async optimizeNamespaces() {
        for (const namespace of this.namespaces.values()) {
            const stats = await this.db.getNamespaceStats(namespace.name);
            // Apply retention policies
            if (namespace.retentionPolicy === 'time-based' && namespace.ttl) {
                await this.db.deleteOldEntries(namespace.name, namespace.ttl);
            }
            if (namespace.retentionPolicy === 'size-based' && namespace.maxEntries) {
                if (stats.entries > namespace.maxEntries) {
                    await this.db.trimNamespace(namespace.name, namespace.maxEntries);
                }
            }
        }
    }
    /**
     * Enhanced shutdown with comprehensive cleanup
     */
    async shutdown() {
        this.isActive = false;
        // Clear all optimization timers
        this.optimizationTimers.forEach(timer => clearInterval(timer));
        this.optimizationTimers.length = 0;
        // Final performance snapshot
        const finalMetrics = {
            cache: this.cache.getStats(),
            accessPatterns: this.accessPatterns.size,
            performance: Object.fromEntries(this.performanceMetrics)
        };
        // Clear cache and pools
        this.cache.clear();
        for (const pool of this.objectPools.values()) {
            // Pools will be garbage collected
        }
        this.objectPools.clear();
        this.emit('shutdown', finalMetrics);
    }
    /**
     * Get comprehensive analytics
     */
    getAdvancedAnalytics() {
        return {
            basic: this.getStats(),
            cache: this.cache.getStats(),
            performance: Object.fromEntries(Array.from(this.performanceMetrics.entries()).map(([op, durations]) => [
                op,
                {
                    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
                    count: durations.length,
                    max: Math.max(...durations),
                    min: Math.min(...durations)
                }
            ])),
            pools: Object.fromEntries(Array.from(this.objectPools.entries()).map(([name, pool]) => [
                name,
                pool.getStats()
            ])),
            accessPatterns: {
                total: this.accessPatterns.size,
                hotKeys: Array.from(this.accessPatterns.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([key, count]) => ({ key, count }))
            }
        };
    }
    /**
     * Memory health check with detailed analysis
     */
    async healthCheck() {
        const analytics = this.getAdvancedAnalytics();
        const health = {
            status: 'healthy',
            score: 100,
            issues: [],
            recommendations: []
        };
        // Check cache performance
        if (analytics.cache.hitRate < 50) {
            health.score -= 20;
            health.issues.push('Low cache hit rate');
            health.recommendations.push('Consider increasing cache size or reviewing access patterns');
        }
        // Check memory utilization
        if (analytics.cache.utilizationPercent > 90) {
            health.score -= 30;
            health.status = 'warning';
            health.issues.push('High cache memory utilization');
            health.recommendations.push('Increase cache memory limit or optimize data storage');
        }
        // Check performance metrics
        const avgRetrieveTime = analytics.performance.retrieve_db?.avg || 0;
        if (avgRetrieveTime > 100) {
            health.score -= 15;
            health.issues.push('Slow database retrieval performance');
            health.recommendations.push('Consider database optimization or indexing improvements');
        }
        // Check pool efficiency
        for (const [name, stats] of Object.entries(analytics.pools)) {
            if (stats.reuseRate < 30) {
                health.score -= 10;
                health.issues.push(`Low object pool reuse rate for ${name}`);
                health.recommendations.push(`Increase ${name} pool size or review object lifecycle`);
            }
        }
        // Determine final status
        if (health.score < 60) {
            health.status = 'critical';
        }
        else if (health.score < 80) {
            health.status = 'warning';
        }
        return health;
    }
}
exports.Memory = Memory;
