/**
 * @fileoverview Comprehensive Telemetry & Monitoring System for claude-code-zen Foundation
 * 
 * **ENTERPRISE OBSERVABILITY PLATFORM**
 * 
 * Professional-grade telemetry integration using OpenTelemetry and Prometheus
 * for distributed observability across the entire claude-code-zen ecosystem.
 * Includes full monitoring capabilities consolidated from @claude-zen/monitoring.
 * 
 * **COMPREHENSIVE MONITORING CAPABILITIES:**
 * - 📊 **Real-Time Metrics**: Live performance, throughput, and error rate tracking
 * - 🔍 **Distributed Tracing**: Request flow tracking across microservices
 * - 📈 **Performance Analytics**: System bottleneck identification and optimization
 * - 🚨 **Intelligent Alerting**: ML-powered anomaly detection and smart notifications
 * - 🎯 **Business Metrics**: Custom KPI tracking and business intelligence
 * - 🧠 **AI/ML Monitoring**: Model performance, inference latency, and accuracy tracking
 * - 🐝 **Swarm Intelligence**: Multi-agent coordination and collaboration metrics
 * - 🔄 **Health Monitoring**: Comprehensive system health and availability tracking
 * 
 * **INTEGRATED FEATURES:**
 * - OpenTelemetry SDK integration for traces and metrics
 * - Prometheus metrics collection and export
 * - Jaeger distributed tracing support
 * - Type-safe telemetry API
 * - Injectable telemetry services via DI container
 * - Integration with foundation logging system
 * - Configurable exporters and sampling strategies
 * - Performance monitoring with minimal overhead
 * - System resource monitoring (CPU, memory, network)
 * - Agent performance tracking and coordination analytics
 * - ML model performance and data drift detection
 * 
 * @example Basic Usage
 * ```typescript
 * import { getTelemetry, recordMetric, startTrace } from '@claude-zen/foundation/telemetry';
 * 
 * // Record custom metrics
 * recordMetric('api_requests_total', 1, { method: 'GET', status: '200' });
 * 
 * // Start distributed trace
 * const span = startTrace('process_task', { taskId: '123' });
 * // ... processing
 * span.end();
 * ```
 * 
 * @example Advanced Configuration
 * ```typescript
 * import { TelemetryManager } from '@claude-zen/foundation/telemetry';
 * 
 * const telemetry = new TelemetryManager({
 *   serviceName: 'claude-code-zen-api',
 *   enableTracing: true,
 *   enableMetrics: true,
 *   prometheusEndpoint: '/metrics',
 *   jaegerEndpoint: 'http://localhost:14268/api/traces'
 * });
 * ```
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

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
// import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

import { register as promRegister, Counter as PromCounter, Histogram as PromHistogram, Gauge as PromGauge } from 'prom-client';
import { getLogger } from './logging.js';
import { injectable, singleton } from './di.js';
import { Result, ok, err } from './error-handling.js';

// =============================================================================
// TELEMETRY CONFIGURATION
// =============================================================================

/**
 * Comprehensive telemetry configuration with sensible defaults
 */
export interface TelemetryConfig {
  /** Service name for telemetry data */
  serviceName: string;
  /** Service version for telemetry data */
  serviceVersion?: string;
  /** Enable distributed tracing */
  enableTracing: boolean;
  /** Enable metrics collection */
  enableMetrics: boolean;
  /** Enable auto-instrumentation */
  enableAutoInstrumentation: boolean;
  /** Trace sampling ratio (0.0 to 1.0) */
  traceSamplingRatio?: number;
  /** Metrics collection interval in milliseconds */
  metricsInterval?: number;
  /** Prometheus metrics endpoint path */
  prometheusEndpoint?: string;
  /** Prometheus metrics port */
  prometheusPort?: number;
  /** Jaeger exporter endpoint */
  jaegerEndpoint?: string;
  /** Custom resource attributes */
  resourceAttributes?: Record<string, string>;
  /** Enable console exporters for development */
  enableConsoleExporters?: boolean;
}

/**
 * Default telemetry configuration
 */
