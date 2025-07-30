/**
 * Database System Types
 * Multi-database architecture: SQLite, LanceDB (vector), Kuzu (graph), PostgreSQL
 */

import { Identifiable, JSONObject, JSONValue, OperationResult } from './core';

// =============================================================================
// CORE DATABASE TYPES
// =============================================================================

export type DatabaseType = 'sqlite' | 'postgresql' | 'lancedb' | 'kuzu' | 'redis' | 'mongodb';
export type DatabaseStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'maintenance';
export type QueryType = 'select' | 'insert' | 'update' | 'delete' | 'vector' | 'graph' | 'aggregate';
export type TransactionIsolation = 'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable';

export interface DatabaseConfig {
  type: DatabaseType;
  name: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  filePath?: string; // For SQLite
  
  // Connection pooling
  pool: {
    min: number;
    max: number;
    acquireTimeout: number;
    idleTimeout: number;
    maxLifetime: number;
  };
  
  // Performance settings
  performance: {
    queryTimeout: number;
    batchSize: number;
    cacheSize: number;
    enableWAL: boolean;
    enableCompression: boolean;
    enableIndexes: boolean;
    vacuumInterval: number;
  };
  
  // Security
  security: {
    ssl: boolean;
    encryption: boolean;
    keyRotation: boolean;
    auditLogging: boolean;
    backupEncryption: boolean;
  };
  
  // Backup and recovery
  backup: {
    enabled: boolean;
    frequency: string; // cron expression
    retention: number; // days
    compression: boolean;
    location: string;
    cloudBackup: boolean;
  };
  
  // Monitoring
  monitoring: {
    enabled: boolean;
    slowQueryThreshold: number;
    healthCheckInterval: number;
    metricsCollection: boolean;
    performanceInsights: boolean;
  };
}

export interface DatabaseConnection {
  id: string;
  type: DatabaseType;
  status: DatabaseStatus;
  config: DatabaseConfig;
  connectedAt: Date;
  lastActivity: Date;
  queryCount: number;
  errorCount: number;
  averageResponseTime: number;
}

// =============================================================================
// QUERY SYSTEM
// =============================================================================

export interface QueryOptions {
  timeout?: number;
  transaction?: Transaction;
  cache?: boolean;
  cacheTTL?: number;
  explain?: boolean;
  index?: string;
  limit?: number;
  offset?: number;
  orderBy?: string[];
  groupBy?: string[];
  having?: string;
}

export interface QueryResult<T = any> {
  success: boolean;
  data?: T[];
  count?: number;
  totalCount?: number;
  executionTime: number;
  queryPlan?: JSONObject;
  cache: {
    hit: boolean;
    key?: string;
    expiresAt?: Date;
  };
  metadata: JSONObject;
}

export interface Transaction {
  id: string;
  isolation: TransactionIsolation;
  startedAt: Date;
  queries: Query[];
  status: 'active' | 'committed' | 'rolled_back' | 'failed';
  savepoints: string[];
}

export interface Query extends Identifiable {
  type: QueryType;
  sql?: string;
  parameters?: any[];
  collection?: string; // For NoSQL
  vectorQuery?: VectorQuery; // For vector databases
  graphQuery?: GraphQuery; // For graph databases
  
  // Execution details
  executedAt?: Date;
  executionTime?: number;
  rowsAffected?: number;
  resultCount?: number;
  
  // Optimization
  optimized: boolean;
  indexesUsed: string[];
  queryPlan?: JSONObject;
  estimatedCost?: number;
  
  // Metadata
  database: string;
  user?: string;
  application?: string;
  context?: JSONObject;
}

// =============================================================================
// VECTOR DATABASE (LANCEDB)
// =============================================================================

export interface VectorConfig {
  dimensions: number;
  indexType: 'ivf' | 'hnsw' | 'flat';
  metric: 'cosine' | 'euclidean' | 'manhattan' | 'dot';
  
  // Index parameters
  ivf?: {
    nlist: number;
    nprobe: number;
  };
  hnsw?: {
    M: number;
    efConstruction: number;
    efSearch: number;
  };
  
  // Performance
  batchSize: number;
  parallelism: number;
  memoryBudget: number;
}

export interface VectorEntry extends Identifiable {
  vector: number[];
  metadata: JSONObject;
  namespace?: string;
  tags?: string[];
  
  // Quality metrics
  quality: number; // 0-1
  confidence: number; // 0-1
  source: string;
  
  // Usage tracking
  usageCount: number;
  lastUsed: Date;
  effectiveness: number;
}

export interface VectorQuery {
  vector?: number[];
  query?: string; // For text-to-vector search
  namespace?: string;
  k: number; // Number of results
  filters?: JSONObject;
  includeMetadata: boolean;
  includeVectors: boolean;
  
