import { getLogger } from "../../config/logging-config";
const logger = getLogger("knowledge-storage-backends-sqlite-backend");
/**
 * SQLite Backend for FACT Storage using Unified DAL
 *
 * Lightweight, embedded SQLite storage with JSON support
 * Refactored to use the unified Database Access Layer instead of direct SQLite
 */

import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import type { DatabaseAdapter, DatabaseConfig } from '../../database/providers/database-providers';
// Use DAL instead of direct database access
import { DatabaseProviderFactory } from '../../database/providers/database-providers';
import type {
  FACTKnowledgeEntry,
  FACTSearchQuery,
  FACTStorageBackend,
  FACTStorageStats,
} from '../storage-interface';

interface SQLiteBackendConfig {
  dbPath: string;
  tableName: string;
  enableWAL: boolean;
  enableFullTextSearch: boolean;
  enablePerformanceIndexes: boolean;
}

export class SQLiteBackend implements FACTStorageBackend {
  private config: SQLiteBackendConfig;
  private dalAdapter?: DatabaseAdapter;
  private dalFactory: DatabaseProviderFactory;
  private isInitialized = false;

  constructor(config: Partial<SQLiteBackendConfig> = {}, dalFactory?: DatabaseProviderFactory) {
    this.config = {
      dbPath: path.join(process.cwd(), '.claude', 'fact-storage.db'),
      tableName: 'fact_knowledge',
      enableWAL: true,
      enableFullTextSearch: true,
      enablePerformanceIndexes: true,
      ...config,
    };

    // Use provided factory or create a minimal one
    this.dalFactory =
      dalFactory ||
      new DatabaseProviderFactory(
        console, // Simple logger for now
        {} // Minimal config
      );
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Ensure directory exists
    const dbDir = path.dirname(this.config.dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    // Create DAL configuration for SQLite
    const dalConfig: DatabaseConfig = {
      type: 'sqlite',
      database: this.config.dbPath,
      options: {
        readonly: false,
        fileMustExist: false,
        timeout: 5000,
        wal: this.config.enableWAL,
      },
    };

    // Create DAL adapter
    this.dalAdapter = this.dalFactory.createAdapter(dalConfig);
    await this.dalAdapter.connect();

    // Create tables using DAL
    await this.createTables();

    // Create indexes
    if (this.config.enablePerformanceIndexes) {
      await this.createIndexes();
    }

    this.isInitialized = true;
  }

  async store(entry: FACTKnowledgeEntry): Promise<void> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      await this.dalAdapter.execute(
        `INSERT OR REPLACE INTO ${this.config.tableName}
         (id, query, response, metadata, timestamp, ttl, access_count, last_accessed, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.query,
          entry.response,
          JSON.stringify(entry.metadata),
          entry.timestamp,
          entry.ttl,
          entry.accessCount,
          entry.lastAccessed,
          entry.timestamp + entry.ttl,
        ]
      );

      // Insert into FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(
          `INSERT OR REPLACE INTO ${this.config.tableName}_fts (id, query, response, domains, type)
           VALUES (?, ?, ?, ?, ?)`,
          [
            entry.id,
            entry.query,
            entry.response,
            entry.metadata.domains?.join(' ') || '',
            entry.metadata.type,
          ]
        );
      }
    } catch (error) {
      logger.error('Failed to store FACT entry:', error);
      throw error;
    }
  }

  async get(id: string): Promise<FACTKnowledgeEntry | null> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const result = await this.dalAdapter.query(
        `SELECT * FROM ${this.config.tableName} WHERE id = ?`,
        [id]
      );
      const row = result.rows?.[0] as any;

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
      logger.error('Failed to get FACT entry:', error);
      return null;
    }
  }

  async search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]> {
    if (!this.dalAdapter) {
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

      const result = await this.dalAdapter.query(sql, params);
      const rows = result.rows as any[];

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
      logger.error('Failed to search FACT entries:', error);
      return [];
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const result = await this.dalAdapter.execute(
        `DELETE FROM ${this.config.tableName} WHERE id = ?`,
        [id]
      );

      // Delete from FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}_fts WHERE id = ?`, [
          id,
        ]);
      }

      return (result.rowsAffected || 0) > 0;
    } catch (error) {
      logger.error('Failed to delete FACT entry:', error);
      return false;
    }
  }

  async cleanup(maxAge: number): Promise<number> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const cutoffTime = Date.now() - maxAge;
      const result = await this.dalAdapter.execute(
        `DELETE FROM ${this.config.tableName} WHERE expires_at < ?`,
        [cutoffTime]
      );

      // Clean up FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(
          `DELETE FROM ${this.config.tableName}_fts 
           WHERE id NOT IN (SELECT id FROM ${this.config.tableName})`
        );
      }

      return result.rowsAffected || 0;
    } catch (error) {
      logger.error('Failed to cleanup FACT entries:', error);
      return 0;
    }
  }

  async getStats(): Promise<Partial<FACTStorageStats>> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      const result = await this.dalAdapter.query(
        `SELECT 
         COUNT(*) as total_count,
         MIN(timestamp) as oldest_timestamp,
         MAX(timestamp) as newest_timestamp
         FROM ${this.config.tableName}`
      );
      const stats = result.rows?.[0] as any;

      return {
        persistentEntries: stats.total_count,
        oldestEntry: stats.oldest_timestamp,
        newestEntry: stats.newest_timestamp,
      };
    } catch (error) {
      logger.error('Failed to get FACT storage stats:', error);
      return {};
    }
  }

  async clear(): Promise<void> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');
    }

    try {
      await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}`);

      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}_fts`);
      }

      // Reset auto-increment
      await this.dalAdapter.execute(`DELETE FROM sqlite_sequence WHERE name = ?`, [
        this.config.tableName,
      ]);
    } catch (error) {
      logger.error('Failed to clear FACT storage:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.dalAdapter) {
      await this.dalAdapter.disconnect();
      this.dalAdapter = undefined;
    }
    this.isInitialized = false;
  }

  private async createTables(): Promise<void> {
    if (!this.dalAdapter) return;

    // Main table
    await this.dalAdapter.execute(`
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
      await this.dalAdapter.execute(`
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
    if (!this.dalAdapter) return;

    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_timestamp ON ${this.config.tableName}(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_expires_at ON ${this.config.tableName}(expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_type ON ${this.config.tableName}(JSON_EXTRACT(metadata, '$.type'))`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_confidence ON ${this.config.tableName}(JSON_EXTRACT(metadata, '$.confidence'))`,
      `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_access_count ON ${this.config.tableName}(access_count)`,
    ];

    for (const indexSQL of indexes) {
      try {
        await this.dalAdapter.execute(indexSQL);
      } catch (error) {
        logger.warn('Failed to create index:', indexSQL, error);
      }
    }
  }
}

export default SQLiteBackend;
