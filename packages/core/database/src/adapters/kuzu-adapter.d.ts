/**
 * Kuzu Graph Database Adapter
 *
 * Real implementation for Kuzu graph database with proper Cypher query execution,
 * connection management, and comprehensive error handling for enterprise applications.
 */
import { type ConnectionStats, type DatabaseConfig, type DatabaseConnection, type HealthStatus, type Migration, type MigrationResult, type QueryParams, type QueryResult, type SchemaInfo, type TransactionConnection, type TransactionContext } from '../types/index.js';
export declare class KuzuAdapter implements DatabaseConnection {
 private config;
 private kuzuModule;
 private database;
 private connection;
 private isConnectedState;
 private readonly stats;
 constructor(config: DatabaseConfig);
 connect(): Promise<void>;
 disconnect(): Promise<void>;
 isConnected(): boolean;
 query<T = unknown>(sql: string, params?: QueryParams, options?: {
 correlationId?: string;
 timeoutMs?: number;
 }): Promise<QueryResult<T>>;
 execute(sql: string, params?: QueryParams, options?: {
 correlationId?: string;
 timeoutMs?: number;
 }): Promise<QueryResult>;
 transaction<T>(fn: (tx: TransactionConnection) => Promise<T>, context?: TransactionContext): Promise<T>;
 health(): Promise<HealthStatus>;
 getStats(): Promise<ConnectionStats>;
 getSchema(): Promise<SchemaInfo>;
 migrate(migrations: readonly Migration[]): Promise<readonly MigrationResult[]>;
 getCurrentMigrationVersion(): Promise<string | null>;
 explain(sql: string, params?: QueryParams): Promise<QueryResult>;
 vacuum(): Promise<void>;
 analyze(): Promise<void>;
 /**
 * Create a node table in the graph database
 */
 createNodeTable(tableName: string, properties: Record<string, string>, primaryKey?: string): Promise<void>;
 /**
 * Create a relationship table in the graph database
 */
 createRelationshipTable(tableName: string, fromNodeTable: string, toNodeTable: string, properties?: Record<string, string>): Promise<void>;
 /**
 * Insert nodes into the graph database
 */
 insertNodes(tableName: string, nodes: Array<Record<string, unknown>>): Promise<void>;
 /**
 * Insert relationships into the graph database
 */
 insertRelationships(tableName: string, relationships: Array<{
 from: Record<string, unknown>;
 to: Record<string, unknown>;
 properties?: Record<string, unknown>;
 }>): Promise<void>;
 /**
 * Execute a graph traversal query
 */
 graphTraversal<T = unknown>(startNodeCondition: Record<string, unknown>, relationshipPattern: string, endNodeCondition?: Record<string, unknown>, options?: {
 maxHops?: number;
 returnPath?: boolean;
 correlationId?: string;
 }): Promise<QueryResult<T>>;
 /**
 * Get graph statistics and schema information
 */
 getGraphSchema(): Promise<{
 nodeLabels: string[];
 relationshipTypes: string[];
 nodeCount: number;
 relationshipCount: number;
 }>;
 private testConnection;
 private executeWithRetry;
 private updateAverageQueryTime;
 private getDatabaseVersion;
 private getLastMigrationVersion;
 private createMigrationsTable;
 private recordMigration;
 private ensureDatabaseDirectory;
 private generateCorrelationId;
 private sleep;
}
//# sourceMappingURL=kuzu-adapter.d.ts.map