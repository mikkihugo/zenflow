/**
 * @file UEL (Unified Event Layer) Core Interfaces.
 *
 * Provides unified abstractions for all event management implementations:
 * - System, Coordination, Communication, Monitoring, and UI events
 * - Consistent subscription, emission, and filtering patterns
 * - Factory pattern for event manager creation and management
 * - Health checks and performance monitoring.
 */
/**
 * Event manager type mappings for convenience.
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
/**
 * Base error class for all UEL event-related operations.
 *
 * @class EventError
 * @augments Error
 * @example
 * ```typescript
 * throw new EventError(
 *   'Failed to process event',
 *   'PROCESSING_ERROR',
 *   'system-manager',
 *   'evt_12345',
 *   originalError
 * );
 * ```
 */
export class EventError extends Error {
    code;
    manager;
    eventId;
    cause;
    /**
     * Create a new EventError.
     *
     * @param message - Human-readable error message.
     * @param code - Machine-readable error code.
     * @param manager - Name of the event manager where error occurred.
     * @param eventId - Optional ID of the event that caused the error.
     * @param cause - Optional underlying error that caused this error.
     */
    constructor(message, code, manager, eventId, cause) {
        super(message);
        this.code = code;
        this.manager = manager;
        this.eventId = eventId;
        this.cause = cause;
        this.name = 'EventError';
    }
}
/**
 * Error thrown when event subscription operations fail.
 *
 * @class EventSubscriptionError
 * @augments EventError
 * @example
 * ```typescript
 * throw new EventSubscriptionError('system-manager', 'sub_12345', originalError);
 * ```
 */
export class EventSubscriptionError extends EventError {
    /**
     * Create a new EventSubscriptionError.
     *
     * @param manager - Name of the event manager where subscription failed.
     * @param subscriptionId - ID of the subscription that failed.
     * @param cause - Optional underlying error that caused the failure.
     */
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
/**
 * Event manager configuration presets for common scenarios.
 */
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
/**
 * Type guards for runtime type checking of UEL interfaces and values.
 *
 * @namespace EventTypeGuards
 * @example
 * ```typescript
 * // Validate event manager type
 * if (EventTypeGuards.isEventManagerType(userInput)) {
 *   // userInput is now typed as EventManagerType
 *   const manager = createManager(userInput);
 * }
 *
 * // Validate system event
 * if (EventTypeGuards.isSystemEvent(data)) {
 *   // data is now typed as SystemEvent
 *   await eventManager.emit(data);
 * }
 * ```
 */
export const EventTypeGuards = {
    /**
     * Check if a value is a valid EventManagerType.
     *
     * @param value - Value to check.
     * @returns True if value is a valid EventManagerType.
     */
    isEventManagerType: (value) => {
        return Object.values(EventManagerTypes).includes(value);
    },
    /**
     * Check if a value is a valid EventPriority.
     *
     * @param value - Value to check.
     * @returns True if value is a valid EventPriority.
     */
    isEventPriority: (value) => {
        return ['critical', 'high', 'medium', 'low'].includes(value);
    },
    /**
     * Check if a value is a valid EventProcessingStrategy.
     *
     * @param value - Value to check.
     * @returns True if value is a valid EventProcessingStrategy.
     */
    isEventProcessingStrategy: (value) => {
        return ['immediate', 'queued', 'batched', 'throttled'].includes(value);
    },
    /**
     * Check if a value is a valid SystemEvent.
     *
     * @param value - Value to check.
     * @returns True if value has all required SystemEvent properties.
     */
    isSystemEvent: (value) => {
        return (value &&
            typeof value.id === 'string' &&
            value.timestamp instanceof Date &&
            typeof value.source === 'string' &&
            typeof value.type === 'string');
    },
    /**
     * Check if a value is a valid EventManagerConfig.
     *
     * @param value - Value to check.
     * @returns True if value has all required EventManagerConfig properties.
     */
    isEventManagerConfig: (value) => {
        return (value &&
            typeof value.name === 'string' &&
            EventTypeGuards.isEventManagerType(value.type) &&
            value.processing &&
            EventTypeGuards.isEventProcessingStrategy(value.processing.strategy));
    },
};
