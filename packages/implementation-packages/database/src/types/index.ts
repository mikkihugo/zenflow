/**
 * @fileoverview Database Domain Types - Multi-Database System Domain
 *
 * Comprehensive type definitions for database operations, connections, transactions,
 * and multi-backend database abstraction. These types define the core domain model
 * for all database operations including relational, vector, and graph databases.
 *
 * Dependencies: Only imports from ../../main for shared primitives.
 * Domain Independence: Self-contained database domain types.
 *
 * @package @claude-zen/database
 * @since 2.1.0
 * @version 1.0.0
 */

// Core primitive types (self-contained)
export type UUID = string;
export type Timestamp = Date;
export type Priority = 'low|medium|high|critical';
export type Status = 'active|inactive|pending|error';

export interface Entity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Result<T, E> {
  success: boolean;
  data?: T;
  error?: E;
}

export interface ValidationError {
  message: string;
  field?: string;
  code?: string;
}

export type Optional<T> = T|undefined;
export type NonEmptyArray<T> = [T, ...T[]];
export type Brand<T, B> = T & { __brand: B };

// =============================================================================
// CORE DATABASE TYPES
// =============================================================================

/**
 * Database engine types supported by the system
 */
export enum DatabaseType {
  SQLITE ='sqlite',
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  LANCEDB = 'lancedb',
  KUZU = 'kuzu',
  REDIS = 'redis',
  MONGODB = 'mongodb',
  ELASTICSEARCH = 'elasticsearch',
}

/**
 * Database operation types for monitoring and categorization
 */
export enum OperationType {
  SELECT = 'select',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  CREATE = 'create',
  DROP = 'drop',
  ALTER = 'alter',
  INDEX = 'index',
  TRANSACTION = 'transaction',
  BACKUP = 'backup',
  RESTORE = 'restore',
  MIGRATE = 'migrate',
  VACUUM = 'vacuum',
  ANALYZE = 'analyze',
}

/**
 * Transaction isolation levels
 */
export enum IsolationLevel {
  READ_UNCOMMITTED = 'READ_UNCOMMITTED',
  READ_COMMITTED = 'READ_COMMITTED',
  REPEATABLE_READ = 'REPEATABLE_READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

/**
 * Connection pool states
 */
export enum PoolState {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  DRAINING = 'draining',
  CLOSED = 'closed',
  ERROR = 'error',
}

// =============================================================================
// DATABASE CONFIGURATION TYPES
// =============================================================================

/**
 * Core database configuration interface
 */
export interface DatabaseConfig extends Entity {
  type: DatabaseType;
  database: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  pool?: PoolConfig;
  ssl?: SSLConfig;
  performance?: PerformanceConfig;
  monitoring?: MonitoringConfig;
  options?: DatabaseOptions;
}

/**
 * Connection pool configuration
 */
export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeout: number;
  createTimeout: number;
  destroyTimeout: number;
  idleTimeout: number;
  reapInterval: number;
  createRetryInterval: number;
  maxRetries: number;
  validateConnection: boolean;
  testOnBorrow: boolean;
  testOnReturn: boolean;
  testWhileIdle: boolean;
}

/**
 * SSL/TLS configuration
 */
export interface SSLConfig {
  enabled: boolean;
  rejectUnauthorized: boolean;
  ca?: string;
  cert?: string;
  key?: string;
  passphrase?: string;
  servername?: string;
  checkServerIdentity?: boolean;
  ciphers?: string;
  minVersion?: string;
  maxVersion?: string;
}

/**
 * Performance optimization configuration
 */
export interface PerformanceConfig {
  queryTimeout: number;
  connectionTimeout: number;
  statementTimeout: number;
  lockTimeout: number;
  maxQueryComplexity: number;
  enableQueryPlan: boolean;
  cacheSize: number;
  walMode?: boolean; // SQLite WAL mode
  synchronous?: 'off|normal|full'; // SQLite synchronous mode
  journalMode?: 'delete|truncate|persist|memory|wal';
}

/**
 * Database monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  logQueries: boolean;
  logSlowQueries: boolean;
  slowQueryThreshold: number;
  trackConnections: boolean;
  trackTransactions: boolean;
  metricsInterval: number;
  healthCheckInterval: number;
  enableProfiling: boolean;
}

/**
 * Database-specific options
 */