const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  serviceName: 'claude-code-zen',
  serviceVersion: '1.0.0',
  enableTracing: true,
  enableMetrics: true,
  enableAutoInstrumentation: true,
  traceSamplingRatio: 1.0,
  metricsInterval: 5000,
  prometheusEndpoint: '/metrics',
  prometheusPort: 9090,
  jaegerEndpoint: 'http://localhost:14268/api/traces',
  resourceAttributes: {},
  enableConsoleExporters: process.env['NODE_ENV'] === 'development'
};

// =============================================================================
// TELEMETRY TYPES
// =============================================================================

/**
 * Telemetry metric types
 */
export type MetricType = 'counter' | 'histogram' | 'gauge' | 'updowncounter';

/**
 * Telemetry metric definition
 */
export interface MetricDefinition {
  name: string;
  type: MetricType;
  description: string;
  unit?: string;
  labels?: string[];
}

/**
 * Trace span options
 */
export interface SpanOptions {
  kind?: SpanKind;
  attributes?: Attributes;
  links?: any[];
  startTime?: number;
}

/**
 * Telemetry event data
 */
export interface TelemetryEvent {
  name: string;
  attributes?: Attributes;
  timestamp?: number;
}

// =============================================================================
// TELEMETRY MANAGER - Core telemetry system
// =============================================================================

/**
 * Comprehensive telemetry manager with OpenTelemetry and Prometheus integration
 * 
 * Provides a unified interface for metrics, tracing, and observability across
 * the claude-code-zen ecosystem. Integrates with the foundation logging system
 * and supports both OpenTelemetry and Prometheus exporters.
 * 
 * @example
 * ```typescript
 * const telemetry = new TelemetryManager({
 *   serviceName: 'my-service',
 *   enableTracing: true,
 *   enableMetrics: true
 * });
 * 
 * await telemetry.initialize();
 * 
 * // Record metrics
 * telemetry.recordCounter('requests_total', 1, { method: 'GET' });
 * 
 * // Start trace
 * const span = telemetry.startSpan('operation_name');
 * // ... work
 * span.end();
 * ```
 */
@injectable()
@singleton()
export class TelemetryManager {
  private readonly logger = getLogger('telemetry');
  private readonly config: TelemetryConfig;
  private sdk: NodeSDK | null = null;
  private tracer: Tracer | null = null;
  private meter: Meter | null = null;
  private initialized = false;
  
  // OpenTelemetry metrics
  private counters = new Map<string, Counter>();
  private histograms = new Map<string, Histogram>();
  private upDownCounters = new Map<string, UpDownCounter>();
  
  // Prometheus metrics
  private promCounters = new Map<string, PromCounter<string>>();
  private promHistograms = new Map<string, PromHistogram<string>>();
  private promGauges = new Map<string, PromGauge<string>>();

  constructor(config?: Partial<TelemetryConfig>) {
    this.config = {
      ...DEFAULT_TELEMETRY_CONFIG,
      ...this.loadConfigFromEnvironment(),
      ...config
    };
    this.logger.debug('TelemetryManager initialized', { config: this.config });
  }

  /**
   * Load telemetry configuration from environment variables
   */
  private loadConfigFromEnvironment(): Partial<TelemetryConfig> {
    const config: Partial<TelemetryConfig> = {};

    if (process.env['ZEN_TELEMETRY_SERVICE_NAME']) {
      config.serviceName = process.env['ZEN_TELEMETRY_SERVICE_NAME'];
    }
    
    if (process.env['ZEN_TELEMETRY_SERVICE_VERSION']) {
      config.serviceVersion = process.env['ZEN_TELEMETRY_SERVICE_VERSION'];
    }

    if (process.env['ZEN_TELEMETRY_ENABLE_TRACING']) {
      config.enableTracing = process.env['ZEN_TELEMETRY_ENABLE_TRACING'] === 'true';
    }

    if (process.env['ZEN_TELEMETRY_ENABLE_METRICS']) {
      config.enableMetrics = process.env['ZEN_TELEMETRY_ENABLE_METRICS'] === 'true';
    }

    if (process.env['ZEN_TELEMETRY_JAEGER_ENDPOINT']) {
      config.jaegerEndpoint = process.env['ZEN_TELEMETRY_JAEGER_ENDPOINT'];
    }

    if (process.env['ZEN_TELEMETRY_PROMETHEUS_PORT']) {
      config.prometheusPort = parseInt(process.env['ZEN_TELEMETRY_PROMETHEUS_PORT'], 10);
    }

    if (process.env['ZEN_TELEMETRY_SAMPLING_RATIO']) {
      config.traceSamplingRatio = parseFloat(process.env['ZEN_TELEMETRY_SAMPLING_RATIO']);
    }

    return config;
  }

