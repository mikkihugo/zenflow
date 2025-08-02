/**
 * Memory Storage Backends
 * Pluggable storage backends for the memory system
 * Migrated from plugins to proper domain structure
 */

import { LanceDBInterface } from '../database/lancedb-interface';

// Types for memory backend operations
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

export interface BackendConfig {
  type: 'lancedb' | 'sqlite' | 'json' | 'kuzu';
  path: string;
  enabled?: boolean;
  [key: string]: any;
}

export interface BackendInterface {
  initialize(): Promise<void>;
  store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  delete(key: string, namespace?: string): Promise<boolean>;
  listNamespaces(): Promise<string[]>;
  getStats(): Promise<BackendStats>;
  healthCheck?(): Promise<{ status: string; score: number; issues: string[]; lastCheck: Date }>;
}

// Base backend class
abstract class BaseBackend implements BackendInterface {
  protected config: BackendConfig;

  constructor(config: BackendConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  abstract retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  abstract search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  abstract delete(key: string, namespace?: string): Promise<boolean>;
  abstract listNamespaces(): Promise<string[]>;
  abstract getStats(): Promise<BackendStats>;

  async healthCheck() {
    return {
      status: 'healthy',
      score: 100,
      issues: [],
      lastCheck: new Date(),
    };
  }
}

/** LanceDB Backend (Vector Database) */
export class LanceDBBackend extends BaseBackend {
  private lanceInterface: LanceDBInterface;

  constructor(config: BackendConfig) {
    super(config);
    this.lanceInterface = new LanceDBInterface({
      dbPath: `${config.path}/lancedb`,
    });
  }

  async initialize(): Promise<void> {
    await this.lanceInterface.initialize();
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();

    // Serialize value for storage
    const serializedValue = JSON.stringify(value);

    // For LanceDB, we need to store documents as text content for embeddings
    const documentText =
      typeof value === 'object' && value && 'content' in value
        ? (value as any).content
        : serializedValue;

    const vectorDoc = {
      id: fullKey,
      vector: new Array(384).fill(0), // placeholder vector
      metadata: {
        key,
        namespace,
        timestamp,
        serialized_data: serializedValue,
        content: documentText,
      },
    };

    await this.lanceInterface.insertVectors('documents', [vectorDoc]);

    return {
      id: fullKey,
      timestamp,
      status: 'success',
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'documents',
        new Array(384).fill(0),
        1,
        {
          key: key,
          namespace: namespace,
        }
      );

      if (!searchResult || searchResult.length === 0) {
        return null;
      }

      const result = searchResult[0];
      const metadata = result.metadata || {};

      if (metadata.serialized_data) {
        return JSON.parse(metadata.serialized_data);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};

    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'documents',
        new Array(384).fill(0),
        100,
        {
          namespace: namespace,
        }
      );

