/**
 * Unified Event Layer (UEL) - Type Definitions.
 *
 * Core type definitions for event types, manager types, and enums.
 * Used throughout the UEL system for type-safe event operations.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */

import type { EventPriority, SystemEvent } from './core/interfaces';

/**
 * System Events - Core system lifecycle and health.
 *
 * @example
 */
export interface SystemLifecycleEvent extends SystemEvent {
  type:
    | 'system:startup'
    | 'system:shutdown'
    | 'system:restart'
    | 'system:error'
    | 'system:health';
  operation: 'start' | 'stop' | 'restart' | 'status' | 'healthcheck';
  status: 'success' | 'warning' | 'error' | 'critical';
  details?: {
    component?: string;
    version?: string;
    duration?: number;
    errorCode?: string;
    errorMessage?: string;
    healthScore?: number;
  };
}

/**
 * Coordination Events - Swarm coordination and agent management.
 *
 * @example
 */
export interface CoordinationEvent extends SystemEvent {
  type:
    | 'coordination:swarm'
    | 'coordination:agent'
    | 'coordination:task'
    | 'coordination:topology';
  operation:
    | 'init'
    | 'spawn'
    | 'destroy'
    | 'coordinate'
    | 'distribute'
    | 'complete'
    | 'fail';
  targetId: string; // swarmId, agentId, taskId, etc.
  details?: {
    agentCount?: number;
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    taskType?: string;
    assignedTo?: string[];
    progress?: number;
    metrics?: {
      latency: number;
      throughput: number;
      reliability: number;
      resources: {
        cpu: number;
        memory: number;
        network: number;
      };
    };
  };
}

/**
 * Communication Events - WebSocket, HTTP, protocol communication.
 *
 * @example
 */
export interface CommunicationEvent extends SystemEvent {
  type:
    | 'communication:websocket'
    | 'communication:http'
    | 'communication:protocol';
  operation:
    | 'connect'
    | 'disconnect'
    | 'send'
    | 'receive'
    | 'error'
    | 'timeout'
    | 'retry';
  protocol:
    | 'http'
    | 'https'
    | 'ws'
    | 'wss'
    | 'stdio'
    | 'tcp'
    | 'udp'
    | 'custom';
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
  };
}

/**
 * Monitoring Events - Metrics, health checks, performance monitoring.
 *
 * @example
 */
