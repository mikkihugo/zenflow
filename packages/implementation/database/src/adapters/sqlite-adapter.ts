/**
 * SQLite Database Adapter
 *
 * Real implementation with connection pooling, retry logic, health monitoring,
 * and comprehensive error handling for enterprise applications.
 */

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { getLogger } from "../logger.js";
import {
	type ColumnSchema,
	ConnectionError,
	type ConnectionStats,
	type DatabaseConfig,
	type DatabaseConnection,
	DatabaseError,
	type HealthStatus,
	type IndexSchema,
	IsolationLevel,
	type Migration,
	type MigrationResult,
	QueryError,
	type QueryParams,
	type QueryResult,
	type SchemaInfo,
	type TableSchema,
	type TransactionConnection,
	type TransactionContext,
	TransactionError,
} from "../types/index.js";

const logger = getLogger("sqlite-adapter");

interface PooledConnection {
	db: Database.Database;
	id: string;
	createdAt: Date;
	lastUsedAt: Date;
	inUse: boolean;
	queryCount: number;
	transactionCount: number;
}

export class SQLiteAdapter implements DatabaseConnection {
	private readonly config: DatabaseConfig;
	private readonly pool: PooledConnection[] = [];
	private connected = false;
	private readonly stats = {
		totalQueries: 0,
		totalTransactions: 0,
		totalErrors: 0,
		averageQueryTimeMs: 0,
		connectionCreated: 0,
		connectionDestroyed: 0,
	};

	constructor(config: DatabaseConfig) {
		this.config = {
			...config,
			pool: {
				min: 1,
				max: 10,
				acquireTimeoutMillis: 10000,
				idleTimeoutMillis: 300000, // 5 minutes
				reapIntervalMillis: 1000,
				createTimeoutMillis: 3000,
				destroyTimeoutMillis: 5000,
				createRetryIntervalMillis: 200,
				propagateCreateError: true,
				...config.pool,
			},
			retryPolicy: {
				maxRetries: 3,
				initialDelayMs: 100,
				maxDelayMs: 5000,
				backoffFactor: 2,
				retryableErrors: ["SQLITE_BUSY", "SQLITE_LOCKED"],
				...config.retryPolicy,
			},
		};

		// Start connection pool maintenance
		this.startPoolMaintenance();
	}

	async connect(): Promise<void> {
		if (this.connected) return;

		const correlationId = this.generateCorrelationId();
		logger.info("Connecting to SQLite database", {
			correlationId,
			database: this.config.database,
		});

		try {
			// Ensure database directory exists
			this.ensureDatabaseDirectory();

			// Create minimum connections
			for (let i = 0; i < (this.config.pool?.min ?? 1); i++) {
				await this.createConnection();
			}

			this.connected = true;
			logger.info("Successfully connected to SQLite database", {
				correlationId,
				poolSize: this.pool.length,
			});
		} catch (error) {
			logger.error("Failed to connect to SQLite database", {
				correlationId,
				error: error instanceof Error ? error.message : String(error),
			});
			throw new ConnectionError(
				`Failed to connect to SQLite database: ${error instanceof Error ? error.message : String(error)}`,
				correlationId,
				error instanceof Error ? error : undefined,
			);
		}
	}

	async disconnect(): Promise<void> {
		if (!this.connected) return;

		const correlationId = this.generateCorrelationId();
		logger.info("Disconnecting from SQLite database", { correlationId });

		try {
			// Close all pooled connections
			const disconnectPromises = this.pool.map((conn) =>
				this.destroyConnection(conn),
			);
			await Promise.allSettled(disconnectPromises);

			this.pool.length = 0;
			this.connected = false;

			logger.info("Successfully disconnected from SQLite database", {
				correlationId,
			});
		} catch (error) {
			logger.error("Error during SQLite disconnect", {
				correlationId,
				error: error instanceof Error ? error.message : String(error),
			});
			throw new ConnectionError(
				`Failed to disconnect from SQLite: ${error instanceof Error ? error.message : String(error)}`,
				correlationId,
				error instanceof Error ? error : undefined,
			);
		}
	}

	isConnected(): boolean {
		return this.connected && this.pool.length > 0;
	}

