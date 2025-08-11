/**
 * @file Event-bus implementation.
 */
/**
 * Event Bus - Core event system for claude-zen
 * Provides centralized event handling and communication.
 * Following Google TypeScript standards with strict typing.
 */
import { EventEmitter } from 'node:events';
import type { EventListener, SystemEvent } from '../interfaces/events/core/interfaces.ts';
export interface EventBusConfig {
    maxListeners: number;
    enableMiddleware: boolean;
    enableMetrics: boolean;
    enableLogging: boolean;
    logLevel: string;
}
export type EventListenerAny = (event: any) => void | Promise<void>;
export interface EventMap {
    [key: string]: SystemEvent;
}
export interface EventMetrics {
    eventCount: number;
    eventTypes: Record<string, number>;
    avgProcessingTime: number;
    errorCount: number;
    listenerCount: number;
}
export type EventMiddleware = (event: string | symbol, payload: any, next: () => void) => void;
export interface IEventBus {
    on<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>): this;
    off<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>): this;
    emit<T extends keyof EventMap>(event: T, payload: EventMap[T]): boolean;
    once<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>): this;
}
/**
 * Unified Event Bus implementation.
 * Extends Node.js EventEmitter with additional features.
 *
 * @example
 */
export declare class EventBus extends EventEmitter implements IEventBus {
    private static instance;
    private middleware;
    private metrics;
    private config;
    constructor(config?: Partial<EventBusConfig>);
    /**
     * Get singleton instance.
     *
     * @param config
     */
    static getInstance(config?: Partial<EventBusConfig>): EventBus;
    /**
     * Type-safe emit with error handling and middleware support.
     *
     * @param event
     * @param payload
     */
    emit<T extends keyof EventMap>(event: T, payload: EventMap[T]): boolean;
    /**
     * Type-safe event listener registration.
     *
     * @param event
     * @param listener
     */
    on<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>): this;
    /**
     * Type-safe once listener registration.
     *
     * @param event
     * @param listener
     */
    once<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>): this;
    /**
     * Type-safe event listener removal.
     *
     * @param event
     * @param listener
     */
    off<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>): this;
    /**
     * Add middleware for event processing.
     *
     * @param middleware
     */
    use(middleware: EventMiddleware): void;
    /**
     * Remove middleware.
     *
     * @param middleware
     */
    removeMiddleware(middleware: EventMiddleware): void;
    /**
     * Get event bus metrics.
     */
    getMetrics(): EventMetrics;
    /**
     * Reset metrics.
     */
    resetMetrics(): void;
    /**
     * Run middleware chain.
     *
     * @param event
     * @param payload
     */
    private runMiddleware;
    /**
     * Update processing time metrics.
     *
     * @param processingTime
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