  // Search parameters
  minScore?: number;
  maxDistance?: number;
  efSearch?: number; // For HNSW
  nprobe?: number; // For IVF
}

export interface VectorSearchResult {
  id: UUID;
  score: number;
  distance: number;
  vector?: number[];
  metadata: JSONObject;
  rank: number;
}

export interface VectorIndex {
  name: string;
  config: VectorConfig;
  size: number;
  dimensions: number;
  createdAt: Date;
  lastOptimized: Date;
  
  // Statistics
  stats: {
    totalVectors: number;
    indexSize: number;
    queryLatency: number;
    recall: number;
    precision: number;
  };
}

// =============================================================================
// GRAPH DATABASE (KUZU)
// =============================================================================

export interface GraphSchema {
  nodeTypes: GraphNodeType[];
  relationshipTypes: GraphRelationshipType[];
  constraints: GraphConstraint[];
  indexes: GraphIndex[];
}

export interface GraphNodeType {
  name: string;
  properties: GraphProperty[];
  constraints: string[];
  indexes: string[];
}

export interface GraphRelationshipType {
  name: string;
  fromNodeType: string;
  toNodeType: string;
  properties: GraphProperty[];
  directed: boolean;
  multiple: boolean;
}

export interface GraphProperty {
  name: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'json' | 'vector';
  required: boolean;
  indexed: boolean;
  unique: boolean;
  default?: any;
}

export interface GraphConstraint {
  type: 'unique' | 'existence' | 'key' | 'relationship';
  nodeType?: string;
  relationshipType?: string;
  properties: string[];
  description: string;
}

export interface GraphIndex {
  name: string;
  type: 'btree' | 'hash' | 'fulltext' | 'spatial';
  nodeType?: string;
  relationshipType?: string;
  properties: string[];
  unique: boolean;
}

export interface GraphNode extends Identifiable {
  type: string;
  properties: JSONObject;
  labels: string[];
  
  // Relationships
  incomingRelationships: GraphRelationship[];
  outgoingRelationships: GraphRelationship[];
  
  // Graph metrics
  degree: number;
  inDegree: number;
  outDegree: number;
  centrality?: number;
  pageRank?: number;
  clustering?: number;
}

export interface GraphRelationship extends Identifiable {
  type: string;
  fromNodeId: UUID;
  toNodeId: UUID;
  properties: JSONObject;
  directed: boolean;
  weight?: number;
  
  // Relationship metrics
  strength: number;
  frequency: number;
  lastUpdated: Date;
}

export interface GraphQuery {
  cypher?: string; // Cypher-like query
  traversal?: GraphTraversal;
  pattern?: GraphPattern;
  
  // Query options
  maxDepth?: number;
  limit?: number;
  returnPaths?: boolean;
  includeMetrics?: boolean;
}

export interface GraphTraversal {
  startNodes: UUID[];
  relationshipTypes: string[];
  direction: 'incoming' | 'outgoing' | 'both';
  filters: JSONObject;
  maxDepth: number;
  algorithm?: 'dfs' | 'bfs' | 'dijkstra' | 'astar';
}

export interface GraphPattern {
  nodes: {
    variable: string;
    type?: string;
    properties?: JSONObject;
  }[];
  relationships: {
    variable: string;
    type?: string;
    direction: 'incoming' | 'outgoing' | 'both';
    properties?: JSONObject;
  }[];
}

export interface GraphPath {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  length: number;
  weight: number;
  cost: number;
}

export interface GraphAnalysis {
  nodeCount: number;
  relationshipCount: number;
  density: number;
  diameter: number;
  averagePathLength: number;
  clusteringCoefficient: number;
  
  // Community detection
  communities: {
    id: string;
    size: number;
    nodes: UUID[];
    modularity: number;
  }[];
  
  // Centrality measures
  centralNodes: {
    nodeId: UUID;
    betweenness: number;
    closeness: number;
    eigenvector: number;
    pageRank: number;
  }[];
  
  // Path analysis
  shortestPaths: GraphPath[];
  bottlenecks: UUID[];
  bridges: UUID[];
}

// =============================================================================
// SQL DATABASE (SQLITE/POSTGRESQL)
// =============================================================================

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  indexes: IndexDefinition[];
  constraints: ConstraintDefinition[];
  triggers: TriggerDefinition[];
  
  // Metadata
  rowCount: number;
  size: number;
  createdAt: Date;
  lastModified: Date;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  autoIncrement: boolean;
  defaultValue?: any;
  
  // Statistics
  distinctValues?: number;
  nullCount?: number;
  minValue?: any;
  maxValue?: any;
  averageLength?: number;
}

export interface IndexDefinition {
  name: string;
  type: 'btree' | 'hash' | 'gist' | 'gin' | 'spgist' | 'brin';
  columns: string[];
  unique: boolean;
  partial?: string; // WHERE clause for partial index
  
