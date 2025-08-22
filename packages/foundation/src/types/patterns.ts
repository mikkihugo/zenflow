/**
 * @fileoverview Foundation Types - Standard Patterns
 *
 * Common structural patterns and interfaces used across the monorepo.
 * These represent standard ways of organizing data and behavior that are
 * domain-agnostic and universally applicable.
 *
 * SCOPE: Structural patterns that are NOT domain-specific
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @example
 * ```typescript
 * import type { Timestamped, Versioned, Paginated } from '@claude-zen/foundation/types';
 *
 * interface User extends Timestamped, Versioned {
 *   id: string;
 *   email: string;
 * }
 *
 * type UserList = Paginated<User>;
 * ```
 */

import type { ID, Timestamp, UUID, ISODateString } from './primitives';

// =============================================================================
// TEMPORAL PATTERNS - Time-related data structures
// =============================================================================

/**
 * Add timestamp fields to any type
 * Standard pattern for tracking when entities are created/modified
 */
export interface Timestamped {
  /** When this entity was created */
  readonly createdAt: Timestamp;
  /** When this entity was last updated */
  updatedAt: Timestamp;
}

/**
 * Extended temporal tracking with deletion support
 * Soft delete pattern with timestamp tracking
 */
export interface TimestampedWithDeletion extends Timestamped {
  /** When this entity was soft-deleted (null if not deleted) */
  deletedAt: Timestamp | null;
}

/**
 * ISO date string version of Timestamped
 * Use when you need human-readable date strings
 */
export interface ISOTimestamped {
  /** When this entity was created (ISO format) */
  readonly createdAt: ISODateString;
  /** When this entity was last updated (ISO format) */
  updatedAt: ISODateString;
}

/**
 * Date object version of Timestamped
 * Use when working directly with Date objects
 */
export interface DateTimestamped {
  /** When this entity was created */
  readonly createdAt: Date;
  /** When this entity was last updated */
  updatedAt: Date;
}

// =============================================================================
// VERSIONING PATTERNS - Version tracking and history
// =============================================================================

/**
 * Add version tracking to any type
 * Standard pattern for optimistic concurrency control and change tracking
 */
export interface Versioned {
  /** Current version number (increments on each update) */
  readonly version: number;
}

/**
 * Extended versioning with revision tracking
 * For systems that need detailed change history
 */
export interface VersionedWithRevision extends Versioned {
  /** Unique revision identifier */
  readonly revisionId: UUID;
  /** Previous version number (null for initial version) */
  readonly previousVersion: number | null;
}

/**
 * Semantic versioning pattern
 * Standard semantic version format (major.minor.patch)
 */
export interface SemanticVersioned {
  /** Semantic version string (e.g., "1.2.3") */
  readonly semanticVersion: string;
  /** Major version number */
  readonly majorVersion: number;
  /** Minor version number */
  readonly minorVersion: number;
  /** Patch version number */
  readonly patchVersion: number;
}

// =============================================================================
// IDENTIFICATION PATTERNS - Entity identification
// =============================================================================

/**
 * Add unique identifier to any type
 * Most basic pattern for entity identification
 */
export interface Identifiable<TID = ID> {
  /** Unique identifier for this entity */
  readonly id: TID;
}

/**
 * UUID-based identification
 * When you specifically need UUID identifiers
 */
export interface UUIDIdentifiable extends Identifiable<UUID> {
  readonly id: UUID;
}

/**
 * Named entity pattern
 * For entities that have human-readable names
 */
export interface Named {
  /** Human-readable name */
  name: string;
  /** Optional display name (defaults to name if not provided) */
  displayName?: string;
}

/**
 * Described entity pattern
 * For entities that have descriptions
 */
export interface Described {
  /** Brief description */
  description?: string;
  /** Detailed description or documentation */
  longDescription?: string;
}

/**
 * Complete entity pattern combining common identification patterns
 */
export interface Entity
  extends Identifiable<UUID>,
    Named,
    Described,
    Timestamped,
    Versioned {
  /** Whether this entity is currently active/enabled */
  isActive: boolean;
}

// =============================================================================
// PAGINATION PATTERNS - Data pagination and navigation
// =============================================================================

/**
 * Paginated data container
 * Standard pattern for paginated API responses
 */
export interface Paginated<T> {
  /** Array of items for current page */
  items: T[];
  /** Pagination metadata */
  pagination: PaginationMetadata;
}

