import { getLogger } from "../config/logging-config";
const logger = getLogger("src-utils-logger");
/**
 * @fileoverview Utility logger implementation
 * Provides simple logging functionality for the application
 */

import { config } from '../config';

// Local Logger interface - matches ILogger from core/logger for compatibility
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

// Helper function to sanitize log meta data
function sanitizeLogMeta(meta: any): any {
  if (typeof meta === 'string') {
    // Remove newlines and carriage returns
    return meta.replace(/[\n\r]/g, '');
  } else if (typeof meta === 'object' && meta !== null) {
    // Recursively sanitize all string properties
    const sanitized: any = Array.isArray(meta) ? [] : {};
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
    const centralConfig = config?.["getAll"]();
    const configLevel = centralConfig?.core?.logger?.level?.toUpperCase();
    // Fallback for development environment
    const level = centralConfig?.environment?.isDevelopment && configLevel === 'INFO' ? 'DEBUG' : configLevel;
    return Object.values(LogLevel).find(l => l.toUpperCase() === level) as LogLevel || LogLevel["INFO"];
  } catch (error) {
    // Fallback to INFO if config is not available
    return LogLevel["INFO"];
  }
};

const shouldLog = (messageLevel: LogLevel, configuredLevel: LogLevel = getLogLevel()): boolean => {
  const levels = { [LogLevel["DEBUG"]]: 0, [LogLevel["INFO"]]: 1, [LogLevel["WARN"]]: 2, [LogLevel["ERROR"]]: 3 };
  return levels[messageLevel] >= levels[configuredLevel];
};

class Logger implements ILogger {
  private logLevel: LogLevel;
  
  constructor(private prefix: string = '') {
    this.logLevel = getLogLevel();
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const cleanMeta = sanitizeLogMeta(meta);
    const metaStr = cleanMeta && Object.keys(cleanMeta).length > 0 ? ` ${JSON.stringify(cleanMeta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()} [${this.prefix || 'claude-zen'}]: ${message}${metaStr}`;
  }

  debug(message: string, meta?: any): void {
    if (shouldLog(LogLevel["DEBUG"], this.logLevel)) {
      logger.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (shouldLog(LogLevel["INFO"], this.logLevel)) {
      logger.info(this.formatMessage('INFO', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (shouldLog(LogLevel["WARN"], this.logLevel)) {
      logger.warn(this.formatMessage('WARN', message, meta));
    }
  }

  error(message: string, meta?: any): void {
    if (shouldLog(LogLevel["ERROR"], this.logLevel)) {
      logger.error(this.formatMessage('ERROR', message, meta));
    }
  }
}

export function createLogger(prefix?: string): ILogger {
  return new Logger(prefix);
}

export const defaultLogger = createLogger('claude-zen');