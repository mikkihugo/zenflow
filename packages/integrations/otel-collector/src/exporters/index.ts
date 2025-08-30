/**
 * @fileoverview OTEL Exporter Manager
 *
 * Manages multiple telemetry exporters for different backends.
 * Supports Jaeger, OTLP (HTTP/gRPC), Prometheus, console, and file exporters.
 */

import type {
  ExporterConfig,
  ExportResult,
  TelemetryData,
} from '../types.js';
import type { Logger} from '@claude-zen/foundation';
import { getLogger} from '@claude-zen/foundation/logging';
import { ConsoleExporter} from './console-exporter.js';
import { FileExporter} from './file-exporter.js';
import { JaegerExporter} from './jaeger-exporter.js';
import { OTLPExporter} from './otlp-exporter.js';
import { PrometheusExporter} from './prometheus-exporter.js';

/**
 * Base exporter interface
 */
export interface BaseExporter {
  initialize():Promise<void>;
  export(data:TelemetryData): Promise<ExportResult>;
  exportBatch(data:TelemetryData[]): Promise<ExportResult>;
  shutdown():Promise<void>;
  getQueueSize():number;
  getHealthStatus():Promise<{
    status:'healthy' | ' degraded' | ' unhealthy';
    lastSuccess?:number;
    lastError?:string;
}>;
}

/**
 * Exporter factory
 */
class ExporterFactory {
  static create(config:ExporterConfig): BaseExporter {
    switch (config.type) {
      case 'jaeger':
        return new JaegerExporter(config);
      case 'otlp-http':
      case 'otlp-grpc':
        return new OTLPExporter(config);
      case 'prometheus':
        return new PrometheusExporter(config);
      case 'console':
        return new ConsoleExporter(config);
      case 'file':
        return new FileExporter(config);
      default:
        throw new Error(`Unsupported exporter type:${config.type}`);
}
}
}

/**
 * Exporter Manager - manages all configured exporters
 */
export class ExporterManager {
  private exporters:Map<string, BaseExporter> = new Map();
  private configs:Map<string, ExporterConfig> = new Map();
  private logger:Logger;

  constructor(exporterConfigs:ExporterConfig[]) {
    this.logger = getLogger('ExporterManager');

    // Create exporters from configurations
    for (const config of exporterConfigs) {
      if (config.enabled !== false) {
        try {
          const exporter = ExporterFactory.create(config);
          this.exporters.set(config.name, exporter);
          this.configs.set(config.name, config);
} catch (error) {
          this.logger.error(`Failed to create exporter ${config.name}`, error);
}
}
}

    this.logger.info(`Initialized ${this.exporters.size} exporters`);
}

  /**
   * Initialize all exporters
   */
  async initialize():Promise<void> {
    const initPromises = Array.from(this.exporters.entries()).map(
      async ([name, exporter]) => {
        try {
          await exporter.initialize();
          this.logger.info(`Exporter ${name} initialized`);
} catch (error) {
          this.logger.error(`Failed to initialize exporter ${name}`, error);
          // Don't throw - allow other exporters to initialize
}
}
    );

    await Promise.all(initPromises);
}

  /**
   * Export data to all configured exporters
   */
  async export(data:TelemetryData): Promise<ExportResult[]> {
    const exportPromises = Array.from(this.exporters.entries()).map(
      async ([name, exporter]) => {
        const config = this.configs.get(name)!;

        // Check if this exporter handles this signal type
        if (config.signals  &&  !config.signals.includes(data.type)) {
          return {
            success:true,
            exported:0,
            backend:name,
            duration:0,
} as ExportResult;
}

        try {
          const startTime = Date.now();
          const result = await exporter.export(data);
          return {
            ...result,
            duration:Date.now() - startTime,
};
} catch (error) {
          this.logger.error(`Export failed for ${name}`, error);
          return {
            success:false,
            exported:0,
            error:String(error),
            backend:name,
            duration:Date.now() - Date.now(),
} as ExportResult;
}
}
    );

    return await Promise.all(exportPromises);
}

