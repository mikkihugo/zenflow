/**
 * @fileoverview Configuration System
 *
 * Provides configuration management for the internal OTEL collector.
 * Supports default configurations, environment overrides, and validation.
 */

import { existsSync, readFileSync} from 'node:fs';
import { resolve} from 'node:path';

import type { Logger} from '@claude-zen/foundation';
import { getLogger} from '@claude-zen/foundation';

import type {
  CollectorConfig,
  ExporterConfig,
} from '../types.js';

/**
 * Configuration manager for OTEL collector
 */
export class ConfigManager {
  private logger:Logger;
  private config:CollectorConfig | null = null;

  constructor() {
    this.logger = getLogger('ConfigManager');
}

  /**
   * Load configuration from various sources
   */
  loadConfig(configPath?:string): CollectorConfig {
    if (this.config) {
      return this.config;
}

    try {
      // Start with default configuration
      let config = this.getDefaultConfig();

      // Load from file if provided
      if (configPath) {
        const fileConfig = this.loadConfigFromFile(configPath);
        config = this.mergeConfigs(config, fileConfig);
} else {
        // Try to load from common locations
        const commonPaths = [
          'otel-collector.json',          'otel-collector.config.js',          '.otel/collector.json',          process.env['OTEL_COLLECTOR_CONFIG'],
].filter(Boolean);

        for (const path of commonPaths) {
          if (path && existsSync(path)) {
            const fileConfig = this.loadConfigFromFile(path);
            config = this.mergeConfigs(config, fileConfig);
            this.logger.info(`Loaded configuration from ${path}`);
            break;
}
}
}

      // Apply environment overrides
      config = this.applyEnvironmentOverrides(config);

      // Validate configuration
      this.validateConfig(config);

      this.config = config;
      this.logger.info('Configuration loaded successfully',{
        exporters: config.exporters?.length || 0,
        processors: config.processors?.length || 0,
        httpPort: config.httpPort,
      });

      return config;
} catch (error) {
      this.logger.error('Failed to load configuration', error);
      throw error;
}
}

