/**
 * Utility Types;
 * Type definitions for utility functions and system helpers;
 */

import type { JSONObject } from './core.js';
// =============================================================================
// INTERACTIVE UTILITIES
// =============================================================================

/**
 * Environment type definitions;
 */
export type EnvironmentType = 'non-tty-stdin';
| 'non-tty-stdout'
| 'ci-environment'
| 'github-actions'
| 'docker'
| 'wsl'
| 'windows'
| 'vscode'
| 'no-raw-mode'
| 'interactive'
/**
 * Terminal capabilities interface;
 */
export interface TerminalCapabilities {isTTY = any[]
, TReturn = any> =
(...args) => Promise<TReturn>
/**
 * Non-interactive function type;
 */
export type NonInteractiveFunction<_TArgs extends unknown[] = any[], _TReturn = any> = (
..args;
) => Promise<TReturn>
// =============================================================================
// SECURITY UTILITIES
// =============================================================================

/**
 * Rate limiter configuration interface;
 */
export interface RateLimiterConfig {maxRequests = ============================================================================
// GITHUB CLI UTILITIES
// =============================================================================

/**
 * GitHub CLI execution options interface;
 */
export interface GitHubCliOptions {
  timeout?: number;
  cwd?: string;
  input?: string | null;
// }
/**
 * GitHub CLI command result interface;
 */
export interface GitHubCliResult {success = ============================================================================
// TIMEOUT PROTECTION
// =============================================================================

/**
 * Interface for database store cleanup;
 */
export interface DatabaseStore {
  close(): Promise<void>;
  forceClose?(): void;
// }
/**
 * Interface for ruv-swarm hook result;
 */
export interface RuvSwarmHookResult {success = ============================================================================
// LOGGER UTILITIES
// =============================================================================

/**
 * Log level definitions;
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * Log entry interface;
 */
export interface LogEntry {level = ============================================================================
// HEALTH MONITORING
// =============================================================================

/**
 * Health check status;
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

/**
 * Health check result;
 */
export interface HealthCheckResult {name = ============================================================================
// UTILITY FUNCTION TYPES
// =============================================================================

/**
 * Retry configuration;
 */
export interface RetryConfig {maxAttempts = > boolean
// }
/**
 * Retry result;
 */
export interface RetryResult<_T> {
  result?: T;attempts = ============================================================================
// FILE SYSTEM UTILITIES
// =============================================================================

/**
 * File operation options;
 */
export interface FileOperationOptions {
  createDirs?: boolean;
  overwrite?: boolean;
  backup?: boolean;
  encoding?: BufferEncoding;
// }
/**
 * File system entry information;
 */
export interface FileSystemEntry {path = > boolean
maxDepth?: number;
// }
// =============================================================================
// NETWORK UTILITIES
// =============================================================================

/**
 * HTTP request options;
 */
export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | Buffer | JSONObject;
  timeout?: number;
  retries?: number;
  validateStatus?: (status = > boolean;
// }
/**
 * HTTP response;
 */
export interface HttpResponse<T = any> {status = ============================================================================
// PROCESS UTILITIES
// =============================================================================

/**
 * Process execution options;
 */
export interface ProcessExecutionOptions {
  cwd?) => any ? P = > any> = T extends (...args) => infer R ? R =
  [P in K]: T[P];

/**
 * Create a type with all keys from T except specific keys;
 */;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Create a union type of all values in T;
 */;
export type ValueOf<T> = T[keyof T];

/**
 * Create a union type of all keys in T;
 */;
export type KeyOf<T> = keyof T;

/**
 * Conditional type for async functions;
 */;
export type MaybePromise<T> = T | Promise<T>;

/**
 * Extract the awaited type from a Promise;
 */;
export type Awaited<T> = T extends Promise<infer U> ? U : T;
