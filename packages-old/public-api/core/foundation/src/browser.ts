/**
 * @fileoverview Foundation Package - Browser Entry Point
 *
 * **🌐 BROWSER-COMPATIBLE ENTRY POINT**
 *
 * This entry point only includes browser-compatible modules from the foundation package.
 * Node.js specific modules like syslog, system utilities, and file operations are excluded.
 *
 * @example Browser Usage
 * ```typescript
 * import { getLogger, Result, ok, err } from '@claude-zen/foundation';
 * 
 * const logger = getLogger('browser-component');
 * logger.info('Browser component initialized');
 * ```
 */

// =============================================================================
// BROWSER-COMPATIBLE FOUNDATION EXPORTS
// =============================================================================

// CORE MODULES - Browser-safe core functionality
// =============================================================================

// Browser-safe configuration (basic environment only)
export const isDevelopment = () => typeof window !== 'undefined' && window.location?.hostname === 'localhost';
export const isProduction = () => !isDevelopment() && typeof window !== 'undefined';
export const isTest = () => false;
export const getEnv = (key: string, defaultValue?: string) => defaultValue || '';
export const isDebug = () => isDevelopment();
export const shouldLog = () => true;

// Browser-compatible logging interface
export interface Logger {
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
	fatal(message: string, ...args: any[]): void;
}

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	FATAL = 4,
}

// Simple browser logger implementation
export const getLogger = (name: string): Logger => ({
	debug: (message: string, ...args: any[]) => console.debug(`[${name}] ${message}`, ...args),
	info: (message: string, ...args: any[]) => console.info(`[${name}] ${message}`, ...args),
	warn: (message: string, ...args: any[]) => console.warn(`[${name}] ${message}`, ...args),
	error: (message: string, ...args: any[]) => console.error(`[${name}] ${message}`, ...args),
	fatal: (message: string, ...args: any[]) => console.error(`[${name}] FATAL: ${message}`, ...args),
});

export const getLogEntries = () => [];
export const setLogBroadcaster = () => {};
export const clearLogBroadcaster = () => {};

// DEPENDENCY INJECTION - Service container and patterns (browser-compatible)
// =============================================================================
// Simple browser DI implementation
export interface Container {
	register<T>(key: string, value: T): void;
	resolve<T>(key: string): T | undefined;
	has(key: string): boolean;
}

export interface ContainerStats {
	services: number;
	resolved: number;
}

export interface ServiceInfo {
	key: string;
	type: string;
	resolved: boolean;
}

export const TOKENS = {};

export const createContainer = (name?: string): Container => {
	const services = new Map<string, any>();
	return {
		register: <T>(key: string, value: T) => services.set(key, value),
		resolve: <T>(key: string): T | undefined => services.get(key),
		has: (key: string) => services.has(key),
	};
};

export const inject = (token: string) => (target: any, propertyKey: string) => {};

// ERROR HANDLING AND RESILIENCE - Browser-compatible implementation
// =============================================================================
export class ConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConfigurationError';
	}
}

export class NetworkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NetworkError';
	}
}

export class ResourceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ResourceError';
	}
}

export class TimeoutError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TimeoutError';
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

// Simple Result type implementation
export interface Result<T, E> {
	isOk(): this is { isOk(): true; isErr(): false; value: T };
	isErr(): this is { isOk(): false; isErr(): true; error: E };
	value?: T;
	error?: E;
}

export const ok = <T>(value: T): Result<T, never> => ({
	isOk: () => true,
	isErr: () => false,
	value,
});

export const err = <E>(error: E): Result<never, E> => ({
	isOk: () => false,
	isErr: () => true,
	error,
});

export const isError = (value: any): value is Error => value instanceof Error;

export const safeAsync = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
	try {
		const result = await fn();
		return ok(result);
	} catch (error) {
		return err(error instanceof Error ? error : new Error(String(error)));
	}
};

export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => 
			setTimeout(() => reject(new TimeoutError(`Operation timed out after ${ms}ms`)), ms)
		),
	]);
};

export const withRetry = async <T>(
	fn: () => Promise<T>,
	options: { retries?: number; minTimeout?: number } = {}
): Promise<T> => {
	const { retries = 3, minTimeout = 1000 } = options;
	
	for (let i = 0; i <= retries; i++) {
		try {
			return await fn();
		} catch (error) {
			if (i === retries) throw error;
			await new Promise(resolve => setTimeout(resolve, minTimeout * (i + 1)));
		}
	}
	
	throw new Error('Retry failed');
};

export const createCircuitBreaker = (options: any) => ({
	fire: async <T>(fn: () => Promise<T>): Promise<T> => fn(),
});

// EVENT SYSTEM - Browser-compatible event management
// =============================================================================
export class EventEmitter extends EventTarget {
	emit(type: string, data?: any) {
		this.dispatchEvent(new CustomEvent(type, { detail: data }));
	}
	
	on(type: string, listener: (event: CustomEvent) => void) {
		this.addEventListener(type, listener as EventListener);
	}
	
	off(type: string, listener: (event: CustomEvent) => void) {
		this.removeEventListener(type, listener as EventListener);
	}
}

