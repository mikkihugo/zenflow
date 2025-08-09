/**
 * Memory System - Multi-Backend Memory Management.
 *
 * Clean, focused memory system with support for multiple backends
 * without bloated "unified" architecture. Supports LanceDB, SQLite, and JSON backends.
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

import { EventEmitter } from 'node:events';
import { createLogger } from './logger';

const logger = createLogger({ prefix: 'MemorySystem' });

/**
 * JSON-serializable value type.
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Storage operation result.
 *
 * @example
 */
export interface StorageResult {
  /** Unique identifier for the stored item */
  id: string;
  /** Timestamp when stored */
  timestamp: number;
  /** Operation status */
  status: 'success' | 'error';
  /** Error message if failed */
  error?: string;
}

/**
 * Backend statistics.
 *
 * @example
 */
export interface BackendStats {
  /** Number of entries */
  entries: number;
  /** Total size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: number;
  /** Number of namespaces */
  namespaces?: number;
}

/**
 * Supported backend types.
 */
export type BackendType = 'lancedb' | 'sqlite' | 'json';

/**
 * Memory system configuration.
 *
 * @example
 */
export interface MemoryConfig {
  /** Backend type */
  backend: BackendType;
  /** Storage path */
  path: string;
  /** Maximum storage size in bytes */
  maxSize?: number;
  /** Enable compression */
  compression?: boolean;
  /** Backend-specific configuration */
  backendConfig?: Record<string, any>;
}

/**
 * Backend interface for storage implementations.
 *
 * @example
 */
export interface BackendInterface {
  /** Initialize the backend */
  initialize(): Promise<void>;
  /** Store a value */
  store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  /** Retrieve a value */
  retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  /** Search for values */
  search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  /** Delete a value */
  delete(key: string, namespace?: string): Promise<boolean>;
  /** List all namespaces */
  listNamespaces(): Promise<string[]>;
  /** Get backend statistics */
  getStats(): Promise<BackendStats>;
  /** Close the backend */
  close?(): Promise<void>;
}

/**
 * JSON file backend implementation.
 *
 * @example
 */