/**
 * Pagination metadata
 * Information about current page and total data
 */
export interface PaginationMetadata {
  /** Current page number (1-based) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Cursor-based pagination (for large datasets)
 * Alternative to offset-based pagination
 */
export interface CursorPaginated<T> {
  /** Array of items for current page */
  items: T[];
  /** Pagination metadata */
  pagination: CursorPaginationMetadata;
}

/**
 * Cursor pagination metadata
 */
export interface CursorPaginationMetadata {
  /** Cursor for next page (null if no next page) */
  nextCursor: string | null;
  /** Cursor for previous page (null if no previous page) */
  previousCursor: string | null;
  /** Whether there are more items after this page */
  hasNextPage: boolean;
  /** Whether there are more items before this page */
  hasPreviousPage: boolean;
  /** Approximate total count (may not be exact for performance) */
  estimatedTotal?: number;
}

// =============================================================================
// RESULT PATTERNS - Operation results and outcomes
// =============================================================================

/**
 * Operation result with success/failure status
 * Alternative to throwing exceptions for expected failures
 */
export interface OperationResult<T = void, E = Error> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data (only present if success is true) */
  data?: T;
  /** Error information (only present if success is false) */
  error?: E;
  /** Optional metadata about the operation */
  metadata?: Record<string, unknown>;
}

/**
 * Async operation result with additional timing information
 */
export interface AsyncOperationResult<T = void, E = Error>
  extends OperationResult<T, E> {
  /** When the operation started */
  startTime: Timestamp;
  /** When the operation completed */
  endTime: Timestamp;
  /** Duration in milliseconds */
  duration: number;
}

/**
 * Validation result pattern
 * For operations that validate data
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation error messages (empty if valid) */
  errors: string[];
  /** Validation warnings (non-blocking issues) */
  warnings: string[];
  /** Field-specific validation errors */
  fieldErrors?: Record<string, string[]>;
}

// =============================================================================
// FILTERING AND SEARCHING PATTERNS
// =============================================================================

/**
 * Generic filter criteria
 * Base interface for filtering operations
 */
export interface FilterCriteria {
  /** Fields to include in results (if not specified, include all) */
  include?: string[];
  /** Fields to exclude from results */
  exclude?: string[];
  /** Additional filter parameters */
  filters?: Record<string, unknown>;
}

/**
 * Search criteria with text search and filtering
 */
export interface SearchCriteria extends FilterCriteria {
  /** Search query string */
  query?: string;
  /** Fields to search in (if not specified, search all text fields) */
  searchFields?: string[];
  /** Whether search should be case-sensitive */
  caseSensitive?: boolean;
  /** Whether to use exact match or fuzzy search */
  exactMatch?: boolean;
}

/**
 * Sort criteria for ordering results
 */
