/**
 * Event System Types
 * Comprehensive event-driven architecture for system-wide coordination
 */

import { Identifiable, JSONObject, TypedEventEmitter } from './core';

// =============================================================================
// EVENT CORE TYPES
// =============================================================================

export type EventCategory = 
  | 'system' 
  | 'queen' 
  | 'swarm' 
  | 'hive' 
  | 'neural' 
  | 'coordination' 
  | 'memory' 
  | 'plugin' 
  | 'api' 
  | 'database' 
  | 'security'
  | 'performance'
  | 'user'
  | 'custom';

export type EventSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical' | 'emergency';

export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'timeout';

export type DeliveryGuarantee = 'at-most-once' | 'at-least-once' | 'exactly-once';

export type EventPattern = 'unicast' | 'broadcast' | 'multicast' | 'anycast';

// =============================================================================
// EVENT DEFINITION
// =============================================================================

export interface SystemEvent extends Identifiable {
  // Event identification
  type: string;
  category: EventCategory;
  source: EventSource;
  
  // Event data
  data: JSONObject;
  metadata: EventMetadata;
  
  // Event properties
  severity: EventSeverity;
  priority: number; // 0-100
  version: string;
  
  // Timing
  timestamp: Date;
  ttl?: number; // seconds
  expiresAt?: Date;
  
  // Correlation and causation
  correlationId?: UUID;
  causationId?: UUID;
  traceId?: UUID;
  spanId?: UUID;
  parentEventId?: UUID;
  childEventIds: UUID[];
  
  // Routing and delivery
  targets: EventTarget[];
  pattern: EventPattern;
  deliveryGuarantee: DeliveryGuarantee;
  
  // Status tracking
  status: EventStatus;
  attempts: number;
  maxAttempts: number;
  nextRetry?: Date;
  
  // Processing history
  processedBy: ProcessingInfo[];
  errors: EventError[];
  
  // Content properties
  size: number; // bytes
  compressed: boolean;  
  encrypted: boolean;
  signed: boolean;
  checksum: string;
  
  // Business context
  tags: string[];
  labels: Record<string, string>;
  annotations: Record<string, JSONObject>;
}

export interface EventSource {
  id: UUID;
  type: 'queen' | 'swarm' | 'hive' | 'plugin' | 'system' | 'user' | 'external';
  name: string;
  version?: string;
  instance?: string;
  
  // Location context
  location: {
    node?: string;
    cluster?: string;
    region?: string;
    environment?: string;
  };
  
  // Authentication
  authenticated: boolean;
  principal?: string;
  roles: string[];
}

export interface EventTarget {
  id?: UUID;
  type: 'queen' | 'swarm' | 'hive' | 'plugin' | 'system' | 'user' | 'external' | 'topic' | 'queue';
  pattern?: string; // for pattern-based routing
  filters?: EventFilter[];
  
  // Delivery options
  required: boolean;
  timeout: number; // milliseconds
  retries: number;
  
  // Processing hints
  async: boolean;
  batch: boolean;
  priority: number;
}

export interface EventMetadata {
  // Schema information
  schema?: string;
  schemaVersion?: string;
  contentType: string;
  encoding?: string;
  
  // Business metadata
  domain?: string;
  aggregate?: string;
  aggregateVersion?: number;
  
  // Technical metadata
  producer: string;
  producerVersion: string;
  protocol: string;
  
  // Quality attributes
  reliability: number; // 0-1
  importance: number; // 0-1
  urgency: number; // 0-1
  
  // Custom metadata
  custom: Record<string, JSONObject>;
}

export interface ProcessingInfo {
  processorId: UUID;
  processorType: string;
  processedAt: Date;
  duration: number; // milliseconds
  result: 'success' | 'failure' | 'partial' | 'skipped';
  
  // Processing details
  transformations: string[];
  validations: string[];
  enrichments: string[];
  
  // Output
  outputEvents: UUID[];
  sideEffects: string[];
  
  // Performance
  resourceUsage: {
    cpu: number; // milliseconds
    memory: number; // bytes
    network: number; // bytes
    disk: number; // bytes
  };
  
  // Context
  context: JSONObject;
  metadata: JSONObject;
}

export interface EventError {
  code: string;
  message: string;
  details?: JSONObject;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
  
  // Error context
  phase: 'validation' | 'routing' | 'processing' | 'delivery' | 'persistence';
  processor?: UUID;
  stackTrace?: string;
  
  // Resolution
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: UUID;
}

// =============================================================================
// EVENT BUS
// =============================================================================

