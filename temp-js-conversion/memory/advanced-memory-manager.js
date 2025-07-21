"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedMemoryManager = void 0;
/**
 * Advanced Memory Management System with comprehensive capabilities
 * Includes indexing, compression, cross-agent sharing, and intelligent cleanup
 */
const node_events_1 = require("node:events");
const node_fs_1 = require("node:fs");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const helpers_js_1 = require("../utils/helpers.js");
// === MAIN CLASS ===
class AdvancedMemoryManager extends node_events_1.EventEmitter {
    constructor(config = {}, logger) {
        super();
        this.entries = new Map();
        this.cache = new Map();
        this.retentionPolicies = new Map();
        this.operationMetrics = new Map();
        this.logger = logger;
        this.config = {
            maxMemorySize: 1024 * 1024 * 1024, // 1GB
            cacheSize: 10000,
            cacheTtl: 300000, // 5 minutes
            autoCompress: true,
            autoCleanup: true,
            cleanupInterval: 3600000, // 1 hour
            indexingEnabled: true,
            persistenceEnabled: true,
            compressionThreshold: 1024, // 1KB
            backupRetention: 7, // days
            ...config
        };
        // Setup file paths
        const __dirname = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
        this.dataPath = (0, node_path_1.join)(process.cwd(), 'memory', 'data');
        this.indexPath = (0, node_path_1.join)(process.cwd(), 'memory', 'index');
        this.backupPath = (0, node_path_1.join)(process.cwd(), 'memory', 'backups');
        this.archivePath = (0, node_path_1.join)(process.cwd(), 'memory', 'archive');
        this.index = this.createEmptyIndex();
        this.statistics = this.initializeStatistics();
    }
    // === INITIALIZATION ===
    async initialize() {
        this.logger.info('Initializing Advanced Memory Manager');
        // Create directories
        await Promise.all([
            node_fs_1.promises.mkdir(this.dataPath, { recursive: true }),
            node_fs_1.promises.mkdir(this.indexPath, { recursive: true }),
            node_fs_1.promises.mkdir(this.backupPath, { recursive: true }),
            node_fs_1.promises.mkdir(this.archivePath, { recursive: true })
        ]);
        // Load persisted data
        if (this.config.persistenceEnabled) {
            await this.loadPersistedData();
        }
        // Start automatic cleanup if enabled
        if (this.config.autoCleanup) {
            this.startAutoCleanup();
        }
        this.emit('memory:initialized');
        this.logger.info('Advanced Memory Manager initialized successfully');
    }
    async shutdown() {
        this.logger.info('Shutting down Advanced Memory Manager');
        // Stop cleanup interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        // Persist data
        if (this.config.persistenceEnabled) {
            await this.persistData();
        }
        // Create backup
        await this.createBackup();
        this.emit('memory:shutdown');
    }
    // === CORE OPERATIONS ===
    async store(key, value, options = {}) {
        const startTime = Date.now();
        try {
            const entryId = (0, helpers_js_1.generateId)('entry');
            const now = new Date();
            // Process value (compression, serialization)
            const processedValue = await this.processValue(value, options.compress);
            const size = this.calculateSize(processedValue);
            // Create entry
            const entry = {
                id: entryId,
                key,
                value: processedValue.value,
                type: options.type || this.inferType(value),
                namespace: options.namespace || 'default',
                tags: options.tags || [],
                metadata: options.metadata || {},
                owner: options.owner || 'system',
                accessLevel: options.accessLevel || 'shared',
                createdAt: now,
                updatedAt: now,
                lastAccessedAt: now,
                expiresAt: options.ttl ? new Date(now.getTime() + options.ttl) : undefined,
                version: 1,
                size,
                compressed: processedValue.compressed,
                checksum: this.calculateChecksum(processedValue.value),
                references: [],
                dependencies: []
            };
            // Store entry
            this.entries.set(entryId, entry);
            // Update index
            if (this.config.indexingEnabled) {
                this.updateIndex(entry, 'create');
            }
            // Update cache
            this.updateCache(key, entry);
            // Apply retention policies
            await this.applyRetentionPolicies(entry);
            this.logger.debug('Memory entry stored', { entryId, key, namespace: entry.namespace });
            this.emit('memory:entry-stored', { entry });
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
            const cached = this.cache.get(key);
            if (cached && cached.expiry > Date.now()) {
                this.recordMetric('retrieve-cache', Date.now() - startTime);
                return cached.entry;
            }
            // Search in entries
            const entry = this.findEntryByKey(key, options.namespace);
            if (!entry) {
                this.recordMetric('retrieve-miss', Date.now() - startTime);
                return null;
            }
            // Check if expired
            if (entry.expiresAt && entry.expiresAt < new Date()) {
                await this.deleteEntry(entry.id);
                this.recordMetric('retrieve-expired', Date.now() - startTime);
                return null;
            }
            // Update last accessed
            if (options.updateLastAccessed !== false) {
                entry.lastAccessedAt = new Date();
            }
            // Decompress if needed
            if (entry.compressed) {
                entry.value = await this.decompressValue(entry.value);
            }
            // Update cache
            this.updateCache(key, entry);
            this.recordMetric('retrieve', Date.now() - startTime);
            return entry;
        }
        catch (error) {
            this.recordMetric('retrieve-error', Date.now() - startTime);
            throw error;
        }
    }
    async update(key, value, options = {}) {
        const startTime = Date.now();
        try {
            const entry = await this.retrieve(key, { namespace: options.namespace });
            if (!entry) {
                this.recordMetric('update-not-found', Date.now() - startTime);
                return false;
            }
            // Process new value
            const processedValue = await this.processValue(value, entry.compressed);
            // Update entry
            if (options.merge && typeof entry.value === 'object' && typeof value === 'object') {
                entry.value = { ...entry.value, ...processedValue.value };
            }
            else {
                entry.value = processedValue.value;
            }
            entry.updatedAt = new Date();
            entry.lastAccessedAt = new Date();
            entry.version++;
            entry.size = this.calculateSize(entry.value);
            entry.checksum = this.calculateChecksum(entry.value);
            if (options.updateMetadata) {
                entry.metadata = { ...entry.metadata, ...options.updateMetadata };
            }
            // Update index
            if (this.config.indexingEnabled) {
                this.updateIndex(entry, 'update');
            }
            // Update cache
            this.updateCache(key, entry);
            this.logger.debug('Memory entry updated', { entryId: entry.id, key });
            this.emit('memory:entry-updated', { entry });
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
            // Remove from storage
            this.entries.delete(entryId);
            // Update index
            if (this.config.indexingEnabled) {
                this.updateIndex(entry, 'delete');
            }
            // Remove from cache
            this.cache.delete(entry.key);
            this.logger.debug('Memory entry deleted', { entryId, key: entry.key });
            this.emit('memory:entry-deleted', { entryId });
            this.recordMetric('delete', Date.now() - startTime);
            return true;
        }
        catch (error) {
            this.recordMetric('delete-error', Date.now() - startTime);
            throw error;
        }
    }
    // === ADVANCED QUERY OPERATIONS ===
    async query(options = {}) {
        const startTime = Date.now();
        try {
            let candidateEntries = [];
            // Use index for efficient querying if enabled
            if (this.config.indexingEnabled) {
                candidateEntries = this.queryWithIndex(options);
            }
            else {
                candidateEntries = Array.from(this.entries.values());
            }
            // Apply filters
            let filteredEntries = candidateEntries.filter(entry => {
                return this.matchesQuery(entry, options);
            });
            // Remove expired entries
            if (!options.includeExpired) {
                filteredEntries = filteredEntries.filter(entry => {
                    if (entry.expiresAt && entry.expiresAt < new Date()) {
                        // Schedule for deletion
                        setTimeout(() => this.deleteEntry(entry.id), 0);
                        return false;
                    }
                    return true;
                });
            }
            const total = filteredEntries.length;
            // Apply sorting
            if (options.sortBy) {
                filteredEntries.sort((a, b) => {
                    const aVal = this.getPropertyValue(a, options.sortBy);
                    const bVal = this.getPropertyValue(b, options.sortBy);
                    const multiplier = options.sortOrder === 'desc' ? -1 : 1;
                    if (aVal < bVal)
                        return -1 * multiplier;
                    if (aVal > bVal)
                        return 1 * multiplier;
                    return 0;
                });
            }
            // Apply pagination
            const offset = options.offset || 0;
            const limit = options.limit || filteredEntries.length;
            const paginatedEntries = filteredEntries.slice(offset, offset + limit);
            // Update last accessed times
            paginatedEntries.forEach(entry => {
                entry.lastAccessedAt = new Date();
            });
            // Generate aggregations if requested
            let aggregations;
            if (options.aggregateBy) {
                aggregations = this.generateAggregations(filteredEntries, options.aggregateBy);
            }
            this.recordMetric('query', Date.now() - startTime);
            return {
                entries: paginatedEntries,
                total,
                aggregations
            };
        }
        catch (error) {
            this.recordMetric('query-error', Date.now() - startTime);
            throw error;
        }
    }
    // === EXPORT OPERATIONS ===
    async export(filePath, options) {
        const startTime = Date.now();
        try {
            this.logger.info('Starting memory export', { filePath, format: options.format });
            // Query entries to export
            const queryResult = await this.query(options.filtering || {});
            const entries = queryResult.entries;
            if (entries.length === 0) {
                throw new Error('No entries found matching export criteria');
            }
            // Prepare export data
            let exportData;
            switch (options.format) {
                case 'json':
                    exportData = this.prepareJsonExport(entries, options);
                    break;
                case 'csv':
                    exportData = this.prepareCsvExport(entries, options);
                    break;
                case 'xml':
                    exportData = this.prepareXmlExport(entries, options);
                    break;
                case 'yaml':
                    exportData = this.prepareYamlExport(entries, options);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${options.format}`);
            }
            // Apply compression if requested
            if (options.compression) {
                exportData = await this.compressData(exportData);
            }
            // Apply encryption if requested
            if (options.encryption?.enabled) {
                exportData = await this.encryptData(exportData, options.encryption);
            }
            // Write to file
            await node_fs_1.promises.mkdir((0, node_path_1.dirname)(filePath), { recursive: true });
            await node_fs_1.promises.writeFile(filePath, exportData);
            // Calculate file stats
            const stats = await node_fs_1.promises.stat(filePath);
            const checksum = this.calculateChecksum(exportData);
            this.logger.info('Memory export completed', {
                entriesExported: entries.length,
                fileSize: stats.size,
                checksum
            });
            this.emit('memory:exported', {
                filePath,
                entriesExported: entries.length,
                fileSize: stats.size
            });
            this.recordMetric('export', Date.now() - startTime);
            return {
                entriesExported: entries.length,
                fileSize: stats.size,
                checksum
            };
        }
        catch (error) {
            this.recordMetric('export-error', Date.now() - startTime);
            throw error;
        }
    }
    // === IMPORT OPERATIONS ===
    async import(filePath, options) {
        const startTime = Date.now();
        try {
            this.logger.info('Starting memory import', { filePath, format: options.format });
            // Read and parse file
            const fileContent = await node_fs_1.promises.readFile(filePath, 'utf-8');
            let importData;
            switch (options.format) {
                case 'json':
                    importData = this.parseJsonImport(fileContent);
                    break;
                case 'csv':
                    importData = this.parseCsvImport(fileContent);
                    break;
                case 'xml':
                    importData = this.parseXmlImport(fileContent);
                    break;
                case 'yaml':
                    importData = this.parseYamlImport(fileContent);
                    break;
                default:
                    throw new Error(`Unsupported import format: ${options.format}`);
            }
            // Validate data if requested
            if (options.validation) {
                importData = this.validateImportData(importData);
            }
            // Apply transformations if provided
            if (options.transformation) {
                importData = this.transformImportData(importData, options.transformation);
            }
            // Process imports
            const results = {
                entriesImported: 0,
                entriesSkipped: 0,
                entriesUpdated: 0,
                conflicts: []
            };
            for (const item of importData) {
                if (options.dryRun) {
                    // Dry run - just check for conflicts
                    const existing = this.findEntryByKey(item.key, item.namespace);
                    if (existing) {
                        results.conflicts.push(`Key '${item.key}' already exists in namespace '${item.namespace}'`);
                    }
                    continue;
                }
                try {
                    const result = await this.importSingleEntry(item, options);
                    switch (result.action) {
                        case 'imported':
                            results.entriesImported++;
                            break;
                        case 'updated':
                            results.entriesUpdated++;
                            break;
                        case 'skipped':
                            results.entriesSkipped++;
                            break;
                        case 'conflict':
                            results.conflicts.push(result.message || 'Unknown conflict');
                            break;
                    }
                }
                catch (error) {
                    results.conflicts.push(`Error importing '${item.key}': ${(error instanceof Error ? error.message : String(error))}`);
                }
            }
            this.logger.info('Memory import completed', results);
            this.emit('memory:imported', results);
            this.recordMetric('import', Date.now() - startTime);
            return results;
        }
        catch (error) {
            this.recordMetric('import-error', Date.now() - startTime);
            throw error;
        }
    }
    // === STATISTICS AND ANALYTICS ===
    async getStatistics() {
        const startTime = Date.now();
        try {
            const stats = this.calculateStatistics();
            this.recordMetric('stats', Date.now() - startTime);
            return stats;
        }
        catch (error) {
            this.recordMetric('stats-error', Date.now() - startTime);
            throw error;
        }
    }
    // === CLEANUP OPERATIONS ===
    async cleanup(options = {}) {
        const startTime = Date.now();
        try {
            this.logger.info('Starting memory cleanup', options);
            const results = {
                entriesRemoved: 0,
                entriesArchived: 0,
                entriesCompressed: 0,
                spaceSaved: 0,
                actions: []
            };
            // Get all entries for processing
            const allEntries = Array.from(this.entries.values());
            const now = new Date();
            // Phase 1: Remove expired entries
            if (options.removeExpired !== false) {
                const expiredEntries = allEntries.filter(entry => entry.expiresAt && entry.expiresAt < now);
                for (const entry of expiredEntries) {
                    if (!options.dryRun) {
                        await this.deleteEntry(entry.id);
                    }
                    results.entriesRemoved++;
                    results.spaceSaved += entry.size;
                }
                if (expiredEntries.length > 0) {
                    results.actions.push(`Removed ${expiredEntries.length} expired entries`);
                }
            }
            // Phase 2: Remove old entries
            if (options.removeOlderThan) {
                const cutoffDate = new Date(now.getTime() - (options.removeOlderThan * 24 * 60 * 60 * 1000));
                const oldEntries = allEntries.filter(entry => entry.createdAt < cutoffDate);
                for (const entry of oldEntries) {
                    if (!options.dryRun) {
                        await this.deleteEntry(entry.id);
                    }
                    results.entriesRemoved++;
                    results.spaceSaved += entry.size;
                }
                if (oldEntries.length > 0) {
                    results.actions.push(`Removed ${oldEntries.length} entries older than ${options.removeOlderThan} days`);
                }
            }
            // Phase 3: Remove unaccessed entries
            if (options.removeUnaccessed) {
                const cutoffDate = new Date(now.getTime() - (options.removeUnaccessed * 24 * 60 * 60 * 1000));
                const unaccessedEntries = allEntries.filter(entry => entry.lastAccessedAt < cutoffDate);
                for (const entry of unaccessedEntries) {
                    if (!options.dryRun) {
                        await this.deleteEntry(entry.id);
                    }
                    results.entriesRemoved++;
                    results.spaceSaved += entry.size;
                }
                if (unaccessedEntries.length > 0) {
                    results.actions.push(`Removed ${unaccessedEntries.length} entries not accessed in ${options.removeUnaccessed} days`);
                }
            }
            // Phase 4: Archive old entries
            if (options.archiveOld?.enabled) {
                const cutoffDate = new Date(now.getTime() - (options.archiveOld.olderThan * 24 * 60 * 60 * 1000));
                const archiveEntries = allEntries.filter(entry => entry.createdAt < cutoffDate &&
                    !entry.expiresAt // Don't archive entries that will expire
                );
                if (archiveEntries.length > 0 && !options.dryRun) {
                    await this.archiveEntries(archiveEntries, options.archiveOld.archivePath);
                }
                results.entriesArchived = archiveEntries.length;
                if (archiveEntries.length > 0) {
                    results.actions.push(`Archived ${archiveEntries.length} old entries`);
                }
            }
            // Phase 5: Compress eligible entries
            if (options.compressEligible !== false && this.config.autoCompress) {
                const uncompressedEntries = allEntries.filter(entry => !entry.compressed && entry.size > this.config.compressionThreshold);
                for (const entry of uncompressedEntries) {
                    if (!options.dryRun) {
                        const originalSize = entry.size;
                        const compressedValue = await this.compressValue(entry.value);
                        entry.value = compressedValue;
                        entry.compressed = true;
                        entry.size = this.calculateSize(compressedValue);
                        results.spaceSaved += originalSize - entry.size;
                    }
                    results.entriesCompressed++;
                }
                if (uncompressedEntries.length > 0) {
                    results.actions.push(`Compressed ${uncompressedEntries.length} entries`);
                }
            }
            // Phase 6: Apply retention policies
            if (options.retentionPolicies) {
                for (const policy of options.retentionPolicies) {
                    const policyResults = await this.applyRetentionPolicy(policy, options.dryRun);
                    results.entriesRemoved += policyResults.removed;
                    results.spaceSaved += policyResults.spaceSaved;
                    if (policyResults.removed > 0) {
                        results.actions.push(`Retention policy '${policy.namespace}': removed ${policyResults.removed} entries`);
                    }
                }
            }
            // Phase 7: Remove orphaned references
            if (options.removeOrphaned !== false) {
                const orphanedCount = await this.cleanupOrphanedReferences(options.dryRun);
                if (orphanedCount > 0) {
                    results.actions.push(`Cleaned up ${orphanedCount} orphaned references`);
                }
            }
            // Phase 8: Remove duplicates
            if (options.removeDuplicates) {
                const duplicatesResults = await this.removeDuplicateEntries(options.dryRun);
                results.entriesRemoved += duplicatesResults.removed;
                results.spaceSaved += duplicatesResults.spaceSaved;
                if (duplicatesResults.removed > 0) {
                    results.actions.push(`Removed ${duplicatesResults.removed} duplicate entries`);
                }
            }
            // Rebuild index if significant changes
            if ((results.entriesRemoved + results.entriesArchived) > 100 && !options.dryRun) {
                await this.rebuildIndex();
                results.actions.push('Rebuilt search index');
            }
            this.logger.info('Memory cleanup completed', results);
            this.emit('memory:cleanup-completed', results);
            this.recordMetric('cleanup', Date.now() - startTime);
            return results;
        }
        catch (error) {
            this.recordMetric('cleanup-error', Date.now() - startTime);
            throw error;
        }
    }
    // === UTILITY METHODS ===
    createEmptyIndex() {
        return {
            keys: new Map(),
            tags: new Map(),
            types: new Map(),
            namespaces: new Map(),
            owners: new Map(),
            fullText: new Map()
        };
    }
    async processValue(value, compress) {
        let processedValue = value;
        let isCompressed = false;
        // Auto-compress if enabled and value is large enough
        if ((compress || this.config.autoCompress) && this.calculateSize(value) > this.config.compressionThreshold) {
            processedValue = await this.compressValue(value);
            isCompressed = true;
        }
        return { value: processedValue, compressed: isCompressed };
    }
    async compressValue(value) {
        // Placeholder for compression implementation
        // In a real implementation, you would use a compression library like zlib
        return JSON.stringify(value);
    }
    async decompressValue(value) {
        // Placeholder for decompression implementation
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    calculateSize(value) {
        return JSON.stringify(value).length;
    }
    calculateChecksum(value) {
        return (0, node_crypto_1.createHash)('sha256').update(JSON.stringify(value)).digest('hex');
    }
    inferType(value) {
        if (Array.isArray(value))
            return 'array';
        if (value === null)
            return 'null';
        return typeof value;
    }
    findEntryByKey(key, namespace) {
        for (const entry of this.entries.values()) {
            if (entry.key === key && (!namespace || entry.namespace === namespace)) {
                return entry;
            }
        }
        return undefined;
    }
    updateIndex(entry, operation) {
        if (!this.config.indexingEnabled)
            return;
        const { id, key, tags, type, namespace, owner, value } = entry;
        if (operation === 'delete') {
            // Remove from all indices
            this.removeFromIndex(this.index.keys, key, id);
            tags.forEach(tag => this.removeFromIndex(this.index.tags, tag, id));
            this.removeFromIndex(this.index.types, type, id);
            this.removeFromIndex(this.index.namespaces, namespace, id);
            this.removeFromIndex(this.index.owners, owner, id);
            // Remove from full-text index
            const words = this.extractWords(value);
            words.forEach(word => this.removeFromIndex(this.index.fullText, word, id));
        }
        else {
            // Add to indices
            this.addToIndex(this.index.keys, key, id);
            tags.forEach(tag => this.addToIndex(this.index.tags, tag, id));
            this.addToIndex(this.index.types, type, id);
            this.addToIndex(this.index.namespaces, namespace, id);
            this.addToIndex(this.index.owners, owner, id);
            // Add to full-text index
            const words = this.extractWords(value);
            words.forEach(word => this.addToIndex(this.index.fullText, word, id));
        }
    }
    addToIndex(indexMap, key, entryId) {
        if (!indexMap.has(key)) {
            indexMap.set(key, []);
        }
        const entries = indexMap.get(key);
        if (!entries.includes(entryId)) {
            entries.push(entryId);
        }
    }
    removeFromIndex(indexMap, key, entryId) {
        const entries = indexMap.get(key);
        if (entries) {
            const index = entries.indexOf(entryId);
            if (index > -1) {
                entries.splice(index, 1);
            }
            if (entries.length === 0) {
                indexMap.delete(key);
            }
        }
    }
    extractWords(value) {
        const text = typeof value === 'string' ? value : JSON.stringify(value);
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
    updateCache(key, entry) {
        if (this.cache.size >= this.config.cacheSize) {
            this.evictCache();
        }
        this.cache.set(key, {
            entry: { ...entry },
            expiry: Date.now() + this.config.cacheTtl
        });
    }
    evictCache() {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].expiry - b[1].expiry);
        const toRemove = entries.slice(0, Math.floor(this.config.cacheSize * 0.1));
        toRemove.forEach(([key]) => this.cache.delete(key));
    }
    recordMetric(operation, duration) {
        const current = this.operationMetrics.get(operation) || { count: 0, totalTime: 0 };
        current.count++;
        current.totalTime += duration;
        this.operationMetrics.set(operation, current);
    }
    initializeStatistics() {
        return {
            overview: {
                totalEntries: 0,
                totalSize: 0,
                compressedEntries: 0,
                compressionRatio: 0,
                indexSize: 0,
                memoryUsage: 0,
                diskUsage: 0
            },
            distribution: {
                byNamespace: {},
                byType: {},
                byOwner: {},
                byAccessLevel: {}
            },
            temporal: {
                entriesCreatedLast24h: 0,
                entriesUpdatedLast24h: 0,
                entriesAccessedLast24h: 0
            },
            performance: {
                averageQueryTime: 0,
                averageWriteTime: 0,
                cacheHitRatio: 0,
                indexEfficiency: 0
            },
            health: {
                expiredEntries: 0,
                orphanedReferences: 0,
                duplicateKeys: 0,
                corruptedEntries: 0,
                recommendedCleanup: false
            },
            optimization: {
                suggestions: [],
                potentialSavings: {
                    compression: 0,
                    cleanup: 0,
                    deduplication: 0
                },
                indexOptimization: []
            }
        };
    }
    // === COMPLEX IMPLEMENTATION METHODS ===
    // These would be fully implemented in a production system
    queryWithIndex(options) {
        // Implementation would use the index for efficient querying
        return Array.from(this.entries.values());
    }
    matchesQuery(entry, options) {
        // Comprehensive query matching logic
        if (options.namespace && entry.namespace !== options.namespace)
            return false;
        if (options.type && entry.type !== options.type)
            return false;
        if (options.owner && entry.owner !== options.owner)
            return false;
        if (options.accessLevel && entry.accessLevel !== options.accessLevel)
            return false;
        if (options.tags && options.tags.length > 0) {
            const hasAllTags = options.tags.every(tag => entry.tags.includes(tag));
            if (!hasAllTags)
                return false;
        }
        if (options.keyPattern) {
            const regex = new RegExp(options.keyPattern, 'i');
            if (!regex.test(entry.key))
                return false;
        }
        if (options.valueSearch) {
            const valueStr = JSON.stringify(entry.value).toLowerCase();
            if (!valueStr.includes(options.valueSearch.toLowerCase()))
                return false;
        }
        // Date range checks
        if (options.createdAfter && entry.createdAt < options.createdAfter)
            return false;
        if (options.createdBefore && entry.createdAt > options.createdBefore)
            return false;
        if (options.updatedAfter && entry.updatedAt < options.updatedAfter)
            return false;
        if (options.updatedBefore && entry.updatedAt > options.updatedBefore)
            return false;
        // Size checks
        if (options.sizeGreaterThan && entry.size <= options.sizeGreaterThan)
            return false;
        if (options.sizeLessThan && entry.size >= options.sizeLessThan)
            return false;
        return true;
    }
    getPropertyValue(entry, property) {
        switch (property) {
            case 'key': return entry.key;
            case 'createdAt': return entry.createdAt.getTime();
            case 'updatedAt': return entry.updatedAt.getTime();
            case 'lastAccessedAt': return entry.lastAccessedAt.getTime();
            case 'size': return entry.size;
            case 'type': return entry.type;
            default: return entry.key;
        }
    }
    generateAggregations(entries, aggregateBy) {
        const aggregations = {};
        switch (aggregateBy) {
            case 'namespace':
                aggregations.namespaces = this.aggregateByProperty(entries, 'namespace');
                break;
            case 'type':
                aggregations.types = this.aggregateByProperty(entries, 'type');
                break;
            case 'owner':
                aggregations.owners = this.aggregateByProperty(entries, 'owner');
                break;
            case 'tags':
                aggregations.tags = this.aggregateByTags(entries);
                break;
        }
        return aggregations;
    }
    aggregateByProperty(entries, property) {
        const result = {};
        for (const entry of entries) {
            const value = String(entry[property]);
            if (!result[value]) {
                result[value] = { count: 0, totalSize: 0 };
            }
            result[value].count++;
            result[value].totalSize += entry.size;
        }
        return result;
    }
    aggregateByTags(entries) {
        const result = {};
        for (const entry of entries) {
            for (const tag of entry.tags) {
                if (!result[tag]) {
                    result[tag] = { count: 0, totalSize: 0 };
                }
                result[tag].count++;
                result[tag].totalSize += entry.size;
            }
        }
        return result;
    }
    // === EXPORT/IMPORT HELPERS ===
    prepareJsonExport(entries, options) {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0',
                totalEntries: entries.length,
                format: 'json'
            },
            entries: options.includeMetadata
                ? entries
                : entries.map(entry => ({
                    key: entry.key,
                    value: entry.value,
                    type: entry.type,
                    namespace: entry.namespace,
                    tags: entry.tags
                }))
        };
        return JSON.stringify(exportData, null, 2);
    }
    prepareCsvExport(entries, options) {
        // CSV export implementation
        const headers = ['key', 'value', 'type', 'namespace', 'tags'];
        const rows = entries.map(entry => [
            entry.key,
            JSON.stringify(entry.value),
            entry.type,
            entry.namespace,
            entry.tags.join(';')
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    prepareXmlExport(entries, options) {
        // XML export implementation
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<memory>\n';
        for (const entry of entries) {
            xml += `  <entry>\n`;
            xml += `    <key>${this.escapeXml(entry.key)}</key>\n`;
            xml += `    <value>${this.escapeXml(JSON.stringify(entry.value))}</value>\n`;
            xml += `    <type>${this.escapeXml(entry.type)}</type>\n`;
            xml += `    <namespace>${this.escapeXml(entry.namespace)}</namespace>\n`;
            xml += `    <tags>${this.escapeXml(entry.tags.join(','))}</tags>\n`;
            xml += `  </entry>\n`;
        }
        xml += '</memory>';
        return xml;
    }
    prepareYamlExport(entries, options) {
        // YAML export implementation - simplified
        let yaml = 'memory:\n';
        for (const entry of entries) {
            yaml += `  - key: "${entry.key}"\n`;
            yaml += `    value: ${JSON.stringify(entry.value)}\n`;
            yaml += `    type: "${entry.type}"\n`;
            yaml += `    namespace: "${entry.namespace}"\n`;
            yaml += `    tags: [${entry.tags.map(t => `"${t}"`).join(', ')}]\n`;
        }
        return yaml;
    }
    escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    parseJsonImport(content) {
        const data = JSON.parse(content);
        return data.entries || data;
    }
    parseCsvImport(content) {
        // Simple CSV parsing
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        const entries = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j]] = values[j];
            }
            entries.push(entry);
        }
        return entries;
    }
    parseXmlImport(content) {
        // XML parsing would require a proper XML parser
        throw new Error('XML import not implemented in this example');
    }
    parseYamlImport(content) {
        // YAML parsing would require a YAML parser
        throw new Error('YAML import not implemented in this example');
    }
    validateImportData(data) {
        return data.filter(item => {
            return item.key && item.value !== undefined;
        });
    }
    transformImportData(data, transformation) {
        return data.map(item => {
            const transformed = { ...item };
            // Apply key mapping
            if (transformation.keyMapping) {
                for (const [oldKey, newKey] of Object.entries(transformation.keyMapping)) {
                    if (transformed[oldKey] !== undefined) {
                        transformed[newKey] = transformed[oldKey];
                        delete transformed[oldKey];
                    }
                }
            }
            // Apply value transformation
            if (transformation.valueTransformation) {
                transformed.value = transformation.valueTransformation(transformed.value);
            }
            // Extract metadata
            if (transformation.metadataExtraction) {
                transformed.metadata = transformation.metadataExtraction(transformed);
            }
            return transformed;
        });
    }
    async importSingleEntry(item, options) {
        const existing = this.findEntryByKey(item.key, item.namespace || options.namespace);
        if (existing) {
            switch (options.conflictResolution) {
                case 'skip':
                    return { action: 'skipped' };
                case 'overwrite':
                    await this.update(item.key, item.value, { namespace: item.namespace });
                    return { action: 'updated' };
                case 'merge':
                    await this.update(item.key, item.value, {
                        namespace: item.namespace,
                        merge: true
                    });
                    return { action: 'updated' };
                case 'rename':
                    const newKey = `${item.key}_imported_${Date.now()}`;
                    await this.store(newKey, item.value, {
                        namespace: item.namespace,
                        type: item.type,
                        tags: item.tags,
                        metadata: item.metadata
                    });
                    return { action: 'imported' };
                default:
                    return {
                        action: 'conflict',
                        message: `Key '${item.key}' already exists`
                    };
            }
        }
        else {
            await this.store(item.key, item.value, {
                namespace: item.namespace || options.namespace,
                type: item.type,
                tags: item.tags,
                metadata: item.metadata
            });
            return { action: 'imported' };
        }
    }
    // === STATISTICS CALCULATION ===
    calculateStatistics() {
        const entries = Array.from(this.entries.values());
        const now = new Date();
        const last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const stats = {
            overview: {
                totalEntries: entries.length,
                totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
                compressedEntries: entries.filter(entry => entry.compressed).length,
                compressionRatio: 0,
                indexSize: this.calculateIndexSize(),
                memoryUsage: process.memoryUsage().heapUsed,
                diskUsage: 0 // Would be calculated from actual file system
            },
            distribution: {
                byNamespace: this.calculateDistribution(entries, 'namespace'),
                byType: this.calculateDistribution(entries, 'type'),
                byOwner: this.calculateDistribution(entries, 'owner'),
                byAccessLevel: this.calculateDistribution(entries, 'accessLevel')
            },
            temporal: {
                entriesCreatedLast24h: entries.filter(e => e.createdAt >= last24h).length,
                entriesUpdatedLast24h: entries.filter(e => e.updatedAt >= last24h).length,
                entriesAccessedLast24h: entries.filter(e => e.lastAccessedAt >= last24h).length,
                oldestEntry: entries.length > 0 ?
                    entries.reduce((oldest, entry) => entry.createdAt < oldest.createdAt ? entry : oldest).createdAt : undefined,
                newestEntry: entries.length > 0 ?
                    entries.reduce((newest, entry) => entry.createdAt > newest.createdAt ? entry : newest).createdAt : undefined
            },
            performance: this.calculatePerformanceMetrics(),
            health: this.calculateHealthMetrics(entries, now),
            optimization: this.generateOptimizationSuggestions(entries)
        };
        // Calculate compression ratio
        const uncompressedSize = entries.filter(e => !e.compressed).reduce((sum, e) => sum + e.size, 0);
        const compressedSize = entries.filter(e => e.compressed).reduce((sum, e) => sum + e.size, 0);
        stats.overview.compressionRatio = uncompressedSize > 0 ?
            (uncompressedSize - compressedSize) / uncompressedSize : 0;
        return stats;
    }
    calculateDistribution(entries, property) {
        const distribution = {};
        for (const entry of entries) {
            const value = String(entry[property]);
            if (!distribution[value]) {
                distribution[value] = { count: 0, size: 0 };
            }
            distribution[value].count++;
            distribution[value].size += entry.size;
        }
        return distribution;
    }
    calculateIndexSize() {
        let size = 0;
        for (const [, entries] of this.index.keys) {
            size += entries.length * 50; // Rough estimate
        }
        return size;
    }
    calculatePerformanceMetrics() {
        const queryMetrics = this.operationMetrics.get('query') || { count: 0, totalTime: 0 };
        const writeMetrics = this.operationMetrics.get('store') || { count: 0, totalTime: 0 };
        const cacheMetrics = this.operationMetrics.get('retrieve-cache') || { count: 0, totalTime: 0 };
        const totalRetrieves = (this.operationMetrics.get('retrieve') || { count: 0 }).count + cacheMetrics.count;
        return {
            averageQueryTime: queryMetrics.count > 0 ? queryMetrics.totalTime / queryMetrics.count : 0,
            averageWriteTime: writeMetrics.count > 0 ? writeMetrics.totalTime / writeMetrics.count : 0,
            cacheHitRatio: totalRetrieves > 0 ? cacheMetrics.count / totalRetrieves : 0,
            indexEfficiency: this.config.indexingEnabled ? 0.95 : 0 // Placeholder
        };
    }
    calculateHealthMetrics(entries, now) {
        const expiredEntries = entries.filter(e => e.expiresAt && e.expiresAt < now).length;
        const duplicateKeys = this.findDuplicateKeys(entries);
        return {
            expiredEntries,
            orphanedReferences: 0, // Would be calculated by checking references
            duplicateKeys: duplicateKeys.length,
            corruptedEntries: 0, // Would be calculated by validating checksums
            recommendedCleanup: expiredEntries > 10 || duplicateKeys.length > 5
        };
    }
    generateOptimizationSuggestions(entries) {
        const suggestions = [];
        const potentialSavings = { compression: 0, cleanup: 0, deduplication: 0 };
        // Compression suggestions
        const uncompressedLarge = entries.filter(e => !e.compressed && e.size > this.config.compressionThreshold);
        if (uncompressedLarge.length > 0) {
            suggestions.push(`${uncompressedLarge.length} entries could benefit from compression`);
            potentialSavings.compression = uncompressedLarge.reduce((sum, e) => sum + e.size * 0.6, 0);
        }
        // Cleanup suggestions
        const now = new Date();
        const oldEntries = entries.filter(e => now.getTime() - e.lastAccessedAt.getTime() > (30 * 24 * 60 * 60 * 1000));
        if (oldEntries.length > 0) {
            suggestions.push(`${oldEntries.length} entries haven't been accessed in 30+ days`);
            potentialSavings.cleanup = oldEntries.reduce((sum, e) => sum + e.size, 0);
        }
        // Deduplication suggestions
        const duplicates = this.findDuplicateKeys(entries);
        if (duplicates.length > 0) {
            suggestions.push(`${duplicates.length} duplicate keys found`);
            potentialSavings.deduplication = duplicates.reduce((sum, group) => sum + group.entries.slice(1).reduce((s, e) => s + e.size, 0), 0);
        }
        return {
            suggestions,
            potentialSavings,
            indexOptimization: this.config.indexingEnabled ?
                ['Consider periodic index rebuilding for optimal performance'] :
                ['Enable indexing for better query performance']
        };
    }
    findDuplicateKeys(entries) {
        const keyMap = new Map();
        for (const entry of entries) {
            const compositeKey = `${entry.namespace}:${entry.key}`;
            if (!keyMap.has(compositeKey)) {
                keyMap.set(compositeKey, []);
            }
            keyMap.get(compositeKey).push(entry);
        }
        const duplicates = [];
        for (const [compositeKey, entryList] of keyMap) {
            if (entryList.length > 1) {
                const [namespace, key] = compositeKey.split(':', 2);
                duplicates.push({ key, namespace, entries: entryList });
            }
        }
        return duplicates;
    }
    // === CLEANUP IMPLEMENTATION ===
    async applyRetentionPolicies(entry) {
        // Apply matching retention policies to the entry
        for (const policy of this.retentionPolicies.values()) {
            if (this.policyMatches(policy, entry)) {
                await this.enforceRetentionPolicy(policy, entry);
            }
        }
    }
    policyMatches(policy, entry) {
        if (policy.namespace && entry.namespace !== policy.namespace)
            return false;
        if (policy.type && entry.type !== policy.type)
            return false;
        if (policy.tags && !policy.tags.every(tag => entry.tags.includes(tag)))
            return false;
        return true;
    }
    async enforceRetentionPolicy(policy, entry) {
        const now = new Date();
        // Check age limit
        if (policy.maxAge) {
            const ageInDays = (now.getTime() - entry.createdAt.getTime()) / (24 * 60 * 60 * 1000);
            if (ageInDays > policy.maxAge) {
                await this.deleteEntry(entry.id);
                return;
            }
        }
        // Count and size limits would require more complex logic
        // This is a simplified implementation
    }
    async applyRetentionPolicy(policy, dryRun) {
        const matchingEntries = Array.from(this.entries.values()).filter(entry => {
            if (policy.namespace && entry.namespace !== policy.namespace)
                return false;
            return true;
        });
        let toRemove = [];
        const now = new Date();
        // Apply age limit
        if (policy.maxAge) {
            const cutoffDate = new Date(now.getTime() - (policy.maxAge * 24 * 60 * 60 * 1000));
            toRemove = matchingEntries.filter(entry => entry.createdAt < cutoffDate);
        }
        // Apply count limit
        if (policy.maxCount && matchingEntries.length > policy.maxCount) {
            const sorted = matchingEntries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            toRemove = sorted.slice(0, matchingEntries.length - policy.maxCount);
        }
        // Apply size limit
        if (policy.sizeLimit) {
            const totalSize = matchingEntries.reduce((sum, entry) => sum + entry.size, 0);
            if (totalSize > policy.sizeLimit) {
                const sorted = matchingEntries.sort((a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime());
                let currentSize = totalSize;
                toRemove = [];
                for (const entry of sorted) {
                    if (currentSize <= policy.sizeLimit)
                        break;
                    toRemove.push(entry);
                    currentSize -= entry.size;
                }
            }
        }
        const spaceSaved = toRemove.reduce((sum, entry) => sum + entry.size, 0);
        if (!dryRun) {
            for (const entry of toRemove) {
                await this.deleteEntry(entry.id);
            }
        }
        return { removed: toRemove.length, spaceSaved };
    }
    async cleanupOrphanedReferences(dryRun) {
        // Implementation would check for broken references between entries
        return 0;
    }
    async removeDuplicateEntries(dryRun) {
        const duplicates = this.findDuplicateKeys(Array.from(this.entries.values()));
        let removed = 0;
        let spaceSaved = 0;
        for (const duplicate of duplicates) {
            // Keep the newest entry, remove others
            const sorted = duplicate.entries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
            const toRemove = sorted.slice(1);
            for (const entry of toRemove) {
                spaceSaved += entry.size;
                removed++;
                if (!dryRun) {
                    await this.deleteEntry(entry.id);
                }
            }
        }
        return { removed, spaceSaved };
    }
    async archiveEntries(entries, archivePath) {
        const archiveData = {
            archivedAt: new Date().toISOString(),
            entries: entries
        };
        const archiveFile = (0, node_path_1.join)(archivePath, `archive-${Date.now()}.json`);
        await node_fs_1.promises.mkdir((0, node_path_1.dirname)(archiveFile), { recursive: true });
        await node_fs_1.promises.writeFile(archiveFile, JSON.stringify(archiveData, null, 2));
        // Remove archived entries from active memory
        for (const entry of entries) {
            await this.deleteEntry(entry.id);
        }
    }
    async rebuildIndex() {
        this.logger.info('Rebuilding memory index');
        this.index = this.createEmptyIndex();
        for (const entry of this.entries.values()) {
            this.updateIndex(entry, 'create');
        }
        this.logger.info('Memory index rebuilt successfully');
    }
    startAutoCleanup() {
        this.cleanupInterval = setInterval(async () => {
            try {
                await this.cleanup({
                    removeExpired: true,
                    removeUnaccessed: 7, // Remove entries not accessed in 7 days
                    compressEligible: true
                });
            }
            catch (error) {
                this.logger.error('Auto cleanup failed', error);
            }
        }, this.config.cleanupInterval);
    }
    // === PERSISTENCE ===
    async loadPersistedData() {
        try {
            const dataFile = (0, node_path_1.join)(this.dataPath, 'entries.json');
            const indexFile = (0, node_path_1.join)(this.indexPath, 'index.json');
            // Load entries
            try {
                const entriesData = await node_fs_1.promises.readFile(dataFile, 'utf-8');
                const entriesArray = JSON.parse(entriesData);
                for (const entryData of entriesArray) {
                    // Convert date strings back to Date objects
                    entryData.createdAt = new Date(entryData.createdAt);
                    entryData.updatedAt = new Date(entryData.updatedAt);
                    entryData.lastAccessedAt = new Date(entryData.lastAccessedAt);
                    if (entryData.expiresAt) {
                        entryData.expiresAt = new Date(entryData.expiresAt);
                    }
                    this.entries.set(entryData.id, entryData);
                }
                this.logger.info(`Loaded ${entriesArray.length} entries from persistence`);
            }
            catch (error) {
                // File doesn't exist or is corrupted
                this.logger.info('No persisted entries found, starting fresh');
            }
            // Rebuild index
            if (this.config.indexingEnabled) {
                await this.rebuildIndex();
            }
        }
        catch (error) {
            this.logger.error('Failed to load persisted data', error);
        }
    }
    async persistData() {
        try {
            const dataFile = (0, node_path_1.join)(this.dataPath, 'entries.json');
            const entriesArray = Array.from(this.entries.values());
            await node_fs_1.promises.writeFile(dataFile, JSON.stringify(entriesArray, null, 2));
            this.logger.info(`Persisted ${entriesArray.length} entries`);
        }
        catch (error) {
            this.logger.error('Failed to persist data', error);
        }
    }
    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = (0, node_path_1.join)(this.backupPath, `backup-${timestamp}.json`);
            const backup = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                entries: Array.from(this.entries.values()),
                statistics: await this.getStatistics()
            };
            await node_fs_1.promises.writeFile(backupFile, JSON.stringify(backup, null, 2));
            this.logger.info(`Created backup: ${backupFile}`);
            // Clean old backups
            await this.cleanOldBackups();
        }
        catch (error) {
            this.logger.error('Failed to create backup', error);
        }
    }
    async cleanOldBackups() {
        try {
            const files = await node_fs_1.promises.readdir(this.backupPath);
            const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));
            if (backupFiles.length <= this.config.backupRetention) {
                return;
            }
            // Sort by creation time and remove oldest
            const fileStats = await Promise.all(backupFiles.map(async (file) => ({
                file,
                stat: await node_fs_1.promises.stat((0, node_path_1.join)(this.backupPath, file))
            })));
            fileStats.sort((a, b) => a.stat.mtime.getTime() - b.stat.mtime.getTime());
            const toDelete = fileStats.slice(0, fileStats.length - this.config.backupRetention);
            for (const { file } of toDelete) {
                await node_fs_1.promises.unlink((0, node_path_1.join)(this.backupPath, file));
                this.logger.debug(`Deleted old backup: ${file}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to clean old backups', error);
        }
    }
    // === UTILITY METHODS ===
    async compressData(data) {
        // In a real implementation, you would use a compression library
        return data;
    }
    async encryptData(data, encryption) {
        // In a real implementation, you would use a proper encryption library
        return data;
    }
    // === PUBLIC API ===
    async listNamespaces() {
        const namespaces = new Set();
        for (const entry of this.entries.values()) {
            namespaces.add(entry.namespace);
        }
        return Array.from(namespaces).sort();
    }
    async listTypes() {
        const types = new Set();
        for (const entry of this.entries.values()) {
            types.add(entry.type);
        }
        return Array.from(types).sort();
    }
    async listTags() {
        const tags = new Set();
        for (const entry of this.entries.values()) {
            entry.tags.forEach(tag => tags.add(tag));
        }
        return Array.from(tags).sort();
    }
    async getEntryById(id) {
        return this.entries.get(id) || null;
    }
    async exists(key, namespace) {
        return this.findEntryByKey(key, namespace) !== undefined;
    }
    async count(options = {}) {
        const result = await this.query({ ...options, limit: 0 });
        return result.total;
    }
    async clear(namespace) {
        const entries = Array.from(this.entries.values());
        const toDelete = namespace
            ? entries.filter(entry => entry.namespace === namespace)
            : entries;
        for (const entry of toDelete) {
            await this.deleteEntry(entry.id);
        }
        return toDelete.length;
    }
    getConfiguration() {
        return { ...this.config };
    }
    async updateConfiguration(updates) {
        this.config = { ...this.config, ...updates };
        // Apply configuration changes
        if (updates.autoCleanup !== undefined) {
            if (updates.autoCleanup && !this.cleanupInterval) {
                this.startAutoCleanup();
            }
            else if (!updates.autoCleanup && this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = undefined;
            }
        }
        this.emit('memory:configuration-updated', { config: this.config });
    }
}
exports.AdvancedMemoryManager = AdvancedMemoryManager;
