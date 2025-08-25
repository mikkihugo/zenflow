/**
 * @fileoverview Core Foundation Systems Entry Point
 *
 * Essential core utilities: logging, configuration, lifecycle management.
 * Import this for basic foundation functionality without heavy dependencies.
 */

// =============================================================================
// CORE LOGGING SYSTEM
// =============================================================================
export {
  getLogger,
  updateLoggingConfig,
  getLoggingConfig,
  validateLoggingEnvironment,
  LoggingLevel,
} from './core/logging';
export type { Logger, LoggingConfig } from './core/logging';

// =============================================================================
// CORE CONFIGURATION SYSTEM
// =============================================================================
export {
  getConfig,
  reloadConfig,
  validateConfig,
  configHelpers,
  isDebugMode,
  isDevelopment,
  isProduction,
  isTest,
  getEnv,
  requireEnv,
  shouldLog,
} from './core/config';
export type { Config } from './core/config';

// =============================================================================
// CORE TYPES - Essential primitives only
// =============================================================================
export type {
  UUID,
  Timestamp,
  Priority,
  Status,
  JsonValue,
  JsonObject,
  JsonArray,
  JsonPrimitive,
  UnknownRecord,
} from './types/primitives';