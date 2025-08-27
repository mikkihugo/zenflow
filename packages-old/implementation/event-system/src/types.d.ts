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
    type: 'system:startup' | 'system:shutdown' | 'system:restart' | 'system:error' | 'system:health';
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
    type: 'coordination:swarm' | 'coordination:agent' | 'coordination:task' | 'coordination:topology';
    operation: 'init' | 'spawn' | 'destroy' | 'coordinate' | 'distribute' | 'complete' | 'fail';
    targetId: string;
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
    type: 'communication:websocket' | 'communication:http' | 'communication:protocol';
    operation: 'connect' | 'disconnect' | 'send' | 'receive' | 'error' | 'timeout' | 'retry';
    protocol: 'http' | 'https' | 'ws' | 'wss' | 'stdio' | 'tcp' | 'udp' | 'custom';
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
    type: 'monitoring:metrics' | 'monitoring:health' | 'monitoring:alert' | 'monitoring:performance';
    operation: 'collect' | 'report' | 'alert' | 'recover' | 'threshold' | 'anomaly';
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
    operation: 'start' | 'stop' | 'command' | 'request' | 'response' | 'interaction' | 'render';
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
    type: 'neural:training' | 'neural:inference' | 'neural:optimization' | 'neural:evaluation';
    operation: 'train' | 'predict' | 'evaluate' | 'optimize' | 'load' | 'save' | 'export';
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
    type: 'database:query' | 'database:transaction' | 'database:migration' | 'database:backup';
    operation: 'select' | 'insert' | 'update' | 'delete' | 'create' | 'drop' | 'index' | 'backup' | 'restore';
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
    operation: 'get' | 'set' | 'delete' | 'clear' | 'expire' | 'cleanup' | 'allocate' | 'deallocate';
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
    type: 'workflow:execution' | 'workflow:task' | 'workflow:condition' | 'workflow:trigger' | 'workflow:orchestration';
    operation: 'start' | 'complete' | 'fail' | 'retry' | 'skip' | 'branch' | 'merge' | 'loop' | 'orchestrate';
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
        orchestrationId?: string;
        totalTasks?: number;
        error?: string;
        attempt?: number;
        duration?: number;
        dependency?: string;
        action?: string;
    };
}
/**
 * Multi-level orchestration events for Portfolio → Program → Swarm execution.
 */
