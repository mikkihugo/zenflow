/**
 * @fileoverview Event System Main - Simplified working implementation
 * 
 * Minimal event system implementation that compiles without decorator issues.
 * This provides the basic functionality needed for the collaborative-decision-system.
 */

import { EventEmitter } from 'eventemitter3';
import type { Result } from '@claude-zen/foundation';

// =============================================================================
// CORE EVENT BUS IMPLEMENTATION
// =============================================================================

export interface EventBusConfig {
  maxListeners?: number;
  enableMetrics?: boolean;
  enableValidation?: boolean;
  performance?: boolean;
  validation?: boolean;
}

export interface EventBusMetrics {
  totalEvents: number;
  averageLatency: number;
  errorRate: number;
  eventsPerSecond: number;
}

/**
 * Core EventBus implementation using EventEmitter3
 */
export class EventBus extends EventEmitter {
  private config: EventBusConfig;

  constructor(config: EventBusConfig = {}) {
    super();
    this.config = config;
    // Note: EventEmitter3 doesn't have setMaxListeners, but we keep config for compatibility
  }

  async emitAsync(eventType: string, payload: any): Promise<boolean> {
    super.emit(eventType, payload);
    return Promise.resolve(true);
  }

  async destroy(): Promise<void> {
    this.removeAllListeners();
  }

  getConfig(): EventBusConfig {
    return this.config;
  }
}

// =============================================================================
// TYPED EVENT BUS
// =============================================================================

export type TypedEventMap = Record<string, any>;

export interface TypedEventBusConfig extends EventBusConfig {
  enableNeuralRouting?: boolean;
  enableTelemetry?: boolean;
}

export type TypedEventHandler<T = any> = (event: T) => void | Promise<void>;
export type WildcardHandler = (type: string, event: any) => void | Promise<void>;

/**
 * TypedEventBus with type-safe event handling
 */
export class TypedEventBus<TEventMap extends TypedEventMap = TypedEventMap> extends EventBus {
  constructor(config: TypedEventBusConfig = {}) {
    super(config);
  }

  // Override with compatible signatures
  onTyped<K extends keyof TEventMap>(type: K, handler: TypedEventHandler<TEventMap[K]>): this {
    super.on(type as string, handler);
    return this;
  }

  emitTyped<K extends keyof TEventMap>(type: K, event: TEventMap[K]): boolean {
    return super.emit(type as string, event);
  }

  async emitAsyncTyped<K extends keyof TEventMap>(type: K, event: TEventMap[K]): Promise<boolean> {
    const result = super.emit(type as string, event);
    return Promise.resolve(result);
  }
}

// =============================================================================
// TYPE-SAFE EVENT BUS (Alternative implementation)
// =============================================================================

export class TypeSafeEventBus extends TypedEventBus {
  constructor(config: TypedEventBusConfig = {}) {
    super(config);
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createTypedEventBus<TEventMap extends TypedEventMap = TypedEventMap>(
  config: TypedEventBusConfig = {}
): TypedEventBus<TEventMap> {
  return new TypedEventBus<TEventMap>(config);
}

export function createHighPerformanceEventBus(
  config: EventBusConfig = {}
): EventBus {
  return new EventBus({ ...config, performance: true });
}

export function createValidatedEventBus(
  config: EventBusConfig = {}
): EventBus {
  return new EventBus({ ...config, validation: true });
}

export function createTypeSafeEventBus<TEventMap extends TypedEventMap = TypedEventMap>(
  config: TypedEventBusConfig = {}
): TypeSafeEventBus {
  return new TypeSafeEventBus(config);
}

// =============================================================================
// UNIFIED EVENT LAYER (UEL)
// =============================================================================

export interface UELConfig extends EventBusConfig {
  globalInstance?: boolean;
}

// Global UEL instance
export const uel = new EventBus({ maxListeners: 1000 });

export function createUEL(config: UELConfig = {}): EventBus {
  if (config.globalInstance) {
    return uel;
  }
  return new EventBus(config);
}

// =============================================================================
// MIDDLEWARE SYSTEM
// =============================================================================

export type EventMiddleware = (event: any, next?: () => void | Promise<void>) => void | Promise<void>;
export type EventContext = { event: any; metadata?: Record<string, any> };

export function createLoggingMiddleware(config: { prefix?: string } = {}): EventMiddleware {
  const prefix = config.prefix || '[EventSystem]';
  return (event, next) => {
    console.log(prefix, event.type || 'unknown', event);
    if (next) return next();
  };
}

export function createTimingMiddleware(config: { logTiming?: boolean } = {}): EventMiddleware {
  return (event, next) => {
    const start = Date.now();
    const result = next ? next() : Promise.resolve();
    
    if (result && typeof result.then === 'function') {
      return result.then(r => {
        if (config.logTiming) {
          console.log(`[EventSystem] ${event.type} took ${Date.now() - start}ms`);
        }
        return r;
      });
    }
    
    if (config.logTiming) {
      console.log(`[EventSystem] ${event.type} took ${Date.now() - start}ms`);
    }
    
    return result;
  };
}

export function createValidationMiddleware(config: { strict?: boolean } = {}): EventMiddleware {
  return (event, next) => {
    if (!event || typeof event !== 'object') {
      if (config.strict) {
        throw new Error('Invalid event object');
      }
      console.warn('[EventSystem] Warning: Invalid event object');
    }
    if (next) return next();
  };
}

export function createErrorHandlingMiddleware(config: { logErrors?: boolean } = {}): EventMiddleware {
  return (event, next) => {
    try {
      return next ? next() : Promise.resolve();
    } catch (error) {
      if (config.logErrors) {
        console.error('[EventSystem] Error handling event:', error);
      }
      throw error;
    }
  };
}

export function createRateLimitingMiddleware(config: { maxEventsPerSecond?: number } = {}): EventMiddleware {
  const rateLimitMap = new Map<string, number[]>();
  const limit = config.maxEventsPerSecond || 100;
  
  return (event, next) => {
    const eventType = event.type || 'unknown';
    const now = Date.now();
    const windowStart = now - 1000; // 1 second window
    
    if (!rateLimitMap.has(eventType)) {
      rateLimitMap.set(eventType, []);
    }
    
    const timestamps = rateLimitMap.get(eventType)!;
    // Remove old timestamps
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift();
    }
    
    if (timestamps.length >= limit) {
      console.warn(`[EventSystem] Rate limit exceeded for ${eventType}`);
      return;
    }
    
    timestamps.push(now);
    if (next) return next();
  };
}

export function createConditionalMiddleware(
  condition: (event: any) => boolean,
  config: any = {}
): EventMiddleware {
  return (event, next) => {
    if (condition(event) && next) {
      return next();
    }
    if (!condition(event)) {
      return; // Skip if condition not met
    }
    if (next) return next();
  };
}

export function createEventTypeMiddleware(config: { allowedTypes?: string[] } = {}): EventMiddleware {
  return (event, next) => {
    if (config.allowedTypes && config.allowedTypes.length > 0) {
      if (!config.allowedTypes.includes(event.type)) {
        console.warn(`[EventSystem] Event type ${event.type} not allowed`);
        return;
      }
    }
    if (next) return next();
  };
}

export function createAsyncMiddleware(handler: (event: any) => Promise<void>): EventMiddleware {
  return async (event, next) => {
    await handler(event);
    if (next) return await next();
  };
}

// =============================================================================
// VALIDATION FRAMEWORK
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class EventValidator {
  validate(event: any): ValidationResult {
    if (!event || typeof event !== 'object') {
      return { valid: false, errors: ['Event must be an object'] };
    }
    return { valid: true, errors: [] };
  }
}

export class DomainValidator extends EventValidator {
  constructor(private allowedDomains: string[] = []) {
    super();
  }