export interface SortCriteria {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Combined query criteria with search, filter, sort, and pagination
 */
export interface QueryCriteria extends SearchCriteria {
  /** Sort criteria */
  sort?: SortCriteria[];
  /** Pagination settings */
  pagination?: {
    page: number;
    pageSize: number;
  };
}

// =============================================================================
// CONFIGURATION PATTERNS - Settings and options
// =============================================================================

/**
 * Configuration with environment override support
 */
export interface EnvironmentConfig<T> {
  /** Default configuration values */
  default: T;
  /** Environment-specific overrides */
  overrides?: Partial<Record<string, Partial<T>>>;
}

/**
 * Feature flag pattern
 */
export interface FeatureFlag {
  /** Feature flag key */
  key: string;
  /** Whether the feature is enabled */
  enabled: boolean;
  /** Optional description of what this flag controls */
  description?: string;
  /** When this flag was last modified */
  lastModified?: Timestamp;
}

/**
 * Configuration section with validation
 */
export interface ConfigSection<T> {
  /** Configuration values */
  values: T;
  /** Schema for validation (JSON Schema or similar) */
  schema?: Record<string, unknown>;
  /** Whether this configuration has been validated */
  validated: boolean;
  /** Validation errors (empty if validated successfully) */
  validationErrors: string[];
}

// =============================================================================
// AUDIT PATTERNS - Change tracking and history
// =============================================================================

/**
 * Audit trail entry
 * Track changes to entities over time
 */
export interface AuditEntry {
  /** Unique identifier for this audit entry */
  id: UUID;
  /** ID of the entity that was changed */
  entityId: ID;
  /** Type of entity that was changed */
  entityType: string;
  /** Type of operation performed */
  operation: 'create' | 'update' | 'delete' | 'read';
  /** Who performed the operation */
  performedBy: UUID | 'system';
  /** When the operation was performed */
  performedAt: Timestamp;
  /** What changed (field-level changes) */
  changes?: Record<string, { from: unknown; to: unknown }>;
  /** Additional context about the operation */
  context?: Record<string, unknown>;
}

/**
 * Add audit trail support to any type
 */
export interface Auditable {
  /** Audit trail entries for this entity */
  auditTrail: AuditEntry[];
}

// =============================================================================
// COORDINATION PATTERNS - System coordination and health
// =============================================================================

/**
 * Coordination request for system operations
 */
export interface CoordinationRequest {
  /** Unique identifier for this request */
  id: UUID;
  /** Type of coordination operation */
  operation: string;
  /** Request parameters */
  params?: Record<string, unknown>;
  /** Request priority */
  priority?: 'low' | 'normal' | 'high' | 'critical';
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Request metadata */
  metadata?: Record<string, unknown>;
  /** When the request was created */
  createdAt: Timestamp;
}

/**
 * Coordination response for system operations
 */
export interface CoordinationResponse<T = unknown> {
  /** ID of the original request */
  requestId: UUID;
  /** Whether the operation succeeded */
  success: boolean;
  /** Response data (present if success is true) */
  data?: T;
  /** Error information (present if success is false) */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  /** Response metadata */
  metadata?: Record<string, unknown>;
  /** When the response was created */
  completedAt: Timestamp;
  /** How long the operation took */
  duration: number;
}

/**
 * Basic lifecycle interface for system components
 */
export interface Lifecycle {
  /** Initialize the component */
  initialize(): Promise<void>;
  /** Start the component */
  start(): Promise<void>;
  /** Stop the component */
  stop(): Promise<void>;
  /** Check if the component is running */
  isRunning(): boolean;
}

/**
 * System health status information
 */
export interface SystemHealth {
  /** Overall system status */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  /** Overall health score (0-100) */
  score: number;
  /** Individual component health checks */
  components: Record<string, ComponentHealth>;
  /** System-wide metrics */
  metrics: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      percentage: number;
      loadAverage: number[];
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  /** When health check was performed */
  timestamp: Timestamp;
  /** Health check duration */
  checkDuration: number;
}

/**
 * Individual component health information
 */
export interface ComponentHealth {
  /** Component status */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  /** Component health score (0-100) */
  score: number;
  /** Component-specific metrics */
  metrics?: Record<string, unknown>;
  /** Last successful check */
  lastSuccess?: Timestamp;
  /** Last failure */
  lastFailure?: Timestamp;
  /** Error details if unhealthy */
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  /** Response time in milliseconds */
  responseTime?: number;
}

// =============================================================================
// UTILITY HELPER FUNCTIONS
// =============================================================================

/**
 * Create pagination metadata from raw pagination info
 */
export function createPaginationMetadata(
  currentPage: number,
  pageSize: number,
  totalItems: number,
): PaginationMetadata {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Create a paginated result
 */
export function createPaginated<T>(
  items: T[],
  currentPage: number,
  pageSize: number,
  totalItems: number,
): Paginated<T> {
  return {
    items,
    pagination: createPaginationMetadata(currentPage, pageSize, totalItems),
  };
}

/**
 * Create a successful operation result
 */
export function createSuccessResult<T>(
  data: T,
  metadata?: Record<string, unknown>,
): OperationResult<T> {
  return {
    success: true,
    data,
    metadata,
  };
}

/**
 * Create a failed operation result
 */
export function createErrorResult<E = Error>(
  error: E,
  metadata?: Record<string, unknown>,
): OperationResult<never, E> {
  return {
    success: false,
    error,
    metadata,
  };
}

/**
 * Check if operation result is successful (type guard)
 */
export function isSuccessResult<T, E>(
  result: OperationResult<T, E>,
): result is OperationResult<T, E> & { success: true; data: T } {
  return result.success === true;
}

/**
 * Check if operation result is an error (type guard)
 */
export function isErrorResult<T, E>(
  result: OperationResult<T, E>,
): result is OperationResult<T, E> & { success: false; error: E } {
  return result.success === false;
}
