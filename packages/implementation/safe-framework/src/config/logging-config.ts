/**
 * @fileoverview Logging Configuration for SAFe Framework
 *
 * Provides standardized logging configuration for all SAFe Framework components.
 * Integrates with @claude-zen/foundation logging infrastructure.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import type { Logger } from '@claude-zen/foundation';

/**
 * Logger interface for SAFe Framework components
 */
export interface SafeLogger extends Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: any, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Create a standardized logger for SAFe Framework components
 * @param componentName - Name of the component requesting the logger
 * @returns SafeLogger instance
 */
export function getLogger(componentName: string): SafeLogger {
  return {
    info: (message: string, ...args: any[]) => {
      console.info(`[${componentName}] ${message}`, ...args);`
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${componentName}] ${message}`, ...args);`
    },
    error: (message: string, error?: any, ...args: any[]) => {
      if (error instanceof Error) {
        console.error(
          `[${componentName}] ${message}`,`
          error.message,
          error.stack,
          ...args
        );
      } else if (error) {
        console.error(`[${componentName}] ${message}`, error, ...args);`
      } else {
        console.error(`[${componentName}] ${message}`, ...args);`
      }
    },
    debug: (message: string, ...args: any[]) => {
      console.debug(`[${componentName}] ${message}`, ...args);`
    },
  };
}

/**
 * Default logger configuration for SAFe Framework
 */
export const defaultLoggerConfig = {
  level: 'info' as const,
  format: 'json' as const,
  timestamp: true,
  colorize: false,
  component: 'safe-framework',
};
