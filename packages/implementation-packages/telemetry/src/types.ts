/**
 * @fileoverview Telemetry Types - Core interfaces and types for telemetry infrastructure
 */

import type { Span as OTelSpan, Tracer as OTelTracer } from '@opentelemetry/api';

/**
 * Configuration for telemetry system
 */
export interface TelemetryConfig {
  /** Service name for telemetry identification */
  serviceName: string;
  /** Service version */
  serviceVersion?: string;
  /** Enable tracing */
  enableTracing?: boolean;
  /** Enable metrics */
  enableMetrics?: boolean;
  /** Jaeger collector endpoint */
  jaegerEndpoint?: string;
  /** Prometheus metrics port */
  prometheusPort?: number;
  /** Sampling ratio for traces (0.0 to 1.0) */
  samplingRatio?: number;
  /** Additional attributes for all telemetry */
  globalAttributes?: Record<string, string | number | boolean>;
}

/**
 * Metric definition
 */
export interface MetricDefinition {
  name: string;
  description?: string;
  unit?: string;
  type: MetricType;
}

/**
 * Metric types
 */
export type MetricType = 'counter' | 'histogram' | 'gauge' | 'up_down_counter';

/**
 * Telemetry event
 */
export interface TelemetryEvent {
  name: string;
  timestamp?: number;
  attributes?: Attributes;
  severity?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Span options for tracing
 */
export interface SpanOptions {
  attributes?: Attributes;
  kind?: import('@opentelemetry/api').SpanKind;
  parent?: OTelSpan;
}

/**
 * Attributes for telemetry data
 */
export type Attributes = Record<string, string | number | boolean | string[] | number[] | boolean[]>;

/**
 * Re-export OpenTelemetry types
 */
export type Span = OTelSpan;
export type Tracer = OTelTracer;
export type { Meter } from '@opentelemetry/api';