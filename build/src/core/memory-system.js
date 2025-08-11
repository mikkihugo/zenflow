/**
 * Memory System - Multi-Backend Memory Management.
 *
 * Clean, focused memory system with support for multiple backends.
 * Without bloated "unified" architecture. Supports LanceDB, SQLite, and JSON backends..
 *
 * @example
 * ```typescript
 * const memorySystem = new MemorySystem({
 *   backend: 'sqlite',
 *   path: './data/memory'
 * });
 *
 * await memorySystem.initialize();
 * await memorySystem.store('key', { data: 'value' });
 * const data = await memorySystem.retrieve('key');
 * ```
 */
/**
 * @file Memory-system implementation.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('MemorySystem');
/**
 * JSON file backend implementation.
 *
 * @example
 */
class JSONBackend {
    data = new Map();
    filepath;
    config;
    constructor(config) {
        this.config = config;
        this.filepath = `${config?.path}/memory.json`;
    }
    async initialize() {
        try {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            await fs.mkdir(path.dirname(this.filepath), { recursive: true });
            // Load existing data
            try {
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
        catch (error) {
            logger.error('Failed to initialize JSON backend:', error);
            throw error;
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
            const namespace = key.split(':')[0] ?? 'default';
            namespaces.add(namespace);
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
 * SQLite backend implementation.
 *
 * @example
 */
class SQLiteBackend {
    db;
    dbPath;
    config;
    constructor(config) {
        this.config = config;
        this.dbPath = `${config?.path}/memory.db`;
    }
    async initialize() {
        try {
            const { default: Database } = await import('better-sqlite3');
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
            this.db = new Database(this.dbPath);
            // Configure SQLite options
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('auto_vacuum = INCREMENTAL');
            // Create memory table
            this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory (
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
            // Create indexes
            this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_namespace ON memory(namespace);
        CREATE INDEX IF NOT EXISTS idx_key ON memory(key);
        CREATE INDEX IF NOT EXISTS idx_timestamp ON memory(timestamp);
      `);
            logger.info('SQLite backend initialized');
        }
        catch (error) {
            logger.error('Failed to initialize SQLite backend:', error);
            throw error;
        }
    }
    async store(key, value, namespace = 'default') {
        const fullKey = `${namespace}:${key}`;
        const timestamp = Date.now();
        const serializedValue = JSON.stringify(value);
        const valueType = Array.isArray(value) ? 'array' : typeof value;
        const size = Buffer.byteLength(serializedValue, 'utf8');
        try {
            const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO memory(id, namespace, key, value, value_type, timestamp, size)
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
        SELECT value FROM memory 
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
        SELECT key, value FROM memory 
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
        DELETE FROM memory 
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
        SELECT DISTINCT namespace FROM memory
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
            const countStmt = this.db.prepare('SELECT COUNT(*) as count, SUM(size) as totalSize FROM memory');
            const nsStmt = this.db.prepare('SELECT COUNT(DISTINCT namespace) as namespaces FROM memory');
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
 * LanceDB backend implementation (stub).
 *
 * @example
 */
class LanceDBBackend {
    config;
    constructor(config) {
        this.config = config;
    }
    async initialize() {
        logger.info('LanceDB backend initialized (stub implementation)');
        // Implementation would use LanceDB interface from database layer
    }
    async store(key, _value, namespace) {
        // Stub implementation
        return {
            id: `${namespace || 'default'}:${key}`,
            timestamp: Date.now(),
            status: 'success',
        };
    }
    async retrieve(_key, _namespace) {
        // Stub implementation
        return null;
    }
    async search(_pattern, _namespace) {
        // Stub implementation
        return {};
    }
    async delete(_key, _namespace) {
        // Stub implementation
        return false;
    }
    async listNamespaces() {
        // Stub implementation
        return ['default'];
    }
    async getStats() {
        // Stub implementation
        return {
            entries: 0,
            size: 0,
            lastModified: Date.now(),
        };
    }
}
/**
 * Clean, focused memory system with multi-backend support.
 *
 * @example
 */
export class MemorySystem extends EventEmitter {
    backend;
    config;
    initialized = false;
    /**
     * Create a new memory system.
     *
     * @param config - Memory system configuration.
     */
    constructor(config) {
        super();
        this.config = config;
        // Create appropriate backend
        switch (config?.backend) {
            case 'sqlite':
                this.backend = new SQLiteBackend(config);
                break;
            case 'json':
                this.backend = new JSONBackend(config);
                break;
            case 'lancedb':
                this.backend = new LanceDBBackend(config);
                break;
            default:
                throw new Error(`Unknown backend type: ${config?.backend}`);
        }
    }
    /**
     * Initialize the memory system.
     */
    async initialize() {
        if (this.initialized)
            return;
        logger.info(`Initializing memory system with ${this.config.backend} backend`);
        try {
            await this.backend.initialize();
            this.initialized = true;
            this.emit('initialized', { backend: this.config.backend });
            logger.info('Memory system ready');
        }
        catch (error) {
            logger.error('Failed to initialize memory system:', error);
            throw error;
        }
    }
    /**
     * Store a value in memory.
     *
     * @param key - Storage key.
     * @param value - Value to store.
     * @param namespace - Optional namespace.
     * @returns Storage result.
     */
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
    /**
     * Retrieve a value from memory.
     *
     * @param key - Storage key.
     * @param namespace - Optional namespace.
     * @returns Stored value or null if not found.
     */
    async retrieve(key, namespace) {
        await this.ensureInitialized();
        const result = await this.backend.retrieve(key, namespace);
        this.emit('retrieved', { key, namespace, found: result !== null });
        return result;
    }
    /**
     * Search for values matching a pattern.
     *
     * @param pattern - Search pattern (supports wildcards).
     * @param namespace - Optional namespace.
     * @returns Record of matching key-value pairs.
     */
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
    /**
     * Delete a value from memory.
     *
     * @param key - Storage key.
     * @param namespace - Optional namespace.
     * @returns True if deleted, false if not found.
     */
    async delete(key, namespace) {
        await this.ensureInitialized();
        const deleted = await this.backend.delete(key, namespace);
        this.emit('deleted', { key, namespace, deleted });
        return deleted;
    }
    /**
     * List all namespaces.
     *
     * @returns Array of namespace names.
     */
    async listNamespaces() {
        await this.ensureInitialized();
        return this.backend.listNamespaces();
    }
    /**
     * Get memory system statistics.
     *
     * @returns Backend statistics.
     */
    async getStats() {
        await this.ensureInitialized();
        return this.backend.getStats();
    }
    /**
     * Shutdown the memory system.
     */
    async shutdown() {
        logger.info('Shutting down memory system...');
        if (this.backend.close) {
            await this.backend.close();
        }
        this.initialized = false;
        this.removeAllListeners();
        this.emit('closed');
        logger.info('Memory system shutdown complete');
    }
    // ==================== UTILITY METHODS ====================
    /**
     * Ensure the system is initialized.
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    // ==================== CONVENIENCE METHODS ====================
    /**
     * Store a document in the documents namespace.
     *
     * @param type - Document type.
     * @param id - Document ID.
     * @param document - Document data.
     * @returns Storage result.
     */
    async storeDocument(type, id, document) {
        const key = `${type}:${id}`;
        return this.store(key, {
            ...document,
            documentType: type,
            id,
            updatedAt: new Date().toISOString(),
        }, 'documents');
    }
    /**
     * Retrieve a document from the documents namespace.
     *
     * @param type - Document type.
     * @param id - Document ID.
     * @returns Document data or null.
     */
    async retrieveDocument(type, id) {
        const key = `${type}:${id}`;
        return this.retrieve(key, 'documents');
    }
    /**
     * Search for documents by type.
     *
     * @param type - Document type.
     * @returns Record of matching documents.
     */
    async searchDocuments(type) {
        const pattern = `${type}:*`;
        return this.search(pattern, 'documents');
    }
    /**
     * Store workflow data in the workflows namespace.
     *
     * @param workflowId - Workflow ID.
     * @param workflow - Workflow data.
     * @returns Storage result.
     */
    async storeWorkflow(workflowId, workflow) {
        return this.store(workflowId, workflow, 'workflows');
    }
    /**
     * Retrieve workflow data from the workflows namespace.
     *
     * @param workflowId - Workflow ID.
     * @returns Workflow data or null.
     */
    async retrieveWorkflow(workflowId) {
        return this.retrieve(workflowId, 'workflows');
    }
    /**
     * Search for workflows.
     *
     * @param pattern - Search pattern.
     * @returns Record of matching workflows.
     */
    async searchWorkflows(pattern = '*') {
        return this.search(pattern, 'workflows');
    }
}
