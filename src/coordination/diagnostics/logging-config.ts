/**
 * @file Coordination system: logging-config.
 */

import { getLogger } from '../../config/logging-config.ts';

const logger = getLogger('coordination-diagnostics-logging-config');
/**
 * Logging Configuration for Diagnostics System.
 * Provides centralized logging configuration specifically for diagnostics.
 */

export interface LoggerInterface {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
}

export interface LogConfiguration {
  logLevel: string;
  enableConsole: boolean;
  enableFile: boolean;
  timestamp: boolean;
  component: string;
}

/**
 * Simple logger implementation for diagnostics.
 *
 * @example
 */
class DiagnosticsLogger implements LoggerInterface {
  constructor(
    private name: string,
    private options: { level: string }
  ) {}

  private shouldLog(level: string): boolean {
    const levels: Record<string, number> = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
    const currentLevel = levels[this.options.level.toUpperCase()] ?? 1;
    const messageLevel = levels[level.toUpperCase()] ?? 1;
    return messageLevel >= currentLevel;
  }

  private formatMessage(level: string, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${this.name}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldLog('INFO')) {
      logger.info(this.formatMessage('INFO', message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldLog('WARN')) {
      logger.warn(this.formatMessage('WARN', message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (this.shouldLog('ERROR')) {
      logger.error(this.formatMessage('ERROR', message, meta));
    }
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldLog('DEBUG')) {
      logger.debug(this.formatMessage('DEBUG', message, meta));
    }
  }
}

/**
 * Logging configuration manager for diagnostics.
 *
 * @example
 */
export class DiagnosticsLoggingConfig {
  private loggers = new Map<string, LoggerInterface>();

  /**
   * Get or create a logger for a component.
   *
   * @param component
   * @param options
   * @param options.level
   */
  getLogger(component: string, options: { level: string }): LoggerInterface {
    const key = `${component}-${options?.level}`;

    if (this.loggers.has(key)) {
      return this.loggers.get(key)!;
    }

    const logger = new DiagnosticsLogger(component, options);
    this.loggers.set(key, logger);
    return logger;
  }

  /**
   * Get logging configuration.
   */
  logConfiguration(): LogConfiguration {
    return {
      logLevel: process.env['LOG_LEVEL'] || 'INFO',
      enableConsole: true,
      enableFile: process.env['LOG_TO_FILE'] === 'true',
      timestamp: true,
      component: 'diagnostics',
    };
  }
}

// Singleton instance
export const loggingConfig = new DiagnosticsLoggingConfig();

export default loggingConfig;