export interface EventBus extends TypedEventEmitter<EventBusEvents> {
  // Event publication
  publish(event: SystemEvent): Promise<PublishResult>;
  publishBatch(events: SystemEvent[]): Promise<PublishResult[]>;
  
  // Event subscription
  subscribe(subscription: EventSubscription): Promise<UUID>;
  unsubscribe(subscriptionId: UUID): Promise<boolean>;
  
  // Pattern-based subscription
  subscribePattern(pattern: EventPattern, handler: EventHandler): Promise<UUID>;
  subscribeCategory(category: EventCategory, handler: EventHandler): Promise<UUID>;
  subscribeSource(sourcePattern: string, handler: EventHandler): Promise<UUID>;
  
  // Event querying
  getEvent(eventId: UUID): Promise<SystemEvent | null>;
  queryEvents(query: EventQuery): Promise<EventQueryResult>;
  getEventHistory(correlationId: UUID): Promise<SystemEvent[]>;
  
  // Stream processing
  createStream(config: EventStreamConfig): Promise<EventStream>;
  deleteStream(streamId: UUID): Promise<boolean>;
  getStream(streamId: UUID): Promise<EventStream | null>;
  
  // Topic management
  createTopic(config: TopicConfig): Promise<EventTopic>;
  deleteTopic(topicId: UUID): Promise<boolean>;
  listTopics(): Promise<EventTopic[]>;
  
  // Dead letter handling
  getDeadLetters(filters?: EventFilter[]): Promise<SystemEvent[]>;
  reprocessDeadLetter(eventId: UUID): Promise<boolean>;
  discardDeadLetter(eventId: UUID): Promise<boolean>;
  
  // Monitoring and metrics
  getMetrics(): Promise<EventBusMetrics>;
  getHealth(): Promise<EventBusHealth>;
  
  // Administration
  pause(): Promise<void>;
  resume(): Promise<void>;
  reset(): Promise<void>;
  exportEvents(query: EventQuery, format: 'json' | 'csv' | 'avro'): Promise<Buffer>;
}

export interface PublishResult {
  eventId: UUID;
  success: boolean;
  deliveredTo: UUID[];
  failedDeliveries: UUID[];
  publishTime: Date;
  latency: number; // milliseconds
  size: number; // bytes
  error?: string;
}

// =============================================================================
// EVENT SUBSCRIPTION
// =============================================================================

export interface EventSubscription extends Identifiable {
  name: string;
  description?: string;
  
  // Subscription configuration
  filters: EventFilter[];
  transform?: EventTransform;
  handler: EventHandler;
  
  // Delivery configuration
  deliveryMode: 'push' | 'pull';
  batchSize: number;
  maxBatchWait: number; // milliseconds
  timeout: number; // milliseconds
  
  // Quality of service
  qos: {
    guarantee: DeliveryGuarantee;
    ordering: 'none' | 'partition' | 'global';
    durability: 'memory' | 'disk' | 'replicated';
    retryPolicy: RetryPolicy;
  };
  
  // State
  status: 'active' | 'paused' | 'failed' | 'cancelled';
  position: SubscriptionPosition;
  
  // Statistics
  statistics: {
    eventsReceived: number;
    eventsProcessed: number;
    eventsSkipped: number;
    eventsFailed: number;
    averageProcessingTime: number; // milliseconds
    lastActivity: Date;
    totalDowntime: number; // milliseconds
  };
  
  // Error handling
  errorHandler?: EventErrorHandler;
  deadLetterTopic?: UUID;
  maxErrors: number;
  errorCount: number;
  
  // Security
  authentication: boolean;
  authorization: string[];
  encryption: boolean;
  
  // Lifecycle
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  expiresAt?: Date;
}

export interface EventFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex' | 'exists' | 'contains' | 'startswith' | 'endswith';
  value: JSONObject;
  caseSensitive?: boolean;
  not?: boolean;
}

export interface EventTransform {
  type: 'jq' | 'jsonpath' | 'javascript' | 'custom';
  expression: string;
  parameters?: JSONObject;
}

export interface EventHandler {
  (event: SystemEvent, context: EventHandlerContext): Promise<EventHandlerResult>;
}

export interface EventHandlerContext {
  subscription: EventSubscription;
  attempt: number;
  deadline: Date;
  
  // Processing context
  batch: SystemEvent[];
  position: SubscriptionPosition;
  
  // Services
  eventBus: EventBus;
  logger: EventLogger;
  metrics: EventMetrics;
  
  // State
  state: JSONObject;
  
  // Control
  acknowledge: () => Promise<void>;
  reject: (requeue?: boolean) => Promise<void>;
  defer: (delay: number) => Promise<void>;
}