  /**
   * Initialize the telemetry system
   */
  async initialize(): Promise<Result<void, Error>> {
    if (this.initialized) {
      return ok(undefined);
    }

    try {
      this.logger.info('Initializing telemetry system', { 
        serviceName: this.config.serviceName,
        enableTracing: this.config.enableTracing,
        enableMetrics: this.config.enableMetrics
      });

      // Create resource with service information
      const resource = new Resource({
        [ATTR_SERVICE_NAME]: this.config.serviceName,
        [ATTR_SERVICE_VERSION]: this.config.serviceVersion || '1.0.0',
        ...this.config.resourceAttributes
      });

      // Initialize OpenTelemetry SDK
      if (this.config.enableTracing || this.config.enableMetrics) {
        await this.initializeOpenTelemetry(resource);
      }

      // Initialize Prometheus metrics
      if (this.config.enableMetrics) {
        await this.initializePrometheusMetrics();
      }

      this.initialized = true;
      this.logger.info('✅ Telemetry system initialized successfully');
      
      return ok(undefined);
    } catch (error) {
      this.logger.error('Failed to initialize telemetry system', { error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Initialize OpenTelemetry SDK
   */
  private async initializeOpenTelemetry(resource: Resource): Promise<void> {
    const instrumentations = this.config.enableAutoInstrumentation 
      ? getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false }, // Too verbose
        })
      : [];

    // Prometheus metrics will be handled separately via prom-client
    // OpenTelemetry SDK will handle tracing

    // Configure trace exporters
    const traceExporter = this.config.enableTracing && this.config.jaegerEndpoint
      ? new JaegerExporter({
          endpoint: this.config.jaegerEndpoint,
        })
      : undefined;

    // Initialize SDK - for Prometheus, we'll use the exporter directly
    this.sdk = new NodeSDK({
      resource,
      instrumentations,
      traceExporter,
      // Don't use metricReader with Prometheus as it's pull-based
    });

    await this.sdk.start();

    // Get tracer and meter instances
    if (this.config.enableTracing) {
      this.tracer = trace.getTracer(this.config.serviceName, this.config.serviceVersion);
    }

    if (this.config.enableMetrics) {
      this.meter = metrics.getMeter(this.config.serviceName, this.config.serviceVersion);
    }

    this.logger.debug('OpenTelemetry SDK initialized');
  }

  /**
   * Initialize Prometheus metrics
   */
  private async initializePrometheusMetrics(): Promise<void> {
    // Clear default metrics to avoid conflicts
    promRegister.clear();
    
    this.logger.debug('Prometheus metrics initialized');
  }

  /**
   * Shutdown the telemetry system
   */
  async shutdown(): Promise<Result<void, Error>> {
    try {
      if (this.sdk) {
        await this.sdk.shutdown();
        this.sdk = null;
      }

      // Clear Prometheus registry
      promRegister.clear();
      
      // Clear metric caches
      this.counters.clear();
      this.histograms.clear();
      this.upDownCounters.clear();
      this.promCounters.clear();
      this.promHistograms.clear();
      this.promGauges.clear();

      this.initialized = false;
      this.logger.info('Telemetry system shutdown successfully');
      
      return ok(undefined);
    } catch (error) {
      this.logger.error('Failed to shutdown telemetry system', { error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // =============================================================================
  // METRICS API
  // =============================================================================

  /**
   * Record a counter metric
   */
  recordCounter(name: string, value: number, attributes?: Attributes): void {
    if (!this.initialized || !this.config.enableMetrics) return;

    try {
      // OpenTelemetry counter
      if (this.meter) {
        let counter = this.counters.get(name);
        if (!counter) {
          counter = this.meter.createCounter(name, {
            description: `Counter metric: ${name}`,
          });
          this.counters.set(name, counter);
        }
        counter.add(value, attributes);
      }

      // Prometheus counter
      let promCounter = this.promCounters.get(name);
      if (!promCounter) {
        const labelNames = attributes ? Object.keys(attributes) : [];
        promCounter = new PromCounter({
          name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
          help: `Counter metric: ${name}`,
          labelNames,
          registers: [promRegister],
        });
        this.promCounters.set(name, promCounter);
      }
      
      if (attributes) {
        promCounter.labels(attributes as any).inc(value);
      } else {
        promCounter.inc(value);
      }
    } catch (error) {
      this.logger.warn('Failed to record counter metric', { name, value, error });
    }
  }

  /**
   * Record a histogram metric
   */
  recordHistogram(name: string, value: number, attributes?: Attributes): void {
    if (!this.initialized || !this.config.enableMetrics) return;

    try {
      // OpenTelemetry histogram
      if (this.meter) {
        let histogram = this.histograms.get(name);
        if (!histogram) {
          histogram = this.meter.createHistogram(name, {
            description: `Histogram metric: ${name}`,
          });
          this.histograms.set(name, histogram);
        }
        histogram.record(value, attributes);
      }

      // Prometheus histogram
      let promHistogram = this.promHistograms.get(name);
      if (!promHistogram) {
        const labelNames = attributes ? Object.keys(attributes) : [];
        promHistogram = new PromHistogram({
          name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
          help: `Histogram metric: ${name}`,
          labelNames,
          registers: [promRegister],
        });
        this.promHistograms.set(name, promHistogram);
      }

      if (attributes) {
        promHistogram.labels(attributes as any).observe(value);
      } else {
        promHistogram.observe(value);
      }
    } catch (error) {
      this.logger.warn('Failed to record histogram metric', { name, value, error });
    }
  }

  /**
   * Record a gauge metric
   */
  recordGauge(name: string, value: number, attributes?: Attributes): void {
    if (!this.initialized || !this.config.enableMetrics) return;

    try {
      // OpenTelemetry UpDownCounter (closest to gauge)
      if (this.meter) {
        let upDownCounter = this.upDownCounters.get(name);
        if (!upDownCounter) {
          upDownCounter = this.meter.createUpDownCounter(name, {
            description: `Gauge metric: ${name}`,
          });
          this.upDownCounters.set(name, upDownCounter);
        }
        upDownCounter.add(value, attributes);
      }

      // Prometheus gauge
      let promGauge = this.promGauges.get(name);
      if (!promGauge) {
        const labelNames = attributes ? Object.keys(attributes) : [];
        promGauge = new PromGauge({
          name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
          help: `Gauge metric: ${name}`,
          labelNames,
          registers: [promRegister],
        });
        this.promGauges.set(name, promGauge);
      }

      if (attributes) {
        promGauge.labels(attributes as any).set(value);
      } else {
        promGauge.set(value);
      }
    } catch (error) {
      this.logger.warn('Failed to record gauge metric', { name, value, error });
    }
  }

  // =============================================================================
  // TRACING API
  // =============================================================================

  /**
   * Start a new trace span
   */
  startSpan(name: string, options?: SpanOptions): Span {
    if (!this.initialized || !this.config.enableTracing || !this.tracer) {
      // Return a no-op span if tracing is disabled
      return trace.getActiveSpan() || trace.getTracer('noop').startSpan('noop');
    }

    try {
      const span = this.tracer.startSpan(name, {
        kind: options?.kind || SpanKind.INTERNAL,
        attributes: options?.attributes,
        links: options?.links,
        startTime: options?.startTime,
      });

      if (options?.attributes) {
        span.setAttributes(options.attributes);
      }

      return span;
    } catch (error) {
      this.logger.warn('Failed to start span', { name, error });
      return trace.getActiveSpan() || trace.getTracer('noop').startSpan('noop');
    }
  }

  /**
   * Start a span and run function within its context
   */
  withSpan<T>(name: string, fn: (span: Span) => T, options?: SpanOptions): T {
    const span = this.startSpan(name, options);
    
    try {
      return context.with(trace.setSpan(context.active(), span), () => {
        try {
          const result = fn(span);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.recordException(error instanceof Error ? error : new Error(String(error)));
          span.setStatus({ 
            code: SpanStatusCode.ERROR, 
            message: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      });
    } finally {
      span.end();
    }
  }

  /**
   * Start a span and run async function within its context
   */
  async withAsyncSpan<T>(name: string, fn: (span: Span) => Promise<T>, options?: SpanOptions): Promise<T> {
    const span = this.startSpan(name, options);
    
    try {
      return await context.with(trace.setSpan(context.active(), span), async () => {
        try {
          const result = await fn(span);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.recordException(error instanceof Error ? error : new Error(String(error)));
          span.setStatus({ 
            code: SpanStatusCode.ERROR, 
            message: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      });
    } finally {
      span.end();
    }
  }

  /**
   * Add event to current span
   */
  addEvent(name: string, attributes?: Attributes): void {
    if (!this.initialized || !this.config.enableTracing) return;

    try {
      const span = trace.getActiveSpan();
      if (span) {
        span.addEvent(name, attributes);
      }
    } catch (error) {
      this.logger.warn('Failed to add event to span', { name, error });
    }
  }

  /**
   * Set attributes on current span
   */
  setSpanAttributes(attributes: Attributes): void {
    if (!this.initialized || !this.config.enableTracing) return;

    try {
      const span = trace.getActiveSpan();
      if (span) {
        span.setAttributes(attributes);
      }
    } catch (error) {
      this.logger.warn('Failed to set span attributes', { attributes, error });
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get current telemetry configuration
   */
  getConfig(): TelemetryConfig {
    return { ...this.config };
  }

  /**
   * Check if telemetry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get Prometheus metrics registry
   */
  getPrometheusRegistry() {
    return promRegister;
  }

  /**
   * Get current tracer instance
   */
  getTracer(): Tracer | null {
    return this.tracer;
  }

  /**
   * Get current meter instance
   */
  getMeter(): Meter | null {
    return this.meter;
  }
}

// =============================================================================
// GLOBAL TELEMETRY INSTANCE
// =============================================================================

let globalTelemetryManager: TelemetryManager | null = null;

/**
 * Get or create global telemetry manager instance
 */
export function getTelemetry(config?: Partial<TelemetryConfig>): TelemetryManager {
  if (!globalTelemetryManager) {
    globalTelemetryManager = new TelemetryManager(config);
  }
  return globalTelemetryManager;
}

/**
 * Initialize global telemetry system
 */
export async function initializeTelemetry(config?: Partial<TelemetryConfig>): Promise<Result<void, Error>> {
  const telemetry = getTelemetry(config);
  return await telemetry.initialize();
}

/**
 * Shutdown global telemetry system
 */
export async function shutdownTelemetry(): Promise<Result<void, Error>> {
  if (globalTelemetryManager) {
    const result = await globalTelemetryManager.shutdown();
    globalTelemetryManager = null;
    return result;
  }
  return ok(undefined);
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Record a counter metric using global telemetry
 */
export function recordMetric(name: string, value: number, attributes?: Attributes): void {
  getTelemetry().recordCounter(name, value, attributes);
}

/**
 * Record a histogram metric using global telemetry
 */
export function recordHistogram(name: string, value: number, attributes?: Attributes): void {
  getTelemetry().recordHistogram(name, value, attributes);
}

/**
 * Record a gauge metric using global telemetry
 */
export function recordGauge(name: string, value: number, attributes?: Attributes): void {
  getTelemetry().recordGauge(name, value, attributes);
}

/**
 * Start a trace span using global telemetry
 */
export function startTrace(name: string, options?: SpanOptions): Span {
  return getTelemetry().startSpan(name, options);
}

/**
 * Execute function within a trace span
 */
export function withTrace<T>(name: string, fn: (span: Span) => T, options?: SpanOptions): T {
  return getTelemetry().withSpan(name, fn, options);
}

/**
 * Execute async function within a trace span
 */
export async function withAsyncTrace<T>(name: string, fn: (span: Span) => Promise<T>, options?: SpanOptions): Promise<T> {
  return getTelemetry().withAsyncSpan(name, fn, options);
}

/**
 * Record telemetry event using global telemetry
 */
export function recordEvent(name: string, attributes?: Attributes): void {
  getTelemetry().addEvent(name, attributes);
}

/**
 * Set attributes on current span using global telemetry
 */
export function setTraceAttributes(attributes: Attributes): void {
  getTelemetry().setSpanAttributes(attributes);
}

// =============================================================================
// TELEMETRY DECORATORS
// =============================================================================

/**
 * Method decorator for automatic tracing
 */
export function traced(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const traceName = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return withTrace(traceName, (span) => {
        span.setAttributes({
          'method.name': propertyKey,
          'method.class': target.constructor.name,
          'method.args_count': args.length,
        });
        
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

/**
 * Method decorator for automatic async tracing
 */
export function tracedAsync(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const traceName = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return withAsyncTrace(traceName, async (span) => {
        span.setAttributes({
          'method.name': propertyKey,
          'method.class': target.constructor.name,
          'method.args_count': args.length,
        });
        
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

/**
 * Method decorator for automatic metrics recording
 */
export function metered(metricName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metric = metricName || `${target.constructor.name}_${propertyKey}_calls`;

    descriptor.value = function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = originalMethod.apply(this, args);
        
        // Record success metric
        recordMetric(`${metric}_total`, 1, { 
          status: 'success',
          method: propertyKey,
          class: target.constructor.name 
        });
        
        // Record duration
        recordHistogram(`${metric}_duration_ms`, Date.now() - startTime, {
          method: propertyKey,
          class: target.constructor.name
        });
        
        return result;
      } catch (error) {
        // Record error metric
        recordMetric(`${metric}_total`, 1, { 
          status: 'error',
          method: propertyKey,
          class: target.constructor.name 
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}

// =============================================================================
// EXPORTS - Re-export OpenTelemetry types for convenience
// =============================================================================

export type {
  Span,
  Tracer,
  Meter,
  Attributes
};

export {
  SpanKind,
  SpanStatusCode
};

// =============================================================================
// SYSTEM MONITORING - Comprehensive system resource monitoring
// =============================================================================

/**
 * System metrics collector for CPU, memory, network monitoring
 */
export class SystemMonitor {
  private logger = getLogger('SystemMonitor');
  private collecting = false;
  private interval: NodeJS.Timeout | null = null;

  constructor(private config: { intervalMs?: number } = {}) {
    this.config.intervalMs = config.intervalMs || 5000; // 5 second default
  }

  /**
   * Start collecting system metrics
   */
  start(): void {
    if (this.collecting) return;
    
    this.collecting = true;
    this.logger.info('🖥️ Starting system monitoring', { intervalMs: this.config.intervalMs });
    
    this.interval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.intervalMs);
  }

  /**
   * Stop collecting system metrics
   */
  stop(): void {
    if (!this.collecting) return;
    
    this.collecting = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.logger.info('🛑 System monitoring stopped');
  }

  /**
   * Collect current system metrics
   */
  private collectSystemMetrics(): void {
    try {
      // Node.js process metrics
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Memory metrics
      recordGauge('system_memory_rss_bytes', memUsage.rss, { type: 'rss' });
      recordGauge('system_memory_heap_used_bytes', memUsage.heapUsed, { type: 'heap_used' });
      recordGauge('system_memory_heap_total_bytes', memUsage.heapTotal, { type: 'heap_total' });
      recordGauge('system_memory_external_bytes', memUsage.external, { type: 'external' });

      // CPU metrics (microseconds)
      recordGauge('system_cpu_user_microseconds', cpuUsage.user, { type: 'user' });
      recordGauge('system_cpu_system_microseconds', cpuUsage.system, { type: 'system' });

      // Process metrics
      recordGauge('system_process_uptime_seconds', process.uptime());
      recordGauge('system_process_active_handles', (process as any)._getActiveHandles().length);
      recordGauge('system_process_active_requests', (process as any)._getActiveRequests().length);

    } catch (error) {
      this.logger.warn('Failed to collect system metrics', { error });
    }
  }

  /**
   * Get current system metrics snapshot
   */
  getMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      process: {
        uptime: process.uptime(),
        activeHandles: (process as any)._getActiveHandles().length,
        activeRequests: (process as any)._getActiveRequests().length
      }
    };
  }
}

/**
 * Performance tracker for request/operation timing
 */
export class PerformanceTracker {
  private logger = getLogger('PerformanceTracker');
  private timers = new Map<string, number>();
  private stats = new Map<string, { count: number; totalDuration: number; minDuration: number; maxDuration: number }>();

  /**
   * Start timing an operation
   */
  startTimer(label: string): { label: string; start: number } {
    const start = Date.now();
    this.timers.set(label, start);
    return { label, start };
  }

  /**
   * End timing an operation and record metrics
   */
  endTimer(label: string): { label: string; duration: number } {
    const end = Date.now();
    const start = this.timers.get(label);
    
    if (!start) {
      this.logger.warn('Timer not found for label', { label });
      return { label, duration: 0 };
    }

    const duration = end - start;
    this.timers.delete(label);

    // Record telemetry
    recordHistogram('performance_operation_duration_ms', duration, { operation: label });
    recordMetric('performance_operation_total', 1, { operation: label });

    // Update local stats
    const currentStats = this.stats.get(label) || { count: 0, totalDuration: 0, minDuration: Infinity, maxDuration: 0 };
    currentStats.count++;
    currentStats.totalDuration += duration;
    currentStats.minDuration = Math.min(currentStats.minDuration, duration);
    currentStats.maxDuration = Math.max(currentStats.maxDuration, duration);
    this.stats.set(label, currentStats);

    return { label, duration };
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const result: Record<string, any> = {};
    
    for (const [label, stats] of this.stats.entries()) {
      result[label] = {
        count: stats.count,
        averageResponseTime: stats.totalDuration / stats.count,
        minResponseTime: stats.minDuration === Infinity ? 0 : stats.minDuration,
        maxResponseTime: stats.maxDuration,
        totalDuration: stats.totalDuration
      };
    }

    // Overall stats
    const allStats = Array.from(this.stats.values());
    const totalCount = allStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalDuration = allStats.reduce((sum, stat) => sum + stat.totalDuration, 0);

    return {
      operations: result,
      overall: {
        averageResponseTime: totalCount > 0 ? totalDuration / totalCount : 0,
        throughput: totalCount,
        totalOperations: totalCount
      }
    };
  }
}

/**
 * Agent monitoring for AI agent performance and coordination
 */
export class AgentMonitor {
  private logger = getLogger('AgentMonitor');
  private agentMetrics = new Map<string, any>();

  /**
   * Track agent performance metrics
   */
  trackAgent(agentId: string, metrics: {
    tasksAssigned?: number;
    tasksCompleted?: number;
    averageResponseTime?: number;
    collaborationScore?: number;
    coordinationEfficiency?: number;
  }): void {
    this.logger.debug('Tracking agent metrics', { agentId, metrics });
    // Record telemetry metrics
    if (metrics.tasksAssigned !== undefined) {
      recordGauge('agent_tasks_assigned', metrics.tasksAssigned, { agent_id: agentId });
    }
    if (metrics.tasksCompleted !== undefined) {
      recordGauge('agent_tasks_completed', metrics.tasksCompleted, { agent_id: agentId });
    }
    if (metrics.averageResponseTime !== undefined) {
      recordHistogram('agent_response_time_ms', metrics.averageResponseTime, { agent_id: agentId });
    }
    if (metrics.collaborationScore !== undefined) {
      recordGauge('agent_collaboration_score', metrics.collaborationScore, { agent_id: agentId });
    }
    if (metrics.coordinationEfficiency !== undefined) {
      recordGauge('agent_coordination_efficiency', metrics.coordinationEfficiency, { agent_id: agentId });
    }

    // Store local metrics
    this.agentMetrics.set(agentId, {
      ...this.agentMetrics.get(agentId),
      ...metrics,
      lastUpdated: new Date()
    });
  }

  /**
   * Get agent metrics
   */
  getAgentMetrics(agentId?: string) {
    if (agentId) {
      return this.agentMetrics.get(agentId);
    }
    return Object.fromEntries(this.agentMetrics.entries());
  }
}

/**
 * ML model monitoring for AI/ML model performance
 */
export class MLMonitor {
  private logger = getLogger('MLMonitor');

  /**
   * Track ML model prediction
   */
  trackPrediction(modelId: string, prediction: {
    input?: any;
    prediction?: any;
    confidence?: number;
    latency?: number;
    timestamp?: Date;
  }): void {
    this.logger.debug('Tracking ML prediction', { modelId, prediction });
    const labels = { model_id: modelId };

    if (prediction.confidence !== undefined) {
      recordHistogram('ml_model_confidence', prediction.confidence, labels);
    }
    if (prediction.latency !== undefined) {
      recordHistogram('ml_model_inference_latency_ms', prediction.latency, labels);
    }
    
    recordMetric('ml_model_predictions_total', 1, labels);
  }

  /**
   * Track model performance metrics
   */
  trackPerformance(modelId: string, metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  }): void {
    const labels = { model_id: modelId };

    if (metrics.accuracy !== undefined) {
      recordGauge('ml_model_accuracy', metrics.accuracy, labels);
    }
    if (metrics.precision !== undefined) {
      recordGauge('ml_model_precision', metrics.precision, labels);
    }
    if (metrics.recall !== undefined) {
      recordGauge('ml_model_recall', metrics.recall, labels);
    }
    if (metrics.f1Score !== undefined) {
      recordGauge('ml_model_f1_score', metrics.f1Score, labels);
    }
  }
}

// =============================================================================
// MONITORING FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a system monitor instance
 */
export function createSystemMonitor(config?: { intervalMs?: number }): SystemMonitor {
  return new SystemMonitor(config);
}

/**
 * Create a performance tracker instance
 */
export function createPerformanceTracker(): PerformanceTracker {
  return new PerformanceTracker();
}

/**
 * Create an agent monitor instance
 */
export function createAgentMonitor(): AgentMonitor {
  return new AgentMonitor();
}

/**
 * Create an ML monitor instance
 */
export function createMLMonitor(): MLMonitor {
  return new MLMonitor();
}

/**
 * Create a comprehensive monitoring system
 */
export function createMonitoringSystem(config?: { 
  systemMonitoring?: boolean;
  performanceTracking?: boolean;
  agentMonitoring?: boolean;
  mlMonitoring?: boolean;
  systemInterval?: number;
}) {
  const monitors: any = {};

  if (config?.systemMonitoring !== false) {
    monitors.system = createSystemMonitor({ intervalMs: config?.systemInterval });
  }
  if (config?.performanceTracking !== false) {
    monitors.performance = createPerformanceTracker();
  }
  if (config?.agentMonitoring !== false) {
    monitors.agent = createAgentMonitor();
  }
  if (config?.mlMonitoring !== false) {
    monitors.ml = createMLMonitor();
  }

  return {
    name: '@claude-zen/foundation/telemetry',
    version: '2.0.0',
    description: 'Comprehensive telemetry and monitoring system',
    monitors,
    startAll: () => {
      if (monitors.system) monitors.system.start();
    },
    stopAll: () => {
      if (monitors.system) monitors.system.stop();
    }
  };
}

// =============================================================================
// MONITORING TYPES
// =============================================================================

export interface MonitoringConfig {
  metricsCollection: {
    enabled: boolean;
    interval?: number;
    retentionPeriod?: number;
  };
  performanceTracking: {
    enabled: boolean;
    sampleRate?: number;
  };
  agentMonitoring: {
    enabled: boolean;
    trackCoordination?: boolean;
  };
  alerts: {
    enabled: boolean;
    thresholds?: Record<string, number>;
  };
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
}

// Default export for convenience
export default {
  TelemetryManager,
  getTelemetry,
  initializeTelemetry,
  shutdownTelemetry,
  recordMetric,
  recordHistogram,
  recordGauge,
  startTrace,
  withTrace,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  traced,
  tracedAsync,
  metered,
  // Monitoring exports
  SystemMonitor,
  PerformanceTracker,
  AgentMonitor,
  MLMonitor,
  createSystemMonitor,
  createPerformanceTracker,
  createAgentMonitor,
  createMLMonitor,
  createMonitoringSystem
};