export interface DatabaseOptions {
  // PostgreSQL specific
  schema?: string;
  searchPath?: string[];
  applicationName?: string;

  // MySQL specific
  charset?: string;
  collation?: string;
  timezone?: string;

  // SQLite specific
  readonly?: boolean;
  fileMustExist?: boolean;
  busyTimeout?: number;

  // MongoDB specific
  authSource?: string;
  compressors?: string[];

  // Custom options
  [key: string]: unknown;
}

// =============================================================================
// DATABASE ADAPTER INTERFACE
// =============================================================================

/**
 * Core database adapter interface
 */
export interface DatabaseAdapter {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Query operations
  query<T = unknown>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>>;
  execute(sql: string, params?: QueryParams): Promise<ExecuteResult>;

  // Transaction support
  transaction<T>(
    fn: TransactionFn<T>,
    options?: TransactionOptions
  ): Promise<T>;

  // Schema operations
  getSchema(): Promise<SchemaInfo>;
  createTable(definition: TableDefinition): Promise<void>;
  dropTable(name: string): Promise<void>;
  alterTable(name: string, changes: TableAlteration[]): Promise<void>;

  // Index operations
  createIndex(definition: IndexDefinition): Promise<void>;
  dropIndex(name: string): Promise<void>;

  // Maintenance operations
  backup(options: BackupOptions): Promise<BackupResult>;
  restore(options: RestoreOptions): Promise<void>;
  vacuum(): Promise<VacuumResult>;
  analyze(): Promise<AnalyzeResult>;

  // Health and monitoring
  health(): Promise<HealthStatus>;
  getStats(): Promise<DatabaseStats>;
  getConnectionStats(): Promise<ConnectionStats>;
}

/**
 * Query parameters type
 */
export type QueryParams = Array<QueryValue>|Record<string, QueryValue>;

/**
 * Query value types
 */
export type QueryValue =|string|number|boolean|Date|Buffer|null|undefined;

/**
 * Transaction function type
 */
export type TransactionFn<T> = (tx: TransactionContext) => Promise<T>;

// =============================================================================
// QUERY AND EXECUTION RESULTS
// =============================================================================

/**
 * Query result interface
 */
export interface QueryResult<T = unknown> {
  rows: T[];
  fields: FieldInfo[];
  rowCount: number;
  executionTime: number;
  queryPlan?: QueryPlan;
  metadata: QueryMetadata;
}

/**
 * Execution result interface
 */
export interface ExecuteResult {
  affectedRows: number;
  insertId?: QueryValue;
  executionTime: number;
  warnings: Warning[];
  metadata: ExecutionMetadata;
}

/**
 * Field information
 */
export interface FieldInfo {
  name: string;
  type: string;
  dataType: DataType;
  nullable: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  defaultValue?: QueryValue;
  constraints: FieldConstraint[];
}

/**
 * Data types supported across databases
 */
export enum DataType {
  // Numeric types
  INTEGER ='integer',
  BIGINT = 'bigint',
  SMALLINT = 'smallint',
  DECIMAL = 'decimal',
  NUMERIC = 'numeric',
  REAL = 'real',
  DOUBLE = 'double',
  FLOAT = 'float',

  // String types
  CHAR = 'char',
  VARCHAR = 'varchar',
  TEXT = 'text',
  BLOB = 'blob',

  // Date/Time types
  DATE = 'date',
  TIME = 'time',
  TIMESTAMP = 'timestamp',
  DATETIME = 'datetime',
  INTERVAL = 'interval',

  // Boolean type
  BOOLEAN = 'boolean',

  // JSON type
  JSON = 'json',
  JSONB = 'jsonb',

  // Array type
  ARRAY = 'array',

  // UUID type
  UUID = 'uuid',

  // Vector type (for vector databases)
  VECTOR = 'vector',

  // Binary types
  BINARY = 'binary',
  VARBINARY = 'varbinary',
}

/**
 * Field constraints
 */