export interface EventHandlerResult {
  success: boolean;
  outputEvents?: SystemEvent[];
  state?: JSONObject;
  error?: string;
  metrics?: JSONObject;
  
  // Flow control
  acknowledge: boolean;
  requeue: boolean;
  delay?: number; // milliseconds
}

export interface EventErrorHandler {
  (event: SystemEvent, error: EventError, context: EventHandlerContext): Promise<ErrorHandlerResult>;
}

export interface ErrorHandlerResult {
  action: 'retry' | 'skip' | 'deadletter' | 'abort';
  delay?: number; // milliseconds
  metadata?: JSONObject;
}

export interface RetryPolicy {
  maxAttempts: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  multiplier: number;
  jitter: boolean;
  retryableErrors: string[];
}

export interface SubscriptionPosition {
  offset: number;
  timestamp: Date;
  checksum?: string;
  metadata?: JSONObject;
}

// =============================================================================
// EVENT STREAMS
// =============================================================================

export interface EventStream extends Identifiable {
  name: string;
  description?: string;
  config: EventStreamConfig;
  
  // Stream state
  status: 'active' | 'paused' | 'failed' | 'completed';
  position: StreamPosition;
  
  // Processing stages
  stages: StreamStage[];
  
  // Statistics
  statistics: {
    eventsProcessed: number;
    bytesProcessed: number;
    averageLatency: number; // milliseconds
    throughput: number; // events per second
    errorRate: number; // 0-1
    startTime: Date;
    lastActivity: Date;
  };
  
  // Resource usage
  resources: {
    cpu: number; // percentage
    memory: number; // MB
    network: number; // KB/s
    disk: number; // KB/s
  };
  
  // Error handling
  errors: StreamError[];
  checkpoints: StreamCheckpoint[];
  
  // Output
  outputStreams: UUID[];
  sinks: StreamSink[];
}

export interface EventStreamConfig {
  // Input configuration
  sources: StreamSource[];
  
  // Processing configuration
  parallelism: number;
  batchSize: number;
  windowSize: number; // milliseconds
  watermarkDelay: number; // milliseconds
  
  // State management
  stateful: boolean;
  checkpointInterval: number; // milliseconds
  stateBackend: 'memory' | 'disk' | 'distributed';
  
  // Fault tolerance
  restartStrategy: 'fixed-delay' | 'exponential-delay' | 'none';
  maxRestarts: number;
  tolerableFailures: number;
  
  // Resource limits
  resourceLimits: {
    cpu: number; // cores
    memory: number; // MB
    disk: number; // MB
    network: number; // KB/s
  };
  
  // Quality of service
  qos: {
    latency: 'low' | 'medium' | 'high';
    throughput: 'low' | 'medium' | 'high';
    consistency: 'eventual' | 'strong';
    durability: 'memory' | 'disk' | 'replicated';
  };
}

export interface StreamSource {
  type: 'topic' | 'queue' | 'database' | 'file' | 'http' | 'websocket' | 'custom';
  config: JSONObject;
  
  // Source properties
  ordered: boolean;
  bounded: boolean;
  watermarkExtractor?: string;
  
  // Partitioning
  partitioned: boolean;
  keyExtractor?: string;
  partitionCount?: number;
}

export interface StreamStage {
  id: UUID;
  name: string;
  type: 'map' | 'filter' | 'flatmap' | 'reduce' | 'aggregate' | 'window' | 'join' | 'split' | 'merge' | 'custom';
  
  // Stage configuration
  function: string; // JavaScript or custom function
  parameters: JSONObject;
  
  // Parallelism
  parallelism: number;
  keyBy?: string;
  
  // State
  stateful: boolean;
  stateType?: 'keyed' | 'operator' | 'broadcast';
  
  // Timing
  watermarks: boolean;
  allowedLateness: number; // milliseconds
  
  // Output
  outputType: string;
  outputSchema?: JSONObject;
}

export interface StreamPosition {
  source: UUID;
  partition: number;
  offset: number;
  timestamp: Date;
  watermark: Date;
}

export interface StreamError {
  timestamp: Date;
  stage: UUID;
  event: UUID;
  error: string;
  recoverable: boolean;
  resolved: boolean;
}

export interface StreamCheckpoint {
  id: UUID;
  timestamp: Date;
  positions: StreamPosition[];
  state: JSONObject;
  size: number; // bytes
}

export interface StreamSink {
  type: 'topic' | 'database' | 'file' | 'http' | 'elasticsearch' | 'custom';
  config: JSONObject;
  
