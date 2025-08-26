/**
 * @fileoverview Type-Safe Event Bus - mitt + zod Integration
 *
 * Modern type-safe event system combining mitt (200 bytes) with zod validation.
 * Replaces custom type-safe event implementation with battle-tested dependencies.
 *
 * **BATTLE-TESTED DEPENDENCIES:**
 * - mitt: Tiny (200 bytes) functional event emitter with wildcard support
 * - zod: TypeScript-first schema validation with compile-time type inference
 * - foundation: Professional error handling and logging
 *
 * Key Features:
 * - Compile-time type safety with runtime validation
 * - Tiny footprint (200 bytes for core emitter)
 * - Wildcard event support
 * - Schema-based validation with rich error messages
 * - Foundation integration for robust error handling
 *
 * @example Type-safe event usage
 * ```typescript`
 * import { TypedEventBus } from '@claude-zen/event-system/core;
 * import { EventSchemas } from '@claude-zen/event-system/validation;
 *
 * const eventBus = new TypedEventBus({
 *   enableValidation: true,
 *   enableWildcards: true
 * });
 *
 * // Type-safe event handling with validation
 * eventBus.on('user.login', (event) => {'
 *   // event is fully typed from schema
 *   console.log('User logged in:', event.payload.userId);
 * });
 *
 * // Emit with automatic validation
 * eventBus.emit('user.login', {'
 *   id: 'evt_123',
 *   type: 'user.login',
 *   payload: { userId: 'user_456' }'
 * });
 * ````
 */

import mitt, { type Emitter } from 'mitt;

import { 
  getLogger,
  metered,
  type Result,
  recordHistogram,
  recordMetric,
  safeAsync,
  traced,
  withTrace,} from '@claude-zen/foundation';
import {
  EventValidator,
  BaseEventSchema,
  EventSchemas,
  type BaseEvent,
} from '../validation/zod-validation;

const logger = getLogger('TypedEventBus');

// =============================================================================
// TYPE-SAFE EVENT SYSTEM CONFIGURATION
// =============================================================================

export interface TypedEventBusConfig {
  /** Enable runtime schema validation */
  enableValidation: boolean;
  /** Enable wildcard event support */
  enableWildcards: boolean;
  /** Enable logging for debugging */
  enableLogging: boolean;
  /** Enable telemetry tracking */
  enableTelemetry: boolean;
  /** Throw on validation errors vs log and continue */
  throwOnValidationError: boolean;
  /** Maximum listeners per event type */
  maxListeners: number;
}

// Event map for type safety with mitt
export interface TypedEventMap {
  // Base events
  '*': BaseEvent;
  [key: string]: any;
  [key: symbol]: any;
}

// Handler type for type-safe event listeners
export type TypedEventHandler<T = any> = (event: T) => void|Promise<void>;

// Wildcard handler type
export type WildcardHandler = (
  type: string|symbol,
  event: any
) => void|Promise<void>;

// =============================================================================
// TYPE-SAFE EVENT BUS IMPLEMENTATION
// =============================================================================

/**
 * Type-safe event bus combining mitt (200 bytes) with zod validation.
 * Provides compile-time type safety with runtime validation.
 */
export class TypedEventBus {
  private emitter: Emitter<TypedEventMap>;
  private config: TypedEventBusConfig;
  private validators = new Map<string, EventValidator<any>>();
  private listenerCounts = new Map<string, number>();

  constructor(config: Partial<TypedEventBusConfig> = {}) {
    // Create mitt emitter (200 bytes!)
    this.emitter = mitt<TypedEventMap>();

    this.config = {
      enableValidation: true,
      enableWildcards: false,
      enableLogging: true,
      enableTelemetry: true,
      throwOnValidationError: false,
      maxListeners: 100,
      ...config,
    };

    // Pre-register common event validators
    this.initializeValidators();

    if (this.config.enableLogging) {
      logger.info('[TypedEventBus] Initialized with mitt + zod integration', {'
        config: this.config,
        validatorCount: this.validators.size,
      });
    }
  }

  // =============================================================================
  // TYPE-SAFE EVENT EMISSION
  // =============================================================================

