/**
 * SQLite Database Adapter
 *
 * Real implementation with connection pooling, retry logic, health monitoring,
 * and comprehensive error handling for enterprise applications.
 */
import { type ConnectionStats, type DatabaseConfig, type DatabaseConnection, type HealthStatus, type Migration, type MigrationResult, type QueryParams, type QueryResult, type SchemaInfo, type TransactionConnection, type TransactionContext } from '../types/index.js';
export declare class SQLiteAdapter implements DatabaseConnection {
    private readonly config;
    private readonly pool;
    private connected;
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
    private executeStatementWithRetry;
    resolve({ rows:  }: {
        rows: any;
    }): any;
}
//# sourceMappingURL=sqlite-adapter.d.ts.map