  // Sink properties
  parallelism: number;
  batchSize: number;
  flushInterval: number; // milliseconds
  
  // Error handling
  retryPolicy: RetryPolicy;
  deadLetterSink?: StreamSink;
}

// =============================================================================
// EVENT TOPICS
// =============================================================================

export interface EventTopic extends Identifiable {
  name: string;
  description?: string;
  
  // Topic configuration
  partitionCount: number;
  replicationFactor: number;
  retentionTime: number; // milliseconds
  retentionSize: number; // bytes
  
  // Message configuration
  compressionType: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
  maxMessageSize: number; // bytes
  
  // Access control
  permissions: TopicPermission[];
  
  // Statistics
  statistics: {
    messageCount: number;
    totalSize: number; // bytes
    averageMessageSize: number; // bytes
    producerCount: number;
    consumerCount: number;
    throughput: number; // messages per second
    lastActivity: Date;
  };
  
  // Partitions
  partitions: TopicPartition[];
  
  // Configuration
  config: Record<string, JSONObject>;
  
  // Status
  status: 'active' | 'read-only' | 'write-only' | 'archived' | 'deleted';
  
  // Lifecycle
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  archivedAt?: Date;
}

export interface TopicConfig {
  name: string;
  description?: string;
  partitionCount: number;
  replicationFactor: number;
  retentionTime: number; // milliseconds
  retentionSize: number; // bytes
  compressionType: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
  maxMessageSize: number; // bytes
  permissions: TopicPermission[];
  config: Record<string, JSONObject>;
}

export interface TopicPermission {
  principal: string; // user or role
  actions: ('read' | 'write' | 'admin')[];
  conditions?: JSONObject;
}

export interface TopicPartition {
  id: number;
  leader: string;
  replicas: string[];
  inSyncReplicas: string[];
  
  // Partition statistics
  messageCount: number;
  size: number; // bytes
  oldestOffset: number;
  newestOffset: number;
  
  // Performance
  throughput: number; // messages per second
  averageLatency: number; // milliseconds
  
  // Health
  healthy: boolean;
  lastUpdated: Date;
}

// =============================================================================
// EVENT QUERIES
// =============================================================================

export interface EventQuery {
  // Time range
  startTime?: Date;
  endTime?: Date;
  
  // Filters
  filters: EventFilter[];
  
  // Sorting and pagination
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  
  // Aggregations
  aggregations?: EventAggregation[];
  
  // Output format
  includeMetadata: boolean;
  includePayload: boolean;
  fields?: string[];
  
  // Performance hints
  timeout?: number; // milliseconds
  explain?: boolean;
}

export interface EventAggregation {
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'histogram' | 'percentile';
  field: string;
  alias?: string;
  parameters?: JSONObject;
}

export interface EventQueryResult {
  events: SystemEvent[];
  totalCount: number;
  aggregations: Record<string, JSONObject>;
  executionTime: number; // milliseconds
  queryPlan?: JSONObject;
  hasMore: boolean;
  nextOffset?: number;
}

// =============================================================================
// EVENT MONITORING
// =============================================================================

export interface EventBusMetrics {
  // Throughput metrics
  eventsPublished: number;
  eventsDelivered: number;
  eventsFailed: number;
  throughput: number; // events per second
  
  // Latency metrics
  averageLatency: number; // milliseconds
  p50Latency: number; // milliseconds
  p95Latency: number; // milliseconds
  p99Latency: number; // milliseconds
  
  // Size metrics
  averageEventSize: number; // bytes
  totalDataProcessed: number; // bytes
  compressionRatio: number;
  
  // Error metrics
  errorRate: number; // 0-1
  deadLetterCount: number;
  retryCount: number;
  timeoutCount: number;
  
  // Subscription metrics
  activeSubscriptions: number;
  pausedSubscriptions: number;
  failedSubscriptions: number;
  
  // Topic metrics
  activeTopics: number;
  totalPartitions: number;
  underReplicatedPartitions: number;
  
  // Resource metrics
  memoryUsage: number; // bytes
  diskUsage: number; // bytes
  networkUsage: number; // bytes per second
  cpuUsage: number; // percentage
  
  // Performance metrics
  batchingEfficiency: number; // 0-1
  serializationTime: number; // milliseconds
  deserializationTime: number; // milliseconds
  routingTime: number; // milliseconds
  