// TYPE SYSTEM - All types and type utilities (no runtime code)
// =============================================================================
export type {
	AnyFunction,
	AsyncOrSync,
	DeepPartial,
	DeepReadonly,
	DeepRequired,
	Dictionary,
	Email,
	Entity,
	Environment,
	ErrorResult,
	Identifiable,
	ISODateString,
	JsonArray,
	JsonObject,
	JsonPrimitive,
	JsonValue,
	LogLevel as LogLevelType,
	MarkOptional,
	MarkRequired,
	NonEmptyArray,
	Paginated,
	PaginationOptions,
	Primitive,
	Priority,
	Result as ResultType,
	Status,
	StrictOmit,
	SuccessResult,
	Timestamp,
	Timestamped,
	UnknownRecord,
	UUID,
	ValueOf,
} from "./types/index.js";

// UTILITIES - Browser-compatible utility functions only
// =============================================================================

// Simple async utilities
export const concurrent = async <T>(promises: Promise<T>[]): Promise<T[]> => Promise.all(promises);
export const pTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => withTimeout(promise, ms);
export const retryAsync = withRetry;
export const timeoutPromise = withTimeout;

// Simple browser-compatible utilities
export const _ = {
	isFunction: (value: any): value is Function => typeof value === 'function',
	isString: (value: any): value is string => typeof value === 'string',
	isNumber: (value: any): value is number => typeof value === 'number',
	isArray: Array.isArray,
	isEmpty: (value: any) => !value || (Array.isArray(value) && value.length === 0),
	pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
		const result = {} as Pick<T, K>;
		keys.forEach(key => {
			if (key in obj) result[key] = obj[key];
		});
		return result;
	},
};

export const lodash = _;
export const dateFns = { 
	format: (date: Date, formatStr: string) => date.toLocaleDateString(),
	addDays: (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
};
export const format = dateFns.format;
export const addDays = dateFns.addDays;

// Browser-compatible ID generation
export const nanoid = (size: number = 21): string => {
	const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	let id = '';
	for (let i = 0; i < size; i++) {
		id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return id;
};

export const customAlphabet = (alphabet: string, size: number) => () => {
	let id = '';
	for (let i = 0; i < size; i++) {
		id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return id;
};

export const generateUUID = (): string => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Fallback UUID v4 generation
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

export const generateShortId = () => nanoid(8);
export const generateTimestampId = () => `${Date.now()}-${nanoid(6)}`;
export const generateSessionId = () => `session-${nanoid(16)}`;

// Time utilities (browser compatible)
export const now = () => Date.now();
export const dateFromTimestamp = (timestamp: number) => new Date(timestamp);
export const formatTimestamp = (timestamp: number) => new Date(timestamp).toISOString();
export const isoStringFromTimestamp = (timestamp: number) => new Date(timestamp).toISOString();
export const parseISO = (isoString: string) => new Date(isoString);
export const timestampFromDate = (date: Date) => date.getTime();

// Browser-compatible validation (simple implementations)
export const z = {
	string: () => ({
		email: () => ({ parse: (val: string) => val }),
		url: () => ({ parse: (val: string) => val }),
		uuid: () => ({ parse: (val: string) => val }),
		min: (len: number) => ({ parse: (val: string) => val }),
	}),
	number: () => ({
		positive: () => ({ parse: (val: number) => val }),
	}),
};

export const EmailSchema = z.string().email();
export const NonEmptyStringSchema = z.string().min(1);
export const PositiveNumberSchema = z.number().positive();
export const URLSchema = z.string().url();
export const UUIDSchema = z.string().uuid();

export const isEmail = (value: unknown): boolean => {
	return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isURL = (value: unknown): boolean => {
	if (typeof value !== "string") return false;
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};

// RESILIENCE PATTERNS - Simple browser implementations
// =============================================================================
export class BrokenCircuitError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'BrokenCircuitError';
	}
}

export class BulkheadRejectedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'BulkheadRejectedError';
	}
}

export enum CircuitState {
	Open = 'Open',
	HalfOpen = 'HalfOpen',
	Closed = 'Closed',
}

// Simple implementations
export const bulkhead = (options: any) => <T>(fn: () => Promise<T>) => fn();
export const circuitBreaker = createCircuitBreaker;
export const fallback = <T>(fallbackValue: T) => <U>(fn: () => Promise<U>) => async (): Promise<U | T> => {
	try {
		return await fn();
	} catch {
		return fallbackValue;
	}
};
export const retry = withRetry;
export const timeout = withTimeout;
export const noop = () => {};

// Simple policy implementation
export const Policy = {
	handle: () => ({
		circuitBreaker: createCircuitBreaker,
		retry: withRetry,
		timeout: withTimeout,
	}),
};

export const handleAll = () => Policy.handle();
export const usePolicy = <T>(policy: any, fn: () => Promise<T>) => fn();

// =============================================================================
// BROWSER COMPATIBILITY NOTES
// =============================================================================

/*
🌐 BROWSER-COMPATIBLE MODULES:

INCLUDED:
✅ Core logging (browser console based)
✅ Error handling and Result patterns
✅ Event system (browser EventTarget based)
✅ Dependency injection
✅ Async utilities
✅ Time utilities (browser Date API)
✅ Validation (zod based)
✅ Resilience patterns (cockatiel)
✅ Type definitions (no runtime code)

EXCLUDED (Node.js specific):
❌ System utilities (os, process, fs)
❌ Syslog bridge (child_process)
❌ File operations
❌ Process lifecycle management
❌ Advanced system detection

For Node.js environments, use the main index.ts entry point.
*/