  /**
   * Get current configuration
   */
  getConfig():CollectorConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
}
    return this.config;
}

  /**
   * Reload configuration
   */
  reloadConfig(configPath?:string): CollectorConfig {
    this.config = null;
    return this.loadConfig(configPath);
}

  /**
   * Get default configuration
   */
  private getDefaultConfig():CollectorConfig {
    return {
      serviceName: 'claude-zen-otel-collector',
      httpPort: parseInt(process.env['OTEL_COLLECTOR_PORT'] || '4318'),
      grpcPort: parseInt(process.env['OTEL_COLLECTOR_GRPC_PORT'] || '4317'),
      signals: {
        traces: true,
        metrics: true,
        logs: true,
      },
      processors:[
        {
          name: 'batch',          type: 'batch',          enabled:true,
          config:{
            maxBatchSize:100,
            batchTimeout:5000,
            flushOnShutdown:true,
},
},
        {
          name: 'filter',          type: 'filter',          enabled:true,
          config:{
            mode: 'exclude',            exclude:[
              {
                field: 'attributes.internal',                operator: 'equals',                value:true,
},
],
},
},
        {
          name: 'transform',          type: 'transform',          enabled:true,
          config:{
            addAttributes:{
              'collector.name': ' claude-zen-otel-collector',              'collector.version': '1.0.0',},
},
},
],
      exporters:[
        {
          name: 'console',
          type: 'console',
          enabled: process.env['NODE_ENV'] === 'development',
          signals: ['traces', 'metrics', 'logs'],
          config: {},
        },
        {
          name: 'file',          type: 'file',          enabled:true,
          signals:['traces',    'metrics',    'logs'],
          config:{
            filePath: './telemetry-data',            format: 'jsonl',            maxFileSize:50 * 1024 * 1024, // 50MB
            rotationInterval:3600000, // 1 hour
            compression:true,
            maxFiles:10,
},
        },
      ],
      batching: {
        maxBatchSize: 100,
        batchTimeout: 5000,
        maxQueueSize: 1000,
      },
      buffering: {
        maxMemoryMiB: 100,
        maxDiskMiB: 500,
        flushInterval: 5000,
      },
    };
  }

  /**
   * Load configuration from file
   */
  private loadConfigFromFile(configPath:string): Partial<CollectorConfig> {
    const resolvedPath = resolve(configPath);

    if (!existsSync(resolvedPath)) {
      throw new Error(`Configuration file not found:${resolvedPath}`);
}

    try {
      if (configPath.endsWith('.json')) {
        const content = readFileSync(resolvedPath, 'utf-8');
        return JSON.parse(content);
} else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
        // Dynamic import for JS config files
        delete require.cache[resolvedPath];
        const config = require(resolvedPath);
        return config.default || config;
} else {
        throw new Error(`Unsupported configuration file format:${configPath}`);
}
} catch (error) {
      this.logger.error(
        `Failed to parse configuration file:${configPath}`,
        error
      );
      throw error;
}
}

  /**
   * Merge configurations with deep merge
   */
  private mergeConfigs(
    base: CollectorConfig,
    override: Partial<CollectorConfig>
  ): CollectorConfig {
    const merged = { ...base };

    for (const [key, value] of Object.entries(override)) {
      if (value === undefined || value === null) {
        continue;
      }

      const typedKey = key as keyof CollectorConfig;
      if (typeof value === 'object' && !Array.isArray(value) && merged[typedKey] && typeof merged[typedKey] === 'object') {
        (merged as any)[typedKey] = { ...merged[typedKey], ...value };
      } else {
        (merged as any)[typedKey] = value;
      }
    }

    return merged;
  }

  /**
   * Apply environment variable overrides
   */
  private applyEnvironmentOverrides(config: CollectorConfig): CollectorConfig {
    const envOverrides: Partial<CollectorConfig> = {};

    // HTTP settings
    if (process.env['OTEL_COLLECTOR_PORT']) {
      envOverrides.httpPort = parseInt(process.env['OTEL_COLLECTOR_PORT'], 10);
    }

    if (process.env['OTEL_COLLECTOR_GRPC_PORT']) {
      envOverrides.grpcPort = parseInt(process.env['OTEL_COLLECTOR_GRPC_PORT'], 10);
    }

    // Add environment-specific exporters
    if (process.env['OTEL_COLLECTOR_JAEGER_ENDPOINT']) {
      const jaegerExporter: ExporterConfig = {
        name: 'jaeger',
        type: 'jaeger',
        enabled: true,
        signals: ['traces'],
        endpoint: process.env['OTEL_COLLECTOR_JAEGER_ENDPOINT'],
        config: {
          maxQueueSize: 1000,
          batchTimeout: 5000,
          maxBatchSize: 100,
        },
      };

      envOverrides.exporters = [...(config.exporters || []), jaegerExporter];
    }

    if (process.env['OTEL_COLLECTOR_OTLP_ENDPOINT']) {
      const otlpExporter: ExporterConfig = {
        name: 'otlp',
        type: 'otlp-http',
        enabled: true,
        signals: ['traces', 'metrics', 'logs'],
        endpoint: process.env['OTEL_COLLECTOR_OTLP_ENDPOINT'],
        config: {
          maxQueueSize: 1000,
          batchTimeout: 5000,
          maxBatchSize: 100,
        },
      };

      envOverrides.exporters = [
        ...(envOverrides.exporters || config.exporters || []),
        otlpExporter,
      ];
    }

    if (process.env['OTEL_COLLECTOR_PROMETHEUS_PORT']) {
      const prometheusExporter: ExporterConfig = {
        name: 'prometheus',
        type: 'prometheus',
        enabled: true,
        signals: ['metrics'],
        config: {
          port: parseInt(process.env['OTEL_COLLECTOR_PROMETHEUS_PORT'], 10),
          metricsPath: '/metrics',
        },
      };

      envOverrides.exporters = [
        ...(envOverrides.exporters || config.exporters || []),
        prometheusExporter,
      ];
    }

    return this.mergeConfigs(config, envOverrides);
}

  /**
   * Validate configuration
   */
  private validateConfig(config: CollectorConfig): void {
    // Validate basic structure
    if (!config.serviceName) {
      throw new Error('Configuration missing serviceName');
    }

    if (!config.httpPort || config.httpPort < 1 || config.httpPort > 65535) {
      throw new Error('Configuration invalid httpPort');
    }

    // Validate exporters
    if (!Array.isArray(config.exporters) || config.exporters.length === 0) {
      throw new Error('Configuration must have at least one exporter');
    }

    const enabledExporters = config.exporters.filter((e) => e.enabled);
    if (enabledExporters.length === 0) {
      throw new Error('Configuration must have at least one enabled exporter');
}

    // Validate exporter names are unique
    const exporterNames = config.exporters.map((e) => e.name);
    const uniqueNames = new Set(exporterNames);
    if (exporterNames.length !== uniqueNames.size) {
      throw new Error('Configuration exporter names must be unique');
}

    // Validate processors
    if (Array.isArray(config.processors)) {
      const processorNames = config.processors.map((p) => p.name);
      const uniqueProcessorNames = new Set(processorNames);
      if (processorNames.length !== uniqueProcessorNames.size) {
        throw new Error('Configuration processor names must be unique');
}
}

    // Validate queue settings
    if (config.queue?.maxSize  && config.queue.maxSize < 1) {
      throw new Error('Configuration queue.maxSize must be positive');
}

    this.logger.debug('Configuration validation passed', {
      exporters:enabledExporters.length,
      processors:config.processors?.length   ||   0,
});
}
}

