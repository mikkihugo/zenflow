/**
 * @file Utility logger implementation
 * Provides simple logging functionality for the application.
 */

import { getLogger } from '../config/logging-config';

const logger = getLogger('src-utils-logger');

import { config } from '../config/config';

// Local Logger interface - matches Logger from core/logger for compatibility
export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

// Helper function to sanitize log meta data
function sanitizeLogMeta(meta: unknown): unknown {
  if (typeof meta === 'string') {
    // Remove newlines and carriage returns
    return meta.replace(/[\n\r]/g, '');
  }
  if (typeof meta === 'object' && meta !== null) {
    // Recursively sanitize all string properties
    const sanitized: unknown = Array.isArray(meta) ? [] : {};
    for (const key in meta) {
      if (Object.hasOwn(meta, key)) {
        const value = meta[key];
        if (typeof value === 'string') {
          sanitized[key] = value.replace(/[\n\r]/g, '');
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeLogMeta(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  }
  return meta;
}

// Log level enumeration
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Configuration from centralized config system
const getLogLevel = (): LogLevel => {
  try {
    const centralConfig = config?.getAll();
    const configLevel = centralConfig?.core?.logger?.level.toUpperCase();
    // Fallback for development environment
    const level =
      centralConfig?.environment?.isDevelopment && configLevel === 'INFO'
        ? 'DEBUG'
        : configLevel;
    return (
      (Object.values(LogLevel).find(
        (l) => l.toUpperCase() === level
      ) as LogLevel) || LogLevel.INFO
    );
  } catch (error) {
    // Fallback to INFO if config is not available
    return LogLevel.INFO;
  }
};

const shouldLog = (
  messageLevel: LogLevel,
  configuredLevel: LogLevel = getLogLevel()
): boolean => {
  const levels = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };
  return levels[messageLevel] >= levels[configuredLevel];
};

class Logger implements Logger {
  private logLevel: LogLevel;

  constructor(private prefix: string = '') {
    this.logLevel = getLogLevel();
  }

  private formatMessage(
    level: string,
    message: string,
    meta?: unknown
  ): string {
    const timestamp = new Date().toISOString();
    const cleanMeta = sanitizeLogMeta(meta);
    const metaStr =
      cleanMeta && Object.keys(cleanMeta).length > 0
        ? ` ${JSON.stringify(cleanMeta)}`
        : '';
    return `[${timestamp}] ${level.toUpperCase()} [${this.prefix || 'claude-zen'}]: ${message}${metaStr}`;
  }

  debug(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.DEBUG, this.logLevel)) {
      logger.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.INFO, this.logLevel)) {
      logger.info(this.formatMessage('INFO', message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.WARN, this.logLevel)) {
      logger.warn(this.formatMessage('WARN', message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.ERROR, this.logLevel)) {
      logger.error(this.formatMessage('ERROR', message, meta));
    }
  }
}

export function createUtilsLogger(prefix?: string): Logger {
  return new Logger(prefix);
}

export const defaultLogger = createUtilsLogger('claude-zen');
