/**
 * @file Logger utility for Neural and Queen components
 * Simple wrapper around the core logger for component-specific logging
 * @module Logger
 */

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

// Simple logger implementation to avoid circular imports
function simpleCreateLogger(config: Partial<LoggerConfig> | string = {}) {
  const configObj = typeof config === 'string' ? { prefix: config } : config;
  const prefix = configObj.prefix ? `[${configObj.prefix}]` : '';

  return {
    info: (_message: string, _meta?: any) => {},
    warn: (message: string, meta?: any) => console.warn(`${prefix} ${message}`, meta || ''),
    error: (message: string, meta?: any, error?: any) =>
      console.error(`${prefix} ${message}`, meta || '', error || ''),
    debug: (_message: string, _meta?: any) => {},
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
export const logger = new Logger();

// Export types for convenience (LogLevel already exported above)