export enum FieldConstraint {
  PRIMARY_KEY = 'primary_key',
  FOREIGN_KEY = 'foreign_key',
  UNIQUE = 'unique',
  NOT_NULL = 'not_null',
  CHECK = 'check',
  DEFAULT = 'default',
  AUTO_INCREMENT = 'auto_increment',
}

/**
 * Query execution plan
 */
export interface QueryPlan {
  cost: number;
  rows: number;
  executionTime: number;
  nodes: PlanNode[];
  optimizations: string[];
}

/**
 * Query plan node
 */
export interface PlanNode {
  type: string;
  operation: string;
  table?: string;
  index?: string;
  cost: number;
  rows: number;
  children: PlanNode[];
}

/**
 * Query metadata
 */
export interface QueryMetadata {
  queryId: UUID;
  startTime: Timestamp;
  endTime: Timestamp;
  database: string;
  user?: string;
  statement: string;
  parametersHash?: string;
  cacheHit: boolean;
  indexesUsed: string[];
  tablesAccessed: string[];
}

/**
 * Execution metadata
 */
export interface ExecutionMetadata {
  executionId: UUID;
  startTime: Timestamp;
  endTime: Timestamp;
  database: string;
  user?: string;
  statement: string;
  transactionId?: UUID;
  autocommit: boolean;
}

/**
 * Warning information
 */
export interface Warning {
  code: string;
  message: string;
  severity: 'info|warning|error';
  sqlState?: string;
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

/**
 * Transaction context interface
 */
export interface TransactionContext {
  id: UUID;
  isolationLevel: IsolationLevel;
  readOnly: boolean;
  startTime: Timestamp;

  // Transaction operations
  query<T = unknown>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>>;
  execute(sql: string, params?: QueryParams): Promise<ExecuteResult>;

  // Transaction control
  commit(): Promise<void>;
  rollback(): Promise<void>;
  savepoint(name: string): Promise<void>;
  rollbackTo(name: string): Promise<void>;
  releaseSavepoint(name: string): Promise<void>;

