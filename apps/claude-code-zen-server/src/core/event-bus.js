/**
 * @file Event-bus implementation.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('EventBus');
/**
 * Event Bus - Core event system for claude-zen
 * Provides centralized event handling and communication.
 * Following Google TypeScript standards with strict typing.
 */
import { EventEmitter } from 'node:events';
/**
 * Unified Event Bus implementation.
 * Extends Node.js EventEmitter with additional features.
 *
 * @example
 */
export class EventBus extends EventEmitter {
    static instance = null;
    middleware = [];
    metrics;
    config;
    constructor(config = {}) {
        super();
        this.config = {
            maxListeners: 100,
            enableMiddleware: true,
            enableMetrics: true,
            enableLogging: false,
            logLevel: 'info',
            ...config,
        };
        this.setMaxListeners(this.config.maxListeners);
        this.metrics = {
            eventCount: 0,
            eventTypes: {},
            avgProcessingTime: 0,
            errorCount: 0,
            listenerCount: 0,
        };
    }
    /**
     * Get singleton instance.
     *
     * @param config
     */
    static getInstance(config) {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus(config);
        }
        return EventBus.instance;
    }
    /**
     * Type-safe emit with error handling and middleware support.
     *
     * @param event
     * @param payload
     */
    emit(event, payload) {
        const startTime = Date.now();
        try {
            // Update metrics
            this.metrics.eventCount++;
            this.metrics.eventTypes[event] =
                (this.metrics.eventTypes[event] || 0) + 1;
            // Run middleware if enabled
            if (this.config.enableMiddleware && this.middleware.length > 0) {
                this.runMiddleware(event, payload);
            }
            // Log if enabled
            if (this.config.enableLogging) {
            }
            const result = super.emit(event, payload);
            // Update processing time metrics
            const processingTime = Date.now() - startTime;
            this.updateProcessingTimeMetrics(processingTime);
            return result;
        }
        catch (error) {
            this.metrics.errorCount++;
            logger.error(`EventBus error in event '${String(event)}':`, error);
            return false;
        }
    }
    /**
     * Type-safe event listener registration.
     *
     * @param event
     * @param listener
     */
    on(event, listener) {
        super.on(event, listener);
        this.metrics.listenerCount++;
        return this;
    }
    /**
     * Type-safe once listener registration.
     *
     * @param event
     * @param listener
     */
    once(event, listener) {
        super.once(event, listener);
        this.metrics.listenerCount++;
        return this;
    }
    /**
     * Type-safe event listener removal.
     *
     * @param event
     * @param listener
     */
    off(event, listener) {
        super.off(event, listener);
        this.metrics.listenerCount = Math.max(0, this.metrics.listenerCount - 1);
        return this;
    }
    /**
     * Add middleware for event processing.
     *
     * @param middleware
     */
    use(middleware) {
        this.middleware.push(middleware);
    }
    /**
     * Remove middleware.
     *
     * @param middleware
     */
    removeMiddleware(middleware) {
        const index = this.middleware.indexOf(middleware);
        if (index > -1) {
            this.middleware.splice(index, 1);
        }
    }
    /**
     * Get event bus metrics.
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset metrics.
     */
    resetMetrics() {
        this.metrics = {
            eventCount: 0,
            eventTypes: {},
            avgProcessingTime: 0,
            errorCount: 0,
            listenerCount: 0,
        };
    }
    /**
     * Run middleware chain.
     *
     * @param event
     * @param payload
     */
    runMiddleware(event, payload) {
        let index = 0;
        const next = () => {
            if (index < this.middleware.length) {
                const middleware = this.middleware[index++];
                middleware?.(event, payload, next);
            }
        };
        next();
    }
    /**
     * Update processing time metrics.
     *
     * @param processingTime
     */
    updateProcessingTimeMetrics(processingTime) {
        const totalTime = this.metrics.avgProcessingTime * (this.metrics.eventCount - 1) +
            processingTime;
        this.metrics.avgProcessingTime = totalTime / this.metrics.eventCount;
    }
    /**
     * Get event statistics.
     */
    getStats() {
        const eventNames = this.eventNames().map((name) => String(name));
        const listenerCount = eventNames.reduce((sum, name) => sum + this.listenerCount(name), 0);
        return {
            eventNames,
            listenerCount,
        };
    }
}
export default EventBus;
//# sourceMappingURL=event-bus.js.map