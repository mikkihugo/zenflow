/**
 * @fileoverview Simplified Telemetry Implementation
 *
 * Simple, working telemetry infrastructure for claude-code-zen monitoring packages.
 * Provides metrics, tracing, and event logging primitives.
 */
import { getLogger } from '@claude-zen/foundation';
// =============================================================================
// SIMPLE TELEMETRY MANAGER
// =============================================================================
const defaultConfig = {
    serviceName: 'claude-zen-service', serviceVersion: '1.0.0', enableTracing: true,
    enableMetrics: true,
    jaegerEndpoint: 'http://localhost:14268/api/traces', prometheusPort: 9090,
    samplingRatio: 1.0,
    globalAttributes: {},
};
/**
 * Simple telemetry manager for claude-code-zen
 */
export class TelemetryManager {
    config;
    logger = getLogger('TelemetryManager');
    initialized = false;
    metrics = new Map();
    traces = new Map();
    constructor(config = { serviceName: 'claude-zen-service' }) {
        this.config = { ...defaultConfig, ...config };
    }
    async initialize() {
        if (this.initialized)
            return;
        await Promise.resolve();
        this.logger.info('Initializing telemetry manager', {
            serviceName: this.config.serviceName,
            enableTracing: this.config.enableTracing,
            enableMetrics: this.config.enableMetrics,
        });
        this.initialized = true;
    }
    async shutdown() {
        this.metrics.clear();
        this.traces.clear();
        this.initialized = false;
        this.logger.info('Telemetry manager shut down');
    }
    isInitialized() {
        return this.initialized;
    }
    getServiceName() {
        return this.config.serviceName;
    }
    recordMetric(name, value = 1, attributes) {
        if (!this.config.enableMetrics)
            return;
        const metric = {
            name,
            value,
            attributes,
            timestamp: Date.now(),
        };
        this.metrics.set(`${name}-${Date.now()}`, metric);
        this.logger.debug('Recorded metric', metric);
    }
    recordHistogram(name, value, attributes) {
        this.recordMetric(`${name}.histogram`, value, attributes);
    }
    recordGauge(name, value, attributes) {
        this.recordMetric(`${name}.gauge`, value, attributes);
    }
    recordEvent(name, data) {
        const event = {
            name,
            timestamp: Date.now(),
            attributes: data ? { data } : {},
        };
        this.logger.info('Telemetry event', event);
    }
    startTrace(name, options) {
        if (!this.config.enableTracing) {
            return { setAttributes: () => { }, end: () => { } };
        }
        const traceId = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const trace = {
            name,
            traceId,
            startTime: Date.now(),
            endTime: 0,
            duration: 0,
            attributes: options?.attributes || {},
            status: 'active',
        };
        this.traces.set(traceId, trace);
        this.logger.debug('Started trace', { name, traceId });
        return {
            setAttributes: (attributes) => {
                trace.attributes = { ...trace.attributes, ...attributes };
            },
            end: () => {
                trace.status = 'completed';
                trace.endTime = Date.now();
                trace.duration = trace.endTime - trace.startTime;
                this.logger.debug('Ended trace', {
                    name: trace.name,
                    traceId: trace.traceId,
                    duration: trace.duration,
                });
            },
        };
    }
    withTrace(nameOrFn, fn) {
        // Handle both signatures:withTrace(fn) and withTrace(name, fn)
        if (typeof nameOrFn === 'function') {
            const span = this.startTrace('anonymous');
            try {
                const result = nameOrFn();
                span.end();
                return result;
            }
            catch (error) {
                span.setAttributes({ error: true, errorMessage: String(error) });
                span.end();
                throw error;
            }
        }
        else {
            const span = this.startTrace(nameOrFn);
            try {
                const result = fn();
                span.end();
                return result;
            }
            catch (error) {
                span.setAttributes({ error: true, errorMessage: String(error) });
                span.end();
                throw error;
            }
        }
    }
    async withAsyncTrace(nameOrFn, fn) {
        // Handle both signatures:withAsyncTrace(fn) and withAsyncTrace(name, fn)
        if (typeof nameOrFn === 'function') {
            const span = this.startTrace('async-anonymous');
            try {
                const result = await nameOrFn();
                span.end();
                return result;
            }
            catch (error) {
                span.setAttributes({ error: true, errorMessage: String(error) });
                span.end();
                throw error;
            }
        }
        else {
            const span = this.startTrace(nameOrFn);
            try {
                const result = await fn();
                span.end();
                return result;
            }
            catch (error) {
                span.setAttributes({ error: true, errorMessage: String(error) });
                span.end();
                throw error;
            }
        }
    }
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
    getTraces() {
        return Object.fromEntries(this.traces);
    }
}
// =============================================================================
// GLOBAL TELEMETRY INSTANCE
// =============================================================================
let globalTelemetry = null;
export async function initializeTelemetry(config) {
    if (!globalTelemetry) {
        globalTelemetry = new TelemetryManager(config);
        await globalTelemetry.initialize();
    }
    return globalTelemetry;
}
export function getTelemetry() {
    if (!globalTelemetry) {
        globalTelemetry = new TelemetryManager();
    }
    return globalTelemetry;
}
export async function shutdownTelemetry() {
    if (globalTelemetry) {
        await globalTelemetry.shutdown();
        globalTelemetry = null;
    }
}
// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================
export function recordMetric(name, value = 1, attributes) {
    getTelemetry().recordMetric(name, value, attributes);
}
export function recordHistogram(name, value, attributes) {
    getTelemetry().recordHistogram(name, value, attributes);
}
export function recordGauge(name, value, attributes) {
    getTelemetry().recordGauge(name, value, attributes);
}
export function recordEvent(name, data) {
    getTelemetry().recordEvent(name, data);
}
export function startTrace(name, options) {
    return getTelemetry().startTrace(name, options);
}
export function withTrace(nameOrFn, fn) {
    return typeof nameOrFn === 'function' ? getTelemetry().withTrace(nameOrFn) : getTelemetry().withTrace(nameOrFn, fn);
}
export async function withAsyncTrace(nameOrFn, fn) {
    if (typeof nameOrFn === 'function') {
        return await getTelemetry().withAsyncTrace(nameOrFn);
    }
    return await getTelemetry().withAsyncTrace(nameOrFn, fn);
}
// =============================================================================
// DECORATORS (Simplified)
// =============================================================================
export function traced(name) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const className = target?.constructor?.name ?? 'UnknownClass';
            const traceName = name || `${className}.${propertyKey}`;
            return withTrace(traceName, () => originalMethod.apply(this, args));
        };
    };
}
export function tracedAsync(name) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const className = target?.constructor?.name ?? 'UnknownClass';
            const traceName = name || `${className}.${propertyKey}`;
            return await withAsyncTrace(traceName, () => originalMethod.apply(this, args));
        };
    };
}
export function metered(name) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const className = target?.constructor?.name ?? 'UnknownClass';
            const metricName = name || `${className}.${propertyKey}.calls`;
            recordMetric(metricName, 1);
            return originalMethod.apply(this, args);
        };
    };
}
// =============================================================================
// TYPE ALIASES
// =============================================================================
export function setTraceAttributes(attributes) {
    // Simple implementation - log attributes
    getLogger('TelemetryManager').debug(' Trace attributes set', attributes);
}