  // State information
  isActive(): boolean;
  isCommitted(): boolean;
  isRolledBack(): boolean;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
  readOnly?: boolean;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  deferrable?: boolean;
}

/**
 * Transaction states
 */
export enum TransactionState {
  ACTIVE = 'active',
  COMMITTED = 'committed',
  ABORTED = 'aborted',
  PREPARING = 'preparing',
  PREPARED = 'prepared',
}

// =============================================================================
// SCHEMA DEFINITION TYPES
// =============================================================================

/**
 * Database schema information
 */
export interface SchemaInfo {
  name: string;
  version: string;
  lastModified: Timestamp;
  tables: TableInfo[];
  views: ViewInfo[];
  indexes: IndexInfo[];
  procedures: ProcedureInfo[];
  functions: FunctionInfo[];
  triggers: TriggerInfo[];
  constraints: ConstraintInfo[];
}

/**
 * Table information
 */
export interface TableInfo {
  name: string;
  schema?: string;
  type: 'table|view|materialized_view|temporary';
  columns: ColumnInfo[];
  constraints: ConstraintInfo[];
  indexes: string[];
  rowCount?: number;
  dataSize?: number;
  indexSize?: number;
  lastModified?: Timestamp;
  comment?: string;
}

/**
 * Column information
 */
export interface ColumnInfo {
  name: string;
  position: number;
  dataType: DataType;
  nullable: boolean;
  defaultValue?: QueryValue;
  maxLength?: number;
  precision?: number;
  scale?: number;
  characterSet?: string;
  collation?: string;
  comment?: string;
  constraints: FieldConstraint[];
}

/**
 * View information
 */
export interface ViewInfo {
  name: string;
  schema?: string;
  definition: string;
  columns: ColumnInfo[];
  dependencies: string[];
  updatable: boolean;
  comment?: string;
}

/**
 * Index information
 */
export interface IndexInfo {
  name: string;
  table: string;
  schema?: string;
  type: IndexType;
  columns: IndexColumn[];
  unique: boolean;
  partial: boolean;
  expression?: string;
  size?: number;
  usageStats?: IndexUsageStats;
  comment?: string;
}

/**
 * Index types
 */
export enum IndexType {
  BTREE = 'btree',
  HASH = 'hash',
  GIN = 'gin',
  GIST = 'gist',
  BRIN = 'brin',
  SPGIST = 'spgist',
  FULLTEXT = 'fulltext',
  SPATIAL = 'spatial',
}

/**
 * Index column specification
 */
export interface IndexColumn {
  name: string;
  position: number;
  direction: 'asc|desc'';
  nullsFirst?: boolean;
  expression?: string;
}

/**
 * Index usage statistics
 */
export interface IndexUsageStats {
  scans: number;
  tuplesRead: number;
  tuplesReturned: number;
  lastUsed?: Timestamp;
  efficiency: number;
}

// =============================================================================
// SCHEMA OPERATIONS TYPES
// =============================================================================

/**
 * Table definition for creation
 */
export interface TableDefinition {
  name: string;
  schema?: string;
  columns: ColumnDefinition[];
  constraints?: TableConstraint[];
  indexes?: IndexDefinition[];
  options?: TableOptions;
  comment?: string;
}

/**
 * Column definition
 */
export interface ColumnDefinition {
  name: string;
  dataType: DataType;
  nullable?: boolean;
  defaultValue?: QueryValue;
  maxLength?: number;
  precision?: number;
  scale?: number;
  autoIncrement?: boolean;
  unique?: boolean;
  comment?: string;
}

/**
 * Table constraints
 */
export interface TableConstraint {
  name?: string;
  type: ConstraintType;
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  onUpdate?: ReferentialAction;
  onDelete?: ReferentialAction;
  checkExpression?: string;
}

/**
 * Constraint types
 */
export enum ConstraintType {
  PRIMARY_KEY = 'primary_key',
  FOREIGN_KEY = 'foreign_key',
  UNIQUE = 'unique',
  CHECK = 'check',
  NOT_NULL = 'not_null',
}

/**
 * Referential actions
 */
export enum ReferentialAction {
  CASCADE = 'cascade',
  SET_NULL = 'set_null',
  SET_DEFAULT = 'set_default',
  RESTRICT = 'restrict',
  NO_ACTION = 'no_action',
}

/**
 * Index definition
 */
export interface IndexDefinition {
  name: string;
  table: string;
  columns: string[];
  type?: IndexType;
  unique?: boolean;
  partial?: boolean;
  where?: string;
  include?: string[];
  options?: IndexOptions;
}

/**
 * Table options
 */
export interface TableOptions {
  engine?: string; // MySQL
  charset?: string;
  collation?: string;
  compression?: string;
  rowFormat?: string;
  autoIncrement?: number;
  partitioning?: PartitioningOptions;
  [key: string]: unknown;
}

/**
 * Index options
 */
export interface IndexOptions {
  fillFactor?: number;
  deduplicate?: boolean;
  bufferingMode?: string;
  fastUpdate?: boolean;
  [key: string]: unknown;
}

// =============================================================================
// VECTOR DATABASE TYPES
// =============================================================================

/**
 * Vector database configuration (LanceDB)
 */
export interface VectorConfig extends DatabaseConfig {
  type: DatabaseType.LANCEDB;
  vectorSize: number;
  metricType: VectorMetric;
  indexType: VectorIndexType;
  vectorOptions: VectorOptions;
}

/**
 * Vector similarity metrics
 */
export enum VectorMetric {
  COSINE = 'cosine',
  EUCLIDEAN = 'euclidean',
  DOT_PRODUCT = 'dot_product',
  MANHATTAN = 'manhattan',
  HAMMING = 'hamming',
  JACCARD = 'jaccard',
}

/**
 * Vector index types
 */
export enum VectorIndexType {
  IVF_FLAT = 'ivf_flat',
  IVF_PQ = 'ivf_pq',
  HNSW = 'hnsw',
  LSH = 'lsh',
  ANNOY = 'annoy',
}

/**
 * Vector database options
 */
export interface VectorOptions {
  numProbes?: number;
  efConstruction?: number;
  efSearch?: number;
  maxConnections?: number;
  numCentroids?: number;
  numSubQuantizers?: number;
  bitsPerSubQuantizer?: number;
}

/**
 * Vector document/record
 */
export interface VectorDocument extends Entity {
  vector: Float32Array|number[];
  metadata?: Record<string, QueryValue>;
  distance?: number; // populated in search results
  score?: number; // similarity score
}

/**
 * Vector search options
 */
export interface VectorSearchOptions {
  limit: number;
  offset?: number;
  threshold?: number;
  filter?: VectorFilter;
  includeMetadata?: boolean;
  includeVector?: boolean;
  preFilter?: boolean;
}

/**
 * Vector filtering options
 */
export interface VectorFilter {
  conditions: VectorCondition[];
  operator:'and|or';
}

/**
 * Vector filter condition
 */
export interface VectorCondition {
  field: string;
  operator:|''eq|ne|gt|gte|lt|lte|in | nin'|contains';
  value: QueryValue|QueryValue[];
}

// =============================================================================
// GRAPH DATABASE TYPES
// =============================================================================

/**
 * Graph database configuration (Kuzu)
 */
export interface GraphConfig extends DatabaseConfig {
  type: DatabaseType.KUZU;
  bufferPoolSize: string;
  maxNumThreads: number;
  enableCompression: boolean;
  graphOptions: GraphOptions;
}

/**
 * Graph database options
 */
export interface GraphOptions {
  defaultLabelCapacity?: number;
  stringColumnPageSize?: string;
  bmwRegionSize?: string;
  enableZoneMap?: boolean;
  enableStatistics?: boolean;
}

/**
 * Graph node definition
 */
export interface GraphNode extends Entity {
  label: string;
  properties: Record<string, QueryValue>;
}

/**
 * Graph relationship definition
 */
export interface GraphRelationship extends Entity {
  type: string;
  fromNode: UUID;
  toNode: UUID;
  properties?: Record<string, QueryValue>;
  direction:'incoming|outgoing|both';
}

/**
 * Graph query options
 */
export interface GraphQueryOptions {
  maxDepth?: number;
  direction?: 'in|out|both';
  nodeLabels?: string[];
  relationshipTypes?: string[];
  properties?: Record<string, QueryValue>;
  limit?: number;
  offset?: number;
}

/**
 * Graph traversal result
 */
export interface GraphTraversalResult {
  paths: GraphPath[];
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  executionTime: number;
  metadata: TraversalMetadata;
}

/**
 * Graph path representation
 */
export interface GraphPath {
  nodes: UUID[];
  relationships: UUID[];
  length: number;
  weight?: number;
}

/**
 * Traversal metadata
 */
export interface TraversalMetadata {
  nodesTraversed: number;
  relationshipsTraversed: number;
  maxDepthReached: number;
  algorithm?: string;
  pruned: boolean;
}

// =============================================================================
// STATISTICS AND MONITORING TYPES
// =============================================================================

/**
 * Database statistics
 */
export interface DatabaseStats {
  uptime: number;
  connections: ConnectionStats;
  queries: QueryStats;
  transactions: TransactionStats;
  storage: StorageStats;
  cache: CacheStats;
  locks: LockStats;
  replication?: ReplicationStats;
}

/**
 * Connection statistics
 */
export interface ConnectionStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  maxUsed: number;
  utilization: number;
  averageAcquisitionTime: number;
  averageConnectionDuration: number;
  failedConnections: number;
  poolState: PoolState;
}

