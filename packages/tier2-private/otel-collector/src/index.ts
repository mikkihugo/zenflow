/**
 * @fileoverview Internal OTEL Collector - Main Entry Point
 *
 * Provides centralized OpenTelemetry data collection and export capabilities
 * for the claude-code-zen ecosystem. Supports multiple exporters, processors,
 * and telemetry signals (traces, metrics, logs).
 */

export { InternalOTELCollector } from './collector.js';
export { ProcessorManager } from './processors/index.js';
export { ExporterManager } from './exporters/index.js';
export {
  ConfigManager,
  configManager,
  loadDefaultConfig,
  createDevelopmentConfig,
  createProductionConfig,
} from './config/index.js';

// Re-export types
export type {
  // Core types
  CollectorConfig,
  TelemetryData,
  TelemetryService,

  // Exporter types
  ExporterConfig,
  ExportResult,

  // Processor types
  ProcessorConfig,

  // Health types
  HealthStatus,
} from './types.js';

// Re-export specific exporters
export { ConsoleExporter } from './exporters/console-exporter.js';
export { FileExporter } from './exporters/file-exporter.js';
export { JaegerExporter } from './exporters/jaeger-exporter.js';
export { OTLPExporter } from './exporters/otlp-exporter.js';
export { PrometheusExporter } from './exporters/prometheus-exporter.js';

// Re-export specific processors
export { BatchProcessor } from './processors/batch-processor.js';
export { FilterProcessor } from './processors/filter-processor.js';
export { TransformProcessor } from './processors/transform-processor.js';
export { SamplerProcessor } from './processors/sampler-processor.js';

/**
 * Create and start an OTEL collector with default configuration
 */
export async function createCollector(
  configPath?: string
): Promise<InternalOTELCollector> {
  const collector = new InternalOTELCollector();

  if (configPath) {
    await collector.initialize(configPath);
  } else {
    const config = await loadDefaultConfig();
    await collector.initialize(config);
  }

  return collector;
}

/**
 * Create and start a development OTEL collector
 */
export async function createDevelopmentCollector(): Promise<InternalOTELCollector> {
  const collector = new InternalOTELCollector();
  const config = createDevelopmentConfig();
  await collector.initialize(config);
  return collector;
}

/**
 * Create and start a production OTEL collector
 */
export async function createProductionCollector(): Promise<InternalOTELCollector> {
  const collector = new InternalOTELCollector();
  const config = createProductionConfig();
  await collector.initialize(config);
  return collector;
}

/**
 * Quick start function - creates and starts collector based on environment
 */
export async function quickStart(): Promise<InternalOTELCollector> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return createDevelopmentCollector();
  } else {
    return createProductionCollector();
  }
}

// Default export for convenience
export default InternalOTELCollector;
