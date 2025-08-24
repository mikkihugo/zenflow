/**
 * @fileoverview Foundation Types - Main Export Index
 *
 * Central export point for all foundation types in the claude-code-zen monorepo.
 * This package provides shared primitive types, patterns, and error handling
 * that serve as the foundation for all other packages.
 *
 * TYPE GOVERNANCE:
 * ===============
 *
 * BELONGS IN FOUNDATION:
 * - Universal primitives (ID, UUID, Timestamp, basic enums)
 * - Generic structural patterns (Timestamped, Versioned, Paginated)
 * - Standard error types (BaseError, ValidationError, SystemError)
 * - Result patterns for error handling
 * - Universal utility types (Optional, Required, NonEmptyArray)
 *
 * DOES NOT BELONG IN FOUNDATION:
 * - Domain-specific types (Memory, Coordination, Workflow types)
 * - Business logic interfaces
 * - Implementation-specific types
 * - Package-specific configuration types
 *
 * USAGE GUIDELINES:
 * ================
 *
 * 1. Import specific types you need:
 *    import type { ID, UUID, Timestamped } from '@claude-zen/foundation/types';
 *
 * 2. Use primitives for basic data:
 *    interface User extends Timestamped, Identifiable<UUID> { ... }
 *
 * 3. Use patterns for consistent structure:
 *    type UserList = Paginated<User>;
 *
 * 4. Use Result pattern instead of throwing exceptions:
 *    function processUser(data: unknown): Result<User, ValidationError> { ... }
 *
 * 5. Create domain-specific types in appropriate packages:
 *    Memory types → @claude-zen/memory/types
 *    Coordination types → @claude-zen/coordination-core/types
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 *
 * @example Basic Usage
 * ```typescript
 * import type {
 *   ID,
 *   UUID,
 *   Timestamped,
 *   Paginated,
 *   Result,
 *   ValidationError
 * } from '@claude-zen/foundation/types';
 *
 * interface User extends Timestamped {
 *   id: UUID;
 *   email: string;
 *   name: string;
 * }
 *
 * type UserList = Paginated<User>;
 *
 * function validateUser(data: unknown): Result<User, ValidationError> {
 *   // Implementation
 * }
 * ```
 *
 * @example Advanced Patterns
 * ```typescript
 * import type {
 *   Entity,
 *   AsyncOperationResult,
 *   QueryCriteria,
 *   AuditEntry
 * } from '@claude-zen/foundation/types';
 *
 * interface Product extends Entity {
 *   sku: string;
 *   price: number;
 *   category: string;
 * }
 *
 * interface ProductService {
 *   findProducts(criteria: QueryCriteria): AsyncOperationResult<Product[]>;
 *   createProduct(data: Partial<Product>): AsyncOperationResult<Product>;
 *   auditProduct(id: UUID): AsyncOperationResult<AuditEntry[]>;
 * }
 * ```
 */

// =============================================================================
// PRIMITIVES - Basic types and identifiers
// =============================================================================

// Re-export ALL primitives (includes JsonValue, JsonObject, UnknownRecord, Constructor)
export * from './primitives';

// Additional basic entity patterns
export interface Timestamped {
  createdAt: number;
  updatedAt: number;
}

export interface Identifiable<T = string> {
  id: T;
}

export interface Entity extends Timestamped, Identifiable<string> {
  name: string;
  version: number;
  isActive: boolean;
}

// Generic utility patterns
export interface Paginated<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

// Result pattern for error handling
export interface SuccessResult<T> {
  success: true;
  data: T;
}

export interface ErrorResult<E> {
  success: false;
  error: E;
}

export type Result<T, E = Error> = SuccessResult<T>|ErrorResult<E>;

// Async operation results
export type AsyncOperationResult<T, E = Error> = Promise<Result<T, E>>;

// Query patterns
export interface QueryCriteria {
  filters?: Record<string, unknown>;
  sort?: { field: string; direction:'asc|desc' }[];
  pagination?: PaginationOptions;
}