/**
 * Query statistics
 */
export interface QueryStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageExecutionTime: number;
  slowQueries: number;
  cachedQueries: number;
  cacheHitRatio: number;
  queriesPerSecond: number;
  dataTransferred: number;
}

/**
 * Transaction statistics
 */
export interface TransactionStats {
  totalTransactions: number;
  committedTransactions: number;
  rolledBackTransactions: number;
  averageTransactionTime: number;
  activeTransactions: number;
  deadlocks: number;
  lockWaitTime: number;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalSize: number;
  dataSize: number;
  indexSize: number;
  tempSize: number;
  freeSpace: number;
  fragmentation: number;
  compressionRatio?: number;
  tableCount: number;
  indexCount: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  utilization: number;
  hitRatio: number;
  missRatio: number;
  evictions: number;
  hitCount: number;
  missCount: number;
  averageLoadTime: number;
}

/**
 * Lock statistics
 */
export interface LockStats {
  activeLocks: number;
  waitingLocks: number;
  deadlocks: number;
  lockWaits: number;
  averageWaitTime: number;
  maxWaitTime: number;
  lockTimeouts: number;
}

/**
 * Replication statistics
 */
export interface ReplicationStats {
  role: 'primary|secondary|standby';
  lag: number;
  lastSyncTime: Timestamp;
  replicatedTransactions: number;
  failedReplications: number;
  syncStatus: 'syncing|in_sync|delayed|error';
}

