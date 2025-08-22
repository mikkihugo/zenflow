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
  sort?: { field: string; direction:'asc|desc'' }[];
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
 * type ModelName = LiteralUnion<'claude-3|gpt-4'', string>;
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
 * type UserInput = SetOptional<User, 'id|metadata''>;
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
 * Practical TypeScript utility types from ts-essentials library.
 * These utilities focus on common patterns and practical type operations
 * for everyday development scenarios in the claude-code-zen ecosystem.
 *
 * @example Deep Type Operations
 * ```typescript
 * interface Config {
 *   database: {
 *     host: string;
 *     port: number;
 *     credentials: {
 *       username: string;
 *       password: string;
 *     };
 *   };
 *   api: {
 *     baseUrl: string;
 *     timeout: number;
 *   };
 * }
 *
 * // Make all properties optional recursively
 * type ConfigUpdate = DeepPartial<Config>;
 *
 * // Make all properties required recursively
 * type ValidatedConfig = DeepRequired<Config>;
 *
 * // Make all properties readonly recursively
 * type ImmutableConfig = DeepReadonly<Config>;
 * ```
 *
 * @example Selective Property Modification
 * ```typescript
 * interface Agent {
 *   id: string;
 *   name: string;
 *   status: 'active|inactive'';
 *   config: Record<string, unknown>;
 *   metadata: object;
 * }
 *
 * // Mark specific properties as optional
 * type AgentInput = MarkOptional<Agent, 'id|metadata''>;
 *
 * // Mark specific properties as required
 * type ValidAgent = MarkRequired<AgentInput, 'name|status''>;
 *
 * // Make specific properties readonly
 * type ImmutableAgent = MarkReadonly<Agent, 'id|name''>;
 * ```
 *
 * @example Dictionary and Type Guards
 * ```typescript
 * // Safe dictionary access
 * type UserCache = SafeDictionary<User>;
 * const cache: UserCache = {}; // All values must be User type
 *
 * // Type-safe primitive checking
 * function isPrimitive(value: unknown): value is Primitive {
 *   return value !== null && (typeof value !== 'object' && typeof value !== 'function');
 * }
 *
 * // Non-undefined type checking
 * function isDefined<T>(value: T|undefined): value is T {
 *   return value !== undefined;
 * }
 * ```
 */
export type {
  // Deep type transformations - recursive operations
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  // Writable - Already imported from type-fest above

  // Selective property modifications
  MarkOptional,
  MarkRequired,
  MarkReadonly,

  // Advanced type operations - strict and precise
  StrictOmit,
  // StrictPick - Use native Pick instead
  NonNever,

  // Type assertions and checks
  Primitive,
  // NonPrimitive - Use opposite of Primitive
  AsyncOrSync,
  AsyncOrSyncType,

  // Object utilities - value and key extraction
  ValueOf,
  // KeysOfType, PickByType, OmitByType - Not available in this version

  // Dictionary and collection types
  Dictionary,
  SafeDictionary,

  // Advanced union operations - branding and tagging
  UnionToIntersection as TSEUnionToIntersection, // Avoid conflict with type-fest
  // Brand, Tagged - Not available in this version

  // Utility types for common patterns
  Head,
  Tail,
  ReadonlyKeys,
  WritableKeys,
  RequiredKeys,
  OptionalKeys,

  // Function type utilities
  AnyFunction,
  // AnyAsyncFunction - Use AnyFunction instead
} from'ts-essentials';

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
// AGENT TYPES - Agent management and coordination
// =============================================================================

/**
 * Agent types for agent management, lifecycle, and coordination.
 * Provides comprehensive types for agent instances, configuration,
 * health monitoring, and performance tracking.
 *
 * @example Agent Management
 * ```typescript
 * import { AgentInstance, AgentRegistrationConfig } from '@claude-zen/foundation';
 *
 * const config: AgentRegistrationConfig = {
 *   templateId: 'worker-template',
 *   name: 'Data Processor',
 *   type: 'worker',
 *   config: { maxTasks: 10 }
 * };
 * ```
 */
export * from './agent';
