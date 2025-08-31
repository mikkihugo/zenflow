/**
 * Database Types
 *
 * Comprehensive TypeScript types for multi-database abstractions with full type safety.
 * Designed for enterprise-grade applications with proper error handling and performance monitoring.
 */

// Core Database Types
export type DatabaseType = 'sqlite' | 'lancedb' | 'kuzu' | 'memory';
export type StorageType =
  | 'keyValue'
  | 'sql'
  | 'vector'
  | 'graph'
  | 'hybrid';

// Generic Query Parameters with strict typing
export type QueryParams =
  | readonly unknown[]
  | Record<string, unknown>
  | Map<string, unknown>;

// Connection Pool Configuration
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

// Database Configuration with environment-specific options
export interface DatabaseConfig {
  readonly type: DatabaseType;
  readonly database: string;
  readonly pool?: Partial<PoolConfig>;
  readonly options?: Readonly<Record<string, unknown>>;
  readonly retryPolicy?: RetryPolicy;
  readonly healthCheck?: HealthCheckConfig;
}

// Retry Policy for resilient connections
export interface RetryPolicy {
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoffFactor: number;
  readonly retryableErrors: readonly string[];
}

// Health Check Configuration
export interface HealthCheckConfig {
  readonly enabled: boolean;
  readonly intervalMs: number;
  readonly timeoutMs: number;
  readonly retries: number;
}

// Transaction Isolation Levels
export enum IsolationLevel {
  ReadUncommitted = 'READ_UNCOMMITTED',
  ReadCommitted = 'READ_COMMITTED',
  RepeatableRead = 'REPEATABLE_READ',
  Serializable = 'SERIALIZABLE',
}

// Database Error Types with correlation tracking
export interface DatabaseErrorOptions {
  code: string;
  correlationId?: string;
  query?: string;
  params?: QueryParams;
  cause?: Error;
}

export class DatabaseError extends Error {
  public readonly code: string;
  public readonly correlationId?: string | undefined;
  public readonly query?: string | undefined;
  public readonly params?: QueryParams | undefined;
  public override readonly cause?: Error | undefined;

  constructor(message: string, options: DatabaseErrorOptions) {
    super(message);
    this.name = 'DatabaseError';
    this.code = options.code;
    this.correlationId = options.correlationId;
    this.query = options.query;
    this.params = options.params;
    this.cause = options.cause;
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, correlationId?: string, cause?: Error) {
    const options: DatabaseErrorOptions = { code: 'CONNECTION_ERROR' };
    if (correlationId !== undefined) options.correlationId = correlationId;
    if (cause !== undefined) options.cause = cause;
    
    super(message, options);
    this.name = 'ConnectionError';
  }
}

export interface QueryErrorOptions {
  query?: string;
  params?: QueryParams;
  correlationId?: string;
  cause?: Error;
}

export class QueryError extends DatabaseError {
  constructor(message: string, options: QueryErrorOptions = {}) {
    const dbOptions: DatabaseErrorOptions = { code: 'QUERY_ERROR' };
    if (options.correlationId !== undefined) dbOptions.correlationId = options.correlationId;
    if (options.query !== undefined) dbOptions.query = options.query;
    if (options.params !== undefined) dbOptions.params = options.params;
    if (options.cause !== undefined) dbOptions.cause = options.cause;
    
    super(message, dbOptions);
    this.name = 'QueryError';
  }
}

export class TransactionError extends DatabaseError {
  constructor(message: string, correlationId?: string, cause?: Error) {
    const options: DatabaseErrorOptions = { code: 'TRANSACTION_ERROR' };
    if (correlationId !== undefined) options.correlationId = correlationId;
    if (cause !== undefined) options.cause = cause;
    
    super(message, options);
    this.name = 'TransactionError';
  }
}

