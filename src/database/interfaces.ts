/**
 * Unified Data Access Layer (DAL) - Core Interfaces
 *
 * Provides generic interfaces for standardizing data access across all data sources
 * including Kuzu (graph), LanceDB (vector), coordination databases, memory stores,
 * relational databases, and any other data persistence mechanisms.
 */

/**
 * Generic repository interface for standardized data access
 *
 * @template T The entity type this repository manages
 * @example
 */
export interface IRepository<T> {
  /** Find entity by ID */
  findById(id: string | number): Promise<T | null>;

  /** Find entities by criteria with optional sorting and pagination */
  findBy(criteria: Partial<T>, options?: QueryOptions): Promise<T[]>;

  /** Find all entities with optional sorting and pagination */
  findAll(options?: QueryOptions): Promise<T[]>;

  /** Create a new entity */
  create(entity: Omit<T, 'id'>): Promise<T>;

  /** Update an existing entity */
  update(id: string | number, updates: Partial<T>): Promise<T>;

  /** Delete an entity by ID */
  delete(id: string | number): Promise<boolean>;

  /** Count entities matching criteria */
  count(criteria?: Partial<T>): Promise<number>;

  /** Check if entity exists */
  exists(id: string | number): Promise<boolean>;

  /** Execute custom query specific to the underlying database */
  executeCustomQuery<R = any>(query: CustomQuery): Promise<R>;
}

/**
 * Data Access Object interface for domain-specific operations
 *
 * @template T The entity type
 * @example
 */
export interface IDataAccessObject<T> {
  /** Get repository for basic CRUD operations */
  getRepository(): IRepository<T>;

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
 * Specialized interface for graph databases (Kuzu)
 *
 * @example
 */
export interface IGraphRepository<T> extends IRepository<T> {
  /** Execute graph traversal query */
  traverse(
    startNode: string | number,
    relationshipType: string,
    maxDepth?: number
  ): Promise<GraphTraversalResult>;

  /** Find nodes by label and properties */
  findNodesByLabel(label: string, properties?: Record<string, any>): Promise<GraphNode[]>;

  /** Find relationships between nodes */
  findRelationships(
    fromNodeId: string | number,
    toNodeId: string | number,
    relationshipType?: string
  ): Promise<GraphRelationship[]>;

  /** Create relationship between nodes */
  createRelationship(
    fromNodeId: string | number,
    toNodeId: string | number,
    relationshipType: string,
    properties?: Record<string, any>
  ): Promise<GraphRelationship>;

  /** Execute Cypher query */
  executeCypher(cypher: string, parameters?: Record<string, any>): Promise<GraphQueryResult>;
}

/**
 * Specialized interface for vector databases (LanceDB)
 *
 * @example
 */
export interface IVectorRepository<T> extends IRepository<T> {
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
 * Specialized interface for memory stores
 *
 * @example
 */
export interface IMemoryRepository<T> extends IRepository<T> {
  /** Set TTL (time to live) for an entity */
  setTTL(id: string | number, ttlSeconds: number): Promise<void>;

  /** Get TTL for an entity */
  getTTL(id: string | number): Promise<number | null>;

  /** Cache entity with optional TTL */
  cache(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /** Get cached entity */
  getCached(key: string): Promise<T | null>;

  /** Clear cache */
  clearCache(pattern?: string): Promise<number>;

  /** Get memory usage statistics */
  getMemoryStats(): Promise<MemoryStats>;
}

/**
 * Specialized interface for coordination databases
 *
 * @example
 */
export interface ICoordinationRepository<T> extends IRepository<T> {
  /** Lock resource for coordination */
  acquireLock(resourceId: string, lockTimeout?: number): Promise<CoordinationLock>;

  /** Release lock */
  releaseLock(lockId: string): Promise<void>;

  /** Subscribe to changes */
  subscribe(pattern: string, callback: (change: CoordinationChange<T>) => void): Promise<string>;

  /** Unsubscribe from changes */
  unsubscribe(subscriptionId: string): Promise<void>;

  /** Publish coordination event */
  publish(channel: string, event: CoordinationEvent<T>): Promise<void>;

  /** Get coordination statistics */
  getCoordinationStats(): Promise<CoordinationStats>;
}

/**
 * Query options for standardized data access
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
  extras?: Record<string, any>;
}

/**
 * Sort criteria
 *
 * @example
 */
export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Custom query interface for database-specific operations
 *
 * @example
 */
export interface CustomQuery {
  /** Query type identifier */
  type: 'sql' | 'cypher' | 'vector' | 'memory' | 'coordination';

  /** The actual query string or object */
  query: string | object;

  /** Query parameters */
  parameters?: Record<string, any>;

  /** Query options */
  options?: Record<string, any>;
}

/**
 * Transaction operation
 *
 * @example
 */
export interface TransactionOperation {
  /** Operation type */
  type: 'create' | 'update' | 'delete' | 'custom';

  /** Entity type */
  entityType?: string;

  /** Operation data */
  data?: any;

  /** Custom query for complex operations */
  customQuery?: CustomQuery;
}

/**
 * Database metadata
 *
 * @example
 */
export interface DatabaseMetadata {
  /** Database type */
  type: 'relational' | 'graph' | 'vector' | 'memory' | 'coordination';

  /** Database version */
  version: string;

  /** Available features */
  features: string[];

  /** Schema information */
  schema?: Record<string, any>;

  /** Configuration */
  config: Record<string, any>;
}

/**
 * Health status
 *
 * @example
 */
export interface HealthStatus {
  /** Is the database healthy */
  healthy: boolean;

  /** Health score (0-100) */
  score: number;

  /** Health details */
  details: Record<string, any>;

  /** Last check timestamp */
  lastCheck: Date;

  /** Any error messages */
  errors?: string[];
}

/**
 * Performance metrics
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
  custom?: Record<string, any>;
}

/**
 * Graph database specific types
 *
 * @example
 */
export interface GraphNode {
  id: string | number;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string | number;
  type: string;
  fromNodeId: string | number;
  toNodeId: string | number;
  properties: Record<string, any>;
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
  results: any[];
  executionTime: number;
}

/**
 * Vector database specific types
 *
 * @example
 */
export interface VectorDocument<T> {
  id: string | number;
  vector: number[];
  metadata: T;
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  metric?: 'cosine' | 'euclidean' | 'dot';
  filter?: Record<string, any>;
}

export interface VectorSearchResult<T> {
  id: string | number;
  score: number;
  document: T;
  vector?: number[];
}

export interface VectorInsertResult {
  inserted: number;
  errors: Array<{ id: string | number; error: string }>;
}

export interface VectorIndexConfig {
  name: string;
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dot';
  type?: string;
  parameters?: Record<string, any>;
}

export interface VectorStats {
  totalVectors: number;
  dimensions: number;
  indexType: string;
  memoryUsage: number;
}

export interface ClusteringOptions {
  algorithm?: 'kmeans' | 'dbscan' | 'hierarchical';
  numClusters?: number;
  epsilon?: number;
  minSamples?: number;
}

export interface ClusterResult {
  clusters: Array<{
    id: number;
    centroid: number[];
    members: Array<string | number>;
  }>;
  statistics: {
    silhouetteScore?: number;
    inertia?: number;
  };
}

/**
 * Memory store specific types
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
 * Coordination database specific types
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
  type: 'create' | 'update' | 'delete';
  entityId: string | number;
  entity?: T;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CoordinationEvent<T> {
  type: string;
  data: T;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

export interface CoordinationStats {
  activeLocks: number;
  activeSubscriptions: number;
  messagesPublished: number;
  messagesReceived: number;
  uptime: number;
}
