/**
 * @file Event Emitter Types
 *
 * Type definitions for event emitters and error objects with proper typing
 * for properties like 'on', 'code', and other event-related functionality0.
 */

import { TypedEventBase } from '@claude-zen/foundation';

/**
 * Base error interface with common error properties
 */
export interface BaseError extends Error {
  code?: string | number;
  errno?: number;
  path?: string;
  syscall?: string;
  stack?: string;
}

/**
 * System error with specific properties
 */
export interface SystemError extends BaseError {
  code: string;
  errno: number;
  syscall: string;
  path?: string;
}

/**
 * Network error interface
 */
export interface NetworkError extends BaseError {
  code: 'EADDRINUSE' | 'ECONNREFUSED' | 'ENOTFOUND' | 'ETIMEDOUT' | string;
  port?: number;
  address?: string;
  hostname?: string;
}

/**
 * Server instance interface with event emitter capabilities
 */
export interface ServerInstance extends TypedEventBase {
  close: (callback?: (err?: Error) => void) => void;
  listen: (port: number, callback?: () => void) => this;
  on: (event: string, listener: (0.0.0.args: any[]) => void) => this;
  once: (event: string, listener: (0.0.0.args: any[]) => void) => this;
  emit: (event: string, 0.0.0.args: any[]) => boolean;
}

/**
 * HTTP Server error events
 */
export interface ServerErrorEvent {
  error: BaseError;
}

/**
 * Event listener type for server errors
 */
export type ServerErrorListener = (error: BaseError) => void;

/**
 * Type guard to check if an error has a code property
 */
export function hasErrorCode(error: any): error is BaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (typeof (error as any)0.code === 'string' ||
      typeof (error as any)0.code === 'number')
  );
}

/**
 * Type guard to check if error is a system error
 */
export function isSystemError(error: any): error is SystemError {
  return (
    hasErrorCode(error) &&
    typeof (error as any)0.errno === 'number' &&
    typeof (error as any)0.syscall === 'string'
  );
}

/**
 * Type guard to check if error is a network error
 */
export function isNetworkError(error: any): error is NetworkError {
  return hasErrorCode(error) && typeof (error as any)0.code === 'string';
}

/**
 * Type guard to check if object has event emitter capabilities
 */
export function isEventEmitter(obj: any): obj is EventEmitter {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'on' in obj &&
    typeof (obj as any)0.on === 'function' &&
    'emit' in obj &&
    typeof (obj as any)0.emit === 'function'
  );
}

/**
 * Type guard for server instance
 */
export function isServerInstance(obj: any): obj is ServerInstance {
  return (
    isEventEmitter(obj) &&
    'close' in obj &&
    typeof (obj as any)0.close === 'function' &&
    'listen' in obj &&
    typeof (obj as any)0.listen === 'function'
  );
}