  /**
   * Emit type-safe event with optional validation and telemetry.
   * Provides compile-time type safety and runtime validation.
   */
  @traced('typed_event.emit')'
  @metered('typed_event_bus_emit')'
  async emit<K extends keyof TypedEventMap>(
    type: K,
    event: TypedEventMap[K]
  ): Promise<Result<void, Error>{> {
    return withTrace('typed_event.emit', async (span) => {'
      return safeAsync(async () => {
        const startTime = Date.now();

        // Record telemetry metrics
        if (this.config.enableTelemetry) {
          recordMetric('typed_event_bus.events_total', 1, {'
            event_type: String(type),
          });
          recordMetric(
            'typed_event_bus.active_listeners',
            this.getListenerCount(String(type)),
            { event_type: String(type) }
          );
        }

        // Validate event if validation is enabled
        if (this.config.enableValidation) {
          const validationResult = await this.validateEvent(
            String(type),
            event
          );
          if (!validationResult.isOk()) {
            const _error = new Error(
              `Event validation failed for '${String(type)}': ${validationResult.error.message}``
            );

            if (this.config.enableTelemetry) {
              recordMetric('typed_event_bus.validation_errors', 1, {'
                event_type: String(type),
              });
            }

            if (this.config.throwOnValidationError) {
              throw error;
            } else {
              logger.error(
                '[TypedEventBus] Validation failed, event not emitted',
                {
                  type: String(type),
                  error: validationResult.error.message,
                  event,
                }
              );
              return;
            }
          }
        }

        // Log if enabled
        if (this.config.enableLogging) {
          logger.debug(`[TypedEventBus] Emitting event: ${String(type)}`, {`
            type: String(type),
            eventId: (event as any)?.id,
            timestamp: (event as any)?.timestamp,
          });
        }

        // Use mitt's emit (functional and tiny)'
        this.emitter.emit(type, event);

        // Record processing time telemetry
        const processingTime = Date.now() - startTime;
        if (this.config.enableTelemetry) {
          recordHistogram(
            'typed_event_bus.processing_duration',
            processingTime,
            { event_type: String(type) }
          );
          span?.setAttributes({
            'event.processing_time_ms': processingTime,
            'event.validation_enabled': this.config.enableValidation,
          });
        }
      });
    });
  }

  /**
   * Emit event synchronously (without validation for performance).
   * Use for high-frequency events where validation is not needed.
   */
  emitSync<K extends keyof TypedEventMap>(
    type: K,
    event: TypedEventMap[K]
  ): void {
    try {
      this.emitter.emit(type, event);
    } catch (_error) {
      logger.error(
        `[TypedEventBus] Error emitting event '${String(type)}':`,`
        error
      );
    }
  }

  // =============================================================================
  // TYPE-SAFE EVENT LISTENERS
  // =============================================================================

  /**
   * Register type-safe event listener with telemetry.
   * Handler receives properly typed event data.
   */
  on<K extends keyof TypedEventMap>(
    type: K,
    handler: TypedEventHandler<TypedEventMap[K]>
  ): void {
    // Check listener limits
    const currentCount = this.listenerCounts.get(String(type))||0;
    if (currentCount >= this.config.maxListeners) {
      logger.warn(
        `[TypedEventBus] Max listeners (${this.config.maxListeners}) reached for event: ${String(type)}``
      );
      return;
    }

    this.emitter.on(type, handler);
    this.listenerCounts.set(String(type), currentCount + 1);

    // Record telemetry
    if (this.config.enableTelemetry) {
      recordMetric('typed_event_bus.listeners_registered', 1, {'
        event_type: String(type),
      });
      recordMetric(
        'typed_event_bus.total_listeners',
        this.getTotalListenerCount()
      );
    }

    if (this.config.enableLogging) {
      logger.debug(
        `[TypedEventBus] Registered listener for event: ${String(type)}`,`
        {
          type: String(type),
          listenerCount: currentCount + 1,
        }
      );
    }
  }

  /**
   * Register one-time event listener.
   * Handler is automatically removed after first event.
   */
  once<K extends keyof TypedEventMap>(
    type: K,
    handler: TypedEventHandler<TypedEventMap[K]>
  ): void {
    const wrappedHandler = (event: TypedEventMap[K]) => {
      handler(event);
      this.off(type, wrappedHandler);
    };

    this.on(type, wrappedHandler);
  }

  /**
   * Remove event listener.
   */
  off<K extends keyof TypedEventMap>(
    type: K,
    handler?: TypedEventHandler<TypedEventMap[K]>
  ): void {
    this.emitter.off(type, handler);

    if (handler) {
      const currentCount = this.listenerCounts.get(String(type))||0;
      this.listenerCounts.set(String(type), Math.max(0, currentCount - 1));
    } else {
      // Removing all listeners for this type
      this.listenerCounts.set(String(type), 0);
    }
  }

  /**
   * Register wildcard listener (if enabled).
   * Receives all events with type information.
   */
  onAny(handler: WildcardHandler): void {
    if (!this.config.enableWildcards) {
      logger.warn('[TypedEventBus] Wildcard listeners disabled in config');
      return;
    }

    this.emitter.on('*', handler as any);
  }

  /**
   * Remove wildcard listener.
   */
  offAny(handler: WildcardHandler): void {
    this.emitter.off('*', handler as any);
  }

  // =============================================================================
  // VALIDATION SYSTEM
  // =============================================================================

  /**
   * Register custom validator for event type.
   */
  registerValidator<T>(eventType: string, schema: z.ZodSchema<T>): void {
    const validator = new EventValidator(schema, eventType);
    this.validators.set(eventType, validator);

    if (this.config.enableLogging) {
      logger.debug(
        `[TypedEventBus] Registered validator for event: ${eventType}``
      );
    }
  }

  /**
   * Validate event against registered schema.
   */
  private async validateEvent(
    eventType: string,
    event: unknown
  ): Promise<Result<unknown, Error>{> {
    const validator =
      this.validators.get(eventType)||this.validators.get('*');

    if (!validator) {
      // Try base event validation as fallback
      const baseValidator = new EventValidator(BaseEventSchema, 'BaseEvent');
      return baseValidator.validate(event);
    }

    return validator.validate(event);
  }

  /**
   * Initialize built-in validators from schemas.
   */
  private initializeValidators(): void {
    // Register base event validator
    this.validators.set('*', new EventValidator(BaseEventSchema, 'BaseEvent'));

    // Register specific event type validators from EventSchemas
    for (const [schemaName, schema] of Object.entries(EventSchemas)) {
      if (schemaName !== 'BaseEvent') {'
        // Convert schema name to event type (e.g., 'AgentCreated' -> 'agent.created')'
        const eventType = schemaName
          .replace(/([A-Z])/g, '.$1')'
          .toLowerCase()
          .slice(1);

        this.validators.set(eventType, new EventValidator(schema, schemaName));
      }
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get all registered event types.
   */
  getEventTypes(): string[] {
    return Array.from(this.validators.keys())();
  }

  /**
   * Get listener count for event type.
   */
  getListenerCount(eventType: string): number {
    return this.listenerCounts.get(eventType)||0;
  }

  /**
   * Get total listener count across all events.
   */
  getTotalListenerCount(): number {
    return Array.from(this.listenerCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    );
  }

  /**
   * Clear all event listeners.
   */
  clear(): void {
    this.emitter.all.clear();
    this.listenerCounts.clear();

    if (this.config.enableLogging) {
      logger.info('[TypedEventBus] Cleared all event listeners');
    }
  }

  /**
   * Get configuration.
   */
  getConfig(): TypedEventBusConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(updates: Partial<TypedEventBusConfig>): void {
    this.config = { ...this.config, ...updates };

    if (this.config.enableLogging) {
      logger.info('[TypedEventBus] Configuration updated', {'
        config: this.config,
      });
    }
  }

  /**
   * Get event bus statistics.
   */
  getStats(): {
    totalListeners: number;
    eventTypes: string[];
    validatorCount: number;
    config: TypedEventBusConfig;
  } {
    return {
      totalListeners: this.getTotalListenerCount(),
      eventTypes: this.getEventTypes(),
      validatorCount: this.validators.size,
      config: this.getConfig(),
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create typed event bus with common configuration.
 */
export function createTypedEventBus(
  config?: Partial<TypedEventBusConfig>
): TypedEventBus {
  return new TypedEventBus(config);
}

/**
 * Create event bus optimized for high performance.
 */
export function createHighPerformanceEventBus(): TypedEventBus {
  return new TypedEventBus({
    enableValidation: false,
    enableLogging: false,
    enableTelemetry: true, // Keep telemetry for performance monitoring
    enableWildcards: false,
    throwOnValidationError: false,
    maxListeners: 1000,
  });
}

/**
 * Create event bus with full validation and debugging.
 */
export function createValidatedEventBus(): TypedEventBus {
  return new TypedEventBus({
    enableValidation: true,
    enableLogging: true,
    enableTelemetry: true,
    enableWildcards: true,
    throwOnValidationError: true,
    maxListeners: 100,
  });
}

export default TypedEventBus;
