/**
 * Unified Data Access Layer (DAL) - Core Interfaces.
 *
 * Provides generic interfaces for standardizing data access across all data sources.
 * Including Kuzu (graph), LanceDB (vector), coordination databases, memory stores,
 * relational databases, and any other data persistence mechanisms.
 */

// DatabaseType already defined elsewhere, removing duplicate

/**
 * Generic repository interface for standardized data access.
 *
 * @template T The entity type this repository manages.
 * @example
 */
/**
 * @file Database layer: interfaces.
 */

// Import logger interface
export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

// Database adapter interface
export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = unknown>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>>;
  execute(sql: string, params?: any[]): Promise<any>;
  transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
  isConnected(): boolean;
  health(): Promise<HealthStatus>;
  getSchema(): Promise<any>;
  getConnectionStats(): Promise<any>;
}

// Query parameters type
export type QueryParams = any[] | Record<string, any>;

// Query result type
export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  fields?: any[];
}

// Health status type
export interface HealthStatus {
  healthy: boolean;
  isHealthy: boolean;
  status: string;
  score: number;
  details: Record<string, any>;
  lastCheck: Date;
  errors?: string[];
}

// Core database types
export type EntityType = 'relational'|'vector'|'graph'|'memory'|'coordination';
export type DatabaseType = 'sqlite'|'lancedb'|'kuzu';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: SortCriteria[];
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CustomQuery {
  sql?: string;
  cypher?: string;
  vector?: number[];
  params?: any[];
  options?: Record<string, any>;
}

export interface DatabaseMetadata {
  type: DatabaseType;
  version: string;
  tables?: string[];
  collections?: string[];
  nodes?: string[];
}

export interface TransactionOperation {
  type: 'query|execute|create|update|delete|custom';
  sql?: string;
  cypher?: string;
  params?: any[];
  entity?: any;
  updates?: any;
  customQuery?: CustomQuery;
}

export interface Repository<T> {
  /** Find entity by ID */
  findById(id: string|number): Promise<T|null>;

  /** Find entities by criteria with optional sorting and pagination */
  findBy(criteria: Partial<T>, options?: QueryOptions): Promise<T[]>;

  /** Find all entities with optional sorting and pagination */
  findAll(options?: QueryOptions): Promise<T[]>;

  /** Create a new entity */
  create(entity: Omit<T,'id'>): Promise<T>;

  /** Update an existing entity */
  update(id: string|number, updates: Partial<T>): Promise<T>;

  /** Delete an entity by ID */
  delete(id: string|number): Promise<boolean>;

  /** Count entities matching criteria */
  count(criteria?: Partial<T>): Promise<number>;

  /** Check if entity exists */
  exists(id: string|number): Promise<boolean>;

  /** Execute custom query specific to the underlying database */
  executeCustomQuery<R = any>(query: CustomQuery): Promise<R>;
}

/**
 * Data Access Object interface for domain-specific operations.
 *
 * @template T The entity type.
 * @example
 */
export interface DataAccessObject<T> {
  /** Get repository for basic CRUD operations */
  getRepository(): Repository<T>;

  /** Execute transaction with multiple operations */
  executeTransaction<R>(operations: TransactionOperation[]): Promise<R>;

  /** Get database-specific metadata */
  getMetadata(): Promise<DatabaseMetadata>;

  /** Perform health check */
  healthCheck(): Promise<HealthStatus>;

  /** Get performance metrics */
  getMetrics(): Promise<PerformanceMetrics>;
}

/**
 * Specialized interface for graph databases (Kuzu).
 *
 * @example
 */
export interface GraphRepository<T> extends Repository<T> {
  /** Execute graph traversal query */
  traverse(
    startNode: string|number,
    relationshipType: string,
    maxDepth?: number
  ): Promise<GraphTraversalResult>;

  /** Find nodes by label and properties */
  findNodesByLabel(
    label: string,
    properties?: Record<string, unknown>
  ): Promise<GraphNode[]>;

  /** Find relationships between nodes */
  findRelationships(
    fromNodeId: string|number,
    toNodeId: string|number,
    relationshipType?: string
  ): Promise<GraphRelationship[]>;

  /** Create relationship between nodes */
  createRelationship(
    fromNodeId: string|number,
    toNodeId: string|number,
    relationshipType: string,
    properties?: Record<string, unknown>
  ): Promise<GraphRelationship>;

  /** Execute Cypher query */
  executeCypher(
    cypher: string,
    parameters?: Record<string, unknown>
  ): Promise<GraphQueryResult>;
}

/**
 * Specialized interface for vector databases (LanceDB).
 *
 * @example
 */
export interface VectorRepository<T> extends Repository<T> {
  /** Perform vector similarity search */
  similaritySearch(
    queryVector: number[],
    options?: VectorSearchOptions
  ): Promise<VectorSearchResult<T>[]>;

  /** Add vectors in batch */
  addVectors(vectors: VectorDocument<T>[]): Promise<VectorInsertResult>;

