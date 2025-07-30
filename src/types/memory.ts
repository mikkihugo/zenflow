/**
 * Memory System Types
 * Persistent memory and state management across sessions
 */

import { Identifiable, JSONObject, JSONValue, Cache, CacheStats } from './core.js';

// =============================================================================
// MEMORY CORE TYPES
// =============================================================================

export type MemoryType = 'volatile' | 'persistent' | 'session' | 'cache' | 'shared' | 'distributed';
export type MemoryBackend = 'sqlite' | 'redis' | 'lancedb' | 'memory' | 'file' | 'hybrid';
export type ConsistencyLevel = 'eventual' | 'weak' | 'strong' | 'causal' | 'linearizable';
export type AccessPattern = 'sequential' | 'random' | 'locality' | 'streaming' | 'bulk';

export interface MemoryConfig {
  // Backend configuration
  backend: MemoryBackend;
  connectionString?: string;
  
  // Storage settings
  maxSize: number; // MB
  maxEntries: number;
  defaultTTL: number; // seconds
  cleanupInterval: number; // seconds
  
  // Persistence
  persistent: boolean;
  backupEnabled: boolean;
  backupInterval: number; // seconds
  backupRetention: number; // days
  
  // Distribution
  distributed: boolean;
  replication: number;
  consistency: ConsistencyLevel;
  partitioning: boolean;
  partitionKey: string;
  
  // Performance
  cacheEnabled: boolean;
  cacheSize: number; // MB
  cacheTTL: number; // seconds
  compression: boolean;
  encryption: boolean;
  
  // Indexing
  indexing: boolean;
  fullTextSearch: boolean;
  vectorSearch: boolean;
  
  // Access control
  authentication: boolean;
  authorization: boolean;
  isolation: boolean;
  
  // Monitoring
  metricsEnabled: boolean;
  auditLogging: boolean;
  performanceTracking: boolean;
}

// =============================================================================
// MEMORY ENTRY
// =============================================================================

export interface MemoryEntry extends Identifiable {
  key: string;
  value: JSONValue;
  namespace: string;
  
  // Metadata
  metadata: {
    type: string;
    version: number;
    schema?: string;
    tags: string[];
    category: string;
    source: string;
    owner: string;
  };
  
  // Lifecycle
  createdBy: string;
  lastModifiedBy: string;
  accessedBy: string[];
  
  // Expiration
  ttl?: number; // seconds
  expiresAt?: Date;
  
  // Access patterns
  accessCount: number;
  lastAccessed: Date;
  accessPattern: AccessPattern;
  
  // Quality metrics
  quality: {
    accuracy: number; // 0-1
    relevance: number; // 0-1
    freshness: number; // 0-1
    completeness: number; // 0-1
    consistency: number; // 0-1
  };
  
  // Relationships
  dependencies: string[];
  derived: string[];
  related: string[];
  
  // Storage details
  size: number; // bytes
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  
  // Replication and distribution
  replicas: ReplicaInfo[];
  partition: string;
  shardKey: string;
  
  // Versioning
  versionHistory: VersionInfo[];
  parentVersion?: string;
  childVersions: string[];
  
  // Synchronization
  synchronized: boolean;
  lastSync: Date;
  syncConflicts: ConflictInfo[];
}

export interface ReplicaInfo {
  nodeId: string;
  location: string;
  lastSync: Date;
  status: 'active' | 'stale' | 'failed' | 'syncing';
  lag: number; // milliseconds
}

export interface VersionInfo {
  version: number;
  timestamp: Date;
  author: string;
  changes: string[];
  size: number; // bytes
  checksum: string;
}

export interface ConflictInfo {
  type: 'update' | 'delete' | 'schema' | 'consistency';
  timestamp: Date;
  nodes: string[];
  resolution: 'manual' | 'automatic' | 'last-write-wins' | 'merge';
  resolved: boolean;
  data: JSONObject;
}

// =============================================================================
// MEMORY NAMESPACE
// =============================================================================

export interface MemoryNamespace extends Identifiable {
  name: string;
  description: string;
  type: MemoryType;
  
  // Configuration
  config: NamespaceConfig;
  
