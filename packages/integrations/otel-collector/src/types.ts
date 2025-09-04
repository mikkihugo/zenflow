/**
 * @fileoverview Internal OTEL Collector Types
 *
 * Type definitions for the internal OpenTelemetry collector system.
 * Supports multiple backends, data processing, and centralized configuration.
 */

import type { Attributes } from '@opentelemetry/api';

/**
 * Collector configuration interface
 */
export interface CollectorConfig {
  /** Service name for the collector */
  serviceName?: string;

  /** HTTP port for OTEL data ingestion */
  httpPort?: number;

  /** gRPC port for OTEL data ingestion */
  grpcPort?: number;

  /** Enable/disable specific signal types */
  signals?: {
    traces?: boolean;
    metrics?: boolean;
    logs?: boolean;
  };

  /** Backend exporters configuration */
  exporters?: ExporterConfig[];

  /** Data processors configuration */
  processors?: ProcessorConfig[];

  /** Global attributes to add to all telemetry */
  globalAttributes?: Attributes;

  /** Batching configuration */
  batching?: BatchingConfig;

  /** Buffer and queue settings */
  buffering?: BufferingConfig;
}

/**
 * Exporter configuration for different backends
 */
export interface ExporterConfig {
  /** Exporter type */
  type:
    | 'jaeger' | 'otlp-http' | 'otlp-grpc' | 'prometheus' | 'console' | 'file';

  /** Exporter name/identifier */
  name: string;

  /** Whether this exporter is enabled */
  enabled?: boolean;

  /** Backend endpoint URL */
  endpoint?: string;

  /** Authentication headers */
  headers?: Record<string, string>;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Which signals to export */
  signals?: ('traces' | 'metrics' | 'logs')[];

  /** Exporter-specific configuration */
  config?: Record<string, any>;
}

/**
 * Data processor configuration
 */
export interface ProcessorConfig {
  /** Processor type */
  type:
    | 'batch' | 'filter' | 'transform' | 'sampler' | 'memory_limiter' | 'resource' | 'attribute';

  /** Processor name */
  name: string;

  /** Whether processor is enabled */
  enabled?: boolean;

  /** Processor-specific configuration */
  config?: Record<string, any>;
}

/**
 * Batching configuration
 */
export interface BatchingConfig {
  /** Maximum batch size */
  maxBatchSize?: number;

  /** Batch timeout in milliseconds */
  batchTimeout?: number;

  /** Maximum queue size */
  maxQueueSize?: number;
}

/**
 * Buffering and queue configuration
 */
export interface BufferingConfig {
  /** Maximum memory usage in bytes */
  maxMemoryMiB?: number;

  /** Maximum disk usage in bytes */
  maxDiskMiB?: number;

  /** Buffer flush interval in milliseconds */
  flushInterval?: number;

  /** Enable disk spooling */
  enableDiskSpool?: boolean;
}

/**
 * Collector statistics
 */
export interface CollectorStats {
  /** Total signals received */
  received: {
    traces: number;
    metrics: number;
    logs: number;
  };

  /** Total signals exported */
  exported: {
    traces: number;
    metrics: number;
    logs: number;
  };

  /** Export errors by backend */
  errors: Record<string, number>;

  /** Current queue sizes */
  queueSizes: Record<string, number>;

  /** Memory usage */
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };

  /** Uptime in milliseconds */
  uptime: number;
}

/**
 * Health check result
 */
export interface HealthStatus {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /** Individual exporter health */
  exporters: Record<
    string,
    {
      status: 'healthy' | 'degraded' | 'unhealthy';
      lastSuccess?: number;
      lastError?: string;
    }
  >;

  /** System resource status */
  resources: {
    memory: 'ok' | 'warning' | 'critical';
    disk: 'ok' | 'warning' | 'critical';
    cpu: 'ok' | 'warning' | 'critical';
  };

  /** Timestamp of health check */
  timestamp: number;
}

/**
 * Signal types supported by collector
 */
export type SignalType = 'traces' | 'metrics' | 'logs';

/**
 * Backend types supported
 */
export type BackendType =
  | 'jaeger' | 'otlp-http' | 'otlp-grpc' | 'prometheus' | 'console' | 'file';

/**
 * Processor types available
 */
export type ProcessorType =
  | 'batch' | 'filter' | 'transform' | 'sampler' | 'memory_limiter' | 'resource' | 'attribute';

/**
 * Internal telemetry data structure
 */
export interface TelemetryData {
  /** Signal type */
  type: SignalType;

  /** Timestamp */
  timestamp: number;

  /** Service information */
  service: {
    name: string;
    version?: string;
    instance?: string;
  };

  /** Data payload */
  data: any;

  /** Additional attributes */
  attributes?: Attributes;
}

/**
 * Export result
 */
export interface ExportResult {
  /** Whether export was successful */
  success: boolean;

  /** Number of items exported */
  exported: number;

  /** Error message if failed */
  error?: string;

  /** Backend name */
  backend: string;

  /** Export duration in milliseconds */
  duration: number;
}
