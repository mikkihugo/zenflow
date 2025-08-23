/**
 * @file Logger type definitions
 * Core logging interface types for the system
 */

/**
 * Basic logger interface that all logger implementations must follow
 */
export interface Logger {
  /** * Log debug message * @param message - Debug message * @param meta - Optional metadata */ debug(message: string,
  meta?: any): void;
  /** * Log info message * @param message - Info message * @param meta - Optional metadata */ info(message: string,
  meta?: any): void;
  /** * Log warning message * @param message - Warning message * @param meta - Optional metadata */ warn(message: string,
  meta?: any): void;
  /** * Log error message * @param message - Error message * @param meta - Optional metadata */ error(message: string,
  meta?: any): void

}
