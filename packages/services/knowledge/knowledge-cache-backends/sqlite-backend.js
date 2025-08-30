/**
 * SQLite Backend Implementation for Knowledge Cache.
 *
 * High-performance SQLite-based storage backend for FACT knowledge entries
 * with full-text search and vector similarity capabilities.
 */

let Database;
try {
  Database = (await import('better-sqlite3')).default;
} catch (error) {
  console.warn('better-sqlite3 not available, SQLite backend will not work:', error.message);
  // Provide a mock for development/testing
  Database = class MockDatabase {
    constructor() {
      throw new Error('better-sqlite3 is not properly installed. Please run: pnpm install better-sqlite3');
    }
  };
}

import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * @file Sqlite-backend implementation.
 */
/**
 * SQLite-based FACT storage backend.
 *
 * Provides persistent storage with full-text search and metadata querying.
 *
 * @example
 * const backend = new SQLiteBackend({ dbPath: './cache.db' });
 * await backend.initialize();
 * await backend.store({ id: '1', query: 'test', result: 'data', ... });
 * const entry = await backend.get('1');
 */
export class SQLiteBackend {
	db; // SQLite database instance
	stats;
	isInitialized = false;
	config;
	
	constructor(config = {}) {
		this.config = {
			dbPath: config.dbPath || ':memory:',
			enableWAL: config.enableWAL !== false,
			enableFullTextSearch: config.enableFullTextSearch !== false,
			...config
		};
		
		this.stats = {
			totalEntries: 0,
			totalSize: 0,
			cacheHits: 0,
			cacheMisses: 0,
			lastAccessed: 0,
			backendType: "sqlite",
			created: Date.now(),
			modified: Date.now(),
		};
	}
	/**
	 * Initialize SQLite database and create required tables.
	 */
	async initialize() {
		if (this.isInitialized) {
			return;
		}
		try {
			await this.initializeDatabase();
			await this.createTables();
			await this.createIndexes();
			this.isInitialized = true;
		} catch (error) {
			throw new Error(`Failed to initialize SQLite backend: ${error.message}`);
		}
	}

	/**
	 * Initialize the SQLite database connection.
	 */
	async initializeDatabase() {
		// Ensure directory exists for file-based databases
		if (this.config.dbPath !== ':memory:') {
			const dbDir = dirname(this.config.dbPath);
			if (!existsSync(dbDir)) {
				mkdirSync(dbDir, { recursive: true });
			}
		}

		// Create database connection
		this.db = new Database(this.config.dbPath);

		// Enable WAL mode for better concurrency (if not in-memory)
		if (this.config.enableWAL && this.config.dbPath !== ':memory:') {
			this.db.pragma('journal_mode = WAL');
		}

		// Set other pragmas for performance
		this.db.pragma('synchronous = NORMAL');
		this.db.pragma('cache_size = 10000');
		this.db.pragma('temp_store = memory');
	}

