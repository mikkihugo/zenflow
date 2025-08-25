/**
 * @fileoverview Centralized Logging Configuration for claude-code-zen
 *
 * Central logging foundation for the entire ecosystem. All libs and main system
 * use this shared logging configuration with ZEN_ environment variables.
 */


import { getLogger as getLogTapeLogger } from '@logtape/logtape';

import type { UnknownRecord } from '../../types/primitives';

/**
 * Logging severity levels for the foundation logging system.
 * Follows standard logging conventions from most verbose to least verbose.
 *
 * @example
 * ```typescript
 * const logger = getLogger('myapp');
 * logger.debug('Debug info'); // Only shown in development
 * logger.info('User action');  // General information
 * logger.warn('Deprecated API'); // Warnings
 * logger.error('Failed request'); // Errors
 * ```
 */
export enum LoggingLevel {
  /** Detailed trace information for debugging */
  TRACE = 'trace',
  /** Debug information useful during development */
  DEBUG = 'debug',
  /** General informational messages */
  INFO = 'info',
  /** Warning messages for potentially problematic situations */
  WARN = 'warning',
  /** Error messages for failure conditions */
  ERROR = 'error',
}

/**
 * Configuration for the foundation logging system.
 * Controls logging behavior, output formats, and component-specific settings.
 *
 * @example
 * ```typescript
 * const config: LoggingConfig = {
 *   level: LoggingLevel.INFO,
 *   enableConsole: true,
 *   enableFile: false,
 *   timestamp: true,
 *   format: 'text',
 *   components: {
 *     'database': LoggingLevel.DEBUG,
 *     'auth': LoggingLevel.WARN
 *   }
 * };
 * ```
 */
export interface LoggingConfig {
  /** Default logging level for all components */
  level: LoggingLevel;
  /** Whether to log to console */
  enableConsole: boolean;
  /** Whether to log to file */
  enableFile: boolean;
  /** Whether to include timestamps in log messages */
  timestamp: boolean;
  /** Log output format */
  format: 'json' | 'text';
  /** Component-specific logging levels */
  components: Record<string, LoggingLevel>;
}

/**
 * Logger interface providing structured logging methods.
 * Compatible with LogTape and provides optional success/progress methods.
 *
 * @example
 * ```typescript
 * const logger = getLogger('myservice');
 * logger.info('Service started', { port: 3000 });
 * logger.error('Database connection failed', { error: err.message });
 * logger.success?.('Operation completed successfully');
 * ```
 */
export interface Logger {
  /** Log trace level messages (most verbose) */
  trace(message: string, meta?: unknown): void;
  /** Log debug level messages */
  debug(message: string, meta?: unknown): void;
  /** Log informational messages */
  info(message: string, meta?: unknown): void;
  /** Log warning messages */
  warn(message: string, meta?: unknown): void;
  /** Log error messages */
  error(message: string, meta?: unknown): void;
  /** Optional success logging for positive outcomes */
  success?(message: string, meta?: unknown): void;
  /** Optional progress logging for long-running operations */
  progress?(message: string, meta?: unknown): void;
}

class LoggingConfigurationManager {
  private static instance: LoggingConfigurationManager;
  private config: LoggingConfig;
  private loggers: Map<string, Logger> = new Map();
  private initialized = false;

  private constructor() {
    this.config = this.loadConfiguration();
    // Initialize LogTape asynchronously - will be handled by getInstance
  }

  static getInstance(): LoggingConfigurationManager {
    if (!LoggingConfigurationManager.instance) {
      LoggingConfigurationManager.instance = new LoggingConfigurationManager();
      // Initialize LogTape asynchronously when needed
      LoggingConfigurationManager.instance
        .initializeLogTape()
        .catch((error) => {
          // Enhanced error handling for logging initialization
          console.error('LogTape initialization failed:', {
            error: error.message,
            timestamp: new Date().toISOString(),
            fallback: 'Console logging will be used',
          });
        });
    }
    return LoggingConfigurationManager.instance;
  }

  private loadConfiguration(): LoggingConfig {
    try {
      return this.createConfigFromEnvironment();
    } catch (error) {
      this.logFallbackWarning(error);
      return this.createConfigFromEnvironment();
    }
  }

  private createConfigFromEnvironment(): LoggingConfig {
    const defaultLevel = this.getDefaultLogLevel();
    const config = this.buildBaseConfig(defaultLevel);
    this.addComponentLevels(config);
    return config;
  }

  private getDefaultLogLevel(): LoggingLevel {
    const nodeEnv = process.env['NODE_ENV'] || 'development';
    return nodeEnv === 'development' ? LoggingLevel.DEBUG : LoggingLevel.INFO;
  }

