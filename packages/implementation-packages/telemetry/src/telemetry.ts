/**
 * @fileoverview Core Telemetry Implementation
 * 
 * OpenTelemetry-based telemetry infrastructure extracted from @claude-zen/monitoring.
 * Provides metrics, tracing, and event logging primitives for monitoring packages.
 */

import { 
  trace, 
  context, 
  metrics,
  SpanStatusCode,
  SpanKind,
  type Span,
  type Tracer,
  type Meter,
  type Counter,
  type Histogram,
  type UpDownCounter,
  type Attributes
} from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { register as promRegister, Counter as PromCounter, Histogram as PromHistogram, Gauge as PromGauge } from 'prom-client';

import { getLogger } from '@claude-zen/foundation/logging';
import type { 
  TelemetryConfig, 
  MetricDefinition, 
  SpanOptions, 
  TelemetryEvent, 
  MetricType 
} from './types.js';

// =============================================================================
// TELEMETRY MANAGER - Core implementation
// =============================================================================

/**
 * Default telemetry configuration
 */
const DEFAULT_CONFIG: Required<TelemetryConfig> = {
  serviceName: 'claude-zen-telemetry',
  serviceVersion: '1.0.0',
  enableTracing: true,
  enableMetrics: true,
  jaegerEndpoint: 'http://localhost:14268/api/traces',
  prometheusPort: 9090,
  samplingRatio: 1.0,
  globalAttributes: {}
};

/**
 * Core telemetry manager for OpenTelemetry integration
 */
export class TelemetryManager {
  private config: Required<TelemetryConfig>;
  private sdk: NodeSDK | null = null;
  private tracer: Tracer | null = null;
  private meter: Meter | null = null;
  private initialized = false;
  private logger = getLogger('TelemetryManager');
  private internalCollectorEndpoint: string | null = null;
  private useInternalCollector = false;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check for internal OTEL collector first
      await this.checkInternalCollector();

      // Create resource with service information
      const resource = Resource.default().merge(
        new Resource({
          [ATTR_SERVICE_NAME]: this.config.serviceName,
          [ATTR_SERVICE_VERSION]: this.config.serviceVersion,
          ...this.config.globalAttributes
        })
      );

      // Initialize OpenTelemetry SDK - use internal collector if available, otherwise fallback
      let traceExporter;
      if (this.useInternalCollector && this.internalCollectorEndpoint) {
        // Don't set up external exporters when using internal collector
        traceExporter = undefined;
        this.logger.info('Using internal OTEL collector for telemetry export', {
          endpoint: this.internalCollectorEndpoint
        });
      } else {
        // Fallback to external Jaeger exporter
        traceExporter = this.config.enableTracing ? new JaegerExporter({
          endpoint: this.config.jaegerEndpoint
        }) : undefined;
        this.logger.info('Using external Jaeger exporter for telemetry');
      }

      this.sdk = new NodeSDK({
        resource,
        traceExporter,
        instrumentations: [getNodeAutoInstrumentations()]
      });

      await this.sdk.start();

      // Initialize tracer and meter
      this.tracer = trace.getTracer(this.config.serviceName, this.config.serviceVersion);
      this.meter = metrics.getMeter(this.config.serviceName, this.config.serviceVersion);

