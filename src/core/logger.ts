/**
 * @file Logger utility - Fixed circular dependency version
 * Enhanced logger with two-phase initialization to avoid circular dependencies.
 * @module Logger
 */

import { createBootstrapLogger, type ILogger, LogLevel as BootstrapLogLevel } from './bootstrap-logger';

// Re-export for compatibility
export { LogLevel } from './bootstrap-logger';
export type { ILogger } from './bootstrap-logger';

export interface LoggerConfig {
  prefix?: string;
  level?: BootstrapLogLevel;
}

/**
 * Enhanced logger that can be upgraded from bootstrap logger.
 *
 * @example
 */
class EnhancedLogger implements ILogger {
  private bootstrapLogger: ILogger;
  private configLoaded: boolean = false;
  private prefix: string;
  
  constructor(prefix: string) {
    this.prefix = prefix;
    this.bootstrapLogger = createBootstrapLogger(prefix);
  }

  /**
   * Upgrade logger with config (called after config system is ready).
   *
   * @param config
   */
  upgradeWithConfig(config: any): void {
    try {
      // This will be called AFTER config system is fully loaded
      const centralConfig = config?.getAll?.();
      if (centralConfig) {
        this.configLoaded = true;
        // Enhanced logging behavior can be implemented here
      }
    } catch (error) {
      // Keep using bootstrap logger if config fails
      this.bootstrapLogger.error('Failed to upgrade logger with config', error);
    }
  }

  debug(message: string, meta?: any): void {
    this.bootstrapLogger.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    this.bootstrapLogger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.bootstrapLogger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.bootstrapLogger.error(message, meta);
  }
}

// Registry for enhanced loggers that can be upgraded later
const loggerRegistry = new Map<string, EnhancedLogger>();

/**
 * Create or get an enhanced logger for a component.
 *
 * @example
 */
export class Logger extends EnhancedLogger {
  constructor(prefix: string = 'system') {
    super(prefix);
    loggerRegistry.set(prefix, this);
  }
}

/**
 * Upgrade all loggers with config system (called after config is loaded).
 *
 * @param config
 * @example
 */
export function upgradeAllLoggersWithConfig(config: any): void {
  for (const logger of loggerRegistry.values()) {
    logger.upgradeWithConfig(config);
  }
}

/**
 * Factory function to create a logger instance.
 * Uses bootstrap logger initially, can be upgraded later with config.
 *
 * @param prefix Component prefix for log messages.
 * @returns Logger instance.
 * @example
 */
export function createLogger(prefix: string = 'system'): ILogger {
  return new Logger(prefix);
}