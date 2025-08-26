/**
 * @fileoverview Event System Domain Types - Unified Event Layer Domain
 *
 * Comprehensive type definitions for all event-driven operations, communication,
 * coordination, and messaging within the event system domain. These types define
 * the core domain model for event management, processing, and orchestration.
 *
 * Dependencies: Only imports from @claude-zen/foundation for shared primitives.
 * Domain Independence: Self-contained event system domain types.
 *
 * @package @claude-zen/event-system
 * @since 2.1.0
 * @version 1.0.0
 */

import type {
  UUID,
  Timestamp,
  Priority,
  Status,
  Entity,
  OperationResult as Result,
  ValidationError,
  Optional,
  NonEmptyArray,
  Branded as Brand,
} from '@claude-zen/foundation';

// =============================================================================
// CORE EVENT SYSTEM TYPES
// =============================================================================

/**
 * Event priorities for processing order and urgency
 */
export type EventPriority = 'low|medium|high|critical;

/**
 * Core system event interface - Base for all events
 */
export interface SystemEvent extends Entity {
  type: string;
  priority: EventPriority;
  source: string;
  metadata?: Record<string, unknown>;
  correlationId?: UUID;
}

/**
 * Event processing strategies
 */
export type ProcessingStrategy =|'immediate|queued|batched|throttled|scheduled|async;

/**
 * Event backoff strategies for retry logic
 */
export type BackoffStrategy =|'exponential|linear|fixed|fibonacci|custom;

/**
 * Event reliability levels
 */
export enum ReliabilityLevel {
  BEST_EFFORT = 'best_effort',
  AT_LEAST_ONCE = 'at_least_once',
  AT_MOST_ONCE = 'at_most_once',
  EXACTLY_ONCE = 'exactly_once',
}

// =============================================================================
// EVENT MANAGER CONFIGURATION
// =============================================================================

/**
 * Configuration for event manager instances
 */
export interface EventManagerConfig {
  maxListeners: number;
  processing: ProcessingConfig;
  retry?: RetryConfig;
  health?: HealthConfig;
  monitoring?: MonitoringConfig;
}

/**
 * Event processing configuration
 */
export interface ProcessingConfig {
  strategy: ProcessingStrategy;
  queueSize: number;
  batchSize?: number;
  throttleMs?: number;
  concurrent?: boolean;
  priority?: boolean;
}

/**
 * Retry configuration for failed events
 */
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: BackoffStrategy;
  maxDelay: number;
  jitter?: boolean;
  exponentialBase?: number;
}

/**
 * Health monitoring configuration
 */
export interface HealthConfig {
  checkInterval: number;
  timeout: number;
  failureThreshold: number;
  successThreshold: number;
  enableAutoRecovery: boolean;
}

/**
 * Event monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  trackLatency: boolean;
  trackThroughput: boolean;
  trackErrors: boolean;
  enableProfiling: boolean;
}

// =============================================================================
// SYSTEM LIFECYCLE EVENTS
// =============================================================================

/**
 * System lifecycle events - Core system operations
 */
export interface SystemLifecycleEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||system:health;
  operation: 'start|stop|restart|status|healthcheck;
  status: 'success|warning|error|critical;
  details?: {
    component?: string;
    version?: string;
    duration?: number;
    errorCode?: string;
    errorMessage?: string;
    healthScore?: number;
  };
}

// =============================================================================
// COORDINATION EVENTS
// =============================================================================

/**
 * Coordination events - Multi-agent and swarm coordination
 */
export interface CoordinationEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;
  operation:|''init|spawn|destroy|coordinate|distribute|complete|fail;
  targetId: string; // swarmId, agentId, taskId, etc.
  details?: {
    agentCount?: number;
    topology?: 'mesh|hierarchical|ring|star;
    taskType?: string;
    assignedTo?: string[];
    progress?: number;
    metrics?: {
      latency: number;
      throughput: number;
      reliability: number;
      resourceUsage: {
        cpu: number;
        memory: number;
        network: number;
      };
    };
  };
}

/**
 * Coordination topologies for multi-agent systems
 */
export enum CoordinationTopology {
  CENTRALIZED = 'centralized',
  DECENTRALIZED = 'decentralized',
  HIERARCHICAL = 'hierarchical',
  MESH = 'mesh',
  RING = 'ring',
  TREE = 'tree',
  HYBRID = 'hybrid',
}

// =============================================================================
// COMMUNICATION EVENTS
// =============================================================================