// Audit and versioning
export interface AuditEntry extends Timestamped {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  changes: Record<string, unknown>;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// Additional utility types needed by brain package
export type NonEmptyArray<T> = [T, ...T[]];

export type LogLevel = 'debug|info|warn|error|fatal';

// =============================================================================
// TYPE UTILITIES - Advanced type manipulation utilities
// =============================================================================

/**
 * Advanced TypeScript utility types from type-fest library.
 * These utilities provide sophisticated type manipulation capabilities
 * that enhance the foundation type system for complex transformations.
 *
 * @example String Manipulation
 * ```typescript
 * // Create union types with autocomplete support
 * type ModelName = LiteralUnion<'claude-3|gpt-4', string>;
 * const model: ModelName = 'claude-3'; // ✅ Autocomplete
 * const customModel: ModelName = 'custom-model'; // ✅ Also valid
 *
 * // Case conversions
 * type ApiKey = CamelCase<'api_key'>; // 'apiKey'
 * type UrlPath = KebabCase<'getUserProfile'>; // 'get-user-profile'
 * ```
 *
 * @example Object Manipulation
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   metadata?: Record<string, unknown>;
 * }
 *
 * // Make specific properties optional
 * type UserInput = SetOptional<User, 'id|metadata'>;
 *
 * // Merge interfaces intelligently
 * type ExtendedUser = Merge<User, { lastLogin: Date; permissions: string[] }>;
 *
 * // Deep partial for nested objects
 * type UserUpdate = PartialDeep<User>;
 * ```
 *
 * @example Configuration Types
 * ```typescript
 * // Type-safe package.json handling
 * import type { PackageJson } from '@claude-zen/foundation';
 *
 * function validatePackage(pkg: PackageJson): boolean {
 *   return typeof pkg.name === 'string' && typeof pkg.version === 'string';
 * }
 *
 * // Type-safe tsconfig.json
 * import type { TsConfigJson } from '@claude-zen/foundation';
 *
 * const config: TsConfigJson = {
 *   compilerOptions: {
 *     target: 'ES2022',
 *     module: 'ESNext'
 *   }
 * };
 * ```
 */
export type {
  // String manipulation utilities - comprehensive text transformations
  LiteralUnion,
  CamelCase,
  PascalCase,
  SnakeCase,
  KebabCase,
  DelimiterCase,
  Trim,
  // TrimLeft, TrimRight - Use Trim instead
  // Capitalize, Uncapitalize - Use native string methods instead

  // Object manipulation utilities - powerful merging and picking
  SetOptional,
  SetRequired,
  SetReadonly,
  Writable, // SetWritable renamed to Writable
  SetNonNullable,
  Merge,
  MergeDeep,
  MergeExclusive,
  Except,
  // Omit, Pick - Use native TypeScript instead
  OmitDeep,
  PickDeep,
  PartialDeep,
  RequiredDeep,
  ReadonlyDeep,

  // Advanced type operations - path and value extraction
  Get,
  // Has - Use custom implementation
  Paths,
  Split,
  Join,
  Replace,
  Includes,

  // Array utilities
  // ArrayElement, FirstArrayElement - Use LastArrayElement or custom
  LastArrayElement,
  ReadonlyTuple,
  // WritableTuple - Not available in this version

  // Union and intersection utilities
  UnionToIntersection,
  UnionToTuple,
  // IntersectionFromUnion - Not available in this version

  // Conditional types
  ConditionalExcept,
  ConditionalKeys,
  ConditionalPick,

  // Array and object utilities
  EmptyObject,
  IsEmptyObject,
  Entries,
  Simplify,
  Opaque,

  // Type checking utilities
  IsEqual,
  IsNever,
  IsUnknown,
  IsAny,

  // Function utilities
  Asyncify,
  Promisable,
  AsyncReturnType,
  // ArgumentsType - Use Parameters<T> instead
  // Constructor - Already exported from primitives
  AbstractConstructor,

  // JSON utilities - Already exported from primitives
  // JsonValue, JsonObject, JsonArray, JsonPrimitive,

  // Configuration file types
  PackageJson,
  TsConfigJson,
} from 'type-fest';

// TypeScript compatibility - ensure types are properly exported

// Note: UnknownRecord and Constructor are already exported from primitives above
// JSON types are also exported from primitives via type-fest re-export

/**
 * Additional TypeScript utility types.
 * These utilities extend type-fest with common patterns used in claude-code-zen.
 * All utilities now sourced from type-fest for consistency.
 *
 * @example Deep Type Operations (type-fest equivalents)
 * ```typescript
 * interface Config {
 *   database: { host: string; port: number; };
 *   api: { baseUrl: string; timeout: number; };
 * }
 *
 * // type-fest provides these
 * type ConfigUpdate = PartialDeep<Config>; // Instead of DeepPartial
 * type ValidatedConfig = RequiredDeep<Config>; // Instead of DeepRequired
 * type ImmutableConfig = ReadonlyDeep<Config>; // Instead of DeepReadonly
 * ```
 */

// All these types are now available from type-fest above, so we provide aliases
export type DeepPartial<T> = import('type-fest').PartialDeep<T>;
export type DeepRequired<T> = import('type-fest').RequiredDeep<T>;
export type DeepReadonly<T> = import('type-fest').ReadonlyDeep<T>;

// Selective property modifications - using type-fest equivalents
export type MarkOptional<T, K extends keyof T> = import('type-fest').SetOptional<T, K>;
export type MarkRequired<T, K extends keyof T> = import('type-fest').SetRequired<T, K>;
export type MarkReadonly<T, K extends keyof T> = import('type-fest').SetReadonly<T, K>;

// Additional utility types for backwards compatibility
export type StrictOmit<T, K extends keyof T> = import('type-fest').Except<T, K>;
export type NonNever<T> = T extends never ? never : T;

// Type checking utilities
export type Primitive = string | number | boolean | symbol | null | undefined;
export type AsyncOrSync<T> = T | Promise<T>;
export type AsyncOrSyncType<T> = T extends Promise<infer U> ? U : T;

// Object utilities
export type ValueOf<T> = T[keyof T];
export type Dictionary<T = unknown> = Record<string, T>;
export type SafeDictionary<T> = Record<string, T>;

// Utility types for common patterns (backwards compatibility)
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : [];
export type ReadonlyKeys<T> = {
  [K in keyof T]: T[K] extends Readonly<T[K]> ? K : never;
}[keyof T];
export type WritableKeys<T> = {
  [K in keyof T]: T[K] extends Readonly<T[K]> ? never : K;
}[keyof T];
export type RequiredKeys<T> = {
  [K in keyof T]: T extends Record<K, T[K]> ? K : never;
}[keyof T];
export type OptionalKeys<T> = {
  [K in keyof T]: T extends Record<K, T[K]> ? never : K;
}[keyof T];

// Function utilities
export type AnyFunction = (...args: unknown[]) => unknown;

// =============================================================================
// TYPE GUARDS AND UTILITIES - Runtime type checking and validation
// =============================================================================

// =============================================================================
// COMPREHENSIVE TYPE EXPORTS - All foundation types and utilities
// =============================================================================

// Re-export all patterns, errors, and type guards
export * from './patterns';
export * from './errors';
export * from './type-guards';

// =============================================================================
// CONCRETE EXPORTS - Re-export all concrete functions and enums
// =============================================================================

// Re-export enums and concrete functions from submodules
export {
  // Enums from primitives
  Priority as PriorityEnum,
  Status as StatusEnum,
  LogLevel as LogLevelEnum,
  Environment as EnvironmentEnum,

  // Utility functions from primitives
  isUUID,
  isTimestamp,
  isISODateString,
  isEmail,
  isPrimitive,
  isNonEmptyArray,
  generateUUID,
  now,
  timestampFromDate,
  dateFromTimestamp,
  isoStringFromTimestamp,
} from './primitives';

export {
  // Error utility functions from errors
  createValidationError,
  createSystemError,
  createNetworkError,
  createResourceError,
  createSuccess,
  createError,
  isSuccess,
  isError,
  isValidationError,
  isSystemError,
  isNetworkError,
  isResourceError,
  isRetryableError,
  isBaseError,
} from './errors';

export {
  // Pattern utility functions from patterns
  createPaginationMetadata,
  createPaginated,
  createSuccessResult,
  createErrorResult,
  isSuccessResult,
  isErrorResult,
} from './patterns';

// =============================================================================
// AGENT TYPES MOVED TO INTELLIGENCE PACKAGE
// =============================================================================

// Agent types moved to @claude-zen/intelligence
// Use: import { AgentInstance, AgentRegistrationConfig } from '@claude-zen/intelligence';
