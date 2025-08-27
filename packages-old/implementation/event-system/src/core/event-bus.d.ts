/**
 * @file Event Bus - Professional Battle-Tested Architecture
 *
 * High-performance event bus with battle-tested dependencies and foundation integration.
 *
 * **BATTLE-TESTED DEPENDENCIES INTEGRATED:**
 * - eventemitter3: High-performance event emitter (2x faster than Node.js EventEmitter)
 * - koa-compose: Battle-tested middleware composition used by Koa.js framework
 * - foundation error handling: Result patterns with neverthrow
 * - foundation DI: Injectable and singleton decorators
 * - foundation logging: Professional logging system
 *
 * Key Features:
 * - Type-safe event handling with strict typing
 * - Modern async middleware with koa-compose (battle-tested)
 * - Foundation dependency injection support
 * - Professional error handling with Result patterns
 * - High-performance eventemitter3 (2x faster than Node.js EventEmitter)
 * - Professional logging and metrics
 *
 * @example Basic event bus usage
 * ```typescript
 * import { EventBus } from '@claude-zen/event-system';
 *
 * const eventBus = new EventBus({
 *   maxListeners: 100,
 *   enableMetrics: true
 * });
 *
 * // Type-safe event handling
 * eventBus.on('userAction', (payload) => {
 *   console.log('User action:', payload);
 * });
 *
 * eventBus.emit('userAction', { action: 'click', target: 'button' });
 * ```
 */
import { EventEmitter, type Result } from '@claude-zen/foundation';
export interface EventBusConfig {
    maxListeners: number;
    enableMiddleware: boolean;
    enableMetrics: boolean;
    enableLogging: boolean;
    enableTelemetry: boolean;
    logLevel: string;
}
export type EventListenerFunction = (event: unknown) => void | Promise<void>;
export interface EventMap {
    [key: string]: any;
}
export interface EventMetrics {
    eventCount: number;
    eventTypes: Record<string, number>;
    avgProcessingTime: number;
    errorCount: number;
    listenerCount: number;
}
export interface EventContext {
    event: string | symbol;
    payload: unknown;
    timestamp: number;
    processedBy: string[];
}
export type EventMiddleware = (context: EventContext, next: () => Promise<void>) => Promise<void>;
/**
 * Professional Event Bus with battle-tested dependencies and foundation integration.
 * Uses eventemitter3 for 2x performance improvement over Node.js EventEmitter.
 *
 * @example
 * ```typescript
 * const eventBus = new EventBus({
 *   maxListeners: 100,
 *   enableMetrics: true
 * });
 * ```
 */
export declare class EventBus extends EventEmitter {
    private static instance;
    private middleware;
    private busMetrics;
    private busConfig;
    constructor(config?: Partial<EventBusConfig>);
    /**
     * Get singleton instance with foundation DI support.
     * Prefers dependency injection over static singleton.
     *
     * @param config - Optional configuration
     */
    static getInstance(config?: Partial<EventBusConfig>): EventBus;
    /**
     * Initialize event bus with foundation integration.
     * Should be called after construction.
     */
    initialize(): Promise<Result<void, Error>>;
    /**
     * Type-safe emit with foundation error handling and middleware.
     * Uses Result patterns for robust error handling.
     *
     * @param event - Event name
     * @param payload - Event payload
     * @returns Result<boolean, Error> - Success or error result
     */
    emitSafe(event: string, payload: any): Promise<Result<boolean, Error>>;
    /**
     * Legacy emit method for compatibility.
     * For async middleware support, use emitSafe() instead.
     *
     * @param event - Event name
     * @param payload - Event payload
     */
    emit(event: string | symbol, payload?: any): boolean;
    /**
     * Type-safe event listener registration with telemetry.
     */
    on(event: string | symbol, listener: EventListenerFunction): this;
    /**
     * Type-safe once listener registration.
     */
    once(event: string | symbol, listener: EventListenerFunction): this;
    /**
     * Type-safe event listener removal with telemetry.
     */
    off(event: string | symbol, listener: EventListenerFunction): this;
    /**
     * Add middleware for event processing with telemetry.
     */
    use(middleware: EventMiddleware): void;
    /**
     * Remove middleware.
     */
    removeMiddleware(middleware: EventMiddleware): void;
    /**
     * Get event bus metrics.
     */
    getBusMetrics(): EventMetrics;
    /**
     * Reset metrics.
     */
    resetMetrics(): void;
    /**
     * Run middleware chain using battle-tested koa-compose.
     * Provides async middleware support and proper error handling.
     */
    private runMiddleware;
    /**
     * Update processing time metrics.
     */
    private updateProcessingTimeMetrics;
    /**
     * Get event statistics.
     */
    getStats(): {
        eventNames: string[];
        listenerCount: number;
    };
}
export default EventBus;
//# sourceMappingURL=event-bus.d.ts.map