export interface OrchestrationEvent extends SystemEvent {
    type: 'orchestration:portfolio' | 'orchestration:program' | 'orchestration:execution' | 'orchestration:flow' | 'orchestration:bottleneck';
    operation: 'plan' | 'execute' | 'monitor' | 'optimize' | 'escalate' | 'delegate' | 'coordinate' | 'sync';
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
/**
 * SAFe (Scaled Agile Framework) events for enterprise agile coordination.
 */
export interface SafeEvent extends SystemEvent {
    type: 'safe:portfolio' | 'safe:pi' | 'safe:value_stream' | 'safe:planning' | 'safe:execution';
    operation: 'epic_created' | 'epic_prioritized' | 'epic_approved' | 'epic_funded' | 'epic_completed' | 'pi_planning' | 'pi_execution' | 'pi_review' | 'value_stream_mapped' | 'objective_set';
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
/**
 * Memory orchestration events for advanced memory coordination across systems.
 */
export interface MemoryOrchestrationEvent extends SystemEvent {
    type: 'memory_orchestration:sync' | 'memory_orchestration:coordination' | 'memory_orchestration:cache' | 'memory_orchestration:consistency' | 'memory_orchestration:optimization';
    operation: 'sync_initiated' | 'sync_completed' | 'coordination_updated' | 'cache_populated' | 'cache_invalidated' | 'cache_refreshed' | 'cache_migrated' | 'consistency_check' | 'optimization_applied';
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
export type UELEvent = SystemLifecycleEvent | CoordinationEvent | CommunicationEvent | MonitoringEvent | InterfaceEvent | NeuralEvent | DatabaseEvent | MemoryEvent | WorkflowEvent | OrchestrationEvent | SafeEvent | MemoryOrchestrationEvent;
/**
 * Event category mappings for organization.
 */
export declare const EventCategories: {
    readonly SYSTEM: "system";
    readonly COORDINATION: "coordination";
    readonly COMMUNICATION: "communication";
    readonly MONITORING: "monitoring";
    readonly INTERFACE: "interface";
    readonly NEURAL: "neural";
    readonly DATABASE: "database";
    readonly MEMORY: "memory";
    readonly WORKFLOW: "workflow";
    readonly ORCHESTRATION: "orchestration";
    readonly SAFE: "safe";
    readonly MEMORY_ORCHESTRATION: "memory_orchestration";
};
/**
 * Event type patterns for filtering and matching.
 */
export declare const EventTypePatterns: {
    readonly SYSTEM_ALL: "system:*";
    readonly SYSTEM_LIFECYCLE: readonly ["system:startup", "system:shutdown", "system:restart", "system:error", "system:health"];
    readonly COORDINATION_ALL: "coordination:*";
    readonly COORDINATION_SWARM: "coordination:swarm";
    readonly COORDINATION_AGENTS: "coordination:agent";
    readonly COORDINATION_TASKS: "coordination:task";
    readonly COMMUNICATION_ALL: "communication:*";
    readonly COMMUNICATION_WEBSOCKET: "communication:websocket";
    readonly COMMUNICATION_HTTP: "communication:http";
    readonly MONITORING_ALL: "monitoring:*";
    readonly MONITORING_METRICS: "monitoring:metrics";
    readonly MONITORING_HEALTH: "monitoring:health";
    readonly MONITORING_ALERTS: "monitoring:alert";
    readonly INTERFACE_ALL: "interface:*";
    readonly INTERFACE_CLI: "interface:cli";
    readonly INTERFACE_WEB: "interface:web";
    readonly INTERFACE_API: "interface:api";
    readonly NEURAL_ALL: "neural:*";
    readonly NEURAL_TRAINING: "neural:training";
    readonly NEURAL_INFERENCE: "neural:inference";
    readonly DATABASE_ALL: "database:*";
    readonly DATABASE_QUERIES: "database:query";
    readonly DATABASE_TRANSACTIONS: "database:transaction";
    readonly MEMORY_ALL: "memory:*";
    readonly MEMORY_CACHE: "memory:cache";
    readonly MEMORY_GC: "memory:gc";
    readonly WORKFLOW_ALL: "workflow:*";
    readonly WORKFLOW_EXECUTION: "workflow:execution";
    readonly WORKFLOW_TASKS: "workflow:task";
    readonly ORCHESTRATION_ALL: "orchestration:*";
    readonly ORCHESTRATION_PORTFOLIO: "orchestration:portfolio";
    readonly ORCHESTRATION_PROGRAM: "orchestration:program";
    readonly ORCHESTRATION_EXECUTION: "orchestration:execution";
    readonly ORCHESTRATION_FLOW: "orchestration:flow";
    readonly SAFE_ALL: "safe:*";
    readonly SAFE_PORTFOLIO: "safe:portfolio";
    readonly SAFE_PI: "safe:pi";
    readonly SAFE_VALUE_STREAM: "safe:value_stream";
    readonly SAFE_PLANNING: "safe:planning";
    readonly MEMORY_ORCHESTRATION_ALL: "memory_orchestration:*";
    readonly MEMORY_ORCHESTRATION_SYNC: "memory_orchestration:sync";
    readonly MEMORY_ORCHESTRATION_CACHE: "memory_orchestration:cache";
    readonly MEMORY_ORCHESTRATION_CONSISTENCY: "memory_orchestration:consistency";
};
/**
 * Default configurations for different event manager types.
 */
export declare const DefaultEventManagerConfigs: {
    readonly system: {
        readonly maxListeners: 100;
        readonly processing: {
            readonly strategy: "immediate";
            readonly queueSize: 1000;
        };
        readonly retry: {
            readonly attempts: 3;
            readonly delay: 1000;
            readonly backoff: "exponential";
            readonly maxDelay: 5000;
        };
        readonly health: {
            readonly checkInterval: 30000;
            readonly timeout: 5000;
            readonly failureThreshold: 3;
            readonly successThreshold: 2;
            readonly enableAutoRecovery: true;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 10000;
            readonly trackLatency: true;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: false;
        };
    };
    readonly coordination: {
        readonly maxListeners: 1000;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 10000;
        };
        readonly retry: {
            readonly attempts: 5;
            readonly delay: 500;
            readonly backoff: "exponential";
            readonly maxDelay: 10000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 5000;
            readonly trackLatency: true;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: true;
        };
    };
    readonly communication: {
        readonly maxListeners: 500;
        readonly processing: {
            readonly strategy: "immediate";
            readonly queueSize: 5000;
        };
        readonly retry: {
            readonly attempts: 3;
            readonly delay: 1000;
            readonly backoff: "linear";
            readonly maxDelay: 5000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 2000;
            readonly trackLatency: true;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: false;
        };
    };
    readonly monitoring: {
        readonly maxListeners: 200;
        readonly processing: {
            readonly strategy: "batched";
            readonly batchSize: 50;
            readonly queueSize: 2000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 15000;
            readonly trackLatency: false;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: false;
        };
    };
    readonly interface: {
        readonly maxListeners: 100;
        readonly processing: {
            readonly strategy: "immediate";
            readonly queueSize: 1000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 5000;
            readonly trackLatency: true;
            readonly trackThroughput: false;
            readonly trackErrors: true;
            readonly enableProfiling: false;
        };
    };
    readonly neural: {
        readonly maxListeners: 50;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 500;
        };
        readonly retry: {
            readonly attempts: 2;
            readonly delay: 2000;
            readonly backoff: "fixed";
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 10000;
            readonly trackLatency: true;
            readonly trackThroughput: false;
            readonly trackErrors: true;
            readonly enableProfiling: true;
        };
    };
    readonly database: {
        readonly maxListeners: 200;
        readonly processing: {
            readonly strategy: "batched";
            readonly batchSize: 100;
            readonly queueSize: 5000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 5000;
            readonly trackLatency: true;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: false;
        };
    };
    readonly memory: {
        readonly maxListeners: 100;
        readonly processing: {
            readonly strategy: "throttled";
            readonly throttleMs: 100;
            readonly queueSize: 2000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 10000;
            readonly trackLatency: false;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: false;
        };
    };
    readonly workflow: {
        readonly maxListeners: 300;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 3000;
        };
        readonly retry: {
            readonly attempts: 3;
            readonly delay: 1000;
            readonly backoff: "exponential";
            readonly maxDelay: 8000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 5000;
            readonly trackLatency: true;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: true;
        };
    };
    readonly orchestration: {
        readonly maxListeners: 500;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 5000;
        };
        readonly retry: {
            readonly attempts: 3;
            readonly delay: 1000;
            readonly backoff: "exponential";
            readonly maxDelay: 10000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 3000;
            readonly trackLatency: true;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: true;
        };
    };
    readonly safe: {
        readonly maxListeners: 200;
        readonly processing: {
            readonly strategy: "queued";
            readonly queueSize: 2000;
        };
        readonly retry: {
            readonly attempts: 2;
            readonly delay: 2000;
            readonly backoff: "linear";
            readonly maxDelay: 10000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 10000;
            readonly trackLatency: true;
            readonly trackThroughput: false;
            readonly trackErrors: true;
            readonly enableProfiling: false;
        };
    };
    readonly memory_orchestration: {
        readonly maxListeners: 300;
        readonly processing: {
            readonly strategy: "batched";
            readonly batchSize: 25;
            readonly queueSize: 3000;
        };
        readonly retry: {
            readonly attempts: 3;
            readonly delay: 1500;
            readonly backoff: "exponential";
            readonly maxDelay: 8000;
        };
        readonly monitoring: {
            readonly enabled: true;
            readonly metricsInterval: 5000;
            readonly trackLatency: true;
            readonly trackThroughput: true;
            readonly trackErrors: true;
            readonly enableProfiling: true;
        };
    };
};
/**
 * Event priority mappings by type.
 */