/**
 * Communication events - Network, protocol, and messaging operations
 */
export interface CommunicationEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||communication:stream;
  operation:|'connect|disconnect|send|receive|error|timeout|retry;
  protocol:|''http|https|ws|wss|stdio|tcp|udp | grpc'|custom;
  endpoint?: string;
  details?: {
    requestId?: string;
    toolName?: string;
    statusCode?: number;
    responseTime?: number;
    dataSize?: number;
    errorCode?: string;
    retryAttempt?: number;
    connectionId?: string;
    messageId?: string;
    channelId?: string;
  };
}

/**
 * Communication protocol configuration
 */
export interface CommunicationProtocol {
  type:|'message_passing|shared_memory|event_driven|rpc|streaming;
  format: 'json|binary|protobuf|avro|custom;
  encryption: boolean;
  compression: boolean;
  reliability: ReliabilityLevel;
  timeout?: number;
  retries?: number;
}

// =============================================================================
// MONITORING EVENTS
// =============================================================================

/**
 * Monitoring events - Metrics, health checks, and performance monitoring
 */
export interface MonitoringEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||monitoring:trace;
  operation:|'collect|report|alert|recover|threshold|anomaly|trace;
  component: string;
  details?: {
    metricName?: string;
    metricValue?: number;
    threshold?: number;
    severity?: 'info|warning|error|critical;
    alertId?: string;
    healthScore?: number;
    traceId?: string;
    spanId?: string;
    performanceData?: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
      latency: number;
      throughput: number;
      errorRate: number;
    };
  };
}

// =============================================================================
// INTERFACE EVENTS
// =============================================================================

/**
 * Interface events - User interface and API interactions
 */
export interface InterfaceEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||interface:mobile|interface:desktop;
  operation:|''start|stop|command|request|response|interaction|render;
  interface: 'cli|web|tui|api|mobile|desktop;
  details?: {
    command?: string;
    args?: string[];
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    interactionType?: 'click|key|scroll|focus|input|swipe;
    renderTime?: number;
    bundleSize?: number;
  };
}

// =============================================================================
// NEURAL EVENTS
// =============================================================================

/**
 * Neural events - AI and machine learning operations
 */
export interface NeuralEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||neural:deployment;
  operation:|'train|predict|evaluate|optimize|load|save|export|deploy;
  modelId: string;
  details?: {
    modelType?: string;
    architecture?: string;
    datasetSize?: number;
    batchSize?: number;
    epochs?: number;
    learningRate?: number;
    accuracy?: number;
    loss?: number;
    f1Score?: number;
    precision?: number;
    recall?: number;
    processingTime?: number;
    gpuUsage?: number;
    memoryUsage?: number;
    modelSize?: number;
    inferenceSpeed?: number;
  };
}

// =============================================================================
// DATABASE EVENTS
// =============================================================================

/**
 * Database events - Data persistence and query operations
 */
export interface DatabaseEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||database:replication;
  operation:|'select|insert|update|delete|create|drop|index | backup'|restore|replicate;
  details?: {
    tableName?: string;
    databaseName?: string;
    queryType?: 'read|write|ddl|dcl|dml;
    recordCount?: number;
    queryTime?: number;
    cacheHit?: boolean;
    indexUsed?: boolean;
    transactionId?: string;
    lockTime?: number;
    errorCode?: string;
    connectionPoolSize?: number;
    replicationLag?: number;
  };
}

// =============================================================================
// MEMORY EVENTS
// =============================================================================

/**
 * Memory events - Memory management and caching operations
 */
export interface MemoryEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||memory:vector|memory:graph;
  operation:|''get|set|delete|clear|expire|cleanup|allocate | deallocate'|search|index;
  details?: {
    key?: string;
    keyPattern?: string;
    size?: number;
    ttl?: number;
    cacheHit?: boolean;
    evictionCount?: number;
    memoryUsage?: number;
    poolSize?: number;
    gcDuration?: number;
    gcType?: 'minor|major|full|incremental;
    objectCount?: number;
    vectorDimensions?: number;
    similarityScore?: number;
  };
}

// =============================================================================
// WORKFLOW EVENTS
// =============================================================================

/**
 * Workflow events - Process orchestration and execution
 */
