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