export declare const EventPriorityMap: Record<string, EventPriority>;
/**
 * Event source categories for filtering.
 */
export declare const EventSources: {
    readonly SYSTEM_CORE: "system:core";
    readonly SYSTEM_SCHEDULER: "system:scheduler";
    readonly SYSTEM_HEALTH: "system:health";
    readonly COORDINATION_SWARM: "coordination:swarm";
    readonly COORDINATION_AGENT: "coordination:agent";
    readonly COORDINATION_MAESTRO: "coordination:maestro";
    readonly COORDINATION_ORCHESTRATOR: "coordination:orchestrator";
    readonly COMMUNICATION_WEBSOCKET: "communication:websocket";
    readonly COMMUNICATION_HTTP_CLIENT: "communication:http-client";
    readonly MONITORING_METRICS: "monitoring:metrics";
    readonly MONITORING_HEALTH: "monitoring:health";
    readonly MONITORING_PERFORMANCE: "monitoring:performance";
    readonly MONITORING_ALERTS: "monitoring:alerts";
    readonly INTERFACE_CLI: "interface:cli";
    readonly INTERFACE_WEB: "interface:web";
    readonly INTERFACE_TUI: "interface:tui";
    readonly INTERFACE_API: "interface:api";
    readonly NEURAL_TRAINER: "neural:trainer";
    readonly NEURAL_INFERENCE: "neural:inference";
    readonly NEURAL_OPTIMIZER: "neural:optimizer";
    readonly NEURAL_EVALUATOR: "neural:evaluator";
    readonly DATABASE_QUERY_ENGINE: "database:query-engine";
    readonly DATABASE_TRANSACTION_MANAGER: "database:transaction-manager";
    readonly DATABASE_MIGRATION_RUNNER: "database:migration-runner";
    readonly DATABASE_BACKUP_SERVICE: "database:backup-service";
    readonly MEMORY_CACHE_MANAGER: "memory:cache-manager";
    readonly MEMORY_STORE_MANAGER: "memory:store-manager";
    readonly MEMORY_GC_SERVICE: "memory:gc-service";
    readonly MEMORY_POOL_MANAGER: "memory:pool-manager";
    readonly WORKFLOW_ENGINE: "workflow:engine";
    readonly WORKFLOW_SCHEDULER: "workflow:scheduler";
    readonly WORKFLOW_EXECUTOR: "workflow:executor";
    readonly WORKFLOW_MONITOR: "workflow:monitor";
    readonly ORCHESTRATION_PORTFOLIO_MANAGER: "orchestration:portfolio-manager";
    readonly ORCHESTRATION_PROGRAM_COORDINATOR: "orchestration:program-coordinator";
    readonly ORCHESTRATION_EXECUTION_ENGINE: "orchestration:execution-engine";
    readonly ORCHESTRATION_FLOW_MONITOR: "orchestration:flow-monitor";
    readonly ORCHESTRATION_BOTTLENECK_DETECTOR: "orchestration:bottleneck-detector";
    readonly SAFE_PORTFOLIO_MANAGER: "safe:portfolio-manager";
    readonly SAFE_PI_PLANNER: "safe:pi-planner";
    readonly SAFE_VALUE_STREAM_MAPPER: "safe:value-stream-mapper";
    readonly SAFE_EPIC_MANAGER: "safe:epic-manager";
    readonly SAFE_OBJECTIVE_TRACKER: "safe:objective-tracker";
    readonly MEMORY_ORCHESTRATION_COORDINATOR: "memory_orchestration:coordinator";
    readonly MEMORY_ORCHESTRATION_SYNC_MANAGER: "memory_orchestration:sync-manager";
    readonly MEMORY_ORCHESTRATION_CACHE_COORDINATOR: "memory_orchestration:cache-coordinator";
    readonly MEMORY_ORCHESTRATION_CONSISTENCY_CHECKER: "memory_orchestration:consistency-checker";
    readonly MEMORY_ORCHESTRATION_OPTIMIZER: "memory_orchestration:optimizer";
};
/**
 * Type guards for UEL event types.
 */
