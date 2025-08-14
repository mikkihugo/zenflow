import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('knowledge-storage-backends-sqlite-backend');
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseProviderFactory } from '../../database/providers/database-providers.ts';
export class SQLiteBackend {
    config;
    dalAdapter;
    dalFactory;
    isInitialized = false;
    constructor(config = {}, dalFactory) {
        this.config = {
            dbPath: path.join(process.cwd(), '.claude', 'fact-storage.db'),
            tableName: 'fact_knowledge',
            enableWAL: true,
            enableFullTextSearch: true,
            enablePerformanceIndexes: true,
            ...config,
        };
        this.dalFactory =
            dalFactory ||
                new DatabaseProviderFactory(console, {});
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        const dbDir = path.dirname(this.config.dbPath);
        if (!existsSync(dbDir)) {
            mkdirSync(dbDir, { recursive: true });
        }
        const dalConfig = {
            type: 'sqlite',
            database: this.config.dbPath,
            options: {
                readonly: false,
                fileMustExist: false,
                timeout: 5000,
                wal: this.config.enableWAL,
            },
        };
        this.dalAdapter = this.dalFactory.createAdapter(dalConfig);
        await this.dalAdapter.connect();
        await this.createTables();
        if (this.config.enablePerformanceIndexes) {
            await this.createIndexes();
        }
        this.isInitialized = true;
    }
    async store(entry) {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            await this.dalAdapter.execute(`INSERT OR REPLACE INTO ${this.config.tableName}
         (id, query, response, metadata, timestamp, ttl, access_count, last_accessed, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                entry.id,
                entry.query,
                entry.response,
                JSON.stringify(entry.metadata),
                entry.timestamp,
                entry.ttl,
                entry.accessCount,
                entry.lastAccessed,
                entry.timestamp + entry.ttl,
            ]);
            if (this.config.enableFullTextSearch) {
                await this.dalAdapter.execute(`INSERT OR REPLACE INTO ${this.config.tableName}_fts (id, query, response, domains, type)
           VALUES (?, ?, ?, ?, ?)`, [
                    entry.id,
                    entry.query,
                    entry.response,
                    entry.metadata.domains?.join(' ') || '',
                    entry.metadata.type,
                ]);
            }
        }
        catch (error) {
            logger.error('Failed to store FACT entry:', error);
            throw error;
        }
    }
    async get(id) {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const result = await this.dalAdapter.query(`SELECT * FROM ${this.config.tableName} WHERE id = ?`, [id]);
            const row = result?.rows?.[0];
            if (!row) {
                return null;
            }
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
        }
        catch (error) {
            logger.error('Failed to get FACT entry:', error);
            return null;
        }
    }
    async search(query) {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            let sql = '';
            let params = {};
            if (query.query && this.config.enableFullTextSearch) {
                sql = `
          SELECT f.* FROM ${this.config.tableName} f
          JOIN ${this.config.tableName}_fts fts ON f.id = fts.id
          WHERE fts.${this.config.tableName}_fts MATCH ?
          AND f.expires_at > ?
        `;
                params = [query.query, Date.now()];
            }
            else {
                const conditions = ['expires_at > ?'];
                params = [Date.now()];
                if (query.query) {
                    conditions.push('(query LIKE ? OR response LIKE ?)');
                    const searchTerm = `%${query.query}%`;
                    params?.push(searchTerm, searchTerm);
                }
                if (query.type) {
                    conditions.push(`JSON_EXTRACT(metadata, '$.type') = ?`);
                    params?.push(query.type);
                }
                if (query.domains && query.domains.length > 0) {
                    const domainConditions = query.domains
                        .map(() => `EXISTS (SELECT 1 FROM JSON_EACH(JSON_EXTRACT(metadata, '$.domains')) WHERE value = ?)`)
                        .join(' OR ');
                    conditions.push(`(${domainConditions})`);
                    params?.push(...query.domains);
                }
                if (query.minConfidence !== undefined) {
                    conditions.push(`JSON_EXTRACT(metadata, '$.confidence') >= ?`);
                    params?.push(query.minConfidence);
                }
                if (query.maxAge !== undefined) {
                    conditions.push(`timestamp >= ?`);
                    params?.push(Date.now() - query.maxAge);
                }
                sql = `
          SELECT * FROM ${this.config.tableName}
          WHERE ${conditions.join(' AND ')}
          ORDER BY timestamp DESC, access_count DESC
          LIMIT ?
        `;
                params?.push(query.limit || 50);
            }
            const result = await this.dalAdapter.query(sql, params);
            const rows = result?.rows;
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
        }
        catch (error) {
            logger.error('Failed to search FACT entries:', error);
            return [];
        }
    }
    async delete(id) {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const result = await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName} WHERE id = ?`, [id]);
            if (this.config.enableFullTextSearch) {
                await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}_fts WHERE id = ?`, [id]);
            }
            return (result?.rowsAffected || 0) > 0;
        }
        catch (error) {
            logger.error('Failed to delete FACT entry:', error);
            return false;
        }
    }
    async cleanup(maxAge) {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const cutoffTime = Date.now() - maxAge;
            const result = await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName} WHERE expires_at < ?`, [cutoffTime]);
            if (this.config.enableFullTextSearch) {
                await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}_fts 
           WHERE id NOT IN (SELECT id FROM ${this.config.tableName})`);
            }
            return result?.rowsAffected || 0;
        }
        catch (error) {
            logger.error('Failed to cleanup FACT entries:', error);
            return 0;
        }
    }
    async getStats() {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const result = await this.dalAdapter.query(`SELECT 
         COUNT(*) as total_count,
         MIN(timestamp) as oldest_timestamp,
         MAX(timestamp) as newest_timestamp
         FROM ${this.config.tableName}`);
            const stats = result?.rows?.[0];
            return {
                persistentEntries: stats.total_count,
                oldestEntry: stats.oldest_timestamp,
                newestEntry: stats.newest_timestamp,
            };
        }
        catch (error) {
            logger.error('Failed to get FACT storage stats:', error);
            return {};
        }
    }
    async clear() {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}`);
            if (this.config.enableFullTextSearch) {
                await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}_fts`);
            }
            await this.dalAdapter.execute(`DELETE FROM sqlite_sequence WHERE name = ?`, [this.config.tableName]);
        }
        catch (error) {
            logger.error('Failed to clear FACT storage:', error);
            throw error;
        }
    }
    async shutdown() {
        if (this.dalAdapter) {
            await this.dalAdapter.disconnect();
            this.dalAdapter = undefined;
        }
        this.isInitialized = false;
    }
    async clearByQuality(minQuality) {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const result = await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName} WHERE JSON_EXTRACT(metadata, '$.confidence') < ?`, [minQuality]);
            if (this.config.enableFullTextSearch) {
                await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}_fts 
           WHERE id NOT IN (SELECT id FROM ${this.config.tableName})`);
            }
            return result?.rowsAffected || 0;
        }
        catch (error) {
            logger.error('Failed to clear entries by quality:', error);
            return 0;
        }
    }
    async clearByAge(maxAgeMs) {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const cutoffTime = Date.now() - maxAgeMs;
            const result = await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName} WHERE timestamp < ?`, [cutoffTime]);
            if (this.config.enableFullTextSearch) {
                await this.dalAdapter.execute(`DELETE FROM ${this.config.tableName}_fts 
           WHERE id NOT IN (SELECT id FROM ${this.config.tableName})`);
            }
            return result?.rowsAffected || 0;
        }
        catch (error) {
            logger.error('Failed to clear entries by age:', error);
            return 0;
        }
    }
    async clearMemoryCache() {
        return 0;
    }
    async clearAll() {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const countResult = await this.dalAdapter.query(`SELECT COUNT(*) as count FROM ${this.config.tableName}`);
            const totalEntries = countResult?.rows?.[0]?.count || 0;
            await this.clear();
            return totalEntries;
        }
        catch (error) {
            logger.error('Failed to clear all entries:', error);
            return 0;
        }
    }
    async optimize(strategy = 'balanced') {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const operations = [];
            await this.dalAdapter.execute('VACUUM');
            operations.push('VACUUM completed');
            if (strategy === 'aggressive' || strategy === 'balanced') {
                await this.dalAdapter.execute('REINDEX');
                operations.push('REINDEX completed');
            }
            if (strategy === 'aggressive') {
                await this.dalAdapter.execute('ANALYZE');
                operations.push('ANALYZE completed');
            }
            const cleaned = await this.cleanup(0);
            if (cleaned > 0) {
                operations.push(`Cleaned ${cleaned} expired entries`);
            }
            return {
                optimized: true,
                details: `Optimization complete: ${operations.join(', ')}`,
            };
        }
        catch (error) {
            logger.error('Failed to optimize storage:', error);
            return {
                optimized: false,
                details: `Optimization failed: ${error.message}`,
            };
        }
    }
    async getStorageStats() {
        if (!this.dalAdapter) {
            throw new Error('SQLite backend not initialized');
        }
        try {
            const basicStatsResult = await this.dalAdapter.query(`SELECT 
         COUNT(*) as total_count,
         MIN(timestamp) as oldest_timestamp,
         MAX(timestamp) as newest_timestamp,
         AVG(access_count) as avg_access_count
         FROM ${this.config.tableName}`);
            const basicStats = basicStatsResult?.rows?.[0];
            const domainsResult = await this.dalAdapter.query(`SELECT JSON_EXTRACT(metadata, '$.domains') as domains, COUNT(*) as count
         FROM ${this.config.tableName}
         GROUP BY JSON_EXTRACT(metadata, '$.domains')
         ORDER BY count DESC
         LIMIT 10`);
            const topDomains = domainsResult?.rows
                ?.flatMap((row) => {
                try {
                    const domains = JSON.parse(row.domains || '[]');
                    return Array.isArray(domains) ? domains : [];
                }
                catch {
                    return [];
                }
            })
                .slice(0, 10) || [];
            let storageHealth = 'excellent';
            const totalEntries = basicStats?.total_count || 0;
            const avgAccessCount = basicStats?.avg_access_count || 0;
            if (totalEntries > 10000 && avgAccessCount < 2) {
                storageHealth = 'fair';
            }
            else if (totalEntries > 50000) {
                storageHealth = 'good';
            }
            else if (totalEntries < 100) {
                storageHealth = 'poor';
            }
            return {
                memoryEntries: 0,
                persistentEntries: totalEntries,
                totalMemorySize: 0,
                cacheHitRate: 0,
                oldestEntry: basicStats?.oldest_timestamp || 0,
                newestEntry: basicStats?.newest_timestamp || 0,
                topDomains,
                storageHealth,
            };
        }
        catch (error) {
            logger.error('Failed to get storage stats:', error);
            return {
                memoryEntries: 0,
                persistentEntries: 0,
                totalMemorySize: 0,
                cacheHitRate: 0,
                oldestEntry: 0,
                newestEntry: 0,
                topDomains: [],
                storageHealth: 'poor',
            };
        }
    }
    async createTables() {
        if (!this.dalAdapter)
            return;
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
    async createIndexes() {
        if (!this.dalAdapter)
            return;
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
            }
            catch (error) {
                logger.warn('Failed to create index:', indexSQL, error);
            }
        }
    }
}
export default SQLiteBackend;
//# sourceMappingURL=sqlite-backend.js.map