// =============================================================================
// BACKUP AND MAINTENANCE TYPES
// =============================================================================

/**
 * Backup options
 */
export interface BackupOptions {
  path: string;
  compression: boolean;
  format: BackupFormat;
  tables?: string[];
  excludeTables?: string[];
  schemaOnly?: boolean;
  dataOnly?: boolean;
  parallel?: number;
  checksum?: boolean;
}

/**
 * Backup formats
 */
export enum BackupFormat {
  SQL = 'sql',
  BINARY = 'binary',
  TAR = 'tar',
  DIRECTORY = 'directory',
  CUSTOM = 'custom',
}

/**
 * Backup result
 */
export interface BackupResult {
  success: boolean;
  path: string;
  size: number;
  duration: number;
  checksum?: string;
  tablesBackedUp: number;
  rowsBackedUp: number;
  warnings: Warning[];
}

/**
 * Restore options
 */
export interface RestoreOptions {
  path: string;
  dropExisting?: boolean;
  createDatabase?: boolean;
  tables?: string[];
  excludeTables?: string[];
  parallel?: number;
  continueOnError?: boolean;
}

/**
 * Vacuum result
 */
export interface VacuumResult {
  tablesProcessed: number;
  spaceFreed: number;
  duration: number;
  indexesRebuilt: number;
  statistics: VacuumStats;
}

/**
 * Vacuum statistics
 */
export interface VacuumStats {
  pagesFreed: number;
  tuplesDeleted: number;
  indexScans: number;
  pagesExamined: number;
  oldestXmin?: string;
}

/**
 * Analyze result
 */
export interface AnalyzeResult {
  tablesAnalyzed: number;
  duration: number;
  statisticsUpdated: boolean;
  improvements: AnalyzeImprovement[];
}

/**
 * Analyze improvement recommendations
 */
export interface AnalyzeImprovement {
  type: 'index|query|schema|configuration';
  priority: Priority;
  description: string;
  estimatedImpact: number;
  recommendation: string;
}

// =============================================================================
// ERROR AND RESULT TYPES
// =============================================================================

/**
 * Database-specific error types
 */
export interface DatabaseError extends ValidationError {
  type: 'DatabaseError';
  category: 'connection|query|transaction|schema|constraint';
  sqlState?: string;
  errorCode?: string|number;
  databaseType: DatabaseType;
  operation?: OperationType;
}

/**
 * Connection-specific error types
 */
export interface ConnectionError extends DatabaseError {
  category:'connection';
  host?: string;
  port?: number;
  database?: string;
  timeout?: number;
}

/**
 * Query-specific error types
 */
export interface QueryError extends DatabaseError {
  category: 'query';
  query?: string;
  parameters?: QueryParams;
  line?: number;
  column?: number;
  position?: number;
}

/**
 * Transaction-specific error types
 */
export interface TransactionError extends DatabaseError {
  category: 'transaction';
  transactionId?: UUID;
  isolationLevel?: IsolationLevel;
  deadlockDetected?: boolean;
}

/**
 * Schema-specific error types
 */
export interface SchemaError extends DatabaseError {
  category: 'schema';
  objectType?: 'table|column|index|constraint';
  objectName?: string;
}

/**
 * Constraint violation error types
 */
export interface ConstraintError extends DatabaseError {
  category: 'constraint';
  constraintType: ConstraintType;
  constraintName?: string;
  tableName?: string;
  columnName?: string;
  violatingValue?: QueryValue;
}

/**
 * Result types for database operations
 */
export type DatabaseResult<T> = Result<T, DatabaseError>;
export type QueryExecutionResult<T> = Result<QueryResult<T>, QueryError>;
export type TransactionResult<T> = Result<T, TransactionError>;
export type SchemaOperationResult = Result<void, SchemaError>;

