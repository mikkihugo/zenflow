/**
 * Unified Memory System - DAL Integration.
 *
 * Integrates memory backend functionality using unified DAL
 * Supports all database types through consistent DAL interface.
 */
/**
 * @file Memory coordination system.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
import { createDao, EntityTypes, } from '../database/index';
const logger = getLogger('UnifiedMemory');
/**
 * LanceDB Backend - Vector Database for Semantic Storage using DAL.
 *
 * @example
 */
class LanceDBBackend {
    vectorRepository;
    vectorDAO;
    config;
    constructor(config) {
        this.config = config;
    }
    async initialize() {
        this.vectorRepository = await createDao(EntityTypes.Document, 'lancedb', {
            database: `${this.config.path}/lancedb`,
            options: {
                vectorSize: this.config.lancedb?.vectorDimension || 384,
                metricType: 'cosine',
            },
        });
        this.vectorDAO = await createDao(EntityTypes.Document, 'lancedb', {
            database: `${this.config.path}/lancedb`,
            options: this.config.lancedb,
        });
        logger.info('LanceDB backend initialized with DAL');
    }
    async store(key, value, namespace = 'default') {
        const fullKey = `${namespace}:${key}`;
        const timestamp = Date.now();
        try {
            const serializedValue = JSON.stringify(value);
            const documentText = this.extractTextContent(value);
            const vectorDoc = {
                id: fullKey,
                vector: new Array(this.config.lancedb?.vectorDimension || 384).fill(0),
                metadata: {
                    key,
                    namespace,
                    timestamp,
                    serialized_data: serializedValue,
                    content: documentText,
                    type: typeof value,
                },
            };
            await this.vectorRepository.create(vectorDoc);
            return {
                id: fullKey,
                timestamp,
                status: 'success',
            };
        }
        catch (error) {
            return {
                id: fullKey,
                timestamp,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async retrieve(key, namespace = 'default') {
        try {
            // Use findById instead of bulk vector operations for retrieval
            const result = await this.vectorDAO.findById(`${namespace}:${key}`);
            if (!result)
                return null;
            if (result?.metadata?.serialized_data) {
                return JSON.parse(result?.metadata?.serialized_data);
            }
            return null;
        }
        catch (error) {
            logger.error('LanceDB retrieve error:', error);
            return null;
        }
    }
    async search(pattern, namespace = 'default') {
        const results = {};
        try {
            const allResults = await this.vectorRepository.findAll({ limit: 100 });
            for (const result of allResults || []) {
                const metadata = result?.metadata || {};
                if (metadata.namespace === namespace && metadata?.serialized_data) {
                    const key = metadata?.key;
                    if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
                        results[key] = JSON.parse(metadata?.serialized_data);
                    }
                }
            }
        }
        catch (error) {
            logger.error('LanceDB search error:', error);
        }
        return results;
    }
    async delete(_key, _namespace = 'default') {
        // LanceDB doesn't have direct delete in current interface
        logger.warn('Delete operation not implemented for LanceDB backend');
        return false;
    }
    async listNamespaces() {
        try {
            const searchResult = await this.vectorRepository.findAll({ limit: 1000 });
            const namespaces = new Set();
            for (const result of searchResult || []) {
                if (result?.metadata?.namespace) {
                    namespaces.add(result?.metadata?.namespace);
                }
            }
            return Array.from(namespaces);
        }
        catch (_error) {
            return [];
        }
    }
    async getStats() {
        const allEntries = await this.vectorRepository.findAll();
        const stats = {
            totalVectors: allEntries.length,
            dimensions: this.config.lancedb?.vectorDimension || 384,
        };
        return {
            entries: stats.totalVectors || 0,
            size: stats.totalVectors || 0,
            lastModified: Date.now(),
        };
    }
    extractTextContent(value) {
        if (typeof value === 'object' && value && 'content' in value) {
            return value?.content;
        }
        if (typeof value === 'string')
            return value;
        return JSON.stringify(value);
    }
}
/**
 * SQLite Backend - Relational Database for Structured Storage.
 *
 * @example
 */
class SQLiteBackend {
    db;
    dbPath;
    config;
    constructor(config) {
        this.config = config;
        this.dbPath = `${config?.path}/unified_memory.db`;
    }
    async initialize() {
        const { default: Database } = await import('better-sqlite3');
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
        this.db = new Database(this.dbPath);
        // Configure SQLite options
        if (this.config.sqlite?.walMode !== false) {
            this.db.pragma('journal_mode = WAL');
        }
        if (this.config.sqlite?.autoVacuum !== false) {
            this.db.pragma('auto_vacuum = INCREMENTAL');
        }
        // Create unified memory table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS unified_memory (
        id TEXT PRIMARY KEY,
        namespace TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        value_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        size INTEGER NOT NULL,
        UNIQUE(namespace, key)
      )
    `);
        // Create indexes for performance
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_namespace ON unified_memory(namespace);
      CREATE INDEX IF NOT EXISTS idx_key ON unified_memory(key);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON unified_memory(timestamp);
      CREATE INDEX IF NOT EXISTS idx_type ON unified_memory(value_type);
    `);
        logger.info('SQLite backend initialized');
    }
    async store(key, value, namespace = 'default') {
        const fullKey = `${namespace}:${key}`;
        const timestamp = Date.now();
        const serializedValue = JSON.stringify(value);
        const valueType = Array.isArray(value) ? 'array' : typeof value;
        const size = Buffer.byteLength(serializedValue, 'utf8');
        try {
            const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO unified_memory(id, namespace, key, value, value_type, timestamp, size)
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `);
            stmt.run(fullKey, namespace, key, serializedValue, valueType, timestamp, size);
            return {
                id: fullKey,
                timestamp,
                status: 'success',
            };
        }
        catch (error) {
            return {
                id: fullKey,
                timestamp,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async retrieve(key, namespace = 'default') {
        try {
            const stmt = this.db.prepare(`
        SELECT value FROM unified_memory 
        WHERE namespace = ? AND key = ?
      `);
            const result = stmt.get(namespace, key);
            if (!result)
                return null;
            return JSON.parse(result?.value);
        }
        catch (error) {
            logger.error('SQLite retrieve error:', error);
            return null;
        }
    }
    async search(pattern, namespace = 'default') {
        const results = {};
        const searchPattern = pattern.replace('*', '%');
        try {
            const stmt = this.db.prepare(`
        SELECT key, value FROM unified_memory 
        WHERE namespace = ? AND key LIKE ?
        ORDER BY timestamp DESC
      `);
            const rows = stmt.all(namespace, searchPattern);
            for (const row of rows) {
                try {
                    results[row.key] = JSON.parse(row.value);
                }
                catch (_error) {
                    logger.warn(`Failed to parse value for key ${row.key}`);
                }
            }
        }
        catch (error) {
            logger.error('SQLite search error:', error);
        }
        return results;
    }
    async delete(key, namespace = 'default') {
        try {
            const stmt = this.db.prepare(`
        DELETE FROM unified_memory 
        WHERE namespace = ? AND key = ?
      `);
            const result = stmt.run(namespace, key);
            return result?.changes > 0;
        }
        catch (error) {
            logger.error('SQLite delete error:', error);
            return false;
        }
    }
    async listNamespaces() {
        try {
            const stmt = this.db.prepare(`
        SELECT DISTINCT namespace FROM unified_memory
        ORDER BY namespace
      `);
            const rows = stmt.all();
            return rows.map((row) => row.namespace);
        }
        catch (error) {
            logger.error('SQLite listNamespaces error:', error);
            return [];
        }
    }
    async getStats() {
        try {
            const countStmt = this.db.prepare('SELECT COUNT(*) as count, SUM(size) as totalSize FROM unified_memory');
            const nsStmt = this.db.prepare('SELECT COUNT(DISTINCT namespace) as namespaces FROM unified_memory');
            const countResult = countStmt.get();
            const nsResult = nsStmt.get();
            return {
                entries: countResult?.count,
                size: countResult?.totalSize || 0,
                lastModified: Date.now(),
                namespaces: nsResult?.namespaces,
            };
        }
        catch (error) {
            logger.error('SQLite getStats error:', error);
            return { entries: 0, size: 0, lastModified: Date.now() };
        }
    }
    async close() {
        if (this.db) {
            this.db.close();
            this.db = undefined;
        }
    }
}
/**
 * JSON Backend - File-based Storage for Simple Use Cases.
 *
 * @example
 */
class JSONBackend {
    data = new Map();
    filepath;
    config;
    constructor(config) {
        this.config = config;
        this.filepath = `${config?.path}/unified_memory.json`;
    }
    async initialize() {
        try {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            await fs.mkdir(path.dirname(this.filepath), { recursive: true });
            // Load existing data
            const data = await fs.readFile(this.filepath, 'utf8');
            const parsed = JSON.parse(data);
            this.data = new Map(Object.entries(parsed));
            logger.info(`JSON backend initialized with ${this.data.size} entries`);
        }
        catch {
            // File doesn't exist or is corrupted, start fresh
            logger.info('JSON backend initialized (new file)');
        }
    }
    async store(key, value, namespace = 'default') {
        const fullKey = `${namespace}:${key}`;
        const timestamp = Date.now();
        try {
            this.data.set(fullKey, {
                value,
                timestamp,
                type: Array.isArray(value) ? 'array' : typeof value,
            });
            await this.persist();
            return {
                id: fullKey,
                timestamp,
                status: 'success',
            };
        }
        catch (error) {
            return {
                id: fullKey,
                timestamp,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async retrieve(key, namespace = 'default') {
        const fullKey = `${namespace}:${key}`;
        const entry = this.data.get(fullKey);
        return entry?.value ?? null;
    }
    async search(pattern, namespace = 'default') {
        const results = {};
        const prefix = `${namespace}:`;
        for (const [key, entry] of this.data.entries()) {
            if (key.startsWith(prefix)) {
                const simpleKey = key.substring(prefix.length);
                if (pattern === '*' || simpleKey.includes(pattern.replace('*', ''))) {
                    results[simpleKey] = entry.value;
                }
            }
        }
        return results;
    }
    async delete(key, namespace = 'default') {
        const fullKey = `${namespace}:${key}`;
        const deleted = this.data.delete(fullKey);
        if (deleted) {
            await this.persist();
        }
        return deleted;
    }
    async listNamespaces() {
        const namespaces = new Set();
        for (const key of this.data.keys()) {
            const parts = key.split(':');
            if (parts.length > 0 && parts[0]) {
                namespaces.add(parts[0]);
            }
        }
        return Array.from(namespaces);
    }
    async getStats() {
        const serialized = JSON.stringify(Array.from(this.data.entries()));
        return {
            entries: this.data.size,
            size: Buffer.byteLength(serialized, 'utf8'),
            lastModified: Date.now(),
            namespaces: (await this.listNamespaces()).length,
        };
    }
    async persist() {
        const fs = await import('node:fs/promises');
        // Check size limits
        if (this.config.maxSize) {
            const stats = await this.getStats();
            if (stats.size > this.config.maxSize) {
                throw new Error(`Storage size ${stats.size} exceeds limit ${this.config.maxSize}`);
            }
        }
        // Convert Map to object for JSON serialization
        const obj = {};
        for (const [key, value] of this.data.entries()) {
            obj[key] = value;
        }
        await fs.writeFile(this.filepath, JSON.stringify(obj, null, 2));
    }
}
/**
 * Unified Memory System - Main Interface.
 *
 * @example
 */
export class MemorySystem extends EventEmitter {
    backend;
    config;
    initialized = false;
    constructor(config) {
        super();
        this.config = config;
        // Create appropriate backend
        switch (config?.backend) {
            case 'lancedb':
                this.backend = new LanceDBBackend(config);
                break;
            case 'sqlite':
                this.backend = new SQLiteBackend(config);
                break;
            case 'json':
                this.backend = new JSONBackend(config);
                break;
            case 'kuzu':
                // Kuzu backend would be implemented here
                throw new Error('Kuzu backend not yet implemented');
            default:
                throw new Error(`Unknown backend type: ${config?.backend}`);
        }
    }
    async initialize() {
        if (this.initialized)
            return;
        logger.info(`Initializing unified memory system with ${this.config.backend} backend`);
        try {
            await this.backend.initialize();
            this.initialized = true;
            this.emit('initialized', { backend: this.config.backend });
            logger.info('Unified memory system ready');
        }
        catch (error) {
            logger.error('Failed to initialize memory system:', error);
            throw error;
        }
    }
    async store(key, value, namespace) {
        await this.ensureInitialized();
        const result = await this.backend.store(key, value, namespace);
        if (result.status === 'success') {
            this.emit('stored', { key, namespace, timestamp: result?.timestamp });
        }
        else {
            this.emit('error', {
                operation: 'store',
                key,
                namespace,
                error: result?.error,
            });
        }
        return result;
    }
    async retrieve(key, namespace) {
        await this.ensureInitialized();
        const result = await this.backend.retrieve(key, namespace);
        this.emit('retrieved', { key, namespace, found: result !== null });
        return result;
    }
    async search(pattern, namespace) {
        await this.ensureInitialized();
        const results = await this.backend.search(pattern, namespace);
        this.emit('searched', {
            pattern,
            namespace,
            resultCount: Object.keys(results).length,
        });
        return results;
    }
    async delete(key, namespace) {
        await this.ensureInitialized();
        const deleted = await this.backend.delete(key, namespace);
        this.emit('deleted', { key, namespace, deleted });
        return deleted;
    }
    async listNamespaces() {
        await this.ensureInitialized();
        return this.backend.listNamespaces();
    }
    async getStats() {
        await this.ensureInitialized();
        return this.backend.getStats();
    }
    async close() {
        if (this.backend.close) {
            await this.backend.close();
        }
        this.initialized = false;
        this.emit('closed');
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    // Utility methods for document workflow
    async storeDocument(type, id, document, namespace = 'documents') {
        const key = `${type}:${id}`;
        return this.store(key, {
            ...document,
            documentType: type,
            id,
            updatedAt: new Date().toISOString(),
        }, namespace);
    }
    async retrieveDocument(type, id, namespace = 'documents') {
        const key = `${type}:${id}`;
        return this.retrieve(key, namespace);
    }
    async searchDocuments(type, namespace = 'documents') {
        const pattern = `${type}:*`;
        return this.search(pattern, namespace);
    }
    // Workflow-specific helpers
    async storeVision(id, vision) {
        return this.storeDocument('vision', id, vision);
    }
    async storeADR(id, adr) {
        return this.storeDocument('adr', id, adr);
    }
    async storePRD(id, prd) {
        return this.storeDocument('prd', id, prd);
    }
    async storeEpic(id, epic) {
        return this.storeDocument('epic', id, epic);
    }
    async storeFeature(id, feature) {
        return this.storeDocument('feature', id, feature);
    }
    async storeTask(id, task) {
        return this.storeDocument('task', id, task);
    }
}
//# sourceMappingURL=memory-coordinator.js.map