	async query<T = unknown>(
		sql: string,
		params?: QueryParams,
		options?: { correlationId?: string; timeoutMs?: number },
	): Promise<QueryResult<T>> {
		const correlationId =
			options?.correlationId || this.generateCorrelationId();
		const startTime = Date.now();

		if (!this.connected) {
			await this.connect();
		}

		const connection = await this.acquireConnection(correlationId);

		try {
			const result = await this.executeWithRetry(
				async () =>
					await this.executeStatementWithRetry<T>(
						connection,
						sql,
						params,
						startTime,
					),
				correlationId,
				sql,
				params,
			);

			this.stats.totalQueries++;
			this.updateAverageQueryTime(Date.now() - startTime);

			logger.debug("Query executed successfully", {
				correlationId,
				executionTimeMs: result.executionTimeMs,
				rowCount: result.rowCount,
			});

			return result;
		} catch (error) {
			this.stats.totalErrors++;
			logger.error("Query execution failed", {
				correlationId,
				sql: sql.substring(0, 200),
				error: error instanceof Error ? error.message : String(error),
			});

			if (error instanceof DatabaseError) {
				throw error;
			}

			throw new QueryError(
				`Query execution failed: ${error instanceof Error ? error.message : String(error)}`,
				{
					query: sql,
					params,
					correlationId,
					cause: error instanceof Error ? error : undefined,
				},
			);
		} finally {
			this.releaseConnection(connection);
		}
	}

	async execute(
		sql: string,
		params?: QueryParams,
		options?: { correlationId?: string; timeoutMs?: number },
	): Promise<QueryResult> {
		return await this.query(sql, params, options);
	}

	async transaction<T>(
		fn: (tx: TransactionConnection) => Promise<T>,
		context?: TransactionContext,
	): Promise<T> {
		const correlationId =
			context?.correlationId || this.generateCorrelationId();

		if (!this.connected) {
			await this.connect();
		}

		const connection = await this.acquireConnection(correlationId);

		try {
			const txConnection = new SQLiteTransactionConnection(
				connection.db,
				correlationId,
			);

			// Set isolation level if specified
			if (context?.isolationLevel) {
				await this.setIsolationLevel(connection.db, context.isolationLevel);
			}

			// Set read-only mode if specified
			if (context?.readOnly) {
				connection.db.exec("BEGIN DEFERRED");
			} else {
				connection.db.exec("BEGIN IMMEDIATE");
			}

			let result: T;
			try {
				result = await fn(txConnection);
				connection.db.exec("COMMIT");

				this.stats.totalTransactions++;
				logger.debug("Transaction committed successfully", { correlationId });
			} catch (error) {
				connection.db.exec("ROLLBACK");
				logger.error("Transaction rolled back", {
					correlationId,
					error: error instanceof Error ? error.message : String(error),
				});
				throw error;
			}

			return result;
		} catch (error) {
			this.stats.totalErrors++;

			if (error instanceof DatabaseError) {
				throw error;
			}

			throw new TransactionError(
				`Transaction failed: ${error instanceof Error ? error.message : String(error)}`,
				correlationId,
				error instanceof Error ? error : undefined,
			);
		} finally {
			this.releaseConnection(connection);
		}
	}

	async health(): Promise<HealthStatus> {
		const startTime = Date.now();

		try {
			if (!this.connected) {
				return {
					healthy: false,
					status: "unhealthy",
					score: 0,
					timestamp: new Date(),
					details: { connected: false, reason: "Not connected" },
				};
			}

			// Test query to verify database health
			await this.query("SELECT 1 as health_check");

			const responseTime = Date.now() - startTime;
			const poolStats = this.getPoolStats();

			// Calculate health score based on various factors
			let score = 100;

			// Penalize high response time
			if (responseTime > 1000) score -= 30;
			else if (responseTime > 500) score -= 15;
			else if (responseTime > 100) score -= 5;

			// Penalize high pool utilization
			const utilization = poolStats.active / poolStats.total;
			if (utilization > 0.9) score -= 20;
			else if (utilization > 0.7) score -= 10;

			// Penalize high error rate
			const errorRate =
				this.stats.totalErrors / Math.max(this.stats.totalQueries, 1);
			if (errorRate > 0.1) score -= 30;
			else if (errorRate > 0.05) score -= 15;

			score = Math.max(0, score);

			return {
				healthy: score >= 70,
				status:
					score >= 70 ? "healthy" : score >= 40 ? "degraded" : "unhealthy",
				score,
				timestamp: new Date(),
				responseTimeMs: responseTime,
				connectionPool: poolStats,
				metrics: {
					queriesPerSecond:
						this.stats.totalQueries /
						Math.max((Date.now() - this.stats.connectionCreated) / 1000, 1),
					avgResponseTimeMs: this.stats.averageQueryTimeMs,
					errorRate,
				},
				details: {
					connected: true,
					database: this.config.database,
					poolSize: this.pool.length,
					totalQueries: this.stats.totalQueries,
					totalTransactions: this.stats.totalTransactions,
					totalErrors: this.stats.totalErrors,
				},
			};
		} catch (error) {
			return {
				healthy: false,
				status: "unhealthy",
				score: 0,
				timestamp: new Date(),
				responseTimeMs: Date.now() - startTime,
				lastError: error instanceof Error ? error.message : String(error),
				details: {
					connected: this.connected,
					error: error instanceof Error ? error.message : String(error),
				},
			};
		}
	}

