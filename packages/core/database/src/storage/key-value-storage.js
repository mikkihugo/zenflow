/**
 * Key-Value Storage Implementation
 *
 * High-performance key-value storage with caching, TTL support, batch operations,
 * and comprehensive error handling for enterprise applications.
 */
import { getLogger } from "../logger.js";
import { QueryError, } from "../types/index.js";
const logger = getLogger("key-value-storage");
// Removed unused BatchOperation interface
export class KeyValueStorageImpl {
    config;
    connection;
    memoryCache = new Map();
    cacheEnabled;
    maxCacheSize;
    defaultTtl;
    initialized = false;
    constructor(connection, config) {
        this.config = config;
        this.connection = connection;
        // Configure caching
        const options = config.options || {};
        this.cacheEnabled = options.enableCache !== false;
        this.maxCacheSize = options.maxCacheSize || 10000;
        this.defaultTtl = options.defaultTtl;
        // Start cache cleanup interval
        if (this.cacheEnabled) {
            this.startCacheCleanup();
        }
    }
    async get(key) {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            // Check memory cache first
            if (this.cacheEnabled) {
                const cached = this.getFromCache(key);
                if (cached !== undefined) {
                    logger.debug("Cache hit for key", { key, correlationId });
                    return cached;
                }
            }
            // Query database
            const result = await this.connection.query("SELECT value, ttl, stored_at FROM kv_store WHERE key = ?", [key], {
                correlationId,
            });
            if (result.rows.length === 0) {
                logger.debug("Key not found", { key, correlationId });
                return null;
            }
            const row = result.rows[0];
            // Check TTL expiration
            if (row.ttl && Date.now() > row.stored_at + row.ttl) {
                // Expired, delete asynchronously
                this.delete(key).catch((error) => {
                    logger.error("Failed to delete expired key", { key, error });
                });
                return null;
            }
            // Parse stored value
            const { value: rawValue, ttl } = row;
            let value;
            try {
                value = JSON.parse(rawValue);
            }
            catch {
                value = rawValue; // Fallback to string if not JSON
            }
            // Update cache
            if (this.cacheEnabled) {
                this.setInCache(key, value, ttl);
            }
            logger.debug("Retrieved value from database", { key, correlationId });
            return value;
        }
        catch (error) {
            logger.error("Failed to get value", {
                key,
                correlationId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to get key "${key}":${error instanceof Error ? error.message : String(error)}`, {
                query: `SELECT value, ttl, stored_at FROM kv_store WHERE key = ?`,
                params: [key],
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async set(key, value, options) {
        const correlationId = this.generateCorrelationId();
        const ttl = options?.ttl || this.defaultTtl;
        try {
            await this.ensureInitialized();
            // Serialize value
            const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
            const storedAt = Date.now();
            // Store in database
            await this.connection.execute(`INSERT OR REPLACE INTO kv_store (key, value, ttl, stored_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`, [key, serializedValue, ttl, storedAt, storedAt], { correlationId });
            // Update cache
            if (this.cacheEnabled) {
                this.setInCache(key, value, ttl);
            }
            logger.debug("Stored value successfully", {
                key,
                correlationId,
                hasTtl: ttl !== undefined,
            });
        }
        catch (error) {
            logger.error("Failed to set value", {
                key,
                correlationId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to set key "${key}":${error instanceof Error ? error.message : String(error)}`, {
                query: `INSERT OR REPLACE INTO kv_store (key, value, ttl, stored_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
                params: [key],
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async delete(key) {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            // Delete from database
            const result = await this.connection.execute("DELETE FROM kv_store WHERE key = ?", [key], { correlationId });
            // Remove from cache
            if (this.cacheEnabled) {
                this.memoryCache.delete(key);
            }
            const deleted = (result.affectedRows || 0) > 0;
            logger.debug("Delete operation completed", {
                key,
                correlationId,
                deleted,
            });
            return deleted;
        }
        catch (error) {
            logger.error("Failed to delete value", {
                key,
                correlationId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to delete key "${key}":${error instanceof Error ? error.message : String(error)}`, {
                query: `DELETE FROM kv_store WHERE key = ?`,
                params: [key],
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async has(key) {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            // Check cache first
            if (this.cacheEnabled && this.memoryCache.has(key)) {
                const cached = this.memoryCache.get(key);
                if (!this.isExpired(cached)) {
                    return true;
                }
            }
            // Query database
            const result = await this.connection.query("SELECT COUNT(*) as count FROM kv_store WHERE key = ? AND (ttl IS NULL OR ? < stored_at + ttl)", [key, Date.now()], { correlationId });
            const exists = (result.rows[0]?.count || 0) > 0;
            logger.debug("Checked key existence", {
                key,
                correlationId,
                exists,
            });
            return exists;
        }
        catch (error) {
            logger.error("Failed to check key existence", {
                key,
                correlationId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to check key "${key}":${error instanceof Error ? error.message : String(error)}`, {
                query: `SELECT COUNT(*) as count FROM kv_store WHERE key = ? AND (ttl IS NULL OR ? < stored_at + ttl)`,
                params: [key, Date.now()],
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async keys(pattern) {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            let query = "SELECT key FROM kv_store WHERE (ttl IS NULL OR ? < stored_at + ttl)";
            const params = [Date.now()];
            // Add pattern matching if provided
            if (pattern) {
                query += " AND key GLOB ?";
                params.push(pattern);
            }
            query += " ORDER BY key";
            const result = await this.connection.query(query, params, { correlationId });
            const keys = result.rows.map((row) => row.key);
            logger.debug("Retrieved keys", {
                correlationId,
                pattern,
                keyCount: keys.length,
            });
            return keys;
        }
        catch (error) {
            logger.error("Failed to get keys", {
                correlationId,
                pattern,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to get keys with pattern "${pattern}":${error instanceof Error ? error.message : String(error)}`, {
                query: `SELECT key FROM kv_store WHERE (ttl IS NULL OR ? < stored_at + ttl)`,
                params: [Date.now()],
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async clear() {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            // Clear database
            await this.connection.execute("DELETE FROM kv_store", [], {
                correlationId,
            });
            // Clear cache
            if (this.cacheEnabled) {
                this.memoryCache.clear();
            }
            logger.info("Cleared all key-value data", { correlationId });
        }
        catch (error) {
            logger.error("Failed to clear all data", {
                correlationId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to clear all data:${error instanceof Error ? error.message : String(error)}`, {
                query: `DELETE FROM kv_store`,
                params: [],
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async size() {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            const result = await this.connection.query("SELECT COUNT(*) as count FROM kv_store WHERE (ttl IS NULL OR ? < stored_at + ttl)", [Date.now()], { correlationId });
            const size = result.rows[0]?.count || 0;
            logger.debug("Retrieved storage size", { correlationId, size });
            return size;
        }
        catch (error) {
            logger.error("Failed to get storage size", {
                correlationId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to get storage size:${error instanceof Error ? error.message : String(error)}`, {
                query: `SELECT COUNT(*) as count FROM kv_store WHERE (ttl IS NULL OR ? < stored_at + ttl)`,
                params: [Date.now()],
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async mget(keys) {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            if (keys.length === 0) {
                return new Map();
            }
            const result = new Map();
            const uncachedKeys = [];
            // Check cache first
            if (this.cacheEnabled) {
                for (const key of keys) {
                    const cached = this.getFromCache(key);
                    if (cached !== undefined) {
                        result.set(key, cached);
                    }
                    else {
                        uncachedKeys.push(key);
                    }
                }
            }
            else {
                uncachedKeys.push(...keys);
            }
            // Query database for uncached keys
            if (uncachedKeys.length > 0) {
                const placeholders = uncachedKeys.map(() => "?").join(",");
                const dbResult = await this.connection.query(`SELECT key, value, ttl, stored_at FROM kv_store 
           WHERE key IN (${placeholders}) 
           AND (ttl IS NULL OR ? < stored_at + ttl)`, [...uncachedKeys, Date.now()], { correlationId });
                for (const row of dbResult.rows) {
                    const { value: rawValue, key, ttl } = row;
                    let value;
                    try {
                        value = JSON.parse(rawValue);
                    }
                    catch {
                        value = rawValue;
                    }
                    result.set(key, value);
                    // Update cache
                    if (this.cacheEnabled) {
                        this.setInCache(key, value, ttl);
                    }
                }
            }
            logger.debug("Multi-get operation completed", {
                correlationId,
                requestedKeys: keys.length,
                foundKeys: result.size,
            });
            return result;
        }
        catch (error) {
            logger.error("Failed to multi-get values", {
                correlationId,
                keyCount: keys.length,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to multi-get ${keys.length} keys:${error instanceof Error ? error.message : String(error)}`, {
                query: "SELECT key, value, ttl, stored_at FROM kv_store WHERE key IN (...) AND (ttl IS NULL OR ? < stored_at + ttl)",
                params: keys,
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async mset(entries) {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            if (entries.size === 0) {
                return;
            }
            // Use transaction for atomic multi-set
            await this.connection.transaction(async (tx) => {
                const storedAt = Date.now();
                for (const [key, value] of entries) {
                    const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
                    await tx.execute(`INSERT OR REPLACE INTO kv_store (key, value, ttl, stored_at, updated_at) VALUES (?, ?, ?, ?, ?)`, [key, serializedValue, this.defaultTtl, storedAt, storedAt]);
                    // Update cache
                    if (this.cacheEnabled) {
                        this.setInCache(key, value, this.defaultTtl);
                    }
                }
            });
            logger.debug("Multi-set operation completed", {
                correlationId,
                entryCount: entries.size,
            });
        }
        catch (error) {
            logger.error("Failed to multi-set values", {
                correlationId,
                entryCount: entries.size,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to multi-set ${entries.size} entries:${error instanceof Error ? error.message : String(error)}`, {
                query: "INSERT OR REPLACE INTO kv_store (key, value, ttl, stored_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                params: Array.from(entries.keys()),
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async mdelete(keys) {
        const correlationId = this.generateCorrelationId();
        try {
            await this.ensureInitialized();
            if (keys.length === 0) {
                return 0;
            }
            const placeholders = keys.map(() => "?").join(",");
            const result = await this.connection.execute(`DELETE FROM kv_store WHERE key IN (${placeholders})`, [...keys], { correlationId });
            // Remove from cache
            if (this.cacheEnabled) {
                for (const key of keys) {
                    this.memoryCache.delete(key);
                }
            }
            const deletedCount = result.affectedRows || 0;
            logger.debug("Multi-delete operation completed", {
                correlationId,
                requestedKeys: keys.length,
                deletedCount,
            });
            return deletedCount;
        }
        catch (error) {
            logger.error("Failed to multi-delete values", {
                correlationId,
                keyCount: keys.length,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to multi-delete ${keys.length} keys:${error instanceof Error ? error.message : String(error)}`, {
                query: "DELETE FROM kv_store WHERE key IN (...)",
                params: keys,
                correlationId,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    // Private methods
    async ensureInitialized() {
        if (this.initialized)
            return;
        if (!this.connection.isConnected()) {
            await this.connection.connect();
        }
        // Create key-value table
        await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        ttl INTEGER,
        stored_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
        // Create indexes for performance
        await this.connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_kv_store_ttl_expiry 
      ON kv_store(stored_at, ttl) 
      WHERE ttl IS NOT NULL
    `);
        this.initialized = true;
        logger.debug("Key-value storage initialized");
    }
    getFromCache(key) {
        const cached = this.memoryCache.get(key);
        if (!cached)
            return undefined;
        if (this.isExpired(cached)) {
            this.memoryCache.delete(key);
            return undefined;
        }
        return cached.value;
    }
    setInCache(key, value, ttl) {
        if (!this.cacheEnabled)
            return;
        // Evict oldest entries if cache is full
        if (this.memoryCache.size >= this.maxCacheSize) {
            const firstKey = this.memoryCache.keys().next().value;
            if (firstKey) {
                this.memoryCache.delete(firstKey);
            }
        }
        this.memoryCache.set(key, {
            value,
            ttl,
            storedAt: Date.now(),
        });
    }
    isExpired(cached) {
        if (!cached.ttl)
            return false;
        return Date.now() > cached.storedAt + cached.ttl;
    }
    startCacheCleanup() {
        // Clean up expired cache entries every 5 minutes
        setInterval(() => {
            const keysToDelete = [];
            for (const [key, cached] of this.memoryCache) {
                if (this.isExpired(cached)) {
                    keysToDelete.push(key);
                }
            }
            for (const key of keysToDelete) {
                this.memoryCache.delete(key);
            }
            if (keysToDelete.length > 0) {
                logger.debug("Cleaned up expired cache entries", {
                    count: keysToDelete.length,
                });
            }
        }, 5 * 60 * 1000);
    }
    generateCorrelationId() {
        return `kv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
