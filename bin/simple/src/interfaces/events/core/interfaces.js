export const EventManagerTypes = {
    SYSTEM: 'system',
    COORDINATION: 'coordination',
    COMMUNICATION: 'communication',
    MONITORING: 'monitoring',
    INTERFACE: 'interface',
    NEURAL: 'neural',
    DATABASE: 'database',
    MEMORY: 'memory',
    WORKFLOW: 'workflow',
    CUSTOM: 'custom',
};
export class EventError extends Error {
    code;
    manager;
    eventId;
    cause;
    constructor(message, code, manager, eventId, cause) {
        super(message);
        this.code = code;
        this.manager = manager;
        this.eventId = eventId;
        this.cause = cause;
        this.name = 'EventError';
    }
}
export class EventSubscriptionError extends EventError {
    constructor(manager, subscriptionId, cause) {
        super(`Event subscription failed for manager: ${manager}`, 'SUBSCRIPTION_ERROR', manager, subscriptionId, cause);
        this.name = 'EventSubscriptionError';
    }
}
export class EventEmissionError extends EventError {
    constructor(manager, eventId, cause) {
        super(`Event emission failed for manager: ${manager}`, 'EMISSION_ERROR', manager, eventId, cause);
        this.name = 'EventEmissionError';
    }
}
export class EventFilterError extends EventError {
    constructor(manager, filterId, cause) {
        super(`Event filter error for manager: ${manager}`, 'FILTER_ERROR', manager, filterId, cause);
        this.name = 'EventFilterError';
    }
}
export class EventTimeoutError extends EventError {
    constructor(manager, timeout, eventId, cause) {
        super(`Event timeout (${timeout}ms) for manager: ${manager}`, 'TIMEOUT_ERROR', manager, eventId, cause);
        this.name = 'EventTimeoutError';
    }
}
export class EventRetryExhaustedError extends EventError {
    constructor(manager, attempts, eventId, cause) {
        super(`Event retry exhausted (${attempts} attempts) for manager: ${manager}`, 'RETRY_EXHAUSTED', manager, eventId, cause);
        this.name = 'EventRetryExhaustedError';
    }
}
export const EventManagerPresets = {
    REAL_TIME: {
        processing: {
            strategy: 'immediate',
            queueSize: 1000,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 1000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
            enableProfiling: false,
        },
    },
    BATCH_PROCESSING: {
        processing: {
            strategy: 'batched',
            batchSize: 100,
            queueSize: 10000,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 5000,
            trackLatency: false,
            trackThroughput: true,
            trackErrors: true,
            enableProfiling: false,
        },
    },
    HIGH_THROUGHPUT: {
        processing: {
            strategy: 'queued',
            queueSize: 50000,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 10000,
            trackLatency: false,
            trackThroughput: true,
            trackErrors: true,
            enableProfiling: true,
        },
    },
    RELIABLE: {
        processing: {
            strategy: 'queued',
            queueSize: 5000,
        },
        retry: {
            attempts: 5,
            delay: 1000,
            backoff: 'exponential',
            maxDelay: 10000,
        },
        health: {
            checkInterval: 5000,
            timeout: 3000,
            failureThreshold: 3,
            successThreshold: 2,
            enableAutoRecovery: true,
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
};
export const EventTypeGuards = {
    isEventManagerType: (value) => {
        return Object.values(EventManagerTypes).includes(value);
    },
    isEventPriority: (value) => {
        return ['critical', 'high', 'medium', 'low'].includes(value);
    },
    isEventProcessingStrategy: (value) => {
        return ['immediate', 'queued', 'batched', 'throttled'].includes(value);
    },
    isSystemEvent: (value) => {
        return (value &&
            typeof value.id === 'string' &&
            value.timestamp instanceof Date &&
            typeof value.source === 'string' &&
            typeof value.type === 'string');
    },
    isEventManagerConfig: (value) => {
        return (value &&
            typeof value.name === 'string' &&
            EventTypeGuards.isEventManagerType(value.type) &&
            value.processing &&
            EventTypeGuards.isEventProcessingStrategy(value.processing.strategy));
    },
};
//# sourceMappingURL=interfaces.js.map