  // Statistics
  size: number;
  usage: number;
  effectiveness: number;
  lastUsed: Date;
}

export interface ConstraintDefinition {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  onUpdate?: 'cascade' | 'restrict' | 'set_null' | 'set_default';
  onDelete?: 'cascade' | 'restrict' | 'set_null' | 'set_default';
  checkExpression?: string;
}

export interface TriggerDefinition {
  name: string;
  timing: 'before' | 'after' | 'instead_of';
  events: ('insert' | 'update' | 'delete')[];
  condition?: string;
  function: string;
  enabled: boolean;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

export interface DatabaseOperations {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  ping(): Promise<boolean>;
  getStatus(): Promise<DatabaseStatus>;
  
  // Query execution
  query<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<QueryResult<T>>;
  execute(sql: string, params?: any[], options?: QueryOptions): Promise<OperationResult>;
  batch(queries: Query[], options?: QueryOptions): Promise<OperationResult[]>;
  
  // Transaction management
  beginTransaction(isolation?: TransactionIsolation): Promise<Transaction>;
  commitTransaction(transaction: Transaction): Promise<void>;
  rollbackTransaction(transaction: Transaction): Promise<void>;
  createSavepoint(transaction: Transaction, name: string): Promise<void>;
  rollbackToSavepoint(transaction: Transaction, name: string): Promise<void>;
  
  // Schema management
  createTable(schema: TableSchema): Promise<void>;
  alterTable(tableName: string, changes: TableChange[]): Promise<void>;
  dropTable(tableName: string): Promise<void>;
  getSchema(tableName?: string): Promise<TableSchema[]>;
  
  // Index management
  createIndex(definition: IndexDefinition): Promise<void>;
  dropIndex(indexName: string): Promise<void>;
  reindexTable(tableName: string): Promise<void>;
  analyzeTable(tableName: string): Promise<TableStatistics>;
  
  // Maintenance
  vacuum(): Promise<void>;
  analyze(): Promise<void>;
  optimize(): Promise<void>;
  backup(location: string): Promise<void>;
  restore(location: string): Promise<void>;
  
  // Monitoring
  getMetrics(): Promise<DatabaseMetrics>;
  getSlowQueries(limit?: number): Promise<SlowQuery[]>;
  explainQuery(sql: string, params?: any[]): Promise<QueryPlan>;
}

export interface VectorOperations {
  // Vector management
  insertVectors(entries: VectorEntry[]): Promise<OperationResult>;
  updateVector(id: UUID, vector: number[], metadata?: JSONObject): Promise<OperationResult>;
  deleteVector(id: UUID): Promise<OperationResult>;
  getVector(id: UUID): Promise<VectorEntry | null>;
  
  // Search operations
  similaritySearch(query: VectorQuery): Promise<VectorSearchResult[]>;
  hybridSearch(textQuery: string, vectorQuery: VectorQuery): Promise<VectorSearchResult[]>;
  batchSearch(queries: VectorQuery[]): Promise<VectorSearchResult[][]>;
  
  // Index management
  createIndex(config: VectorConfig): Promise<VectorIndex>;
  optimizeIndex(indexName: string): Promise<void>;
  rebuildIndex(indexName: string): Promise<void>;
  getIndexStats(indexName: string): Promise<VectorIndexStats>;
  