  // Time range
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface EventBusHealth {
  overall: 'healthy' | 'degraded' | 'critical' | 'failed';
  components: {
    publisher: ComponentHealth;
    subscriber: ComponentHealth;
    router: ComponentHealth;
    storage: ComponentHealth;
    deadletter: ComponentHealth;
  };
  
  // Issues and recommendations
  issues: HealthIssue[];
  recommendations: string[];
  
  // Capacity
  capacity: {
    current: number; // percentage
    projected: number; // percentage
    timeToCapacity: number; // hours
  };
  
  // SLA compliance
  sla: {
    availability: number; // 0-1
    latency: number; // percentage under SLA
    throughput: number; // percentage of target
    errorRate: number; // percentage over SLA
  };
  
  // Last check
  lastCheck: Date;
  nextCheck: Date;
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
  autoResolvable: boolean;
}

// =============================================================================
// EVENT LOGGING
// =============================================================================

export interface EventLogger {
  debug(message: string, event?: SystemEvent, metadata?: JSONObject): void;
  info(message: string, event?: SystemEvent, metadata?: JSONObject): void;
  warn(message: string, event?: SystemEvent, metadata?: JSONObject): void;
  error(message: string, event?: SystemEvent, error?: Error, metadata?: JSONObject): void;
  
  // Event-specific logging
  logEventPublished(event: SystemEvent, result: PublishResult): void;
  logEventDelivered(event: SystemEvent, target: UUID, latency: number): void;
  logEventFailed(event: SystemEvent, error: EventError): void;
  logEventRetry(event: SystemEvent, attempt: number): void;
  
  // Subscription logging
  logSubscriptionCreated(subscription: EventSubscription): void;
  logSubscriptionFailed(subscriptionId: UUID, error: string): void;
  logEventProcessed(event: SystemEvent, subscription: EventSubscription, duration: number): void;
  
  // Stream logging
  logStreamStarted(stream: EventStream): void;
  logStreamFailed(streamId: UUID, error: string): void;
  logCheckpointCreated(streamId: UUID, checkpoint: StreamCheckpoint): void;
}

export interface EventMetrics {
  // Counter operations
  incrementCounter(name: string, tags?: Record<string, string>): void;
  decrementCounter(name: string, tags?: Record<string, string>): void;
  
  // Gauge operations
  setGauge(name: string, value: number, tags?: Record<string, string>): void;
  
  // Histogram operations
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  
  // Timer operations
  startTimer(name: string, tags?: Record<string, string>): () => void;
  recordTime(name: string, duration: number, tags?: Record<string, string>): void;
  
  // Event-specific metrics
  recordEventPublished(event: SystemEvent): void;
  recordEventDelivered(event: SystemEvent, latency: number): void;
  recordEventFailed(event: SystemEvent, error: EventError): void;
  recordProcessingTime(subscription: EventSubscription, duration: number): void;
}

// =============================================================================
// EVENT BUS EVENTS
// =============================================================================

export interface EventBusEvents {
  // Publication events
  'event-published': (event: SystemEvent, result: PublishResult) => void;
  'event-delivery-failed': (event: SystemEvent, target: UUID, error: string) => void;
  'event-expired': (event: SystemEvent) => void;
  
  // Subscription events
  'subscription-created': (subscription: EventSubscription) => void;
  'subscription-deleted': (subscriptionId: UUID) => void;
  'subscription-failed': (subscriptionId: UUID, error: string) => void;
  'subscription-recovered': (subscriptionId: UUID) => void;
  
  // Processing events
  'event-processed': (event: SystemEvent, subscription: EventSubscription, duration: number) => void;
  'event-processing-failed': (event: SystemEvent, subscription: EventSubscription, error: EventError) => void;
  'dead-letter-received': (event: SystemEvent, reason: string) => void;
  
  // Stream events
  'stream-created': (stream: EventStream) => void;
  'stream-started': (streamId: UUID) => void;
  'stream-stopped': (streamId: UUID, reason: string) => void;
  'stream-failed': (streamId: UUID, error: string) => void;
  'checkpoint-created': (streamId: UUID, checkpoint: StreamCheckpoint) => void;
  
  // Topic events
  'topic-created': (topic: EventTopic) => void;
  'topic-deleted': (topicId: UUID) => void;
  'partition-leader-changed': (topicId: UUID, partition: number, newLeader: string) => void;
  'partition-offline': (topicId: UUID, partition: number) => void;
  
  // System events
  'bus-started': () => void;
  'bus-stopped': () => void;
  'bus-paused': () => void;
  'bus-resumed': () => void;
  'performance-degraded': (metric: string, value: number, threshold: number) => void;
  'capacity-warning': (component: string, usage: number, limit: number) => void;
  'health-check-failed': (component: string, error: string) => void;
}