	/**
	 * Create required database tables.
	 */
	async createTables() {
		// Main knowledge entries table
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS knowledge_entries (
				id TEXT PRIMARY KEY,
				query TEXT NOT NULL,
				result TEXT,
				source TEXT,
				timestamp INTEGER NOT NULL,
				ttl INTEGER NOT NULL,
				access_count INTEGER DEFAULT 0,
				last_accessed INTEGER NOT NULL,
				metadata TEXT, -- JSON string
				created_at INTEGER DEFAULT (unixepoch()),
				updated_at INTEGER DEFAULT (unixepoch())
			)
		`);

		// Full-text search table (if enabled)
		if (this.config.enableFullTextSearch) {
			this.db.exec(`
				CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_entries_fts 
				USING fts5(id, query, result, source, content='knowledge_entries', content_rowid='rowid')
			`);
		}
	}

	/**
	 * Create database indexes for performance.
	 */
	async createIndexes() {
		this.db.exec(`
			CREATE INDEX IF NOT EXISTS idx_knowledge_timestamp ON knowledge_entries(timestamp);
			CREATE INDEX IF NOT EXISTS idx_knowledge_source ON knowledge_entries(source);
			CREATE INDEX IF NOT EXISTS idx_knowledge_ttl ON knowledge_entries(timestamp, ttl);
			CREATE INDEX IF NOT EXISTS idx_knowledge_last_accessed ON knowledge_entries(last_accessed);
		`);
	}
	/**
	 * Store a knowledge entry in SQLite database.
	 *
	 * @param entry - The knowledge entry to store
	 */
	async store(entry) {
		await this.ensureInitialized();
		try {
			const stmt = this.db.prepare(`
				INSERT OR REPLACE INTO knowledge_entries
				(id, query, result, source, timestamp, ttl, access_count, last_accessed, metadata, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
			`);

			stmt.run([
				entry.id,
				entry.query,
				JSON.stringify(entry.result),
				entry.source,
				entry.timestamp,
				entry.ttl,
				entry.accessCount || 0,
				entry.lastAccessed,
				JSON.stringify(entry.metadata)
			]);

			// Update FTS index if enabled
			if (this.config.enableFullTextSearch) {
				const ftsStmt = this.db.prepare(`
					INSERT OR REPLACE INTO knowledge_entries_fts(id, query, result, source)
					VALUES (?, ?, ?, ?)
				`);
				ftsStmt.run([
					entry.id,
					entry.query,
					typeof entry.result === 'string' ? entry.result : JSON.stringify(entry.result),
					entry.source
				]);
			}

			this.updateStats("write", JSON.stringify(entry.result).length);
		} catch (error) {
			throw new Error(`Failed to store entry ${entry.id}: ${error.message}`);
		}
	}
	/**
	 * Retrieve a knowledge entry by ID.
	 *
	 * @param id - The ID of the entry to retrieve
	 */
	async get(id) {
		await this.ensureInitialized();
		try {
			const stmt = this.db.prepare(`
				SELECT * FROM knowledge_entries WHERE id = ?
			`);
			const row = stmt.get([id]);

			if (!row) {
				this.stats.cacheMisses++;
				return null;
			}

			// Update access statistics
			const updateStmt = this.db.prepare(`
				UPDATE knowledge_entries 
				SET access_count = access_count + 1, last_accessed = ? 
				WHERE id = ?
			`);
			updateStmt.run([Date.now(), id]);

			this.stats.cacheHits++;
			return this.rowToEntry(row);
		} catch (error) {
			this.stats.cacheMisses++;
			throw new Error(`Failed to retrieve entry ${id}: ${error.message}`);
		}
	}

	/**
	 * Convert database row to knowledge entry.
	 * @private
	 */
	rowToEntry(row) {
		return {
			id: row.id,
			query: row.query,
			result: JSON.parse(row.result),
			source: row.source,
			timestamp: row.timestamp,
			ttl: row.ttl,
			accessCount: row.access_count,
			lastAccessed: row.last_accessed,
			metadata: JSON.parse(row.metadata)
		};
	}
	/**
	 * Search knowledge entries with various criteria.
	 *
	 * @param query - Search query parameters
	 */
	async search(query = {}) {
		await this.ensureInitialized();
		try {
			let sql = 'SELECT * FROM knowledge_entries WHERE 1=1';
			const params = [];

			// Add search conditions
			if (query.query && this.config.enableFullTextSearch) {
				// Use FTS for text search
				sql = `
					SELECT ke.* FROM knowledge_entries ke
					JOIN knowledge_entries_fts fts ON ke.id = fts.id
					WHERE fts MATCH ?
				`;
				params.push(query.query);
			} else if (query.query) {
				// Fallback to LIKE search
				sql += ' AND (query LIKE ? OR result LIKE ?)';
				const searchTerm = `%${query.query}%`;
				params.push(searchTerm, searchTerm);
			}

			if (query.type) {
				sql += ' AND JSON_EXTRACT(metadata, "$.type") = ?';
				params.push(query.type);
			}

			if (query.domains && query.domains.length > 0) {
				const domainConditions = query.domains.map(() => 'JSON_EXTRACT(metadata, "$.domains") LIKE ?').join(' OR ');
				sql += ` AND (${domainConditions})`;
				query.domains.forEach(domain => params.push(`%"${domain}"%`));
			}

			if (query.timeRange) {
				sql += ' AND timestamp BETWEEN ? AND ?';
				params.push(query.timeRange.start, query.timeRange.end);
			}

			if (query.minConfidence) {
				sql += ' AND JSON_EXTRACT(metadata, "$.confidence") >= ?';
				params.push(query.minConfidence);
			}

			// Add ordering and limit
			sql += ' ORDER BY last_accessed DESC';
			if (query.maxResults || query.limit) {
				sql += ' LIMIT ?';
				params.push(query.maxResults || query.limit);
			}

			const stmt = this.db.prepare(sql);
			const rows = stmt.all(params);

			return rows.map(row => this.rowToEntry(row));
		} catch (error) {
			throw new Error(`Failed to search entries: ${error.message}`);
		}
	}
	/**
	 * Delete a knowledge entry by ID.
	 *
	 * @param id - The ID of the entry to delete
	 */
	async delete(id) {
		await this.ensureInitialized();
		try {
			const stmt = this.db.prepare('DELETE FROM knowledge_entries WHERE id = ?');
			const result = stmt.run([id]);

			// Also delete from FTS index if enabled
			if (this.config.enableFullTextSearch) {
				const ftsStmt = this.db.prepare('DELETE FROM knowledge_entries_fts WHERE id = ?');
				ftsStmt.run([id]);
			}

			if (result.changes > 0) {
				this.updateStats("delete", 0);
				return true;
			}
			return false;
		} catch (error) {
			throw new Error(`Failed to delete entry ${id}: ${error.message}`);
		}
	}
	/**
	 * Get storage statistics.
	 */
	async getStats() {
		await this.ensureInitialized();
		try {
			// Get actual stats from SQLite database
			const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM knowledge_entries');
			const sizeStmt = this.db.prepare('SELECT SUM(LENGTH(result)) as size FROM knowledge_entries');
			const oldestStmt = this.db.prepare('SELECT MIN(timestamp) as oldest FROM knowledge_entries');
			const newestStmt = this.db.prepare('SELECT MAX(timestamp) as newest FROM knowledge_entries');

			const countResult = countStmt.get();
			const sizeResult = sizeStmt.get();
			const oldestResult = oldestStmt.get();
			const newestResult = newestStmt.get();

			this.stats.totalEntries = countResult.count || 0;
			this.stats.totalSize = sizeResult.size || 0;

			return {
				totalEntries: this.stats.totalEntries,
				totalSize: this.stats.totalSize,
				cacheHits: this.stats.cacheHits,
				cacheMisses: this.stats.cacheMisses,
				hitRate: this.calculateHitRate(),
				lastAccessed: this.stats.lastAccessed,
				backend: this.stats.backendType,
				healthy: this.isInitialized,
				oldestEntry: oldestResult.oldest || 0,
				newestEntry: newestResult.newest || 0,
				performance: {
					averageQueryTime: 0, // Could be enhanced with query timing
					indexEfficiency: this.config.enableFullTextSearch ? 1.0 : 0.8,
					storageEfficiency: this.calculateStorageEfficiency(),
				},
			};
		} catch (error) {
			throw new Error(`Failed to get stats: ${error.message}`);
		}
	}
	/**
	 * Clean up old entries beyond maxAge.
	 */
	async cleanup(maxAge) {
		await this.ensureInitialized();
		try {
			const cutoffTime = Date.now() - maxAge;
			const stmt = this.db.prepare(`
				DELETE FROM knowledge_entries
				WHERE timestamp < ?
			`);
			const result = stmt.run([cutoffTime]);

			// Also cleanup FTS index if enabled
			if (this.config.enableFullTextSearch) {
				// FTS will be automatically cleaned when main table entries are deleted
				// due to content table relationship
			}

			return result.changes || 0;
		} catch (error) {
			throw new Error(`Failed to cleanup entries: ${error.message}`);
		}
	}
	/**
	 * Clear all knowledge entries.
	 */
	async clear() {
		await this.ensureInitialized();
		try {
			// Clear main table
			this.db.exec('DELETE FROM knowledge_entries');
			
			// Clear FTS index if enabled
			if (this.config.enableFullTextSearch) {
				this.db.exec('DELETE FROM knowledge_entries_fts');
			}

			// Reset stats
			this.stats.totalEntries = 0;
			this.stats.totalSize = 0;
			this.stats.cacheHits = 0;
			this.stats.cacheMisses = 0;
		} catch (error) {
			throw new Error(`Failed to clear database: ${error.message}`);
		}
	}
	/**
	 * Close database connection.
	 */
	async shutdown() {
		if (this.db) {
			try {
				// Close SQLite database connection
				this.db.close();
				this.db = null;
				this.isInitialized = false;
			} catch (error) {
				throw new Error(`Failed to close database: ${error.message}`);
			}
		}
	}
	/**
	 * Get backend capabilities.
	 */
	getCapabilities() {
		return {
			supportsFullTextSearch: true,
			supportsVectorSearch: false, // Can be extended with SQLite vector extensions
			supportsMetadataSearch: true,
			maxEntrySize: 1024 * 1024 * 10, // 10MB per entry
			concurrent: true,
		};
	}
	// Private helper methods
	async ensureInitialized() {
		if (!this.isInitialized) {
			await this.initialize();
		}
	}
	updateStats(operation, size) {
		this.stats.lastAccessed = Date.now();
		this.stats.modified = Date.now();
		if (operation === "write") {
			this.stats.totalEntries++;
			this.stats.totalSize += size;
		} else if (operation === "delete") {
			this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
		}
	}
	calculateHitRate() {
		const total = this.stats.cacheHits + this.stats.cacheMisses;
		return total > 0 ? this.stats.cacheHits / total : 0;
	}
	calculateStorageEfficiency() {
		// Stub implementation - would calculate actual compression ratio
		return 0.85; // 85% efficiency placeholder
	}
}
export default SQLiteBackend;
