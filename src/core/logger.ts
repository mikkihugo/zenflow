import { getLogger } from "../config/logging-config";
const logger = getLogger("src-core-logger");
/**
 * @file Logger utility for Neural and Queen components
 * Simple wrapper around the core logger for component-specific logging
 * @module Logger
 */

import { config } from '../config';

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

// Configuration from centralized config system
const getLogLevel = (): LogLevel => {
  try {
    const centralConfig = config.getAll();
    const configLevel = centralConfig.core.logger.level.toUpperCase();
    // Fallback for development environment
    const level = centralConfig.environment.isDevelopment && configLevel === 'INFO' ? 'DEBUG' : configLevel;
    return Object.values(LogLevel).find(l => l.toUpperCase() === level) as LogLevel || LogLevel.INFO;
  } catch (error) {
    // Fallback to INFO if config is not available
    return LogLevel.INFO;
  }
};

const shouldLog = (messageLevel: LogLevel, configuredLevel: LogLevel = getLogLevel()): boolean => {
  const levels = { [LogLevel.DEBUG]: 0, [LogLevel.INFO]: 1, [LogLevel.WARN]: 2, [LogLevel.ERROR]: 3 };
  return levels[messageLevel] >= levels[configuredLevel];
};

const formatLogMessage = (level: string, prefix: string, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()} ${prefix}: ${message}${metaStr}`;
};

// Enhanced logger implementation with proper level control
function simpleCreateLogger(config: Partial<LoggerConfig> | string = {}) {
  const configObj = typeof config === 'string' ? { prefix: config, level: getLogLevel() } : { level: getLogLevel(), ...config };
  const prefix = configObj.prefix ? `[${configObj.prefix}]` : '[claude-zen]';
  const logLevel = configObj.level || getLogLevel();

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
