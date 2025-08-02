/**
 * @fileoverview SQLite backend for memory storage.
 */

import { BaseBackend, BackendConfig, BackendStats, JSONValue, StorageResult } from './base.backend';

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

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    this.db = new (Database as any)(this.dbPath);

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
