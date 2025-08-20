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

export type {
  // Basic identifiers
  ID,
  StringID,
  NumericID,
  UUID,
  Timestamp,
  ISODateString,
  
  // Common enums
  Priority,
  Status,
  LogLevel,
  Environment,
  
  // Utility types
  Optional,
  RequiredFields,
  NonEmptyArray,
  ReadonlyNonEmptyArray,
  ArrayElement,
  DeepReadonly,
  DeepPartial,
  Nullable,
  Primitive,
  
  // Branded types
  Branded,
  Email,
  URL,
  FilePath,
  JSONString,
  Base64String,
  HexString
} from './primitives';

// Export primitives enums as values (not just types)
export { 
  Priority as PriorityEnum, 
  Status as StatusEnum, 
  LogLevel as LogLevelEnum, 
  Environment as EnvironmentEnum 
} from './primitives';

// Export type guards and utility functions
export {
  isUUID,
  isTimestamp,
  isISODateString,
  isEmail,
  isNonEmptyArray,
  isPrimitive,
  brand,
  unbrand,
  generateUUID,
  now,
  timestampFromDate,
  dateFromTimestamp,
  isoStringFromTimestamp
} from './primitives';

// =============================================================================
// PATTERNS - Structural patterns and interfaces
// =============================================================================

export type {
  // Temporal patterns
  Timestamped,
  TimestampedWithDeletion,
  ISOTimestamped,
  DateTimestamped,
  
  // Versioning patterns
  Versioned,
  VersionedWithRevision,
  SemanticVersioned,
  
  // Identification patterns
  Identifiable,
  UUIDIdentifiable,
  Named,
  Described,
  
  // Pagination patterns
  Paginated,
  PaginationMetadata,
  CursorPaginated,
  CursorPaginationMetadata,
  
  // Result patterns
  OperationResult,
  AsyncOperationResult,
  ValidationResult,
  
  // Filtering and searching
  FilterCriteria,
  SearchCriteria,
  SortCriteria,
  QueryCriteria,
  
  // Configuration patterns
  EnvironmentConfig,
  FeatureFlag,
  ConfigSection,
  
  // Audit patterns
  AuditEntry,
  Auditable,
  
  // Entity pattern
  Entity
} from './patterns';

// Export pattern utility functions
export {
  createPaginationMetadata,
  createPaginated,
  createSuccessResult,
  createErrorResult,
  isSuccessResult,
  isErrorResult
} from './patterns';

// =============================================================================
// ERRORS - Error types and handling patterns
// =============================================================================

export type {
  // Base error interfaces
  BaseError,
  ValidationError,
  ConfigurationError,
  SystemError,
  NetworkError,
  ResourceError,
  PermissionError,
  BusinessLogicError,
  TimeoutError,
  RateLimitError,
  
  // Error metadata and classification
  ErrorMetadata,
  ValidationViolation,
  
  // Result pattern types
  Result,
  SuccessResult,
  ErrorResult,
  AsyncResult,
  
  // Error handler types
  ErrorHandler,
  ErrorRecovery,
  ErrorTransform,
  ErrorFilter,
  ErrorHandlingConfig
} from './errors';

// Export error enums as values  
export { 
  ErrorSeverity as ErrorSeverityEnum, 
  ErrorCategory as ErrorCategoryEnum 
} from './errors';

// Export error utility functions
export {
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
  isBaseError
} from './errors';

// =============================================================================
// TYPE GOVERNANCE DOCUMENTATION
// =============================================================================

/**
 * TYPE GOVERNANCE RULES
 * =====================
 * 
 * This section documents what types belong in @claude-zen/foundation vs
 * domain-specific packages. Follow these rules to maintain clean separation.
 */