export interface MonitoringEvent extends SystemEvent {
  type:
    | 'monitoring:metrics'
    | 'monitoring:health'
    | 'monitoring:alert'
    | 'monitoring:performance';
  operation:
    | 'collect'
    | 'report'
    | 'alert'
    | 'recover'
    | 'threshold'
    | 'anomaly';
  component: string;
  details?: {
    metricName?: string;
    metricValue?: number;
    threshold?: number;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    alertId?: string;
    healthScore?: number;
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

/**
 * Interface Events - CLI, web, terminal interface interactions.
 *
 * @example
 */
export interface InterfaceEvent extends SystemEvent {
  type: 'interface:cli' | 'interface:web' | 'interface:tui' | 'interface:api';
  operation:
    | 'start'
    | 'stop'
    | 'command'
    | 'request'
    | 'response'
    | 'interaction'
    | 'render';
  interface: 'cli' | 'web' | 'tui' | 'api';
  details?: {
    command?: string;
    args?: string[];
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    userId?: string;
    sessionId?: string;
    interactionType?: 'click' | 'key' | 'scroll' | 'focus' | 'input';
    renderTime?: number;
  };
}

/**
 * Neural Events - Neural network and AI operations.
 *
 * @example
 */
export interface NeuralEvent extends SystemEvent {
  type:
    | 'neural:training'
    | 'neural:inference'
    | 'neural:optimization'
    | 'neural:evaluation';
  operation:
    | 'train'
    | 'predict'
    | 'evaluate'
    | 'optimize'
    | 'load'
    | 'save'
    | 'export';
  modelId: string;
  details?: {
    modelType?: string;
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
  };
}

/**
 * Database Events - Database operations and queries.
 *
 * @example
 */
export interface DatabaseEvent extends SystemEvent {
  type:
    | 'database:query'
    | 'database:transaction'
    | 'database:migration'
    | 'database:backup';
  operation:
    | 'select'
    | 'insert'
    | 'update'
    | 'delete'
    | 'create'
    | 'drop'
    | 'index'
    | 'backup'
    | 'restore';
  details?: {
    tableName?: string;
    queryType?: 'read' | 'write' | 'ddl' | 'dcl';
    recordCount?: number;
    queryTime?: number;
    cacheHit?: boolean;
    indexUsed?: boolean;
    transactionId?: string;
    lockTime?: number;
    errorCode?: string;
    connectionPoolSize?: number;
  };
}

/**
 * Memory Events - Memory operations and caching.
 *
 * @example
 */
export interface MemoryEvent extends SystemEvent {
  type: 'memory:cache' | 'memory:store' | 'memory:gc' | 'memory:pool';
  operation:
    | 'get'
    | 'set'
    | 'delete'
    | 'clear'
    | 'expire'
    | 'cleanup'
    | 'allocate'
    | 'deallocate';
  details?: {
    key?: string;
    size?: number;
    ttl?: number;
    cacheHit?: boolean;
    evictionCount?: number;
    memoryUsage?: number;
    poolSize?: number;
    gcDuration?: number;
    gcType?: 'minor' | 'major' | 'full';
    objectCount?: number;
  };
}

/**
 * Workflow Events - Workflow execution and orchestration.
 *
 * @example
 */
export interface WorkflowEvent extends SystemEvent {
  type:
    | 'workflow:execution'
    | 'workflow:task'
    | 'workflow:condition'
    | 'workflow:trigger'
    | 'workflow:orchestration';
  operation:
    | 'start'
    | 'complete'
    | 'fail'
    | 'retry'
    | 'skip'
    | 'branch'
    | 'merge'
    | 'loop'
    | 'orchestrate';
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
    // Additional properties used by workflow implementation
    orchestrationId?: string;
    totalTasks?: number;
    error?: string;
    attempt?: number;
    duration?: number;
    dependency?: string;
    action?: string;
  };
}

// ============================================================================
// ORCHESTRATION EVENTS - Multi-level orchestration events
// ============================================================================

/**
 * Multi-level orchestration events for Portfolio → Program → Swarm execution.
 */
export interface OrchestrationEvent extends SystemEvent {
  type:
    | 'orchestration:portfolio'
    | 'orchestration:program'
    | 'orchestration:execution'
    | 'orchestration:flow'
    | 'orchestration:bottleneck';
  operation:
    | 'plan'
    | 'execute'
    | 'monitor'
    | 'optimize'
    | 'escalate'
    | 'delegate'
    | 'coordinate'
    | 'sync';
  level: 'portfolio' | 'program' | 'execution';
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

// ============================================================================
// SAFE FRAMEWORK EVENTS - SAFe methodology events
// ============================================================================

/**
 * SAFe (Scaled Agile Framework) events for enterprise agile coordination.
 */
export interface SafeEvent extends SystemEvent {
  type:
    | 'safe:portfolio'
    | 'safe:pi'
    | 'safe:value_stream'
    | 'safe:planning'
    | 'safe:execution';
  operation:
    | 'epic_created'
    | 'epic_prioritized'
    | 'epic_approved'
    | 'epic_funded'
    | 'epic_completed'
    | 'pi_planning'
    | 'pi_execution'
    | 'pi_review'
    | 'value_stream_mapped'
    | 'objective_set';
  details?: {
    epicId?: string;
    piId?: string;
    valueStreamId?: string;
    businessValue?: number;
    confidence?: number;
    phase?: 'preparation' | 'day1' | 'day2' | 'finalization';
    investmentHorizon?: 'near' | 'mid' | 'long';
    budgetAllocation?: number;
    piObjectives?: Array<{
      id: string;
      description: string;
      businessValue: number;
      confidence: number;
    }>;
  };
}

// ============================================================================
// MEMORY ORCHESTRATION EVENTS - Advanced memory coordination events
// ============================================================================

/**
 * Memory orchestration events for advanced memory coordination across systems.
 */
export interface MemoryOrchestrationEvent extends SystemEvent {
  type:
    | 'memory_orchestration:sync'
    | 'memory_orchestration:coordination'
    | 'memory_orchestration:cache'
    | 'memory_orchestration:consistency'
    | 'memory_orchestration:optimization';
  operation:
    | 'sync_initiated'
    | 'sync_completed'
    | 'coordination_updated'
    | 'cache_populated'
    | 'cache_invalidated'
    | 'cache_refreshed'
    | 'cache_migrated'
    | 'consistency_check'
    | 'optimization_applied';
  details?: {
    systemId?: string;
    cacheId?: string;
    syncType?: 'full' | 'incremental' | 'delta';
    dataSize?: number;
    keyPattern?: string;
    consistencyLevel?: 'eventual' | 'strong' | 'weak';
    optimizationStrategy?: 'lru' | 'lfu' | 'ttl' | 'adaptive';
    memoryPools?: string[];
    crossSystemSync?: boolean;
  };
}

/**
 * Union type for all UEL events.
 */
export type UELEvent =
  | SystemLifecycleEvent
  | CoordinationEvent
  | CommunicationEvent
  | MonitoringEvent
  | InterfaceEvent
  | NeuralEvent
  | DatabaseEvent
  | MemoryEvent
  | WorkflowEvent
  | OrchestrationEvent
  | SafeEvent
  | MemoryOrchestrationEvent;

/**
 * Event category mappings for organization.
 */
export const EventCategories = {
  SYSTEM: 'system' as const,
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
 * Event type patterns for filtering and matching.
 */
export const EventTypePatterns = {
  // System events
  SYSTEM_ALL: 'system:*',
  SYSTEM_LIFECYCLE: [
    'system:startup',
    'system:shutdown',
    'system:restart',
    'system:error',
    'system:health'
  ] as const,

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
  ORCHESTRATION_EXECUTION: 'orchestration:execution',
  ORCHESTRATION_FLOW: 'orchestration:flow',

  // SAFe events
  SAFE_ALL: 'safe:*',
  SAFE_PORTFOLIO: 'safe:portfolio',
  SAFE_PI: 'safe:pi',
  SAFE_VALUE_STREAM: 'safe:value_stream',
  SAFE_PLANNING: 'safe:planning',

  // Memory orchestration events
  MEMORY_ORCHESTRATION_ALL: 'memory_orchestration:*',
  MEMORY_ORCHESTRATION_SYNC: 'memory_orchestration:sync',
  MEMORY_ORCHESTRATION_CACHE: 'memory_orchestration:cache',
  MEMORY_ORCHESTRATION_CONSISTENCY: 'memory_orchestration:consistency',
} as const;

/**
 * Default configurations for different event manager types.
 */
export const DefaultEventManagerConfigs = {
  [EventCategories.SYSTEM]: {
    maxListeners: 100,
    processing: {
      strategy: 'immediate' as const,
      queueSize: 1000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential' as const,
      maxDelay: 5000,
    },
    health: {
      checkInterval: 30000,
      timeout: 5000,
      failureThreshold: 3,
      successThreshold: 2,
      enableAutoRecovery: true,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
    },
  },

  [EventCategories.COORDINATION]: {
    maxListeners: 1000,
    processing: {
      strategy: 'queued' as const,
      queueSize: 10000,
    },
    retry: {
      attempts: 5,
      delay: 500,
      backoff: 'exponential' as const,
      maxDelay: 10000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
  },

  [EventCategories.COMMUNICATION]: {
    maxListeners: 500,
    processing: {
      strategy: 'immediate' as const,
      queueSize: 5000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'linear' as const,
      maxDelay: 5000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 2000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
    },
  },

  [EventCategories.MONITORING]: {
    maxListeners: 200,
    processing: {
      strategy: 'batched' as const,
      batchSize: 50,
      queueSize: 2000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 15000,
      trackLatency: false,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
    },
  },

  [EventCategories.INTERFACE]: {
    maxListeners: 100,
    processing: {
      strategy: 'immediate' as const,
      queueSize: 1000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: true,
      trackThroughput: false,
      trackErrors: true,
      enableProfiling: false,
    },
  },

  [EventCategories.NEURAL]: {
    maxListeners: 50,
    processing: {
      strategy: 'queued' as const,
      queueSize: 500,
    },
    retry: {
      attempts: 2,
      delay: 2000,
      backoff: 'fixed' as const,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: true,
      trackThroughput: false,
      trackErrors: true,
      enableProfiling: true,
    },
  },

  [EventCategories.DATABASE]: {
    maxListeners: 200,
    processing: {
      strategy: 'batched' as const,
      batchSize: 100,
      queueSize: 5000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
    },
  },

  [EventCategories.MEMORY]: {
    maxListeners: 100,
    processing: {
      strategy: 'throttled' as const,
      throttleMs: 100,
      queueSize: 2000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: false,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
    },
  },

  [EventCategories.WORKFLOW]: {
    maxListeners: 300,
    processing: {
      strategy: 'queued' as const,
      queueSize: 3000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential' as const,
      maxDelay: 8000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
  },

  [EventCategories.ORCHESTRATION]: {
    maxListeners: 500,
    processing: {
      strategy: 'queued' as const,
      queueSize: 5000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential' as const,
      maxDelay: 10000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 3000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
  },

  [EventCategories.SAFE]: {
    maxListeners: 200,
    processing: {
      strategy: 'queued' as const,
      queueSize: 2000,
    },
    retry: {
      attempts: 2,
      delay: 2000,
      backoff: 'linear' as const,
      maxDelay: 10000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: true,
      trackThroughput: false,
      trackErrors: true,
      enableProfiling: false,
    },
  },

  [EventCategories.MEMORY_ORCHESTRATION]: {
    maxListeners: 300,
    processing: {
      strategy: 'batched' as const,
      batchSize: 25,
      queueSize: 3000,
    },
    retry: {
      attempts: 3,
      delay: 1500,
      backoff: 'exponential' as const,
      maxDelay: 8000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
  },
} as const;

/**
 * Event priority mappings by type.
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
  'coordination:topology': 'medium',

  // Communication events - medium to high priority
  'communication:websocket': 'high',
  'communication:http': 'medium',
  'communication:protocol': 'medium',

  // Monitoring events - medium priority with critical alerts
  'monitoring:alert': 'high',
  'monitoring:health': 'medium',
  'monitoring:metrics': 'low',
  'monitoring:performance': 'low',

  // Interface events - lower priority
  'interface:cli': 'medium',
  'interface:web': 'medium',
  'interface:tui': 'low',
  'interface:api': 'medium',

  // Neural events - lower priority due to longer processing
  'neural:training': 'low',
  'neural:inference': 'medium',
  'neural:optimization': 'low',
  'neural:evaluation': 'low',

  // Database events - medium priority
  'database:query': 'medium',
  'database:transaction': 'high',
  'database:migration': 'high',
  'database:backup': 'low',

  // Memory events - lower priority
  'memory:cache': 'low',
  'memory:store': 'medium',
  'memory:gc': 'low',
  'memory:pool': 'low',

  // Workflow events - medium priority
  'workflow:execution': 'medium',
  'workflow:task': 'medium',
  'workflow:condition': 'low',
  'workflow:trigger': 'high',

  // Orchestration events - high priority for coordination
  'orchestration:portfolio': 'high',
  'orchestration:program': 'high',
  'orchestration:execution': 'medium',
  'orchestration:flow': 'medium',
  'orchestration:bottleneck': 'high',

  // SAFe events - medium to high priority
  'safe:portfolio': 'high',
  'safe:pi': 'high',
  'safe:value_stream': 'medium',
  'safe:planning': 'medium',
  'safe:execution': 'medium',

  // Memory orchestration events - medium priority
  'memory_orchestration:sync': 'medium',
  'memory_orchestration:coordination': 'medium',
  'memory_orchestration:cache': 'low',
  'memory_orchestration:consistency': 'high',
  'memory_orchestration:optimization': 'low',
} as const;

/**
 * Event source categories for filtering.
 */
export const EventSources = {
  // System sources
  SYSTEM_CORE: 'system:core',
  SYSTEM_SCHEDULER: 'system:scheduler',
  SYSTEM_HEALTH: 'system:health',

  // Coordination sources
  COORDINATION_SWARM: 'coordination:swarm',
  COORDINATION_AGENT: 'coordination:agent',
  COORDINATION_MAESTRO: 'coordination:maestro',
  COORDINATION_ORCHESTRATOR: 'coordination:orchestrator',

  // Communication sources
  COMMUNICATION_WEBSOCKET: 'communication:websocket',
  COMMUNICATION_HTTP_CLIENT: 'communication:http-client',

  // Monitoring sources
  MONITORING_METRICS: 'monitoring:metrics',
  MONITORING_HEALTH: 'monitoring:health',
  MONITORING_PERFORMANCE: 'monitoring:performance',
  MONITORING_ALERTS: 'monitoring:alerts',

  // Interface sources
  INTERFACE_CLI: 'interface:cli',
  INTERFACE_WEB: 'interface:web',
  INTERFACE_TUI: 'interface:tui',
  INTERFACE_API: 'interface:api',

  // Neural sources
  NEURAL_TRAINER: 'neural:trainer',
  NEURAL_INFERENCE: 'neural:inference',
  NEURAL_OPTIMIZER: 'neural:optimizer',
  NEURAL_EVALUATOR: 'neural:evaluator',

  // Database sources
  DATABASE_QUERY_ENGINE: 'database:query-engine',
  DATABASE_TRANSACTION_MANAGER: 'database:transaction-manager',
  DATABASE_MIGRATION_RUNNER: 'database:migration-runner',
  DATABASE_BACKUP_SERVICE: 'database:backup-service',

  // Memory sources
  MEMORY_CACHE_MANAGER: 'memory:cache-manager',
  MEMORY_STORE_MANAGER: 'memory:store-manager',
  MEMORY_GC_SERVICE: 'memory:gc-service',
  MEMORY_POOL_MANAGER: 'memory:pool-manager',

  // Workflow sources
  WORKFLOW_ENGINE: 'workflow:engine',
  WORKFLOW_SCHEDULER: 'workflow:scheduler',
  WORKFLOW_EXECUTOR: 'workflow:executor',
  WORKFLOW_MONITOR: 'workflow:monitor',

  // Orchestration sources
  ORCHESTRATION_PORTFOLIO_MANAGER: 'orchestration:portfolio-manager',
  ORCHESTRATION_PROGRAM_COORDINATOR: 'orchestration:program-coordinator',
  ORCHESTRATION_EXECUTION_ENGINE: 'orchestration:execution-engine',
  ORCHESTRATION_FLOW_MONITOR: 'orchestration:flow-monitor',
  ORCHESTRATION_BOTTLENECK_DETECTOR: 'orchestration:bottleneck-detector',

  // SAFe sources
  SAFE_PORTFOLIO_MANAGER: 'safe:portfolio-manager',
  SAFE_PI_PLANNER: 'safe:pi-planner',
  SAFE_VALUE_STREAM_MAPPER: 'safe:value-stream-mapper',
  SAFE_EPIC_MANAGER: 'safe:epic-manager',
  SAFE_OBJECTIVE_TRACKER: 'safe:objective-tracker',

  // Memory orchestration sources
  MEMORY_ORCHESTRATION_COORDINATOR: 'memory_orchestration:coordinator',
  MEMORY_ORCHESTRATION_SYNC_MANAGER: 'memory_orchestration:sync-manager',
  MEMORY_ORCHESTRATION_CACHE_COORDINATOR:
    'memory_orchestration:cache-coordinator',
  MEMORY_ORCHESTRATION_CONSISTENCY_CHECKER:
    'memory_orchestration:consistency-checker',
  MEMORY_ORCHESTRATION_OPTIMIZER: 'memory_orchestration:optimizer',
} as const;

/**
 * Type guards for UEL event types.
 */
export const UELTypeGuards = {
  isSystemLifecycleEvent: (
    event: SystemEvent
  ): event is SystemLifecycleEvent => event.type.startsWith('system:'),

  isCoordinationEvent: (event: SystemEvent): event is CoordinationEvent => event.type.startsWith('coordination:'),

  isCommunicationEvent: (event: SystemEvent): event is CommunicationEvent => event.type.startsWith('communication:'),

  isMonitoringEvent: (event: SystemEvent): event is MonitoringEvent => event.type.startsWith('monitoring:'),

  isInterfaceEvent: (event: SystemEvent): event is InterfaceEvent => event.type.startsWith('interface:'),

  isNeuralEvent: (event: SystemEvent): event is NeuralEvent => event.type.startsWith('neural:'),

  isDatabaseEvent: (event: SystemEvent): event is DatabaseEvent => event.type.startsWith('database:'),

  isMemoryEvent: (event: SystemEvent): event is MemoryEvent => event.type.startsWith('memory:'),

  isWorkflowEvent: (event: SystemEvent): event is WorkflowEvent => event.type.startsWith('workflow:'),

  isOrchestrationEvent: (event: SystemEvent): event is OrchestrationEvent => event.type.startsWith('orchestration:'),

  isSafeEvent: (event: SystemEvent): event is SafeEvent => event.type.startsWith('safe:'),

  isMemoryOrchestrationEvent: (
    event: SystemEvent
  ): event is MemoryOrchestrationEvent => event.type.startsWith('memory_orchestration:'),

  isUELEvent: (event: SystemEvent): event is UELEvent => {
    const category = event.type.split(':')[0];
    return Object.values(EventCategories).includes(category as any);
  },
} as const;

/**
 * Event constants for consistent usage.
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
  EVENT_ID_PATTERN: /^[\w-]+$/,
  EVENT_TYPE_PATTERN: /^[\dA-Za-z]+:[\w-]+$/,
  SOURCE_PATTERN: /^[\w-]+:[\w-]+$/,
} as const;

export default {
  EventCategories,
  EventTypePatterns,
  DefaultEventManagerConfigs,
  EventPriorityMap,
  EventSources,
  UELTypeGuards,
  EventConstants,
} as const;
