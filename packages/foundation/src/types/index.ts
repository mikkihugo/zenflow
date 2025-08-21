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

// Basic primitive types - universally reusable across all packages
export type ID = string | number;
export type UUID = string;
export type Timestamp = number;

// Status and priority enums
export type Status = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

// Basic entity patterns
export interface Timestamped {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Identifiable<T = UUID> {
  id: T;
}

export interface Entity extends Timestamped, Identifiable<UUID> {
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

export type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

// Async operation results
export type AsyncOperationResult<T, E = Error> = Promise<Result<T, E>>;

// Query patterns
export interface QueryCriteria {
  filters?: Record<string, unknown>;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  pagination?: PaginationOptions;
}

// Audit and versioning
export interface AuditEntry extends Timestamped {
  id: UUID;
  entityId: UUID;
  entityType: string;
  action: string;
  changes: Record<string, unknown>;
  userId?: UUID;
  metadata?: Record<string, unknown>;
}

// Additional utility types needed by brain package
export type NonEmptyArray<T> = [T, ...T[]];

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

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
 * type ModelName = LiteralUnion<'claude-3' | 'gpt-4', string>;
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
 *   metadata?: Record<string, any>;
 * }
 * 
 * // Make specific properties optional
 * type UserInput = SetOptional<User, 'id' | 'metadata'>;
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
  // String manipulation utilities
  LiteralUnion,
  CamelCase,
  PascalCase,
  SnakeCase,
  KebabCase,
  
  // Object manipulation utilities
  SetOptional,
  SetRequired,
  SetReadonly,
  Merge,
  Except,
  PartialDeep,
  RequiredDeep,
  
  // Array and object utilities
  EmptyObject,
  IsEmptyObject,
  
  // Function utilities
  Asyncify,
  Promisable,
  
  // Configuration file types
  PackageJson,
  TsConfigJson
} from 'type-fest';

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
 *   status: 'active' | 'inactive';
 *   config: Record<string, any>;
 *   metadata: object;
 * }
 * 
 * // Mark specific properties as optional
 * type AgentInput = MarkOptional<Agent, 'id' | 'metadata'>;
 * 
 * // Mark specific properties as required
 * type ValidAgent = MarkRequired<AgentInput, 'name' | 'status'>;
 * 
 * // Make specific properties readonly
 * type ImmutableAgent = MarkReadonly<Agent, 'id' | 'name'>;
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
 * function isDefined<T>(value: T | undefined): value is NonUndefined<T> {
 *   return value !== undefined;
 * }
 * ```
 */
export type {
  // Deep type transformations
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  
  // Selective property modifications
  MarkOptional,
  MarkRequired,
  MarkReadonly,
  
  // Type guards and primitives
  Primitive,
  NonUndefined,
  
  // Dictionary and collection types
  Dictionary,
  SafeDictionary
} from 'ts-essentials';