// =============================================================================
// HEALTH STATUS TYPES
// =============================================================================

/**
 * Database health status
 */
export interface HealthStatus {
  status: 'healthy|degraded|critical|offline';
  score: number; // 0.0 - 1.0
  checks: HealthCheck[];
  lastCheck: Timestamp;
  nextCheck: Timestamp;
  uptime: number;
}

/**
 * Individual health checks
 */
export interface HealthCheck {
  name: string;
  status: 'pass|warn|fail';
  duration: number;
  output?: string;
  observedValue?: number;
  observedUnit?: string;
  threshold?: number;
  details?: Record<string, unknown>;
}

// =============================================================================
// ADDITIONAL UTILITY TYPES
// =============================================================================

/**
 * Database migration information
 */
export interface MigrationInfo {
  version: string;
  description: string;
  applied: boolean;
  appliedAt?: Timestamp;
  checksum: string;
  executionTime?: number;
  script: string;
}

/**
 * Table alteration operations
 */
export interface TableAlteration {
  type:|'add_column|drop_column|modify_column|rename_column|add_constraint|drop_constraint';
  columnName?: string;
  newColumnName?: string;
  columnDefinition?: ColumnDefinition;
  constraint?: TableConstraint;
  constraintName?: string;
}

/**
 * Procedure information
 */
export interface ProcedureInfo {
  name: string;
  schema?: string;
  parameters: ProcedureParameter[];
  returnType?: string;
  language: string;
  definition: string;
  comment?: string;
}

/**
 * Function information
 */
export interface FunctionInfo {
  name: string;
  schema?: string;
  parameters: FunctionParameter[];
  returnType: string;
  language: string;
  definition: string;
  comment?: string;
}

/**
 * Trigger information
 */
export interface TriggerInfo {
  name: string;
  table: string;
  schema?: string;
  event: 'INSERT|UPDATE|DELETE';
  timing: 'BEFORE|AFTER'||INSTEAD OF';
  definition: string;
  enabled: boolean;
  comment?: string;
}

/**
 * Constraint information
 */
export interface ConstraintInfo {
  name: string;
  type: ConstraintType;
  table: string;
  schema?: string;
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  definition: string;
  enabled: boolean;
}

/**
 * Procedure parameter
 */
export interface ProcedureParameter {
  name: string;
  dataType: DataType;
  mode: 'IN|OUT|INOUT';
  defaultValue?: QueryValue;
}

/**
 * Function parameter
 */
export interface FunctionParameter {
  name: string;
  dataType: DataType;
  defaultValue?: QueryValue;
}

/**
 * Partitioning options
 */
export interface PartitioningOptions {
  type: 'range|list|hash|key';
  column: string;
  partitions: PartitionDefinition[];
}

/**
 * Partition definition
 */
export interface PartitionDefinition {
  name: string;
  expression: string;
  tablespace?: string;
}

// =============================================================================
// CONSTANTS AND DEFAULTS
// =============================================================================

/**
 * Database system constants
 */
export const DatabaseConstants = {
  // Default timeouts (milliseconds)
  DEFAULT_CONNECTION_TIMEOUT: 30000,
  DEFAULT_QUERY_TIMEOUT: 60000,
  DEFAULT_TRANSACTION_TIMEOUT: 120000,
  DEFAULT_HEALTH_CHECK_TIMEOUT: 5000,

  // Default pool settings
  DEFAULT_POOL_MIN: 2,
  DEFAULT_POOL_MAX: 10,
  DEFAULT_POOL_ACQUIRE_TIMEOUT: 10000,
  DEFAULT_POOL_IDLE_TIMEOUT: 300000,

  // Query limits
  MAX_QUERY_SIZE: 1024 * 1024, // 1MB
  MAX_PARAMETER_COUNT: 1000,
  MAX_RESULT_SET_SIZE: 100000,

  // Monitoring intervals
  DEFAULT_STATS_INTERVAL: 60000, // 1 minute
  DEFAULT_HEALTH_CHECK_INTERVAL: 30000, // 30 seconds

  // Retry settings
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 30000,
} as const;

