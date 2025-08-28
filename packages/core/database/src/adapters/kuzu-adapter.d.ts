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
    private readonly __stats;
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
    logger: any;
    info(: any, { correlationId, tableName, relationshipCount: relationships, length, }: {
        correlationId: any;
        tableName: any;
        relationshipCount: any;
        length: any;
    }): any;
}
//# sourceMappingURL=kuzu-adapter.d.ts.map