/**
 * Utility Types
 * Type definitions for utility functions and system helpers
 */

import type { JSONObject } from './core.js';

// =============================================================================
// INTERACTIVE UTILITIES
// =============================================================================

/**
 * Environment type definitions
 */
export type EnvironmentType = 
  | 'non-tty-stdin'
  | 'non-tty-stdout'
  | 'ci-environment'
  | 'github-actions'
  | 'docker'
  | 'wsl'
  | 'windows'
  | 'vscode'
  | 'no-raw-mode'
  | 'interactive';

/**
 * Terminal capabilities interface
 */
export interface TerminalCapabilities {
  isTTY: boolean;
  hasRawMode: boolean;
  supportsColor: boolean;
  terminalProgram: string | undefined;
  environmentType: EnvironmentType;
  isInteractive: boolean;
}

/**
 * Interactive function type
 */
export type InteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = 
  (...args: TArgs) => Promise<TReturn>;

/**
 * Non-interactive function type
 */
export type NonInteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = 
  (...args: TArgs) => Promise<TReturn>;

// =============================================================================
// SECURITY UTILITIES
// =============================================================================

/**
 * Rate limiter configuration interface
 */
export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Security validation result
 */
export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// =============================================================================
// GITHUB CLI UTILITIES
// =============================================================================

/**
 * GitHub CLI execution options interface
 */
export interface GitHubCliOptions {
  timeout?: number;
  cwd?: string;
  input?: string | null;
}

/**
 * GitHub CLI command result interface
 */
export interface GitHubCliResult {
  success: boolean;
  stdout: string;
  stderr: string;
  code: number;
  timedOut?: boolean;
}

/**
 * GitHub Pull Request parameters interface
 */
export interface PullRequestParams {
  title: string;
  body?: string;
  base?: string;
  head?: string;
  draft?: boolean;
  repo?: string | null;
}

/**
 * GitHub Pull Request list options interface
 */
export interface PullRequestListOptions {
  state?: 'open' | 'closed' | 'merged' | 'all';
  limit?: number;
  repo?: string | null;
}

// =============================================================================
// TIMEOUT PROTECTION
// =============================================================================

/**
 * Interface for database store cleanup
 */
export interface DatabaseStore {
  close(): Promise<void>;
  forceClose?(): void;
}

/**
 * Interface for ruv-swarm hook result
 */
export interface RuvSwarmHookResult {
  success: boolean;
  error?: string;
  timedOut?: boolean;
  data?: JSONObject;
}

/**
 * Timeout operation result
 */
export interface TimeoutResult<T> {
  result?: T;
  timedOut: boolean;
  duration: number;
  error?: Error;
}

// =============================================================================
// LOGGER UTILITIES
// =============================================================================

/**
 * Log level definitions
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: JSONObject;
  error?: Error;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamp: boolean;
  enableContext: boolean;
  outputFile?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

// =============================================================================
// HEALTH MONITORING
// =============================================================================

/**
 * Health check status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Health check result
 */
export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  duration: number;
  timestamp: Date;
  details?: JSONObject;
}

/**
 * System health information
 */
export interface SystemHealth {
  overall: HealthStatus;
  checks: HealthCheckResult[];
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number[];
  };
}

// =============================================================================
// UTILITY FUNCTION TYPES
// =============================================================================

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Retry result
 */
export interface RetryResult<T> {
  result?: T;
  attempts: number;
  totalDuration: number;
  lastError?: Error;
  success: boolean;
}

/**
 * Debounce configuration
 */
export interface DebounceConfig {
  delay: number;
  immediate?: boolean;
  maxWait?: number;
}

/**
 * Throttle configuration
 */
export interface ThrottleConfig {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  cleanupInterval?: number;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

// =============================================================================
// FILE SYSTEM UTILITIES
// =============================================================================

/**
 * File operation options
 */
export interface FileOperationOptions {
  createDirs?: boolean;
  overwrite?: boolean;
  backup?: boolean;
  encoding?: BufferEncoding;
}

/**
 * File system entry information
 */
export interface FileSystemEntry {
  path: string;
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  created: Date;
  modified: Date;
  permissions: string;
}

/**
 * Directory listing options
 */
export interface DirectoryListOptions {
  recursive?: boolean;
  includeHidden?: boolean;
  filter?: (entry: FileSystemEntry) => boolean;
  maxDepth?: number;
}

// =============================================================================
// NETWORK UTILITIES
// =============================================================================

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | Buffer | JSONObject;
  timeout?: number;
  retries?: number;
  validateStatus?: (status: number) => boolean;
}

/**
 * HTTP response
 */
export interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  duration: number;
}

/**
 * URL validation result
 */
export interface URLValidationResult {
  isValid: boolean;
  protocol?: string;
  hostname?: string;
  port?: number;
  pathname?: string;
  isPrivate?: boolean;
  isLocalhost?: boolean;
}

// =============================================================================
// PROCESS UTILITIES
// =============================================================================

/**
 * Process execution options
 */
export interface ProcessExecutionOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  killSignal?: NodeJS.Signals;
  input?: string;
  captureOutput?: boolean;
}

/**
 * Process execution result
 */
export interface ProcessExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  signal?: NodeJS.Signals;
  timedOut: boolean;
}

/**
 * Process information
 */
export interface ProcessInfo {
  pid: number;
  ppid: number;
  name: string;
  command: string;
  arguments: string[];
  startTime: Date;
  cpuUsage: number;
  memoryUsage: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validation rule
 */
export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T) => boolean | string;
  message?: string;
}

/**
 * Validation schema
 */
export interface ValidationSchema<T = any> {
  [key: string]: ValidationRule<T>[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// =============================================================================
// GENERIC UTILITY TYPES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract function parameters as object type
 */
export type FunctionParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Extract function return type
 */
export type FunctionReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Create a type with only specific keys from T
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Create a type with all keys from T except specific keys
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Create a union type of all values in T
 */
export type ValueOf<T> = T[keyof T];

/**
 * Create a union type of all keys in T
 */
export type KeyOf<T> = keyof T;

/**
 * Conditional type for async functions
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Extract the awaited type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;