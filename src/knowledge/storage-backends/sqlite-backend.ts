/**
 * SQLite Backend for FACT Storage
 *
 * Lightweight, embedded SQLite storage with JSON support
 */

import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type {
  FACTKnowledgeEntry,
  FACTSearchQuery,
  FACTStorageBackend,
  FACTStorageStats,
} from '../fact-storage-interface';

interface SQLiteBackendConfig {
  dbPath: string;
  tableName: string;
  enableWAL: boolean;
  enableFullTextSearch: boolean;
  enablePerformanceIndexes: boolean;
}

export class SQLiteBackend implements FACTStorageBackend {
  private config: SQLiteBackendConfig;
  private db?: Database.Database;
  private prepared: {
    insert?: Database.Statement;
    select?: Database.Statement;
    search?: Database.Statement;
    searchFTS?: Database.Statement;
    cleanup?: Database.Statement;
    stats?: Database.Statement;
    delete?: Database.Statement;
  } = {};

  constructor(config: Partial<SQLiteBackendConfig> = {}) {
    this.config = {
      dbPath: path.join(process.cwd(), '.claude', 'fact-storage.db'),
      tableName: 'fact_knowledge',
      enableWAL: true,
      enableFullTextSearch: true,
      enablePerformanceIndexes: true,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    // Ensure directory exists
    const dbDir = path.dirname(this.config.dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    // Open database
    this.db = new Database(this.config.dbPath);

    // Enable WAL mode for better performance
    if (this.config.enableWAL) {
      this.db.pragma('journal_mode = WAL');
    }

    // Create tables
    await this.createTables();

    // Create indexes
    if (this.config.enablePerformanceIndexes) {
      await this.createIndexes();
    }

    // Prepare statements
    await this.prepareStatements();

    console.log(`✅ SQLite FACT storage initialized: ${this.config.dbPath}`);
  }

  async store(entry: FACTKnowledgeEntry): Promise<void> {
    if (!this.prepared.insert) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      this.prepared.insert.run({
        id: entry.id,
        query: entry.query,
        response: entry.response,
        metadata: JSON.stringify(entry.metadata),
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        access_count: entry.accessCount,
        last_accessed: entry.lastAccessed,
        expires_at: entry.timestamp + entry.ttl,
      });

      // Insert into FTS table if enabled
      if (this.config.enableFullTextSearch) {
        this.db!.prepare(`
          INSERT OR REPLACE INTO ${this.config.tableName}_fts (id, query, response, domains, type)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          entry.id,
          entry.query,
          entry.response,
          entry.metadata.domains.join(' '),
          entry.metadata.type
        );
      }
    } catch (error) {
      console.error('Failed to store FACT entry:', error);
      throw error;
    }
  }

  async get(id: string): Promise<FACTKnowledgeEntry | null> {
    if (!this.prepared.select) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const row = this.prepared.select.get({ id }) as any;

      if (!row) {
        return null;
      }

      // Check if entry is expired
      if (Date.now() > row.expires_at) {
        await this.delete(id);
        return null;
      }

      return {
        id: row.id,
        query: row.query,
        response: row.response,
        metadata: JSON.parse(row.metadata),
        timestamp: row.timestamp,
        ttl: row.ttl,
        accessCount: row.access_count,
        lastAccessed: row.last_accessed,
      };
    } catch (error) {
      console.error('Failed to get FACT entry:', error);
      return null;
    }
  }

  async search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]> {
    if (!this.db) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      let sql = '';
      let params: any = {};

      if (query.query && this.config.enableFullTextSearch) {
        // Use full-text search
        sql = `
          SELECT f.* FROM ${this.config.tableName} f
          JOIN ${this.config.tableName}_fts fts ON f.id = fts.id
          WHERE fts.${this.config.tableName}_fts MATCH ?
          AND f.expires_at > ?
        `;
        params = [query.query, Date.now()];
      } else {
        // Use regular search
        const conditions = ['expires_at > ?'];
        params = [Date.now()];

        if (query.query) {
          conditions.push('(query LIKE ? OR response LIKE ?)');
          const searchTerm = `%${query.query}%`;
          params.push(searchTerm, searchTerm);
        }

        if (query.type) {
          conditions.push(`JSON_EXTRACT(metadata, '$.type') = ?`);
          params.push(query.type);
        }

        if (query.domains && query.domains.length > 0) {
          const domainConditions = query.domains
            .map(
              () =>
                `EXISTS (SELECT 1 FROM JSON_EACH(JSON_EXTRACT(metadata, '$.domains')) WHERE value = ?)`
            )
            .join(' OR ');
          conditions.push(`(${domainConditions})`);
          params.push(...query.domains);
        }

        if (query.minConfidence !== undefined) {
          conditions.push(`JSON_EXTRACT(metadata, '$.confidence') >= ?`);
          params.push(query.minConfidence);
        }

        if (query.maxAge !== undefined) {
          conditions.push(`timestamp >= ?`);
          params.push(Date.now() - query.maxAge);
        }

        sql = `
          SELECT * FROM ${this.config.tableName}
          WHERE ${conditions.join(' AND ')}
          ORDER BY timestamp DESC, access_count DESC
          LIMIT ?
        `;
        params.push(query.limit || 50);
      }

      const rows = this.db.prepare(sql).all(params) as any[];

      return rows.map((row) => ({
        id: row.id,
        query: row.query,
        response: row.response,
        metadata: JSON.parse(row.metadata),
        timestamp: row.timestamp,
        ttl: row.ttl,
        accessCount: row.access_count,
        lastAccessed: row.last_accessed,
      }));
    } catch (error) {
      console.error('Failed to search FACT entries:', error);
      return [];
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.prepared.delete) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const result = this.prepared.delete.run({ id });

      // Delete from FTS table if enabled
      if (this.config.enableFullTextSearch) {
        this.db!.prepare(`DELETE FROM ${this.config.tableName}_fts WHERE id = ?`).run(id);
      }

      return result.changes > 0;
    } catch (error) {
      console.error('Failed to delete FACT entry:', error);
      return false;
    }
  }

  async cleanup(maxAge: number): Promise<number> {
    if (!this.prepared.cleanup) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const cutoffTime = Date.now() - maxAge;
      const result = this.prepared.cleanup.run({ cutoff: cutoffTime });

      // Clean up FTS table if enabled
      if (this.config.enableFullTextSearch) {
        this.db!.prepare(`
          DELETE FROM ${this.config.tableName}_fts 
          WHERE id NOT IN (SELECT id FROM ${this.config.tableName})
        `).run();
      }

      return result.changes;
    } catch (error) {
      console.error('Failed to cleanup FACT entries:', error);
      return 0;
    }
  }

  async getStats(): Promise<Partial<FACTStorageStats>> {
    if (!this.prepared.stats) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const stats = this.prepared.stats.get() as any;

      return {
        persistentEntries: stats.total_count,
        oldestEntry: stats.oldest_timestamp,
        newestEntry: stats.newest_timestamp,
      };
    } catch (error) {
      console.error('Failed to get FACT storage stats:', error);
      return {};
    }
  }

  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      this.db.prepare(`DELETE FROM ${this.config.tableName}`).run();

      if (this.config.enableFullTextSearch) {
        this.db.prepare(`DELETE FROM ${this.config.tableName}_fts`).run();
      }

      // Reset auto-increment
      this.db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(this.config.tableName);
    } catch (error) {
      console.error('Failed to clear FACT storage:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = undefined;
    }
    this.prepared = {};
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    // Main table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        metadata TEXT NOT NULL, -- JSON column
        timestamp INTEGER NOT NULL,
        ttl INTEGER NOT NULL,
        access_count INTEGER DEFAULT 0,
        last_accessed INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);

    // Full-text search table
    if (this.config.enableFullTextSearch) {
      this.db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS ${this.config.tableName}_fts USING fts5(
          id UNINDEXED,
          query,
          response,
          domains,
          type,
          content=${this.config.tableName}
        )
      `);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_timestamp ON ${this.config.tableName}(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_expires_at ON ${this.config.tableName}(expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_type ON ${this.config.tableName}(JSON_EXTRACT(metadata, '$.type'))`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_confidence ON ${this.config.tableName}(JSON_EXTRACT(metadata, '$.confidence'))`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_access_count ON ${this.config.tableName}(access_count)`,
    ];

    for (const indexSQL of indexes) {
      try {
        this.db.exec(indexSQL);
      } catch (error) {
        console.warn('Failed to create index:', indexSQL, error);
      }
    }
  }

  private async prepareStatements(): Promise<void> {
    if (!this.db) return;

    this.prepared.insert = this.db.prepare(`
      INSERT OR REPLACE INTO ${this.config.tableName}
      (id, query, response, metadata, timestamp, ttl, access_count, last_accessed, expires_at)
      VALUES (@id, @query, @response, @metadata, @timestamp, @ttl, @access_count, @last_accessed, @expires_at)
    `);

    this.prepared.select = this.db.prepare(`
      SELECT * FROM ${this.config.tableName} WHERE id = @id
    `);

    this.prepared.delete = this.db.prepare(`
      DELETE FROM ${this.config.tableName} WHERE id = @id
    `);

    this.prepared.cleanup = this.db.prepare(`
      DELETE FROM ${this.config.tableName} WHERE expires_at < @cutoff
    `);

    this.prepared.stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_count,
        MIN(timestamp) as oldest_timestamp,
        MAX(timestamp) as newest_timestamp
      FROM ${this.config.tableName}
    `);
  }
}

export default SQLiteBackend;
