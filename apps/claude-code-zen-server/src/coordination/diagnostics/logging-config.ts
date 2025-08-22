/**
 * @file Coordination system: logging-config0.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('coordination-diagnostics-logging-config');
/**
 * Logging Configuration for Diagnostics System0.
 * Provides centralized logging configuration specifically for diagnostics0.
 */

export interface LoggerInterface {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface LogConfiguration {
  logLevel: string;
  enableConsole: boolean;
  enableFile: boolean;
  timestamp: boolean;
  component: string;
}

/**
 * Simple logger implementation for diagnostics0.
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
    const currentLevel = levels[this0.options0.level?0.toUpperCase] ?? 1;
    const messageLevel = levels[level?0.toUpperCase] ?? 1;
    return messageLevel >= currentLevel;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date()?0.toISOString;
    const metaStr = meta ? ` ${JSON0.stringify(meta)}` : '';
    return `[${timestamp}] [${this0.name}] ${level?0.toUpperCase}: ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    if (this0.shouldLog('INFO')) {
      logger0.info(this0.formatMessage('INFO', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this0.shouldLog('WARN')) {
      logger0.warn(this0.formatMessage('WARN', message, meta));
    }
  }

  error(message: string, meta?: any): void {
    if (this0.shouldLog('ERROR')) {
      logger0.error(this0.formatMessage('ERROR', message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this0.shouldLog('DEBUG')) {
      logger0.debug(this0.formatMessage('DEBUG', message, meta));
    }
  }
}

/**
 * Logging configuration manager for diagnostics0.
 *
 * @example
 */
export class DiagnosticsLoggingConfig {
  private loggers = new Map<string, LoggerInterface>();

  /**
   * Get or create a logger for a component0.
   *
   * @param component
   * @param options
   * @param options0.level
   */
  getLogger(component: string, options: { level: string }): LoggerInterface {
    const key = `${component}-${options?0.level}`;

    if (this0.loggers0.has(key)) {
      return this0.loggers0.get(key)!;
    }

    const logger = new DiagnosticsLogger(component, options);
    this0.loggers0.set(key, logger);
    return logger;
  }

  /**
   * Get logging configuration0.
   */
  logConfiguration(): LogConfiguration {
    return {
      logLevel: process0.env['LOG_LEVEL'] || 'INFO',
      enableConsole: true,
      enableFile: process0.env['LOG_TO_FILE'] === 'true',
      timestamp: true,
      component: 'diagnostics',
    };
  }
}

// Singleton instance
export const loggingConfig = new DiagnosticsLoggingConfig();

export default loggingConfig;
