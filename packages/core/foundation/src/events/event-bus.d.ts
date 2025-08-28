/**
 * @fileoverview Event Bus - Modern TypeScript Event System
 *
 * Clean, modern event bus with TypeScript generics:
 * - Full type safety through generic event maps
 * - Professional middleware support with koa-compose pattern
 * - Comprehensive metrics and telemetry
 * - High-performance EventEmitter from foundation
 * - Async/await support with Result patterns
 */
import { EventEmitter } from './event-emitter.js';
type Result<T, E> = {
    isOk(): boolean;
    isErr(): boolean;
    value?: T;
    error?: E;
};
export interface EventBusConfig {
    maxListeners?: number;
    enableMiddleware?: boolean;
    enableMetrics?: boolean;
    enableLogging?: boolean;
    logLevel?: string;
}
export type EventListener<T = unknown> = (event: T) => void | Promise<void>;
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
export interface Event<T = unknown> {
    type: string;
    payload: T;
    timestamp: Date;
    id: string;
}
/**
 * Modern Event Bus with full TypeScript generics, middleware, metrics, and professional features.
 * Single implementation replacing all previous event system variants.
 *
 * @example
 * ```typescript`
 * // Define your event map
 * interface MyEvents {
 *   userAction:{ action: string; target: string};
 *   systemEvent:{ type: string; data: unknown};
 *}
 *
 * // Create fully typed event bus
 * const eventBus = new EventBus<MyEvents>();
 *
 * // Fully typed listeners
 * eventBus.on('userAction', (payload) => {
 *   // payload is typed as { action:string; target: string}
 *   logger.info(payload.action, payload.target);
 *});
 *
 * // Fully typed emission
 * eventBus.emit('userAction', { action: ' click', target: ' button'});
 * ```
 */
export declare class EventBus<TEventMap extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {
    private static instance;
    private middleware;
    private busMetrics;
    private busConfig;
    constructor(config?: EventBusConfig);
    /**
     * Get singleton instance.
     */
    static getInstance<T extends Record<string, unknown> = Record<string, unknown>>(config?: EventBusConfig): EventBus<T>;
    /**
     * Initialize event bus with proper async operations.
     */
    initialize(): Promise<Result<void, Error>>;
    /**
     * Emit event with full generic type checking.
     */
    emit<K extends keyof TEventMap>(eventType: K, payload: TEventMap[K]): boolean;
    emit(event: string | symbol, payload?: unknown): boolean;
    /**
     * Async emit with middleware and error handling.
     */
    emitSafe<K extends keyof TEventMap>(eventType: K, payload: TEventMap[K]): Promise<Result<boolean, Error>>;
    emitSafe(event: string, payload: unknown): Promise<Result<boolean, Error>>;
    /**
     * Add event listener with full generic type checking.
     */
    on(event: string | symbol, listener: (...args: unknown[]) => void): this;
    /**
     * Add one-time event listener with full generic type checking.
     */
    once(event: string | symbol, listener: (...args: unknown[]) => void): this;
    /**
     * Remove event listener with full generic type checking.
     */
    off(event: string | symbol, listener: (...args: unknown[]) => void): this;
    /**
     * Add middleware for event processing.
     */
    use(middleware: EventMiddleware): void;
    /**
     * Remove middleware.
     */
    removeMiddleware(middleware: EventMiddleware): void;
    /**
     * Get event bus metrics.
     */
    getMetrics(): EventMetrics;
    /**
     * Get configuration.
     */
    getConfig(): Required<EventBusConfig>;
    /**
     * Reset metrics.
     */
    resetMetrics(): void;
    /**
     * Get event statistics.
     */
    getStats(): {
        eventNames: string[];
        listenerCount: number;
    };
    /**
     * Run middleware chain using koa-compose pattern.
     */
    private runMiddleware;
    /**
     * Update processing time metrics.
     */
    private updateProcessingTimeMetrics;
}
export default EventBus;
//# sourceMappingURL=event-bus.d.ts.map