/**
 * Create and configure a default config manager instance
 */
export const configManager = new ConfigManager();

/**
 * Load default configuration
 */
export function _loadDefaultConfig():CollectorConfig {
  return configManager.loadConfig();
}

/**
 * Create a minimal development configuration
 */
export function _createDevelopmentConfig():CollectorConfig {
  const config = new ConfigManager();
  const devConfig = config.getDefaultConfig();

  // Enable console exporter for development
  const consoleExporter = devConfig.exporters.find((e) => e.name === 'console');
  if (consoleExporter) {
    consoleExporter.enabled = true;
}

  // Disable file exporter for development
  const fileExporter = devConfig.exporters.find((e) => e.name === 'file');
  if (fileExporter) {
    fileExporter.enabled = false;
}

  // Reduce batch sizes for faster feedback
  const batchProcessor = devConfig.processors.find((p) => p.name === 'batch');
  if (batchProcessor?.config) {
    batchProcessor.config.maxBatchSize = 10;
    batchProcessor.config.batchTimeout = 1000;
}

  return devConfig;
}

/**
 * Create a production configuration
 */
export function _createProductionConfig():CollectorConfig {
  const config = new ConfigManager();
  const prodConfig = config.getDefaultConfig();

  // Disable console exporter for production
  const consoleExporter = prodConfig.exporters.find(
    (e) => e.name === 'console'
  );
  if (consoleExporter) {
    consoleExporter.enabled = false;
}

  // Enable file exporter for production
  const fileExporter = prodConfig.exporters.find((e) => e.name === 'file');
  if (fileExporter) {
    fileExporter.enabled = true;
}

  // Increase batch sizes for efficiency
  const batchProcessor = prodConfig.processors.find((p) => p.name === 'batch');
  if (batchProcessor?.config) {
    batchProcessor.config.maxBatchSize = 500;
    batchProcessor.config.batchTimeout = 10000;
}

  return prodConfig;
}
