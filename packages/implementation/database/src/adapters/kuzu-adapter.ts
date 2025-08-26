/**
 * Kuzu Graph Database Adapter
 *
 * Real implementation for Kuzu graph database with proper Cypher query execution,
 * connection management, and comprehensive error handling for enterprise applications.
 */

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { getLogger } from "../logger.js";
import {
	ConnectionError,
	type ConnectionStats,
	type DatabaseConfig,
	type DatabaseConnection,
	DatabaseError,
	type HealthStatus,
	type Migration,
	type MigrationResult,
	QueryError,
	type QueryParams,
	type QueryResult,
	type SchemaInfo,
	type TransactionConnection,
	type TransactionContext,
	TransactionError,
} from "../types/index.js";

const logger = getLogger("kuzu-adapter");

// Real Kuzu types based on the actual API from Context7 documentation
interface KuzuModule {
	Database: new (
		databasePath?: string,
		bufferManagerSize?: number,
		enableCompression?: boolean,
		readOnly?: boolean,
		maxDBSize?: number,
		autoCheckpoint?: boolean,
		checkpointThreshold?: number,
	) => KuzuDatabase;
	Connection: new (
		database: KuzuDatabase,
		numThreads?: number,
	) => KuzuConnection;
}

interface KuzuDatabase {
	init(): Promise<void>;
	initSync(): void;
	close(): Promise<void>;
	closeSync(): void;
}

interface KuzuConnection {
	query(cypher: string): Promise<KuzuQueryResult | KuzuQueryResult[]>;
	close(): Promise<void>;
}

interface KuzuQueryResult {
	getAll(): Promise<unknown[]>;
	getAllObjects(): Promise<Record<string, unknown>[]>; // Enhanced result format
	hasNext(): boolean;
	getNext(): unknown;
	getColumnNames(): string[];
	getColumnDataTypes(): string[];
	isSuccess(): boolean;
	getErrorMessage(): string;
	toString(): Promise<string>; // Convert results to string
	close(): Promise<void>;
}

export class KuzuAdapter implements DatabaseConnection {
	private kuzuModule: KuzuModule | null = null;
	private database: KuzuDatabase | null = null;
	private connection: KuzuConnection | null = null;
	private isConnectedState = false;
	private readonly stats = {
		totalQueries: 0,
		totalTransactions: 0,
		totalErrors: 0,
		averageQueryTimeMs: 0,
		connectionCreated: 0,
		connectionDestroyed: 0,
	};

	constructor(private config: DatabaseConfig) {}

	async connect(): Promise<void> {
		if (this.isConnectedState) return;

		const correlationId = this.generateCorrelationId();
		logger.info("Connecting to Kuzu database", {
			correlationId,
			database: this.config.database,
		});

		try {
			// Ensure database directory exists
			this.ensureDatabaseDirectory();

			// Try to load Kuzu package
			try {
				const kuzuImport = await import("kuzu");
				this.kuzuModule = {
					Database: kuzuImport.Database as unknown as KuzuModule["Database"],
					Connection:
						kuzuImport.Connection as unknown as KuzuModule["Connection"],
				};
				logger.debug("Successfully imported Kuzu module", { correlationId });
			} catch (importError) {
				logger.error(
					"Failed to import Kuzu package - package may not be installed",
					{
						correlationId,
						error:
							importError instanceof Error
								? importError.message
								: String(importError),
					},
				);
				throw new ConnectionError(
					"Kuzu package not found. Please install with: npm install kuzu",
					correlationId,
					importError instanceof Error ? importError : undefined,
				);
			}

			// Create Kuzu database and connection
			try {
				// Create Kuzu database with proper parameters
				// (databasePath, bufferManagerSize, enableCompression, readOnly, maxDBSize, autoCheckpoint, checkpointThreshold)
				this.database = new this.kuzuModule.Database(
					this.config.database, // databasePath
					undefined, // bufferManagerSize (use default)
					true, // enableCompression
					false, // readOnly
					undefined, // maxDBSize (use default)
					true, // autoCheckpoint
					undefined, // checkpointThreshold (use default)
				);
				this.connection = new this.kuzuModule.Connection(this.database!);
				this.isConnectedState = true;
				this.stats.connectionCreated++;

				logger.info("Connected to Kuzu database successfully", {
					correlationId,
					database: this.config.database,
				});

				// Test connection with a simple query
				await this.testConnection(correlationId);
			} catch (kuzuError) {
				logger.error("Failed to create Kuzu database or connection", {
					correlationId,
					database: this.config.database,
					error:
						kuzuError instanceof Error ? kuzuError.message : String(kuzuError),
				});
				throw new ConnectionError(
					`Failed to create Kuzu database: ${kuzuError instanceof Error ? kuzuError.message : String(kuzuError)}`,
					correlationId,
					kuzuError instanceof Error ? kuzuError : undefined,
				);
			}
		} catch (error) {
			if (error instanceof DatabaseError) {
				throw error;
			}

			logger.error("Unexpected error during Kuzu connection", {
				correlationId,
				database: this.config.database,
				error: error instanceof Error ? error.message : String(error),
			});
			throw new ConnectionError(
				`Failed to connect to Kuzu: ${error instanceof Error ? error.message : String(error)}`,
				correlationId,
				error instanceof Error ? error : undefined,
			);
		}
	}