      this.initialized = true;
      this.logger.info('Telemetry manager initialized', { 
        serviceName: this.config.serviceName,
        tracing: this.config.enableTracing,
        metrics: this.config.enableMetrics,
        useInternalCollector: this.useInternalCollector
      });

    } catch (error) {
      this.logger.error('Failed to initialize telemetry', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.initialized || !this.sdk) return;

    try {
      await this.sdk.shutdown();
      this.initialized = false;
      this.logger.info('Telemetry manager shut down');
    } catch (error) {
      this.logger.error('Error shutting down telemetry', error);
    }
  }

  getTracer(): Tracer {
    if (!this.tracer) throw new Error('Telemetry not initialized');
    return this.tracer;
  }

  getMeter(): Meter {
    if (!this.meter) throw new Error('Telemetry not initialized');
    return this.meter;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if internal OTEL collector is available and configure
   */
  private async checkInternalCollector(): Promise<void> {
    try {
      // Check environment variables
      const useInternalOtelCollector = process.env['ZEN_USE_INTERNAL_OTEL_COLLECTOR'] !== 'false'; // Default true
      const zenOtelEnabled = process.env['ZEN_OTEL_ENABLED'];
      const internalCollectorEndpoint = process.env['ZEN_INTERNAL_COLLECTOR_ENDPOINT'] || 'http://localhost:4318';
      
      if (useInternalOtelCollector && (zenOtelEnabled !== 'false')) {
        // Try to import and verify internal collector is available
        const internalCollectorModule = await import('@claude-zen/otel-collector').catch(() => null);
        if (internalCollectorModule) {
          this.internalCollectorEndpoint = internalCollectorEndpoint;
          this.useInternalCollector = true;
          
          this.logger.info('Internal OTEL collector detected and configured', {
            endpoint: internalCollectorEndpoint
          });
        } else {
          this.logger.warn('Internal OTEL collector requested but not available, falling back to external');
        }
      } else {
        this.logger.info('Internal OTEL collector disabled, using external exporters');
      }
    } catch (error) {
      this.logger.warn('Error checking internal OTEL collector availability', error);
      this.useInternalCollector = false;
    }
  }

  /**
   * Send telemetry data to internal collector
   */
  private async sendToInternalCollector(data: any, type: 'traces' | 'metrics' | 'logs'): Promise<void> {
    if (!this.useInternalCollector || !this.internalCollectorEndpoint) {
      return;
    }

    try {
      const telemetryData = {
        timestamp: Date.now(),
        type,
        service: {
          name: this.config.serviceName,
          version: this.config.serviceVersion,
          instance: process.env.HOSTNAME || 'localhost'
        },
        data,
        attributes: {
          'service.name': this.config.serviceName,
          'service.version': this.config.serviceVersion,
          ...this.config.globalAttributes
        }
      };

      // Send to internal collector via HTTP POST
      await fetch(`${this.internalCollectorEndpoint}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telemetryData)
      }).catch((fetchError) => {
        // Silently ignore fetch errors to avoid telemetry loops
        this.logger.debug('Failed to send telemetry to internal collector', fetchError);
      });

    } catch (error) {
      // Silently ignore errors to avoid telemetry loops
      this.logger.debug('Internal collector send error', error);
    }
  }
}

// =============================================================================
// GLOBAL TELEMETRY INSTANCE
// =============================================================================

let globalTelemetry: TelemetryManager | null = null;

/**
 * Get or create global telemetry instance
 */
export function getTelemetry(): TelemetryManager {
  if (!globalTelemetry) {
    globalTelemetry = new TelemetryManager();
  }
  return globalTelemetry;
}

/**
 * Initialize global telemetry
 */
export async function initializeTelemetry(config?: Partial<TelemetryConfig>): Promise<void> {
  if (config) {
    globalTelemetry = new TelemetryManager(config);
  } else if (!globalTelemetry) {
    globalTelemetry = new TelemetryManager();
  }
  
  await globalTelemetry.initialize();
}

/**
 * Shutdown global telemetry
 */
export async function shutdownTelemetry(): Promise<void> {
  if (globalTelemetry) {
    await globalTelemetry.shutdown();
    globalTelemetry = null;
  }
}

// =============================================================================
// METRICS API
// =============================================================================

/**
 * Record a metric value
 */
export function recordMetric(
  name: string, 
  value: number, 
  attributes: Attributes = {}
): void {
  try {
    const telemetry = getTelemetry();
    if (!telemetry.isInitialized()) return;

    const meter = telemetry.getMeter();
    const counter = meter.createCounter(name, {
      description: `Metric: ${name}`
    });
    
    counter.add(value, attributes);

    // Also send to internal collector if available
    const telemetryManager = telemetry as any;
    if (telemetryManager.useInternalCollector) {
      telemetryManager.sendToInternalCollector({
        metrics: [{
          name,
          value,
          type: 'counter',
          attributes,
          timestamp: Date.now()
        }]
      }, 'metrics').catch(() => {/* ignore */});
    }
  } catch (error) {
    console.warn('Failed to record metric:', error);
  }
}

/**
 * Record histogram value
 */
export function recordHistogram(
  name: string, 
  value: number, 
  attributes: Attributes = {}
): void {
  try {
    const telemetry = getTelemetry();
    if (!telemetry.isInitialized()) return;

    const meter = telemetry.getMeter();
    const histogram = meter.createHistogram(name, {
      description: `Histogram: ${name}`
    });
    
    histogram.record(value, attributes);

    // Also send to internal collector if available
    const telemetryManager = telemetry as any;
    if (telemetryManager.useInternalCollector) {
      telemetryManager.sendToInternalCollector({
        metrics: [{
          name,
          value,
          type: 'histogram',
          attributes,
          timestamp: Date.now()
        }]
      }, 'metrics').catch(() => {/* ignore */});
    }
  } catch (error) {
    console.warn('Failed to record histogram:', error);
  }
}

/**
 * Record gauge value
 */
export function recordGauge(
  name: string, 
  value: number, 
  attributes: Attributes = {}
): void {
  try {
    const telemetry = getTelemetry();
    if (!telemetry.isInitialized()) return;

    const meter = telemetry.getMeter();
    const gauge = meter.createUpDownCounter(name, {
      description: `Gauge: ${name}`
    });
    
    gauge.add(value, attributes);

    // Also send to internal collector if available
    const telemetryManager = telemetry as any;
    if (telemetryManager.useInternalCollector) {
      telemetryManager.sendToInternalCollector({
        metrics: [{
          name,
          value,
          type: 'gauge',
          attributes,
          timestamp: Date.now()
        }]
      }, 'metrics').catch(() => {/* ignore */});
    }
  } catch (error) {
    console.warn('Failed to record gauge:', error);
  }
}

/**
 * Record telemetry event
 */
export function recordEvent(event: TelemetryEvent): void {
  try {
    const telemetry = getTelemetry();
    if (!telemetry.isInitialized()) return;

    // Add event as a metric
    recordMetric(`event.${event.name}`, 1, {
      ...event.attributes,
      severity: event.severity || 'info',
      timestamp: event.timestamp || Date.now()
    });
  } catch (error) {
    console.warn('Failed to record event:', error);
  }
}

// =============================================================================
// TRACING API
// =============================================================================

/**
 * Start a trace span
 */
export function startTrace(name: string, options: SpanOptions = {}): Span {
  try {
    const telemetry = getTelemetry();
    if (!telemetry.isInitialized()) {
      // Return no-op span if not initialized
      return trace.getActiveSpan() || trace.getTracer('noop').startSpan('noop');
    }

    const tracer = telemetry.getTracer();
    return tracer.startSpan(name, {
      kind: options.kind || SpanKind.INTERNAL,
      attributes: options.attributes
    });
  } catch (error) {
    console.warn('Failed to start trace:', error);
    return trace.getActiveSpan() || trace.getTracer('noop').startSpan('noop');
  }
}

/**
 * Execute function with trace
 */
export function withTrace<T>(name: string, fn: () => T, options: SpanOptions = {}): T {
  const span = startTrace(name, options);
  const startTime = Date.now();
  
  try {
    const result = fn();
    const endTime = Date.now();
    span.setStatus({ code: SpanStatusCode.OK });
    
    // Send trace data to internal collector if available
    const telemetry = getTelemetry();
    const telemetryManager = telemetry as any;
    if (telemetryManager.useInternalCollector) {
      telemetryManager.sendToInternalCollector({
        traces: [{
          name,
          startTime,
          endTime,
          duration: endTime - startTime,
          status: 'OK',
          kind: options.kind || 'INTERNAL',
          attributes: options.attributes || {},
          spanId: Math.random().toString(16).substring(2),
          traceId: Math.random().toString(16).substring(2)
        }]
      }, 'traces').catch(() => {/* ignore */});
    }
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error)
    });
    
    // Send error trace to internal collector if available
    const telemetry = getTelemetry();
    const telemetryManager = telemetry as any;
    if (telemetryManager.useInternalCollector) {
      telemetryManager.sendToInternalCollector({
        traces: [{
          name,
          startTime,
          endTime,
          duration: endTime - startTime,
          status: 'ERROR',
          error: error instanceof Error ? error.message : String(error),
          kind: options.kind || 'INTERNAL',
          attributes: options.attributes || {},
          spanId: Math.random().toString(16).substring(2),
          traceId: Math.random().toString(16).substring(2)
        }]
      }, 'traces').catch(() => {/* ignore */});
    }
    
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Execute async function with trace
 */
export async function withAsyncTrace<T>(
  name: string, 
  fn: () => Promise<T>, 
  options: SpanOptions = {}
): Promise<T> {
  const span = startTrace(name, options);
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const endTime = Date.now();
    span.setStatus({ code: SpanStatusCode.OK });
    
    // Send trace data to internal collector if available
    const telemetry = getTelemetry();
    const telemetryManager = telemetry as any;
    if (telemetryManager.useInternalCollector) {
      telemetryManager.sendToInternalCollector({
        traces: [{
          name,
          startTime,
          endTime,
          duration: endTime - startTime,
          status: 'OK',
          kind: options.kind || 'INTERNAL',
          attributes: options.attributes || {},
          spanId: Math.random().toString(16).substring(2),
          traceId: Math.random().toString(16).substring(2)
        }]
      }, 'traces').catch(() => {/* ignore */});
    }
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error)
    });
    
    // Send error trace to internal collector if available
    const telemetry = getTelemetry();
    const telemetryManager = telemetry as any;
    if (telemetryManager.useInternalCollector) {
      telemetryManager.sendToInternalCollector({
        traces: [{
          name,
          startTime,
          endTime,
          duration: endTime - startTime,
          status: 'ERROR',
          error: error instanceof Error ? error.message : String(error),
          kind: options.kind || 'INTERNAL',
          attributes: options.attributes || {},
          spanId: Math.random().toString(16).substring(2),
          traceId: Math.random().toString(16).substring(2)
        }]
      }, 'traces').catch(() => {/* ignore */});
    }
    
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Set attributes on current span
 */
export function setTraceAttributes(attributes: Attributes): void {
  try {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  } catch (error) {
    console.warn('Failed to set trace attributes:', error);
  }
}

// =============================================================================
// DECORATORS
// =============================================================================

/**
 * Method decorator for tracing
 */
export function traced(name?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value;
    if (!method) return descriptor;

    descriptor.value = function (this: any, ...args: any[]) {
      const spanName = name || `${target.constructor.name}.${propertyName}`;
      return withTrace(spanName, () => method.apply(this, args));
    } as T;

    return descriptor;
  };
}

/**
 * Async method decorator for tracing
 */
export function tracedAsync(name?: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value;
    if (!method) return descriptor;

    descriptor.value = function (this: any, ...args: any[]) {
      const spanName = name || `${target.constructor.name}.${propertyName}`;
      return withAsyncTrace(spanName, () => method.apply(this, args));
    } as T;

    return descriptor;
  };
}

/**
 * Method decorator for metrics
 */
export function metered(metricName?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value;
    if (!method) return descriptor;

    descriptor.value = function (this: any, ...args: any[]) {
      const name = metricName || `method.${target.constructor.name}.${propertyName}`;
      const start = Date.now();
      
      try {
        const result = method.apply(this, args);
        recordHistogram(`${name}.duration`, Date.now() - start);
        recordMetric(`${name}.calls`, 1, { status: 'success' });
        return result;
      } catch (error) {
        recordHistogram(`${name}.duration`, Date.now() - start);
        recordMetric(`${name}.calls`, 1, { status: 'error' });
        throw error;
      }
    } as T;

    return descriptor;
  };
}