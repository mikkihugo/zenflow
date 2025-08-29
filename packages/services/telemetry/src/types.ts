/**
 * @fileoverview Telemetry Types - Core interfaces for event-driven telemetry
 */

/**
 * Configuration for telemetry system
 */
export interface TelemetryConfig {
  /** Service name for telemetry identification */
  serviceName:string;
  /** Service version */
  serviceVersion?:string;
  /** Enable tracing */
  enableTracing?:boolean;
  /** Enable metrics */
  enableMetrics?:boolean;
  /** Sampling ratio for traces (0.0 to 1.0) */
  samplingRatio?:number;
  /** Additional attributes for all telemetry */
  globalAttributes?:Record<string, string | number | boolean>;
}

/**
 * Metric definition
 */
export interface MetricDefinition {
  name:string;
  description?:string;
  unit?:string;
  type:MetricType;
}

/**
 * Metric types
 */
export type MetricType = 'counter' | ' histogram' | ' gauge' | ' up_down_counter';

/**
 * Telemetry event
 */
export interface TelemetryEvent {
  name:string;
  timestamp?:number;
  attributes?:Attributes;
  severity?:'debug' | ' info' | ' warn' | ' error';
}

/**
 * Span options for tracing
 */
export interface SpanOptions {
  attributes?:Attributes;
  kind?:'client' | 'server' | 'producer' | 'consumer' | 'internal';
}

/**
 * Attributes for telemetry data
 */
export type Attributes = Record<
  string,
  string | number | boolean | string[] | number[] | boolean[]
>;

/**
 * Simple span interface for event-driven telemetry
 */
export interface Span {
  addEvent(name:string, attributes?:Attributes): void;
  setAttribute(key:string, value:string | number | boolean): void;
  setStatus(status:'ok' | 'error', message?:string): void;
  end(): void;
}

/**
 * Simple tracer interface for event-driven telemetry
 */
export interface Tracer {
  startSpan(name:string, options?:SpanOptions): Span;
}

/**
 * Simple meter interface for event-driven telemetry
 */
export interface Meter {
  createCounter(name:string, options?:{ description?:string; unit?:string}): {
    add(value:number, attributes?:Attributes): void;
  };
  createHistogram(name:string, options?:{ description?:string; unit?:string}): {
    record(value:number, attributes?:Attributes): void;
  };
  createGauge(name:string, options?:{ description?:string; unit?:string}): {
    record(value:number, attributes?:Attributes): void;
  };
}