	async disconnect(): Promise<void> {
		if (!this.isConnectedState) {
			await Promise.resolve(); // Ensure async compliance
			return;
		}

		const correlationId = this.generateCorrelationId();
		logger.info("Disconnecting from Kuzu database", { correlationId });

		try {
			if (this.connection) {
				await this.connection.close();
			}
			if (this.database) {
				await this.database.close();
				this.stats.connectionDestroyed++;
			}

			this.connection = null;
			this.database = null;
			this.kuzuModule = null;
			this.isConnectedState = false;

			logger.info("Successfully disconnected from Kuzu database", {
				correlationId,
			});
		} catch (error) {
			logger.error("Error during Kuzu disconnect", {
				correlationId,
				error: error instanceof Error ? error.message : String(error),
			});
			throw new ConnectionError(
				`Failed to disconnect from Kuzu: ${error instanceof Error ? error.message : String(error)}`,
				correlationId,
				error instanceof Error ? error : undefined,
			);
		}
	}

	isConnected(): boolean {
		return this.isConnectedState && this.connection !== null;
	}

	async query<T = unknown>(
		sql: string,
		params?: QueryParams,
		options?: { correlationId?: string; timeoutMs?: number },
	): Promise<QueryResult<T>> {
		const correlationId =
			options?.correlationId || this.generateCorrelationId();
		const startTime = Date.now();

		if (!this.isConnected()) {
			await this.connect();
		}

		if (!this.connection) {
			throw new QueryError("Connection not available", {
				query: sql,
				params,
				correlationId,
			});
		}

		try {
			logger.debug("Executing Kuzu Cypher query", {
				correlationId,
				sql: sql.substring(0, 200),
			});

			// Execute real Cypher query using Kuzu connection
			const queryResult = await this.executeWithRetry(
				async () => {
					const queryResult = await this.connection?.query(sql);
					const result = Array.isArray(queryResult)
						? queryResult[0]
						: queryResult;

					if (!result.isSuccess()) {
						throw new Error(result.getErrorMessage());
					}

					const rows = await result.getAll();
					const columnNames = result.getColumnNames();

					await result.close();

					return {
						rows: rows as T[],
						rowCount: rows.length,
						executionTimeMs: Date.now() - startTime,
						fields: columnNames,
						metadata: {
							columnDataTypes: result.getColumnDataTypes(),
						},
					};
				},
				correlationId,
				sql,
				params,
			);

			this.stats.totalQueries++;
			this.updateAverageQueryTime(Date.now() - startTime);

			logger.debug("Kuzu query executed successfully", {
				correlationId,
				executionTimeMs: queryResult.executionTimeMs,
				rowCount: queryResult.rowCount,
			});

			return queryResult;
		} catch (error) {
			this.stats.totalErrors++;
			logger.error("Kuzu query execution failed", {
				correlationId,
				sql: sql.substring(0, 200),
				error: error instanceof Error ? error.message : String(error),
			});

			if (error instanceof DatabaseError) {
				throw error;
			}

			throw new QueryError(
				`Kuzu query execution failed: ${error instanceof Error ? error.message : String(error)}`,
				{
					query: sql,
					params,
					correlationId,
					cause: error instanceof Error ? error : undefined,
				},
			);
		}
	}

