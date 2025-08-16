/**
 * Unified Event Layer (UEL) - Type Definitions.
 *
 * Core type definitions for event types, manager types, and enums.
 * Used throughout the UEL system for type-safe event operations.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */
/**
 * Event category mappings for organization.
 */
export const EventCategories = {
    SYSTEM: 'system',
    COORDINATION: 'coordination',
    COMMUNICATION: 'communication',
    MONITORING: 'monitoring',
    INTERFACE: 'interface',
    NEURAL: 'neural',
    DATABASE: 'database',
    MEMORY: 'memory',
    WORKFLOW: 'workflow',
};
/**
 * Event type patterns for filtering and matching.
 */
export const EventTypePatterns = {
    // System events
    SYSTEM_ALL: 'system:*',
    SYSTEM_LIFECYCLE: 'system:startup|system:shutdown|system:restart|system:error|system:health',
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
};
/**
 * Default configurations for different event manager types.
 */
export const DefaultEventManagerConfigs = {
    [EventCategories.SYSTEM]: {
        maxListeners: 100,
        processing: {
            strategy: 'immediate',
            queueSize: 1000,
        },
        retry: {
            attempts: 3,
            delay: 1000,
            backoff: 'exponential',
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
            strategy: 'queued',
            queueSize: 10000,
        },
        retry: {
            attempts: 5,
            delay: 500,
            backoff: 'exponential',
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
            strategy: 'immediate',
            queueSize: 5000,
        },
        retry: {
            attempts: 3,
            delay: 1000,
            backoff: 'linear',
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
            strategy: 'batched',
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
            strategy: 'immediate',
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
            strategy: 'queued',
            queueSize: 500,
        },
        retry: {
            attempts: 2,
            delay: 2000,
            backoff: 'fixed',
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
            strategy: 'batched',
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
            strategy: 'throttled',
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
            strategy: 'queued',
            queueSize: 3000,
        },
        retry: {
            attempts: 3,
            delay: 1000,
            backoff: 'exponential',
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
};
/**
 * Event priority mappings by type.
 */
export const EventPriorityMap = {
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
};
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
};
/**
 * Type guards for UEL event types.
 */
export const UELTypeGuards = {
    isSystemLifecycleEvent: (event) => {
        return event.type.startsWith('system:');
    },
    isCoordinationEvent: (event) => {
        return event.type.startsWith('coordination:');
    },
    isCommunicationEvent: (event) => {
        return event.type.startsWith('communication:');
    },
    isMonitoringEvent: (event) => {
        return event.type.startsWith('monitoring:');
    },
    isInterfaceEvent: (event) => {
        return event.type.startsWith('interface:');
    },
    isNeuralEvent: (event) => {
        return event.type.startsWith('neural:');
    },
    isDatabaseEvent: (event) => {
        return event.type.startsWith('database:');
    },
    isMemoryEvent: (event) => {
        return event.type.startsWith('memory:');
    },
    isWorkflowEvent: (event) => {
        return event.type.startsWith('workflow:');
    },
    isUELEvent: (event) => {
        const category = event.type.split(':')[0];
        return Object.values(EventCategories).includes(category);
    },
};
/**
 * Event constants for consistent usage.
 */
export const EventConstants = {
    // Default values
    DEFAULT_PRIORITY: 'medium',
    DEFAULT_PROCESSING_STRATEGY: 'queued',
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
};
export default {
    EventCategories,
    EventTypePatterns,
    DefaultEventManagerConfigs,
    EventPriorityMap,
    EventSources,
    UELTypeGuards,
    EventConstants,
};
//# sourceMappingURL=types.js.map