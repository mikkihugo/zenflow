/**
 * @fileoverview Foundation Package - Main Implementation Exports
 * 
 * Central export point for all Foundation system implementations.
 * This file consolidates all the individual system exports into a single entry point.
 */

// =============================================================================
// LOGGING SYSTEM - Professional logging with @logtape/logtape + syslog bridge
// =============================================================================
export * from './logging';
export * from './syslog-bridge';

// =============================================================================
// TELEMETRY SYSTEM - Moved to @claude-zen/infrastructure package
// =============================================================================
// Note: Telemetry exports have been moved to @claude-zen/infrastructure

// =============================================================================
// SYSTEM METRICS ONLY - Basic metrics for foundation use
// =============================================================================
export * from './monitoring/system-metrics';

// =============================================================================
// CONFIGURATION SYSTEM - Schema validation with convict + dotenv
// =============================================================================
// Config is at root level, not moved to src

// =============================================================================
// LLM PROVIDER - High-level LLM abstraction layer
// =============================================================================
export * from './llm-provider';

// =============================================================================
// CLAUDE SDK - Raw Claude Code CLI/SDK bindings
// =============================================================================
export * from './claude-sdk';

// =============================================================================
// STORAGE SYSTEM - Moved to @claude-zen/infrastructure package
// =============================================================================
// Note: Storage exports have been moved to @claude-zen/infrastructure

// =============================================================================
// DEPENDENCY INJECTION - TSyringe DI container and decorators
// =============================================================================
export * from './di';

// =============================================================================
// ERROR HANDLING - Result patterns with neverthrow + p-retry + opossum
// =============================================================================
export * from './error-handling';

// =============================================================================
// PROJECT & MONOREPO DETECTION
// =============================================================================
export * from './monorepo-detector';
export * from './project-manager';

// =============================================================================
// TEST UTIL
// =============================================================================
export * from './test-util';

// =============================================================================
// FOUNDATION TYPES - Shared primitives, patterns, and error handling
// =============================================================================
// NOTE: Import from ./types/index specifically to avoid conflicts with existing error-handling.ts
// Use: import type { ... } from '@claude-zen/foundation/types' for foundation types
// Use: import { ... } from '@claude-zen/foundation/error-handling' for neverthrow utilities

// Export foundation types separately to avoid Result type conflict
export type {
  ID,
  UUID,
  Timestamp,
  Status,
  Priority,
  Timestamped,
  Identifiable,
  Entity,
  Paginated,
  PaginationOptions,
  AsyncOperationResult,
  QueryCriteria,
  AuditEntry
} from './types';

// Export Result types with different names to avoid conflicts with neverthrow Result
export type {
  SuccessResult as FoundationSuccessResult,
  ErrorResult as FoundationErrorResult,
  Result as FoundationResult
} from './types';