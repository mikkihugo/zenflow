/**
 * @fileoverview Foundation Package - Pure Core Utilities Only
 * 
 * Foundation utilities for the claude-code-zen ecosystem including ONLY:
 * - Logging infrastructure
 * - Dependency injection container  
 * - Error handling patterns
 * - Basic types
 * 
 * NO BUSINESS LOGIC - Only pure utility functions.
 */

// Export core logging (always needed)
export * from './logging';

// Export dependency injection (needed for proper architecture)
export * from './di';

// Export DI functions for backward compatibility
export { getGlobalContainer as getDI, createContainer, injectable } from './di';

// Export error handling functions explicitly to avoid Result conflicts
export {
  safe,
  safeAsync,
  withRetry,
  withTimeout,
  withContext,
  ensureError,
  AbortError
} from './error-handling';

// Export neverthrow Result types explicitly
export { Result, ok, err, ResultAsync, okAsync, errAsync } from 'neverthrow';

// Basic environment utilities (truly foundational)
export * from './environment-detection';

// Export error types selectively to avoid conflicts
export type { 
  BaseError,
  ErrorMetadata
} from './types/errors';

// Export error enums for direct access (matching expected imports)
export { 
  ErrorSeverity,
  ErrorCategory 
} from './types/errors';

// Export foundation types
export type * from './types/index';

// ARCHITECTURAL CLEANUP: Telemetry → Operations, Database → Infrastructure
// Foundation exports ONLY core utilities, logging, DI, error handling

export class ErrorAggregator {
  private errors: Error[] = [];
  
  addError(error: Error | unknown): void {
    if (error instanceof Error) {
      this.errors.push(error);
    } else if (typeof error === 'string') {
      this.errors.push(new Error(error));
    } else {
      this.errors.push(new Error(String(error)));
    }
  }
  
  getErrors(): Error[] {
    return [...this.errors];
  }
  
  clearErrors(): void {
    this.errors = [];
  }
}

// REMOVED: Telemetry functions belong in operations packages

// REMOVED: Utilities like generateUUID, createTimestamp, validateObject should come from strategic facades

export class ContextError extends Error {
  public readonly context?: Record<string, unknown>;
  public override readonly cause?: Error;

  constructor(message: string, context?: Record<string, unknown>, cause?: Error) {
    super(message);
    this.name = 'ContextError';
    this.context = context;
    this.cause = cause;
    
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ContextError.prototype);
  }
  
  override toString(): string {
    return `${this.name}: ${this.message}`;
  }
}

export function createContextError(message: string, context?: any): ContextError {
  return new ContextError(message, context);
}

export function createErrorAggregator(): ErrorAggregator {
  return new ErrorAggregator();
}

// REMOVED: Circuit breakers belong in operations packages
// REMOVED: Database access belongs in infrastructure packages

// Re-export common types
export type UUID = string;
export type Timestamp = string;