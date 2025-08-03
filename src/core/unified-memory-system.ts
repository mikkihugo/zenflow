/**
 * Unified Memory System - Direct Integration
 *
 * Integrates memory backend functionality directly into core system
 * Supports LanceDB, SQLite, Kuzu, and JSON backends without plugin architecture
 */

import { EventEmitter } from 'events';
import LanceDBInterface from '../database/lancedb-interface';
import { createLogger } from './logger';

const logger = createLogger('UnifiedMemory');

// Core types
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface StorageResult {
  id: string;
  timestamp: number;
  status: 'success' | 'error';
  error?: string;
}

export interface BackendStats {
  entries: number;
  size: number;
  lastModified: number;
  namespaces?: number;
}

export type BackendType = 'lancedb' | 'sqlite' | 'json' | 'kuzu';

export interface MemoryConfig {
  backend: BackendType;
  path: string;
  maxSize?: number;
  compression?: boolean;
  // Backend-specific configs
  sqlite?: {
    walMode?: boolean;
    autoVacuum?: boolean;
  };
  lancedb?: {
    vectorDimension?: number;
    indexType?: string;
  };
  kuzu?: {
    bufferSize?: string;
    numThreads?: number;
  };
}

interface BackendInterface {
  initialize(): Promise<void>;
  store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  delete(key: string, namespace?: string): Promise<boolean>;
  listNamespaces(): Promise<string[]>;
  getStats(): Promise<BackendStats>;
  close?(): Promise<void>;
}

/**
 * LanceDB Backend - Vector Database for Semantic Storage
 */
class LanceDBBackend implements BackendInterface {
  private lanceInterface: LanceDBInterface;
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.lanceInterface = new LanceDBInterface({
      dbPath: `${config.path}/lancedb`,
    });
  }

  async initialize(): Promise<void> {
    await this.lanceInterface.initialize();
    logger.info('LanceDB backend initialized');
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
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

      await this.lanceInterface.insertVectors('unified_memory', [vectorDoc]);

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
      const searchResult = await this.lanceInterface.searchSimilar(
        'unified_memory',
        new Array(this.config.lancedb?.vectorDimension || 384).fill(0),
        1,
        { key, namespace }
      );

      if (!searchResult || searchResult.length === 0) return null;

      const result = searchResult[0];
      if (result.metadata?.serialized_data) {
        return JSON.parse(result.metadata.serialized_data);
      }

      return null;
    } catch (error) {
      logger.error('LanceDB retrieve error:', error);
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};

    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'unified_memory',
        new Array(this.config.lancedb?.vectorDimension || 384).fill(0),
        100,
        { namespace }
      );

      for (const result of searchResult || []) {
        const metadata = result.metadata || {};
        if (metadata.namespace === namespace && metadata.serialized_data) {
          const key = metadata.key;
          if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
            results[key] = JSON.parse(metadata.serialized_data);
          }
        }
      }
    } catch (error) {
      logger.error('LanceDB search error:', error);
    }

    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    // LanceDB doesn't have direct delete in current interface
    logger.warn('Delete operation not implemented for LanceDB backend');
    return false;
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'unified_memory',
        new Array(this.config.lancedb?.vectorDimension || 384).fill(0),
        1000
      );

      const namespaces = new Set<string>();
      for (const result of searchResult || []) {
        if (result.metadata?.namespace) {
          namespaces.add(result.metadata.namespace);
        }
      }

      return Array.from(namespaces);
    } catch (error) {
      return [];
    }
  }

  async getStats(): Promise<BackendStats> {
    const stats = await this.lanceInterface.getStats();
    return {
      entries: stats.totalVectors || 0,
      size: stats.indexedVectors || 0,
      lastModified: Date.now(),
    };
  }

  private extractTextContent(value: JSONValue): string {
    if (typeof value === 'object' && value && 'content' in value) {
      return (value as any).content;
    }
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }
}

/**
 * SQLite Backend - Relational Database for Structured Storage
 */