  validate(event: any): ValidationResult {
    const baseResult = super.validate(event);
    if (!baseResult.valid) return baseResult;

    if (this.allowedDomains.length > 0 && !this.allowedDomains.includes(event.domain)) {
      return { valid: false, errors: [`Domain ${event.domain} not allowed`] };
    }

    return { valid: true, errors: [] };
  }
}

export class ValidationChain {
  private validators: EventValidator[] = [];

  add(validator: EventValidator): this {
    this.validators.push(validator);
    return this;
  }

  validate(event: any): ValidationResult {
    for (const validator of this.validators) {
      const result = validator.validate(event);
      if (!result.valid) return result;
    }
    return { valid: true, errors: [] };
  }
}

export function createValidationChain(): ValidationChain {
  return new ValidationChain();
}

// =============================================================================
// SCHEMA FRAMEWORK (Simplified)
// =============================================================================

export interface EventSchema<T = any> {
  parse(data: unknown): T;
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: Error };
}

export const BaseEventSchema: EventSchema<any> = {
  parse: (data) => data,
  safeParse: (data) => ({ success: true, data })
};

export const EventSchemas = {
  base: BaseEventSchema,
  coordination: BaseEventSchema,
  workflow: BaseEventSchema,
  interface: BaseEventSchema,
  core: BaseEventSchema
};

// =============================================================================
// DOMAIN BOUNDARY TYPES
// =============================================================================

export type DomainBoundary = 'COORDINATION' | 'WORKFLOW' | 'NEURAL' | 'DATABASE' | 'MEMORY' | 'KNOWLEDGE' | 'INTERFACE' | 'CORE';

export interface BaseEvent {
  id: string;
  type: string;
  domain: DomainBoundary;
  timestamp: Date;
  version?: string;
  payload?: any;
}

export interface CoordinationEvent extends BaseEvent {
  domain: 'COORDINATION';
}

export interface WorkflowEvent extends BaseEvent {
  domain: 'WORKFLOW';
}

export interface InterfaceEvent extends BaseEvent {
  domain: 'INTERFACE';
}

export interface CoreEvent extends BaseEvent {
  domain: 'CORE';
}

export type EventTypeFromSchema<T> = T extends EventSchema<infer U> ? U : never;
export type AllEventTypes = BaseEvent | CoordinationEvent | WorkflowEvent | InterfaceEvent | CoreEvent;

// =============================================================================
// CORE INTERFACES
// =============================================================================

export interface EventManagerConfig extends EventBusConfig {
  name?: string;
  strategy?: string;
}

export interface EventManagerStatus {
  active: boolean;
  eventCount: number;
  errorCount: number;
}

export interface EventManagerMetrics {
  totalEvents: number;
  averageLatency: number;
  errorRate: number;
}

export type EventFilter = (event: any) => boolean;
export type EventManagerType = 'basic' | 'typed' | 'validated' | 'neural';
export type EventListener = (...args: any[]) => void;
export type EventSubscription = { unsubscribe: () => void };

export interface EventManager {
  emit(event: string, data: any): Promise<boolean>;
  on(event: string, listener: EventListener): EventSubscription;
  destroy(): Promise<void>;
}

export interface EventManagerFactory {
  create(type: EventManagerType, config?: EventManagerConfig): EventManager;
}

export interface EventManagerRegistry {
  register(name: string, manager: EventManager): void;
  get(name: string): EventManager | undefined;
}

export interface EventSystemOptions {
  type?: EventManagerType;
  config?: EventManagerConfig;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default EventBus;