export interface WorkflowEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||workflow:orchestration|workflow:schedule;
  operation:|''start|complete|fail|retry|skip|branch|merge | loop'|create|pause | resume'|cancel|schedule;
  workflowId: string;
  taskId?: string;
  details?: {
    workflowName?: string;
    taskName?: string;
    stepNumber?: number;
    totalSteps?: number;
    executionTime?: number;
    inputData?: unknown;
    outputData?: unknown;
    errorMessage?: string;
    retryCount?: number;
    conditionResult?: boolean;
    branchTaken?: string;
    loopIteration?: number;
    scheduleExpression?: string;
    nextExecution?: Timestamp;
  };
}

// =============================================================================
// ORCHESTRATION EVENTS
// =============================================================================

/**
 * Multi-level orchestration events - Enterprise-scale coordination
 */
export interface OrchestrationEvent extends SystemEvent {
  type:|''javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||orchestration:bottleneck;
  operation:|'plan|execute|monitor|optimize|escalate|delegate|coordinate|sync;
  level: 'portfolio' | 'program' | 'execution;
  details?: {
    orchestrationId?: string;
    parentId?: string;
    wipLimit?: number;
    flowRate?: number;
    bottleneckDetected?: boolean;
    escalationReason?: string;
    resourceAllocation?: Record<string, number>;
    metrics?: {
      throughput: number;
      cycleTime: number;
      leadTime: number;
      efficiency: number;
    };
  };
}

// =============================================================================
// SAFE FRAMEWORK EVENTS
// =============================================================================

/**
 * SAFe (Scaled Agile Framework) events for enterprise agile coordination
 */
export interface SafeEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||safe:execution;
  operation:|'epic_created|epic_prioritized|epic_approved|epic_funded|epic_completed|pi_planning|pi_execution | pi_review'|value_stream_mapped|objective_set;
  details?: {
    epicId?: string;
    piId?: string;
    valueStreamId?: string;
    businessValue?: number;
    confidence?: number;
    phase?: 'preparation|day1|day2|finalization;
    investmentHorizon?: 'near' | 'mid' | 'long;
    budgetAllocation?: number;
    piObjectives?: Array<{
      id: string;
      description: string;
      businessValue: number;
      confidence: number;
    }>;
  };
}

// =============================================================================
// MEMORY ORCHESTRATION EVENTS
// =============================================================================

/**
 * Advanced memory orchestration events for cross-system coordination
 */
export interface MemoryOrchestrationEvent extends SystemEvent {
  type:|'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin'||memory_orchestration:optimization;
  operation:|'sync_initiated|sync_completed|coordination_updated|cache_populated|cache_invalidated|cache_refreshed|cache_migrated | consistency_check'|optimization_applied;
  details?: {
    systemId?: string;
    cacheId?: string;
    syncType?: 'full' | 'incremental' | 'delta;
    dataSize?: number;
    keyPattern?: string;
    consistencyLevel?: 'eventual' | 'strong' | 'weak;
    optimizationStrategy?: 'lru|lfu|ttl|adaptive;
    memoryPools?: string[];
    crossSystemSync?: boolean;
  };
}

// =============================================================================
// UNIFIED EVENT TYPES
// =============================================================================

/**
 * Union type for all event system domain events
 */
export type UELEvent =|SystemLifecycleEvent|CoordinationEvent|CommunicationEvent|MonitoringEvent|InterfaceEvent|NeuralEvent|DatabaseEvent|MemoryEvent|WorkflowEvent|OrchestrationEvent|SafeEvent|MemoryOrchestrationEvent;

// =============================================================================
// EVENT CATEGORIES AND PATTERNS
// =============================================================================

/**
 * Event category definitions for organization and filtering
 */
export const EventCategories = {
  SYSTEM:'system' as const,
  COORDINATION: 'coordination' as const,
  COMMUNICATION: 'communication' as const,
  MONITORING: 'monitoring' as const,
  INTERFACE: 'interface' as const,
  NEURAL: 'neural' as const,
  DATABASE: 'database' as const,
  MEMORY: 'memory' as const,
  WORKFLOW: 'workflow' as const,
  ORCHESTRATION: 'orchestration' as const,
  SAFE: 'safe' as const,
  MEMORY_ORCHESTRATION: 'memory_orchestration' as const,
} as const;

/**
 * Event type patterns for filtering and matching
 */