  private buildBaseConfig(defaultLevel: LoggingLevel): LoggingConfig {
    const zenLogLevel = process.env['ZEN_LOG_LEVEL'] as LoggingLevel;
    const zenLogFormat = process.env['ZEN_LOG_FORMAT'] as 'json' | 'text';
    const zenLogConsole = process.env['ZEN_LOG_CONSOLE'];
    const zenLogFile = process.env['ZEN_LOG_FILE'];
    const zenLogTimestamp = process.env['ZEN_LOG_TIMESTAMP'];

    return {
      level: zenLogLevel || defaultLevel,
      enableConsole: zenLogConsole !== 'false',
      enableFile: zenLogFile === 'true',
      timestamp: zenLogTimestamp !== 'false',
      format: zenLogFormat || 'text',
      components: {},
    };
  }

  private addComponentLevels(config: LoggingConfig): void {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('ZEN_LOG_COMPONENT_')) {
        const component = key.replace('ZEN_LOG_COMPONENT_', '').toLowerCase();
        const level = process.env[key] as LoggingLevel;
        if (level && Object.values(LoggingLevel).includes(level)) {
          config.components[component] = level;
        }
      }
    }
  }

  private logFallbackWarning(error: unknown): void {
    console.warn('[LoggingConfig] Configuration fallback activated:', {
      reason: 'Central config failed',
      error: error instanceof Error ? error.message : String(error),
      fallback: 'Environment variables',
      timestamp: new Date().toISOString(),
    });
  }

  private async initializeLogTape(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Check if internal OTEL collector should be used
    let internalCollectorSink = null;
    let useInternalCollector = false;

    try {
      // Load OTEL settings directly from environment variables to avoid circular dependency
      const useInternalOtelCollector =
        process.env['ZEN_USE_INTERNAL_OTEL_COLLECTOR'] !== 'false';
      const zenOtelEnabled = process.env['ZEN_OTEL_ENABLED'] === 'true';
      const internalCollectorEndpoint =
        process.env['ZEN_INTERNAL_COLLECTOR_ENDPOINT']||'http://localhost:4318';

      if (useInternalOtelCollector && zenOtelEnabled) {
        // Check if OTEL endpoint is reachable (foundation should not depend on other packages)
        try {
          // Simple HTTP check for internal collector availability
          const response = await globalThis
            .fetch(`${internalCollectorEndpoint}/health`, {
              method: 'GET',
              headers: { Accept: 'application/json' },
            })
            .catch(() => null);

          if (response?.ok) {
            // Create a custom sink that sends to internal collector
            internalCollectorSink = this.createInternalCollectorSink(
              internalCollectorEndpoint,
            );
            useInternalCollector = true;

            // Enhanced initialization success logging
            console.log('[LogTape] System initialized successfully:', {
              collector: 'Internal OTEL collector',
              endpoint: internalCollectorEndpoint,
              status: 'active',
              timestamp: new Date().toISOString(),
            });
            console.log(
              `   Internal Collector: ${internalCollectorEndpoint}/ingest`,
            );
            console.log('   Service: claude-zen-foundation');
          } else {
            throw new Error('Internal OTEL collector not reachable');
          }
        } catch {
          console.log(
            '⚠️  Internal OTEL collector unavailable, trying external OTEL...',
          );

          // Fallback to external OTEL if internal collector fails
          const otelLogsExporter = process.env['OTEL_LOGS_EXPORTER'];

          if (otelLogsExporter === 'otlp'||zenOtelEnabled) {
            // OTEL integration moved to @claude-zen/infrastructure package
            console.log('⚠️  OTEL integration has been moved to @claude-zen/infrastructure package. Use getTelemetryManager() instead.',
            );
            console.log('   Foundation logging will use console-only mode.');
          }
        }
      }
    } catch {
      console.log(
        '📝 Foundation LogTape using console-only (OTEL unavailable)',
      );
      useInternalCollector = false;
    }

    // Configure LogTape with OTEL if available
    const { configure } = await import('@logtape/logtape');

    const sinkConfig: Record<string, (record: UnknownRecord) => void> = {
      // Console sink for local visibility
      console: (record: UnknownRecord) => {
        if (!this.config.enableConsole) {
          return;
        }

        const timestamp = this.config.timestamp
          ? `[${new Date(record['timestamp'] as string|number|Date).toISOString()}] `
          :'';
        const level = String(record['level']).toUpperCase().padStart(5);
        const category = Array.isArray(record['category'])
          ? record['category'].join('.')
          : String(record['category']||'unknown');
        const message = Array.isArray(record['message'])
          ? record['message'].join('')
          : String(record['message']||'');
        const properties = (record['properties']||{}) as UnknownRecord;
        const props =
          Object.keys(properties).length > 0
            ? ` ${JSON.stringify(properties)}`
            :'';

        console.log(`${timestamp}${level} [${category}] ${message}${props}`);
      },
    };

    // Add internal collector sink if available
    if (useInternalCollector && internalCollectorSink) {
      sinkConfig['collector'] = internalCollectorSink as (
        record: UnknownRecord
      ) => void;
    }

    await configure({
      sinks: sinkConfig as Record<string, any>,
      loggers: [
        // Foundation components with internal collector if available
        {
          category: ['foundation'],
          sinks: useInternalCollector ? ['console', 'collector'] : ['console'],
          lowestLevel: this.config.level,
        },
        {
          category: ['claude-code-sdk-integration'],
          sinks: useInternalCollector ? ['console', 'collector'] : ['console'],
          lowestLevel: this.config.level,
        },
        {
          category: ['SyslogBridge'],
          sinks: useInternalCollector ? ['console', 'collector'] : ['console'],
          lowestLevel: this.config.level,
        },

        // LogTape meta logs to console only
        {
          category: ['logtape', 'meta'],
          sinks: ['console'],
          lowestLevel: 'warning',
        },

        // Everything else
        {
          category: [],
          sinks: useInternalCollector ? ['console', 'collector'] : ['console'],
          lowestLevel: 'info',
        },
      ],
    });

    this.initialized = true;
  }

  /**
   * Create a custom sink that sends logs to the internal OTEL collector
   */
  private createInternalCollectorSink(collectorEndpoint: string) {
    return async (record: UnknownRecord) => {
      try {
        const timestamp = record['timestamp'];
        const level = String(record['level']||'info');
        const category = Array.isArray(record['category'])
          ? record['category']
          : [String(record['category']||'unknown')];
        const message = Array.isArray(record['message'])
          ? record['message']
          : [String(record['message']||'')];
        const properties = (record['properties']||{}) as UnknownRecord;

        // Convert LogTape record to our internal telemetry format
        const telemetryData = {
          timestamp,
          type:'logs' as const,
          service: {
            name: 'claude-zen-foundation',
            version: '1.0.0',
            instance: process.env['HOSTNAME']||'localhost',
          },
          data: {
            logs: [
              {
                timestamp,
                level: level.toLowerCase(),
                message: message.join(''),
                body: message.join(''),
                category: category.join('.'),
                properties,
                severity: this.mapLogLevelToSeverity(level),
              },
            ],
          },
          attributes: {
            'log.logger': category.join('.'),
            'log.level': level.toLowerCase(),
            'service.name': 'claude-zen-foundation',
            ...properties,
          },
        };

        // Send to internal collector via HTTP POST
        await globalThis
          .fetch(`${collectorEndpoint}/ingest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(telemetryData),
          })
          .catch((fetchError) => {
            // Silently ignore fetch errors to avoid logging loops
            console.debug(
              'Failed to send log to internal collector:',
              fetchError.message,
            );
          });
      } catch (error) {
        // Silently ignore errors to avoid logging loops
        console.debug('Internal collector sink error:', error);
      }
    };
  }

  /**
   * Map LogTape log levels to OpenTelemetry severity numbers
   */
  private mapLogLevelToSeverity(level: string): number {
    const severityMap: Record<string, number> = {
      trace: 1, // TRACE
      debug: 5, // DEBUG
      info: 9, // INFO
      warning: 13, // WARN
      error: 17, // ERROR
      critical: 21, // FATAL
    };
    return severityMap[level.toLowerCase()]||9;
  }

  getLogger(name: string): Logger {
    if (this.loggers.has(name)) {
      const logger = this.loggers.get(name);
      if (!logger) {
        throw new Error(`Logger'${name}'not found`);
      }
      return logger;
    }

    // Get component-specific log level if configured
    const componentLevel =
      this.config.components[name.toLowerCase()]||this.config.level;

    // Create LogTape logger
    const logTapeLogger = getLogTapeLogger(name);

    // Wrap with our interface and add extra methods
    const logger: Logger = {
      trace: (message: string, meta?: unknown) => {
        if (this.shouldLog('trace', componentLevel)) {
          logTapeLogger.debug(this.formatMessage(message, meta));
        }
      },
      debug: (message: string, meta?: unknown) => {
        if (this.shouldLog('debug', componentLevel)) {
          logTapeLogger.debug(this.formatMessage(message, meta));
        }
      },
      info: (message: string, meta?: unknown) => {
        if (this.shouldLog('info', componentLevel)) {
          logTapeLogger.info(this.formatMessage(message, meta));
        }
      },
      warn: (message: string, meta?: unknown) => {
        if (this.shouldLog('warning', componentLevel)) {
          logTapeLogger.warn(this.formatMessage(message, meta));
        }
      },
      error: (message: string, meta?: unknown) => {
        if (this.shouldLog('error', componentLevel)) {
          logTapeLogger.error(this.formatMessage(message, meta));
        }
      },
      success: (message: string, meta?: unknown) => {
        if (this.shouldLog('info', componentLevel)) {
          logTapeLogger.info(`✅ ${this.formatMessage(message, meta)}`);
        }
      },
      progress: (message: string, meta?: unknown) => {
        if (this.shouldLog('info', componentLevel)) {
          logTapeLogger.info(`🔄 ${this.formatMessage(message, meta)}`);
        }
      },
    };

    this.loggers.set(name, logger);
    return logger;
  }

  private shouldLog(
    messageLevel: string,
    componentLevel: LoggingLevel,
  ): boolean {
    const levels = ['trace', 'debug', 'info', 'warning', 'error'];
    const messageLevelIndex = levels.indexOf(messageLevel);
    const componentLevelIndex = levels.indexOf(componentLevel);
    return messageLevelIndex >= componentLevelIndex;
  }

  private formatMessage(message: string, meta?: unknown): string {
    if (!meta) {
      return message;
    }

    if (this.config.format === 'json') {
      return JSON.stringify({ message, meta });
    }

    if (typeof meta === 'object') {
      return `${message} ${JSON.stringify(meta)}`;
    }

    return `${message} ${meta}`;
  }

  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Reinitialize LogTape with new config
    this.initialized = false;
    this.initializeLogTape().catch(console.error);
    // Clear cached loggers to pick up new config
    this.loggers.clear();
  }

  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  // Environment validation helpers
  validateEnvironment(): {
    isValid: boolean;
    issues: string[];
    config: LoggingConfig;
    } {
    const issues: string[] = [];

    // Check if ZEN environment variables are properly set
    const zenVars = Object.keys(process.env).filter((key) =>
      key.startsWith('ZEN_LOG_'),
    );

    if (zenVars.length === 0) {
      issues.push('No ZEN_LOG_* environment variables found - using defaults');
    }

    // Validate log levels
    const invalidLevels = Object.entries(this.config.components)
      .filter(([, level]) => !Object.values(LoggingLevel).includes(level))
      .map(([component]) => component);

    if (invalidLevels.length > 0) {
      issues.push(
        `Invalid log levels for components: ${invalidLevels.join(', ')}`,
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
      config: this.getConfig(),
    };
  }
}

// Singleton instance
const loggingManager = LoggingConfigurationManager.getInstance();

/**
 * Get a logger instance for the specified component
 *
 * @param name Component name for the logger
 * @returns Logger instance configured with component-specific settings
 */
export function getLogger(name: string): Logger {
  return loggingManager.getLogger(name);
}

/**
 * Update global logging configuration
 *
 * @param config Partial configuration to update
 */
export function updateLoggingConfig(config: Partial<LoggingConfig>): void {
  loggingManager.updateConfig(config);
}

/**
 * Get current logging configuration
 *
 * @returns Current logging configuration
 */
export function getLoggingConfig(): LoggingConfig {
  return loggingManager.getConfig();
}

/**
 * Validate ZEN environment variables and logging setup
 *
 * @returns Validation result with issues and current config
 */
export function validateLoggingEnvironment(): {
  isValid: boolean;
  issues: string[];
  config: LoggingConfig;
  } {
  return loggingManager.validateEnvironment();
}

// Export types for external use (already exported above)
// =============================================================================
// LOGGING FORCING STRATEGY - No console.log or winston allowed!
// =============================================================================

/**
 * Force structured logging over console methods
 */
export const log = getLogger;
export const logger = getLogger;
export const createLogger = getLogger;

/**
 * Override console - force everyone to use structured logging
 */
export const console = {
  log: (...args: unknown[]) => getLogger('console').info(args.join(' ')),
  info: (...args: unknown[]) => getLogger('console').info(args.join(' ')),
  warn: (...args: unknown[]) => getLogger('console').warn(args.join(' ')),
  error: (...args: unknown[]) => getLogger('console').error(args.join(' ')),
  debug: (...args: unknown[]) => getLogger('console').debug(args.join(' ')),
};

// Default export - only the forcing names
export default {
  log: getLogger,
  logger: getLogger,
  createLogger: getLogger,
  console,
  getLoggingConfig,
  updateLoggingConfig,
  validateLoggingEnvironment,
  LoggingLevel,
};
