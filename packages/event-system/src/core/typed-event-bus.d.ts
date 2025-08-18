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
 * ```typescript
 * import { TypedEventBus } from '@claude-zen/event-system/core';
 * import { EventSchemas } from '@claude-zen/event-system/validation';
 *
 * const eventBus = new TypedEventBus({
 *   enableValidation: true,
 *   enableWildcards: true
 * });
 *
 * // Type-safe event handling with validation
 * eventBus.on('user.login', (event) => {
 *   // event is fully typed from schema
 *   console.log('User logged in:', event.payload.userId);
 * });
 *
 * // Emit with automatic validation
 * eventBus.emit('user.login', {
 *   id: 'evt_123',
 *   type: 'user.login',
 *   payload: { userId: 'user_456' }
 * });
 * ```
 */
import { z } from 'zod';
import { Result } from '@claude-zen/foundation';
import { type BaseEvent } from '../validation/zod-validation';
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
export interface TypedEventMap {
    '*': BaseEvent;
    [key: string]: any;
    [key: symbol]: any;
}
export type TypedEventHandler<T = any> = (event: T) => void | Promise<void>;
export type WildcardHandler = (type: string | symbol, event: any) => void | Promise<void>;
/**
 * Type-safe event bus combining mitt (200 bytes) with zod validation.
 * Provides compile-time type safety with runtime validation.
 */
export declare class TypedEventBus {
    private emitter;
    private config;
    private validators;
    private listenerCounts;
    constructor(config?: Partial<TypedEventBusConfig>);
    /**
     * Emit type-safe event with optional validation and telemetry.
     * Provides compile-time type safety and runtime validation.
     */
    emit<K extends keyof TypedEventMap>(type: K, event: TypedEventMap[K]): Promise<Result<void, Error>>;
    /**
     * Emit event synchronously (without validation for performance).
     * Use for high-frequency events where validation is not needed.
     */
    emitSync<K extends keyof TypedEventMap>(type: K, event: TypedEventMap[K]): void;
    /**
     * Register type-safe event listener with telemetry.
     * Handler receives properly typed event data.
     */
    on<K extends keyof TypedEventMap>(type: K, handler: TypedEventHandler<TypedEventMap[K]>): void;
    /**
     * Register one-time event listener.
     * Handler is automatically removed after first event.
     */
    once<K extends keyof TypedEventMap>(type: K, handler: TypedEventHandler<TypedEventMap[K]>): void;
    /**
     * Remove event listener.
     */
    off<K extends keyof TypedEventMap>(type: K, handler?: TypedEventHandler<TypedEventMap[K]>): void;
    /**
     * Register wildcard listener (if enabled).
     * Receives all events with type information.
     */
    onAny(handler: WildcardHandler): void;
    /**
     * Remove wildcard listener.
     */
    offAny(handler: WildcardHandler): void;
    /**
     * Register custom validator for event type.
     */
    registerValidator<T>(eventType: string, schema: z.ZodSchema<T>): void;
    /**
     * Validate event against registered schema.
     */
    private validateEvent;
    /**
     * Initialize built-in validators from schemas.
     */
    private initializeValidators;
    /**
     * Get all registered event types.
     */
    getEventTypes(): string[];
    /**
     * Get listener count for event type.
     */
    getListenerCount(eventType: string): number;
    /**
     * Get total listener count across all events.
     */
    getTotalListenerCount(): number;
    /**
     * Clear all event listeners.
     */
    clear(): void;
    /**
     * Get configuration.
     */
    getConfig(): TypedEventBusConfig;
    /**
     * Update configuration.
     */
    updateConfig(updates: Partial<TypedEventBusConfig>): void;
    /**
     * Get event bus statistics.
     */
    getStats(): {
        totalListeners: number;
        eventTypes: string[];
        validatorCount: number;
        config: TypedEventBusConfig;
    };
}
/**
 * Create typed event bus with common configuration.
 */
export declare function createTypedEventBus(config?: Partial<TypedEventBusConfig>): TypedEventBus;
/**
 * Create event bus optimized for high performance.
 */
export declare function createHighPerformanceEventBus(): TypedEventBus;
/**
 * Create event bus with full validation and debugging.
 */
export declare function createValidatedEventBus(): TypedEventBus;
export default TypedEventBus;
//# sourceMappingURL=typed-event-bus.d.ts.map