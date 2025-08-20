/**
 * @fileoverview Foundation Package - Core Utilities and Infrastructure
 * 
 * Core foundation utilities for the claude-code-zen ecosystem including
 * logging, dependency injection, error handling, and telemetry.
 */

// Export logging
export * from './logging';

// Export dependency injection
export * from './di';

// Export error handling
export * from './error-handling';

// Export telemetry
export * from './telemetry';

// Export other utilities
export * from './storage';
export * from './monorepo-detector';
export * from './claude-sdk';
export * from './llm-provider';
export * from './prompt-validation';
export * from './syslog-bridge';

// Export types selectively to avoid conflicts
export type { 
  BaseError,
  ErrorMetadata
} from './types/errors';

// Export error enums for direct access (matching expected imports)
export { 
  ErrorSeverity,
  ErrorCategory 
} from './types/errors';