      for (const result of searchResult || []) {
        try {
          const metadata = result.metadata || {};
          if (metadata.namespace === namespace && metadata.serialized_data) {
            const key = metadata.key;
            if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
              results[key] = JSON.parse(metadata.serialized_data);
            }
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
    } catch (error) {
      // Return empty results on error
    }

    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    // LanceDB doesn't have direct delete operations in this interface
    console.warn('Delete operation not implemented for LanceDB backend');
    return false;
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const searchResult = await this.lanceInterface.searchSimilar(
        'documents',
        new Array(384).fill(0),
        1000
      );

      const namespaces = new Set<string>();
      for (const result of searchResult || []) {
        try {
          const metadata = result.metadata || {};
          if (metadata.namespace) {
            namespaces.add(metadata.namespace);
          }
        } catch (error) {
          // Skip invalid entries
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
}

/** SQLite Backend */
export class SQLiteBackend extends BaseBackend {
  private db?: any;
  private dbPath: string;

  constructor(config: BackendConfig) {
    super(config);
    this.dbPath = `${config.path}/storage.db`;
  }

  async initialize(): Promise<void> {
    const { default: Database } = await import('better-sqlite3');
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    // Ensure directory exists
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    this.db = new (Database as any)(this.dbPath);

    // Create table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS storage (
        id TEXT PRIMARY KEY,
        namespace TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        UNIQUE(namespace, key)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_namespace ON storage(namespace);
      CREATE INDEX IF NOT EXISTS idx_key ON storage(key);
    `);
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    const serializedValue = JSON.stringify(value);

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO storage(id, namespace, key, value, timestamp)
      VALUES(?, ?, ?, ?, ?)
    `);

    stmt.run(fullKey, namespace, key, serializedValue, timestamp);

    return {
      id: fullKey,
      timestamp,
      status: 'success',
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const stmt = this.db.prepare(`
      SELECT value FROM storage 
      WHERE namespace = ? AND key = ?
    `);

    const result = stmt.get(namespace, key);

    if (!result) return null;

    try {
      return JSON.parse(result.value);
    } catch (error) {
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    const searchPattern = pattern.replace('*', '%');

    const stmt = this.db.prepare(`
      SELECT key, value FROM storage 
      WHERE namespace = ? AND key LIKE ?
    `);

    const rows = stmt.all(namespace, searchPattern);

    for (const row of rows) {
      try {
        results[row.key] = JSON.parse(row.value);
      } catch (error) {
        // Skip invalid entries
      }
    }

    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM storage 
      WHERE namespace = ? AND key = ?
    `);

    const result = stmt.run(namespace, key);
    return result.changes > 0;
  }

  async listNamespaces(): Promise<string[]> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT namespace FROM storage
      ORDER BY namespace
    `);

    const rows = stmt.all();
    return rows.map((row: any) => row.namespace);
  }

  async getStats(): Promise<BackendStats> {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM storage');
    const sizeStmt = this.db.prepare(
      'SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()'
    );

    const countResult = countStmt.get();
    const sizeResult = sizeStmt.get();

    return {
      entries: countResult.count,
      size: sizeResult.size,
      lastModified: Date.now(),
    };
  }
}

/** JSON File Backend */
export class JSONBackend extends BaseBackend {
  private data = new Map<string, { value: JSONValue; timestamp: number }>();
  private filepath: string;

  constructor(config: BackendConfig) {
    super(config);
    this.filepath = `${config.path}/memory-backend.json`;
  }

  async initialize(): Promise<void> {
    // Load existing data if available
    try {
      const fs = await import('node:fs/promises');
      const data = await fs.readFile(this.filepath, 'utf8');
      const parsed = JSON.parse(data);
      this.data = new Map(Object.entries(parsed));
    } catch {
      // File doesn't exist or is corrupted, start fresh
    }
  }

  async store(
    key: string,
    value: JSONValue,
    namespace: string = 'default'
  ): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();

    this.data.set(fullKey, { value, timestamp });
    await this.persist();

    return {
      id: fullKey,
      timestamp,
      status: 'success',
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    const entry = this.data.get(fullKey);
    return entry?.value ?? null;
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    const prefix = `${namespace}:`;
    for (const [key, entry] of Array.from(this.data.entries())) {
      if (key.startsWith(prefix) && key.includes(pattern)) {
        results[key.substring(prefix.length)] = entry.value;
      }
    }
    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const fullKey = `${namespace}:${key}`;
    const deleted = this.data.delete(fullKey);
    if (deleted) await this.persist();
    return deleted;
  }

  async listNamespaces(): Promise<string[]> {
    const namespaces = new Set<string>();
    for (const key of Array.from(this.data.keys())) {
      const namespace = key.split(':')[0];
      namespaces.add(namespace);
    }
    return Array.from(namespaces);
  }

  async getStats(): Promise<BackendStats> {
    return {
      entries: this.data.size,
      size: JSON.stringify(Array.from(this.data.entries())).length,
      lastModified: Date.now(),
    };
  }

  private async persist(): Promise<void> {
    const fs = await import('node:fs/promises');
    const dir = this.filepath.substring(0, this.filepath.lastIndexOf('/'));

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Convert Map to object for JSON serialization
    const obj: Record<string, any> = {};
    for (const [key, value] of Array.from(this.data.entries())) {
      obj[key] = value;
    }

    await fs.writeFile(this.filepath, JSON.stringify(obj, null, 2));
  }
}

// Backend factory
export class BackendFactory {
  static create(config: BackendConfig): BackendInterface {
    switch (config.type) {
      case 'lancedb':
        return new LanceDBBackend(config);
      case 'sqlite':
        return new SQLiteBackend(config);
      case 'json':
        return new JSONBackend(config);
      default:
        throw new Error(`Unknown backend type: ${config.type}`);
    }
  }
}

export default BackendFactory;
