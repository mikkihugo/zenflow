/**
 * @fileoverview Foundation Package - Main Implementation Exports
 * 
 * Central export point for all Foundation system implementations.
 * This file consolidates all the individual system exports into a single entry point.
 */

// =============================================================================
// LOGGING SYSTEM - Professional logging with @logtape/logtape
// =============================================================================
export * from './logging';

// =============================================================================
// TELEMETRY & MONITORING SYSTEM - OpenTelemetry + Prometheus + comprehensive monitoring
// =============================================================================
export * from './telemetry';
export * from './telemetry-integration';

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
// STORAGE SYSTEM - Database abstraction (SQLite, LanceDB, Kuzu)
// =============================================================================
export * from './storage';

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