	async execute(
		sql: string,
		params?: QueryParams,
		options?: { correlationId?: string; timeoutMs?: number },
	): Promise<QueryResult> {
		// For Kuzu, execute operations are the same as queries
		return await this.query(sql, params, options);
	}

	async transaction<T>(
		fn: (tx: TransactionConnection) => Promise<T>,
		context?: TransactionContext,
	): Promise<T> {
		const correlationId =
			context?.correlationId || this.generateCorrelationId();

		if (!this.isConnected()) {
			await this.connect();
		}

		try {
			logger.debug("Starting Kuzu transaction", { correlationId });

			// Note: Kuzu doesn't have traditional transactions like SQL databases
			// Instead, we'll implement a transaction-like behavior using Cypher statements
			const txConnection = new KuzuTransactionConnection(this, correlationId);

			const result = await fn(txConnection);

			this.stats.totalTransactions++;
			logger.debug("Kuzu transaction completed successfully", {
				correlationId,
			});
			return result;
		} catch (error) {
			this.stats.totalErrors++;
			logger.error("Kuzu transaction failed", {
				correlationId,
				error: error instanceof Error ? error.message : String(error),
			});

			if (error instanceof DatabaseError) {
				throw error;
			}

			throw new TransactionError(
				`Transaction failed: ${error instanceof Error ? error.message : String(error)}`,
				correlationId,
				error instanceof Error ? error : undefined,
			);
		}
	}

