/**
 * @fileoverview Backend-Agnostic Database Types
 *
 * Comprehensive database types that provide a unified interface across all database backends.
 * These types are designed to be implemented by concrete database adapters while maintaining
 * backend independence for foundation consumers.
 */
import { type Result } from '../../error-handling/index.js';
export type DatabaseType = 'sqlite' | 'lancedb' | 'kuzu' | 'memory';
export type StorageType = 'keyValue' | 'sql' | 'vector' | 'graph' | 'hybrid';
export type QueryParams = readonly unknown[] | Record<string, unknown> | Map<string, unknown>;
export interface PoolConfig {
    readonly min: number;
    readonly max: number;
    readonly acquireTimeoutMillis: number;
    readonly idleTimeoutMillis: number;
    readonly reapIntervalMillis: number;
    readonly createTimeoutMillis: number;
    readonly destroyTimeoutMillis: number;
    readonly createRetryIntervalMillis: number;
    readonly propagateCreateError: boolean;
}
export interface DatabaseConfig {
    readonly type: DatabaseType;
    readonly database: string;
    readonly pool?: Partial<PoolConfig>;
    readonly options?: Readonly<Record<string, unknown>>;
    readonly retryPolicy?: RetryPolicy;
    readonly healthCheck?: HealthCheckConfig;
}
export interface RetryPolicy {
    readonly maxRetries: number;
    readonly initialDelayMs: number;
    readonly maxDelayMs: number;
    readonly backoffFactor: number;
    readonly retryableErrors: readonly string[];
}
export interface HealthCheckConfig {
    readonly enabled: boolean;
    readonly intervalMs: number;
    readonly timeoutMs: number;
    readonly retries: number;
}
export declare enum IsolationLevel {
    ReadUncommitted = "READ_UNCOMMITTED",
    ReadCommitted = "READ_COMMITTED",
    RepeatableRead = "REPEATABLE_READ",
    Serializable = "SERIALIZABLE"
}
export interface DatabaseErrorOptions {
    code: string;
    correlationId?: string;
    query?: string;
    params?: QueryParams;
    cause?: Error;
}
export declare class DatabaseError extends Error {
    readonly code: string;
    readonly correlationId?: string;
    readonly query?: string;
    readonly params?: QueryParams;
    readonly cause?: Error;
    constructor(message: string, options: DatabaseErrorOptions);
}
export declare class ConnectionError extends DatabaseError {
    constructor(message: string, correlationId?: string, cause?: Error);
}
export interface QueryErrorOptions {
    query?: string;
    params?: QueryParams;
    correlationId?: string;
    cause?: Error;
}
export declare class QueryError extends DatabaseError {
    constructor(message: string, options?: QueryErrorOptions);
}
export declare class TransactionError extends DatabaseError {
    constructor(message: string, correlationId?: string, cause?: Error);
}
export interface HealthStatus {
    readonly healthy: boolean;
    readonly status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    readonly score: number;
    readonly timestamp: Date;
    readonly responseTimeMs?: number;
    readonly connectionPool?: {
        readonly total: number;
        readonly active: number;
        readonly idle: number;
        readonly waiting: number;
    };
    readonly metrics?: {
        readonly queriesPerSecond: number;
        readonly avgResponseTimeMs: number;
        readonly errorRate: number;
    };
    readonly lastError?: string;
    readonly details: Readonly<Record<string, unknown>>;
}
export interface QueryResult<T = unknown> {
    readonly rows: readonly T[];
    readonly rowCount: number;
    readonly fields?: readonly string[];
    readonly executionTimeMs: number;
    readonly affectedRows?: number;
    readonly insertId?: string | number;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface TransactionContext {
    readonly isolationLevel?: IsolationLevel;
    readonly readOnly?: boolean;
    readonly timeoutMs?: number;
    readonly correlationId?: string;
}
export interface DatabaseConnection {
    query<T = unknown>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
    execute(sql: string, params?: QueryParams): Promise<{
        affectedRows: number;
        insertId?: number;
    }>;
    close(): Promise<void>;
}
export interface TransactionConnection extends DatabaseConnection {
    commit(): Promise<void>;
    rollback(): Promise<void>;
    savepoint(name: string): Promise<void>;
    releaseSavepoint(name: string): Promise<void>;
    rollbackToSavepoint(name: string): Promise<void>;
}
export interface DatabaseAdapter {
    connect(config: DatabaseConfig): Promise<Result<DatabaseConnection, Error>>;
    getHealth(): Promise<HealthStatus>;
    disconnect(): Promise<void>;
    transaction<T>(operation: (conn: TransactionConnection) => Promise<T>, context?: TransactionContext): Promise<T>;
}
export interface VectorSearchOptions {
    readonly limit?: number;
    readonly threshold?: number;
    readonly includeMetadata?: boolean;
    readonly filter?: Readonly<Record<string, unknown>>;
}
export interface VectorResult {
    readonly id: string;
    readonly vector: readonly number[];
    readonly similarity: number;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface GraphNode {
    readonly id: string;
    readonly labels: readonly string[];
    readonly properties: Readonly<Record<string, unknown>>;
}
export interface GraphEdge {
    readonly id: string;
    readonly fromId: string;
    readonly toId: string;
    readonly type: string;
    readonly properties: Readonly<Record<string, unknown>>;
}
export interface GraphResult {
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly GraphEdge[];
    readonly executionTimeMs: number;
}
export interface ConnectionStats {
    readonly total: number;
    readonly active: number;
    readonly idle: number;
    readonly waiting: number;
    readonly created: number;
    readonly destroyed: number;
    readonly errors: number;
    readonly averageAcquisitionTimeMs: number;
    readonly averageIdleTimeMs: number;
    readonly currentLoad: number;
}
export interface SchemaInfo {
    readonly tables?: readonly TableSchema[];
    readonly views?: readonly ViewSchema[];
    readonly indexes?: readonly IndexSchema[];
    readonly constraints?: readonly ConstraintSchema[];
    readonly version?: string;
    readonly lastMigration?: string;
}
export interface TableSchema {
    readonly name: string;
    readonly columns: readonly ColumnSchema[];
    readonly primaryKey: readonly string[];
    readonly foreignKeys: readonly ForeignKeySchema[];
    readonly indexes: readonly IndexSchema[];
}
export interface ColumnSchema {
    readonly name: string;
    readonly type: string;
    readonly nullable: boolean;
    readonly defaultValue?: unknown;
    readonly maxLength?: number;
    readonly precision?: number;
    readonly scale?: number;
}
export interface ViewSchema {
    readonly name: string;
    readonly definition: string;
    readonly columns: readonly ColumnSchema[];
}
export interface IndexSchema {
    readonly name: string;
    readonly tableName: string;
    readonly columns: readonly string[];
    readonly unique: boolean;
    readonly type: 'btree' | 'hash' | 'gin' | 'gist' | 'vector' | 'other';
}
export interface ConstraintSchema {
    readonly name: string;
    readonly type: 'primary_key' | 'foreign_key' | 'unique' | 'check';
    readonly tableName: string;
    readonly columns: readonly string[];
    readonly definition: string;
}
export interface ForeignKeySchema {
    readonly name: string;
    readonly columns: readonly string[];
    readonly referencedTable: string;
    readonly referencedColumns: readonly string[];
    readonly onDelete: 'cascade' | 'set_null' | 'restrict' | 'no_action';
    readonly onUpdate: 'cascade' | 'set_null' | 'restrict' | 'no_action';
}
export interface Migration {
    readonly id: string;
    readonly version: number;
    readonly name: string;
    readonly description?: string;
    up(adapter: DatabaseAdapter): Promise<void>;
    down(adapter: DatabaseAdapter): Promise<void>;
}
export interface MigrationResult {
    readonly migration: string;
    readonly status: 'success' | 'failed' | 'skipped';
    readonly executionTimeMs: number;
    readonly error?: string;
}
export interface KeyValueStorage {
    get<T = unknown>(key: string): Promise<T | null>;
    set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(pattern?: string): Promise<string[]>;
    exists(key: string): Promise<boolean>;
    increment(key: string, amount?: number): Promise<number>;
    decrement(key: string, amount?: number): Promise<number>;
    expire(key: string, ttl: number): Promise<boolean>;
    getStats(): Promise<{
        keys: number;
        memoryUsage: number;
    }>;
}
export interface SqlStorage {
    query<T = unknown>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
    execute(sql: string, params?: QueryParams): Promise<{
        affectedRows: number;
        insertId?: number;
    }>;
    transaction<T>(operation: (conn: TransactionConnection) => Promise<T>, context?: TransactionContext): Promise<T>;
    getSchema(): Promise<SchemaInfo>;
    migrate(migrations: readonly Migration[]): Promise<readonly MigrationResult[]>;
}
export interface VectorStorage {
    insert(id: string, vector: readonly number[], metadata?: Readonly<Record<string, unknown>>): Promise<void>;
    search(query: readonly number[], options?: VectorSearchOptions): Promise<readonly VectorResult[]>;
    delete(id: string): Promise<boolean>;
    update(id: string, vector?: readonly number[], metadata?: Readonly<Record<string, unknown>>): Promise<boolean>;
    clear(): Promise<void>;
    getStats(): Promise<{
        count: number;
        dimensions: number;
    }>;
}
export interface GraphStorage {
    addNode(id: string, labels: readonly string[], properties?: Readonly<Record<string, unknown>>): Promise<void>;
    addEdge(id: string, fromId: string, toId: string, type: string, properties?: Readonly<Record<string, unknown>>): Promise<void>;
    query(cypher: string, params?: QueryParams): Promise<GraphResult>;
    deleteNode(id: string): Promise<boolean>;
    deleteEdge(id: string): Promise<boolean>;
    clear(): Promise<void>;
    getStats(): Promise<{
        nodes: number;
        edges: number;
    }>;
}
export interface DatabaseFactory {
    createConnection(config: DatabaseConfig): Promise<DatabaseConnection>;
    createKeyValueStorage(config: DatabaseConfig): Promise<KeyValueStorage>;
    createSqlStorage(config: DatabaseConfig): Promise<SqlStorage>;
    createVectorStorage(config: DatabaseConfig): Promise<VectorStorage>;
    createGraphStorage(config: DatabaseConfig): Promise<GraphStorage>;
}
export interface DatabaseProvider {
    getAdapter(type: DatabaseType): Promise<DatabaseAdapter>;
    createFactory(type: DatabaseType): Promise<DatabaseFactory>;
    getHealthStatus(): Promise<HealthStatus>;
}
export interface DatabaseAccess {
    sql: SqlStorage;
    keyValue: KeyValueStorage;
    vector: VectorStorage;
    graph: GraphStorage;
}
export interface CreateDatabaseFunction {
    (config: DatabaseConfig): Promise<DatabaseConnection>;
}
export interface CreateKeyValueStorageFunction {
    (config?: Partial<DatabaseConfig>): Promise<KeyValueStorage>;
}
export interface CreateDatabaseAccessFunction {
    (config: DatabaseConfig): Promise<DatabaseAccess>;
}
//# sourceMappingURL=types.d.ts.map