	async getStats(): Promise<ConnectionStats> {
		const poolStats = await new Promise<{
			total: number;
			active: number;
			idle: number;
			waiting: number;
		}>((resolve) => {
			resolve(this.getPoolStats());
		});

		return {
			total: poolStats.total,
			active: poolStats.active,
			idle: poolStats.idle,
			waiting: poolStats.waiting,
			created: this.stats.connectionCreated,
			destroyed: this.stats.connectionDestroyed,
			errors: this.stats.totalErrors,
			averageAcquisitionTimeMs: 0, // TODO: Implement acquisition time tracking
			averageIdleTimeMs: this.calculateAverageIdleTime(),
			currentLoad: poolStats.active / poolStats.total,
		};
	}

	async getSchema(): Promise<SchemaInfo> {
		const tables = await this.query<{ name: string }>(
			"SELECT name FROM sqlite_master WHERE type = ?",
			["table"],
		);
		const tableSchemas: TableSchema[] = [];

		for (const table of tables.rows) {
			if (table.name.startsWith("sqlite_")) continue; // Skip system tables

			const schema = await this.getTableSchema(table.name);
			if (schema) {
				tableSchemas.push(schema);
			}
		}

		return {
			tables: tableSchemas,
			version: await this.getDatabaseVersion(),
			lastMigration: await this.getLastMigrationVersion(),
		};
	}

