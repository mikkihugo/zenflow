/**
 * @fileoverview Telemetry Implementation - 100% Event-Driven
 *
 * ZERO IMPORTS - Pure event-based telemetry system
 * Listens to telemetry events and handles metric collection, tracing, and event logging
 */
interface TelemetryEvents {
  'brain:telemetry:initialize': {
    requestId: string;
    config?: TelemetryConfig;
    timestamp: number;
  };
  'brain:telemetry:get-metrics': {
    requestId: string;
    timestamp: number;
  };
  'brain:telemetry:get-traces': {
    requestId: string;
    timestamp: number;
  };
  'brain:telemetry:shutdown': {
    requestId: string;
    timestamp: number;
  };
  'telemetry:record-metric': {
    name: string;
    value: number;
    attributes?: Record<string, unknown>;
    timestamp: number;
  };
  'telemetry:record-histogram': {
    name: string;
    value: number;
    attributes?: Record<string, unknown>;
    timestamp: number;
  };
  'telemetry:record-gauge': {
    name: string;
    value: number;
    attributes?: Record<string, unknown>;
    timestamp: number;
  };
  'telemetry:record-event': {
    name: string;
    data?: unknown;
    timestamp: number;
  };
  'telemetry:start-trace': {
    name: string;
    traceId: string;
    attributes?: Record<string, unknown>;
    timestamp: number;
  };
  'telemetry:end-trace': {
    traceId: string;
    timestamp: number;
  };
  'telemetry:initialized': {
    requestId: string;
    success: boolean;
    serviceName: string;
    timestamp: number;
  };
  'telemetry:metrics': {
    requestId: string;
    metrics: Record<string, unknown>;
    timestamp: number;
  };
  'telemetry:traces': {
    requestId: string;
    traces: Record<string, unknown>;
    timestamp: number;
  };
  'telemetry:shutdown-complete': {
    requestId: string;
    success: boolean;
    timestamp: number;
  };
  'telemetry:error': {
    requestId?: string;
    error: string;
    timestamp: number;
  };
  'telemetry:metric-recorded': {
    name: string;
    value: number;
    attributes?: Record<string, unknown>;
    timestamp: number;
  };
  'telemetry:trace-completed': {
    name: string;
    traceId: string;
    duration: number;
    attributes?: Record<string, unknown>;
    timestamp: number;
  };
}
interface TelemetryConfig {
  serviceName?: string;
  serviceVersion?: string;
  enableTracing?: boolean;
  enableMetrics?: boolean;
  jaegerEndpoint?: string;
  prometheusPort?: number;
  samplingRatio?: number;
  globalAttributes?: Record<string, unknown>;
}
export declare class EventDrivenTelemetryManager {
  private eventListeners;
  private logger;
  private config;
  private initialized;
  private metrics;
  private traces;
  constructor();
  addEventListener<K extends keyof TelemetryEvents>(
    event: K,
    listener: (data: TelemetryEvents[K]) => void
  ): void;
  private emitEvent;
  private setupBrainEventHandlers;
  private setupInitializeHandler;
  private setupMetricsHandler;
  private setupTracesHandler;
  private setupShutdownHandler;
  private setupTelemetryEventHandlers;
  private initializeInternal;
  private shutdownInternal;
  private recordMetricInternal;
}
export declare function initializeEventDrivenTelemetry(): Promise<EventDrivenTelemetryManager>;
export declare function getEventDrivenTelemetry(): EventDrivenTelemetryManager;
export declare function shutdownEventDrivenTelemetry(): Promise<void>;
export declare function createEventDrivenTelemetryManager(): EventDrivenTelemetryManager;
export default EventDrivenTelemetryManager;
//# sourceMappingURL=telemetry-event-driven.d.ts.map