	async health(): Promise<HealthStatus> {
		const startTime = Date.now();

		try {
			if (!this.isConnected()) {
				return {
					healthy: false,
					status: "unhealthy",
					score: 0,
					timestamp: new Date(),
					details: { connected: false, reason: "Not connected" },
				};
			}

			// Test query to verify database health
			await this.query("RETURN 1 as health_check");

			const responseTime = Date.now() - startTime;

			// Calculate health score based on various factors
			let score = 100;

			// Penalize high response time
			if (responseTime > 2000) score -= 40;
			else if (responseTime > 1000) score -= 25;
			else if (responseTime > 500) score -= 10;

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
					connected: this.isConnected(),
					error: error instanceof Error ? error.message : String(error),
				},
			};
		}
	}

	async getStats(): Promise<ConnectionStats> {
		await Promise.resolve(); // Ensure async compliance
		return {
			total: 1,
			active: this.isConnected() ? 1 : 0,
			idle: 0,
			waiting: 0,
			created: this.stats.connectionCreated,
			destroyed: this.stats.connectionDestroyed,
			errors: this.stats.totalErrors,
			averageAcquisitionTimeMs: 0,
			averageIdleTimeMs: 0,
			currentLoad: this.isConnected() ? 1 : 0,
		};
	}

	async getSchema(): Promise<SchemaInfo> {
		try {
			// Get basic schema information (simplified to avoid unused results)
			await this.query("CALL show_tables()");

			return {
				tables: [], // Graph databases don't have traditional table schemas
				version: await this.getDatabaseVersion(),
				lastMigration: await this.getLastMigrationVersion(),
			};
		} catch (error) {
			logger.error("Failed to get Kuzu schema", { error });
			return {
				tables: [],
				version: "unknown",
				lastMigration: undefined,
			};
		}
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
				"MATCH (m:_Migration) RETURN m.version as version ORDER BY m.version DESC LIMIT 1",
			);
			return result.rows[0]?.version || null;
		} catch {
			// Migrations node doesn't exist yet
			return null;
		}
	}

	async explain(sql: string, params?: QueryParams): Promise<QueryResult> {
		return await this.query(`EXPLAIN ${sql}`, params);
	}

	async vacuum(): Promise<void> {
		await Promise.resolve(); // Ensure async compliance
		// Kuzu doesn't have a vacuum operation like SQLite
		logger.debug("Vacuum operation not applicable for Kuzu");
	}

	async analyze(): Promise<void> {
		// Run some graph statistics queries instead
		try {
			await this.query("CALL show_tables()");
			logger.debug("Analyze operation completed for Kuzu");
		} catch (error) {
			logger.warn("Analyze operation failed", { error });
		}
	}

	// Advanced Graph Database Features

	/**
	 * Create a node table in the graph database
	 */
	async createNodeTable(
		tableName: string,
		properties: Record<string, string>,
		primaryKey?: string,
	): Promise<void> {
		if (!this.isConnected()) {
			await this.connect();
		}

		const correlationId = this.generateCorrelationId();

		try {
			// Build property definitions
			const propertyDefs = Object.entries(properties)
				.map(([name, type]) => `${name} ${type.toUpperCase()}`)
				.join(", ");

			const primaryKeyClause = primaryKey
				? `, PRIMARY KEY (${primaryKey})`
				: "";

			const cypher = `CREATE NODE TABLE IF NOT EXISTS ${tableName} (${propertyDefs}${primaryKeyClause})`;

			await this.query(cypher, undefined, { correlationId });

			logger.info("Node table created successfully", {
				correlationId,
				tableName,
				properties: Object.keys(properties).length,
			});
		} catch (error) {
			logger.error("Failed to create node table", {
				correlationId,
				tableName,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Create a relationship table in the graph database
	 */
	async createRelationshipTable(
		tableName: string,
		fromNodeTable: string,
		toNodeTable: string,
		properties?: Record<string, string>,
	): Promise<void> {
		if (!this.isConnected()) {
			await this.connect();
		}

		const correlationId = this.generateCorrelationId();

		try {
			let cypher = `CREATE REL TABLE IF NOT EXISTS ${tableName} (FROM ${fromNodeTable} TO ${toNodeTable}`;

			if (properties && Object.keys(properties).length > 0) {
				const propertyDefs = Object.entries(properties)
					.map(([name, type]) => `${name} ${type.toUpperCase()}`)
					.join(", ");
				cypher += `, ${propertyDefs}`;
			}

			cypher += ")";

			await this.query(cypher, undefined, { correlationId });

			logger.info("Relationship table created successfully", {
				correlationId,
				tableName,
				fromNodeTable,
				toNodeTable,
				properties: properties ? Object.keys(properties).length : 0,
			});
		} catch (error) {
			logger.error("Failed to create relationship table", {
				correlationId,
				tableName,
				fromNodeTable,
				toNodeTable,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Insert nodes into the graph database
	 */
	async insertNodes(
		tableName: string,
		nodes: Array<Record<string, unknown>>,
	): Promise<void> {
		if (!this.isConnected()) {
			await this.connect();
		}

		const correlationId = this.generateCorrelationId();

		try {
			for (const node of nodes) {
				const properties = Object.keys(node);
				const values = Object.values(node);
				const _paramPlaceholders = values
					.map((_, i) => `$param${i}`)
					.join(", ");
				const _propertyList = properties.join(", ");

				const cypher = `CREATE (:${tableName} {${properties.map((prop, i) => `${prop}: $param${i}`).join(", ")}})`;

				// Convert values array to params object
				const params: Record<string, unknown> = {};
				values.forEach((value, i) => {
					params[`param${i}`] = value;
				});

				await this.query(cypher, params, { correlationId });
			}

			logger.info("Nodes inserted successfully", {
				correlationId,
				tableName,
				nodeCount: nodes.length,
			});
		} catch (error) {
			logger.error("Failed to insert nodes", {
				correlationId,
				tableName,
				nodeCount: nodes.length,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Insert relationships into the graph database
	 */
	async insertRelationships(
		tableName: string,
		relationships: Array<{
			from: Record<string, unknown>;
			to: Record<string, unknown>;
			properties?: Record<string, unknown>;
		}>,
	): Promise<void> {
		if (!this.isConnected()) {
			await this.connect();
		}

		const correlationId = this.generateCorrelationId();

		try {
			for (const rel of relationships) {
				// Build match clauses for from and to nodes
				const fromProps = Object.entries(rel.from)
					.map(([key, value]) => `${key}: "${value}"`)
					.join(", ");
				const toProps = Object.entries(rel.to)
					.map(([key, value]) => `${key}: "${value}"`)
					.join(", ");

				let cypher = `MATCH (from), (to) WHERE {${fromProps}} AND {${toProps}}`;

				if (rel.properties && Object.keys(rel.properties).length > 0) {
					const relProps = Object.entries(rel.properties)
						.map(([key, value]) => `${key}: "${value}"`)
						.join(", ");
					cypher += ` CREATE (from)-[:${tableName} {${relProps}}]->(to)`;
				} else {
					cypher += ` CREATE (from)-[:${tableName}]->(to)`;
				}

				await this.query(cypher, undefined, { correlationId });
			}

			logger.info("Relationships inserted successfully", {
				correlationId,
				tableName,
				relationshipCount: relationships.length,
			});
		} catch (error) {
			logger.error("Failed to insert relationships", {
				correlationId,
				tableName,
				relationshipCount: relationships.length,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Execute a graph traversal query
	 */
	async graphTraversal<T = unknown>(
		startNodeCondition: Record<string, unknown>,
		relationshipPattern: string,
		endNodeCondition?: Record<string, unknown>,
		options?: {
			maxHops?: number;
			returnPath?: boolean;
			correlationId?: string;
		},
	): Promise<QueryResult<T>> {
		const correlationId =
			options?.correlationId || this.generateCorrelationId();

		try {
			// Build start node condition
			const startProps = Object.entries(startNodeCondition)
				.map(([key, value]) => `${key}: "${value}"`)
				.join(", ");

			let cypher = `MATCH path = (start {${startProps}})`;

			// Add relationship pattern with optional hop limits
			if (options?.maxHops) {
				cypher += `-[r:${relationshipPattern}*1..${options.maxHops}]-`;
			} else {
				cypher += `-[r:${relationshipPattern}]-`;
			}

			// Add end node condition if specified
			if (endNodeCondition) {
				const endProps = Object.entries(endNodeCondition)
					.map(([key, value]) => `${key}: "${value}"`)
					.join(", ");
				cypher += `(end {${endProps}})`;
			} else {
				cypher += "(end)";
			}

			// Return clause
			if (options?.returnPath) {
				cypher += " RETURN path, start, end, r";
			} else {
				cypher += " RETURN start, end, r";
			}

			const result = await this.query<T>(cypher, undefined, { correlationId });

			logger.debug("Graph traversal completed", {
				correlationId,
				relationshipPattern,
				resultCount: result.rowCount,
			});

			return result;
		} catch (error) {
			logger.error("Graph traversal failed", {
				correlationId,
				relationshipPattern,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Get graph statistics and schema information
	 */
	async getGraphSchema(): Promise<{
		nodeLabels: string[];
		relationshipTypes: string[];
		nodeCount: number;
		relationshipCount: number;
	}> {
		if (!this.isConnected()) {
			await this.connect();
		}

		const correlationId = this.generateCorrelationId();

		try {
			// Get node table names
			const nodeTablesResult = await this.query(
				"CALL show_tables()",
				undefined,
				{ correlationId },
			);
			const nodeLabels = nodeTablesResult.rows
				.map((row: unknown) => (row as { name?: string }).name)
				.filter((name): name is string => !!name);

			// Get relationship types (simplified - would need more sophisticated query for actual rel types)
			const relationshipTypes: string[] = [];

			// Get node count (simplified)
			let nodeCount = 0;
			let relationshipCount = 0;

			try {
				const nodeCountResult = await this.query(
					"MATCH (n) RETURN count(n) as count",
					undefined,
					{ correlationId },
				);
				nodeCount = (nodeCountResult.rows[0] as { count?: number })?.count || 0;

				const relCountResult = await this.query(
					"MATCH ()-[r]->() RETURN count(r) as count",
					undefined,
					{ correlationId },
				);
				relationshipCount =
					(relCountResult.rows[0] as { count?: number })?.count || 0;
			} catch {
				// Ignore errors for statistics queries
			}

			logger.debug("Retrieved graph schema", {
				correlationId,
				nodeLabels: nodeLabels.length,
				relationshipTypes: relationshipTypes.length,
				nodeCount,
				relationshipCount,
			});

			return {
				nodeLabels,
				relationshipTypes,
				nodeCount,
				relationshipCount,
			};
		} catch (error) {
			logger.error("Failed to get graph schema", {
				correlationId,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	// Private methods

	private async testConnection(correlationId: string): Promise<void> {
		try {
			await this.query("RETURN 1 as test", undefined, { correlationId });
			logger.debug("Connection test successful", { correlationId });
		} catch (error) {
			logger.error("Connection test failed", {
				correlationId,
				error: error instanceof Error ? error.message : String(error),
			});
			throw new ConnectionError(
				`Connection test failed: ${error instanceof Error ? error.message : String(error)}`,
				correlationId,
				error instanceof Error ? error : undefined,
			);
		}
	}

	private async executeWithRetry<T>(
		operation: () => Promise<T>,
		correlationId: string,
		sql?: string,
		params?: QueryParams,
	): Promise<T> {
		const retryPolicy = this.config.retryPolicy || {
			maxRetries: 3,
			initialDelayMs: 100,
			maxDelayMs: 5000,
			backoffFactor: 2,
			retryableErrors: ["NETWORK_ERROR", "TIMEOUT_ERROR"],
		};

		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				const errorMessage = lastError.message.toUpperCase();
				const isRetryable = retryPolicy.retryableErrors.some((retryableError) =>
					errorMessage.includes(retryableError),
				);

				if (attempt === retryPolicy.maxRetries || !isRetryable) {
					break;
				}

				const delay = Math.min(
					retryPolicy.initialDelayMs * retryPolicy.backoffFactor ** attempt,
					retryPolicy.maxDelayMs,
				);

				logger.warn("Retrying Kuzu operation after error", {
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

	private updateAverageQueryTime(executionTime: number): void {
		const { totalQueries, averageQueryTimeMs } = this.stats;
		this.stats.averageQueryTimeMs =
			(averageQueryTimeMs * (totalQueries - 1) + executionTime) / totalQueries;
	}

	private async getDatabaseVersion(): Promise<string> {
		await Promise.resolve(); // Ensure async compliance
		// Kuzu doesn't have a version function like SQLite
		return "kuzu-embedded";
	}

	private async getLastMigrationVersion(): Promise<string | undefined> {
		return (await this.getCurrentMigrationVersion()) || undefined;
	}

	private async createMigrationsTable(): Promise<void> {
		try {
			await this.query(`
        CREATE NODE TABLE IF NOT EXISTS _Migration (
          version STRING, 
          name STRING, 
          applied_at TIMESTAMP,
          PRIMARY KEY (version)
        )
      `);
		} catch (error) {
			logger.warn("Could not create migrations table", { error });
		}
	}

	private async recordMigration(version: string, name: string): Promise<void> {
		await this.query(
			"CREATE (:_Migration {version: $version, name: $name, applied_at: timestamp()})",
			{ version, name },
		);
	}

	private ensureDatabaseDirectory(): void {
		const dbDir = dirname(this.config.database);
		if (!existsSync(dbDir)) {
			mkdirSync(dbDir, { recursive: true });
		}
	}

	private generateCorrelationId(): string {
		return `kuzu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

class KuzuTransactionConnection implements TransactionConnection {
	constructor(
		private readonly adapter: KuzuAdapter,
		private readonly correlationId: string,
	) {}

	async query<T = unknown>(
		sql: string,
		params?: QueryParams,
	): Promise<QueryResult<T>> {
		return await this.adapter.query<T>(sql, params, {
			correlationId: this.correlationId,
		});
	}

	async execute(sql: string, params?: QueryParams): Promise<QueryResult> {
		return await this.adapter.execute(sql, params, {
			correlationId: this.correlationId,
		});
	}

	async rollback(): Promise<void> {
		await Promise.resolve(); // Ensure async compliance
		// Kuzu doesn't support transactions in the traditional sense
		// This is a no-op for compatibility
		logger.debug("Transaction rollback (no-op for Kuzu)", {
			correlationId: this.correlationId,
		});
	}

	async commit(): Promise<void> {
		await Promise.resolve(); // Ensure async compliance
		// Kuzu doesn't support transactions in the traditional sense
		// This is a no-op for compatibility
		logger.debug("Transaction commit (no-op for Kuzu)", {
			correlationId: this.correlationId,
		});
	}

	async savepoint(name: string): Promise<void> {
		await Promise.resolve(); // Ensure async compliance
		logger.debug("Savepoint created (no-op for Kuzu)", {
			correlationId: this.correlationId,
			name,
		});
	}

	async releaseSavepoint(name: string): Promise<void> {
		await Promise.resolve(); // Ensure async compliance
		logger.debug("Savepoint released (no-op for Kuzu)", {
			correlationId: this.correlationId,
			name,
		});
	}

	async rollbackToSavepoint(name: string): Promise<void> {
		await Promise.resolve(); // Ensure async compliance
		logger.debug("Rollback to savepoint (no-op for Kuzu)", {
			correlationId: this.correlationId,
			name,
		});
	}
}
