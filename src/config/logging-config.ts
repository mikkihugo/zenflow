/**
 * @file Centralized Logging Configuration
 * Provides unified logging configuration and factory methods for the entire application.
 */

import { getLogger as getLogTapeLogger } from '@logtape/logtape';
import type { ILogger } from '../core/bootstrap-logger.ts';

export enum LoggingLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LoggingConfig {
  level: LoggingLevel;
  enableConsole: boolean;
  enableFile: boolean;
  timestamp: boolean;
  format: 'json' | 'text';
  components: Record<string, LoggingLevel>;
}

export interface Logger extends ILogger {
  success?(message: string, meta?: unknown): void;
  progress?(message: string, meta?: unknown): void;
}

class LoggingConfigurationManager {
  private static instance: LoggingConfigurationManager;
  private config: LoggingConfig;
  private loggers: Map<string, Logger> = new Map();

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): LoggingConfigurationManager {
    if (!LoggingConfigurationManager.instance) {
      LoggingConfigurationManager.instance = new LoggingConfigurationManager();
    }
    return LoggingConfigurationManager.instance;
  }

  private loadConfiguration(): LoggingConfig {
    // Load from environment variables with sensible defaults
    const nodeEnv = process.env['NODE_ENV'] || 'development';
    const defaultLevel =
      nodeEnv === 'development' ? LoggingLevel.DEBUG : LoggingLevel.INFO;

    return {
      level: (process.env['LOG_LEVEL'] as LoggingLevel) || defaultLevel,
      enableConsole: process.env['LOG_DISABLE_CONSOLE'] !== 'true',
      enableFile: process.env['LOG_ENABLE_FILE'] === 'true',
      timestamp: process.env['LOG_DISABLE_TIMESTAMP'] !== 'true',
      format: (process.env['LOG_FORMAT'] as 'json' | 'text') || 'text',
      components: {
        // Override levels for specific components
        'swarm-coordinator':
          (process.env['LOG_LEVEL_SWARM'] as LoggingLevel) || defaultLevel,
        'neural-network':
          (process.env['LOG_LEVEL_NEURAL'] as LoggingLevel) || defaultLevel,
        'mcp-server':
          (process.env['LOG_LEVEL_MCP'] as LoggingLevel) || defaultLevel,
        database: (process.env['LOG_LEVEL_DB'] as LoggingLevel) || defaultLevel,
      },
    };
  }

  /**
   * Get logging configuration.
   */
  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  /**
   * Update logging configuration.
   *
   * @param updates
   */
  updateConfig(updates: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...updates };
    // Clear cached loggers to force recreation with new config
    this.loggers.clear();
  }

  /**
   * Create or get cached logger for a component.
   *
   * @param component
   */
  getLogger(component: string): Logger {
    if (this.loggers.has(component)) {
      return this.loggers.get(component)!;
    }

    const logger = this.createLoggerForComponent(component);
    this.loggers.set(component, logger);
    return logger;
  }

  private createLoggerForComponent(component: string): Logger {
    // Use component-specific log level if configured
    const componentLevel =
      this.config.components[component] || this.config.level;

    // Set environment variable for the component so existing loggers pick it up
    const originalLevel = process.env['LOG_LEVEL'];
    process.env['LOG_LEVEL'] = componentLevel;

    try {
      // Create logger using logtape (no circular deps since we import directly)
      const coreLogger = getLogTapeLogger(component);

      // Enhance with additional methods compatible with existing interfaces
      const enhancedLogger: Logger = {
        debug: (message: string, meta?: unknown) =>
          coreLogger.debug(message, meta),
        info: (message: string, meta?: unknown) =>
          coreLogger.info(message, meta),
        warn: (message: string, meta?: unknown) =>
          coreLogger.warn(message, meta),
        error: (message: string, meta?: unknown) =>
          coreLogger.error(message, meta),
      };

      // Add success and progress methods
      enhancedLogger.success = (message: string, meta?: unknown) => {
        coreLogger.info(`✅ ${message}`, meta);
      };

      enhancedLogger.progress = (message: string, meta?: unknown) => {
        coreLogger.info(`🔄 ${message}`, meta);
      };

      return enhancedLogger;
    } finally {
      // Restore original log level
      if (originalLevel !== undefined) {
        process.env['LOG_LEVEL'] = originalLevel;
      } else {
        process.env['LOG_LEVEL'] = undefined;
      }
    }
  }

  /**
   * Create logger specifically for console.log replacement
   * This creates a logger optimized for CLI output and user-facing messages.
   *
   * @param component
   */
  createConsoleReplacementLogger(component: string): Logger {
    const logger = this.getLogger(component);

    return {
      debug: (message: string, meta?: unknown) => logger.debug(message, meta),
      // For console.log replacement, use info level
      info: (message: string, meta?: unknown) => logger.info(message, meta),
      warn: (message: string, meta?: unknown) => logger.warn(message, meta),
      error: (message: string, meta?: unknown) => logger.error(message, meta),
      success:
        logger.success ||
        ((message: string, meta?: unknown) => logger.info(message, meta)),
      progress:
        logger.progress ||
        ((message: string, meta?: unknown) => logger.info(message, meta)),
    };
  }

  /**
   * Enable debug logging for development.
   */
  enableDebugMode(): void {
    this.updateConfig({
      level: LoggingLevel.DEBUG,
      components: Object.fromEntries(
        Object.keys(this.config.components).map((key) => [
          key,
          LoggingLevel.DEBUG,
        ])
      ),
    });
  }

  /**
   * Set production logging (INFO and above).
   */
  setProductionMode(): void {
    this.updateConfig({
      level: LoggingLevel.INFO,
      components: Object.fromEntries(
        Object.keys(this.config.components).map((key) => [
          key,
          LoggingLevel.INFO,
        ])
      ),
    });
  }

  /**
   * Silence all logging except errors.
   */
  setSilentMode(): void {
    this.updateConfig({
      level: LoggingLevel.ERROR,
      components: Object.fromEntries(
        Object.keys(this.config.components).map((key) => [
          key,
          LoggingLevel.ERROR,
        ])
      ),
    });
  }
}

