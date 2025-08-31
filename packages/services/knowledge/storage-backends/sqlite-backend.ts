/**
 * @file Sqlite-backend implementation.
 */

import { getLogger} from '../../config/logging-config';

const logger = getLogger('knowledge-storage-backends-sqlite-backend');

/**
 * SQLite Backend for FACT Storage using Unified DAL.
 *
 * Lightweight, embedded SQLite storage with JSON support.
 * Refactored to use the unified Database Access Layer instead of direct SQLite.
 */

import { existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import type {
  DatabaseAdapter,
  DatabaseConfig,
} from '../../database/providers/database-providers';
// Use DAL instead of direct database access
import { DatabaseProviderFactory} from '../../database/providers/database-providers';
import type {
  FACTKnowledgeEntry,
  FACTStorageBackend,
  FACTStorageStats,
} from '../storage-interface';

interface SQLiteBackendConfig {
  dbPath:string;
  tableName:string;
  enableWAL:boolean;
  enableFullTextSearch:boolean;
  enablePerformanceIndexes:boolean;
}

export class SQLiteBackend implements FACTStorageBackend {
  private config:SQLiteBackendConfig;
  private dalAdapter?:DatabaseAdapter;
  private dalFactory:DatabaseProviderFactory;
  private isInitialized = false;

  constructor(
    config:Partial<SQLiteBackendConfig> = {},
    dalFactory?:DatabaseProviderFactory
  ) {
    this.config = {
      dbPath:path.join(process.cwd(), '.claude',    'fact-storage.db'),
      tableName: 'fact_knowledge',      enableWAL:true,
      enableFullTextSearch:true,
      enablePerformanceIndexes:true,
      ...config,
};

    // Use provided factory or create a minimal one
    this.dalFactory =
      dalFactory||new DatabaseProviderFactory(
        console, // Simple logger for now
        {} // Minimal config
      );
}

  async initialize():Promise<void> {
    if (this.isInitialized) {
      return;
}

    // Ensure directory exists
    const dbDir = path.dirname(this.config.dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive:true});
}

    // Create DAL configuration for SQLite
    const dalConfig:DatabaseConfig = {
      type: 'sqlite',      database:this.config.dbPath,
      options:{
        readonly:false,
        fileMustExist:false,
        timeout:5000,
        wal:this.config.enableWAL,
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

  async store(entry:FACTKnowledgeEntry): Promise<void> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      await this.dalAdapter.execute(
        `INSERT OR REPLACE NTO ${this.config.tableName}`
         (id, query, response, metadata, timestamp, ttl, access_count, last_accessed, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,`
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
          `INSERT OR REPLACE NTO ${this.config.tableName}_fts (id, query, response, domains, type)`
           VALUES (?, ?, ?, ?, ?)`,`
          [
            entry.id,
            entry.query,
            entry.response,
            entry.metadata.domains?.join(' ')||',            entry.metadata.type,
]
        );
}
} catch (error) {
      logger.error('Failed to store FACT entry:', error);')      throw error;
}
}

  async get(id:string): Promise<FACTKnowledgeEntry|null> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const __result = await this.dalAdapter.query(
        `SELECT * FROM ${this.config.tableName} WHERE id = ?`,`
        [id]
      );
      const row = result?.rows?.[0];

      if (!row) {
        return null;
}

      // Check if entry is expired
      if (Date.now() > row.expires_at) {
        await this.delete(id);
        return null;
}

      return {
        id:row.id,
        query:row.query,
        response:row.response,
        metadata:JSON.parse(row.metadata),
        timestamp:row.timestamp,
        ttl:row.ttl,
        accessCount:row.access_count,
        lastAccessed:row.last_accessed,
};
} catch (error) {
      logger.error('Failed to get FACT entry:', error);')      return null;
}
}

  async search(query:FACTSearchQuery): Promise<FACTKnowledgeEntry[]> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      let sql = ';
      let params:unknown = {};

      if (query.query && this.config.enableFullTextSearch) {
        // Use full-text search
        sql = ``
          SELECT f.* FROM ${this.config.tableName} f
          JOIN ${this.config.tableName}_fts fts ON f.id = fts.id
          WHERE fts.${this.config.tableName}_fts MATCH ?
          AND f.expires_at > ?
        `;`
        params = [query.query, Date.now()];
} else {
        // Use regular search
        const conditions = ['expires_at > ?'];')        params = [Date.now()];

        if (query.query) {
          conditions.push('(query LIKE ? OR response LIKE ?)');')          const searchTerm = `%$query.query%`;`
          params?.push(searchTerm, searchTerm);
}

        if (query.type) {
          conditions.push(`JSON_EXTRACT(metadata, '$.type') = ?`);`
          params?.push(query.type);
}

        if (query.domains && query.domains.length > 0) {
          const domainConditions = query.domains
            .map(
              () =>
                `EXISTS (SELECT 1 FROM JSON_EACH(JSON_EXTRACT(metadata, '$.domains')) WHERE value = ?)``
            )
            .join(' OR ');')          conditions.push(`($domainConditions)`);`
          params?.push(...query.domains);
}

        if (query.minConfidence !== undefined) {
          conditions.push(`JSON_EXTRACT(metadata, '$.confidence') >= ?`);`
          params?.push(query.minConfidence);
}

        if (query.maxAge !== undefined) {
          conditions.push(`timestamp >= ?`);`
          params?.push(Date.now() - query.maxAge);
}

        sql = ``
          SELECT * FROM ${this.config.tableName}
          WHERE ${conditions.join(' AND ')}')          ORDER BY timestamp DESC, access_count DESC
          LIMIT ?
        `;`
        params?.push(query.limit||50);
}

      const result = await this.dalAdapter.query(sql, params);
      const rows = result?.rows;

      return rows.map((row) => ({
        id:row.id,
        query:row.query,
        response:row.response,
        metadata:JSON.parse(row.metadata),
        timestamp:row.timestamp,
        ttl:row.ttl,
        accessCount:row.access_count,
        lastAccessed:row.last_accessed,
}));
} catch (error) {
      logger.error('Failed to search FACT entries:', error);')      return [];
}
}

  async delete(id:string): Promise<boolean> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const result = await this.dalAdapter.execute(
        `DELETE FROM $this.config.tableNameWHERE id = ?`,`
        [id]
      );

      // Delete from FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(
          `DELETE FROM ${this.config.tableName}_fts WHERE id = ?`,`
          [id]
        );
}

      return (result?.rowsAffected||0) > 0;
} catch (error) {
      logger.error('Failed to delete FACT entry:', error);')      return false;
}
}

  async cleanup(maxAge:number): Promise<number> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const cutoffTime = Date.now() - maxAge;
      const result = await this.dalAdapter.execute(
        `DELETE FROM ${this.config.tableName} WHERE expires_at < ?`,`
        [cutoffTime]
      );

      // Clean up FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(
          `DELETE FROM ${this.config.tableName}_fts `
           WHERE id NOT N (SELECT id FROM ${this.config.tableName})``
        );
}

      return result?.rowsAffected||0;
} catch (error) 
      logger.error('Failed to cleanup FACT entries:', error);')      return 0;
}

  async getStats():Promise<Partial<FACTStorageStats>> 
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const result = await this.dalAdapter.query(
        `SELECT `
         COUNT(*) as total_count,
         MIN(timestamp) as oldest_timestamp,
         MAX(timestamp) as newest_timestamp
         FROM ${this.config.tableName}``
      );
      const __stats = result?.rows?.[0];

      return {
        persistentEntries:stats.total_count,
        oldestEntry:stats.oldest_timestamp,
        newestEntry:stats.newest_timestamp,
};
} catch (error) {
      logger.error('Failed to get FACT storage stats:', error);')      return {};
}

  async clear():Promise<void> 
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}`);`

      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(
          `DELETE FROM $this.config.tableName_fts``
        );
}

      // Reset auto-increment
      await this.dalAdapter.execute(
        `DELETE FROM sqlite_sequence WHERE name = ?`,`
        [this.config.tableName]
      );
} catch (error) {
      logger.error('Failed to clear FACT storage:', error);')      throw error;
}
}

  async shutdown():Promise<void> {
    if (this.dalAdapter) {
      await this.dalAdapter.disconnect();
      this.dalAdapter = undefined;
}
    this.isInitialized = false;
}

  async clearByQuality(minQuality:number): Promise<number> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const result = await this.dalAdapter.execute(
        `DELETE FROM ${this.config.tableName} WHERE JSON_EXTRACT(metadata, '$.confidence') < ?`,`
        [minQuality]
      );

      // Clean up FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(
          `DELETE FROM ${this.config.tableName}_fts `
           WHERE id NOT N (SELECT id FROM ${this.config.tableName})``
        );
}

      return result?.rowsAffected||0;catch (error) 
      logger.error('Failed to clear entries by quality:', error);')      return 0;
}

  async clearByAge(maxAgeMs:number): Promise<number> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const __cutoffTime = Date.now() - maxAgeMs;
      const __result = await this.dalAdapter.execute(
        `DELETE FROM ${this.config.tableName} WHERE timestamp < ?`,`
        [cutoffTime]
      );

      // Clean up FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(
          `DELETE FROM ${this.config.tableName}_fts `
           WHERE id NOT N (SELECT id FROM ${this.config.tableName})``
        );
}

      return result?.rowsAffected||0;
} catch (error) {
      logger.error('Failed to clear entries by age:', error);')      return 0;
}
}

  async clearMemoryCache():Promise<number> {
    // SQLite backend doesn't have a separate memory cache')    // This is a no-op for SQLite backend
    return 0;
}

  async clearAll():Promise<number> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const countResult = await this.dalAdapter.query(
        `SELECT COUNT(*) as count FROM ${this.config.tableName}``
      );
      const totalEntries = countResult?.rows?.[0]?.count||0;

      await this.clear();
      return totalEntries;
} catch (error) {
      logger.error('Failed to clear all entries:', error);')      return 0;
}
}

  async optimize(
    strategy:'aggressive|balanced|conservative' = ' balanced')  ):Promise<{ optimized: boolean; details: string}> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      const operations = [];

      // Always vacuum the database
      await this.dalAdapter.execute('VACUUM');')      operations.push('VACUUM completed');')
      // Reindex based on strategy
      if (strategy === 'aggressive'||strategy ===' balanced') {
    ')        await this.dalAdapter.execute('REINDEX');')        operations.push('REINDEX completed');')}

      // Analyze statistics for query optimization
      if (strategy === 'aggressive') {
    ')        await this.dalAdapter.execute('ANALYZE');')        operations.push('ANALYZE completed');')}

      // Clean up expired entries
      const cleaned = await this.cleanup(0); // Clean all expired
      if (cleaned > 0) {
        operations.push(`Cleaned ${cleaned} expired entries`);`
}

      return {
        optimized:true,
        details:`Optimization complete: $operations.join(',    ')`,`
};
} catch (error) {
      logger.error('Failed to optimize storage:', error);')      return {
        optimized:false,
        details:`Optimization failed: ${(error as Error).message}`,`
};
}
}

  async getStorageStats():Promise<FACTStorageStats> {
    if (!this.dalAdapter) {
      throw new Error('SQLite backend not initialized');')}

    try {
      // Get basic counts and timestamps
      const basicStatsResult = await this.dalAdapter.query(
        `SELECT `
         COUNT(*) as total_count,
         MIN(timestamp) as oldest_timestamp,
         MAX(timestamp) as newest_timestamp,
         AVG(access_count) as avg_access_count
         FROM ${this.config.tableName}``
      );
      const __basicStats = basicStatsResult?.rows?.[0];

      // Get top domains
      const __domainsResult = await this.dalAdapter.query(
        `SELECT JSON_EXTRACT(metadata, '$.domains') as domains, COUNT(*) as count')         FROM ${this.config.tableName}`
         GROUP BY JSON_EXTRACT(metadata, '$.domains')')         ORDER BY count DESC
         LIMIT 10``
      );
      const topDomains =
        domainsResult?.rows
          ?.flatMap((row:unknown) => {
            try {
              const domains = JSON.parse(row.domains||'[]');')              return Array.isArray(domains) ? domains:[];
} catch {
              return [];
}
})
          .slice(0, 10)||[];

      // Calculate storage health based on various metrics
      let storageHealth:'excellent|good|fair|poor' = ' excellent';
      const totalEntries = basicStats?.total_count||0;
      const avgAccessCount = basicStats?.avg_access_count||0;

      if (totalEntries > 10000 && avgAccessCount < 2) {
        storageHealth ='fair;
} else if (totalEntries > 50000) {
        storageHealth = 'good';
} else if (totalEntries < 100) {
        storageHealth = 'poor';
}

      return {
        memoryEntries:0, // SQLite backend doesn't use memory cache')        persistentEntries:totalEntries,
        totalMemorySize:0, // SQLite backend doesn't use memory cache')        cacheHitRate:0, // Not applicable for persistent-only storage
        oldestEntry:basicStats?.oldest_timestamp||0,
        newestEntry:basicStats?.newest_timestamp||0,
        topDomains,
        storageHealth,
};
} catch (error) {
      logger.error('Failed to get storage stats:', error);')      return {
        memoryEntries:0,
        persistentEntries:0,
        totalMemorySize:0,
        cacheHitRate:0,
        oldestEntry:0,
        newestEntry:0,
        topDomains:[],
        storageHealth: 'poor',};
}
}

  private async createTables():Promise<void> {
    if (!this.dalAdapter) return;

    // Main table
    await this.dalAdapter.execute(``
      CREATE TABLE F NOT EXISTS ${this.config.tableName} (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        metadata TEXT NOT NULL, -- JSON column
        timestamp NTEGER NOT NULL,
        ttl NTEGER NOT NULL,
        access_count NTEGER DEFAULT 0,
        last_accessed NTEGER NOT NULL,
        expires_at NTEGER NOT NULL
      )
    `);`

    // Full-text search table
    if (this.config.enableFullTextSearch) {
      await this.dalAdapter.execute(``
        CREATE VIRTUAL TABLE F NOT EXISTS ${this.config.tableName}_fts USING fts5(
          id UNINDEXED,
          query,
          response,
          domains,
          type,
          content=${this.config.tableName}
        )
      `);`
}
}

  private async createIndexes():Promise<void> {
    if (!this.dalAdapter) return;

    const indexes = [
      `CREATE NDEX F NOT EXISTS idx_$this.config.tableName_timestamp ON $this.config.tableName(timestamp)`,`
      `CREATE NDEX F NOT EXISTS idx_${this.config.tableName}_expires_at ON ${this.config.tableName}(expires_at)`,`
      `CREATE NDEX F NOT EXISTS idx_$this.config.tableName_type ON $this.config.tableName(JSON_EXTRACT(metadata, '$.type'))`,`
      `CREATE NDEX F NOT EXISTS idx_${this.config.tableName}_confidence ON ${this.config.tableName}(JSON_EXTRACT(metadata, '$.confidence'))`,`
      `CREATE NDEX F NOT EXISTS idx_$this.config.tableName_access_count ON $this.config.tableName(access_count)`,`
];

    for (const indexSQL of indexes) {
      try {
        await this.dalAdapter.execute(indexSQL);
} catch (error) {
        logger.warn('Failed to create index:', indexSQL, error);')}
}
}
}

export default SQLiteBackend;
