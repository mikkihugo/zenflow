/**
 * @fileoverview Event System Type Definitions
 *
 * Comprehensive type definitions for the event system including
 * event patterns, manager types, and processing strategies.
 */
// Re-export core interfaces
export * from '../core/interfaces-clean';
// Event type patterns for categorization
export const EventTypePatterns = {
    SYSTEM_LIFECYCLE: ['system:startup', 'system:shutdown', 'system:error', 'system:ready'],
    USER_ACTIONS: ['user:login', 'user:logout', 'user:action', 'user:preference'],
    WORKFLOW_EVENTS: ['workflow:start', 'workflow:complete', 'workflow:error', 'workflow:pause'],
    DATABASE_EVENTS: ['db:connect', 'db:disconnect', 'db:query', 'db:error'],
    API_EVENTS: ['api:request', 'api:response', 'api:error', 'api:timeout'],
    NEURAL_EVENTS: ['neural:process', 'neural:complete', 'neural:optimize', 'neural:error'],
    COORDINATION_EVENTS: ['coord:start', 'coord:sync', 'coord:conflict', 'coord:resolve'],
    MONITORING_EVENTS: ['monitor:metric', 'monitor:alert', 'monitor:health', 'monitor:performance'],
};
// Export common type guards
export const TypeGuards = {
    isEventPriority: (value) => typeof value === 'string' && ['critical', 'high', 'medium', 'low'].includes(value),
    isProcessingStrategy: (value) => typeof value === 'string' && ['immediate', 'queued', 'batched', 'throttled'].includes(value),
    isManagerType: (value) => {
        const validTypes = ['system', 'coordination', 'communication', 'monitoring', 'interface', 'neural', 'database', 'memory', 'workflow', 'custom'];
        return typeof value === 'string' && validTypes.includes(value);
    },
    hasEventMetadata: (event) => event && typeof event === 'object' && 'metadata' in event,
};
// Add missing constants and categories
export const EventCategories = {
    SYSTEM: 'system',
    COORDINATION: 'coordination',
    COMMUNICATION: 'communication',
    MONITORING: 'monitoring',
    WORKFLOW: 'workflow',
    NEURAL: 'neural',
    DATABASE: 'database',
    MEMORY: 'memory',
};
export const EventPriorityMap = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};
export const EventConstants = {
    MAX_LISTENERS: 100,
    DEFAULT_TIMEOUT: 5000,
    RETRY_ATTEMPTS: 3,
};
// Default configurations for event managers
export const DefaultEventManagerConfigs = {
    system: {
        name: 'default-system',
        type: 'system',
        maxListeners: 100,
        processing: { strategy: 'immediate' },
    },
    coordination: {
        name: 'default-coordination',
        type: 'coordination',
        maxListeners: 50,
        processing: { strategy: 'queued', queueSize: 1000 },
    },
    communication: {
        name: 'default-communication',
        type: 'communication',
        maxListeners: 75,
        processing: { strategy: 'throttled', throttleMs: 100 },
    },
    monitoring: {
        name: 'default-monitoring',
        type: 'monitoring',
        maxListeners: 200,
        processing: { strategy: 'batched', batchSize: 10 },
    },
    interface: {
        name: 'default-interface',
        type: 'interface',
        maxListeners: 50,
        processing: { strategy: 'immediate' },
    },
    neural: {
        name: 'default-neural',
        type: 'neural',
        maxListeners: 25,
        processing: { strategy: 'queued', queueSize: 500 },
    },
    database: {
        name: 'default-database',
        type: 'database',
        maxListeners: 100,
        processing: { strategy: 'batched', batchSize: 20 },
    },
    memory: {
        name: 'default-memory',
        type: 'memory',
        maxListeners: 150,
        processing: { strategy: 'immediate' },
    },
    workflow: {
        name: 'default-workflow',
        type: 'workflow',
        maxListeners: 75,
        processing: { strategy: 'queued', queueSize: 200 },
    },
};
export const UELTypeGuards = TypeGuards;
export const EventUtils = {
    generateEventId: () => `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    generateCorrelationId: () => `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createTimestamp: () => new Date(),
    validateEventType: (type) => typeof type === 'string' && type.length > 0 && /^[\w:-]+$/i.test(type),
    extractEventCategory: (type) => {
        const parts = type.split(':');
        return parts.length > 1 ? parts[0] : 'general';
    },
};
