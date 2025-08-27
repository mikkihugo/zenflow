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
export { EventSystem, TypeSafeEventSystem } from './core/type-safe-event-system';
export { BaseEventManager } from './core/base-event-manager';

// =============================================================================
// UEL (UNIFIED EVENT LAYER) - Comprehensive event coordination
// =============================================================================
export { UEL, getUEL, initializeUEL } from './core/uel-singleton';
export type { UELConfig, UELSystemStatus } from './core/uel-singleton';

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
export {
  UELEnhancedEventBus,
  SystemIntegrationManager,
  EventEmitterToUELMigrationHelper,
  UELIntegrationFactory,
  SystemLifecycleManager,
  uelIntegrationFactory,
  systemLifecycleManager,
} from './system-integrations';

// =============================================================================
// COMPATIBILITY LAYER - EventEmitter compatibility
// =============================================================================
export * from './compatibility';

// =============================================================================
// CORE INTERFACES AND TYPES - Type definitions
// =============================================================================
export type * from './core/interfaces';
// Only export from types/index to avoid duplicate WorkflowEvent
export type * from './types';

// =============================================================================
// MIDDLEWARE SYSTEM - Event processing middleware
// =============================================================================
export { MiddlewareChain } from './core/middleware';
export type { EventMiddleware, EventContext } from './core/middleware';

// =============================================================================
// VALIDATION SYSTEM - Event validation framework
// =============================================================================
export { getDomainValidator, validateCrossDomain } from './core/domain-validator';
export type { DomainBoundaryValidator } from './core/types';

// =============================================================================
// OBSERVER PATTERN - Observable implementations
// =============================================================================
export { SimpleObservable } from './observer-system';
export type { Observer, Observable } from './observer-system';

// =============================================================================
// REGISTRY SYSTEM - Event system registry
// =============================================================================
export { RegistryIndex } from './registry-index';
export * from './registry';

// Core event system types - these belong here in main.ts
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

// Registry comes from the registry module
export { EventRegistry as EventManagerRegistry } from './registry';
import type { EventRegistry } from './registry';

// Advanced types that may come from other packages in the future  
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

export type EventTypeFromSchema<T> = T extends { type: infer U } ? U : never;
export type AllEventTypes = string;

// =============================================================================
// UTILITY FUNCTIONS - Helper functions
// =============================================================================

/**
 * Create a typed event bus with configuration.
 */
export function createEventBus(config: any = {}) {
  return new EventBus(config);
}

/**
 * Create a high-performance event bus.
 */
export function createHighPerformanceEventBus(config: any = {}) {
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
export function createValidatedEventBus(config: any = {}) {
  return new EventBus({
    enableValidation: true,
    ...config,
  });
}

/**
 * Create a type-safe event bus.
 */
export function createTypeSafeEventBus(config: any = {}) {
  return new TypeSafeEventSystem();
}

/**
 * Create UEL instance.
 */
export function createUEL(config?: any) {
  return initializeUEL(config);
}

/**
 * Get UEL singleton.
 */
export const uel = getUEL();

// =============================================================================
// MIDDLEWARE CREATORS - Common middleware functions
// =============================================================================

/**
 * Create logging middleware.
 */
export function createLoggingMiddleware() {
  return async (context: any, next: () => Promise<void>) => {
    console.log(`Event: ${context.event}`, context.payload);
    await next();
  };
}

/**
 * Create timing middleware.
 */
export function createTimingMiddleware() {
  return async (context: any, next: () => Promise<void>) => {
    const start = Date.now();
    await next();
    console.log(`Event ${context.event} took ${Date.now() - start}ms`);
  };
}

/**
 * Create validation middleware.
 */
export function createValidationMiddleware(validator: (context: any) => boolean) {
  return async (context: any, next: () => Promise<void>) => {
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
  return async (context: any, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      console.error(`Error processing event ${context.event}:`, error);
      throw error;
    }
  };
}

/**
 * Create rate limiting middleware.
 */
export function createRateLimitingMiddleware(maxPerSecond: number) {
  const requests = new Map<string, number[]>();
  
  return async (context: any, next: () => Promise<void>) => {
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
export function createConditionalMiddleware(condition: (context: any) => boolean, middleware: any) {
  return async (context: any, next: () => Promise<void>) => {
    await (condition(context) ? middleware(context, next) : next());
  };
}

/**
 * Create event type middleware.
 */
export function createEventTypeMiddleware(eventType: string, middleware: any) {
  return createConditionalMiddleware(
    (context) => context.event === eventType,
    middleware
  );
}

/**
 * Create async middleware.
 */
export function createAsyncMiddleware(asyncFn: (context: any) => Promise<void>) {
  return async (context: any, next: () => Promise<void>) => {
    await asyncFn(context);
    await next();
  };
}

// =============================================================================
// VALIDATION EXPORTS - Event validation framework
// =============================================================================

export class EventValidator {
  static validate(event: any): boolean {
    return event && typeof event === 'object' && typeof event.type === 'string';
  }
}

export class DomainValidator {
  static validate(domain: string, data: any): boolean {
    return typeof domain === 'string' && data !== undefined;
  }
}

export class ValidationChain {
  private validators: Array<(data: any) => boolean> = [];

  add(validator: (data: any) => boolean): this {
    this.validators.push(validator);
    return this;
  }

  validate(data: any): boolean {
    return this.validators.every(validator => validator(data));
  }
}

export function createValidationChain(): ValidationChain {
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
export default EventBus;