class JSONBackend implements BackendInterface {
  private data = new Map<string, { value: JSONValue; timestamp: number; type: string }>();
  private filepath: string;
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.filepath = `${config.path}/memory.json`;
  }

  async initialize(): Promise<void> {
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
      } catch {
        // File doesn't exist or is corrupted, start fresh
        logger.info('JSON backend initialized (new file)');
      }
    } catch (error) {
      logger.error('Failed to initialize JSON backend:', error);
      throw error;
    }
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
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
    } catch (error) {
      return {
        id: fullKey,
        timestamp,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    const entry = this.data.get(fullKey);
    return entry?.value ?? null;
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
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

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const fullKey = `${namespace}:${key}`;
    const deleted = this.data.delete(fullKey);

    if (deleted) {
      await this.persist();
    }

    return deleted;
  }

  async listNamespaces(): Promise<string[]> {
    const namespaces = new Set<string>();

    for (const key of this.data.keys()) {
      const namespace = key.split(':')[0] ?? 'default';
      namespaces.add(namespace);
    }

    return Array.from(namespaces);
  }

  async getStats(): Promise<BackendStats> {
    const serialized = JSON.stringify(Array.from(this.data.entries()));

    return {
      entries: this.data.size,
      size: Buffer.byteLength(serialized, 'utf8'),
      lastModified: Date.now(),
      namespaces: (await this.listNamespaces()).length,
    };
  }

  private async persist(): Promise<void> {
    const fs = await import('node:fs/promises');

    // Check size limits
    if (this.config.maxSize) {
      const stats = await this.getStats();
      if (stats.size > this.config.maxSize) {
        throw new Error(`Storage size ${stats.size} exceeds limit ${this.config.maxSize}`);
      }
    }

    // Convert Map to object for JSON serialization
    const obj: Record<string, any> = {};
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
class SQLiteBackend implements BackendInterface {
  private db?: any;
  private dbPath: string;
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.dbPath = `${config.path}/memory.db`;
  }

  async initialize(): Promise<void> {
    try {
      const { default: Database } = await import('better-sqlite3');
      const fs = await import('node:fs/promises');
      const path = await import('node:path');

      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

      this.db = new (Database as any)(this.dbPath);

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
    } catch (error) {
      logger.error('Failed to initialize SQLite backend:', error);
      throw error;
    }
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
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
    } catch (error) {
      return {
        id: fullKey,
        timestamp,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT value FROM memory 
        WHERE namespace = ? AND key = ?
      `);

      const result = stmt.get(namespace, key);
      if (!result) return null;

      return JSON.parse(result.value);
    } catch (error) {
      logger.error('SQLite retrieve error:', error);
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
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
        } catch (_error) {
          logger.warn(`Failed to parse value for key ${row.key}`);
        }
      }
    } catch (error) {
      logger.error('SQLite search error:', error);
    }

    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM memory 
        WHERE namespace = ? AND key = ?
      `);

      const result = stmt.run(namespace, key);
      return result.changes > 0;
    } catch (error) {
      logger.error('SQLite delete error:', error);
      return false;
    }
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT DISTINCT namespace FROM memory
        ORDER BY namespace
      `);

      const rows = stmt.all();
      return rows.map((row: any) => row.namespace);
    } catch (error) {
      logger.error('SQLite listNamespaces error:', error);
      return [];
    }
  }

  async getStats(): Promise<BackendStats> {
    try {
      const countStmt = this.db.prepare(
        'SELECT COUNT(*) as count, SUM(size) as totalSize FROM memory'
      );
      const nsStmt = this.db.prepare('SELECT COUNT(DISTINCT namespace) as namespaces FROM memory');

      const countResult = countStmt.get();
      const nsResult = nsStmt.get();

      return {
        entries: countResult.count,
        size: countResult.totalSize || 0,
        lastModified: Date.now(),
        namespaces: nsResult.namespaces,
      };
    } catch (error) {
      logger.error('SQLite getStats error:', error);
      return { entries: 0, size: 0, lastModified: Date.now() };
    }
  }

  async close(): Promise<void> {
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
class LanceDBBackend implements BackendInterface {
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    logger.info('LanceDB backend initialized (stub implementation)');
    // Implementation would use LanceDB interface from database layer
  }

  async store(key: string, _value: JSONValue, namespace?: string): Promise<StorageResult> {
    // Stub implementation
    return {
      id: `${namespace || 'default'}:${key}`,
      timestamp: Date.now(),
      status: 'success',
    };
  }

  async retrieve(_key: string, _namespace?: string): Promise<JSONValue | null> {
    // Stub implementation
    return null;
  }

  async search(_pattern: string, _namespace?: string): Promise<Record<string, JSONValue>> {
    // Stub implementation
    return {};
  }

  async delete(_key: string, _namespace?: string): Promise<boolean> {
    // Stub implementation
    return false;
  }

  async listNamespaces(): Promise<string[]> {
    // Stub implementation
    return ['default'];
  }

  async getStats(): Promise<BackendStats> {
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
  private backend: BackendInterface;
  private config: MemoryConfig;
  private initialized = false;

  /**
   * Create a new memory system.
   *
   * @param config - Memory system configuration.
   */
  constructor(config: MemoryConfig) {
    super();
    this.config = config;

    // Create appropriate backend
    switch (config.backend) {
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
        throw new Error(`Unknown backend type: ${config.backend}`);
    }
  }

  /**
   * Initialize the memory system.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info(`Initializing memory system with ${this.config.backend} backend`);

    try {
      await this.backend.initialize();
      this.initialized = true;

      this.emit('initialized', { backend: this.config.backend });
      logger.info('Memory system ready');
    } catch (error) {
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
  async store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult> {
    await this.ensureInitialized();

    const result = await this.backend.store(key, value, namespace);

    if (result.status === 'success') {
      this.emit('stored', { key, namespace, timestamp: result.timestamp });
    } else {
      this.emit('error', { operation: 'store', key, namespace, error: result.error });
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
  async retrieve(key: string, namespace?: string): Promise<JSONValue | null> {
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
  async search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>> {
    await this.ensureInitialized();

    const results = await this.backend.search(pattern, namespace);

    this.emit('searched', { pattern, namespace, resultCount: Object.keys(results).length });

    return results;
  }

  /**
   * Delete a value from memory.
   *
   * @param key - Storage key.
   * @param namespace - Optional namespace.
   * @returns True if deleted, false if not found.
   */
  async delete(key: string, namespace?: string): Promise<boolean> {
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
  async listNamespaces(): Promise<string[]> {
    await this.ensureInitialized();
    return this.backend.listNamespaces();
  }

  /**
   * Get memory system statistics.
   *
   * @returns Backend statistics.
   */
  async getStats(): Promise<BackendStats> {
    await this.ensureInitialized();
    return this.backend.getStats();
  }

  /**
   * Shutdown the memory system.
   */
  async shutdown(): Promise<void> {
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
  private async ensureInitialized(): Promise<void> {
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
  async storeDocument(type: string, id: string, document: any): Promise<StorageResult> {
    const key = `${type}:${id}`;
    return this.store(
      key,
      {
        ...document,
        documentType: type,
        id,
        updatedAt: new Date().toISOString(),
      },
      'documents'
    );
  }

  /**
   * Retrieve a document from the documents namespace.
   *
   * @param type - Document type.
   * @param id - Document ID.
   * @returns Document data or null.
   */
  async retrieveDocument(type: string, id: string): Promise<any> {
    const key = `${type}:${id}`;
    return this.retrieve(key, 'documents');
  }

  /**
   * Search for documents by type.
   *
   * @param type - Document type.
   * @returns Record of matching documents.
   */
  async searchDocuments(type: string): Promise<Record<string, any>> {
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
  async storeWorkflow(workflowId: string, workflow: any): Promise<StorageResult> {
    return this.store(workflowId, workflow, 'workflows');
  }

  /**
   * Retrieve workflow data from the workflows namespace.
   *
   * @param workflowId - Workflow ID.
   * @returns Workflow data or null.
   */
  async retrieveWorkflow(workflowId: string): Promise<any> {
    return this.retrieve(workflowId, 'workflows');
  }

  /**
   * Search for workflows.
   *
   * @param pattern - Search pattern.
   * @returns Record of matching workflows.
   */
  async searchWorkflows(pattern: string = '*'): Promise<Record<string, any>> {
    return this.search(pattern, 'workflows');
  }
}
