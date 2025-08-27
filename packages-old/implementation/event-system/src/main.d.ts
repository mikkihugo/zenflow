/**
 * @file Event System Main Exports
 *
 * Central export file for the comprehensive event system implementation.
 * This exports all the battle-tested event management functionality.
 */
export { EventBus } from './core/event-bus';
export { TypedEventBus } from './core/typed-event-bus';
export { TypeSafeEventSystem } from './core/type-safe-event-system';
export { BaseEventManager } from './core/base-event-manager';
export { UEL, getUEL, initializeUEL } from './core/uel-singleton';
export type { UELConfig, UELSystemStatus } from './core/uel-singleton';
export { EventManager } from './manager';
export * from './event-manager-types';
export * from './adapters';
export * from './factories';
export { UELEnhancedEventBus, SystemIntegrationManager, EventEmitterToUELMigrationHelper, UELIntegrationFactory, SystemLifecycleManager, uelIntegrationFactory, systemLifecycleManager, } from './system-integrations';
export * from './compatibility';
export type * from './core/interfaces';
export type * from './types';
export { MiddlewareChain } from './core/middleware';
export type { EventMiddleware, EventContext } from './core/middleware';
export { getDomainValidator, validateCrossDomain } from './core/domain-validator';
export type { DomainBoundaryValidator } from './core/types';
export { SimpleObservable } from './observer-system';
export type { Observer, Observable } from './observer-system';
export { RegistryIndex } from './registry-index';
export * from './registry';
export interface EventBusConfig {
    maxListeners?: number;
    enableMetrics?: boolean;
}
export interface EventBusMetrics {
    eventsEmitted: number;
    listenersCount: number;
}
export interface BaseEvent {
    type: string;
    timestamp: Date;
}
export interface CoreEvent extends BaseEvent {
    id: string;
    source: string;
}
export { EventRegistry as EventManagerRegistry } from './registry';
import type { EventRegistry } from './registry';
export interface EventSystemOptions {
    registry?: EventRegistry;
    config?: EventBusConfig;
}
export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
export interface DomainBoundary {
    from: string;
    to: string;
}
export interface TypedEventBusConfig extends EventBusConfig {
    strict?: boolean;
}
export interface TypedEventMap {
    [key: string]: unknown;
}
export interface TypedEventHandler<T = unknown> {
    (event: T): void;
}
export interface WildcardHandler {
    (eventType: string, data: unknown): void;
}
export type EventTypeFromSchema<T> = T extends {
    type: infer U;
} ? U : never;
export type AllEventTypes = string;
/**
 * Create a typed event bus with configuration.
 */
export declare function createTypedEventBus(config?: any): any;
/**
 * Create a high-performance event bus.
 */
export declare function createHighPerformanceEventBus(config?: any): any;
/**
 * Create a validated event bus.
 */
export declare function createValidatedEventBus(config?: any): any;
/**
 * Create a type-safe event bus.
 */
export declare function createTypeSafeEventBus(config?: any): any;
/**
 * Create UEL instance.
 */
export declare function createUEL(config?: any): any;
/**
 * Get UEL singleton.
 */
export declare function getUELSingleton(): any;
/**
 * UEL singleton instance.
 */
export declare const uel: any;
/**
 * Create logging middleware.
 */
export declare function createLoggingMiddleware(): (context: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create timing middleware.
 */
export declare function createTimingMiddleware(): (context: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create validation middleware.
 */
export declare function createValidationMiddleware(validator: (context: any) => boolean): (context: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create error handling middleware.
 */
export declare function createErrorHandlingMiddleware(): (context: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create rate limiting middleware.
 */
export declare function createRateLimitingMiddleware(maxPerSecond: number): (context: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create conditional middleware.
 */
export declare function createConditionalMiddleware(condition: (context: any) => boolean, middleware: any): (context: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create event type middleware.
 */
export declare function createEventTypeMiddleware(eventType: string, middleware: any): (context: any, next: () => Promise<void>) => Promise<void>;
/**
 * Create async middleware.
 */
export declare function createAsyncMiddleware(asyncFn: (context: any) => Promise<void>): (context: any, next: () => Promise<void>) => Promise<void>;
export declare class EventValidator {
    static validate(event: any): boolean;
}
export declare class DomainValidator {
    static validate(domain: string, data: any): boolean;
}
export declare class ValidationChain {
    private validators;
    add(validator: (data: any) => boolean): this;
    validate(data: any): boolean;
}
export declare function createValidationChain(): ValidationChain;
export declare const BaseEventSchema: {
    type: string;
    payload: string;
    timestamp: string;
};
export declare const EventSchemas: {
    base: {
        type: string;
        payload: string;
        timestamp: string;
    };
    system: {
        source: string;
        type: string;
        payload: string;
        timestamp: string;
    };
    coordination: {
        coordinationId: string;
        type: string;
        payload: string;
        timestamp: string;
    };
    workflow: {
        workflowId: string;
        stepId: string;
        type: string;
        payload: string;
        timestamp: string;
    };
};
declare const EventBus: any;
export default EventBus;
//# sourceMappingURL=main.d.ts.map