  // Access control
  permissions: NamespacePermission[];
  isolation: 'none' | 'soft' | 'hard';
  
  // Statistics
  statistics: {
    entryCount: number;
    totalSize: number; // bytes
    averageEntrySize: number; // bytes
    accessCount: number;
    hitRate: number; // 0-1
    lastAccess: Date;
    hotEntries: string[];
    coldEntries: string[];
  };
  
  // Quality metrics
  quality: {
    consistency: number; // 0-1
    availability: number; // 0-1
    durability: number; // 0-1
    performance: number; // 0-1
  };
  
  // Lifecycle
  createdBy: string;
  managedBy: string[];
  status: 'active' | 'read-only' | 'archived' | 'deprecated' | 'locked';
  
  // Relationships
  parentNamespace?: string;
  childNamespaces: string[];
  linkedNamespaces: string[];
  
  // Backup and recovery
  backupInfo: {
    enabled: boolean;
    lastBackup: Date;
    backupSize: number; // bytes
    backupLocation: string;
    recoveryPoint: Date;
  };
}

export interface NamespaceConfig {
  // Storage settings
  maxSize: number; // MB
  maxEntries: number;
  defaultTTL: number; // seconds
  
  // Performance
  cacheEnabled: boolean;
  indexingEnabled: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  
  // Replication
  replicationFactor: number;
  consistency: ConsistencyLevel;
  
  // Lifecycle policies
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl' | 'custom';
  archivePolicy: ArchivePolicy;
  retentionPolicy: RetentionPolicy;
  
  // Monitoring
  alertThresholds: {
    sizeWarning: number; // percentage
    sizeCritical: number; // percentage
    accessWarning: number; // requests per second
    errorWarning: number; // percentage
  };
}

export interface NamespacePermission {
  principal: string; // user or role
  actions: ('read' | 'write' | 'delete' | 'admin' | 'backup' | 'restore')[];
  conditions: JSONObject;
  granted: Date;
  expires?: Date;
  grantedBy: string;
}

export interface ArchivePolicy {
  enabled: boolean;
  ageThreshold: number; // days
  accessThreshold: number; // minimum accesses
  compressionLevel: number; // 0-9
  archiveLocation: string;
  retrievalTime: number; // milliseconds
}

export interface RetentionPolicy {
  enabled: boolean;
  maxAge: number; // days
  maxInactivity: number; // days
  autoDelete: boolean;
  warningPeriod: number; // days
  exceptions: string[]; // entry patterns to never delete
}

// =============================================================================
// MEMORY OPERATIONS
// =============================================================================

export interface MemoryOperations {
  // Basic operations
  get(key: string, namespace?: string): Promise<MemoryEntry | null>;
  set(key: string, value: JSONValue, options?: SetOptions): Promise<MemoryEntry>;
  delete(key: string, namespace?: string): Promise<boolean>;
  exists(key: string, namespace?: string): Promise<boolean>;
  
  // Batch operations
  getMany(keys: string[], namespace?: string): Promise<(MemoryEntry | null)[]>;
  setMany(entries: Record<string, JSONValue>, options?: SetOptions): Promise<MemoryEntry[]>;
  deleteMany(keys: string[], namespace?: string): Promise<number>;
  
  // Search and query
  search(query: MemoryQuery): Promise<MemorySearchResult>;
  list(namespace?: string, options?: ListOptions): Promise<MemoryEntry[]>;
  count(namespace?: string, filters?: MemoryFilter[]): Promise<number>;
  
  // Advanced queries
  aggregate(pipeline: AggregationPipeline): Promise<JSONObject[]>;
  vectorSearch(vector: number[], options?: VectorSearchOptions): Promise<VectorSearchResult[]>;
  fullTextSearch(query: string, options?: FullTextSearchOptions): Promise<FullTextSearchResult[]>;
  
  // Transactions
  beginTransaction(): Promise<Transaction>;
  commitTransaction(transaction: Transaction): Promise<void>;
  rollbackTransaction(transaction: Transaction): Promise<void>;
  
  // Streaming
  stream(namespace?: string, options?: StreamOptions): AsyncIterable<MemoryEntry>;
  
