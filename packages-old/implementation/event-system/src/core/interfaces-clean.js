/**
 * @file UEL (Unified Event Layer) Core Interfaces - Clean Version
 *
 * Provides unified abstractions for all event management implementations
 */
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
// Error classes
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
// Type guards
export const EventTypeGuards = {
    isEventManagerType: (value) => (typeof value === 'string' &&
        Object.values(EventManagerTypes).includes(value)),
    isEventPriority: (value) => (typeof value === 'string' &&
        ['critical', 'high', 'medium', 'low'].includes(value)),
    isSystemEvent: (value) => (value !== null &&
        typeof value === 'object' &&
        typeof value.id === 'string' &&
        value.timestamp instanceof Date &&
        typeof value.source === 'string' &&
        typeof value.type === 'string' &&
        typeof value.payload === 'object'),
};
// Configuration presets
export const EventManagerPresets = {
    REAL_TIME: {
        processing: {
            strategy: 'immediate',
            queueSize: 1000,
        },
    },
    BATCH_PROCESSING: {
        processing: {
            strategy: 'batched',
            batchSize: 100,
            queueSize: 10000,
        },
    },
    HIGH_THROUGHPUT: {
        processing: {
            strategy: 'queued',
            queueSize: 50000,
        },
    },
};
