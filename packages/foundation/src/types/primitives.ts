/**
 * @fileoverview Foundation Types - Basic Primitives
 *
 * Shared primitive types that form the foundation for all packages in the monorepo.
 * These are the most basic, universally applicable types that any package can safely import.
 *
 * SCOPE: Only fundamental types that have NO domain-specific knowledge
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @example
 * ```typescript
 * import type { ID, UUID, Timestamp, Priority } from '@claude-zen/foundation/types';
 *
 * interface Task {
 *   id: ID;
 *   userId: UUID;
 *   createdAt: Timestamp;
 *   priority: Priority;
 * }
 * ```
 */

// =============================================================================
// BASIC IDENTIFIERS - Universal ID types
// =============================================================================

/**
 * Generic identifier type - can be string, number, or symbol
 * Use this for any kind of ID where the specific format doesn't matter
 */
export type ID = string | number | symbol;

/**
 * String-based identifier - most common case for database IDs, UUIDs, etc.
 */
export type StringID = string;

/**
 * Numeric identifier - for auto-incrementing database IDs, array indices, etc.
 */
export type NumericID = number;

/**
 * UUID v4 identifier - RFC 4122 compliant UUID string
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export type UUID = string & { readonly __brand: 'UUID' };

/**
 * Timestamp in milliseconds since Unix epoch
 * Compatible with Date.now() and new Date(timestamp)
 */
export type Timestamp = number & { readonly __brand: 'Timestamp' };

/**
 * ISO 8601 date string
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ
 */
export type ISODateString = string & { readonly __brand: 'ISODateString' };

// =============================================================================
// COMMON ENUMS - Shared enumeration types
// =============================================================================

/**
 * Universal priority levels used across all systems
 */
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

/**
 * Universal status enumeration for any stateful entity
 */
export enum Status {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  SKIPPED = 'skipped',
}

/**
 * Log levels compatible with industry standards (RFC 5424)
 */
export enum LogLevel {
  EMERGENCY = 'emergency', // System is unusable
  ALERT = 'alert', // Action must be taken immediately
  CRITICAL = 'critical', // Critical conditions
  ERROR = 'error', // Error conditions
  WARNING = 'warning', // Warning conditions
  NOTICE = 'notice', // Normal but significant condition
  INFO = 'info', // Informational messages
  DEBUG = 'debug', // Debug-level messages
}

/**
 * Environment types for application deployment
 */
export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
  LOCAL = 'local',
}

// =============================================================================
// UTILITY TYPES - Generic type helpers
// =============================================================================

/**
 * Make specific properties of T optional
 * More flexible than Partial<T> when you only want some props optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties of T required
 * Opposite of Optional - useful for enforcing required fields
 */
export type RequiredFields<T, K extends keyof T> = T &
  globalThis.Required<Pick<T, K>>;

/**
 * Array that must contain at least one element
 * Prevents empty arrays when at least one item is required
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Readonly version of NonEmptyArray
 */
export type ReadonlyNonEmptyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Extract the type of array elements
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Deep readonly - makes all properties recursively readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Deep partial - makes all properties recursively optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Nullable type - can be null or undefined
 */
export type Nullable<T> = T | null | undefined;

/**
 * Primitive types only - excludes objects, arrays, functions
 */
export type Primitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint;

// =============================================================================
// BRANDED TYPES - Type-safe primitives with compile-time branding
// =============================================================================

/**
 * Generic branded type helper
 * Creates a type that is nominally different from its base type
 */
export type Branded<T, Brand extends string | symbol> = T & {
  readonly __brand: Brand;
};

/**
 * Email address - string validated as email format
 */
export type Email = Branded<string, 'Email'>;

/**
 * URL - string validated as URL format
 */
export type URL = Branded<string, 'URL'>;

/**
 * File path - string representing a file system path
 */
export type FilePath = Branded<string, 'FilePath'>;

/**
 * JSON string - string containing valid JSON
 */
export type JSONString = Branded<string, 'JSONString'>;

/**
 * Base64 encoded string
 */
export type Base64String = Branded<string, 'Base64String'>;

/**
 * Hexadecimal string (e.g., for colors, hashes)
 */
export type HexString = Branded<string, 'HexString'>;

// =============================================================================
// JSON TYPES - Re-export from type-fest for internal use
// =============================================================================

/**
 * JSON value type - re-exported from type-fest for convenience
 */
export type {
  JsonValue,
  JsonObject,
  JsonArray,
  JsonPrimitive,
} from 'type-fest';

/**
 * Generic record type for unknown object structures
 */
export type UnknownRecord = Record<string, unknown>;

/**
 * Constructor type for classes
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

// =============================================================================
// TYPE GUARDS - Runtime type checking functions
// =============================================================================

/**
 * Check if value is a valid UUID (v1, v3, v4, or v5)
 */
export function isUUID(value: unknown): value is UUID {
  return (
    typeof value === 'string' &&
    /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
      value,
    )
  );
}

/**
 * Check if value is a valid timestamp
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= Date.now() + 1000 * 60 * 60 * 24 * 365
  ); // Not more than 1 year in future
}

/**
 * Check if value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is ISODateString {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value) &&
    !isNaN(Date.parse(value))
  );
}

/**
 * Check if value is a valid email
 */
export function isEmail(value: unknown): value is Email {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Check if array is non-empty
 */
export function isNonEmptyArray<T>(array: T[]): array is NonEmptyArray<T> {
  return array.length > 0;
}

/**
 * Check if value is primitive
 */
export function isPrimitive(value: unknown): value is Primitive {
  const type = typeof value;
  return value === null || (type !== 'object' && type !== 'function');
}

// =============================================================================
// UTILITY FUNCTIONS - Helper functions for type manipulation
// =============================================================================

/**
 * Create a branded type from a base value
 * Runtime identity function, compile-time type branding
 */
export function brand<T, Brand extends string | symbol>(
  value: T,
): Branded<T, Brand> {
  return value as Branded<T, Brand>;
}

/**
 * Remove branding from a branded type
 * Runtime identity function, compile-time unbranding
 */
export function unbrand<T, Brand extends string | symbol>(
  value: Branded<T, Brand>,
): T {
  return value as T;
}

/**
 * Generate a UUID v4
 * Simple implementation for development - use crypto.randomUUID() in production
 */
export function generateUUID(): UUID {
  return brand<string, 'UUID'>(
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }),
  );
}

/**
 * Create current timestamp
 */
export function now(): Timestamp {
  return brand<number, 'Timestamp'>(Date.now());
}

/**
 * Create timestamp from date
 */
export function timestampFromDate(date: Date): Timestamp {
  return brand<number, 'Timestamp'>(date.getTime());
}

/**
 * Convert timestamp to Date object
 */
export function dateFromTimestamp(timestamp: Timestamp): Date {
  return new Date(unbrand(timestamp));
}

/**
 * Create ISO date string from timestamp
 */
export function isoStringFromTimestamp(timestamp: Timestamp): ISODateString {
  return brand<string, 'ISODateString'>(
    dateFromTimestamp(timestamp).toISOString(),
  );
}