  // Namespace management
  createNamespace(config: NamespaceConfig): Promise<MemoryNamespace>;
  deleteNamespace(namespace: string): Promise<boolean>;
  listNamespaces(): Promise<MemoryNamespace[]>;
  getNamespaceInfo(namespace: string): Promise<MemoryNamespace | null>;
  
  // Backup and restore
  backup(namespace?: string, options?: BackupOptions): Promise<BackupInfo>;
  restore(backupId: string, options?: RestoreOptions): Promise<void>;
  listBackups(namespace?: string): Promise<BackupInfo[]>;
  
  // Maintenance
  cleanup(): Promise<CleanupResult>;
  optimize(): Promise<OptimizationResult>;
  vacuum(): Promise<VacuumResult>;
  reindex(): Promise<ReindexResult>;
  
  // Monitoring
  getStatistics(namespace?: string): Promise<MemoryStatistics>;
  getMetrics(timeRange?: TimeRange): Promise<MemoryMetrics>;
  getHealth(): Promise<MemoryHealth>;
}

export interface SetOptions {
  namespace?: string;
  ttl?: number; // seconds
  metadata?: JSONObject;
  overwrite?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  replicate?: boolean;
  index?: boolean;
  tags?: string[];
  version?: number;
  ifNotExists?: boolean;
  ifVersionMatch?: number;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: MemoryFilter[];
  includeMetadata?: boolean;
  includeValue?: boolean;
}

export interface StreamOptions extends ListOptions {
  batchSize?: number;
  resumeToken?: string;
  watchMode?: boolean;
}

// =============================================================================
// QUERY SYSTEM
// =============================================================================

export interface MemoryQuery {
  namespace?: string;
  filters: MemoryFilter[];
  sort?: SortCriteria[];
  limit?: number;
  offset?: number;
  facets?: string[];
  aggregations?: Aggregation[];
  explain?: boolean;
}

export interface MemoryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex' | 'exists' | 'type' | 'size';
  value: JSONValue;
  not?: boolean;
}

export interface SortCriteria {
  field: string;
  order: 'asc' | 'desc';
  type?: 'string' | 'number' | 'date';
}

export interface Aggregation {
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'group' | 'histogram';
  field: string;
  alias?: string;
  buckets?: number;
  interval?: number;
}

export interface AggregationPipeline {
  stages: PipelineStage[];
  options?: {
    explain?: boolean;
    timeout?: number; // milliseconds
  };
}

export interface PipelineStage {
  type: 'match' | 'project' | 'group' | 'sort' | 'limit' | 'skip' | 'unwind' | 'lookup' | 'facet';
  parameters: JSONObject;
}

export interface MemorySearchResult {
  entries: MemoryEntry[];
  totalCount: number;
  facets: Record<string, FacetResult>;
  aggregations: Record<string, AggregationResult>;
  executionTime: number; // milliseconds
  queryPlan?: JSONObject;
}

export interface FacetResult {
  buckets: {
    value: JSONValue;
    count: number;
  }[];
  totalBuckets: number;
  otherCount: number;
}

export interface AggregationResult {
  value: JSONValue;
  buckets?: {
    key: JSONValue;
    value: JSONValue;
    count: number;
  }[];
}

// =============================================================================
// SPECIALIZED SEARCH
// =============================================================================

export interface VectorSearchOptions {
  namespace?: string;
  k?: number; // number of results
  threshold?: number; // minimum similarity
  filters?: MemoryFilter[];
  includeDistances?: boolean;
  includeVectors?: boolean;
}

export interface VectorSearchResult {
  entry: MemoryEntry;
  distance: number;
  similarity: number;
  vector?: number[];
}

export interface FullTextSearchOptions {
  namespace?: string;
  fields?: string[];
  fuzzy?: boolean;
  boost?: Record<string, number>;
  highlight?: boolean;
  snippets?: boolean;
  limit?: number;
  offset?: number;
}

export interface FullTextSearchResult {
  entry: MemoryEntry;
  score: number;
  highlights?: Record<string, string[]>;
  snippets?: Record<string, string>;
}

// =============================================================================
// TRANSACTIONS
// =============================================================================

