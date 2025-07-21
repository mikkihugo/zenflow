"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedMemorySystem = void 0;
/**
 * Distributed memory system with sharing capabilities
 */
const node_events_1 = require("node:events");
const helpers_js_1 = require("../utils/helpers.js");
/**
 * Distributed memory system for sharing data across swarm agents
 */
class DistributedMemorySystem extends node_events_1.EventEmitter {
    constructor(config, logger, eventBus) {
        super();
        // Storage
        this.partitions = new Map();
        this.entries = new Map();
        this.cache = new Map();
        // Distribution
        this.nodes = new Map();
        this.syncQueue = [];
        this.replicationMap = new Map(); // entryId -> nodeIds
        this.vectorClock = new Map();
        this.operationMetrics = new Map();
        this.logger = logger;
        this.eventBus = eventBus;
        this.config = {
            namespace: 'default',
            distributed: true,
            consistency: 'eventual',
            replicationFactor: 3,
            syncInterval: 5000,
            maxMemorySize: 1024 * 1024 * 1024, // 1GB
            compressionEnabled: true,
            encryptionEnabled: false,
            backupEnabled: true,
            persistenceEnabled: true,
            shardingEnabled: true,
            cacheSize: 10000,
            cacheTtl: 300000, // 5 minutes
            ...config
        };
        this.localNodeId = (0, helpers_js_1.generateId)('memory-node');
        this.statistics = this.initializeStatistics();
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.eventBus.on('memory:sync-request', (data) => {
            this.handleSyncRequest(data);
        });
        this.eventBus.on('memory:node-joined', (data) => {
            this.handleNodeJoined(data);
        });
        this.eventBus.on('memory:node-left', (data) => {
            this.handleNodeLeft(data);
        });
        this.eventBus.on('memory:conflict-detected', (data) => {
            this.handleConflict(data);
        });
    }
    async initialize() {
        this.logger.info('Initializing distributed memory system', {
            nodeId: this.localNodeId,
            namespace: this.config.namespace,
            distributed: this.config.distributed
        });
        // Register local node
        const localNode = {
            id: this.localNodeId,
            address: 'localhost',
            port: 8080,
            status: 'online',
            lastSeen: new Date(),
            partitions: [],
            load: 0,
            capacity: this.config.maxMemorySize
        };
        this.nodes.set(this.localNodeId, localNode);
        // Initialize default partitions
        await this.createPartition('knowledge', 'knowledge');
        await this.createPartition('state', 'state');
        await this.createPartition('cache', 'cache');
        await this.createPartition('results', 'results');
        // Start synchronization if distributed
        if (this.config.distributed) {
            this.startSynchronization();
        }
        // Load persisted data if enabled
        if (this.config.persistenceEnabled) {
            await this.loadPersistedData();
        }
        this.emit('memory:initialized', { nodeId: this.localNodeId });
    }
    async shutdown() {
        this.logger.info('Shutting down distributed memory system');
        // Stop synchronization
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        // Complete pending sync operations
        await this.completePendingSyncOperations();
        // Persist data if enabled
        if (this.config.persistenceEnabled) {
            await this.persistData();
        }
        // Clear caches
        this.cache.clear();
        this.partitions.clear();
        this.entries.clear();
        this.emit('memory:shutdown', { nodeId: this.localNodeId });
    }
    // === PARTITION MANAGEMENT ===
    async createPartition(name, type, options = {}) {
        const partitionId = (0, helpers_js_1.generateId)('partition');
        const partition = {
            id: partitionId,
            name,
            type,
            entries: [],
            maxSize: options.maxSize || this.config.maxMemorySize / 10,
            ttl: options.ttl,
            readOnly: options.readOnly || false,
            shared: options.shared !== false, // Default to shared
            indexed: options.indexed || false,
            compressed: options.compressed || this.config.compressionEnabled
        };
        this.partitions.set(partitionId, partition);
        // Update local node partition list
        const localNode = this.nodes.get(this.localNodeId);
        localNode.partitions.push(partitionId);
        this.logger.info('Created partition', { partitionId, name, type });
        this.emit('memory:partition-created', { partition });
        // Sync with other nodes if distributed
        if (this.config.distributed) {
            await this.syncPartitionCreation(partition);
        }
        return partitionId;
    }
    async deletePartition(partitionId) {
        const partition = this.partitions.get(partitionId);
        if (!partition) {
            throw new Error(`Partition ${partitionId} not found`);
        }
        // Delete all entries in partition
        const entriesToDelete = Array.from(this.entries.values())
            .filter(entry => this.getEntryPartition(entry.id) === partitionId);
        for (const entry of entriesToDelete) {
            await this.deleteEntry(entry.id);
        }
        // Remove partition
        this.partitions.delete(partitionId);
        // Update local node
        const localNode = this.nodes.get(this.localNodeId);
        localNode.partitions = localNode.partitions.filter(p => p !== partitionId);
        this.logger.info('Deleted partition', { partitionId });
        this.emit('memory:partition-deleted', { partitionId });
        // Sync with other nodes if distributed
        if (this.config.distributed) {
            await this.syncPartitionDeletion(partitionId);
        }
    }
    // === ENTRY OPERATIONS ===
    async store(key, value, options = {}) {
        const startTime = Date.now();
        try {
            const entryId = (0, helpers_js_1.generateId)('entry');
            const now = new Date();
            // Determine partition
            const partitionId = options.partition || this.selectPartition(options.type || 'knowledge');
            const partition = this.partitions.get(partitionId);
            if (!partition) {
                throw new Error(`Partition ${partitionId} not found`);
            }
            if (partition.readOnly) {
                throw new Error('Cannot write to read-only partition');
            }
            // Check partition capacity
            if (this.getPartitionSize(partitionId) >= partition.maxSize) {
                await this.evictOldEntries(partitionId);
            }
            // Create entry
            const entry = {
                id: entryId,
                key,
                value: await this.processValue(value, partition),
                type: options.type || 'data',
                tags: options.tags || [],
                owner: options.owner || { id: 'system', swarmId: '', type: 'coordinator', instance: 0 },
                accessLevel: options.accessLevel || 'swarm',
                createdAt: now,
                updatedAt: now,
                expiresAt: options.ttl ? new Date(now.getTime() + options.ttl) : undefined,
                version: 1,
                references: [],
                dependencies: []
            };
            // Store entry
            this.entries.set(entryId, entry);
            partition.entries.push(entry);
            // Update cache
            this.updateCache(entryId, entry);
            // Update vector clock
            this.incrementVectorClock(this.localNodeId);
            this.logger.debug('Stored entry', { entryId, key, partition: partitionId });
            this.emit('memory:entry-stored', { entry });
            // Replicate if distributed and requested
            if (this.config.distributed && options.replicate !== false) {
                await this.replicateEntry(entry);
            }
            this.recordMetric('store', Date.now() - startTime);
            return entryId;
        }
        catch (error) {
            this.recordMetric('store-error', Date.now() - startTime);
            throw error;
        }
    }
    async retrieve(key, options = {}) {
        const startTime = Date.now();
        try {
            // Check cache first
            const cached = this.getCachedEntry(key);
            if (cached && this.isCacheValid(cached)) {
                this.recordMetric('retrieve-cache', Date.now() - startTime);
                return cached.entry;
            }
            // Search in specified partition or all partitions
            const partitions = options.partition
                ? [this.partitions.get(options.partition)].filter(Boolean)
                : Array.from(this.partitions.values());
            for (const partition of partitions) {
                const entry = partition.entries.find(e => e.key === key);
                if (entry) {
                    // Check if entry is expired
                    if (entry.expiresAt && entry.expiresAt < new Date()) {
                        await this.deleteEntry(entry.id);
                        continue;
                    }
                    // Check access permissions
                    if (!this.checkAccess(entry, 'read')) {
                        continue;
                    }
                    // Apply consistency model
                    if (this.config.distributed && options.consistency === 'strong') {
                        const latestEntry = await this.ensureConsistency(entry);
                        this.updateCache(latestEntry.id, latestEntry);
                        this.recordMetric('retrieve', Date.now() - startTime);
                        return latestEntry;
                    }
                    this.updateCache(entry.id, entry);
                    this.recordMetric('retrieve', Date.now() - startTime);
                    return entry;
                }
            }
            // Not found locally, try remote nodes if distributed
            if (this.config.distributed) {
                const remoteEntry = await this.retrieveFromRemote(key, options);
                if (remoteEntry) {
                    this.recordMetric('retrieve-remote', Date.now() - startTime);
                    return remoteEntry;
                }
            }
            this.recordMetric('retrieve-miss', Date.now() - startTime);
            return null;
        }
        catch (error) {
            this.recordMetric('retrieve-error', Date.now() - startTime);
            throw error;
        }
    }
    async update(key, value, options = {}) {
        const startTime = Date.now();
        try {
            const entry = await this.retrieve(key, { partition: options.partition });
            if (!entry) {
                this.recordMetric('update-not-found', Date.now() - startTime);
                return false;
            }
            // Check access permissions
            if (!this.checkAccess(entry, 'write')) {
                throw new Error('Access denied for update operation');
            }
            // Version check for optimistic locking
            if (options.version && entry.version !== options.version) {
                throw new Error('Version conflict: entry has been modified');
            }
            // Update entry
            const partition = this.partitions.get(this.getEntryPartition(entry.id));
            entry.value = options.merge
                ? await this.mergeValues(entry.value, value, partition)
                : await this.processValue(value, partition);
            entry.updatedAt = new Date();
            entry.version++;
            // Update cache
            this.updateCache(entry.id, entry);
            // Update vector clock
            this.incrementVectorClock(this.localNodeId);
            this.logger.debug('Updated entry', { entryId: entry.id, key });
            this.emit('memory:entry-updated', { entry });
            // Sync with other nodes if distributed
            if (this.config.distributed) {
                await this.syncEntryUpdate(entry);
            }
            this.recordMetric('update', Date.now() - startTime);
            return true;
        }
        catch (error) {
            this.recordMetric('update-error', Date.now() - startTime);
            throw error;
        }
    }
    async deleteEntry(entryId) {
        const startTime = Date.now();
        try {
            const entry = this.entries.get(entryId);
            if (!entry) {
                this.recordMetric('delete-not-found', Date.now() - startTime);
                return false;
            }
            // Check access permissions
            if (!this.checkAccess(entry, 'delete')) {
                throw new Error('Access denied for delete operation');
            }
            // Remove from partition
            const partitionId = this.getEntryPartition(entryId);
            const partition = this.partitions.get(partitionId);
            if (partition) {
                partition.entries = partition.entries.filter(e => e.id !== entryId);
            }
            // Remove from storage
            this.entries.delete(entryId);
            // Remove from cache
            this.removeFromCache(entry.key);
            // Update vector clock
            this.incrementVectorClock(this.localNodeId);
            this.logger.debug('Deleted entry', { entryId, key: entry.key });
            this.emit('memory:entry-deleted', { entryId });
            // Sync with other nodes if distributed
            if (this.config.distributed) {
                await this.syncEntryDeletion(entryId);
            }
            this.recordMetric('delete', Date.now() - startTime);
            return true;
        }
        catch (error) {
            this.recordMetric('delete-error', Date.now() - startTime);
            throw error;
        }
    }
    // === QUERY OPERATIONS ===
    async query(query) {
        const startTime = Date.now();
        try {
            let results = [];
            // Get relevant partitions
            const partitions = query.partition
                ? [this.partitions.get(query.partition)].filter(Boolean)
                : Array.from(this.partitions.values());
            for (const partition of partitions) {
                for (const entry of partition.entries) {
                    if (this.matchesQuery(entry, query)) {
                        results.push(entry);
                    }
                }
            }
            // Apply sorting
            if (query.sortBy) {
                results.sort((a, b) => {
                    const aVal = this.getNestedProperty(a, query.sortBy);
                    const bVal = this.getNestedProperty(b, query.sortBy);
                    const order = query.sortOrder === 'desc' ? -1 : 1;
                    if (aVal < bVal)
                        return -1 * order;
                    if (aVal > bVal)
                        return 1 * order;
                    return 0;
                });
            }
            // Apply pagination
            const offset = query.offset || 0;
            const limit = query.limit || results.length;
            results = results.slice(offset, offset + limit);
            this.recordMetric('query', Date.now() - startTime);
            return results;
        }
        catch (error) {
            this.recordMetric('query-error', Date.now() - startTime);
            throw error;
        }
    }
    /**
     * Query entries by type
     */
    async queryByType(type, namespace) {
        return this.query({
            filter: { type },
            namespace
        });
    }
    // === SYNCHRONIZATION ===
    startSynchronization() {
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, this.config.syncInterval);
        this.logger.info('Started synchronization', {
            interval: this.config.syncInterval,
            consistency: this.config.consistency
        });
    }
    async performSync() {
        try {
            // Process pending sync operations
            await this.processSyncQueue();
            // Send heartbeat to other nodes
            await this.sendHeartbeat();
            // Check for conflicts and resolve them
            await this.detectAndResolveConflicts();
            // Update statistics
            this.updateStatistics();
        }
        catch (error) {
            this.logger.error('Sync error', error);
        }
    }
    async processSyncQueue() {
        const pendingOps = this.syncQueue.filter(op => op.status === 'pending');
        for (const operation of pendingOps) {
            try {
                operation.status = 'in_progress';
                await this.executeSyncOperation(operation);
                operation.status = 'completed';
                this.statistics.syncOperations.completed++;
            }
            catch (error) {
                operation.status = 'failed';
                this.statistics.syncOperations.failed++;
                this.logger.error('Sync operation failed', { operation, error });
            }
        }
        // Remove completed/failed operations older than 1 hour
        const cutoff = new Date(Date.now() - 3600000);
        this.syncQueue = this.syncQueue.filter(op => op.status === 'pending' || op.timestamp > cutoff);
    }
    // === UTILITY METHODS ===
    async processValue(value, partition) {
        if (partition.compressed && this.config.compressionEnabled) {
            return this.compressValue(value);
        }
        return value;
    }
    async mergeValues(oldValue, newValue, partition) {
        // Simple merge strategy - can be enhanced
        if (typeof oldValue === 'object' && typeof newValue === 'object') {
            return { ...oldValue, ...newValue };
        }
        return newValue;
    }
    compressValue(value) {
        // Placeholder for compression logic
        return value;
    }
    checkAccess(entry, operation) {
        // Simplified access control - can be enhanced
        return true;
    }
    selectPartition(type) {
        // Simple partition selection based on type
        for (const [id, partition] of this.partitions) {
            if (partition.type === type) {
                return id;
            }
        }
        // Default to first available partition
        return Array.from(this.partitions.keys())[0] || '';
    }
    getPartitionSize(partitionId) {
        const partition = this.partitions.get(partitionId);
        if (!partition)
            return 0;
        return partition.entries.reduce((size, entry) => {
            return size + JSON.stringify(entry).length;
        }, 0);
    }
    getEntryPartition(entryId) {
        for (const [partitionId, partition] of this.partitions) {
            if (partition.entries.some(e => e.id === entryId)) {
                return partitionId;
            }
        }
        return '';
    }
    updateCache(entryId, entry) {
        if (this.cache.size >= this.config.cacheSize) {
            this.evictCache();
        }
        this.cache.set(entry.key, {
            entry: { ...entry },
            expiry: Date.now() + this.config.cacheTtl
        });
    }
    getCachedEntry(key) {
        return this.cache.get(key) || null;
    }
    isCacheValid(cached) {
        return cached.expiry > Date.now();
    }
    removeFromCache(key) {
        this.cache.delete(key);
    }
    evictCache() {
        // Simple LRU eviction - remove oldest entries
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].expiry - b[1].expiry);
        const toRemove = entries.slice(0, Math.floor(this.config.cacheSize * 0.1));
        toRemove.forEach(([key]) => this.cache.delete(key));
    }
    async evictOldEntries(partitionId) {
        const partition = this.partitions.get(partitionId);
        if (!partition)
            return;
        // Sort by last access time and remove oldest 10%
        const entries = partition.entries.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        const toRemove = entries.slice(0, Math.floor(entries.length * 0.1));
        for (const entry of toRemove) {
            await this.deleteEntry(entry.id);
        }
    }
    matchesQuery(entry, query) {
        if (query.type && entry.type !== query.type)
            return false;
        if (query.owner && entry.owner.id !== query.owner.id)
            return false;
        if (query.accessLevel && entry.accessLevel !== query.accessLevel)
            return false;
        if (query.createdAfter && entry.createdAt < query.createdAfter)
            return false;
        if (query.updatedAfter && entry.updatedAt < query.updatedAfter)
            return false;
        if (query.tags && query.tags.length > 0) {
            const hasAllTags = query.tags.every(tag => entry.tags.includes(tag));
            if (!hasAllTags)
                return false;
        }
        return true;
    }
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    incrementVectorClock(nodeId) {
        const current = this.vectorClock.get(nodeId) || 0;
        this.vectorClock.set(nodeId, current + 1);
    }
    recordMetric(operation, duration) {
        const current = this.operationMetrics.get(operation) || { count: 0, totalTime: 0 };
        current.count++;
        current.totalTime += duration;
        this.operationMetrics.set(operation, current);
    }
    initializeStatistics() {
        return {
            totalEntries: 0,
            totalSize: 0,
            partitionCount: 0,
            nodeCount: 1,
            replicationHealth: 1.0,
            syncOperations: {
                pending: 0,
                completed: 0,
                failed: 0
            },
            performance: {
                readLatency: 0,
                writeLatency: 0,
                syncLatency: 0,
                throughput: 0
            },
            utilization: {
                memoryUsage: 0,
                diskUsage: 0,
                networkUsage: 0
            }
        };
    }
    updateStatistics() {
        this.statistics.totalEntries = this.entries.size;
        this.statistics.partitionCount = this.partitions.size;
        this.statistics.nodeCount = this.nodes.size;
        // Calculate performance metrics
        const readMetrics = this.operationMetrics.get('retrieve') || { count: 0, totalTime: 0 };
        const writeMetrics = this.operationMetrics.get('store') || { count: 0, totalTime: 0 };
        this.statistics.performance.readLatency = readMetrics.count > 0
            ? readMetrics.totalTime / readMetrics.count : 0;
        this.statistics.performance.writeLatency = writeMetrics.count > 0
            ? writeMetrics.totalTime / writeMetrics.count : 0;
    }
    // === DISTRIBUTED OPERATIONS (Placeholders) ===
    async replicateEntry(entry) {
        // Implementation for replication to other nodes
    }
    async syncPartitionCreation(partition) {
        // Implementation for syncing partition creation
    }
    async syncPartitionDeletion(partitionId) {
        // Implementation for syncing partition deletion
    }
    async syncEntryUpdate(entry) {
        // Implementation for syncing entry updates
    }
    async syncEntryDeletion(entryId) {
        // Implementation for syncing entry deletion
    }
    async retrieveFromRemote(key, options) {
        // Implementation for retrieving from remote nodes
        return null;
    }
    async ensureConsistency(entry) {
        // Implementation for ensuring strong consistency
        return entry;
    }
    async sendHeartbeat() {
        // Implementation for sending heartbeat to other nodes
    }
    async detectAndResolveConflicts() {
        // Implementation for conflict detection and resolution
    }
    async executeSyncOperation(operation) {
        // Implementation for executing sync operations
    }
    async completePendingSyncOperations() {
        // Implementation for completing pending operations
    }
    async loadPersistedData() {
        // Implementation for loading persisted data
    }
    async persistData() {
        // Implementation for persisting data
    }
    handleSyncRequest(data) {
        // Handle sync requests from other nodes
    }
    handleNodeJoined(data) {
        // Handle new node joining
    }
    handleNodeLeft(data) {
        // Handle node leaving
    }
    handleConflict(data) {
        // Handle conflict resolution
    }
    // === PUBLIC API ===
    getStatistics() {
        this.updateStatistics();
        return { ...this.statistics };
    }
    getPartitions() {
        return Array.from(this.partitions.values());
    }
    getNodes() {
        return Array.from(this.nodes.values());
    }
    async backup() {
        // Create backup of all data
        const backup = {
            timestamp: new Date(),
            partitions: Array.from(this.partitions.values()),
            entries: Array.from(this.entries.values()),
            metadata: {
                version: '1.0',
                nodeId: this.localNodeId,
                config: this.config
            }
        };
        return JSON.stringify(backup);
    }
    async restore(backupData) {
        // Restore from backup
        const backup = JSON.parse(backupData);
        // Clear current data
        this.partitions.clear();
        this.entries.clear();
        this.cache.clear();
        // Restore partitions
        for (const partition of backup.partitions) {
            this.partitions.set(partition.id, partition);
        }
        // Restore entries
        for (const entry of backup.entries) {
            this.entries.set(entry.id, entry);
        }
        this.logger.info('Restored from backup', {
            partitions: backup.partitions.length,
            entries: backup.entries.length
        });
    }
    async clear() {
        this.partitions.clear();
        this.entries.clear();
        this.cache.clear();
        this.syncQueue = [];
        this.statistics = this.initializeStatistics();
        this.logger.info('Cleared all memory data');
        this.emit('memory:cleared');
    }
}
exports.DistributedMemorySystem = DistributedMemorySystem;