  // Namespace management
  createNamespace(name: string): Promise<void>;
  deleteNamespace(name: string): Promise<void>;
  listNamespaces(): Promise<string[]>;
  getNamespaceStats(name: string): Promise<NamespaceStats>;
}

export interface GraphOperations {
  // Node operations
  createNode(node: Omit<GraphNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<GraphNode>;
  updateNode(id: UUID, updates: Partial<GraphNode>): Promise<GraphNode>;
  deleteNode(id: UUID): Promise<boolean>;
  getNode(id: UUID): Promise<GraphNode | null>;
  findNodes(criteria: JSONObject): Promise<GraphNode[]>;
  
  // Relationship operations
  createRelationship(relationship: Omit<GraphRelationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<GraphRelationship>;
  updateRelationship(id: UUID, updates: Partial<GraphRelationship>): Promise<GraphRelationship>;
  deleteRelationship(id: UUID): Promise<boolean>;
  getRelationship(id: UUID): Promise<GraphRelationship | null>;
  findRelationships(criteria: JSONObject): Promise<GraphRelationship[]>;
  
  // Query operations
  executeGraphQuery(query: GraphQuery): Promise<QueryResult>;
  traverseGraph(traversal: GraphTraversal): Promise<GraphPath[]>;
  findPatterns(pattern: GraphPattern): Promise<JSONObject[]>;
  findShortestPath(fromId: UUID, toId: UUID, options?: JSONObject): Promise<GraphPath | null>;
  
  // Analysis operations
  analyzeGraph(options?: JSONObject): Promise<GraphAnalysis>;
  detectCommunities(algorithm?: string): Promise<JSONObject[]>;
  calculateCentrality(nodeId: UUID): Promise<JSONObject>;
  findInfluentialNodes(limit?: number): Promise<GraphNode[]>;
  
  // Schema operations
  createNodeType(nodeType: GraphNodeType): Promise<void>;
  createRelationshipType(relationshipType: GraphRelationshipType): Promise<void>;
  getSchema(): Promise<GraphSchema>;
  validateSchema(): Promise<ValidationResult[]>;
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface TableChange {
  type: 'add_column' | 'drop_column' | 'modify_column' | 'rename_column' | 'add_constraint' | 'drop_constraint';
  column?: ColumnDefinition;
  oldName?: string;
  newName?: string;
  constraint?: ConstraintDefinition;
}

export interface TableStatistics {
  rowCount: number;
  size: number;
  indexSize: number;
  fragmentationRatio: number;
  lastAnalyzed: Date;
  
  columnStats: {
    [column: string]: {
      distinctValues: number;
      nullCount: number;
      averageLength: number;
      mostCommonValues: any[];
    };
  };
}

export interface DatabaseMetrics {
  connectionCount: number;
  activeConnections: number;
  idleConnections: number;
  
  queryStats: {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
  };
  
  performance: {
    throughput: number; // queries per second
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    cacheHitRatio: number;
    indexUsageRatio: number;
  };
  
  storage: {
    totalSize: number;
    dataSize: number;
    indexSize: number;
    freeSpace: number;
    fragmentationRatio: number;
  };
  
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskIO: {
      reads: number;
      writes: number;
      iops: number;
    };
    networkIO: {
      bytesIn: number;
      bytesOut: number;
    };
  };
}

export interface SlowQuery {
  sql: string;
  executionTime: number;
  executedAt: Date;
  rowsExamined: number;
  rowsReturned: number;
  database: string;
  user?: string;
  frequency: number;
}

export interface QueryPlan {
  nodes: {
    nodeType: string;
    operation: string;
    cost: number;
    rows: number;
    time: number;
    details: JSONObject;
  }[];
  totalCost: number;
  estimatedRows: number;
  actualRows?: number;
  executionTime?: number;
}

export interface VectorIndexStats {
  totalVectors: number;
  indexSize: number;
  buildTime: number;
  lastOptimized: Date;
  
  performance: {
    averageQueryTime: number;
    recall: number;
    precision: number;
    throughput: number;
  };
  
  distribution: {
    dimensionality: number;
    sparsity: number;
    clusterCount: number;
    outlierCount: number;
  };
}

export interface NamespaceStats {
  vectorCount: number;
  totalSize: number;
  averageDimensions: number;
  createdAt: Date;
  lastUpdated: Date;
  
  usage: {
    queryCount: number;
    insertCount: number;
    updateCount: number;
    deleteCount: number;
  };
  
  quality: {
    averageConfidence: number;
    averageQuality: number;
    duplicateRatio: number;
    coverageRatio: number;
  };
}

// =============================================================================
// DATABASE MANAGER
// =============================================================================

export interface DatabaseManager {
  // Connection management
  addDatabase(config: DatabaseConfig): Promise<string>;
  removeDatabase(id: string): Promise<boolean>;
  getDatabase(id: string): Promise<DatabaseOperations | null>;
  getAllDatabases(): Promise<DatabaseConnection[]>;
  
  // Query routing
  executeQuery(databaseId: string, query: Query, options?: QueryOptions): Promise<QueryResult>;
  executeBatch(databaseId: string, queries: Query[], options?: QueryOptions): Promise<OperationResult[]>;
  executeTransaction(databaseId: string, queries: Query[], isolation?: TransactionIsolation): Promise<OperationResult[]>;
  
  // Health and monitoring
  checkHealth(): Promise<DatabaseHealthReport>;
  getMetrics(): Promise<DatabaseMetrics[]>;
  optimizeAll(): Promise<string[]>;
  
  // Backup and recovery
  backupDatabase(databaseId: string, location: string): Promise<void>;
  restoreDatabase(databaseId: string, location: string): Promise<void>;
  scheduleBackup(databaseId: string, schedule: string): Promise<void>;
  
  // Migration
  migrateData(sourceId: string, targetId: string, mapping: JSONObject): Promise<void>;
  syncDatabases(primaryId: string, replicaIds: string[]): Promise<void>;
}

export interface DatabaseHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  databases: {
    [id: string]: {
      status: DatabaseStatus;
      health: number;
      issues: string[];
      recommendations: string[];
      lastCheck: Date;
    };
  };
  systemHealth: {
    resourceUsage: JSONObject;
    performance: JSONObject;
    errors: string[];
  };
}