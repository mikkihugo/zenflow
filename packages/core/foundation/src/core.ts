/**
 * @fileoverview Core Foundation Systems Entry Point
 *
 * Essential core utilities:logging, configuration, lifecycle management.
 * Import this for basic foundation functionality without heavy dependencies.
 */

export type { Config } from './config/index.js';
// =============================================================================
// CORE CONFIGURATION SYSTEM
// =============================================================================
export {
  configHelpers,
  getConfig,
  getEnv,
  isDebugMode,
  isDevelopment,
  isProduction,
  isTest,
  reloadConfig,
  requireEnv,
  shouldLog,
  validateConfig,
} from './config';
export type { Logger, LoggingConfig } from './core/logging/index.js';
// =============================================================================
// CORE LOGGING SYSTEM
// =============================================================================
export {
  getLogger,
  getLoggingConfig,
  LoggingLevel,
  updateLoggingConfig,
  validateLoggingEnvironment,
} from './core/logging';

// =============================================================================
// CORE TYPES - Essential primitives only
// =============================================================================
export type {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  Priority,
  Status,
  Timestamp,
  UnknownRecord,
  UUID,
} from './types/primitives';