export const EventTypePatterns = {
  // System events
  SYSTEM_ALL: 'system:*',
  SYSTEM_LIFECYCLE:
    'system:startup|system:shutdown|system:restart|system:error|system:health',

  // Coordination events
  COORDINATION_ALL: 'coordination:*',
  COORDINATION_SWARM: 'coordination:swarm',
  COORDINATION_AGENTS: 'coordination:agent',
  COORDINATION_TASKS: 'coordination:task',

  // Communication events
  COMMUNICATION_ALL: 'communication:*',
  COMMUNICATION_WEBSOCKET: 'communication:websocket',
  COMMUNICATION_HTTP: 'communication:http',

  // Monitoring events
  MONITORING_ALL: 'monitoring:*',
  MONITORING_METRICS: 'monitoring:metrics',
  MONITORING_HEALTH: 'monitoring:health',
  MONITORING_ALERTS: 'monitoring:alert',

  // Interface events
  INTERFACE_ALL: 'interface:*',
  INTERFACE_CLI: 'interface:cli',
  INTERFACE_WEB: 'interface:web',
  INTERFACE_API: 'interface:api',

  // Neural events
  NEURAL_ALL: 'neural:*',
  NEURAL_TRAINING: 'neural:training',
  NEURAL_INFERENCE: 'neural:inference',

  // Database events
  DATABASE_ALL: 'database:*',
  DATABASE_QUERIES: 'database:query',
  DATABASE_TRANSACTIONS: 'database:transaction',

  // Memory events
  MEMORY_ALL: 'memory:*',
  MEMORY_CACHE: 'memory:cache',
  MEMORY_GC: 'memory:gc',

  // Workflow events
  WORKFLOW_ALL: 'workflow:*',
  WORKFLOW_EXECUTION: 'workflow:execution',
  WORKFLOW_TASKS: 'workflow:task',

  // Orchestration events
  ORCHESTRATION_ALL: 'orchestration:*',
  ORCHESTRATION_PORTFOLIO: 'orchestration:portfolio',
  ORCHESTRATION_PROGRAM: 'orchestration:program',

  // SAFe events
  SAFE_ALL: 'safe:*',
  SAFE_PORTFOLIO: 'safe:portfolio',
  SAFE_PI: 'safe:pi',

  // Memory orchestration events
  MEMORY_ORCHESTRATION_ALL: 'memory_orchestration:*',
  MEMORY_ORCHESTRATION_SYNC: 'memory_orchestration:sync',
  MEMORY_ORCHESTRATION_CACHE: 'memory_orchestration:cache',
} as const;

// =============================================================================
// EVENT PRIORITY MAPPINGS
// =============================================================================

/**
 * Event priority mappings by type for intelligent processing
 */
export const EventPriorityMap: Record<string, EventPriority> = {
  // System events - highest priority
  'system:error': 'critical',
  'system:shutdown': 'critical',
  'system:startup': 'high',
  'system:health': 'medium',

  // Coordination events - high priority for critical operations
  'coordination:swarm': 'high',
  'coordination:agent': 'high',
  'coordination:task': 'medium',

  // Communication events - medium to high priority
  'communication:websocket': 'high',
  'communication:http': 'medium',

  // Monitoring events - medium priority with critical alerts
  'monitoring:alert': 'high',
  'monitoring:health': 'medium',
  'monitoring:metrics': 'low',

  // Interface events - medium priority
  'interface:cli': 'medium',
  'interface:web': 'medium',
  'interface:api': 'medium',

  // Neural events - lower priority due to longer processing
  'neural:training': 'low',
  'neural:inference': 'medium',

  // Database events - medium priority
  'database:query': 'medium',
  'database:transaction': 'high',

  // Memory events - lower priority
  'memory:cache': 'low',
  'memory:store': 'medium',

  // Workflow events - medium priority
  'workflow:execution': 'medium',
  'workflow:task': 'medium',

  // Orchestration events - high priority
  'orchestration:portfolio': 'high',
  'orchestration:program': 'high',
} as const;

// =============================================================================
// EVENT CONSTANTS
// =============================================================================

/**
 * Event system constants for consistent configuration
 */