  /** Create vector index */
  createIndex(config: VectorIndexConfig): Promise<void>;

  /** Get vector statistics */
  getVectorStats(): Promise<VectorStats>;

  /** Perform clustering operation */
  cluster(options?: ClusteringOptions): Promise<ClusterResult>;
}

/**
 * Specialized interface for memory stores.
 *
 * @example
 */
export interface MemoryRepository<T> extends Repository<T> {
  /** Set TTL (time to live) for an entity */
  setTTL(id: string|number, ttlSeconds: number): Promise<void>;

  /** Get TTL for an entity */
  getTTL(id: string|number): Promise<number|null>;

  /** Cache entity with optional TTL */
  cache(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /** Get cached entity */
  getCached(key: string): Promise<T|null>;

  /** Clear cache */
  clearCache(pattern?: string): Promise<number>;

  /** Get memory usage statistics */
  getMemoryStats(): Promise<MemoryStats>;
}

/**
 * Legacy aliases for backward compatibility.
 *
 * @example
 */
export interface Dao<T> extends Repository<T> {}
export interface Manager<T> extends DataAccessObject<T> {}

// Specialized DAOs
export interface GraphDao<T> extends GraphRepository<T> {}
export interface VectorDao<T> extends VectorRepository<T> {}
export interface MemoryDao<T> extends MemoryRepository<T> {}
export interface CoordinationDao<T> extends CoordinationRepository<T> {}

/**
 * Common entity types for coordination DAOs - provides type safety
 * and reduces repetition across the codebase.
 *
 * @example
 */
export interface SessionEntity {
  id: string;
  name: string;
  createdAt: Date;
  lastAccessedAt: Date;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface CheckpointEntity {
  id: string;
  sessionId: string;
  timestamp: Date;
  checksum: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Specialized interface for agent memory management.
 * Used by hooks system and other agent coordination features.
 *
 * @example
 */
export interface AgentMemoryDao<T> extends CoordinationDao<T> {
  /** Store memory for a specific agent */
  storeAgentMemory(agentId: string, key: string, value: unknown): Promise<void>;

  /** Retrieve specific memory for an agent */
  getAgentMemory(
    agentId: string,
    key: string
  ): Promise<{ key: string; value: unknown }|null>;

  /** Get all memory for an agent */
  getAllMemory(
    agentId: string
  ): Promise<Array<{ key: string; value: unknown }>>;

  /** Update agent status */
  updateAgentStatus(agentId: string, status: string): Promise<void>;

  /** Clear agent memory */
  clearAgentMemory(agentId: string, pattern?: string): Promise<number>;
}

// Utility type aliases for common coordination DAO patterns.
export type SessionCoordinationDao = CoordinationDao<SessionEntity>;
export type CheckpointCoordinationDao = CoordinationDao<CheckpointEntity>;
export type EventCoordinationDao<T = any> = CoordinationDao<
  CoordinationEvent<T>
>;
export type AgentMemoryCoordinationDao<T = any> = AgentMemoryDao<
  CoordinationEvent<T>
>;
export type GenericCoordinationDao<T = any> = CoordinationDao<T>;

/**
 * Entity type enums for strongly typed entity management.
 */
export enum EntityTypes {
  User ='User',
  Product = 'Product',
  Order = 'Order',
  Document = 'Document',
  Task = 'Task',
  Agent = 'Agent',
  Swarm = 'Swarm',
  Memory = 'Memory',
  Vector = 'Vector',
  Graph = 'Graph',
}

/**
 * Database type enums for database selection.
 */
export enum DatabaseTypes {
  PostgreSQL = 'postgresql',
  MySQL = 'mysql',
  SQLite = 'sqlite',
  MongoDB = 'mongodb',
  Redis = 'redis',
  Memory = 'memory',
  Kuzu = 'kuzu',
  LanceDB = 'lancedb',
  Coordination = 'coordination',
}

/**
 * Database query types for query building.
 *
 * @example
 */
export interface DatabaseQuery {
  type: 'select|insert|update|delete|aggregate';
  table?: string;
  columns?: string[];
  conditions?: Record<string, unknown>;
  joins?: Array<{
    type: 'inner|left|right|full';
    table: string;
    on: string;
  }>;
  orderBy?: SortCriteria[];
  limit?: number;
  offset?: number;
  groupBy?: string[];
  having?: Record<string, unknown>;
}

/**
 * Specialized interface for coordination databases.
 *
 * @example
 */
export interface CoordinationRepository<T> extends Repository<T> {
  /** Lock resource for coordination */
  acquireLock(
    resourceId: string,
    lockTimeout?: number
  ): Promise<CoordinationLock>;

  /** Release lock */
  releaseLock(lockId: string): Promise<void>;

  /** Subscribe to changes */
  subscribe(
    pattern: string,
    callback: (change: CoordinationChange<T>) => void
  ): Promise<string>;

  /** Unsubscribe from changes */
  unsubscribe(subscriptionId: string): Promise<void>;

  /** Publish coordination event */
  publish(channel: string, event: CoordinationEvent<T>): Promise<void>;

  /** Get coordination statistics */
  getCoordinationStats(): Promise<CoordinationStats>;

  /** Execute raw SQL/query - legacy compatibility */
  execute(
    sql: string,
    params?: unknown[]
  ): Promise<{ affectedRows?: number; insertId?: number }>;

  /** Query database directly - legacy compatibility */
  query(sql: string, params?: unknown[]): Promise<any[]>;
}

/**
 * Query options for standardized data access.
 *
 * @example
 */
export interface QueryOptions {
  /** Maximum number of results to return */
  limit?: number;

  /** Number of results to skip */
  offset?: number;

  /** Sort criteria */
  sort?: SortCriteria[];

  /** Fields to include in results */
  select?: string[];

  /** Fields to exclude from results */
  exclude?: string[];

  /** Additional database-specific options */
  extras?: Record<string, unknown>;
}

/**
 * Sort criteria.
 *
 * @example
 */
export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Custom query interface for database-specific operations.
 *
 * @example
 */
export interface CustomQuery {
  /** Query type identifier */
  type: 'sql|cypher|vector|memory|coordination';

  /** The actual query string or object */
  query: string|object;

  /** Query parameters */
  parameters?: Record<string, unknown>;

  /** Query options */
  options?: Record<string, any>;
}

/**
 * Transaction operation.
 *
 * @example
 */
export interface TransactionOperation {
  /** Operation type */
  type:'query|execute|create|update|delete|custom';

  /** Entity type */
  entityType?: string;

  /** Operation data */
  data?: unknown;

  /** Custom query for complex operations */
  customQuery?: CustomQuery;
}

/**
 * Database metadata.
 *
 * @example
 */
export interface DatabaseMetadata {
  /** Database type */
  type: 'sqlite|lancedb|kuzu';

  /** Database version */
  version: string;

  /** Available features */
  features: string[];

  /** Schema information */
  schema?: Record<string, unknown>;

  /** Configuration */
  config: Record<string, unknown>;
}

/**
 * Performance metrics.
 *
 * @example
 */
export interface PerformanceMetrics {
  /** Average query time in milliseconds */
  averageQueryTime: number;

  /** Queries per second */
  queriesPerSecond: number;

  /** Connection pool stats */
  connectionPool?: {
    active: number;
    idle: number;
    total: number;
    utilization: number;
  };

  /** Memory usage */
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };

  /** Additional database-specific metrics */
  custom?: Record<string, unknown>;
}

/**
 * Graph database specific types.
 *
 * @example
 */
export interface GraphNode {
  id: string|number;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface GraphRelationship {
  id: string|number;
  type: string;
  fromNodeId: string|number;
  toNodeId: string|number;
  properties: Record<string, unknown>;
}

export interface GraphTraversalResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  paths: GraphPath[];
}

export interface GraphPath {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  length: number;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  results: unknown[];
  executionTime: number;
}

/**
 * Vector database specific types.
 *
 * @example
 */
export interface VectorDocument<T> {
  id: string|number;
  vector: number[];
  metadata: T;
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  metric?:'cosine|euclidean|dot';
  filter?: Record<string, unknown>;
}

export interface VectorSearchResult<T> {
  id: string|number;
  score: number;
  document: T;
  vector?: number[];
}

export interface VectorInsertResult {
  inserted: number;
  errors: Array<{ id: string|number; error: string }>;
}

export interface VectorIndexConfig {
  name: string;
  dimension: number;
  metric:'cosine|euclidean|dot';
  type?: string;
  parameters?: Record<string, unknown>;
}

export interface VectorStats {
  totalVectors: number;
  dimensions: number;
  indexType: string;
  memoryUsage: number;
}

export interface ClusteringOptions {
  algorithm?: 'kmeans|dbscan|hierarchical';
  numClusters?: number;
  epsilon?: number;
  minSamples?: number;
}

export interface ClusterResult {
  clusters: Array<{
    id: number;
    centroid: number[];
    members: Array<string|number>;
  }>;
  statistics: {
    silhouetteScore?: number;
    inertia?: number;
  };
}

/**
 * Memory store specific types.
 *
 * @example
 */
export interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  hitRate: number;
  missRate: number;
  evictions: number;
}

/**
 * Coordination database specific types.
 *
 * @example
 */
export interface CoordinationLock {
  id: string;
  resourceId: string;
  acquired: Date;
  expiresAt: Date;
  owner: string;
}

export interface CoordinationChange<T> {
  type:'create|update|delete';
  entityId: string | number;
  entity?: T;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface CoordinationEvent<T> {
  type: string;
  data: T;
  timestamp: Date;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface CoordinationStats {
  activeLocks: number;
  activeSubscriptions: number;
  messagesPublished: number;
  messagesReceived: number;
  uptime: number;
}