class SQLiteBackend implements BackendInterface {
  private db?: any;
  private dbPath: string;
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.dbPath = `${config.path}/unified_memory.db`;
  }

  async initialize(): Promise<void> {
    const { default: Database } = await import('better-sqlite3');
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    this.db = new (Database as any)(this.dbPath);

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
        INSERT OR REPLACE INTO unified_memory(id, namespace, key, value, value_type, timestamp, size)
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
        SELECT value FROM unified_memory 
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
        SELECT key, value FROM unified_memory 
        WHERE namespace = ? AND key LIKE ?
        ORDER BY timestamp DESC
      `);

      const rows = stmt.all(namespace, searchPattern);

      for (const row of rows) {
        try {
          results[row.key] = JSON.parse(row.value);
        } catch (error) {
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
        DELETE FROM unified_memory 
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
        SELECT DISTINCT namespace FROM unified_memory
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
        'SELECT COUNT(*) as count, SUM(size) as totalSize FROM unified_memory'
      );
      const nsStmt = this.db.prepare(
        'SELECT COUNT(DISTINCT namespace) as namespaces FROM unified_memory'
      );

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
 * JSON Backend - File-based Storage for Simple Use Cases
 */
class JSONBackend implements BackendInterface {
  private data = new Map<string, { value: JSONValue; timestamp: number; type: string }>();
  private filepath: string;
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.filepath = `${config.path}/unified_memory.json`;
  }

  async initialize(): Promise<void> {
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');

      await fs.mkdir(path.dirname(this.filepath), { recursive: true });

      // Load existing data
      const data = await fs.readFile(this.filepath, 'utf8');
      const parsed = JSON.parse(data);
      this.data = new Map(Object.entries(parsed));

      logger.info(`JSON backend initialized with ${this.data.size} entries`);
    } catch {
      // File doesn't exist or is corrupted, start fresh
      logger.info('JSON backend initialized (new file)');
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
      const namespace = key.split(':')[0];
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
 * Unified Memory System - Main Interface
 */
export class UnifiedMemorySystem extends EventEmitter {
  private backend: BackendInterface;
  private config: MemoryConfig;
  private initialized = false;

  constructor(config: MemoryConfig) {
    super();
    this.config = config;

    // Create appropriate backend
    switch (config.backend) {
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
        throw new Error(`Unknown backend type: ${config.backend}`);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info(`Initializing unified memory system with ${this.config.backend} backend`);

    try {
      await this.backend.initialize();
      this.initialized = true;

      this.emit('initialized', { backend: this.config.backend });
      logger.info('Unified memory system ready');
    } catch (error) {
      logger.error('Failed to initialize memory system:', error);
      throw error;
    }
  }

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

  async retrieve(key: string, namespace?: string): Promise<JSONValue | null> {
    await this.ensureInitialized();

    const result = await this.backend.retrieve(key, namespace);

    this.emit('retrieved', { key, namespace, found: result !== null });

    return result;
  }

  async search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>> {
    await this.ensureInitialized();

    const results = await this.backend.search(pattern, namespace);

    this.emit('searched', { pattern, namespace, resultCount: Object.keys(results).length });

    return results;
  }

  async delete(key: string, namespace?: string): Promise<boolean> {
    await this.ensureInitialized();

    const deleted = await this.backend.delete(key, namespace);

    this.emit('deleted', { key, namespace, deleted });

    return deleted;
  }

  async listNamespaces(): Promise<string[]> {
    await this.ensureInitialized();
    return this.backend.listNamespaces();
  }

  async getStats(): Promise<BackendStats> {
    await this.ensureInitialized();
    return this.backend.getStats();
  }

  async close(): Promise<void> {
    if (this.backend.close) {
      await this.backend.close();
    }

    this.initialized = false;
    this.emit('closed');
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Utility methods for document workflow
  async storeDocument(
    type: string,
    id: string,
    document: any,
    namespace: string = 'documents'
  ): Promise<StorageResult> {
    const key = `${type}:${id}`;
    return this.store(
      key,
      {
        ...document,
        documentType: type,
        id,
        updatedAt: new Date().toISOString(),
      },
      namespace
    );
  }

  async retrieveDocument(type: string, id: string, namespace: string = 'documents'): Promise<any> {
    const key = `${type}:${id}`;
    return this.retrieve(key, namespace);
  }

  async searchDocuments(
    type: string,
    namespace: string = 'documents'
  ): Promise<Record<string, any>> {
    const pattern = `${type}:*`;
    return this.search(pattern, namespace);
  }

  // Workflow-specific helpers
  async storeVision(id: string, vision: any): Promise<StorageResult> {
    return this.storeDocument('vision', id, vision);
  }

  async storeADR(id: string, adr: any): Promise<StorageResult> {
    return this.storeDocument('adr', id, adr);
  }

  async storePRD(id: string, prd: any): Promise<StorageResult> {
    return this.storeDocument('prd', id, prd);
  }

  async storeEpic(id: string, epic: any): Promise<StorageResult> {
    return this.storeDocument('epic', id, epic);
  }

  async storeFeature(id: string, feature: any): Promise<StorageResult> {
    return this.storeDocument('feature', id, feature);
  }

  async storeTask(id: string, task: any): Promise<StorageResult> {
    return this.storeDocument('task', id, task);
  }
}