export const EventConstants = {
  // Default values
  DEFAULT_PRIORITY: 'medium' as EventPriority,
  DEFAULT_PROCESSING_STRATEGY: 'queued' as const,
  DEFAULT_BATCH_SIZE: 50,
  DEFAULT_QUEUE_SIZE: 1000,
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000,

  // Limits
  MAX_EVENT_SIZE: 1024 * 1024, // 1MB
  MAX_BATCH_SIZE: 1000,
  MAX_QUEUE_SIZE: 100000,
  MAX_LISTENERS: 10000,
  MAX_METADATA_SIZE: 64 * 1024, // 64KB

  // Timeouts
  HEALTH_CHECK_TIMEOUT: 5000,
  METRICS_COLLECTION_TIMEOUT: 10000,
  EVENT_EMISSION_TIMEOUT: 30000,
  SUBSCRIPTION_TIMEOUT: 15000,

  // Intervals
  DEFAULT_HEALTH_CHECK_INTERVAL: 30000,
  DEFAULT_METRICS_INTERVAL: 10000,
  DEFAULT_CLEANUP_INTERVAL: 300000, // 5 minutes

  // Patterns
  EVENT_ID_PATTERN: /^[a-zA-Z0-9-_]+$/,
  EVENT_TYPE_PATTERN: /^[a-zA-Z0-9]+:[a-zA-Z0-9-_]+$/,
  SOURCE_PATTERN: /^[a-zA-Z0-9-_]+:[a-zA-Z0-9-_]+$/,
} as const;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guards for runtime event type checking
 */
export const UELTypeGuards = {
  isSystemLifecycleEvent: (
    event: SystemEvent
  ): event is SystemLifecycleEvent => {
    return event.type.startsWith('system:');'
  },

  isCoordinationEvent: (event: SystemEvent): event is CoordinationEvent => {
    return event.type.startsWith('coordination:');'
  },

  isCommunicationEvent: (event: SystemEvent): event is CommunicationEvent => {
    return event.type.startsWith('communication:');'
  },

  isMonitoringEvent: (event: SystemEvent): event is MonitoringEvent => {
    return event.type.startsWith('monitoring:');'
  },

  isInterfaceEvent: (event: SystemEvent): event is InterfaceEvent => {
    return event.type.startsWith('interface:');'
  },

  isNeuralEvent: (event: SystemEvent): event is NeuralEvent => {
    return event.type.startsWith('neural:');'
  },

  isDatabaseEvent: (event: SystemEvent): event is DatabaseEvent => {
    return event.type.startsWith('database:');'
  },

  isMemoryEvent: (event: SystemEvent): event is MemoryEvent => {
    return event.type.startsWith('memory:');'
  },

  isWorkflowEvent: (event: SystemEvent): event is WorkflowEvent => {
    return event.type.startsWith('workflow:');'
  },

  isOrchestrationEvent: (event: SystemEvent): event is OrchestrationEvent => {
    return event.type.startsWith('orchestration:');'
  },

  isSafeEvent: (event: SystemEvent): event is SafeEvent => {
    return event.type.startsWith('safe:');'
  },

  isMemoryOrchestrationEvent: (
    event: SystemEvent
  ): event is MemoryOrchestrationEvent => {
    return event.type.startsWith('memory_orchestration:');'
  },

  isUELEvent: (event: SystemEvent): event is UELEvent => {
    const category = event.type.split(':')[0];'
    return Object.values(EventCategories).includes(category as any);
  },
} as const;

// =============================================================================
// RESULT TYPES FOR EVENT OPERATIONS
// =============================================================================

/**
 * Result types for event system operations
 */
export type EventResult<T> = Result<T, EventError>;
export type EventProcessingResult = Result<ProcessingStatus, ProcessingError>;
export type EventSubscriptionResult = Result<
  SubscriptionInfo,
  SubscriptionError
>;

/**
 * Event processing status
 */
export interface ProcessingStatus {
  processed: number;
  failed: number;
  retried: number;
  duration: number;
}

/**
 * Event subscription information
 */
export interface SubscriptionInfo {
  subscriptionId: UUID;
  eventTypes: string[];
  active: boolean;
  createdAt: Timestamp;
}

/**
 * Event-specific error types
 */
export interface EventError extends ValidationError {
  type: 'EventError;
  category: 'processing|subscription|emission|configuration;
  eventId?: UUID;
  eventType?: string;
}

/**
 * Processing-specific error types
 */
export interface ProcessingError extends EventError {
  category: 'processing;
  batchId?: UUID;
  queueSize?: number;
  retryCount?: number;
}

/**
 * Subscription-specific error types
 */
export interface SubscriptionError extends EventError {
  category: 'subscription;
  subscriptionId?: UUID;
  listenerCount?: number;
}

// Export default for convenience
export default {
  // Enums
  ReliabilityLevel,
  CoordinationTopology,

  // Constants
  EventCategories,
  EventTypePatterns,
  EventPriorityMap,
  EventConstants,

  // Type guards
  UELTypeGuards,
};