/**
 * ✅ FOUNDATION TYPES (Belong Here)
 * =================================
 * 
 * CRITERIA: Universal, domain-agnostic, reusable across ALL packages
 * 
 * Categories that belong in foundation:
 * - Basic primitives: ID, UUID, Timestamp, basic enums
 * - Structural patterns: Timestamped, Versioned, Paginated, Identifiable
 * - Error handling: BaseError, ValidationError, Result patterns
 * - Utility types: Optional, Required, NonEmptyArray, DeepReadonly
 * - Standard patterns: Configuration, FeatureFlag, AuditEntry
 * 
 * Examples:
 * ```typescript
 * // ✅ Good - Universal identifier
 * export type UUID = string & { readonly __brand: 'UUID' };
 * 
 * // ✅ Good - Universal structural pattern  
 * export interface Timestamped {
 *   readonly createdAt: Timestamp;
 *   updatedAt: Timestamp;
 * }
 * 
 * // ✅ Good - Universal error pattern
 * export interface BaseError extends Error {
 *   readonly type: string;
 *   readonly code: string;
 * }
 * ```
 */

/**
 * ❌ NON-FOUNDATION TYPES (Belong in Domain Packages)
 * ==================================================
 * 
 * CRITERIA: Domain-specific, business logic, implementation details
 * 
 * Categories that DON'T belong in foundation:
 * - Memory system types: MemoryEntry, MemoryProvider → @claude-zen/memory/types
 * - Coordination types: Agent, Task, Swarm → @claude-zen/coordination-core/types
 * - Workflow types: WorkflowStep, Process → @claude-zen/workflows/types
 * - AI/ML types: Model, Training → @claude-zen/brain/types
 * - Database types: Query, Schema → @claude-zen/database/types
 * - Event types: EventPayload, Handler → @claude-zen/event-system/types
 * 
 * Examples:
 * ```typescript
 * // ❌ Wrong - Memory-specific, belongs in @claude-zen/memory/types
 * export interface MemoryEntry {
 *   content: string;
 *   embedding: number[];
 * }
 * 
 * // ❌ Wrong - Coordination-specific, belongs in @claude-zen/coordination-core/types
 * export interface Agent {
 *   type: 'researcher' | 'coder';
 *   status: 'active' | 'idle';
 * }
 * 
 * // ❌ Wrong - Workflow-specific, belongs in @claude-zen/workflows/types
 * export interface WorkflowStep {
 *   action: string;
 *   conditions: string[];
 * }
 * ```
 */

/**
 * 🎯 DECISION FRAMEWORK
 * ====================
 * 
 * When deciding if a type belongs in foundation, ask:
 * 
 * 1. **Universality**: Would ALL packages potentially use this type?
 *    - Yes → Foundation
 *    - No → Domain package
 * 
 * 2. **Domain Knowledge**: Does this type contain domain-specific concepts?
 *    - Yes → Domain package  
 *    - No → Foundation
 * 
 * 3. **Stability**: Is this type unlikely to change based on business logic?
 *    - Yes → Foundation
 *    - No → Domain package
 * 
 * 4. **Coupling**: Does this type depend on other domain-specific types?
 *    - Yes → Domain package
 *    - No → Foundation
 * 
 * Examples:
 * - `Timestamp` → Universal, no domain knowledge, stable → ✅ Foundation
 * - `MemoryEmbedding` → Not universal, AI domain-specific → ❌ Memory package
 * - `Paginated<T>` → Universal pattern, no domain knowledge → ✅ Foundation
 * - `SwarmConfiguration` → Coordination domain-specific → ❌ Coordination package
 */

/**
 * 📦 PACKAGE IMPORT STRATEGY
 * =========================
 * 
 * Recommended import patterns for consuming packages:
 * 
 * ```typescript
 * // Import foundation types (always safe)
 * import type { 
 *   UUID, 
 *   Timestamped, 
 *   Paginated, 
 *   Result,
 *   ValidationError 
 * } from '@claude-zen/foundation/types';
 * 
 * // Import domain types from appropriate packages
 * import type { MemoryEntry } from '@claude-zen/memory/types';
 * import type { Agent, Task } from '@claude-zen/coordination-core/types';
 * import type { WorkflowStep } from '@claude-zen/workflows/types';
 * 
 * // Combine foundation and domain types
 * interface UserTask extends Timestamped {
 *   id: UUID;
 *   agent: Agent;        // Domain-specific
 *   workflow: WorkflowStep[]; // Domain-specific
 * }
 * 
 * type UserTaskList = Paginated<UserTask>; // Foundation pattern
 * ```
 */