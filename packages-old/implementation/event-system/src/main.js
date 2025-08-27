/**
 * @file Event System Main Exports
 *
 * Central export file for the comprehensive event system implementation.
 * This exports all the battle-tested event management functionality.
 */
// =============================================================================
// CORE EVENT SYSTEM - Foundation event handling
// =============================================================================
export { EventBus } from './core/event-bus';
export { TypedEventBus } from './core/typed-event-bus';
export { TypeSafeEventSystem } from './core/type-safe-event-system';
export { BaseEventManager } from './core/base-event-manager';
// =============================================================================
// UEL (UNIFIED EVENT LAYER) - Comprehensive event coordination
// =============================================================================
export { UEL, getUEL, initializeUEL } from './core/uel-singleton';
// =============================================================================
// EVENT MANAGER SYSTEM - Advanced event management
// =============================================================================
export { EventManager } from './manager';
export * from './event-manager-types';
// =============================================================================
// ADAPTERS AND FACTORIES - Event system integrations  
// =============================================================================
export * from './adapters';
export * from './factories';
// =============================================================================
// SYSTEM INTEGRATIONS - Cross-system compatibility
// =============================================================================
export { UELEnhancedEventBus, SystemIntegrationManager, EventEmitterToUELMigrationHelper, UELIntegrationFactory, SystemLifecycleManager, uelIntegrationFactory, systemLifecycleManager, } from './system-integrations';
// =============================================================================
// COMPATIBILITY LAYER - EventEmitter compatibility
// =============================================================================
export * from './compatibility';
// =============================================================================
// MIDDLEWARE SYSTEM - Event processing middleware
// =============================================================================
export { MiddlewareChain } from './core/middleware';
// =============================================================================
// VALIDATION SYSTEM - Event validation framework
// =============================================================================
export { getDomainValidator, validateCrossDomain } from './core/domain-validator';
// =============================================================================
// OBSERVER PATTERN - Observable implementations
// =============================================================================
export { SimpleObservable } from './observer-system';
// =============================================================================
// REGISTRY SYSTEM - Event system registry
// =============================================================================
export { RegistryIndex } from './registry-index';
export * from './registry';
// Registry comes from the registry module
export { EventRegistry as EventManagerRegistry } from './registry';
// =============================================================================
// UTILITY FUNCTIONS - Helper functions
// =============================================================================
/**
 * Create a typed event bus with configuration.
 */
export function createTypedEventBus(config = {}) {
    const { TypedEventBus } = require('./core/typed-event-bus');
    return new TypedEventBus(config);
}
/**
 * Create a high-performance event bus.
 */
export function createHighPerformanceEventBus(config = {}) {
    const { EventBus } = require('./core/event-bus');
    return new EventBus({
        maxListeners: 1000,
        enableMetrics: true,
        enableTelemetry: true,
        ...config,
    });
}
/**
 * Create a validated event bus.
 */
export function createValidatedEventBus(config = {}) {
    const { EventBus } = require('./core/event-bus');
    return new EventBus({
        enableValidation: true,
        ...config,
    });
}
/**
 * Create a type-safe event bus.
 */
export function createTypeSafeEventBus(config = {}) {
    const { TypeSafeEventSystem } = require('./core/type-safe-event-system');
    return new TypeSafeEventSystem();
}
/**
 * Create UEL instance.
 */
export function createUEL(config) {
    const { initializeUEL } = require('./core/uel-singleton');
    return initializeUEL(config);
}
/**
 * Get UEL singleton.
 */
export function getUELSingleton() {
    const { getUEL } = require('./core/uel-singleton');
    return getUEL();
}
/**
 * UEL singleton instance.
 */
export const uel = getUELSingleton();
// =============================================================================
// MIDDLEWARE CREATORS - Common middleware functions
// =============================================================================
/**
 * Create logging middleware.
 */
export function createLoggingMiddleware() {
    return async (context, next) => {
        console.log(`Event: ${context.event}`, context.payload);
        await next();
    };
}
/**
 * Create timing middleware.
 */
export function createTimingMiddleware() {
    return async (context, next) => {
        const start = Date.now();
        await next();
        console.log(`Event ${context.event} took ${Date.now() - start}ms`);
    };
}
/**
 * Create validation middleware.
 */
export function createValidationMiddleware(validator) {
    return async (context, next) => {
        if (!validator(context)) {
            throw new Error(`Validation failed for event: ${context.event}`);
        }
        await next();
    };
}
/**
 * Create error handling middleware.
 */
export function createErrorHandlingMiddleware() {
    return async (context, next) => {
        try {
            await next();
        }
        catch (error) {
            console.error(`Error processing event ${context.event}:`, error);
            throw error;
        }
    };
}
/**
 * Create rate limiting middleware.
 */
export function createRateLimitingMiddleware(maxPerSecond) {
    const requests = new Map();
    return async (context, next) => {
        const now = Date.now();
        const eventRequests = requests.get(context.event) || [];
        const recentRequests = eventRequests.filter(time => now - time < 1000);
        if (recentRequests.length >= maxPerSecond) {
            throw new Error(`Rate limit exceeded for event: ${context.event}`);
        }
        recentRequests.push(now);
        requests.set(context.event, recentRequests);
        await next();
    };
}
/**
 * Create conditional middleware.
 */
export function createConditionalMiddleware(condition, middleware) {
    return async (context, next) => {
        await (condition(context) ? middleware(context, next) : next());
    };
}
/**
 * Create event type middleware.
 */
export function createEventTypeMiddleware(eventType, middleware) {
    return createConditionalMiddleware((context) => context.event === eventType, middleware);
}
/**
 * Create async middleware.
 */
export function createAsyncMiddleware(asyncFn) {
    return async (context, next) => {
        await asyncFn(context);
        await next();
    };
}
// =============================================================================
// VALIDATION EXPORTS - Event validation framework
// =============================================================================
export class EventValidator {
    static validate(event) {
        return event && typeof event === 'object' && typeof event.type === 'string';
    }
}
export class DomainValidator {
    static validate(domain, data) {
        return typeof domain === 'string' && data !== undefined;
    }
}
export class ValidationChain {
    validators = [];
    add(validator) {
        this.validators.push(validator);
        return this;
    }
    validate(data) {
        return this.validators.every(validator => validator(data));
    }
}
export function createValidationChain() {
    return new ValidationChain();
}
// Base event schema
export const BaseEventSchema = {
    type: 'string',
    payload: 'object',
    timestamp: 'date',
};
// Event schemas registry
export const EventSchemas = {
    base: BaseEventSchema,
    system: { ...BaseEventSchema, source: 'string' },
    coordination: { ...BaseEventSchema, coordinationId: 'string' },
    workflow: { ...BaseEventSchema, workflowId: 'string', stepId: 'string' },
};
// =============================================================================
// DEFAULT EXPORT
// =============================================================================
const { EventBus } = require('./core/event-bus');
export default EventBus;