// Health Status with detailed metrics
export interface HealthStatus {
  readonly healthy: boolean;
  readonly status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  readonly score: number; // 0-100
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

// Query Result with comprehensive metadata
export interface QueryResult<T = unknown> {
  readonly rows: readonly T[];
  readonly rowCount: number;
  readonly fields?: readonly string[];
  readonly executionTimeMs: number;
  readonly affectedRows?: number;
  readonly insertId?: string | number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// Transaction Context
export interface TransactionContext {
  readonly isolationLevel?: IsolationLevel;
  readonly readOnly?: boolean;
  readonly timeoutMs?: number;
  readonly correlationId?: string;
}

// Vector Search Types
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

// Graph Types with proper schema definitions
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

// Connection Statistics
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
  readonly currentLoad: number; // 0-1
}

// Database Schema Information
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
  readonly type: 'btree' | ' hash' | ' gin' | ' gist' | ' vector' | ' other';
}

export interface ConstraintSchema {
  readonly name: string;
  readonly type: 'primary_key' | ' foreign_key' | ' unique' | ' check';
  readonly tableName: string;
  readonly columns: readonly string[];
  readonly definition: string;
}

export interface ForeignKeySchema {
  readonly name: string;
  readonly columns: readonly string[];
  readonly referencedTable: string;
  readonly referencedColumns: readonly string[];
  readonly onDelete: 'cascade' | ' set_null' | ' restrict' | ' no_action';
  readonly onUpdate: 'cascade' | ' set_null' | ' restrict' | ' no_action';
}

// Migration Types
export interface Migration {
  readonly version: string;
  readonly name: string;
  readonly up: (connection: DatabaseConnection) => Promise<void>;
  readonly down: (connection: DatabaseConnection) => Promise<void>;
  readonly timestamp: Date;
}

export interface MigrationResult {
  readonly version: string;
  readonly applied: boolean;
  readonly executionTimeMs: number;
  readonly error?: string;
}

// Database Connection Interface
export interface DatabaseConnection {
  // Connection Management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Query Operations with full type safety
  query<T = unknown>(
    sql: string,
    params?: QueryParams,
    options?: { correlationId?: string; timeoutMs?: number }
  ): Promise<QueryResult<T>>;

  execute(
    sql: string,
    params?: QueryParams,
    options?: { correlationId?: string; timeoutMs?: number }
  ): Promise<QueryResult>;

  // Transaction Support with proper isolation
  transaction<T>(
    fn: (tx: TransactionConnection) => Promise<T>,
    context?: TransactionContext
  ): Promise<T>;

  // Health and Monitoring
  health(): Promise<HealthStatus>;
  getStats(): Promise<ConnectionStats>;
  getSchema(): Promise<SchemaInfo>;

  // Migration Support
  migrate(
    migrations: readonly Migration[]
  ): Promise<readonly MigrationResult[]>;
  getCurrentMigrationVersion(): Promise<string | null>;

  // Advanced Features
  explain(sql: string, params?: QueryParams): Promise<QueryResult>;
  vacuum(): Promise<void>;
  analyze(): Promise<void>;
}

// Transaction Connection Interface
export interface TransactionConnection {
  query<T = unknown>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>>;

  execute(sql: string, params?: QueryParams): Promise<QueryResult>;

  rollback(): Promise<void>;
  commit(): Promise<void>;
  savepoint(name: string): Promise<void>;
  releaseSavepoint(name: string): Promise<void>;
  rollbackToSavepoint(name: string): Promise<void>;
}

// Storage Paradigm Interfaces with improved type safety

export interface KeyValueStorage {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<readonly string[]>;
  clear(): Promise<void>;
  size(): Promise<number>;
  mget<T = unknown>(keys: readonly string[]): Promise<ReadonlyMap<string, T>>;
  mset<T>(entries: ReadonlyMap<string, T>): Promise<void>;
  mdelete(keys: readonly string[]): Promise<number>;
}

export interface SqlStorage {
  query<T = unknown>(
    sql: string,
    params?: QueryParams,
    options?: { correlationId?: string }
  ): Promise<QueryResult<T>>;

