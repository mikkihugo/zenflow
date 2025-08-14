import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('EventBus');
import { EventEmitter } from 'node:events';
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
    static getInstance(config) {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus(config);
        }
        return EventBus.instance;
    }
    emit(event, payload) {
        const startTime = Date.now();
        try {
            this.metrics.eventCount++;
            this.metrics.eventTypes[event] =
                (this.metrics.eventTypes[event] || 0) + 1;
            if (this.config.enableMiddleware && this.middleware.length > 0) {
                this.runMiddleware(event, payload);
            }
            if (this.config.enableLogging) {
            }
            const result = super.emit(event, payload);
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
    on(event, listener) {
        super.on(event, listener);
        this.metrics.listenerCount++;
        return this;
    }
    once(event, listener) {
        super.once(event, listener);
        this.metrics.listenerCount++;
        return this;
    }
    off(event, listener) {
        super.off(event, listener);
        this.metrics.listenerCount = Math.max(0, this.metrics.listenerCount - 1);
        return this;
    }
    use(middleware) {
        this.middleware.push(middleware);
    }
    removeMiddleware(middleware) {
        const index = this.middleware.indexOf(middleware);
        if (index > -1) {
            this.middleware.splice(index, 1);
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    resetMetrics() {
        this.metrics = {
            eventCount: 0,
            eventTypes: {},
            avgProcessingTime: 0,
            errorCount: 0,
            listenerCount: 0,
        };
    }
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
    updateProcessingTimeMetrics(processingTime) {
        const totalTime = this.metrics.avgProcessingTime * (this.metrics.eventCount - 1) +
            processingTime;
        this.metrics.avgProcessingTime = totalTime / this.metrics.eventCount;
    }
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