export interface Transaction extends Identifiable {
  status: 'active' | 'committed' | 'aborted' | 'timeout';
  isolationLevel: 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable';
  
  // Transaction details
  operations: TransactionOperation[];
  readSet: Set<string>;
  writeSet: Set<string>;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  timeout: number; // milliseconds
  
  // Concurrency control
  locks: TransactionLock[];
  conflicts: TransactionConflict[];
  
  // Metadata
  createdBy: string;
  context: JSONObject;
}

export interface TransactionOperation {
  type: 'read' | 'write' | 'delete';
  key: string;
  namespace: string;
  oldValue?: JSONValue;
  newValue?: JSONValue;
  timestamp: Date;
}

export interface TransactionLock {
  key: string;
  namespace: string;
  type: 'shared' | 'exclusive';
  acquired: Date;
  expires: Date;
}

export interface TransactionConflict {
  type: 'read-write' | 'write-write' | 'write-read';
  key: string;
  namespace: string;
  conflictingTransaction: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: 'abort' | 'retry' | 'ignore';
}

// =============================================================================
// BACKUP & RECOVERY
// =============================================================================

export interface BackupOptions {
  namespace?: string;
  incremental?: boolean;
  compression?: boolean;
  encryption?: boolean;
  destination?: string;
  metadata?: JSONObject;
}

export interface BackupInfo extends Identifiable {
  namespace: string;
  type: 'full' | 'incremental' | 'differential';
  
  // Backup details
  size: number; // bytes
  entryCount: number;
  compressed: boolean;
  encrypted: boolean;
  
  // Timing
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  
  // Storage
  location: string;
  checksum: string;
  
  // Dependencies
  parentBackup?: string;
  childBackups: string[];
  
  // Status
  status: 'in-progress' | 'completed' | 'failed' | 'expired' | 'corrupted';
  
  // Recovery information
  recoveryPoint: Date;
  consistencyLevel: ConsistencyLevel;
  
  // Metadata
  createdBy: string;
  metadata: JSONObject;
}

export interface RestoreOptions {
  namespace?: string;
  targetNamespace?: string;
  pointInTime?: Date;
  overwrite?: boolean;
  validation?: boolean;
  dryRun?: boolean;
}

// =============================================================================
// MONITORING & STATISTICS
// =============================================================================

export interface MemoryStatistics {
  namespace?: string;
  
  // Storage statistics
  entryCount: number;
  totalSize: number; // bytes
  averageEntrySize: number; // bytes
  compressionRatio: number;
  
  // Access statistics
  totalAccesses: number;
  readsCount: number;
  writesCount: number;
  deletesCount: number;
  hitRate: number; // 0-1
  missRate: number; // 0-1
  
  // Performance statistics
  averageReadTime: number; // milliseconds
  averageWriteTime: number; // milliseconds
  averageDeleteTime: number; // milliseconds
  throughput: number; // operations per second
  
  // Quality statistics
  averageAccuracy: number; // 0-1
  averageRelevance: number; // 0-1
  averageFreshness: number; // 0-1
  consistencyScore: number; // 0-1
  
  // Distribution statistics
  keyDistribution: Record<string, number>;
  sizeDistribution: Record<string, number>;
  accessDistribution: Record<string, number>;
  ttlDistribution: Record<string, number>;
  
  // Temporal statistics
  creationRate: number; // entries per hour
  updateRate: number; // updates per hour
  expirationRate: number; // expirations per hour
  
  // Error statistics
  errorCount: number;
  errorRate: number; // 0-1
  timeoutCount: number;
  conflictCount: number;
  
  // Resource usage
  memoryUsage: number; // bytes
  diskUsage: number; // bytes
  networkUsage: number; // bytes
  cpuUsage: number; // percentage
  
  // Timing
  collectedAt: Date;
  timeRange: TimeRange;
}

export interface MemoryMetrics {
  // Performance metrics
  throughput: TimeSeries; // operations per second
  latency: {
    read: TimeSeries; // milliseconds
    write: TimeSeries; // milliseconds
    delete: TimeSeries; // milliseconds
  };
  
