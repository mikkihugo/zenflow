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
// =============================================================================
// UTILITY HELPER FUNCTIONS
// =============================================================================
/**
 * Create pagination metadata from raw pagination info
 */
export function createPaginationMetadata(currentPage, pageSize, totalItems) {
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
export function createPaginated(items, currentPage, pageSize, totalItems) {
    return {
        items,
        pagination: createPaginationMetadata(currentPage, pageSize, totalItems),
    };
}
/**
 * Create a successful operation result
 */
export function createSuccessResult(data, metadata) {
    return {
        success: true,
        data,
        metadata,
    };
}
/**
 * Create a failed operation result
 */
export function createErrorResult(error, metadata) {
    return {
        success: false,
        error,
        metadata,
    };
}
/**
 * Check if operation result is successful (type guard)
 */
export function isSuccessResult(result) {
    return result.success === true;
}
/**
 * Check if operation result is an error (type guard)
 */
export function isErrorResult(result) {
    return result.success === false;
}