  execute(
    sql: string,
    params?: QueryParams,
    options?: { correlationId?: string }
  ): Promise<QueryResult>;

  transaction<T>(
    fn: (tx: SqlStorage) => Promise<T>,
    context?: TransactionContext
  ): Promise<T>;

  createTable(name: string, schema: TableSchema): Promise<void>;
  dropTable(name: string, options?: { ifExists?: boolean }): Promise<void>;
  truncateTable(name: string): Promise<void>;

  createIndex(
    name: string,
    tableName: string,
    columns: readonly string[],
    options?: { unique?: boolean; type?: string }
  ): Promise<void>;

  dropIndex(name: string, options?: { ifExists?: boolean }): Promise<void>;

  getTableSchema(name: string): Promise<TableSchema | null>;
  listTables(): Promise<readonly string[]>;
}

export interface VectorStorage {
  insert(
    id: string,
    vector: readonly number[],
    metadata?: Readonly<Record<string, unknown>>
  ): Promise<void>;

  search(
    vector: readonly number[],
    options?: VectorSearchOptions
  ): Promise<readonly VectorResult[]>;

  get(id: string): Promise<VectorResult | null>;

  update(
    id: string,
    vector?: readonly number[],
    metadata?: Readonly<Record<string, unknown>>
  ): Promise<void>;

  delete(id: string): Promise<boolean>;

  createIndex(
    name: string,
    options?: {
      dimensions?: number;
      metric?: 'l2' | 'cosine' | 'dot';
      nprobes?: number;
    }
  ): Promise<void>;

  dropIndex(name: string): Promise<void>;

  count(): Promise<number>;
  getStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    indexType: string;
    memoryUsageMB: number;
  }>;
}

export interface GraphStorage {
  // Node Operations
  addNode(node: Omit<GraphNode, 'id'> & { id?: string }): Promise<string>;
  getNode(id: string): Promise<GraphNode | null>;
  updateNode(
    id: string,
    updates: Partial<Omit<GraphNode, 'id'>>
  ): Promise<void>;
  deleteNode(id: string): Promise<boolean>;

  // Edge Operations
  addEdge(edge: Omit<GraphEdge, 'id'> & { id?: string }): Promise<string>;
  getEdge(id: string): Promise<GraphEdge | null>;
  updateEdge(
    id: string,
    updates: Partial<Omit<GraphEdge, 'id'>>
  ): Promise<void>;
  deleteEdge(id: string): Promise<boolean>;

  // Traversal Operations
  getConnections(
    nodeId: string,
    direction?: 'in' | 'out' | 'both',
    edgeType?: string
  ): Promise<readonly GraphEdge[]>;

  findPath(
    fromId: string,
    toId: string,
    options?: {
      maxDepth?: number;
      edgeTypes?: readonly string[];
      algorithm?: 'bfs' | 'dfs' | 'dijkstra' | 'astar';
    }
  ): Promise<readonly GraphNode[]>;

  // Query Operations
  query(
    cypher: string,
    params?: Readonly<Record<string, unknown>>
  ): Promise<GraphResult>;

  // Schema Operations
  createNodeLabel(
    label: string,
    properties?: Readonly<Record<string, string>>
  ): Promise<void>;
  createEdgeType(
    type: string,
    properties?: Readonly<Record<string, string>>
  ): Promise<void>;

  // Statistics
  getStats(): Promise<{
    nodeCount: number;
    edgeCount: number;
    labelCounts: Readonly<Record<string, number>>;
    edgeTypeCounts: Readonly<Record<string, number>>;
  }>;
}

// Factory Interfaces
export interface DatabaseFactory {
  createConnection(config: DatabaseConfig): DatabaseConnection;
  createKeyValueStorage(config: DatabaseConfig): KeyValueStorage;
  createSqlStorage(config: DatabaseConfig): SqlStorage;
  createVectorStorage(config: DatabaseConfig): VectorStorage;
  createGraphStorage(config: DatabaseConfig): GraphStorage;
}