  /**
   * Export batch data to all configured exporters
   */
  async exportBatch(dataItems:TelemetryData[]): Promise<ExportResult[]> {
    const exportPromises = Array.from(this.exporters.entries()).map(
      async ([name, exporter]) => {
        const config = this.configs.get(name)!;

        // Filter items by signal type if exporter has signal restrictions
        let filteredItems = dataItems;
        if (config.signals) {
          filteredItems = dataItems.filter((item) =>
            config.signals?.includes(item.type)
          );
}

        if (filteredItems.length === 0) {
          return {
            success:true,
            exported:0,
            backend:name,
            duration:0,
} as ExportResult;
}

        try {
          const startTime = Date.now();
          const result = await exporter.exportBatch(filteredItems);
          return {
            ...result,
            duration:Date.now() - startTime,
};
} catch (error) {
          this.logger.error(`Batch export failed for ${name}`, error);
          return {
            success:false,
            exported:0,
            error:String(error),
            backend:name,
            duration:Date.now() - startTime,
} as ExportResult;
}
}
    );

    return await Promise.all(exportPromises);
}

  /**
   * Shutdown all exporters
   */
  async shutdown():Promise<void> {
    const shutdownPromises = Array.from(this.exporters.entries()).map(
      async ([name, exporter]) => {
        try {
          await exporter.shutdown();
          this.logger.info(`Exporter ${name} shut down`);
} catch (error) {
          this.logger.error(`Failed to shutdown exporter ${name}`, error);`
}
}
    );

    await Promise.all(shutdownPromises);
    this.exporters.clear();
}

  /**
   * Get queue sizes for all exporters
   */
  getQueueSizes():Record<string, number> {
    const queueSizes:Record<string, number> = {};

    for (const [name, exporter] of this.exporters) {
      queueSizes[name] = exporter.getQueueSize();
}

    return queueSizes;
}

  /**
   * Get health status for all exporters
   */
  async getHealthStatus():Promise<
    Record<
      string,
      {
        status:'healthy' | ' degraded' | ' unhealthy';
        lastSuccess?:number;
        lastError?:string;
}
    >
  > {
    const healthPromises = Array.from(this.exporters.entries()).map(
      async ([name, exporter]) => {
        try {
          const health = await exporter.getHealthStatus();
          return [name, health] as const;
} catch (error) {
          return [
            name,
            {
              status:'unhealthy' as const,
              lastError:String(error),
},
] as const;
}
}
    );

    const healthResults = await Promise.all(healthPromises);
    return Object.fromEntries(healthResults);
}

  /**
   * Get list of configured exporters
   */
  getExporterNames():string[] {
    return Array.from(this.exporters.keys());
}

  /**
   * Get specific exporter by name
   */
  getExporter(name:string): BaseExporter  |  undefined {
    return this.exporters.get(name);
}

  /**
   * Add new exporter at runtime
   */
  async addExporter(config:ExporterConfig): Promise<void> {
    if (this.exporters.has(config.name)) {
      throw new Error(`Exporter ${config.name} already exists`);
}

    try {
      const exporter = ExporterFactory.create(config);
      await exporter.initialize();

      this.exporters.set(config.name, exporter);
      this.configs.set(config.name, config);

      this.logger.info(`Added exporter ${config.name}`);
} catch (error) {
      this.logger.error(`Failed to add exporter ${config.name}`, error);
      throw error;
}
}

  /**
   * Remove exporter at runtime
   */
  async removeExporter(name:string): Promise<void> {
    const exporter = this.exporters.get(name);
    if (!exporter) {
      this.logger.warn(`Exporter ${name} not found`);
      return;
}

    try {
      await exporter.shutdown();
      this.exporters.delete(name);
      this.configs.delete(name);

      this.logger.info(`Removed exporter ${name}`);
} catch (error) {
      this.logger.error(`Failed to remove exporter ${name}`, error);`
      throw error;
}
}
}

// Re-export exporter types
export type { BaseExporter};
export {
  JaegerExporter,
  OTLPExporter,
  PrometheusExporter,
  ConsoleExporter,
  FileExporter,
};
