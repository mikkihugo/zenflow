"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = void 0;
/**
 * Event bus implementation for Claude-Flow
 */
const types_js_1 = require("../utils/types.js");
const helpers_js_1 = require("../utils/helpers.js");
/**
 * Internal typed event bus
 */
class TypedEventBus extends helpers_js_1.TypedEventEmitter {
    constructor(debug = false) {
        super();
        this.eventCounts = new Map();
        this.lastEventTimes = new Map();
        this.debug = debug;
    }
    /**
     * Emits an event with logging
     */
    emit(event, data) {
        if (this.debug) {
            console.debug(`[EventBus] Emitting event: ${String(event)}`, data);
        }
        // Track event metrics
        const count = this.eventCounts.get(event) || 0;
        this.eventCounts.set(event, count + 1);
        this.lastEventTimes.set(event, Date.now());
        super.emit(event, data);
    }
    /**
     * Get event statistics
     */
    getEventStats() {
        const stats = [];
        for (const [event, count] of this.eventCounts.entries()) {
            const lastTime = this.lastEventTimes.get(event);
            stats.push({
                event: String(event),
                count,
                lastEmitted: lastTime ? new Date(lastTime) : null,
            });
        }
        return stats.sort((a, b) => b.count - a.count);
    }
    /**
     * Reset event statistics
     */
    resetStats() {
        this.eventCounts.clear();
        this.lastEventTimes.clear();
    }
}
/**
 * Global event bus for system-wide communication
 */
class EventBus {
    constructor(debug = false) {
        this.typedBus = new TypedEventBus(debug);
    }
    /**
     * Gets the singleton instance of the event bus
     */
    static getInstance(debug = false) {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus(debug);
        }
        return EventBus.instance;
    }
    /**
     * Emits an event
     */
    emit(event, data) {
        // Type-safe emission for known events
        if (event in types_js_1.SystemEvents) {
            this.typedBus.emit(event, data);
        }
        else {
            // For custom events, emit as-is
            this.typedBus.emit(event, data);
        }
    }
    /**
     * Registers an event handler
     */
    on(event, handler) {
        this.typedBus.on(event, handler);
    }
    /**
     * Removes an event handler
     */
    off(event, handler) {
        this.typedBus.off(event, handler);
    }
    /**
     * Registers a one-time event handler
     */
    once(event, handler) {
        this.typedBus.once(event, handler);
    }
    /**
     * Waits for an event to occur
     */
    async waitFor(event, timeoutMs) {
        return new Promise((resolve, reject) => {
            const handler = (data) => {
                if (timer)
                    clearTimeout(timer);
                resolve(data);
            };
            let timer;
            if (timeoutMs) {
                timer = setTimeout(() => {
                    this.off(event, handler);
                    reject(new Error(`Timeout waiting for event: ${event}`));
                }, timeoutMs);
            }
            this.once(event, handler);
        });
    }
    /**
     * Creates a filtered event listener
     */
    onFiltered(event, filter, handler) {
        this.on(event, (data) => {
            if (filter(data)) {
                handler(data);
            }
        });
    }
    /**
     * Get event statistics
     */
    getEventStats() {
        return this.typedBus.getEventStats();
    }
    /**
     * Reset event statistics
     */
    resetStats() {
        this.typedBus.resetStats();
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        this.typedBus.removeAllListeners(event);
    }
}
exports.EventBus = EventBus;
// Export singleton instance
exports.eventBus = EventBus.getInstance();