export declare const UELTypeGuards: {
    readonly isSystemLifecycleEvent: (event: SystemEvent) => event is SystemLifecycleEvent;
    readonly isCoordinationEvent: (event: SystemEvent) => event is CoordinationEvent;
    readonly isCommunicationEvent: (event: SystemEvent) => event is CommunicationEvent;
    readonly isMonitoringEvent: (event: SystemEvent) => event is MonitoringEvent;
    readonly isInterfaceEvent: (event: SystemEvent) => event is InterfaceEvent;
    readonly isNeuralEvent: (event: SystemEvent) => event is NeuralEvent;
    readonly isDatabaseEvent: (event: SystemEvent) => event is DatabaseEvent;
    readonly isMemoryEvent: (event: SystemEvent) => event is MemoryEvent;
    readonly isWorkflowEvent: (event: SystemEvent) => event is WorkflowEvent;
    readonly isOrchestrationEvent: (event: SystemEvent) => event is OrchestrationEvent;
    readonly isSafeEvent: (event: SystemEvent) => event is SafeEvent;
    readonly isMemoryOrchestrationEvent: (event: SystemEvent) => event is MemoryOrchestrationEvent;
    readonly isUELEvent: (event: SystemEvent) => event is UELEvent;
};
/**
 * Event constants for consistent usage.
 */