	async migrate(
		migrations: readonly Migration[],
	): Promise<readonly MigrationResult[]> {
		const results: MigrationResult[] = [];
		const currentVersion = await this.getCurrentMigrationVersion();

		// Create migrations table if it doesn't exist
		await this.createMigrationsTable();

		for (const migration of migrations) {
			const startTime = Date.now();

			try {
				// Skip if already applied
				if (currentVersion && migration.version <= currentVersion) {
					results.push({
						version: migration.version,
						applied: false,
						executionTimeMs: 0,
					});
					continue;
				}

				await this.transaction(async () => {
					await migration.up(this);
					await this.recordMigration(migration.version, migration.name);
				});

				results.push({
					version: migration.version,
					applied: true,
					executionTimeMs: Date.now() - startTime,
				});

				logger.info("Migration applied successfully", {
					version: migration.version,
					name: migration.name,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);

				results.push({
					version: migration.version,
					applied: false,
					executionTimeMs: Date.now() - startTime,
					error: errorMessage,
				});

				logger.error("Migration failed", {
					version: migration.version,
					name: migration.name,
					error: errorMessage,
				});

				// Stop on first failure
				break;
			}
		}

		return results;
	}

	async getCurrentMigrationVersion(): Promise<string | null> {
		try {
			const result = await this.query<{ version: string }>(
				"SELECT version FROM _migrations ORDER BY version DESC LIMIT 1",
			);
			return result.rows[0]?.version || null;
		} catch {
			// Migrations table doesn't exist yet
			return null;
		}
	}

	async explain(sql: string, params?: QueryParams): Promise<QueryResult> {
		return await this.query(`EXPLAIN QUERY PLAN ${sql}`, params);
	}

	async vacuum(): Promise<void> {
		await this.query("VACUUM");
	}

	async analyze(): Promise<void> {
		await this.query("ANALYZE");
	}

	// Private methods

	private executeStatementWithRetry<T>(
		connection: PooledConnection,
		sql: string,
		params: QueryParams | undefined,
		startTime: number,
	): Promise<QueryResult<T>> {
		return new Promise<QueryResult<T>>((resolve, reject) => {
			try {
				const stmt = connection.db.prepare(sql);
				const paramArray = this.normalizeParams(params);

				let rows: unknown[];
				if (
					sql.trim().toLowerCase().startsWith("select") ||
					sql.trim().toLowerCase().startsWith("with") ||
					sql.trim().toLowerCase().startsWith("pragma")
				) {
					rows = stmt.all(...paramArray);
				} else {
					const runResult = stmt.run(...paramArray);
					rows = [];
					resolve({
						rows: rows as T[],
						rowCount: 0,
						executionTimeMs: Date.now() - startTime,
						affectedRows: runResult.changes,
						insertId:
							typeof runResult.lastInsertRowid === "bigint"
								? Number(runResult.lastInsertRowid)
								: (runResult.lastInsertRowid as number | undefined),
						fields: [],
					});
					return;
				}

				resolve({
					rows: (rows || []) as T[],
					rowCount: rows ? rows.length : 0,
					executionTimeMs: Date.now() - startTime,
					fields: rows.length > 0 ? Object.keys(rows[0] || {}) : [],
					affectedRows: undefined,
					insertId: undefined,
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	private async createConnection(): Promise<PooledConnection> {
		// Use setImmediate to make this genuinely asynchronous
		return await new Promise<PooledConnection>((resolve, reject) => {
			setImmediate(() => {
				const id = this.generateCorrelationId();

				try {
					const db = new Database(this.config.database, {
						readonly: false,
						fileMustExist: false,
						timeout: this.config.pool?.createTimeoutMillis,
						verbose: (message?: unknown) => {
							logger.debug("SQLite operation", { message, connectionId: id });
						},
					});

					// Configure SQLite for better performance
					db.exec("PRAGMA journal_mode = WAL");
					db.exec("PRAGMA synchronous = NORMAL");
					db.exec("PRAGMA cache_size = 1000");
					db.exec("PRAGMA foreign_keys = ON");
					db.exec("PRAGMA temp_store = MEMORY");

					const connection: PooledConnection = {
						db,
						id,
						createdAt: new Date(),
						lastUsedAt: new Date(),
						inUse: false,
						queryCount: 0,
						transactionCount: 0,
					};

					this.pool.push(connection);
					this.stats.connectionCreated++;

					logger.debug("Created new SQLite connection", { connectionId: id });
					resolve(connection);
				} catch (error) {
					logger.error("Failed to create SQLite connection", {
						connectionId: id,
						error: error instanceof Error ? error.message : String(error),
					});
					reject(error);
				}
			});
		});
	}

	private async destroyConnection(connection: PooledConnection): Promise<void> {
		return await new Promise<void>((resolve) => {
			setImmediate(() => {
				try {
					connection.db.close();
					this.stats.connectionDestroyed++;

					logger.debug("Destroyed SQLite connection", {
						connectionId: connection.id,
					});
					resolve();
				} catch (error) {
					logger.error("Error destroying SQLite connection", {
						connectionId: connection.id,
						error: error instanceof Error ? error.message : String(error),
					});
					resolve(); // Don't reject on connection destruction errors
				}
			});
		});
	}

	private async acquireConnection(
		correlationId: string,
	): Promise<PooledConnection> {
		const timeout = this.config.pool?.acquireTimeoutMillis;
		const startTime = Date.now();

		const timeoutMs = timeout || 30000;
		while (Date.now() - startTime < timeoutMs) {
			// Find available connection
			const available = this.pool.find((conn) => !conn.inUse);

			if (available) {
				available.inUse = true;
				available.lastUsedAt = new Date();
				return available;
			}

			// Create new connection if under limit
			const maxConnections = this.config.pool?.max || 10;
			if (this.pool.length < maxConnections) {
				const newConnection = await this.createConnection();
				newConnection.inUse = true;
				return newConnection;
			}

			// Wait for connection to become available
			await this.sleep(10);
		}

		throw new ConnectionError(
			`Failed to acquire connection within ${timeout}ms`,
			correlationId,
		);
	}

	private releaseConnection(connection: PooledConnection): void {
		connection.inUse = false;
		connection.lastUsedAt = new Date();
	}

	private async executeWithRetry<T>(
		operation: () => Promise<T>,
		correlationId: string,
		sql?: string,
		params?: QueryParams,
	): Promise<T> {
		const retryPolicy = this.config.retryPolicy!;
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				const errorCode = this.extractSQLiteErrorCode(lastError);
				const isRetryable = retryPolicy.retryableErrors.includes(errorCode);

				if (attempt === retryPolicy.maxRetries || !isRetryable) {
					break;
				}

				const delay = Math.min(
					retryPolicy.initialDelayMs * retryPolicy.backoffFactor ** attempt,
					retryPolicy.maxDelayMs,
				);

				logger.warn("Retrying operation after error", {
					correlationId,
					attempt: attempt + 1,
					maxRetries: retryPolicy.maxRetries,
					delayMs: delay,
					error: lastError.message,
				});

				await this.sleep(delay);
			}
		}

		throw new QueryError(
			`Operation failed after ${retryPolicy.maxRetries} retries: ${lastError?.message}`,
			{
				query: sql,
				params,
				correlationId,
				cause: lastError,
			},
		);
	}

	private extractSQLiteErrorCode(error: Error): string {
		if (error.message.includes("SQLITE_BUSY")) return "SQLITE_BUSY";
		if (error.message.includes("SQLITE_LOCKED")) return "SQLITE_LOCKED";
		return "UNKNOWN";
	}

	private normalizeParams(params?: QueryParams): unknown[] {
		if (!params) return [];
		if (Array.isArray(params)) return [...params];
		if (params instanceof Map) return [...params.values()];
		return Object.values(params);
	}

	private getPoolStats() {
		const active = this.pool.filter((conn) => conn.inUse).length;
		const idle = this.pool.filter((conn) => !conn.inUse).length;

		return {
			total: this.pool.length,
			active,
			idle,
			waiting: 0, // SQLite doesn't have a waiting queue concept
		};
	}

	private calculateAverageIdleTime(): number {
		const now = Date.now();
		const idleConnections = this.pool.filter((conn) => !conn.inUse);

		if (idleConnections.length === 0) return 0;

		const totalIdleTime = idleConnections.reduce(
			(sum, conn) => sum + (now - conn.lastUsedAt.getTime()),
			0,
		);

		return totalIdleTime / idleConnections.length;
	}

	private updateAverageQueryTime(executionTime: number): void {
		const { totalQueries, averageQueryTimeMs } = this.stats;
		this.stats.averageQueryTimeMs =
			(averageQueryTimeMs * (totalQueries - 1) + executionTime) / totalQueries;
	}

	private async getTableSchema(tableName: string): Promise<TableSchema | null> {
		try {
			const pragmaResult = await this.query<{
				cid: number;
				name: string;
				type: string;
				notnull: number;
				dflt_value: unknown;
				pk: number;
			}>(`PRAGMA table_info(${tableName})`);

			const columns: ColumnSchema[] = pragmaResult.rows.map((row) => ({
				name: row.name,
				type: row.type,
				nullable: row.notnull === 0,
				defaultValue: row.dflt_value,
			}));

			const primaryKey = columns
				.filter(
					(col) =>
						(pragmaResult.rows.find((row) => row.name === col.name)?.pk || 0) >
						0,
				)
				.map((col) => col.name);

			// Get indexes
			const indexResult = await this.query<{ name: string }>(
				`PRAGMA index_list(${tableName})`,
			);
			const indexes: IndexSchema[] = [];

			for (const idx of indexResult.rows) {
				const indexInfo = await this.query<{ name: string }>(
					`PRAGMA index_info(${idx.name})`,
				);
				indexes.push({
					name: idx.name,
					tableName,
					columns: indexInfo.rows.map((col) => col.name),
					unique: false, // TODO: Get unique info from sqlite_master
					type: "btree",
				});
			}

			return {
				name: tableName,
				columns,
				primaryKey,
				foreignKeys: [], // TODO: Implement foreign key detection
				indexes,
			};
		} catch (error) {
			logger.error("Failed to get table schema", { tableName, error });
			return null;
		}
	}

	private async getDatabaseVersion(): Promise<string> {
		try {
			const result = await this.query<{ version: string }>(
				"SELECT sqlite_version() as version",
			);
			return result.rows[0]?.version || "unknown";
		} catch {
			return "unknown";
		}
	}

	private async getLastMigrationVersion(): Promise<string | undefined> {
		return (await this.getCurrentMigrationVersion()) || undefined;
	}

	private async createMigrationsTable(): Promise<void> {
		await this.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        version TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
	}

	private async recordMigration(version: string, name: string): Promise<void> {
		await this.query("INSERT INTO _migrations (version, name) VALUES (?, ?)", [
			version,
			name,
		]);
	}

	private async setIsolationLevel(
		db: Database.Database,
		level: IsolationLevel,
	): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			setImmediate(() => {
				try {
					// SQLite doesn't have traditional isolation levels, but we can simulate some behavior
					switch (level) {
						case IsolationLevel.ReadUncommitted:
							db.exec("PRAGMA read_uncommitted = 1");
							break;
						case IsolationLevel.Serializable:
							db.exec("PRAGMA read_uncommitted = 0");
							break;
						// ReadCommitted and RepeatableRead are the default in SQLite
						default:
							break;
					}
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	private startPoolMaintenance(): void {
		setInterval(() => {
			this.maintainPool();
		}, this.config.pool?.reapIntervalMillis);
	}

	private maintainPool(): void {
		const now = Date.now();
		const idleTimeout = this.config.pool?.idleTimeoutMillis;
		const minConnections = this.config.pool?.min;

		// Remove idle connections beyond idle timeout, but keep minimum
		const toRemove = this.pool.filter(
			(conn) =>
				!conn.inUse &&
				now - conn.lastUsedAt.getTime() > (idleTimeout ?? 300000) &&
				this.pool.length > (minConnections ?? 1),
		);

		for (const conn of toRemove) {
			const index = this.pool.indexOf(conn);
			if (index > -1) {
				this.pool.splice(index, 1);
				this.destroyConnection(conn);
			}
		}
	}

	private ensureDatabaseDirectory(): void {
		const dbDir = dirname(this.config.database);
		if (!existsSync(dbDir)) {
			mkdirSync(dbDir, { recursive: true });
		}
	}

	private generateCorrelationId(): string {
		return `sqlite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

class SQLiteTransactionConnection implements TransactionConnection {
	constructor(
		private readonly db: Database.Database,
		private readonly correlationId: string,
	) {}

	async query<T = unknown>(
		sql: string,
		params?: QueryParams,
	): Promise<QueryResult<T>> {
		return await new Promise<QueryResult<T>>((resolve, reject) => {
			setImmediate(() => {
				const startTime = Date.now();

				try {
					const stmt = this.db.prepare(sql);
					// Use instance method for transaction connections
					const paramArray = (this as any).normalizeParams
						? (this as any).normalizeParams(params)
						: Array.isArray(params)
							? [...params]
							: Object.values(params || {});

					let rows: unknown[];
					if (
						sql.trim().toLowerCase().startsWith("select") ||
						sql.trim().toLowerCase().startsWith("with")
					) {
						rows = stmt.all(...paramArray);
					} else {
						const runResult = stmt.run(...paramArray);
						resolve({
							rows: [] as T[],
							rowCount: 0,
							executionTimeMs: Date.now() - startTime,
							affectedRows: runResult.changes,
							insertId:
								typeof runResult.lastInsertRowid === "bigint"
									? Number(runResult.lastInsertRowid)
									: (runResult.lastInsertRowid as number | undefined),
						});
						return;
					}

					resolve({
						rows: (rows || []) as T[],
						rowCount: rows ? rows.length : 0,
						executionTimeMs: Date.now() - startTime,
						fields: rows.length > 0 ? Object.keys(rows[0] || {}) : [],
					});
				} catch (error) {
					reject(
						new QueryError(
							`Transaction query failed: ${error instanceof Error ? error.message : String(error)}`,
							{
								query: sql,
								params,
								correlationId: this.correlationId,
								cause: error instanceof Error ? error : undefined,
							},
						),
					);
				}
			});
		});
	}

	async execute(sql: string, params?: QueryParams): Promise<QueryResult> {
		return await this.query(sql, params);
	}

	async rollback(): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			setImmediate(() => {
				try {
					this.db.exec("ROLLBACK");
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	async commit(): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			setImmediate(() => {
				try {
					this.db.exec("COMMIT");
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	async savepoint(name: string): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			setImmediate(() => {
				try {
					this.db.exec(`SAVEPOINT ${name}`);
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	async releaseSavepoint(name: string): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			setImmediate(() => {
				try {
					this.db.exec(`RELEASE SAVEPOINT ${name}`);
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	async rollbackToSavepoint(name: string): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			setImmediate(() => {
				try {
					this.db.exec(`ROLLBACK TO SAVEPOINT ${name}`);
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	private normalizeParams(params?: QueryParams): unknown[] {
		if (!params) return [];
		if (Array.isArray(params)) return [...params];
		if (params instanceof Map) return [...params.values()];
		return Object.values(params);
	}
}
