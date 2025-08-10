/**
 * @file Logger utility for Neural and Queen components
 * Enhanced logger with two-phase initialization to avoid circular dependencies.
 * @module Logger
 */

import { createBootstrapLogger, type ILogger } from './bootstrap-logger';

// Import logger utilities directly to avoid circular dependency
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LoggerConfig {
  prefix?: string;
  level?: LogLevel;
}

// Core logger interface for DI compatibility
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

/**
 * Enhanced logger that can be upgraded from bootstrap logger.
 *
 * @example
 */
class EnhancedLogger implements ILogger {
  private bootstrapLogger: ILogger;
  private configLoaded: boolean = false;
  
  constructor(prefix: string) {
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

const shouldLog = (messageLevel: LogLevel, configuredLevel: LogLevel = getLogLevel()): boolean => {
  const levels = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };
  return levels[messageLevel] >= levels[configuredLevel];
};

const formatLogMessage = (level: string, prefix: string, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()} ${prefix}: ${message}${metaStr}`;
};

// Enhanced logger implementation with proper level control
function simpleCreateLogger(config: Partial<LoggerConfig> | string = {}) {
  const configObj =
    typeof config === 'string'
      ? { prefix: config, level: getLogLevel() }
      : { level: getLogLevel(), ...config };
  const prefix = configObj?.prefix ? `[${configObj?.prefix}]` : '[claude-zen]';
  const logLevel = configObj?.level || getLogLevel();

  return {
    debug: (message: string, meta?: any) => {
      if (shouldLog(LogLevel.DEBUG, logLevel)) {
        logger.debug(formatLogMessage('DEBUG', prefix, message, meta));
      }
    },
    info: (message: string, meta?: any) => {
      if (shouldLog(LogLevel.INFO, logLevel)) {
        logger.info(formatLogMessage('INFO', prefix, message, meta));
      }
    },
    warn: (message: string, meta?: any) => {
      if (shouldLog(LogLevel.WARN, logLevel)) {
        logger.warn(formatLogMessage('WARN', prefix, message, meta));
      }
    },
    error: (message: string, meta?: any, error?: any) => {
      if (shouldLog(LogLevel.ERROR, logLevel)) {
        const errorDetails = error ? ` Error: ${error}` : '';
        logger.error(formatLogMessage('ERROR', prefix, message + errorDetails, meta));
      }
    },
  };
}

const createLogger = simpleCreateLogger;

// Export the createLogger function for use throughout the system
export { createLogger };

export interface LogMeta {
  timestamp?: string;
  level?: LogLevel;
  context?: string;
  [key: string]: any;
}

export class Logger implements ILogger {
  private coreLogger: ReturnType<typeof createLogger>;

  constructor(component?: string) {
    const config: Partial<LoggerConfig> = component ? { prefix: component } : {};
    this.coreLogger = createLogger(config);
  }

  info(message: string, meta?: LogMeta): void {
    this.coreLogger.info(message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.coreLogger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.coreLogger.error(message, meta || {}, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.coreLogger.debug(message, meta);
  }

  success(message: string, meta?: LogMeta): void {
    this.coreLogger.info(`✅ ${message}`, meta);
  }

  progress(message: string, meta?: LogMeta): void {
    this.coreLogger.info(`🔄 ${message}`, meta);
  }
}

// Export a default logger instance
export const defaultLogger = new Logger();

// Export types for convenience (LogLevel already exported above)
