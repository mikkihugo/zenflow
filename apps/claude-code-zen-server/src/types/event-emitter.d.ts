/**
 * @file Event Emitter Types
 *
 * Type definitions for event emitters and error objects with proper typing
 * for properties like 'on', 'code', and other event-related functionality.
 */
import { EventEmitter } from 'eventemitter3';
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
export interface ServerInstance extends EventEmitter {
    close: (callback?: (err?: Error) => void) => void;
    listen: (port: number, callback?: () => void) => this;
    on: (event: string, listener: (...args: any[]) => void) => this;
    once: (event: string, listener: (...args: any[]) => void) => this;
    emit: (event: string, ...args: any[]) => boolean;
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
export declare function hasErrorCode(error: unknown): error is BaseError;
/**
 * Type guard to check if error is a system error
 */
export declare function isSystemError(error: unknown): error is SystemError;
/**
 * Type guard to check if error is a network error
 */
export declare function isNetworkError(error: unknown): error is NetworkError;
/**
 * Type guard to check if object has event emitter capabilities
 */
export declare function isEventEmitter(obj: unknown): obj is EventEmitter;
/**
 * Type guard for server instance
 */
export declare function isServerInstance(obj: unknown): obj is ServerInstance;
//# sourceMappingURL=event-emitter.d.ts.map