export declare const EventConstants: {
    readonly DEFAULT_PRIORITY: EventPriority;
    readonly DEFAULT_PROCESSING_STRATEGY: "queued";
    readonly DEFAULT_BATCH_SIZE: 50;
    readonly DEFAULT_QUEUE_SIZE: 1000;
    readonly DEFAULT_TIMEOUT: 30000;
    readonly DEFAULT_RETRY_ATTEMPTS: 3;
    readonly DEFAULT_RETRY_DELAY: 1000;
    readonly MAX_EVENT_SIZE: number;
    readonly MAX_BATCH_SIZE: 1000;
    readonly MAX_QUEUE_SIZE: 100000;
    readonly MAX_LISTENERS: 10000;
    readonly MAX_METADATA_SIZE: number;
    readonly HEALTH_CHECK_TIMEOUT: 5000;
    readonly METRICS_COLLECTION_TIMEOUT: 10000;
    readonly EVENT_EMISSION_TIMEOUT: 30000;
    readonly SUBSCRIPTION_TIMEOUT: 15000;
    readonly DEFAULT_HEALTH_CHECK_INTERVAL: 30000;
    readonly DEFAULT_METRICS_INTERVAL: 10000;
    readonly DEFAULT_CLEANUP_INTERVAL: 300000;
    readonly EVENT_ID_PATTERN: RegExp;
    readonly EVENT_TYPE_PATTERN: RegExp;
    readonly SOURCE_PATTERN: RegExp;
};
declare const _default: {
    readonly EventCategories: {
        readonly SYSTEM: "system";
        readonly COORDINATION: "coordination";
        readonly COMMUNICATION: "communication";
        readonly MONITORING: "monitoring";
        readonly INTERFACE: "interface";
        readonly NEURAL: "neural";
        readonly DATABASE: "database";
        readonly MEMORY: "memory";
        readonly WORKFLOW: "workflow";
        readonly ORCHESTRATION: "orchestration";
        readonly SAFE: "safe";
        readonly MEMORY_ORCHESTRATION: "memory_orchestration";
    };
    readonly EventTypePatterns: {
        readonly SYSTEM_ALL: "system:*";
        readonly SYSTEM_LIFECYCLE: readonly ["system:startup", "system:shutdown", "system:restart", "system:error", "system:health"];
        readonly COORDINATION_ALL: "coordination:*";
        readonly COORDINATION_SWARM: "coordination:swarm";
        readonly COORDINATION_AGENTS: "coordination:agent";
        readonly COORDINATION_TASKS: "coordination:task";
        readonly COMMUNICATION_ALL: "communication:*";
        readonly COMMUNICATION_WEBSOCKET: "communication:websocket";
        readonly COMMUNICATION_HTTP: "communication:http";
        readonly MONITORING_ALL: "monitoring:*";
        readonly MONITORING_METRICS: "monitoring:metrics";
        readonly MONITORING_HEALTH: "monitoring:health";
        readonly MONITORING_ALERTS: "monitoring:alert";
        readonly INTERFACE_ALL: "interface:*";
        readonly INTERFACE_CLI: "interface:cli";
        readonly INTERFACE_WEB: "interface:web";
        readonly INTERFACE_API: "interface:api";
        readonly NEURAL_ALL: "neural:*";
        readonly NEURAL_TRAINING: "neural:training";
        readonly NEURAL_INFERENCE: "neural:inference";
        readonly DATABASE_ALL: "database:*";
        readonly DATABASE_QUERIES: "database:query";
        readonly DATABASE_TRANSACTIONS: "database:transaction";
        readonly MEMORY_ALL: "memory:*";
        readonly MEMORY_CACHE: "memory:cache";
        readonly MEMORY_GC: "memory:gc";
        readonly WORKFLOW_ALL: "workflow:*";
        readonly WORKFLOW_EXECUTION: "workflow:execution";
        readonly WORKFLOW_TASKS: "workflow:task";
        readonly ORCHESTRATION_ALL: "orchestration:*";
        readonly ORCHESTRATION_PORTFOLIO: "orchestration:portfolio";
        readonly ORCHESTRATION_PROGRAM: "orchestration:program";
        readonly ORCHESTRATION_EXECUTION: "orchestration:execution";
        readonly ORCHESTRATION_FLOW: "orchestration:flow";
        readonly SAFE_ALL: "safe:*";
        readonly SAFE_PORTFOLIO: "safe:portfolio";
        readonly SAFE_PI: "safe:pi";
        readonly SAFE_VALUE_STREAM: "safe:value_stream";
        readonly SAFE_PLANNING: "safe:planning";
        readonly MEMORY_ORCHESTRATION_ALL: "memory_orchestration:*";
        readonly MEMORY_ORCHESTRATION_SYNC: "memory_orchestration:sync";
        readonly MEMORY_ORCHESTRATION_CACHE: "memory_orchestration:cache";
        readonly MEMORY_ORCHESTRATION_CONSISTENCY: "memory_orchestration:consistency";
    };
    readonly DefaultEventManagerConfigs: {
        readonly system: {
            readonly maxListeners: 100;
            readonly processing: {
                readonly strategy: "immediate";
                readonly queueSize: 1000;
            };
            readonly retry: {
                readonly attempts: 3;
                readonly delay: 1000;
                readonly backoff: "exponential";
                readonly maxDelay: 5000;
            };
            readonly health: {
                readonly checkInterval: 30000;
                readonly timeout: 5000;
                readonly failureThreshold: 3;
                readonly successThreshold: 2;
                readonly enableAutoRecovery: true;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 10000;
                readonly trackLatency: true;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: false;
            };
        };
        readonly coordination: {
            readonly maxListeners: 1000;
            readonly processing: {
                readonly strategy: "queued";
                readonly queueSize: 10000;
            };
            readonly retry: {
                readonly attempts: 5;
                readonly delay: 500;
                readonly backoff: "exponential";
                readonly maxDelay: 10000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 5000;
                readonly trackLatency: true;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: true;
            };
        };
        readonly communication: {
            readonly maxListeners: 500;
            readonly processing: {
                readonly strategy: "immediate";
                readonly queueSize: 5000;
            };
            readonly retry: {
                readonly attempts: 3;
                readonly delay: 1000;
                readonly backoff: "linear";
                readonly maxDelay: 5000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 2000;
                readonly trackLatency: true;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: false;
            };
        };
        readonly monitoring: {
            readonly maxListeners: 200;
            readonly processing: {
                readonly strategy: "batched";
                readonly batchSize: 50;
                readonly queueSize: 2000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 15000;
                readonly trackLatency: false;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: false;
            };
        };
        readonly interface: {
            readonly maxListeners: 100;
            readonly processing: {
                readonly strategy: "immediate";
                readonly queueSize: 1000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 5000;
                readonly trackLatency: true;
                readonly trackThroughput: false;
                readonly trackErrors: true;
                readonly enableProfiling: false;
            };
        };
        readonly neural: {
            readonly maxListeners: 50;
            readonly processing: {
                readonly strategy: "queued";
                readonly queueSize: 500;
            };
            readonly retry: {
                readonly attempts: 2;
                readonly delay: 2000;
                readonly backoff: "fixed";
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 10000;
                readonly trackLatency: true;
                readonly trackThroughput: false;
                readonly trackErrors: true;
                readonly enableProfiling: true;
            };
        };
        readonly database: {
            readonly maxListeners: 200;
            readonly processing: {
                readonly strategy: "batched";
                readonly batchSize: 100;
                readonly queueSize: 5000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 5000;
                readonly trackLatency: true;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: false;
            };
        };
        readonly memory: {
            readonly maxListeners: 100;
            readonly processing: {
                readonly strategy: "throttled";
                readonly throttleMs: 100;
                readonly queueSize: 2000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 10000;
                readonly trackLatency: false;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: false;
            };
        };
        readonly workflow: {
            readonly maxListeners: 300;
            readonly processing: {
                readonly strategy: "queued";
                readonly queueSize: 3000;
            };
            readonly retry: {
                readonly attempts: 3;
                readonly delay: 1000;
                readonly backoff: "exponential";
                readonly maxDelay: 8000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 5000;
                readonly trackLatency: true;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: true;
            };
        };
        readonly orchestration: {
            readonly maxListeners: 500;
            readonly processing: {
                readonly strategy: "queued";
                readonly queueSize: 5000;
            };
            readonly retry: {
                readonly attempts: 3;
                readonly delay: 1000;
                readonly backoff: "exponential";
                readonly maxDelay: 10000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 3000;
                readonly trackLatency: true;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: true;
            };
        };
        readonly safe: {
            readonly maxListeners: 200;
            readonly processing: {
                readonly strategy: "queued";
                readonly queueSize: 2000;
            };
            readonly retry: {
                readonly attempts: 2;
                readonly delay: 2000;
                readonly backoff: "linear";
                readonly maxDelay: 10000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 10000;
                readonly trackLatency: true;
                readonly trackThroughput: false;
                readonly trackErrors: true;
                readonly enableProfiling: false;
            };
        };
        readonly memory_orchestration: {
            readonly maxListeners: 300;
            readonly processing: {
                readonly strategy: "batched";
                readonly batchSize: 25;
                readonly queueSize: 3000;
            };
            readonly retry: {
                readonly attempts: 3;
                readonly delay: 1500;
                readonly backoff: "exponential";
                readonly maxDelay: 8000;
            };
            readonly monitoring: {
                readonly enabled: true;
                readonly metricsInterval: 5000;
                readonly trackLatency: true;
                readonly trackThroughput: true;
                readonly trackErrors: true;
                readonly enableProfiling: true;
            };
        };
    };
    readonly EventPriorityMap: Record<string, EventPriority>;
    readonly EventSources: {
        readonly SYSTEM_CORE: "system:core";
        readonly SYSTEM_SCHEDULER: "system:scheduler";
        readonly SYSTEM_HEALTH: "system:health";
        readonly COORDINATION_SWARM: "coordination:swarm";
        readonly COORDINATION_AGENT: "coordination:agent";
        readonly COORDINATION_MAESTRO: "coordination:maestro";
        readonly COORDINATION_ORCHESTRATOR: "coordination:orchestrator";
        readonly COMMUNICATION_WEBSOCKET: "communication:websocket";
        readonly COMMUNICATION_HTTP_CLIENT: "communication:http-client";
        readonly MONITORING_METRICS: "monitoring:metrics";
        readonly MONITORING_HEALTH: "monitoring:health";
        readonly MONITORING_PERFORMANCE: "monitoring:performance";
        readonly MONITORING_ALERTS: "monitoring:alerts";
        readonly INTERFACE_CLI: "interface:cli";
        readonly INTERFACE_WEB: "interface:web";
        readonly INTERFACE_TUI: "interface:tui";
        readonly INTERFACE_API: "interface:api";
        readonly NEURAL_TRAINER: "neural:trainer";
        readonly NEURAL_INFERENCE: "neural:inference";
        readonly NEURAL_OPTIMIZER: "neural:optimizer";
        readonly NEURAL_EVALUATOR: "neural:evaluator";
        readonly DATABASE_QUERY_ENGINE: "database:query-engine";
        readonly DATABASE_TRANSACTION_MANAGER: "database:transaction-manager";
        readonly DATABASE_MIGRATION_RUNNER: "database:migration-runner";
        readonly DATABASE_BACKUP_SERVICE: "database:backup-service";
        readonly MEMORY_CACHE_MANAGER: "memory:cache-manager";
        readonly MEMORY_STORE_MANAGER: "memory:store-manager";
        readonly MEMORY_GC_SERVICE: "memory:gc-service";
        readonly MEMORY_POOL_MANAGER: "memory:pool-manager";
        readonly WORKFLOW_ENGINE: "workflow:engine";
        readonly WORKFLOW_SCHEDULER: "workflow:scheduler";
        readonly WORKFLOW_EXECUTOR: "workflow:executor";
        readonly WORKFLOW_MONITOR: "workflow:monitor";
        readonly ORCHESTRATION_PORTFOLIO_MANAGER: "orchestration:portfolio-manager";
        readonly ORCHESTRATION_PROGRAM_COORDINATOR: "orchestration:program-coordinator";
        readonly ORCHESTRATION_EXECUTION_ENGINE: "orchestration:execution-engine";
        readonly ORCHESTRATION_FLOW_MONITOR: "orchestration:flow-monitor";
        readonly ORCHESTRATION_BOTTLENECK_DETECTOR: "orchestration:bottleneck-detector";
        readonly SAFE_PORTFOLIO_MANAGER: "safe:portfolio-manager";
        readonly SAFE_PI_PLANNER: "safe:pi-planner";
        readonly SAFE_VALUE_STREAM_MAPPER: "safe:value-stream-mapper";
        readonly SAFE_EPIC_MANAGER: "safe:epic-manager";
        readonly SAFE_OBJECTIVE_TRACKER: "safe:objective-tracker";
        readonly MEMORY_ORCHESTRATION_COORDINATOR: "memory_orchestration:coordinator";
        readonly MEMORY_ORCHESTRATION_SYNC_MANAGER: "memory_orchestration:sync-manager";
        readonly MEMORY_ORCHESTRATION_CACHE_COORDINATOR: "memory_orchestration:cache-coordinator";
        readonly MEMORY_ORCHESTRATION_CONSISTENCY_CHECKER: "memory_orchestration:consistency-checker";
        readonly MEMORY_ORCHESTRATION_OPTIMIZER: "memory_orchestration:optimizer";
    };
    readonly UELTypeGuards: {
        readonly isSystemLifecycleEvent: (event: SystemEvent) => event is SystemLifecycleEvent;
        readonly isCoordinationEvent: (event: SystemEvent) => event is CoordinationEvent;
        readonly isCommunicationEvent: (event: SystemEvent) => event is CommunicationEvent;
        readonly isMonitoringEvent: (event: SystemEvent) => event is MonitoringEvent;
        readonly isInterfaceEvent: (event: SystemEvent) => event is InterfaceEvent;
        readonly isNeuralEvent: (event: SystemEvent) => event is NeuralEvent;
        readonly isDatabaseEvent: (event: SystemEvent) => event is DatabaseEvent;
        readonly isMemoryEvent: (event: SystemEvent) => event is MemoryEvent;
        readonly isWorkflowEvent: (event: SystemEvent) => event is WorkflowEvent;
        readonly isOrchestrationEvent: (event: SystemEvent) => event is OrchestrationEvent;
        readonly isSafeEvent: (event: SystemEvent) => event is SafeEvent;
        readonly isMemoryOrchestrationEvent: (event: SystemEvent) => event is MemoryOrchestrationEvent;
        readonly isUELEvent: (event: SystemEvent) => event is UELEvent;
    };
    readonly EventConstants: {
        readonly DEFAULT_PRIORITY: EventPriority;
        readonly DEFAULT_PROCESSING_STRATEGY: "queued";
        readonly DEFAULT_BATCH_SIZE: 50;
        readonly DEFAULT_QUEUE_SIZE: 1000;
        readonly DEFAULT_TIMEOUT: 30000;
        readonly DEFAULT_RETRY_ATTEMPTS: 3;
        readonly DEFAULT_RETRY_DELAY: 1000;
        readonly MAX_EVENT_SIZE: number;
        readonly MAX_BATCH_SIZE: 1000;
        readonly MAX_QUEUE_SIZE: 100000;
        readonly MAX_LISTENERS: 10000;
        readonly MAX_METADATA_SIZE: number;
        readonly HEALTH_CHECK_TIMEOUT: 5000;
        readonly METRICS_COLLECTION_TIMEOUT: 10000;
        readonly EVENT_EMISSION_TIMEOUT: 30000;
        readonly SUBSCRIPTION_TIMEOUT: 15000;
        readonly DEFAULT_HEALTH_CHECK_INTERVAL: 30000;
        readonly DEFAULT_METRICS_INTERVAL: 10000;
        readonly DEFAULT_CLEANUP_INTERVAL: 300000;
        readonly EVENT_ID_PATTERN: RegExp;
        readonly EVENT_TYPE_PATTERN: RegExp;
        readonly SOURCE_PATTERN: RegExp;
    };
};
export default _default;
//# sourceMappingURL=types.d.ts.map