  // Resource metrics
  memoryUsage: TimeSeries; // bytes
  diskUsage: TimeSeries; // bytes
  networkIO: TimeSeries; // bytes per second
  cpuUsage: TimeSeries; // percentage
  
  // Quality metrics
  hitRate: TimeSeries; // 0-1
  errorRate: TimeSeries; // 0-1
  consistency: TimeSeries; // 0-1
  availability: TimeSeries; // 0-1
  
  // Business metrics
  entryCount: TimeSeries;
  accessCount: TimeSeries;
  storageSize: TimeSeries; // bytes
  
  // Distribution metrics
  hotKeys: string[];
  coldKeys: string[];
  keyDistribution: Record<string, TimeSeries>;
  
  // Trends
  trends: {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    confidence: number; // 0-1
  }[];
  
  // Anomalies
  anomalies: {
    metric: string;
    timestamp: Date;
    value: number;
    expected: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }[];
}

export interface TimeSeries {
  timestamps: Date[];
  values: number[];
  unit: string;
  interval: number; // seconds
}

export interface MemoryHealth {
  overall: 'healthy' | 'degraded' | 'critical' | 'failed';
  score: number; // 0-1
  
  components: {
    storage: ComponentHealth;
    performance: ComponentHealth;
    consistency: ComponentHealth;
    replication: ComponentHealth;
    backup: ComponentHealth;
  };
  
  issues: HealthIssue[];
  recommendations: string[];
  alerts: HealthAlert[];
  
  // Capacity planning
  capacity: {
    current: number; // percentage
    projected: number; // percentage
    timeToFull: number; // days
    recommendation: string;
  };
  
  // Maintenance
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceRequired: boolean;
  
  // Trends
  trends: {
    performance: 'improving' | 'stable' | 'degrading';
    reliability: 'improving' | 'stable' | 'degrading';
    capacity: 'growing' | 'stable' | 'shrinking';
  };
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical' | 'failed';
  metrics: JSONObject;
  issues: string[];
  lastCheck: Date;
}

export interface HealthIssue {
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  component: string;
  description: string;
  impact: string;
  recommendation: string;
  autoFixable: boolean;
  estimatedFixTime: number; // minutes
}

export interface HealthAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'prediction';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  
  // Alert details
  metric: string;
  threshold?: number;
  actualValue: number;
  duration: number; // milliseconds
  
  // Actions
  actions: AlertAction[];
  escalation: EscalationPolicy;
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'pagerduty' | 'auto-scale' | 'restart' | 'backup';
  config: JSONObject;
  executed: boolean;
  executedAt?: Date;
  result?: string;
}

export interface EscalationPolicy {
  levels: {
    delay: number; // minutes
    actions: AlertAction[];
  }[];
  maxEscalations: number;
  currentLevel: number;
}

// =============================================================================
// MAINTENANCE OPERATIONS
// =============================================================================

export interface CleanupResult {
  entriesRemoved: number;
  bytesFreed: number;
  duration: number; // milliseconds
  
  breakdown: {
    expired: number;
    orphaned: number;
    corrupted: number;
    duplicate: number;
  };
  
  errors: string[];
}

export interface OptimizationResult {
  improvements: {
    type: string;
    description: string;
    benefit: string;
    applied: boolean;
  }[];
  
  performance: {
    before: PerformanceSnapshot;
    after: PerformanceSnapshot;
    improvement: number; // percentage
  };
  
  duration: number; // milliseconds
  errors: string[];
}

export interface VacuumResult {
  bytesReclaimed: number;
  fragmentationReduced: number; // percentage
  indexesRebuilt: number;
  duration: number; // milliseconds
  errors: string[];
}

export interface ReindexResult {
  indexesRebuilt: number;
  indexSize: number; // bytes
  duration: number; // milliseconds
  performance: {
    searchSpeedup: number; // percentage
    writeSlowdown: number; // percentage
  };
  errors: string[];
}

export interface PerformanceSnapshot {
  timestamp: Date;
  throughput: number; // operations per second
  latency: number; // milliseconds
  memoryUsage: number; // bytes
  cpuUsage: number; // percentage
  hitRate: number; // 0-1
}

export interface TimeRange {
  start: Date;
  end: Date;
}