/**
 * Default database configurations by type
 */
export const DefaultDatabaseConfigs: Record<
  DatabaseType,
  Partial<DatabaseConfig>
> = {
  [DatabaseType.SQLITE]: {
    type: DatabaseType.SQLITE,
    pool: {
      min: 1,
      max: 1,
      acquireTimeout: 10000,
      createTimeout: 10000,
      destroyTimeout: 5000,
      idleTimeout: 300000,
      reapInterval: 1000,
      createRetryInterval: 200,
      maxRetries: 3,
      validateConnection: false,
      testOnBorrow: false,
      testOnReturn: false,
      testWhileIdle: false,
    },
    performance: {
      queryTimeout: 30000,
      connectionTimeout: 10000,
      statementTimeout: 30000,
      lockTimeout: 10000,
      maxQueryComplexity: 1000,
      enableQueryPlan: false,
      cacheSize: 2000,
      walMode: true,
      synchronous: 'normal',
      journalMode: 'wal',
    },
  },

  [DatabaseType.POSTGRESQL]: {
    type: DatabaseType.POSTGRESQL,
    port: 5432,
    pool: {
      min: 2,
      max: 10,
      acquireTimeout: 10000,
      createTimeout: 10000,
      destroyTimeout: 5000,
      idleTimeout: 300000,
      reapInterval: 1000,
      createRetryInterval: 500,
      maxRetries: 3,
      validateConnection: true,
      testOnBorrow: true,
      testOnReturn: false,
      testWhileIdle: true,
    },
  },

  [DatabaseType.MYSQL]: {
    type: DatabaseType.MYSQL,
    port: 3306,
    pool: {
      min: 2,
      max: 10,
      acquireTimeout: 10000,
      createTimeout: 10000,
      destroyTimeout: 5000,
      idleTimeout: 300000,
      reapInterval: 1000,
      createRetryInterval: 500,
      maxRetries: 3,
      validateConnection: true,
      testOnBorrow: true,
      testOnReturn: false,
      testWhileIdle: true,
    },
  },

  [DatabaseType.LANCEDB]: {
    type: DatabaseType.LANCEDB,
  },

  [DatabaseType.KUZU]: {
    type: DatabaseType.KUZU,
  },

  [DatabaseType.REDIS]: {
    type: DatabaseType.REDIS,
    port: 6379,
  },

  [DatabaseType.MONGODB]: {
    type: DatabaseType.MONGODB,
    port: 27017,
  },

  [DatabaseType.ELASTICSEARCH]: {
    type: DatabaseType.ELASTICSEARCH,
    port: 9200,
  },
} as const;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guards for runtime type checking
 */
export const DatabaseTypeGuards = {
  isDatabaseConfig: (obj: unknown): obj is DatabaseConfig => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'type' in obj &&
      'database' in obj &&
      Object.values(DatabaseType).includes((obj as any).type)
    );
  },

  isQueryResult: (obj: unknown): obj is QueryResult => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'rows' in obj &&
      'fields' in obj &&
      'rowCount' in obj &&
      'executionTime' in obj
    );
  },

  isVectorDocument: (obj: unknown): obj is VectorDocument => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'vector'in obj &&
      (Array.isArray((obj as any).vector)||(obj as any).vector instanceof Float32Array)
    );
  },

  isGraphNode: (obj: unknown): obj is GraphNode => {
    return (
      typeof obj ==='object' &&
      obj !== null &&
      'label' in obj &&
      'properties' in obj &&
      typeof (obj as any).label === 'string'
    );
  },

  isDatabaseError: (obj: unknown): obj is DatabaseError => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'type' in obj &&
      (obj as any).type === 'DatabaseError' &&
      'category' in obj
    );
  },
} as const;

// Export default for convenience
export default {
  // Enums
  DatabaseType,
  OperationType,
  IsolationLevel,
  PoolState,
  DataType,
  FieldConstraint,
  TransactionState,
  ConstraintType,
  ReferentialAction,
  IndexType,
  VectorMetric,
  VectorIndexType,
  BackupFormat,

  // Constants
  DatabaseConstants,
  DefaultDatabaseConfigs,

  // Type guards
  DatabaseTypeGuards,
};
