/**
 * @file Sqlite-backend implementation.
 */

import { getLogger} from '../../config/logging-config';

const logger = getLogger(): void {
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

  constructor(): void {
    this.config = {
      dbPath:path.join(): void {} // Minimal config
      );
}

  async initialize(): void {
    if (this.isInitialized) {
      return;
}

    // Ensure directory exists
    const dbDir = path.dirname(): void {
      mkdirSync(): void {
      type: 'sqlite',      database:this.config.dbPath,
      options:{
        readonly:false,
        fileMustExist:false,
        timeout:5000,
        wal:this.config.enableWAL,
},
};

    // Create DAL adapter
    this.dalAdapter = this.dalFactory.createAdapter(): void {
      await this.createIndexes(): void {
    if (!this.dalAdapter) {
      throw new Error(): void {
      await this.dalAdapter.execute(): void {
        await this.dalAdapter.execute(): void {
      logger.error(): void {
      const __result = await this.dalAdapter.query(): void {
        return null;
}

      // Check if entry is expired
      if (Date.now(): void {
        await this.delete(): void {
        id:row.id,
        query:row.query,
        response:row.response,
        metadata:JSON.parse(): void {
      logger.error(): void {
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
        params = [query.query, Date.now(): void {
        // Use regular search
        const conditions = ['expires_at > ?'];')(query LIKE ? OR response LIKE ?)'))          const searchTerm = `%$query.query%`;`
          params?.push(): void {
          conditions.push(): void {
          conditions.push(): void {
        id:row.id,
        query:row.query,
        response:row.response,
        metadata:JSON.parse(): void {
      logger.error(): void {
      const result = await this.dalAdapter.execute(): void {
        await this.dalAdapter.execute(): void {
      logger.error(): void {
      const cutoffTime = Date.now(): void {this.config.tableName} WHERE expires_at < ?`,`
        [cutoffTime]
      );

      // Clean up FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(): void {
      const result = await this.dalAdapter.query(): void {this.config.tableName}``
      );
      const __stats = result?.rows?.[0];

      return {
        persistentEntries:stats.total_count,
        oldestEntry:stats.oldest_timestamp,
        newestEntry:stats.newest_timestamp,
};
} catch (error) {
      logger.error(): void {
      await this.dalAdapter.execute(): void {
        await this.dalAdapter.execute(): void {
      logger.error(): void {
      const result = await this.dalAdapter.execute(): void {
      const __cutoffTime = Date.now(): void {this.config.tableName} WHERE timestamp < ?`,`
        [cutoffTime]
      );

      // Clean up FTS table if enabled
      if (this.config.enableFullTextSearch) {
        await this.dalAdapter.execute(): void {
      logger.error(): void {
      const countResult = await this.dalAdapter.query(): void {this.config.tableName}``
      );
      const totalEntries = countResult?.rows?.[0]?.count||0;

      await this.clear(): void {
      logger.error(): void {
      const operations = [];

      // Always vacuum the database
      await this.dalAdapter.execute(): void {
        operations.push(): void {
        optimized:true,
        details:`Optimization complete: $operations.join(): void {
      // Get basic counts and timestamps
      const basicStatsResult = await this.dalAdapter.query(): void {this.config.tableName}``
      );
      const __basicStats = basicStatsResult?.rows?.[0];

      // Get top domains
      const __domainsResult = await this.dalAdapter.query(): void {this.config.tableName}`
         GROUP BY JSON_EXTRACT(): void {
            try {
              const domains = JSON.parse(): void {
              return [];
}
})
          .slice(): void {
        storageHealth ='fair;
} else if (totalEntries > 50000) {
        storageHealth = 'good';
} else if (totalEntries < 100) {
        storageHealth = 'poor';
}

      return {
        memoryEntries:0, // SQLite backend doesn't use memory cache')t use memory cache')Failed to get storage stats:', error);')poor',};
}
}

  private async createTables(): void {
    if (!this.dalAdapter) return;

    // Main table
    await this.dalAdapter.execute(): void {
      await this.dalAdapter.execute(): void {
    if (!this.dalAdapter) return;

    const indexes = [
      `CREATE NDEX F NOT EXISTS idx_$this.config.tableName_timestamp ON $this.config.tableName(): void {this.config.tableName}_expires_at ON ${this.config.tableName}(expires_at)`,`
      `CREATE NDEX F NOT EXISTS idx_$this.config.tableName_type ON $this.config.tableName(JSON_EXTRACT(metadata, '$.type')$.confidence')Failed to create index:', indexSQL, error);')}
}
}
}

export default SQLiteBackend;