// Export singleton instance
export const loggingConfigManager = LoggingConfigurationManager.getInstance();

/**
 * Convenience function to get a logger for a component.
 *
 * @param component
 * @example
 */
export function getLogger(component: string): Logger {
  return loggingConfigManager?.getLogger(component);
}

/**
 * Convenience function for console.log replacement.
 *
 * @param component
 * @example
 */
export function getConsoleReplacementLogger(component: string): Logger {
  return loggingConfigManager?.createConsoleReplacementLogger(component);
}

/**
 * Convenience functions for common logging needs.
 */
export const logger = {
  // Default system logger
  system: getLogger('system'),
  // CLI output logger
  cli: getConsoleReplacementLogger('cli'),
  // Swarm coordination logger
  swarm: getLogger('swarm-coordinator'),
  // Neural network logger
  neural: getLogger('neural-network'),
  // MCP server logger
  mcp: getLogger('mcp-server'),
  // Database logger
  database: getLogger('database'),
};

// Simple in-memory log storage for TUI display
const logEntries: unknown[] = [];

/**
 * Add log entry for TUI display
 */
export function addLogEntry(entry: {
  level: 'debug' | 'info' | 'warn' | 'error' | 'trace';
  component: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  logEntries.push({
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    ...entry,
  });

  // Keep only last 1000 entries
  if (logEntries.length > 1000) {
    logEntries.splice(0, logEntries.length - 1000);
  }
}

/**
 * Get log entries for TUI display
 */
export function getLogEntries() {
  return [...logEntries];
}

// Add some system startup logs
addLogEntry({
  level: 'info',
  component: 'system',
  message: 'Claude Code Zen TUI initialized',
});

addLogEntry({
  level: 'info',
  component: 'terminal',
  message: 'Terminal interface ready',
});

export default loggingConfigManager;
