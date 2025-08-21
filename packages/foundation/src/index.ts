/**
 * @fileoverview Foundation Package - Core Utilities + CLI Tools
 * 
 * Foundation utilities for the claude-code-zen ecosystem including:
 * - Logging infrastructure
 * - Dependency injection container  
 * - Error handling patterns
 * - Basic types
 * - CLI tool integrations (Claude Code, etc.)
 * - Generic LLM provider with pluggable backends
 * 
 * Includes CLI abstraction layer for multiple CLI tools.
 */

// Export core logging (always needed)
export * from './logging';

// Export dependency injection (needed for proper architecture)
export * from './di';

// Export DI functions for backward compatibility
export { getGlobalContainer as getDI, createContainer, injectable } from './di';

// Export battle-tested ServiceContainer and registry adapters
export * from './di/service-container';
export * from './di/registry-adapter';

// Export full Awilix capabilities (performance-optimized) - 392% faster at scale
export * from './di/awilix-container';
export * from './di/enhanced-registries';

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

// Export CLI tools architecture - Simple pluggable providers
export * from './cli-tools';
export * from './types/cli-providers';

// Export enhanced LLM provider with pluggable CLI backends
export * from './llm-provider';
export { getGlobalLLM, setGlobalLLM, getClaudeLLM, getGeminiLLM, getCursorLLM } from './llm-provider';

// Convenience aliases for better naming
export { getClaudeLLM as createClaudeProvider } from './llm-provider';
export { getGeminiLLM as createGeminiProvider } from './llm-provider';  
export { getCursorLLM as createCursorProvider } from './llm-provider';

// Export facade status management
export * from './facade-status-manager';
export * from './system-capability-data-provider';

// Re-export common types
export type UUID = string;
export type Timestamp = string;