/**
 * @fileoverview Simplified Telemetry Implementation
 *
 * Simple, working telemetry infrastructure for claude-code-zen monitoring packages.
 * Provides metrics, tracing, and event logging primitives.
 */

import { getLogger } from '@claude-zen/foundation';
import type { SpanOptions, TelemetryConfig } from './types.js';

// =============================================================================
// SIMPLE TELEMETRY MANAGER
// =============================================================================

const defaultConfig: Required<TelemetryConfig> = {
  serviceName: 'claude-zen-service',
  serviceVersion: '1.0.0',
  enableTracing: true,
  enableMetrics: true,
  jaegerEndpoint: 'http://localhost:14268/api/traces',
  prometheusPort: 9090,
  samplingRatio: 1.0,
  globalAttributes: {},
};

/**
 * Simple telemetry manager for claude-code-zen
 */
export class TelemetryManager {
  private config: Required<TelemetryConfig>;
  private logger = getLogger('TelemetryManager');
  private initialized = false;
  private metrics = new Map<string, unknown>();
  private traces = new Map<string, unknown>();

  constructor(config: TelemetryConfig = { serviceName: 'claude-zen-service' }) {
    this.config = { ...defaultConfig, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Promise.resolve();

    this.logger.info('Initializing telemetry manager', {
      serviceName: this.config.serviceName,
      enableTracing: this.config.enableTracing,
      enableMetrics: this.config.enableMetrics,
    });

    this.initialized = true;
  }

  shutdown(): Promise<void> {
    this.metrics.clear();
    this.traces.clear();
    this.initialized = false;
    this.logger.info('Telemetry manager shut down');
    return Promise.resolve();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getServiceName(): string {
    return this.config.serviceName;
  }

  recordMetric(
    name: string,
    value: number = 1,
    attributes?: Record<string, unknown>
  ): void {
    if (!this.config.enableMetrics) return;

    const metric = {
      name,
      value,
      attributes,
      timestamp: Date.now(),
    };

    this.metrics.set(`${name  }-${  Date.now()}`, metric);
    this.logger.debug('Recorded metric', metric);
  }

  recordHistogram(
    name: string,
    value: number,
    attributes?: Record<string, unknown>
  ): void {
    this.recordMetric(`${name  }.histogram`, value, attributes);
  }

  recordGauge(
    name: string,
    value: number,
    attributes?: Record<string, unknown>
  ): void {
    this.recordMetric(`${name  }.gauge`, value, attributes);
  }

  recordEvent(name: string, data?: unknown): void {
    const event = {
      name,
      timestamp: Date.now(),
      attributes: data ? { data } : {},
    };

    this.logger.info('Telemetry event', event);
  }

  startTrace(name: string, options?: SpanOptions): { setAttributes: (attrs: Record<string, unknown>) => void; end: () => void } {
    if (!this.config.enableTracing) {
      return { setAttributes: () => {}, end: () => {} };
    }

    const traceId = `${name  }-${  Date.now()  }-${  Math.random().toString(36).substr(2, 9)}`;
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
      setAttributes: (attributes: Record<string, unknown>) => {
        trace.attributes = { ...trace.attributes, ...attributes } as Record<string, unknown>;
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

  withTrace<T>(fn: () => T): T;
  withTrace<T>(name: string, fn: () => T): T;
  withTrace<T>(nameOrFn: string | (() => T), fn?: () => T): T {
    // Handle both signatures:withTrace(fn) and withTrace(name, fn)
    if (typeof nameOrFn === 'function') {
      const span = this.startTrace('anonymous');
      try {
        const result = nameOrFn();
        span.end();
        return result;
      } catch (error) {
        span.setAttributes({ error: true, errorMessage: String(error) });
        span.end();
        throw error;
      }
    } else {
      if (typeof fn !== 'function') {
        throw new Error('withTrace(name, fn) requires a function callback');
      }
      const span = this.startTrace(nameOrFn);
      try {
        const result = fn();
        span.end();
        return result;
      } catch (error) {
        span.setAttributes({ error: true, errorMessage: String(error) });
        span.end();
        throw error;
      }
    }
  }

  async withAsyncTrace<T>(fn: () => Promise<T>): Promise<T>;
  async withAsyncTrace<T>(name: string, fn: () => Promise<T>): Promise<T>;
  async withAsyncTrace<T>(
    nameOrFn: string | (() => Promise<T>),
    fn?: () => Promise<T>
  ): Promise<T> {
    // Handle both signatures:withAsyncTrace(fn) and withAsyncTrace(name, fn)
    if (typeof nameOrFn === 'function') {
      const span = this.startTrace('async-anonymous');
      try {
        const result = await nameOrFn();
        span.end();
        return result;
      } catch (error) {
        span.setAttributes({ error: true, errorMessage: String(error) });
        span.end();
        throw error;
      }
    } else {
      if (typeof fn !== 'function') {
        throw new Error('withAsyncTrace(name, fn) requires a function callback');
      }
      const span = this.startTrace(nameOrFn);
      try {
        const result = await fn();
        span.end();
        return result;
      } catch (error) {
        span.setAttributes({ error: true, errorMessage: String(error) });
        span.end();
        throw error;
      }
    }
  }

  getMetrics(): Record<string, unknown> {
    return Object.fromEntries(this.metrics);
  }

  getTraces(): Record<string, unknown> {
    return Object.fromEntries(this.traces);
  }
}

// =============================================================================
// GLOBAL TELEMETRY INSTANCE
// =============================================================================

let globalTelemetry: TelemetryManager | null = null;

export async function initializeTelemetry(
  config?: TelemetryConfig
): Promise<TelemetryManager> {
  if (!globalTelemetry) {
    globalTelemetry = new TelemetryManager(config);
    await globalTelemetry.initialize();
  }
  return globalTelemetry;
}

export function getTelemetry(): TelemetryManager {
  if (!globalTelemetry) {
    globalTelemetry = new TelemetryManager();
  }
  return globalTelemetry;
}

export async function shutdownTelemetry(): Promise<void> {
  if (globalTelemetry) {
    await globalTelemetry.shutdown();
    globalTelemetry = null;
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function recordMetric(
  name: string,
  value: number = 1,
  attributes?: Record<string, unknown>
): void {
  getTelemetry().recordMetric(name, value, attributes);
}

export function recordHistogram(
  name: string,
  value: number,
  attributes?: Record<string, unknown>
): void {
  getTelemetry().recordHistogram(name, value, attributes);
}

export function recordGauge(
  name: string,
  value: number,
  attributes?: Record<string, unknown>
): void {
  getTelemetry().recordGauge(name, value, attributes);
}

export function recordEvent(name: string, data?: unknown): void {
  getTelemetry().recordEvent(name, data as unknown);
}

export function startTrace(name: string, options?: SpanOptions): { setAttributes: (attrs: Record<string, unknown>) => void; end: () => void } {
  return getTelemetry().startTrace(name, options) as { setAttributes: (attrs: Record<string, unknown>) => void; end: () => void };
}

export function withTrace<T>(nameOrFn: string | (() => T), fn?: () => T): T {
  // Forward to global telemetry instance
  return typeof nameOrFn === 'function'
    ? getTelemetry().withTrace(nameOrFn as () => T)
    : ((): T => {
        if (typeof fn !== 'function') {
          throw new Error('withTrace(name, fn) requires a function callback');
        }
        return getTelemetry().withTrace(nameOrFn as string, fn);
      })();
}

export async function withAsyncTrace<T>(nameOrFn: string | (() => Promise<T>), fn?: () => Promise<T>): Promise<T> {
  // Forward to global telemetry instance
  if (typeof nameOrFn === 'function') {
    return await getTelemetry().withAsyncTrace(nameOrFn as () => Promise<T>);
  }
  if (typeof fn !== 'function') {
    throw new Error('withAsyncTrace(name, fn) requires a function callback');
  }
  return await getTelemetry().withAsyncTrace(nameOrFn as string, fn);
}

// =============================================================================
// DECORATORS (Simplified)
// =============================================================================

export function traced(name?: string) {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      const className = target?.constructor?.name ?? 'UnknownClass';
      const traceName = name || `${className  }.${  propertyKey}`;
      return withTrace(traceName, () => originalMethod.apply(this, args));
    };
  };
}

export function tracedAsync(name?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
  const className = ((target as unknown) as Record<string, unknown>)?.constructor?.name ?? 'UnknownClass';
      const traceName = name || `${className  }.${  propertyKey}`;
      return await withAsyncTrace(traceName, () =>
        originalMethod.apply(this, args)
      );
    };
  };
}

export function metered(name?: string) {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (this: unknown, ...args: unknown[]) {
  const className = ((target as unknown) as Record<string, unknown>)?.constructor?.name ?? 'UnknownClass';
      const metricName = name || `${className  }.${propertyKey}.calls`
      recordMetric(metricName, 1);
      return originalMethod.apply(this, args);
    };
  };
}

// =============================================================================
// TYPE ALIASES
// =============================================================================

export function setTraceAttributes(attributes: Record<string, unknown>): void {
  // Simple implementation - log attributes
  getLogger('TelemetryManager').debug(' Trace attributes set', attributes);
}

export type Span = ReturnType<typeof startTrace>;
export type Tracer = TelemetryManager;
export type Meter = TelemetryManager;
export type Attributes = Record<string, unknown>;
