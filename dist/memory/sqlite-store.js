/**
 * SQLite-based memory store for MCP server
 * Provides persistent storage that works with both local and remote npx execution
 */

import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';
import { createDatabase } from './sqlite-wrapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SqliteMemoryStore {
  constructor(options = {}) {
    this.options = {
      dbName: options.dbName || 'memory.db',
      directory: options.directory || this._getMemoryDirectory(),
      cacheSize: options.cacheSize || 10000, // 10MB cache
      mmapSize: options.mmapSize || 268435456, // 256MB memory-mapped size
      maxConnections: options.maxConnections || 4,
      enableCache: options.enableCache !== false,
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
      ...options,
    };

    this.db = null;
    this.statements = new Map();
    this.queryCache = new Map();
    this.cacheStats = { hits: 0, misses: 0, size: 0 };
    this.isInitialized = false;
  }

  /**
   * Determine the best directory for memory storage
   * Uses .swarm directory in current working directory (consistent with hive-mind approach)
   */
  _getMemoryDirectory() {
    // Always use .swarm directory in the current working directory
    // This ensures consistency whether running locally or via npx
    return path.join(process.cwd(), '.swarm');
  }

  async _directoryExists(dir) {
    try {
      const stats = await fs.stat(dir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Ensure directory exists
      await fs.mkdir(this.options.directory, { recursive: true });

      // Open database
      const dbPath = path.join(this.options.directory, this.options.dbName);
      this.db = await createDatabase(dbPath);

      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma(`cache_size = -${Math.floor(this.options.cacheSize / 1024)}`); // Negative for KB
      this.db.pragma(`mmap_size = ${this.options.mmapSize}`);
      this.db.pragma('temp_store = MEMORY');
      this.db.pragma('optimize');

      // Create tables
      this._createTables();

      // Prepare statements
      this._prepareStatements();

      this.isInitialized = true;

      console.error(
        `[${new Date().toISOString()}] INFO [memory-store] Initialized SQLite at: ${dbPath}`,
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ERROR [memory-store] Failed to initialize:`,
        error,
      );
      throw error;
    }
  }

  _createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        namespace TEXT NOT NULL DEFAULT 'default',
        metadata TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        accessed_at INTEGER DEFAULT (strftime('%s', 'now')),
        access_count INTEGER DEFAULT 0,
        ttl INTEGER,
        expires_at INTEGER,
        UNIQUE(key, namespace)
      );

      -- Core performance indexes
      CREATE INDEX IF NOT EXISTS idx_memory_namespace ON memory_entries(namespace);
      CREATE INDEX IF NOT EXISTS idx_memory_expires ON memory_entries(expires_at) WHERE expires_at IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_memory_accessed ON memory_entries(accessed_at);
      
      -- Composite indexes for common query patterns
      CREATE INDEX IF NOT EXISTS idx_memory_namespace_key ON memory_entries(namespace, key);
      CREATE INDEX IF NOT EXISTS idx_memory_namespace_updated ON memory_entries(namespace, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_memory_namespace_access_count ON memory_entries(namespace, access_count DESC);
      CREATE INDEX IF NOT EXISTS idx_memory_active_entries ON memory_entries(namespace, expires_at) 
        WHERE expires_at IS NULL;
      
      -- Search optimization indexes
      CREATE INDEX IF NOT EXISTS idx_memory_key_search ON memory_entries(key) WHERE key LIKE '%';
      CREATE INDEX IF NOT EXISTS idx_memory_value_search ON memory_entries(value) WHERE value LIKE '%';
      
      -- Analytics indexes
      CREATE INDEX IF NOT EXISTS idx_memory_created_at ON memory_entries(created_at);
      CREATE INDEX IF NOT EXISTS idx_memory_updated_at ON memory_entries(updated_at);
    `);
  }

  _prepareStatements() {
    // Store/update statement
    this.statements.set(
      'upsert',
      this.db.prepare(`
      INSERT INTO memory_entries (key, value, namespace, metadata, ttl, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(key, namespace) DO UPDATE SET
        value = excluded.value,
        metadata = excluded.metadata,
        ttl = excluded.ttl,
        expires_at = excluded.expires_at,
        updated_at = strftime('%s', 'now'),
        access_count = memory_entries.access_count + 1
    `),
    );

    // Retrieve statement
    this.statements.set(
      'get',
      this.db.prepare(`
      SELECT * FROM memory_entries 
      WHERE key = ? AND namespace = ? AND (expires_at IS NULL OR expires_at > strftime('%s', 'now'))
    `),
    );

    // List statement
    this.statements.set(
      'list',
      this.db.prepare(`
      SELECT * FROM memory_entries 
      WHERE namespace = ? AND (expires_at IS NULL OR expires_at > strftime('%s', 'now'))
      ORDER BY updated_at DESC
      LIMIT ?
    `),
    );

    // Delete statement
    this.statements.set(
      'delete',
      this.db.prepare(`
      DELETE FROM memory_entries WHERE key = ? AND namespace = ?
    `),
    );

    // Search statement
    this.statements.set(
      'search',
      this.db.prepare(`
      SELECT * FROM memory_entries 
      WHERE namespace = ? AND (key LIKE ? OR value LIKE ?) 
      AND (expires_at IS NULL OR expires_at > strftime('%s', 'now'))
      ORDER BY access_count DESC, updated_at DESC
      LIMIT ?
    `),
    );

    // Cleanup statement
    this.statements.set(
      'cleanup',
      this.db.prepare(`
      DELETE FROM memory_entries WHERE expires_at IS NOT NULL AND expires_at <= strftime('%s', 'now')
    `),
    );

    // Update access statement
    this.statements.set(
      'updateAccess',
      this.db.prepare(`
      UPDATE memory_entries 
      SET accessed_at = strftime('%s', 'now'), access_count = access_count + 1
      WHERE key = ? AND namespace = ?
    `),
    );
  }

  async store(key, value, options = {}) {
    await this.initialize();

    const namespace = options.namespace || 'default';
    const metadata = options.metadata ? JSON.stringify(options.metadata) : null;
    const ttl = options.ttl || null;
    const expiresAt = ttl ? Math.floor(Date.now() / 1000) + ttl : null;
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      const result = this.statements
        .get('upsert')
        .run(key, valueStr, namespace, metadata, ttl, expiresAt);

      // Invalidate related cache entries
      this._invalidateCache(`retrieve:${JSON.stringify([key, namespace])}`);
      this._invalidateCache(`list:${JSON.stringify([namespace])}`);
      this._invalidateCache(`search:`); // Invalidate all search results

      return {
        success: true,
        id: result.lastInsertRowid,
        size: valueStr.length,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] Store failed:`, error);
      throw error;
    }
  }

  async retrieve(key, options = {}) {
    await this.initialize();

    const namespace = options.namespace || 'default';
    const cacheKey = this._getCacheKey('retrieve', key, namespace);
    
    // Check cache first
    const cached = this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const row = this.statements.get('get').get(key, namespace);

      if (!row) {
        this._setCache(cacheKey, null, 60000); // Cache null results for 1 minute
        return null;
      }

      // Update access stats
      this.statements.get('updateAccess').run(key, namespace);

      // Try to parse as JSON, fall back to raw string
      let result;
      try {
        result = JSON.parse(row.value);
      } catch {
        result = row.value;
      }
      
      // Cache the result
      this._setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] Retrieve failed:`, error);
      throw error;
    }
  }

  async list(options = {}) {
    await this.initialize();

    const namespace = options.namespace || 'default';
    const limit = options.limit || 100;
    const cacheKey = this._getCacheKey('list', namespace, limit);
    
    // Check cache first
    const cached = this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const rows = this.statements.get('list').all(namespace, limit);

      const result = rows.map((row) => ({
        key: row.key,
        value: this._tryParseJson(row.value),
        namespace: row.namespace,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        createdAt: new Date(row.created_at * 1000),
        updatedAt: new Date(row.updated_at * 1000),
        accessCount: row.access_count,
      }));
      
      // Cache the result
      this._setCache(cacheKey, result, 120000); // Cache for 2 minutes
      
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] List failed:`, error);
      throw error;
    }
  }

  async delete(key, options = {}) {
    await this.initialize();

    const namespace = options.namespace || 'default';

    try {
      const result = this.statements.get('delete').run(key, namespace);
      
      // Invalidate related cache entries
      if (result.changes > 0) {
        this._invalidateCache(`retrieve:${JSON.stringify([key, namespace])}`);
        this._invalidateCache(`list:${JSON.stringify([namespace])}`);
        this._invalidateCache(`search:`);
      }
      
      return result.changes > 0;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] Delete failed:`, error);
      throw error;
    }
  }

  async search(pattern, options = {}) {
    await this.initialize();

    const namespace = options.namespace || 'default';
    const limit = options.limit || 50;
    const searchPattern = `%${pattern}%`;
    const cacheKey = this._getCacheKey('search', pattern, namespace, limit);
    
    // Check cache first
    const cached = this._getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const rows = this.statements
        .get('search')
        .all(namespace, searchPattern, searchPattern, limit);

      const result = rows.map((row) => ({
        key: row.key,
        value: this._tryParseJson(row.value),
        namespace: row.namespace,
        score: row.access_count,
        updatedAt: new Date(row.updated_at * 1000),
      }));
      
      // Cache search results for shorter time since they change more frequently
      this._setCache(cacheKey, result, 60000); // Cache for 1 minute
      
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] Search failed:`, error);
      throw error;
    }
  }

  async cleanup() {
    await this.initialize();

    try {
      const result = this.statements.get('cleanup').run();
      return result.changes;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] Cleanup failed:`, error);
      throw error;
    }
  }

  _tryParseJson(value) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Query cache management
   */
  _getCacheKey(operation, ...args) {
    return `${operation}:${JSON.stringify(args)}`;
  }

  _getFromCache(cacheKey) {
    if (!this.options.enableCache) return null;
    
    const cached = this.queryCache.get(cacheKey);
    if (!cached) {
      this.cacheStats.misses++;
      return null;
    }

    if (Date.now() > cached.expires) {
      this.queryCache.delete(cacheKey);
      this.cacheStats.misses++;
      return null;
    }

    this.cacheStats.hits++;
    return cached.data;
  }

  _setCache(cacheKey, data, customTTL = null) {
    if (!this.options.enableCache) return;
    
    const ttl = customTTL || this.options.cacheTimeout;
    const expires = Date.now() + ttl;
    
    this.queryCache.set(cacheKey, { data, expires });
    this.cacheStats.size = this.queryCache.size;
    
    // Simple LRU: remove oldest if cache gets too large
    if (this.queryCache.size > 1000) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
      this.cacheStats.size = this.queryCache.size;
    }
  }

  _invalidateCache(pattern = null) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
    this.cacheStats.size = this.queryCache.size;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
    this.queryCache.clear();
    this.cacheStats = { hits: 0, misses: 0, size: 0 };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return {
      cache: {
        enabled: this.options.enableCache,
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        hitRate: this.cacheStats.hits + this.cacheStats.misses > 0 
          ? this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) 
          : 0,
        size: this.cacheStats.size,
        timeout: this.options.cacheTimeout
      },
      database: {
        cacheSize: this.options.cacheSize,
        mmapSize: this.options.mmapSize,
        isInitialized: this.isInitialized
      }
    };
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    await this.initialize();
    
    try {
      const stats = this.db.prepare(`
        SELECT 
          COUNT(*) as total_entries,
          COUNT(DISTINCT namespace) as namespaces,
          SUM(LENGTH(value)) as total_size,
          AVG(access_count) as avg_access_count,
          COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at > strftime('%s', 'now')) as active_with_ttl,
          COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= strftime('%s', 'now')) as expired
        FROM memory_entries
      `).get();

      const indexStats = this.db.prepare(`
        SELECT name, tbl_name FROM sqlite_master 
        WHERE type = 'index' AND tbl_name = 'memory_entries'
      `).all();

      return {
        entries: stats.total_entries || 0,
        namespaces: stats.namespaces || 0,
        totalSize: stats.total_size || 0,
        avgAccessCount: stats.avg_access_count || 0,
        activeWithTTL: stats.active_with_ttl || 0,
        expired: stats.expired || 0,
        indexes: indexStats.length,
        indexNames: indexStats.map(idx => idx.name)
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] Stats failed:`, error);
      return {
        entries: 0,
        namespaces: 0,
        totalSize: 0,
        avgAccessCount: 0,
        activeWithTTL: 0,
        expired: 0,
        indexes: 0,
        indexNames: []
      };
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeQueryPerformance() {
    await this.initialize();
    
    try {
      // Get SQLite query plan for common operations
      const plans = {};
      
      const commonQueries = [
        { name: 'get', sql: 'SELECT * FROM memory_entries WHERE key = ? AND namespace = ?' },
        { name: 'list', sql: 'SELECT * FROM memory_entries WHERE namespace = ? ORDER BY updated_at DESC LIMIT ?' },
        { name: 'search', sql: 'SELECT * FROM memory_entries WHERE namespace = ? AND (key LIKE ? OR value LIKE ?) LIMIT ?' },
        { name: 'cleanup', sql: 'DELETE FROM memory_entries WHERE expires_at IS NOT NULL AND expires_at <= strftime(\'%s\', \'now\')' }
      ];

      for (const query of commonQueries) {
        try {
          const plan = this.db.prepare(`EXPLAIN QUERY PLAN ${query.sql}`).all();
          plans[query.name] = plan;
        } catch (error) {
          plans[query.name] = { error: error.message };
        }
      }

      return {
        queryPlans: plans,
        performance: this.getPerformanceStats()
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR [memory-store] Query analysis failed:`, error);
      return { queryPlans: {}, performance: this.getPerformanceStats() };
    }
  }
}

// Export a singleton instance for MCP server
export const memoryStore = new SqliteMemoryStore();

export { SqliteMemoryStore };
export default SqliteMemoryStore;
